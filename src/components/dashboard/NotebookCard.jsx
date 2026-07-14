import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Pin, Pencil, Palette, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../shared/ConfirmModal.jsx';
import { ColorSwatches } from '../controls/ColorSwatches.jsx';
import { FloatingPanel } from '../shared/FloatingPanel.jsx';

const COVER_EMOJIS = ['\ud83d\udcd3', '\ud83d\udcd8', '\ud83d\udcd9', '\ud83d\udcd7', '\ud83d\udcd4', '\ud83d\udcdd', '\u2728', '\ud83c\udf1f', '\ud83c\udfaf', '\ud83d\udcda'];
const COVER_COLORS = ['#94a3b8', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'].map(c => ({ name: c, value: c }));

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export function NotebookCard({ notebook, pageCount, viewMode, onOpen, onRename, onSetCover, onTogglePin, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: notebook.id });
  const [menuOpen, setMenuOpen]       = useState(false);
  const [coverOpen, setCoverOpen]     = useState(false);
  const [renaming, setRenaming]       = useState(false);
  const [nameDraft, setNameDraft]     = useState(notebook.name);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const inputRef = useRef(null);
  const menuBtnRef  = useRef(null);
  const coverBtnRef = useRef(null);

  useEffect(() => { if (renaming) inputRef.current?.focus(); }, [renaming]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // dnd-kit's own docs call this out as required for touch dragging to
    // work reliably - without it, a touch-drag attempt on the card can get
    // intercepted by the browser as a page-scroll gesture before the
    // PointerSensor's activation distance is reached.
    touchAction: 'none',
  };

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== notebook.name) onRename(trimmed);
    setRenaming(false);
  };

  const isGrid = viewMode === 'grid';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} {...listeners}
      className={`group relative rounded-2xl border border-accent/15 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-lg hover:border-accent/35 dark:hover:border-neutral-700 hover:-translate-y-0.5 transition-all cursor-pointer ${isGrid ? '' : 'flex items-center gap-4 px-4 py-3'}`}
      onClick={() => !renaming && !menuOpen && !coverOpen && onOpen()}
    >
      <div
        className={isGrid ? 'h-24 flex items-center justify-center text-4xl' : 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0'}
        style={{ backgroundImage: `linear-gradient(155deg, ${notebook.coverColor}${isGrid ? '40' : '66'}, ${notebook.coverColor}${isGrid ? '15' : '30'})` }}
      >
        {notebook.coverEmoji}
      </div>

      <div className={isGrid ? 'p-3 flex flex-col gap-0.5' : 'flex-1 min-w-0'}>
        {renaming ? (
          <input
            ref={inputRef}
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onClick={e => e.stopPropagation()}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setNameDraft(notebook.name); setRenaming(false); } }}
            className="text-sm font-medium bg-transparent border-b border-accent/25 dark:border-neutral-600 outline-none text-neutral-900 dark:text-neutral-100"
          />
        ) : (
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1">
            {notebook.pinned && <Pin size={10} className="text-amber-500 shrink-0" />}
            {notebook.name}
          </span>
        )}
        <span className="text-[11px] text-neutral-400">
          {pageCount ?? 0} page{pageCount === 1 ? '' : 's'} &middot; {relativeTime(notebook.updatedAt)}
        </span>
      </div>

      <button
        ref={menuBtnRef}
        onClick={e => { e.stopPropagation(); setCoverOpen(false); setMenuOpen(o => !o); }}
        className={`absolute ${isGrid ? 'top-2 right-2' : 'right-3 top-1/2 -translate-y-1/2'} p-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-accent/10 dark:hover:bg-neutral-800 transition-opacity`}
      >
        <MoreHorizontal size={14} className="text-neutral-500" />
      </button>

      <FloatingPanel anchorRef={menuBtnRef} open={menuOpen} onClose={() => setMenuOpen(false)} className="min-w-[160px] text-xs">
        <button onClick={() => { setRenaming(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/5 dark:hover:bg-neutral-800 text-left">
          <Pencil size={12} /> Rename
        </button>
        <button onClick={() => { setCoverOpen(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/5 dark:hover:bg-neutral-800 text-left">
          <Palette size={12} /> Change cover
        </button>
        <button onClick={() => { onTogglePin(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/5 dark:hover:bg-neutral-800 text-left">
          <Pin size={12} /> {notebook.pinned ? 'Unpin' : 'Pin to top'}
        </button>
        <button onClick={() => { setConfirmDeleteOpen(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950 text-left text-red-500">
          <Trash2 size={12} /> Delete
        </button>
      </FloatingPanel>

      {/* Invisible anchor for the cover picker (opened from the menu above,
          not its own visible button) - positioned where the menu button is
          so the picker still appears in a sensible spot near the card. */}
      <span ref={coverBtnRef} className={`absolute ${isGrid ? 'top-2 right-2' : 'right-3 top-1/2 -translate-y-1/2'} w-0 h-0`} />
      <FloatingPanel anchorRef={coverBtnRef} open={coverOpen} onClose={() => setCoverOpen(false)} className="p-3 flex flex-col gap-2 w-[190px]">
        <div className="grid grid-cols-5 gap-1">
          {COVER_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => onSetCover({ coverEmoji: e })}
              className={`text-lg p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${notebook.coverEmoji === e ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            >
              {e}
            </button>
          ))}
        </div>
        <ColorSwatches colors={COVER_COLORS} value={notebook.coverColor} onChange={v => onSetCover({ coverColor: v })} />
      </FloatingPanel>

      <ConfirmModal
        open={confirmDeleteOpen}
        title={`Delete "${notebook.name}"?`}
        message={`This deletes the notebook and all ${pageCount ?? 0} page${pageCount === 1 ? '' : 's'} inside it. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { setConfirmDeleteOpen(false); onDelete(); }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
