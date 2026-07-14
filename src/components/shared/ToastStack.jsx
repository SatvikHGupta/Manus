import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../../store/index.js';

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertCircle };
const COLORS = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-neutral-800 dark:bg-neutral-100',
  warning: 'bg-amber-500',
};

export function ToastStack() {
  const toasts     = useStore(s => s.activeToasts);
  const removeToast = useStore(s => s.removeToast);

  return (
    <div className="fixed right-4 sm:right-6 bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:bottom-6 z-[200] flex flex-col gap-2 pointer-events-none no-print">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              exit={{    opacity: 0, y: 10, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${COLORS[toast.type] || COLORS.info}`}
            >
              <Icon size={15} />
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-1 opacity-70 hover:opacity-100">
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
