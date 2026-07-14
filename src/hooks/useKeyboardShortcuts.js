import { useEffect } from 'react';
import { useStore } from '../store/index.js';
import { KEYBOARD_SHORTCUTS } from '../constants/keyboard.js';
import { MAX_PAGES } from '../constants/limits.js';

// Fix for bug #7: previously this handler hardcoded every key combo
// separately, while KEYBOARD_SHORTCUTS (also shown in HelpModal) was
// imported and never actually used - two sources of truth that could drift
// apart. This builds the matcher directly from KEYBOARD_SHORTCUTS instead.
function matchesShortcut(e, shortcut) {
  const ctrl  = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;
  const alt   = e.altKey;
  const mods       = shortcut.mod.split('+');
  const needsCtrl  = mods.includes('ctrl');
  const needsShift = mods.includes('shift');
  const needsAlt   = mods.includes('alt');
  if (needsCtrl !== ctrl || needsShift !== shift || needsAlt !== alt) return false;

  const expectedKey = needsShift && /^[a-z]$/.test(shortcut.key)
    ? shortcut.key.toUpperCase()
    : shortcut.key;
  return e.key === expectedKey;
}

export function useKeyboardShortcuts() {
  const store = useStore;

  useEffect(() => {
    const ACTIONS = {
      // Toggle (not force-open) so the same shortcut also closes the palette -
      // fixes bug #37 together with removing CommandPalette's own duplicate listener.
      commandPalette: () => {
        const cur = store.getState().commandPaletteOpen;
        store.getState().setCommandPaletteOpen(!cur);
      },
      export: () => store.getState().setExportModalOpen(true),
      newPage: () => {
        const { pages, addToast } = store.getState();
        if (pages.length >= MAX_PAGES) {
          addToast({ type: 'error', message: `You've reached the ${MAX_PAGES}-page limit.` });
          return;
        }
        store.getState().setAddPageChoiceOpen(true);
      },
      resetZoom: () => store.getState().resetZoom(),
      zoomIn:    () => store.getState().zoomIn(),
      zoomOut:   () => store.getState().zoomOut(),
      darkMode:  () => store.getState().toggleDarkMode(),
      undo:      () => store.getState().undo(),
      redo:      () => store.getState().redo(),
      findReplace: () => store.getState().setFindReplaceOpen(true),
    };

    // Undo/redo are the two shortcuts that must never hijack native text
    // editing - Ctrl+Z/Ctrl+Shift+Z while typing should undo the last
    // keystroke in the textarea, not the page's own history stack. Every
    // other shortcut here (export, zoom, dark mode, etc.) is safe to fire
    // regardless of focus.
    const isTypingTarget = (target) => {
      const tag = target?.tagName;
      return tag === 'TEXTAREA' || tag === 'INPUT' || target?.isContentEditable;
    };

    const handler = (e) => {
      for (const [id, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
        if (!matchesShortcut(e, shortcut) || !ACTIONS[id]) continue;
        if ((id === 'undo' || id === 'redo') && isTypingTarget(e.target)) return;
        e.preventDefault();
        ACTIONS[id]();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
