import { arrayMove } from '@dnd-kit/sortable';
import { idbGetAllNotebooks, idbPutNotebook, idbDeleteNotebook } from '../../utils/idb/notebooks.js';
import { idbGetAllPages, idbPutPage, idbDeletePage, idbGetPagesByNotebookId } from '../../utils/idb/pages.js';
import { MAX_NOTEBOOKS } from '../../constants/limits.js';

const NOTEBOOK_COVER_COLORS = ['#94a3b8', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

const DEFAULT_NAME_RE = /^Notebook \((\d+)\)$/;

// Finds the highest existing "Notebook (N)" index across all current
// notebooks and returns the next one up, starting at 0 if none exist yet.
// Derived from live state (not a separately persisted counter) so it stays
// correct even if notebooks were created outside this flow.
function nextDefaultNotebookName(notebooks) {
  let max = -1;
  for (const nb of notebooks) {
    const match = DEFAULT_NAME_RE.exec(nb.name ?? '');
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `Notebook (${max + 1})`;
}

function makeNotebook(name, order = 0) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    coverEmoji: '\ud83d\udcd3',
    coverColor: NOTEBOOK_COVER_COLORS[order % NOTEBOOK_COVER_COLORS.length],
    createdAt: now,
    updatedAt: now,
    order,
    pinned: false,
  };
}

export function createNotebooksSlice(set, get) {
  return {
    notebooks: [],
    currentNotebookId: null,
    notebooksReady: false,

    // One-time (per app load) setup: makes sure at least one notebook
    // exists, assigns any pages saved before Notebooks existed to one
    // (grouping everything into "My Notebook" rather than losing it),
    // then loads the current notebook's pages. Safe to call even if
    // notebooks/pages are already fully migrated - it's a no-op past the
    // first run other than the normal page load.
    initNotebooksAndPages: async () => {
      try {
        let [notebooks, allPages] = await Promise.all([idbGetAllNotebooks(), idbGetAllPages()]);

        if (notebooks.length === 0) {
          const def = makeNotebook('My Notebook', 0);
          await idbPutNotebook(def);
          notebooks = [def];
        }
        notebooks.sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));

        const fallbackNotebookId = notebooks[0].id;
        const orphaned = allPages.filter(p => !p.notebookId);
        if (orphaned.length > 0) {
          for (const p of orphaned) {
            const patched = { ...p, notebookId: fallbackNotebookId };
            await idbPutPage(patched);
          }
        }

        const persisted = get().currentNotebookId;
        const currentNotebookId = notebooks.some(n => n.id === persisted) ? persisted : fallbackNotebookId;

        set({ notebooks, currentNotebookId, notebooksReady: true });
        await get().loadPagesFromDB(currentNotebookId);
      } catch {
        set({ notebooksReady: true });
      }
    },

    switchNotebook: async (id) => {
      if (id === get().currentNotebookId) return;
      set({ currentNotebookId: id });
      await get().loadPagesFromDB(id);
    },

    createNotebook: async (name) => {
      const { notebooks } = get();
      if (notebooks.length >= MAX_NOTEBOOKS) {
        return { notebook: null, error: `You can have up to ${MAX_NOTEBOOKS} notebooks.` };
      }
      const resolvedName = name ?? nextDefaultNotebookName(notebooks);
      const nb = makeNotebook(resolvedName, notebooks.length);
      set({ notebooks: [...notebooks, nb] });
      try { await idbPutNotebook(nb); } catch { /* ignore */ }
      return { notebook: nb, error: null };
    },

    renameNotebook: async (id, name) => {
      const { notebooks } = get();
      const updated = notebooks.map(n => n.id === id ? { ...n, name, updatedAt: Date.now() } : n);
      set({ notebooks: updated });
      const nb = updated.find(n => n.id === id);
      if (nb) { try { await idbPutNotebook(nb); } catch { /* ignore */ } }
    },

    setNotebookCover: async (id, patch) => {
      const { notebooks } = get();
      const updated = notebooks.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n);
      set({ notebooks: updated });
      const nb = updated.find(n => n.id === id);
      if (nb) { try { await idbPutNotebook(nb); } catch { /* ignore */ } }
    },

    togglePinNotebook: async (id) => {
      const { notebooks } = get();
      const updated = notebooks.map(n => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n);
      set({ notebooks: updated });
      const nb = updated.find(n => n.id === id);
      if (nb) { try { await idbPutNotebook(nb); } catch { /* ignore */ } }
    },

    reorderNotebooks: async (oldIndex, newIndex) => {
      const { notebooks } = get();
      const reordered = arrayMove(notebooks, oldIndex, newIndex).map((n, i) => ({ ...n, order: i }));
      set({ notebooks: reordered });
      try { for (const n of reordered) await idbPutNotebook(n); } catch { /* ignore */ }
    },

    // Deletes a notebook and every page inside it. Refuses to delete the
    // last remaining notebook - there must always be somewhere to write.
    deleteNotebook: async (id) => {
      const { notebooks } = get();
      if (notebooks.length <= 1) {
        return { error: "You can't delete your only notebook." };
      }
      try {
        const pagesToDelete = await idbGetPagesByNotebookId(id);
        for (const p of pagesToDelete) {
          await idbDeletePage(p.id);
          get().clearHistoryForPage?.(p.id);
        }
        await idbDeleteNotebook(id);
      } catch { /* ignore */ }

      const remaining = notebooks.filter(n => n.id !== id);
      set({ notebooks: remaining });

      if (get().currentNotebookId === id && remaining[0]) {
        await get().switchNotebook(remaining[0].id);
      }
      return { error: null };
    },
  };
}
