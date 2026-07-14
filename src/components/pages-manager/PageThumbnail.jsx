import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function PageThumbnail({ page, index, isActive, onClick, onDelete, viewMode = 'full' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
  };

  const s         = page.settings || {};
  const bgColor   = s.paperColor || '#ffffff';
  const lineColor = s.paperLineColor || '#d4d4d4';
  const showLines = s.paperType && s.paperType !== 'blank';
  const snippet   = (page.text || '').replace(/<\/?[\w]+>/g, '').trim().slice(0, 70);

  if (viewMode === 'icon') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes} {...listeners}
        onClick={onClick}
        className={cn(
          'relative group aspect-square rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all text-xs font-semibold',
          isActive
            ? 'border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
            : 'border-accent/15 dark:border-neutral-700 hover:border-accent/40 text-neutral-400'
        )}
      >
        {index + 1}
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px]"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
        isActive
          ? 'border-neutral-800 dark:border-neutral-200'
          : 'border-accent/15 dark:border-neutral-700 hover:border-accent/40'
      )}
      onClick={onClick}
    >
      <div
        className="relative w-full aspect-[794/1123] flex flex-col justify-end p-1.5 overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {showLines && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={
              s.paperType === 'grid'
                ? {
                    backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
                    backgroundSize: '9px 9px',
                    opacity: 0.5,
                  }
                : {
                    backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
                    backgroundSize: '100% 11px',
                    opacity: 0.5,
                  }
            }
          />
        )}
        {snippet && (
          <div
            className="absolute top-1.5 left-1.5 right-1.5 text-[6px] leading-tight text-neutral-500 line-clamp-4"
            style={{ fontFamily: s.fontFamily }}
          >
            {snippet}
          </div>
        )}
        {/* Only show this line for an actual custom name - the plain page
            number already appears once, in the badge below. Showing the
            "Page N" fallback here too duplicated the number on every
            thumbnail. */}
        {page.label && (
          <span className="relative z-10 text-[9px] text-neutral-400 truncate">{page.label}</span>
        )}
      </div>

      <div
        {...attributes} {...listeners}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical size={12} className="text-neutral-400" />
      </div>

      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] hover:bg-red-600"
      >
        ×
      </button>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center py-1">
        <span className={cn('text-[9px]', isActive ? 'text-neutral-800 dark:text-neutral-200 font-semibold' : 'text-neutral-400')}>
          {index + 1}
        </span>
      </div>
    </div>
  );
}
