import { useCallback, useState } from 'react';
import { useStore, useSettings } from '../store/index.js';
import { exportPageAsPng, exportAllPagesAsPng } from '../utils/export/png.js';
import { exportAsPdf }          from '../utils/export/pdf.js';
import { exportAllAsZip, buildZipBlob } from '../utils/export/zip.js';
import { copyPageToClipboard }  from '../utils/export/clipboard.js';
import { exportPageAsSvg }      from '../utils/export/svg.js';
import { buildExportFilename }  from '../utils/export/filename.js';
import { captureElement }       from '../utils/export/capture.js';
import { canUseWebShareFiles, shareFiles } from '../utils/export/share.js';

export function useExport(pageRefs) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  // { current, total } while a multi-page export is mid-flight, null
  // otherwise (including single-page exports, which never set it).
  const [exportProgress, setExportProgress] = useState(null);
  const settings      = useSettings();
  const pages         = useStore(s => s.pages);
  const currentIndex  = useStore(s => s.currentPageIndex);
  const addToast      = useStore(s => s.addToast);

  const canShare = canUseWebShareFiles();

  const getRef = useCallback((index) => {
    return pageRefs?.current?.[index];
  }, [pageRefs]);

  // Fix bug #22: previously any missing page ref was silently dropped and the
  // export still reported "Exported successfully!" even if pages were
  // skipped. Build the ref/page pairs together and surface a partial-export
  // message whenever some pages couldn't be captured.
  // `range` is an optional { from, to } pair, 1-indexed inclusive, matching
  // what the person sees as page numbers in the UI.
  const getExportableEntries = useCallback((range) => {
    return pages
      .map((page, i) => ({ page, index: i, element: getRef(i) }))
      .filter(e => e.element)
      .filter(e => !range || (e.index + 1 >= range.from && e.index + 1 <= range.to));
  }, [pages, getRef]);

  const run = useCallback(async (fn) => {
    setExporting(true);
    setExportError(null);
    setExportProgress(null);
    try {
      const result = await fn();
      if (result?.cancelled) return;
      addToast({ type: 'success', message: (result && result.message) || 'Exported successfully!' });
    } catch (err) {
      const msg = err?.message && err.message !== 'Page ref not found'
        ? err.message
        : 'Export failed. Please try again.';
      setExportError(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }, [addToast]);

  const baseName = buildExportFilename(settings.fontFamily, null, '');

  const partialMessage = (count, total) =>
    count < total ? { message: `Exported ${count} of ${total} pages (some pages weren't ready - try again).` } : undefined;

  return {
    exporting,
    exportError,
    exportProgress,
    canShare,

    exportCurrentPng: () => run(() => {
      const el = getRef(currentIndex);
      if (!el) throw new Error('This page isn\'t ready to export yet - try again in a moment.');
      const filename = buildExportFilename(settings.fontFamily, currentIndex + 1, 'png');
      return exportPageAsPng(el, filename);
    }),

    exportAllPng: (range) => run(async () => {
      const entries = getExportableEntries(range);
      if (!entries.length) throw new Error('No pages are ready to export yet - try again in a moment.');
      await exportAllPagesAsPng(
        entries.map(e => ({ element: e.element, pageNumber: e.index + 1 })),
        baseName.replace('.', ''),
        (current, total) => setExportProgress({ current, total })
      );
      const total = range ? (range.to - range.from + 1) : pages.length;
      return partialMessage(entries.length, total);
    }),

    exportPdf: (range) => run(async () => {
      const entries = getExportableEntries(range);
      if (!entries.length) throw new Error('No pages are ready to export yet - try again in a moment.');
      const items = entries.map(e => ({
        element: e.element,
        width:  e.page.settings?.pageWidth  ?? settings.pageWidth,
        height: e.page.settings?.pageHeight ?? settings.pageHeight,
      }));
      await exportAsPdf(items, `${baseName.replace('.', '')}.pdf`, (current, total) => setExportProgress({ current, total }));
      const total = range ? (range.to - range.from + 1) : pages.length;
      return partialMessage(entries.length, total);
    }),

    exportZip: (range) => run(async () => {
      const entries = getExportableEntries(range);
      if (!entries.length) throw new Error('No pages are ready to export yet - try again in a moment.');
      await exportAllAsZip(
        entries.map(e => ({ element: e.element, pageNumber: e.index + 1 })),
        baseName.replace('.', ''),
        (current, total) => setExportProgress({ current, total })
      );
      const total = range ? (range.to - range.from + 1) : pages.length;
      return partialMessage(entries.length, total);
    }),

    copyToClipboard: () => run(() => {
      const el = getRef(currentIndex);
      if (!el) throw new Error('This page isn\'t ready to export yet - try again in a moment.');
      return copyPageToClipboard(el);
    }),

    exportSvg: () => run(() => {
      const el = getRef(currentIndex);
      if (!el) throw new Error('This page isn\'t ready to export yet - try again in a moment.');
      return exportPageAsSvg(el, settings.fontFamily, currentIndex);
    }),

    shareCurrentPng: () => run(async () => {
      const el = getRef(currentIndex);
      if (!el) throw new Error('This page isn\'t ready to export yet - try again in a moment.');
      const filename = buildExportFilename(settings.fontFamily, currentIndex + 1, 'png');
      const canvas = await captureElement(el);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png', 1.0));
      try {
        await shareFiles([new File([blob], filename, { type: 'image/png' })], { title: 'Handwritten page' });
        return { message: 'Shared!' };
      } catch (err) {
        if (err?.name === 'AbortError') return { cancelled: true };
        throw err;
      }
    }),

    shareZip: (range) => run(async () => {
      const entries = getExportableEntries(range);
      if (!entries.length) throw new Error('No pages are ready to export yet - try again in a moment.');
      const blob = await buildZipBlob(entries.map(e => ({ element: e.element, pageNumber: e.index + 1 })));
      const filename = `${baseName.replace('.', '')}.zip`;
      try {
        await shareFiles([new File([blob], filename, { type: 'application/zip' })], { title: 'Handwritten pages' });
        return { message: 'Shared!' };
      } catch (err) {
        if (err?.name === 'AbortError') return { cancelled: true };
        throw err;
      }
    }),
  };
}
