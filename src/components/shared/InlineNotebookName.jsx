import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/index.js';

export function InlineNotebookName({ notebook, className = '' }) {
  const renameNotebook = useStore(s => s.renameNotebook);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(notebook?.name ?? '');
  const inputRef = useRef(null);

  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);
  useEffect(() => { if (!editing) setDraft(notebook?.name ?? ''); }, [notebook?.name, editing]);

  if (!notebook) return null;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== notebook.name) renameNotebook(notebook.id, trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(notebook.name); setEditing(false); }
        }}
        onClick={e => e.stopPropagation()}
        className={`bg-transparent border-b border-accent/40 dark:border-neutral-500 outline-none min-w-0 max-w-[40ch] ${className}`}
        style={{ width: `${Math.min(Math.max(draft.length, 4), 40)}ch` }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      title="Double-click to rename"
      className={`truncate cursor-text ${className}`}
    >
      {notebook.name}
    </span>
  );
}
