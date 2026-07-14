import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X } from 'lucide-react';
import { useStore, usePages, useCurrentIndex } from '../../store/index.js';
import { MAX_PAGES } from '../../constants/limits.js';
import { ConfirmModal } from '../shared/ConfirmModal.jsx';
import { cn } from '../../utils/cn.js';

// Same PointerSensor + activationConstraint as desktop's PagesManager -
// PointerSensor already handles touch pointers natively, so drag-reorder
// here is the same sorting logic, just horizontal instead of vertical.
// Delete is an always-visible "x" badge rather than PagesManager's
// hover-reveal one, since there's no hover state on touch.
function SortablePageButton({ page, index, isActive, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative shrink-0">
      <button
        onClick={onClick}
        className={cn(
          'min-w-[36px] h-9 px-3 rounded-lg text-xs font-medium transition-all',
          isActive
            ? 'bg-accent dark:bg-white text-white dark:text-black'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        )}
      >
        {page.label || index + 1}
      </button>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete page ${index + 1}`}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-neutral-400 dark:bg-neutral-600 text-white"
      >
        <X size={10} />
      </button>
    </div>
  );
}

export function MobilePageStrip() {
  const pages                = usePages();
  const currentIndex          = useCurrentIndex();
  const setCurrentPageIndex   = useStore(s => s.setCurrentPageIndex);
  const setAddPageChoiceOpen  = useStore(s => s.setAddPageChoiceOpen);
  const deletePage            = useStore(s => s.deletePage);
  const reorderPages          = useStore(s => s.reorderPages);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = pages.findIndex(p => p.id === active.id);
    const newIdx = pages.findIndex(p => p.id === over.id);
    reorderPages(oldIdx, newIdx);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto shrink-0 bg-white dark:bg-neutral-950 border-t border-accent/10 dark:border-neutral-800 no-print">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
            {pages.map((page, i) => (
              <SortablePageButton
                key={page.id}
                page={page}
                index={i}
                isActive={i === currentIndex}
                onClick={() => setCurrentPageIndex(i)}
                onDelete={() => setDeleteTarget(i)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {pages.length < MAX_PAGES && (
          <button
            onClick={() => setAddPageChoiceOpen(true)}
            aria-label="Add page"
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border-2 border-dashed border-accent/25 dark:border-neutral-700 text-neutral-400 hover:border-accent/40"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete page ${(deleteTarget ?? 0) + 1}?`}
        message="This will permanently remove this page and its content."
        confirmLabel="Delete"
        danger
        onConfirm={() => { deletePage(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
