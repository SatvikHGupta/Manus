import { useMemo } from 'react';
import { useCurrentPage, useSettings } from '../store/index.js';
import { computeTextStats } from '../utils/text/stats.js';
import { estimateLineCount, estimatePageCapacity } from '../utils/text/overflow.js';
import { hasUnclosedTags } from '../utils/text/parser.js';

export function usePageStats() {
  const page     = useCurrentPage();
  const settings = useSettings();
  const text     = page?.text ?? '';

  return useMemo(() => {
    const stats    = computeTextStats(text);
    const lines    = estimateLineCount(text, settings);
    const capacity = estimatePageCapacity(settings);
    return {
      ...stats,
      estimatedLines: lines,
      pageCapacity: capacity,
      overflowing: lines > capacity,
      unclosedTag: hasUnclosedTags(text),
    };
  }, [
    text, settings.fontSize, settings.lineSpacing, settings.pageWidth, settings.pageHeight,
    settings.paperMarginTopEnabled, settings.paperMarginTop,
    settings.paperMarginLeftEnabled, settings.paperMarginLeft,
    settings.paperMarginRightEnabled, settings.paperMarginRight,
  ]);
}
