import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore, usePages, useCurrentIndex } from '../../store/index.js';
import { PageThumbnail } from './PageThumbnail.jsx';
import { Plus, LayoutGrid, Square } from 'lucide-react';
import { MAX_PAGES } from '../../constants/limits.js';
import { ConfirmModal } from '../shared/ConfirmModal.jsx';

export function PagesManager() {
  const pages            = usePages();
  const currentIndex     = useCurrentIndex();
  const deletePage       = useStore(s => s.deletePage);
  const reorderPages     = useStore(s => s.reorderPages);
  const setCurrentPageIndex  = useStore(s => s.setCurrentPageIndex);
  const setAddPageChoiceOpen = useStore(s => s.setAddPageChoiceOpen);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]         = useState('full'); // 'full' | 'icon'

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = pages.findIndex(p => p.id === active.id);
    const newIdx = pages.findIndex(p => p.id === over.id);
    reorderPages(oldIdx, newIdx);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[140px] shrink-0 gap-2 overflow-y-auto py-3 px-2 no-print">
      {pages.length < MAX_PAGES && (
        <button
          onClick={() => setAddPageChoiceOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-accent/25 dark:border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 dark:hover:border-neutral-500 transition-colors text-xs shrink-0"
        >
          <Plus size={14} />
          Add page
        </button>
      )}

      <div className="flex items-center justify-center gap-1 pb-1">
        <button
          onClick={() => setViewMode('full')}
          title="Full preview"
          className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${viewMode === 'full' ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}
        >
          <LayoutGrid size={13} />
        </button>
        <button
          onClick={() => setViewMode('icon')}
          title="Icon view"
          className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${viewMode === 'icon' ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}
        >
          <Square size={13} />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className={viewMode === 'icon' ? 'grid grid-cols-3 gap-1.5' : 'flex flex-col gap-2'}>
            {pages.map((page, i) => (
              <PageThumbnail
                key={page.id}
                page={page}
                index={i}
                isActive={i === currentIndex}
                viewMode={viewMode}
                onClick={() => setCurrentPageIndex(i)}
                onDelete={() => setDeleteTarget(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete page ${(deleteTarget ?? 0) + 1}?`}
        message="This will permanently remove this page and its content."
        confirmLabel="Delete"
        danger
        onConfirm={() => { deletePage(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </aside>
  );
}
