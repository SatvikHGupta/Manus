import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, usePages, useCurrentIndex } from '../../store/index.js';
import { Tooltip } from '../shared/Tooltip.jsx';

export function PagePager() {
  const pages               = usePages();
  const currentIndex        = useCurrentIndex();
  const setCurrentPageIndex = useStore(s => s.setCurrentPageIndex);

  const goPrev = () => currentIndex > 0 && setCurrentPageIndex(currentIndex - 1);
  const goNext = () => currentIndex < pages.length - 1 && setCurrentPageIndex(currentIndex + 1);

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip label="Previous page" side="bottom">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
      </Tooltip>

      <span className="min-w-[44px] px-1 py-1 text-xs font-mono text-center text-neutral-600 dark:text-neutral-300 select-none tabular-nums">
        {currentIndex + 1}/{pages.length}
      </span>

      <Tooltip label="Next page" side="bottom">
        <button
          onClick={goNext}
          disabled={currentIndex === pages.length - 1}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </Tooltip>
    </div>
  );
}
