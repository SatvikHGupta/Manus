import { captureElement } from './capture.js';

export async function copyPageToClipboard(element) {
  const canvas = await captureElement(element);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 'image/png', 1.0);
  });
}
