import { Upload } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { useTextEditorState } from '../../hooks/useTextEditorState.js';
import { TextEditorHeader } from './TextEditorHeader.jsx';
import { TextArea } from './TextArea.jsx';
import { TextStats } from './TextStats.jsx';
import { TagAutocomplete } from './TagAutocomplete.jsx';
import { TextTemplates } from './TextTemplates.jsx';
import { MarginFields } from './MarginFields.jsx';
import { OverflowBanner } from './OverflowBanner.jsx';

export function TextEditor() {
  const { localText, handleChange, textareaRef, tagSuggestions, caretPos, insertTag, speech } = useTextEditorState();

  return (
    <div className="flex flex-col h-full relative">
      <TextEditorHeader />

      <MarginFields />

      <div className="px-4 py-1.5 border-b border-accent/10 dark:border-neutral-800 shrink-0 flex items-center gap-1">
        <TextTemplates />
        <button
          onClick={() => useStore.getState().setImportModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Upload size={12} />
          Import
        </button>
      </div>

      <OverflowBanner />

      <div className="flex-1 relative overflow-hidden min-h-0">
        <TextArea
          ref={textareaRef}
          value={localText}
          onChange={handleChange}
        />
        <TagAutocomplete
          suggestions={tagSuggestions}
          onSelect={insertTag}
          caretPosition={caretPos}
        />
      </div>

      <TextStats speech={speech} />
    </div>
  );
}
