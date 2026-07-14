import { useCallback } from 'react';
import { useStore } from '../store/index.js';
import { computeFitZoomForBreakpoint } from '../utils/layout/breakpoint.js';

// Pure, listener-free selector hook. The single resize listener that keeps
// `breakpoint` in the store up to date lives in useBreakpointSync(), which is
// mounted exactly once (in App.jsx). This hook is safe to call from as many
// components as needed without multiplying event listeners.
export function useBreakpoint() {
  const bp = useStore(s => s.breakpoint);

  const computeFitZoom = useCallback(
    (pageWidth, pageHeight) => computeFitZoomForBreakpoint(bp, pageWidth, pageHeight),
    [bp]
  );

  return {
    bp,
    isMobile:  bp === 'mobile',
    isTablet:  bp === 'tablet',
    isDesktop: bp === 'desktop',
    computeFitZoom,
  };
}
