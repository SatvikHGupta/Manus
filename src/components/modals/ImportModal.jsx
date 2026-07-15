import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../shared/Modal.jsx';
import { Spinner } from '../shared/Spinner.jsx';
import { useStore, useSettings } from '../../store/index.js';
import { splitTextIntoPageChunks } from '../../utils/text/overflow.js';
import { MAX_PAGES } from '../../constants/limits.js';

export function ImportModal() {
  const open    = useStore(s => s.importModalOpen);
  const setOpen = useStore(s => s.setImportModalOpen);
  const settings = useSettings();
  const pages    = useStore(s => s.pages);
  const cascadeTextIntoPages = useStore(s => s.cascadeTextIntoPages);
  const addToast = useStore(s => s.addToast);

  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const MAX_IMPORT_BYTES = 10 * 1024 * 1024; // 10MB - generous for plain text/docx, cheap to check up front
    if (file.size > MAX_IMPORT_BYTES) {
      addToast?.({ type: 'error', message: 'That file is too large to import (max 10MB).' });
      return;
    }

    setBusy(true);
    try {
      let text = '';
      const name = file.name.toLowerCase();

      if (name.endsWith('.docx')) {
        // mammoth only extracts plain text - this app's own tag system
        // doesn't even have a real "bold" concept, so faithfully
        // preserving Word formatting isn't achievable and isn't promised.
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (name.endsWith('.txt')) {
        text = await file.text();
      } else {
        addToast?.({ type: 'error', message: 'Only .txt and .docx files are supported.' });
        setBusy(false);
        return;
      }

      text = text.replace(/\r\n/g, '\n').trim();
      if (!text) {
        addToast?.({ type: 'error', message: 'That file appears to be empty.' });
        setBusy(false);
        return;
      }

      const availableSlots = Math.max(1, MAX_PAGES - pages.length + 1); // +1: current page can be reused if empty
      let chunks = splitTextIntoPageChunks(text, settings);
      let truncatedBySize = false;
      if (chunks.length > availableSlots) {
        chunks = chunks.slice(0, availableSlots);
        truncatedBySize = true;
      }

      const { insertedCount, truncated } = await cascadeTextIntoPages(chunks);
      setOpen(false);

      const hitLimit = truncated || truncatedBySize;
      addToast?.({
        type: hitLimit ? 'info' : 'success',
        message: hitLimit
          ? `Imported the first ${insertedCount} page${insertedCount === 1 ? '' : 's'} - the ${MAX_PAGES}-page limit cut the rest off.`
          : `Flowed across ${insertedCount} page${insertedCount === 1 ? '' : 's'}.`,
      });
    } catch {
      addToast?.({ type: 'error', message: 'Could not read that file.' });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal open={open} onClose={() => (!busy && setOpen(false))} title="Import text" maxWidth="max-w-sm">
      <div className="p-5 flex flex-col gap-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Import a .txt or .docx file. Long files automatically flow across
          as many pages as needed. Only plain text is imported - Word
          formatting (bold, colors, etc.) isn't preserved.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-accent/25 dark:border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 dark:hover:border-neutral-500 transition-colors disabled:opacity-50"
        >
          {busy ? <Spinner size={20} /> : <Upload size={20} />}
          <span className="text-xs">{busy ? 'Reading file...' : 'Choose a .txt or .docx file'}</span>
        </button>
      </div>
    </Modal>
  );
}
