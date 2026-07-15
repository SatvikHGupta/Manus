import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Image, FileText, Archive, Copy, Printer, Images, FileCode, X, Share2 } from 'lucide-react';
import { useStore }   from '../../store/index.js';
import { useExport }  from '../../hooks/useExport.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import { Spinner } from '../shared/Spinner.jsx';

export function ExportModal({ pageRefs }) {
  const open    = useStore(s => s.exportModalOpen);
  const setOpen = useStore(s => s.setExportModalOpen);
  useEscapeKey(open, () => setOpen(false));
  const pages   = useStore(s => s.pages);
  const {
    exporting, exportError, exportProgress, canShare,
    exportCurrentPng, exportAllPng, exportPdf, exportZip, copyToClipboard, exportSvg,
    shareCurrentPng, shareZip,
  } = useExport(pageRefs);

  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo,   setRangeTo]   = useState(pages.length);

  useEffect(() => {
    if (open) { setRangeFrom(1); setRangeTo(pages.length); }
  }, [open, pages.length]);

  const isFullRange = rangeFrom === 1 && rangeTo === pages.length;
  const range = isFullRange ? undefined : {
    from: Math.min(rangeFrom, rangeTo),
    to:   Math.max(rangeFrom, rangeTo),
  };

  const clamp = (v) => Math.min(Math.max(1, v || 1), pages.length);

  const formats = [
    { label: 'Current page PNG', icon: Image,     action: exportCurrentPng,        desc: 'High-res PNG of active page' },
    { label: 'All pages PNG',    icon: Images,     action: () => exportAllPng(range), desc: 'One PNG file per page'       },
    { label: 'PDF',              icon: FileText,   action: () => exportPdf(range),    desc: 'All pages in one PDF'        },
    { label: 'ZIP (all PNGs)',   icon: Archive,    action: () => exportZip(range),    desc: 'Zipped PNG folder'           },
    { label: 'SVG vector',       icon: FileCode,   action: exportSvg,        desc: 'Scalable vector, current page' },
    { label: 'Copy to clipboard',icon: Copy,       action: copyToClipboard,  desc: 'Current page to clipboard'   },
    { label: 'Print',            icon: Printer,    action: () => window.print(), desc: 'Browser print dialog'   },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90dvh] overflow-hidden flex flex-col"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          >
            <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">Export</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X size={16} className="text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            {pages.length > 1 && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">Pages</span>
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={rangeFrom}
                  onChange={e => setRangeFrom(clamp(parseInt(e.target.value, 10)))}
                  className="w-14 px-2 py-1 text-xs text-center rounded-md border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <span className="text-[11px] text-neutral-400">to</span>
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={rangeTo}
                  onChange={e => setRangeTo(clamp(parseInt(e.target.value, 10)))}
                  className="w-14 px-2 py-1 text-xs text-center rounded-md border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <span className="text-[10px] text-neutral-400 ml-auto">
                  {isFullRange ? `all ${pages.length}` : `${range.to - range.from + 1} of ${pages.length}`}
                </span>
              </div>
            )}

            {exportError && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{exportError}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {formats.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.label}
                    onClick={() => { f.action(); }}
                    disabled={exporting}
                    className="flex flex-col gap-1.5 p-3 rounded-xl border border-accent/15 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left disabled:opacity-50"
                  >
                    <Icon size={18} className="text-neutral-600 dark:text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{f.label}</span>
                    <span className="text-[10px] text-neutral-400">{f.desc}</span>
                  </button>
                );
              })}
            </div>

            {canShare && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={shareCurrentPng}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                  <Share2 size={12} /> Share current page
                </button>
                <button
                  onClick={() => shareZip(range)}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                  <Share2 size={12} /> Share all (ZIP)
                </button>
              </div>
            )}

            {exporting && (
              exportProgress ? (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent dark:bg-neutral-300"
                      animate={{ width: `${Math.round((exportProgress.current / exportProgress.total) * 100)}%` }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-center text-neutral-400 mt-2">
                    Rendering page {exportProgress.current} of {exportProgress.total}...
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Spinner size={14} />
                  <p className="text-xs text-neutral-400">Rendering...</p>
                </div>
              )
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
