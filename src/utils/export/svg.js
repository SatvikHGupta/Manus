import { toSvg } from 'html-to-image';
import { buildExportFilename } from './filename.js';

export async function exportPageAsSvg(element, fontFamily, pageIndex) {
  if (!element) throw new Error('Page element not found');
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const dataUrl  = await toSvg(element, {
    filter: node => !node?.dataset?.exportExclude,
    width:  element.offsetWidth,
    height: element.offsetHeight,
  });

  const filename = buildExportFilename(fontFamily, pageIndex + 1, 'svg');
  const a = document.createElement('a');
  a.href     = dataUrl;
  a.download = filename;
  a.click();
}
