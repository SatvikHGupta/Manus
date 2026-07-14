import { AnimatePresence, motion } from 'motion/react';
import { Copy, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

export function AddPageModal() {
  const open       = useStore(s => s.addPageChoiceOpen);
  const setOpen    = useStore(s => s.setAddPageChoiceOpen);
  useEscapeKey(open, () => setOpen(false));
  const addPage    = useStore(s => s.addPage);
  const setNewPageMode = useStore(s => s.setNewPageMode);
  const addToast    = useStore(s => s.addToast);

  const choose = async (mode) => {
    setNewPageMode(mode);
    const result = await addPage(mode);
    if (result?.error) {
      addToast({ type: 'error', message: result.error });
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-5 w-full max-w-sm"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">New page</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X size={14} className="text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => choose('duplicate')}
                className="flex items-start gap-3 p-3 rounded-xl border-2 border-accent/15 dark:border-neutral-700 hover:border-accent/40 dark:hover:border-neutral-500 transition-colors text-left"
              >
                <Copy size={16} className="text-neutral-500 dark:text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Same settings</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">New page inherits font, paper, ink, and margins from the current page</p>
                </div>
              </button>

              <button
                onClick={() => choose('fresh')}
                className="flex items-start gap-3 p-3 rounded-xl border-2 border-accent/15 dark:border-neutral-700 hover:border-accent/40 dark:hover:border-neutral-500 transition-colors text-left"
              >
                <Sparkles size={16} className="text-neutral-500 dark:text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Fresh page</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">New page starts with default settings, independent of this one</p>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 mt-4 pt-3 border-t border-accent/10 dark:border-neutral-800">
              Each page keeps its own independent settings after creation
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
