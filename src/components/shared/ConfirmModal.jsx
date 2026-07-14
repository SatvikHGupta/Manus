import { AnimatePresence, motion } from 'motion/react';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  useEscapeKey(open, onCancel);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          >
            {title && <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">{title}</h2>}
            {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 ${danger ? 'bg-red-500 text-white' : 'bg-accent dark:bg-white text-white dark:text-black'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
