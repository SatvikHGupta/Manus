import { useStore } from '../../store/index.js';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar }          from './Navbar.jsx';
import { ControlsSidebar } from '../sidebar/ControlsSidebar.jsx';
import { CanvasColumn }    from '../canvas/CanvasColumn.jsx';
import { TextEditor }      from '../text-editor/TextEditor.jsx';

export function TabletLayout({ pageRefs }) {
  const sidebarOpen    = useStore(s => s.sidebarOpen);
  const setSidebarOpen = useStore(s => s.setSidebarOpen);
  const textPanelOpen  = useStore(s => s.textPanelOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="absolute inset-0 bg-black/30 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                className="absolute left-0 top-0 bottom-0 z-30 flex"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
              >
                <ControlsSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex flex-1 overflow-hidden min-h-0">
          <CanvasColumn pageRefs={pageRefs} />

          <AnimatePresence>
            {textPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="flex flex-col shrink-0 border-l border-accent/15 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden no-print"
              >
                <TextEditor />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
