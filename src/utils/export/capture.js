import { toCanvas, getFontEmbedCSS } from 'html-to-image';

let _cachedFontEmbedCSS = null;

export function invalidateFontCache() {
  _cachedFontEmbedCSS = null;
}

async function waitForPaint() {
  return new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}

// iOS Safari (and some Android WebViews) fail silently or throw on canvases
// much larger than this per side - default A4 (794x1123) at 3x is nowhere
// close, but a large custom page size at 3x could exceed it and produce a
// blank/failed export with no clear error. Clamp the ratio instead of
// always forcing the caller's requested value.
const MAX_CANVAS_DIMENSION = 4096;

export async function captureElement(element, pixelRatio = 3) {
  await document.fonts.ready;

  if (!_cachedFontEmbedCSS) {
    
    try {
      _cachedFontEmbedCSS = await getFontEmbedCSS(element);
    } catch {
      _cachedFontEmbedCSS = '';
    }
  }

  await waitForPaint();

  const longestSide = Math.max(element.offsetWidth, element.offsetHeight) || 1;
  const safeRatio = Math.min(pixelRatio, MAX_CANVAS_DIMENSION / longestSide);

  return toCanvas(element, {
    pixelRatio: safeRatio,
    fontEmbedCSS: _cachedFontEmbedCSS,
    
    filter: node => !node?.dataset?.exportExclude,
    
    width:  element.offsetWidth,
    height: element.offsetHeight,
  });
}
