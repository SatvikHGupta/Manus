import { useMemo } from 'react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../store/index.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import {
  Download, Moon, Sun, HelpCircle, Tags,
  Plus, RotateCcw, PenLine, FileText, Search, Undo2, Redo2, Upload,
} from 'lucide-react';

export function CommandPalette() {
  const open    = useStore(s => s.commandPaletteOpen);
  const setOpen = useStore(s => s.setCommandPaletteOpen);
  const darkMode = useStore(s => s.darkMode);

  const toggleDarkMode        = useStore(s => s.toggleDarkMode);
  const setExportModalOpen    = useStore(s => s.setExportModalOpen);
  const setHelpModalOpen      = useStore(s => s.setHelpModalOpen);
  const setColorTagsModalOpen = useStore(s => s.setColorTagsModalOpen);
  const setFontPickerOpen     = useStore(s => s.setFontPickerOpen);
  const setAddPageChoiceOpen  = useStore(s => s.setAddPageChoiceOpen);
  const regenerateNoise       = useStore(s => s.regenerateNoise);
  const setTermsOpen          = useStore(s => s.setTermsOpen);
  const setFindReplaceOpen    = useStore(s => s.setFindReplaceOpen);
  const setImportModalOpen    = useStore(s => s.setImportModalOpen);
  const undo                  = useStore(s => s.undo);
  const redo                  = useStore(s => s.redo);

  useEscapeKey(open, () => setOpen(false));

  const commands = useMemo(() => [
    { id: 'export',     label: 'Export...',              icon: Download,   action: () => { setExportModalOpen(true);    setOpen(false); } },
    { id: 'font',       label: 'Change font...',          icon: PenLine,    action: () => { setFontPickerOpen(true);     setOpen(false); } },
    { id: 'find-replace', label: 'Find & replace...',     icon: Search,     action: () => { setFindReplaceOpen(true);    setOpen(false); } },
    { id: 'import',     label: 'Import .txt/.docx...',    icon: Upload,     action: () => { setImportModalOpen(true);    setOpen(false); } },
    { id: 'undo',       label: 'Undo',                    icon: Undo2,      action: () => { undo();                      setOpen(false); } },
    { id: 'redo',       label: 'Redo',                    icon: Redo2,      action: () => { redo();                      setOpen(false); } },
    { id: 'color-tags', label: 'View color tags',         icon: Tags,       action: () => { setColorTagsModalOpen(true); setOpen(false); } },
    { id: 'new-page',   label: 'Add new page',            icon: Plus,       action: () => { setAddPageChoiceOpen(true);  setOpen(false); } },
    { id: 'dark-mode',  label: darkMode ? 'Light mode' : 'Dark mode', icon: darkMode ? Sun : Moon, action: () => { toggleDarkMode(); setOpen(false); } },
    { id: 'regenerate', label: 'Regenerate noise pattern',icon: RotateCcw,  action: () => { regenerateNoise();           setOpen(false); } },
    { id: 'help',       label: 'Help',                    icon: HelpCircle, action: () => { setHelpModalOpen(true);      setOpen(false); } },
    { id: 'terms',      label: 'Terms & Conditions',      icon: FileText,   action: () => { setTermsOpen(true);          setOpen(false); } },
  ], [darkMode]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[15dvh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.94, opacity: 0, y: -12 }}
            animate={{ scale: 1,    opacity: 1, y: 0   }}
            exit={{    scale: 0.94, opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            <Command
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-accent/15 dark:border-neutral-700"
              label="Command palette"
            >
              <Command.Input
                placeholder="Type a command..."
                className="w-full px-4 py-3.5 text-sm outline-none bg-transparent border-b border-accent/10 dark:border-neutral-800 placeholder:text-neutral-400"
              />
              <Command.List className="max-h-72 overflow-y-auto p-1.5">
                <Command.Empty className="py-8 text-center text-sm text-neutral-400">
                  No commands found.
                </Command.Empty>
                {commands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.label}
                      onSelect={cmd.action}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800"
                    >
                      <Icon size={15} className="text-neutral-400 shrink-0" />
                      {cmd.label}
                    </Command.Item>
                  );
                })}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
