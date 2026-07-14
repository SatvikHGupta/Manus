import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Modal } from '../shared/Modal.jsx';
import { ConfirmModal } from '../shared/ConfirmModal.jsx';
import { ToggleControl } from '../controls/ToggleControl.jsx';
import { useStore, usePages, useCurrentIndex } from '../../store/index.js';
import { activeTextareaRef } from '../../utils/activeTextareaRef.js';
import { findMatches, replaceAllInText } from '../../utils/text/findReplace.js';

export function FindReplaceModal() {
  const open    = useStore(s => s.findReplaceOpen);
  const setOpen = useStore(s => s.setFindReplaceOpen);
  const pages   = usePages();
  const currentIndex = useCurrentIndex();
  const setCurrentPageIndex   = useStore(s => s.setCurrentPageIndex);
  const updatePageText        = useStore(s => s.updatePageText);
  const replaceAllAcrossPages = useStore(s => s.replaceAllAcrossPages);
  const addToast              = useStore(s => s.addToast);

  const [query, setQuery]             = useState('');
  const [replacement, setReplacement] = useState('');
  const [scope, setScope]             = useState('page'); // 'page' | 'document'
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchCursor, setMatchCursor] = useState(0);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  // Reset the cursor to the first match whenever the modal reopens or the
  // search itself changes - done as a render-time comparison rather than a
  // useEffect+setState pair, so it doesn't cost an extra render on every
  // keystroke. Safe because it only ever narrows (sets state) when one of
  // these four values has actually changed since the last render.
  const [prevResetKey, setPrevResetKey] = useState({ open, query, scope, caseSensitive });
  if (prevResetKey.open !== open || prevResetKey.query !== query ||
      prevResetKey.scope !== scope || prevResetKey.caseSensitive !== caseSensitive) {
    setPrevResetKey({ open, query, scope, caseSensitive });
    if (open) setMatchCursor(0);
  }

  // Flat list of every match across the relevant scope, each tagged with
  // which page it belongs to, so Next/Prev can jump pages when needed.
  const matches = useMemo(() => {
    if (!query) return [];
    if (scope === 'page') {
      const page = pages[currentIndex];
      if (!page) return [];
      return findMatches(page.text ?? '', query, caseSensitive).map(m => ({ ...m, pageIndex: currentIndex }));
    }
    const all = [];
    pages.forEach((p, pi) => {
      findMatches(p.text ?? '', query, caseSensitive).forEach(m => all.push({ ...m, pageIndex: pi }));
    });
    return all;
  }, [pages, currentIndex, query, scope, caseSensitive]);

  const selectMatch = (match) => {
    const jump = () => {
      const el = activeTextareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(match.start, match.end);
    };
    if (match.pageIndex !== currentIndex) {
      setCurrentPageIndex(match.pageIndex);
      setTimeout(jump, 60);
    } else {
      jump();
    }
  };

  const goTo = (delta) => {
    if (matches.length === 0) return;
    const next = (matchCursor + delta + matches.length) % matches.length;
    setMatchCursor(next);
    selectMatch(matches[next]);
  };

  const replaceOne = () => {
    if (matches.length === 0) return;
    const match = matches[matchCursor];
    if (match.pageIndex !== currentIndex) {
      setCurrentPageIndex(match.pageIndex);
      return;
    }
    const page = pages[currentIndex];
    const text = page.text ?? '';
    const newText = text.slice(0, match.start) + replacement + text.slice(match.end);
    updatePageText(newText);
  };

  const replaceAll = () => {
    if (scope === 'document') {
      setConfirmAllOpen(true);
      return;
    }
    const page = pages[currentIndex];
    if (!page || !query) return;
    updatePageText(replaceAllInText(page.text ?? '', query, replacement, caseSensitive));
    addToast?.({ type: 'success', message: 'Replaced all matches on this page.' });
  };

  const confirmReplaceAllDocument = async () => {
    setConfirmAllOpen(false);
    const count = await replaceAllAcrossPages(query, replacement, caseSensitive);
    addToast?.({ type: count > 0 ? 'success' : 'info', message: count > 0 ? `Replaced matches across ${count} page${count === 1 ? '' : 's'}.` : 'No matches found.' });
  };

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)} title="Find & replace" maxWidth="max-w-sm">
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {[['page', 'This page'], ['document', 'Whole document']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setScope(id)}
                className={`px-2 py-1.5 rounded-md text-xs transition-colors ${scope === id ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Find</label>
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search text..."
                className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-accent/15 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-accent/50 dark:focus:border-neutral-500"
              />
              <span className="text-[11px] text-neutral-400 font-mono tabular-nums min-w-[46px] text-right">
                {matches.length > 0 ? `${matchCursor + 1}/${matches.length}` : '0/0'}
              </span>
              <button onClick={() => goTo(-1)} disabled={matches.length === 0} className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronUp size={13} />
              </button>
              <button onClick={() => goTo(1)} disabled={matches.length === 0} className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Replace with</label>
            <input
              type="text"
              value={replacement}
              onChange={e => setReplacement(e.target.value)}
              placeholder="Replacement text..."
              className="px-2.5 py-1.5 text-sm rounded-lg border border-accent/15 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-accent/50 dark:focus:border-neutral-500"
            />
          </div>

          <ToggleControl label="Case sensitive" value={caseSensitive} onChange={setCaseSensitive} />

          <div className="flex gap-2 pt-1">
            <button
              onClick={replaceOne}
              disabled={matches.length === 0}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Replace
            </button>
            <button
              onClick={replaceAll}
              disabled={!query}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-accent dark:bg-neutral-200 text-white dark:text-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Replace all
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmAllOpen}
        title="Replace across the whole document?"
        message={`This will replace every match of "${query}" on every page. This can't be undone with Ctrl+Z once you leave a page.`}
        confirmLabel="Replace all"
        onConfirm={confirmReplaceAllDocument}
        onCancel={() => setConfirmAllOpen(false)}
      />
    </>
  );
}
