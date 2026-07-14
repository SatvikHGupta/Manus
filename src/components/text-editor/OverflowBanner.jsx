import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useStore, useCurrentPage, useSettings } from '../../store/index.js';
import { usePageStats } from '../../hooks/usePageStats.js';
import { splitTextForOverflow } from '../../utils/text/overflow.js';
import { MAX_PAGES } from '../../constants/limits.js';

export function OverflowBanner() {
  const page     = useCurrentPage();
  const settings = useSettings();
  const stats    = usePageStats();
  const pages    = useStore(s => s.pages);
  const updatePageText         = useStore(s => s.updatePageText);
  const insertPageAfterCurrent = useStore(s => s.insertPageAfterCurrent);
  const addToast = useStore(s => s.addToast);

  const [dismissed, setDismissed] = useState(false);

  // Reset the dismissal whenever the page changes, or once the overflow
  // clears (e.g. the user shrank the font) - so it can surface again on
  // its own next time, rather than staying silenced forever.
  useEffect(() => { setDismissed(false); }, [page?.id]);
  useEffect(() => { if (!stats.overflowing) setDismissed(false); }, [stats.overflowing]);

  if (!stats.overflowing || dismissed) return null;

  const handleContinue = async () => {
    const split = splitTextForOverflow(page.text ?? '', settings);
    if (!split) return;
    if (pages.length >= MAX_PAGES) {
      addToast?.({ type: 'error', message: `You've reached the ${MAX_PAGES}-page limit.` });
      return;
    }
    updatePageText(split.fits);
    const { error } = await insertPageAfterCurrent(split.overflow);
    if (error) addToast?.({ type: 'error', message: error });
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 mx-4 mt-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 shrink-0">
      <span>Page full &mdash; continue on a new page?</span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleContinue}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium"
        >
          Continue <ArrowRight size={11} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          title="Dismiss"
          className="p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
