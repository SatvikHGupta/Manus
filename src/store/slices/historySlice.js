import { MAX_UNDO } from '../../constants/limits.js';

// Tracks in-progress "bursts" of rapid changes (typing, dragging a slider)
// per page, entirely outside of Zustand state - this is just an
// implementation detail of when to capture a new undo snapshot vs. treat
// the change as part of the change already in progress. Switching pages
// doesn't clear another page's burst/history - each page's undo/redo stack
// is independent and persists for the session (in memory only, never
// written to IndexedDB - resets on reload, per the plan).
const activeBursts = new Map(); // pageId -> timeout id

const GROUP_WINDOW_MS = 600;

export function createHistorySlice(set, get) {
  return {
    undoStacks: {}, // { [pageId]: Array<{ text, settings }> }
    redoStacks: {}, // { [pageId]: Array<{ text, settings }> }

    // Called by mutating actions (updateSetting, updateSettings,
    // updatePageText) BEFORE they apply a change. `snapshotFn` is only
    // invoked if this change starts a new burst (i.e. it lazily captures
    // the "before" state so we don't do the work on every keystroke).
    recordHistory: (pageId, snapshotFn) => {
      const existing = activeBursts.get(pageId);
      if (existing) {
        clearTimeout(existing);
        activeBursts.set(pageId, setTimeout(() => activeBursts.delete(pageId), GROUP_WINDOW_MS));
        return;
      }

      const { undoStacks, redoStacks } = get();
      const stack = undoStacks[pageId] ?? [];
      set({
        undoStacks: { ...undoStacks, [pageId]: [...stack, snapshotFn()].slice(-MAX_UNDO) },
        redoStacks: { ...redoStacks, [pageId]: [] },
      });
      activeBursts.set(pageId, setTimeout(() => activeBursts.delete(pageId), GROUP_WINDOW_MS));
    },

    canUndo: () => {
      const { pages, currentPageIndex, undoStacks } = get();
      const page = pages[currentPageIndex];
      return !!page && (undoStacks[page.id]?.length ?? 0) > 0;
    },

    canRedo: () => {
      const { pages, currentPageIndex, redoStacks } = get();
      const page = pages[currentPageIndex];
      return !!page && (redoStacks[page.id]?.length ?? 0) > 0;
    },

    // Called by deletePage() so undoStacks/redoStacks (and the module-level
    // burst-timer map) don't accumulate orphaned entries for pages that no
    // longer exist over a long session.
    clearHistoryForPage: (pageId) => {
      const existing = activeBursts.get(pageId);
      if (existing) clearTimeout(existing);
      activeBursts.delete(pageId);
      const { undoStacks, redoStacks } = get();
      if (!(pageId in undoStacks) && !(pageId in redoStacks)) return;
      const nextUndo = { ...undoStacks }; delete nextUndo[pageId];
      const nextRedo = { ...redoStacks }; delete nextRedo[pageId];
      set({ undoStacks: nextUndo, redoStacks: nextRedo });
    },

    undo: () => {
      const { pages, currentPageIndex, undoStacks, redoStacks } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const stack = undoStacks[page.id] ?? [];
      if (stack.length === 0) return;

      const pendingBurst = activeBursts.get(page.id);
      if (pendingBurst) clearTimeout(pendingBurst);
      activeBursts.delete(page.id);
      const prev = stack[stack.length - 1];
      const current = { text: page.text, settings: page.settings };
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, text: prev.text, settings: prev.settings, updatedAt: Date.now() } : p
      );
      set({
        pages: newPages,
        undoStacks: { ...undoStacks, [page.id]: stack.slice(0, -1) },
        redoStacks: { ...redoStacks, [page.id]: [...(redoStacks[page.id] ?? []), current].slice(-MAX_UNDO) },
      });
      get().persistCurrentPage?.();
    },

    redo: () => {
      const { pages, currentPageIndex, undoStacks, redoStacks } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const stack = redoStacks[page.id] ?? [];
      if (stack.length === 0) return;

      const pendingBurst = activeBursts.get(page.id);
      if (pendingBurst) clearTimeout(pendingBurst);
      activeBursts.delete(page.id);
      const next = stack[stack.length - 1];
      const current = { text: page.text, settings: page.settings };
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, text: next.text, settings: next.settings, updatedAt: Date.now() } : p
      );
      set({
        pages: newPages,
        redoStacks: { ...redoStacks, [page.id]: stack.slice(0, -1) },
        undoStacks: { ...undoStacks, [page.id]: [...(undoStacks[page.id] ?? []), current].slice(-MAX_UNDO) },
      });
      get().persistCurrentPage?.();
    },
  };
}
