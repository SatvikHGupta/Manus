import { captureElement } from './capture.js';

export async function exportPageAsPng(element, filename) {
  const canvas = await captureElement(element);
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      triggerDownload(blob, filename);
      resolve();
    }, 'image/png', 1.0);
  });
}

export async function exportAllPagesAsPng(entries, baseFilename, onProgress) {
  // entries: [{ element, pageNumber }] - pageNumber is the page's real
  // position in the document, not its position within this export, so
  // exporting pages 4-6 produces page4/page5/page6, not page1/page2/page3.
  const total = entries.length;
  let current = 0;
  for (const { element, pageNumber } of entries) {
    await exportPageAsPng(element, `${baseFilename}_page${pageNumber}.png`);
    current++;
    onProgress?.(current, total);
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
