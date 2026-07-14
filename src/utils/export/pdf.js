import { jsPDF } from 'jspdf';
import { captureElement } from './capture.js';

// items: [{ element, width, height }] - width/height are the page's actual
// pixel dimensions (settings.pageWidth/pageHeight), so each PDF page is
// sized to match instead of forcing every capture into a fixed A4 box.
export async function exportAsPdf(items, filename, onProgress) {
  if (!items.length) throw new Error('No pages available to export.');

  const total = items.length;
  const first = items[0];
  const orientationFor = (w, h) => (w > h ? 'landscape' : 'portrait');

  const pdf = new jsPDF({
    unit: 'px',
    format: [first.width, first.height],
    orientation: orientationFor(first.width, first.height),
  });

  for (let i = 0; i < items.length; i++) {
    const { element, width, height } = items[i];
    if (i > 0) pdf.addPage([width, height], orientationFor(width, height));
    const canvas  = await captureElement(element);
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
    onProgress?.(i + 1, total);
  }

  pdf.save(filename);
}
