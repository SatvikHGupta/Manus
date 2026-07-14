import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/index.js';
import { PenLine, Type, Settings2 } from 'lucide-react';
import { CanvasColumn }    from '../canvas/CanvasColumn.jsx';
import { TextEditor }      from '../text-editor/TextEditor.jsx';
import { ControlsSidebar } from '../sidebar/ControlsSidebar.jsx';
import { MobilePageStrip } from './MobilePageStrip.jsx';
import { MobileHeader }    from './MobileHeader.jsx';

const TABS = [
  { id: 'page',     icon: PenLine,   label: 'Page'     },
  { id: 'write',    icon: Type,      label: 'Write'    },
  { id: 'settings', icon: Settings2, label: 'Settings' },
];

export function ClassicMobileLayout({ pageRefs }) {
  const activeTab = useStore(s => s.mobileActiveTab ?? 'page');
  const setTab    = useStore(s => s.setMobileActiveTab);

  const tabIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div
      className="flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900"
      style={{ height: '100dvh' }}
    >
      <MobileHeader />

      <div className="flex-1 overflow-hidden min-h-0 relative">
        <div
          className="absolute inset-0 flex flex-col h-full print-mobile-page"
          style={{ display: activeTab === 'page' ? 'flex' : 'none' }}
        >
          <div className="flex-1 overflow-hidden min-h-0">
            <CanvasColumn pageRefs={pageRefs} />
          </div>
          <MobilePageStrip />
        </div>

        <AnimatePresence initial={false}>
          {activeTab === 'write' && (
            <motion.div
              key="write"
              className="absolute inset-0 no-print"
              initial={{ x: `${(TABS.findIndex(t => t.id === 'write') - tabIndex) * 100}%`, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: `${(tabIndex - TABS.findIndex(t => t.id === 'write')) * 100}%`, opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
            >
              <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
                <div className="px-4 py-2 border-b border-accent/10 dark:border-neutral-800 shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Text input</span>
                </div>
                <div className="flex-1 overflow-hidden min-h-0">
                  <TextEditor />
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              className="absolute inset-0 no-print"
              initial={{ x: `${(TABS.findIndex(t => t.id === 'settings') - tabIndex) * 100}%`, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: `${(tabIndex - TABS.findIndex(t => t.id === 'settings')) * 100}%`, opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
            >
              <div className="flex flex-col h-full bg-white dark:bg-neutral-950 overflow-y-auto">
                <div className="px-4 py-2 border-b border-accent/10 dark:border-neutral-800 shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Settings</span>
                </div>
                <ControlsSidebar forceOpen />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav
        className="shrink-0 flex items-stretch bg-white dark:bg-neutral-950 border-t border-accent/15 dark:border-neutral-800 relative no-print"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(tab => {
          const Icon   = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}
            >
              {active && (
                <motion.div
                  layoutId="classic-tab-indicator"
                  className="absolute top-0 h-0.5 w-10 bg-accent dark:bg-white rounded-b-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <Icon size={18} />
              <span className="text-[9px] leading-none font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
