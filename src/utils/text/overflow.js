import { buildPagePadding } from '../paper/padding.js';

export function estimateLineCount(text, settings) {
  if (!text) return 0;
  const lines    = text.split('\n');
  const { paddingLeft, paddingRight } = buildPagePadding(settings);
  const usableWidth = Math.max(20, settings.pageWidth - paddingLeft - paddingRight);
  const charPerLine = Math.max(1, Math.floor(usableWidth / (settings.fontSize * 0.52)));
  let total = 0;
  for (const line of lines) {
    total += Math.max(1, Math.ceil(line.length / charPerLine));
  }
  return total;
}

export function estimatePageCapacity(settings) {
  const { paddingTop, paddingBottom } = buildPagePadding(settings);
  const usableHeight = Math.max(20, settings.pageHeight - paddingTop - paddingBottom);
  return Math.floor(usableHeight / settings.lineSpacing);
}

// Mirrors estimateLineCount's per-line accounting, but instead of just a
// total count, walks far enough to find the character offset where the
// page's capacity is exceeded - used to auto-split text between pages.
// Returns -1 if the text doesn't overflow the given settings' capacity.
export function findOverflowSplitIndex(text, settings) {
  if (!text) return -1;
  const capacity = estimatePageCapacity(settings);
  const { paddingLeft, paddingRight } = buildPagePadding(settings);
  const usableWidth = Math.max(20, settings.pageWidth - paddingLeft - paddingRight);
  const charPerLine = Math.max(1, Math.floor(usableWidth / (settings.fontSize * 0.52)));

  const lines = text.split('\n');
  let usedLines = 0;
  let charIndex = 0;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const rowsForLine = Math.max(1, Math.ceil(line.length / charPerLine));

    if (usedLines + rowsForLine > capacity) {
      const remainingRows = capacity - usedLines;
      if (remainingRows <= 0) return charIndex;
      const charsThatFit = remainingRows * charPerLine;
      return charIndex + Math.min(charsThatFit, line.length);
    }

    usedLines += rowsForLine;
    charIndex += line.length + 1; // +1 to account for the newline
  }
  return -1;
}

// Splits text into what fits on this page and what should flow to the
// next one, at the boundary above. Returns null if it doesn't overflow.
export function splitTextForOverflow(text, settings) {
  const idx = findOverflowSplitIndex(text, settings);
  if (idx < 0 || idx >= text.length) return null;
  return { fits: text.slice(0, idx), overflow: text.slice(idx) };
}

// Splits arbitrarily long text into as many page-sized chunks as needed,
// for cascading pastes/imports across multiple pages in one shot.
export function splitTextIntoPageChunks(text, settings) {
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    const split = splitTextForOverflow(remaining, settings);
    if (!split) {
      chunks.push(remaining);
      break;
    }
    chunks.push(split.fits);
    remaining = split.overflow;
  }
  return chunks;
}
