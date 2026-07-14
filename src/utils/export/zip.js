import JSZip from 'jszip';
import { captureElement } from './capture.js';

export async function buildZipBlob(entries, onProgress) {
  // entries: [{ element, pageNumber }]
  const zip = new JSZip();
  const folder = zip.folder('pages');
  const total = entries.length;
  let current = 0;

  for (const { element, pageNumber } of entries) {
    const canvas = await captureElement(element);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png', 1.0));
    folder.file(`page_${pageNumber}.png`, blob);
    current++;
    onProgress?.(current, total);
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function exportAllAsZip(entries, baseFilename, onProgress) {
  const content = await buildZipBlob(entries, onProgress);
  const url = URL.createObjectURL(content);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `${baseFilename}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
