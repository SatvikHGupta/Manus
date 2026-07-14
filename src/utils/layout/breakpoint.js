export const MOBILE_MAX_WIDTH = 640;
export const TABLET_MAX_WIDTH = 1024;

export function getBreakpoint(width) {
  if (width < MOBILE_MAX_WIDTH) return 'mobile';
  if (width < TABLET_MAX_WIDTH) return 'tablet';
  return 'desktop';
}

// Layout constants that the fit-zoom math depends on. These mirror the
// actual rendered chrome around the page canvas (see MobileLayout.jsx
// and CanvasColumn.jsx) - kept here as named, documented values instead of
// bare numbers so a future header/strip height change is a one-line fix
// instead of a silent drift between the CSS and this calculation.
export const MOBILE_HEADER_HEIGHT      = 44;  // MobileHeader.jsx: h-11
export const MOBILE_PAGER_ROW_HEIGHT   = 40;  // CanvasColumn.jsx pager/zoom row: px-4 py-1.5 + icon
export const MOBILE_PAGE_STRIP_HEIGHT  = 56;  // MobilePageStrip.jsx: px-3 py-2 + 36px buttons
export const MOBILE_COMPOSER_HEIGHT    = 116; // MobileComposer.jsx collapsed (1-line textarea + icon row + stats row), incl. safe-area slack
export const CANVAS_VERTICAL_PADDING   = 64;  // CanvasColumn.jsx page wrapper: py-8 (32px top + 32px bottom)
export const CANVAS_HORIZONTAL_PADDING = 32;  // CanvasColumn.jsx page wrapper: px-4 (16px each side)

// Pure function (no hooks) so it can be called both from the store's zoom
// actions and from the useBreakpoint() hook without creating duplicate
// listeners/state.
export function computeFitZoomForBreakpoint(bp, pageWidth, pageHeight) {
  if (typeof window === 'undefined' || !pageWidth || !pageHeight) return null;
  if (bp === 'mobile') {
    const availW = window.innerWidth - CANVAS_HORIZONTAL_PADDING;
    const availH = window.innerHeight
      - MOBILE_HEADER_HEIGHT
      - MOBILE_PAGER_ROW_HEIGHT
      - MOBILE_PAGE_STRIP_HEIGHT
      - MOBILE_COMPOSER_HEIGHT
      - CANVAS_VERTICAL_PADDING;
    return Math.min(Math.max(Math.min(availW / pageWidth, availH / pageHeight), 0.25), 0.55);
  }
  if (bp === 'tablet') {
    const availW = window.innerWidth * 0.6 - CANVAS_HORIZONTAL_PADDING;
    return Math.min(Math.max(availW / pageWidth, 0.3), 0.72);
  }
  return null; // desktop: no forced fit
}
