import { AnimatePresence, motion } from 'motion/react';
import { X, Upload } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import { TextTemplates } from '../text-editor/TextTemplates.jsx';
import { MarginFields } from '../text-editor/MarginFields.jsx';

// Houses the tools that don't need to sit permanently in the composer row:
// templates, import, and the per-page header/margin text fields. Same
// bottom-sheet mechanics as the rest of the mobile shell (spring transition,
// safe-area padding) so it reads as part of one system, not a bolted-on
// extra screen.
export function MobileToolsSheet({ open, onClose }) {
  useEscapeKey(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-40 no-print"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed left-0 right-0 bottom-0 z-50 max-h-[70dvh] flex flex-col bg-white dark:bg-neutral-950 rounded-t-2xl border-t border-accent/15 dark:border-neutral-800 no-print"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent/10 dark:border-neutral-800 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">More tools</span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X size={16} className="text-neutral-400" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-4 py-2 border-b border-accent/10 dark:border-neutral-800 shrink-0">
              <TextTemplates />
              <button
                onClick={() => { useStore.getState().setImportModalOpen(true); onClose(); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Upload size={12} />
                Import
              </button>
            </div>

            <div className="overflow-y-auto min-h-0">
              <MarginFields />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
