import { AnimatePresence, motion } from 'motion/react';
import { PencilMark } from './Logo.jsx';

export function AppLoader({ ready, message, percent }) {
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 }}
            >
              <PencilMark size={40} className="text-neutral-800 dark:text-neutral-200" />
            </motion.div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-widest uppercase">
              Manus
            </p>

            {typeof percent === 'number' && (
              <div className="w-40 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-accent dark:bg-neutral-300"
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            )}
            {message && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{message}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
