import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, MoreVertical, Search, HelpCircle, Download, Home, Menu } from 'lucide-react';
import { useStore, useCurrentNotebook } from '../../store/index.js';
import { SaveIndicator } from '../shared/SaveIndicator.jsx';
import { Logo } from '../shared/Logo.jsx';
import { InlineNotebookName } from '../shared/InlineNotebookName.jsx';
import { AccountButton } from '../layout/AccountButton.jsx';

// Mobile mirror of the desktop Navbar: same features (dashboard link,
// notebook name, save status, export, search, help, account, settings),
// just low-frequency ones (search/help/theme) tucked behind a kebab menu
// instead of sitting in the row, since there isn't width for all of it.
export function MobileHeader({ onMenuClick }) {
  const darkMode              = useStore(s => s.darkMode);
  const toggleDarkMode        = useStore(s => s.toggleDarkMode);
  const setExportModalOpen    = useStore(s => s.setExportModalOpen);
  const setHelpModalOpen      = useStore(s => s.setHelpModalOpen);
  const setCommandPaletteOpen = useStore(s => s.setCommandPaletteOpen);
  const currentNotebook       = useCurrentNotebook();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  return (
    <header className="h-11 shrink-0 flex items-center justify-between gap-2 px-3 bg-white dark:bg-neutral-950 border-b border-accent/10 dark:border-neutral-800 no-print">
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={onMenuClick}
          title="Page settings"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 shrink-0"
        >
          <Menu size={16} />
        </button>
        <button
          onClick={() => { window.location.hash = '#/dashboard'; }}
          title="Home"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 shrink-0"
        >
          <Home size={16} />
        </button>
        <Logo size={15} onClick={() => { window.location.hash = '#/home'; }} />
        {currentNotebook && (
          <InlineNotebookName notebook={currentNotebook} className="text-xs text-neutral-400" />
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <SaveIndicator />

        <button
          onClick={() => setExportModalOpen(true)}
          data-tour="export-btn"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent dark:bg-white text-white dark:text-black text-xs font-medium ml-1"
        >
          <Download size={12} />
          Export
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            title="More options"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-[170px] text-xs">
              <button
                onClick={() => { setMenuOpen(false); setCommandPaletteOpen(true); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left text-neutral-700 dark:text-neutral-300"
              >
                <Search size={13} /> Search commands
              </button>
              <button
                onClick={() => { setMenuOpen(false); setHelpModalOpen(true); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left text-neutral-700 dark:text-neutral-300 border-t border-accent/10 dark:border-neutral-800"
              >
                <HelpCircle size={13} /> Help & shortcuts
              </button>
              <button
                onClick={() => { setMenuOpen(false); toggleDarkMode(); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left text-neutral-700 dark:text-neutral-300 border-t border-accent/10 dark:border-neutral-800"
              >
                {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          )}
        </div>

        <AccountButton />
      </div>
    </header>
  );
}
