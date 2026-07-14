import { useEffect } from 'react';
import { useStore } from '../store/index.js';
import { getBreakpoint } from '../utils/layout/breakpoint.js';

// Mount this exactly once (in App.jsx). It's the single source of truth that
// keeps store.breakpoint in sync with window size; useBreakpoint() elsewhere
// just reads that value, so we only ever have one 'resize' listener.
export function useBreakpointSync() {
  useEffect(() => {
    const apply = () => useStore.getState().setBreakpoint(getBreakpoint(window.innerWidth));
    apply();

    // Debounced so a window drag-resize or a mobile browser's chrome
    // show/hide during scroll doesn't fire setBreakpoint (and therefore
    // useZoom's auto-fit effect) dozens of times a second.
    let timer = null;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(apply, 120);
    };
    window.addEventListener('resize', handler);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handler); };
  }, []);
}
