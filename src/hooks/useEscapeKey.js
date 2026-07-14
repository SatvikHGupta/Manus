import { useEffect } from 'react';

// One shared implementation for "Escape closes this overlay" - previously
// CommandPalette and ConfirmModal each had their own copy of this same
// keydown listener, which was harmless but meant two separate sources of
// truth for something that should behave identically everywhere.
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (e.key === 'Escape') onEscape?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onEscape]);
}
