import { useStore } from '../../store/index.js';
import { Tags, Undo2, Redo2, Search } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip.jsx';

export function TextEditorHeader() {
  const setColorTagsOpen  = useStore(s => s.setColorTagsModalOpen);
  const setFindReplaceOpen = useStore(s => s.setFindReplaceOpen);
  const undo    = useStore(s => s.undo);
  const redo    = useStore(s => s.redo);
  const canUndo = useStore(s => s.canUndo());
  const canRedo = useStore(s => s.canRedo());

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-accent/10 dark:border-neutral-800 shrink-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        Text input
      </span>
      <div className="flex items-center gap-0.5">
        <Tooltip label="Undo" shortcut="Ctrl+Z" side="bottom">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <Undo2 size={13} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Redo" shortcut="Ctrl+Shift+Z" side="bottom">
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <Redo2 size={13} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Find & replace" shortcut="Ctrl+F" side="bottom">
          <button
            onClick={() => setFindReplaceOpen(true)}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search size={12} className="text-neutral-400" />
          </button>
        </Tooltip>
        <button
          onClick={() => setColorTagsOpen(true)}
          title="Color tags reference"
          data-tour="color-tags-btn"
          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Tags size={12} className="text-neutral-400" />
        </button>
      </div>
    </div>
  );
}
