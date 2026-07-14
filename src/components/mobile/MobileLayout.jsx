import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/index.js';
import { CanvasColumn } from '../canvas/CanvasColumn.jsx';
import { ControlsSidebar } from '../sidebar/ControlsSidebar.jsx';
import { MobilePageStrip } from './MobilePageStrip.jsx';
import { MobileHeader } from './MobileHeader.jsx';
import { MobileComposer } from './MobileComposer.jsx';
import { MobileToolsSheet } from './MobileToolsSheet.jsx';

// Replaces the old 3-tab (Page/Write/Settings) full-screen-swap layout.
// The canvas is now the one persistent surface - never hidden - with the
// composer docked below it, chat-app style, so typing and watching the
// handwriting render live can happen at the same time. Settings reuse
// TabletLayout's exact slide-in drawer (same component, same animation,
// same tokens) instead of a bespoke mobile settings screen.
export function MobileLayout({ pageRefs }) {
  const settingsOpen    = useStore(s => s.mobileSettingsOpen);
  const setSettingsOpen = useStore(s => s.setMobileSettingsOpen);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <div
      className="flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      style={{ height: '100dvh' }}
    >
      <MobileHeader onMenuClick={() => setSettingsOpen(!settingsOpen)} />

      <div className="flex-1 overflow-hidden min-h-0 relative">
        <AnimatePresence>
          {settingsOpen && (
            <>
              <motion.div
                className="absolute inset-0 bg-black/30 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSettingsOpen(false)}
              />
              <motion.div
                className="absolute left-0 top-0 bottom-0 z-30 flex w-[280px] max-w-[85vw]"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
              >
                <ControlsSidebar forceOpen />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col h-full print-mobile-page">
          <div className="flex-1 overflow-hidden min-h-0">
            <CanvasColumn pageRefs={pageRefs} />
          </div>
          <MobilePageStrip />
          <MobileComposer onOpenTools={() => setToolsOpen(true)} />
        </div>
      </div>

      <MobileToolsSheet open={toolsOpen} onClose={() => setToolsOpen(false)} />
    </div>
  );
}
