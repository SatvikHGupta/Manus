import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { KEYBOARD_SHORTCUTS } from '../../constants/keyboard.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

const TECH = ['React 19', 'Vite 8', 'Tailwind 4', 'Zustand 5', 'html-to-image', 'jsPDF', 'motion/react', 'dnd-kit', 'idb', 'cmdk'];

export function HelpModal() {
  const open    = useStore(s => s.helpModalOpen);
  const setOpen = useStore(s => s.setHelpModalOpen);
  useEscapeKey(open, () => setOpen(false));
  const setTermsOpen = useStore(s => s.setTermsOpen);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[85dvh] overflow-hidden flex flex-col"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">Help</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X size={16} className="text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            <div className="flex flex-col gap-5 text-sm">
              <section>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                  Type or paste your text in the right panel. It renders live as handwriting on the page.
                  Use color tags like <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">&lt;r&gt;text&lt;/r&gt;</code> to change ink color.
                  Export as PNG, PDF, SVG, or ZIP when done.
                </p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">Keyboard shortcuts</h3>
                <div className="flex flex-col gap-1.5">
                  {Object.values(KEYBOARD_SHORTCUTS).map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{s.desc}</span>
                      <kbd className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-accent/15 dark:border-neutral-700 font-mono">{s.label}</kbd>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">Built with</h3>
                <div className="flex flex-wrap gap-1.5">
                  {TECH.map(t => (
                    <span key={t} className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </section>

              <section className="text-xs text-neutral-400 border-t border-accent/10 dark:border-neutral-800 pt-4 flex items-center justify-between">
                <p>Manus v{__APP_VERSION__} · <a href="https://github.com/SatvikHGupta" className="underline hover:text-neutral-600" target="_blank" rel="noopener noreferrer">Satvik Hemant Gupta</a></p>
                <button
                  onClick={() => { setOpen(false); setTermsOpen(true); }}
                  className="text-neutral-400 hover:text-neutral-600 underline"
                >
                  Terms
                </button>
              </section>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
