import { Moon, Sun, HelpCircle, Download, Menu, PanelRight, Home, Search } from 'lucide-react';
import { useStore, useCurrentNotebook } from '../../store/index.js';
import { useBreakpoint } from '../../hooks/useBreakpoint.js';
import { SaveIndicator } from '../shared/SaveIndicator.jsx';
import { Logo } from '../shared/Logo.jsx';
import { Tooltip } from '../shared/Tooltip.jsx';
import { InlineNotebookName } from '../shared/InlineNotebookName.jsx';
import { AccountButton } from './AccountButton.jsx';

export function Navbar({ onMenuClick }) {
  const darkMode              = useStore(s => s.darkMode);
  const toggleDarkMode        = useStore(s => s.toggleDarkMode);
  const setExportModalOpen    = useStore(s => s.setExportModalOpen);
  const setHelpModalOpen      = useStore(s => s.setHelpModalOpen);
  const setCommandPaletteOpen = useStore(s => s.setCommandPaletteOpen);
  const textPanelOpen         = useStore(s => s.textPanelOpen);
  const setTextPanelOpen      = useStore(s => s.setTextPanelOpen);
  const currentNotebook       = useCurrentNotebook();
  // Navbar only ever renders for tablet/desktop (see MainLayout.jsx) - using
  // the app's own breakpoint here (instead of Tailwind's independent sm/md
  // scale) keeps "is this a smaller screen" as a single source of truth, so
  // this row's controls never end up hidden on a width band where they'd
  // otherwise be unreachable.
  const { isTablet } = useBreakpoint();

  return (
    <header className="h-12 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 border-b border-accent/15 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0 z-40 no-print">
      <div className="flex items-center gap-3 min-w-0 justify-self-start">
        <button
          onClick={onMenuClick}
          title="Toggle controls panel"
          className="p-1.5 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>
        <Logo size={18} onClick={() => { window.location.hash = '#/home'; }} />
        <Tooltip label="Home" side="bottom">
          <button
            onClick={() => { window.location.hash = '#/dashboard'; }}
            className="p-1.5 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors text-neutral-400 shrink-0"
          >
            <Home size={15} />
          </button>
        </Tooltip>
        {currentNotebook && (
          <InlineNotebookName notebook={currentNotebook} className="text-xs text-neutral-400 min-w-0" />
        )}
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        title="Search commands"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors justify-self-center shrink-0"
      >
        {isTablet ? (
          <Search size={14} />
        ) : (
          <>
            Search commands
            <kbd className="text-[10px] bg-white dark:bg-neutral-900 px-1 py-0.5 rounded border border-accent/15 dark:border-neutral-700">Cmd K</kbd>
          </>
        )}
      </button>

      <div className="flex items-center gap-1 justify-self-end">
        <SaveIndicator />
        <button
          onClick={() => setExportModalOpen(true)}
          data-tour="export-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-85 transition-opacity ml-2"
        >
          <Download size={13} />
          Export
        </button>
        <Tooltip label={darkMode ? 'Light mode' : 'Dark mode'} shortcut="Ctrl Shift D" side="bottom">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>
        <Tooltip label="Help & shortcuts" side="bottom">
          <button onClick={() => setHelpModalOpen(true)} className="p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors">
            <HelpCircle size={16} />
          </button>
        </Tooltip>
        <Tooltip label={textPanelOpen ? 'Hide text panel' : 'Show text panel'} side="bottom">
          <button
            onClick={() => setTextPanelOpen(!textPanelOpen)}
            className={`flex p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors ${textPanelOpen ? '' : 'text-neutral-400'}`}
          >
            <PanelRight size={16} />
          </button>
        </Tooltip>
        <AccountButton />
      </div>
    </header>
  );
}
