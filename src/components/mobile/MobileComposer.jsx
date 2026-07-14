import { useLayoutEffect } from 'react';
import { Undo2, Redo2, Search, Tags, Plus } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { useTextEditorState } from '../../hooks/useTextEditorState.js';
import { Tooltip } from '../shared/Tooltip.jsx';
import { TagAutocomplete } from '../text-editor/TagAutocomplete.jsx';
import { OverflowBanner } from '../text-editor/OverflowBanner.jsx';
import { TextStats } from '../text-editor/TextStats.jsx';

// Replaces the old "Write" tab. The canvas above this never gets hidden -
// this is the whole point of the mobile remake: you should be able to see
// your handwriting update live while typing, the same way desktop shows
// the canvas and editor side by side. Docked at the bottom and auto-grows
// with content, chat-composer style (WhatsApp/Instagram DM reference), up
// to a capped height so a long entry stays scrollable instead of pushing
// the canvas off-screen entirely.
export function MobileComposer({ onOpenTools }) {
  const { localText, handleChange, textareaRef, tagSuggestions, caretPos, insertTag, speech } =
    useTextEditorState();

  const undo               = useStore(s => s.undo);
  const redo                = useStore(s => s.redo);
  const canUndo             = useStore(s => s.canUndo());
  const canRedo             = useStore(s => s.canRedo());
  const setFindReplaceOpen  = useStore(s => s.setFindReplaceOpen);
  const setColorTagsOpen    = useStore(s => s.setColorTagsModalOpen);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [localText, textareaRef]);

  return (
    <div className="shrink-0 border-t border-accent/15 dark:border-neutral-800 bg-white dark:bg-neutral-950 no-print">
      <OverflowBanner />

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleChange}
          data-tour="text-input"
          rows={1}
          placeholder="Start typing your notes here..."
          className="w-full max-h-40 resize-none outline-none bg-transparent text-base text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 leading-relaxed px-4 py-3"
          style={{ fontFamily: 'var(--font-ui)' }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <TagAutocomplete
          suggestions={tagSuggestions}
          onSelect={insertTag}
          caretPosition={caretPos}
        />
      </div>

      <div className="flex items-center gap-0.5 px-2 pb-1">
        <Tooltip label="More tools" side="top">
          <button
            onClick={onOpenTools}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Plus size={18} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Undo" side="top">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 size={16} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Redo" side="top">
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 size={16} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Find & replace" side="top">
          <button
            onClick={() => setFindReplaceOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search size={15} className="text-neutral-400" />
          </button>
        </Tooltip>
        <Tooltip label="Color tags reference" side="top">
          <button
            onClick={() => setColorTagsOpen(true)}
            data-tour="color-tags-btn"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Tags size={15} className="text-neutral-400" />
          </button>
        </Tooltip>
      </div>

      <TextStats speech={speech} />
    </div>
  );
}
