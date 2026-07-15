import { useStore } from '../../store/index.js';
import { AnimatePresence, motion } from 'motion/react';
import { FontSection }    from './tabs/FontSection.jsx';
import { LineSection }    from './tabs/LineSection.jsx';
import { WordSection }    from './tabs/WordSection.jsx';
import { LetterSection }  from './tabs/LetterSection.jsx';
import { InkSection }     from './tabs/InkSection.jsx';
import { PaperSection }   from './tabs/PaperSection.jsx';
import { MarginsSection } from './tabs/MarginsSection.jsx';
import { SidebarTabs }    from './SidebarTabs.jsx';
import { ErrorBoundary }  from '../shared/ErrorBoundary.jsx';
import { ConfirmModal }   from '../shared/ConfirmModal.jsx';
import { useState }       from 'react';
import { RotateCcw }      from 'lucide-react';

// Map from sidebarTab value to which sections to show
const TAB_SECTIONS = {
  font:  ['font'],
  line:  ['line', 'letter'],
  word:  ['word'],
  paper: ['paper', 'margins'],
  ink:   ['ink'],
};

function SidebarContent({ onResetClick }) {
  const sidebarTab = useStore(s => s.sidebarTab);
  const visible    = TAB_SECTIONS[sidebarTab] ?? ['font'];

  return (
    <div className="flex flex-col h-full">
      <SidebarTabs />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {visible.includes('font')    && <ErrorBoundary><FontSection    /></ErrorBoundary>}
        {visible.includes('line')    && <ErrorBoundary><LineSection    /></ErrorBoundary>}
        {visible.includes('letter')  && <ErrorBoundary><LetterSection  /></ErrorBoundary>}
        {visible.includes('word')    && <ErrorBoundary><WordSection    /></ErrorBoundary>}
        {visible.includes('ink')     && <ErrorBoundary><InkSection     /></ErrorBoundary>}
        {visible.includes('paper')   && <ErrorBoundary><PaperSection   /></ErrorBoundary>}
        {visible.includes('margins') && <ErrorBoundary><MarginsSection /></ErrorBoundary>}
      </div>
      <div className="p-4 border-t border-accent/10 dark:border-neutral-800 shrink-0">
        <button
          onClick={onResetClick}
          className="flex items-center gap-2 w-full text-xs text-neutral-400 hover:text-red-500 transition-colors py-1"
        >
          <RotateCcw size={12} />
          Reset this page's settings
        </button>
      </div>
    </div>
  );
}

export function ControlsSidebar({ forceOpen = false }) {
  const sidebarOpen   = useStore(s => s.sidebarOpen);
  const resetSettings = useStore(s => s.resetSettings);
  const [confirmReset, setConfirmReset] = useState(false);

  const content = (
    <>
      <SidebarContent onResetClick={() => setConfirmReset(true)} />
      <ConfirmModal
        open={confirmReset}
        title="Reset this page's settings?"
        message="This will restore this page's font, ink, paper, and noise settings to their defaults. Other pages are not affected. This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={() => { resetSettings(); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );

  if (forceOpen) {
    return (
      <div data-tour="sidebar" className="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-neutral-950 no-print">
        {content}
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            data-tour="sidebar"
            className="shrink-0 h-full bg-white dark:bg-neutral-950 border-r border-accent/15 dark:border-neutral-800 overflow-hidden flex flex-col no-print"
          >
            {content}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
