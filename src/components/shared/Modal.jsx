import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEscapeKey(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90dvh]`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-accent/10 dark:border-neutral-800 shrink-0">
                <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X size={14} className="text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
