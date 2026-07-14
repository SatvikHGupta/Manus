import { useEffect, useRef } from 'react';
import { useStore } from '../store/index.js';

// Side-effecting half of zoom handling: the global Ctrl/Cmd+wheel listener
// and the "auto-fit when the breakpoint tier changes" effect. This hook
// should be mounted exactly ONCE (in App.jsx) so its listeners aren't
// duplicated. Components that just need to read/adjust zoom (CanvasColumn,
// PageZoomControls) should read `zoom`/`zoomIn`/`zoomOut`/`resetZoom`
// directly from the store instead of calling this hook.
export function useZoom() {
  const zoom       = useStore(s => s.zoom);
  const setZoom    = useStore(s => s.setZoom);
  const zoomIn     = useStore(s => s.zoomIn);
  const zoomOut    = useStore(s => s.zoomOut);
  const resetZoom  = useStore(s => s.resetZoom);
  const breakpoint = useStore(s => s.breakpoint);

  // zoom is persisted to localStorage, but this effect also fires once on
  // mount (effects always run after the first render). Auto-fitting there
  // too meant a mobile/tablet user's last zoom level from their previous
  // session never actually took effect - it was immediately overwritten by
  // the "ideal" fit value before they could see it. Only force a recompute
  // on a genuine breakpoint change *during* the session (resizing across a
  // tier boundary, rotating a tablet, etc.), where recalculating really is
  // needed; respect whatever was just rehydrated from storage on mount.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    useStore.getState().autoFitZoomForBreakpoint();
  }, [breakpoint]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const current = useStore.getState().zoom;
      useStore.getState().setZoom(current + delta);
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, []);

  return { zoom, setZoom, zoomIn, zoomOut, resetZoom };
}
