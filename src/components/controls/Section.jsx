import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/index.js';

export function Section({ id, title, icon: Icon, children }) {
  const open = useStore(s => s.sectionOpen[id] ?? false);
  const setSectionOpen = useStore(s => s.setSectionOpen);

  return (
    <div className="border-b border-accent/10 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setSectionOpen(id, !open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-neutral-400" />}
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
