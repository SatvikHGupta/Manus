import { MAX_PAGES } from '../../constants/limits.js';
import { DEFAULT_PAGE, DEFAULT_SETTINGS } from '../defaults.js';
import { idbPutPage, idbDeletePage, idbGetAllPages, idbGetPagesByNotebookId } from '../../utils/idb/pages.js';
import { idbPutNotebook } from '../../utils/idb/notebooks.js';
import { buildFindRegex } from '../../utils/text/findReplace.js';

const persistDebounceTimers = new Map(); // pageId -> timeout id

export function createPagesSlice(set, get) {
  return {
    pages:            [DEFAULT_PAGE()],
    currentPageIndex: 0,
    saveStatus:       'idle',

    setCurrentPageIndex: (i) => set({ currentPageIndex: i }),

    persistCurrentPage: async () => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      set({ saveStatus: 'saving' });
      try {
        await idbPutPage(page);
        set({ saveStatus: 'saved' });
      } catch {
        set({ saveStatus: 'error' });
      }
    },

    // Coalesces bursts of rapid changes (e.g. dragging a slider fires many
    // settings updates in a second or two) into a single IndexedDB write,
    // instead of writing to disk on every single tick. Captures the page id
    // up front so that if the user switches pages before the timer fires,
    // the originally-edited page still gets persisted (not whatever page
    // happens to be current by then).
    //
    // Keyed per-page (not a single shared timer) - previously, editing a
    // setting on Page A then quickly switching to Page B and editing a
    // setting there within the same 400ms window would clearTimeout() the
    // still-pending write for Page A and silently drop it. Each page now
    // gets its own independent debounce timer.
    persistCurrentPageDebounced: (delay = 400) => {
      const { pages, currentPageIndex } = get();
      const targetId = pages[currentPageIndex]?.id;
      if (!targetId) return;
      clearTimeout(persistDebounceTimers.get(targetId));
      set({ saveStatus: 'saving' });
      const timer = setTimeout(async () => {
        persistDebounceTimers.delete(targetId);
        const page = get().pages.find(p => p.id === targetId);
        if (!page) return;
        try {
          await idbPutPage(page);
          set({ saveStatus: 'saved' });
        } catch {
          set({ saveStatus: 'error' });
        }
      }, delay);
      persistDebounceTimers.set(targetId, timer);
    },

    updatePageText: async (text) => {
      const { pages, currentPageIndex } = get();
      const prevPage = pages[currentPageIndex];
      if (prevPage) {
        get().recordHistory?.(prevPage.id, () => ({ text: prevPage.text, settings: prevPage.settings }));
      }
      const page = { ...pages[currentPageIndex], text, updatedAt: Date.now() };
      const newPages = pages.map((p, i) => i === currentPageIndex ? page : p);
      set({ pages: newPages, saveStatus: 'saving' });
      try {
        await idbPutPage(page);
        set({ saveStatus: 'saved' });
      } catch {
        set({ saveStatus: 'error' });
      }
    },

    updatePageLabel: async (label) => {
      const { pages, currentPageIndex } = get();
      const page = { ...pages[currentPageIndex], label, updatedAt: Date.now() };
      const newPages = pages.map((p, i) => i === currentPageIndex ? page : p);
      set({ pages: newPages });
      try { await idbPutPage(page); } catch { /* ignore */ }
    },

    // Whole-document find & replace. Operates on the raw text of every page
    // (tags included, since a tag-aware rewrite isn't needed - see
    // utils/text/findReplace.js). Returns the number of pages that had at
    // least one match, so the caller can show a meaningful confirmation.
    replaceAllAcrossPages: async (query, replacement, caseSensitive) => {
      const { pages } = get();
      if (!query) return 0;
      const re = buildFindRegex(query, caseSensitive);
      let changedCount = 0;

      const newPages = pages.map(p => {
        re.lastIndex = 0;
        if (!re.test(p.text ?? '')) return p;
        changedCount++;
        get().recordHistory?.(p.id, () => ({ text: p.text, settings: p.settings }));
        re.lastIndex = 0;
        return { ...p, text: p.text.replace(re, replacement), updatedAt: Date.now() };
      });

      if (changedCount === 0) return 0;

      set({ pages: newPages, saveStatus: 'saving' });
      try {
        for (const p of newPages) await idbPutPage(p);
        set({ saveStatus: 'saved' });
      } catch {
        set({ saveStatus: 'error' });
      }
      return changedCount;
    },

    // mode: 'duplicate' (inherit current page's settings) | 'fresh' (DEFAULT_SETTINGS)
    // Returns { error } so callers (AddPageModal, keyboard shortcut, etc.) can
    // surface feedback instead of silently doing nothing at the page limit.
    addPage: async (mode = 'duplicate') => {
      const { pages, currentPageIndex } = get();
      if (pages.length >= MAX_PAGES) {
        return { error: `You've reached the ${MAX_PAGES}-page limit.` };
      }
      const sourceSettings = mode === 'fresh'
        ? DEFAULT_SETTINGS
        : (pages[currentPageIndex]?.settings ?? DEFAULT_SETTINGS);
      const page = { ...DEFAULT_PAGE(sourceSettings), notebookId: get().currentNotebookId };
      set({ pages: [...pages, page], currentPageIndex: pages.length, lastUsedSettings: { ...sourceSettings } });
      try { await idbPutPage(page); } catch { /* ignore */ }
      return { error: null };
    },

    // Used by auto text-flow (and multi-page import): inserts a new page
    // immediately after the current one - not appended at the end - so
    // document order stays correct when overflow happens on a page that
    // isn't already the last one, then switches to it.
    insertPageAfterCurrent: async (text = '', mode = 'duplicate') => {
      const { pages, currentPageIndex } = get();
      if (pages.length >= MAX_PAGES) {
        return { error: `You've reached the ${MAX_PAGES}-page limit.`, pageIndex: null };
      }
      const sourceSettings = mode === 'fresh'
        ? DEFAULT_SETTINGS
        : (pages[currentPageIndex]?.settings ?? DEFAULT_SETTINGS);
      const page = { ...DEFAULT_PAGE(sourceSettings), text, notebookId: get().currentNotebookId };
      const insertAt = currentPageIndex + 1;
      const newPages = [...pages.slice(0, insertAt), page, ...pages.slice(insertAt)];
      set({ pages: newPages, currentPageIndex: insertAt, lastUsedSettings: { ...sourceSettings } });
      try { await idbPutPage(page); } catch { /* ignore */ }
      return { error: null, pageIndex: insertAt };
    },

    // Used by .txt/.docx import (and reusable for any future "paste a lot
    // of text" flow): takes pre-split page-sized chunks and lays them out
    // starting from the current page. If the current page is empty, the
    // first chunk reuses it instead of creating an extra page. Stops
    // early (and reports it) if MAX_PAGES is hit.
    cascadeTextIntoPages: async (chunks) => {
      if (!chunks || chunks.length === 0) return { insertedCount: 0, truncated: false };
      const { pages, currentPageIndex } = get();
      const currentPage = pages[currentPageIndex];
      const reuseCurrent = !currentPage?.text || currentPage.text.trim() === '';
      const remaining = [...chunks];
      let insertedCount = 0;
      let truncated = false;

      if (reuseCurrent) {
        const first = remaining.shift();
        get().recordHistory?.(currentPage.id, () => ({ text: currentPage.text, settings: currentPage.settings }));
        await get().updatePageText(first ?? '');
        insertedCount++;
      }

      for (const chunk of remaining) {
        if (get().pages.length >= MAX_PAGES) { truncated = true; break; }
        const { error } = await get().insertPageAfterCurrent(chunk);
        if (error) { truncated = true; break; }
        insertedCount++;
      }

      return { insertedCount, truncated };
    },

    duplicatePage: async () => {
      const { pages, currentPageIndex } = get();
      if (pages.length >= MAX_PAGES) {
        return { error: `You've reached the ${MAX_PAGES}-page limit.` };
      }
      const src  = pages[currentPageIndex];
      const page = {
        ...DEFAULT_PAGE(src.settings),
        text:  src.text,
        label: src.label ? src.label + ' (copy)' : '',
        notebookId: get().currentNotebookId,
      };
      const newPages = [...pages.slice(0, currentPageIndex + 1), page, ...pages.slice(currentPageIndex + 1)];
      set({ pages: newPages, currentPageIndex: currentPageIndex + 1 });
      try { await idbPutPage(page); } catch { /* ignore */ }
      return { error: null };
    },

    deletePage: async (index) => {
      const { pages } = get();
      if (pages.length <= 1) return;
      const deleted = pages[index];
      const newPages = pages.filter((_, i) => i !== index);
      const newIndex = Math.min(index, newPages.length - 1);
      set({ pages: newPages, currentPageIndex: newIndex });
      get().clearHistoryForPage?.(deleted.id);
      try { await idbDeletePage(deleted.id); } catch { /* ignore */ }

      // Deleting a page doesn't touch any surviving page's updatedAt, so
      // nothing else signals "this notebook changed" - bump the parent
      // notebook explicitly. (Also fixes Dashboard's "recently edited"
      // sort not picking up a page deletion, same root cause.)
      if (deleted.notebookId) {
        const { notebooks } = get();
        const updated = notebooks.map(n => n.id === deleted.notebookId ? { ...n, updatedAt: Date.now() } : n);
        set({ notebooks: updated });
        const nb = updated.find(n => n.id === deleted.notebookId);
        if (nb) { try { await idbPutNotebook(nb); } catch { /* ignore */ } }
      }
    },

    reorderPages: async (oldIndex, newIndex) => {
      const { pages } = get();
      const arr = [...pages];
      const [moved] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, moved);
      const now = Date.now();
      const withOrder = arr.map((p, i) => ({ ...p, order: i, updatedAt: now }));
      set({ pages: withOrder, currentPageIndex: newIndex });
      try {
        for (const p of withOrder) {
          await idbPutPage(p);
        }
      } catch { /* ignore */ }
    },

    // Dashboard-only helper: not reactive, just a snapshot read for
    // display (page counts), so it doesn't need to hook into every
    // mutation path the way `pages` itself does.
    getPageCountsByNotebook: async () => {
      try {
        const allPages = await idbGetAllPages();
        const counts = {};
        for (const p of allPages) {
          if (!p.notebookId) continue;
          counts[p.notebookId] = (counts[p.notebookId] ?? 0) + 1;
        }
        return counts;
      } catch {
        return {};
      }
    },

    loadPagesFromDB: async (notebookId) => {
      try {
        const scoped = notebookId ? await idbGetPagesByNotebookId(notebookId) : await idbGetAllPages();
        scoped.sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
        // Backfill against DEFAULT_SETTINGS on every load, not just for
        // pages with no settings object at all - this covers pages saved
        // before a new setting key existed (e.g. pen types, handwriting
        // confidence, edge smudge), so they get sane defaults instead of
        // undefined instead of only handling the pre-refactor "no
        // settings object" case.
        const migrated = scoped.map(p => ({ ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } }));

        if (migrated.length > 0) {
          set({ pages: migrated, currentPageIndex: 0 });
        } else if (notebookId) {
          // Brand-new, empty notebook - seed it with one blank page rather
          // than leaving the editor with nothing to show.
          const page = { ...DEFAULT_PAGE(), notebookId };
          set({ pages: [page], currentPageIndex: 0 });
          try { await idbPutPage(page); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    },
  };
}
