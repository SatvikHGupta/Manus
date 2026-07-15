import { useSaveIndicator } from '../../hooks/useSaveIndicator.js';
import { Cloud, CloudOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Tooltip } from './Tooltip.jsx';
import { Spinner } from './Spinner.jsx';

export function SaveIndicator() {
  const status = useSaveIndicator();

  const map = {
    saving: { icon: null,     label: 'Saving...',  cls: 'text-neutral-400' },
    saved:  { icon: Cloud,    label: 'Saved',       cls: 'text-green-500'  },
    error:  { icon: CloudOff, label: 'Save error',  cls: 'text-red-500'    },
  };

  const entry = map[status];
  if (!entry) return null;

  const Icon = entry.icon;
  return (
    <Tooltip label={entry.label} side="bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          className={`flex items-center justify-center w-7 h-7 rounded-lg ${entry.cls}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {status === 'saving' ? <Spinner size={14} className={entry.cls} /> : <Icon size={14} />}
        </motion.span>
      </AnimatePresence>
    </Tooltip>
  );
}
