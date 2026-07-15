import { useEffect, useMemo, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { LayoutGrid, List, Plus, Moon, Sun } from 'lucide-react';
import { useStore, useNotebooks, useCurrentNotebookId } from '../../store/index.js';
import { MAX_NOTEBOOKS } from '../../constants/limits.js';
import { NotebookCard } from './NotebookCard.jsx';
import { BackupStatusBar } from './BackupStatusBar.jsx';
import { Logo } from '../shared/Logo.jsx';
import { AccountButton } from '../layout/AccountButton.jsx';

const SORTS = {
  recent: (a, b) => b.updatedAt - a.updatedAt,
  name:   (a, b) => a.name.localeCompare(b.name),
  created:(a, b) => b.createdAt - a.createdAt,
};

export function Dashboard({ onOpenNotebook }) {
  const notebooks          = useNotebooks();
  const currentNotebookId  = useCurrentNotebookId();
  const currentPages       = useStore(s => s.pages);
  const darkMode           = useStore(s => s.darkMode);
  const toggleDarkMode     = useStore(s => s.toggleDarkMode);
  const switchNotebook     = useStore(s => s.switchNotebook);
  const createNotebook     = useStore(s => s.createNotebook);
  const renameNotebook     = useStore(s => s.renameNotebook);
  const setNotebookCover   = useStore(s => s.setNotebookCover);
  const togglePinNotebook  = useStore(s => s.togglePinNotebook);
  const reorderNotebooks   = useStore(s => s.reorderNotebooks);
  const deleteNotebook     = useStore(s => s.deleteNotebook);
  const getPageCountsByNotebook = useStore(s => s.getPageCountsByNotebook);
  const addToast           = useStore(s => s.addToast);

  const [viewMode, setViewMode] = useState('grid');
  const [sortKey, setSortKey]   = useState('recent');
  const [counts, setCounts]     = useState({});

  const refreshCounts = () => { getPageCountsByNotebook().then(setCounts); };
  useEffect(refreshCounts, [notebooks.length]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sorted = useMemo(() => {
    const pinned    = notebooks.filter(n => n.pinned).sort(SORTS[sortKey]);
    const unpinned  = notebooks.filter(n => !n.pinned).sort(SORTS[sortKey]);
    return [...pinned, ...unpinned];
  }, [notebooks, sortKey]);

  const handleOpen = async (id) => {
    await switchNotebook(id);
    onOpenNotebook();
  };

  const handleCreate = async () => {
    const { notebook, error } = await createNotebook();
    if (error) { addToast?.({ type: 'error', message: error }); return; }
    await handleOpen(notebook.id);
  };

  const handleDelete = async (id) => {
    const { error } = await deleteNotebook(id);
    if (error) addToast?.({ type: 'error', message: error });
    else refreshCounts();
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex(n => n.id === active.id);
    const newIndex = sorted.findIndex(n => n.id === over.id);
    reorderNotebooks(oldIndex, newIndex);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Decorative background: two soft accent blobs + a faint dot grid,
          echoing the notebook/paper theme. Purely visual, sits behind
          everything via z-10 on the content wrapper below. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.16] dark:opacity-[0.14]"
          style={{ background: 'var(--color-accent)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.10] dark:opacity-[0.09]"
          style={{ background: 'var(--color-accent)' }}
        />
        <div
          className="absolute inset-0 text-accent dark:text-white"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            opacity: darkMode ? 0.05 : 0.06,
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-accent/15 dark:border-neutral-800">
        <Logo size={20} onClick={() => { window.location.hash = '#/home'; }} />
        <div className="flex items-center gap-2">
          <AccountButton />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 hover:text-accent dark:hover:text-white transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <BackupStatusBar />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-accent dark:bg-white" />
            Notebooks
            <span
              className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                notebooks.length >= MAX_NOTEBOOKS
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
              }`}
            >
              {notebooks.length}/{MAX_NOTEBOOKS}
            </span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40 transition-shadow"
            >
              <option value="recent">Recently edited</option>
              <option value="name">Name</option>
              <option value="created">Recently created</option>
            </select>
            <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 border border-accent/10 dark:border-transparent rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-accent dark:text-white shadow-sm' : 'text-neutral-400 hover:text-accent/70'}`}>
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700 text-accent dark:text-white shadow-sm' : 'text-neutral-400 hover:text-accent/70'}`}>
                <List size={13} />
              </button>
            </div>
            <button
              onClick={handleCreate}
              disabled={notebooks.length >= MAX_NOTEBOOKS}
              title={notebooks.length >= MAX_NOTEBOOKS ? `You can have up to ${MAX_NOTEBOOKS} notebooks.` : undefined}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent dark:bg-white text-white dark:text-black shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:opacity-40 disabled:active:scale-100"
            >
              <Plus size={13} /> New notebook
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map(n => n.id)} strategy={rectSortingStrategy}>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-2'}>
              {sorted.map(nb => (
                <NotebookCard
                  key={`${nb.id}:${viewMode}`}
                  notebook={nb}
                  pageCount={nb.id === currentNotebookId ? currentPages.length : counts[nb.id]}
                  viewMode={viewMode}
                  onOpen={() => handleOpen(nb.id)}
                  onRename={(name) => renameNotebook(nb.id, name)}
                  onSetCover={(patch) => setNotebookCover(nb.id, patch)}
                  onTogglePin={() => togglePinNotebook(nb.id)}
                  onDelete={() => handleDelete(nb.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      </div>
    </div>
  );
}
