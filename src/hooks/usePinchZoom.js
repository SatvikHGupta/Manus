import { useEffect, useRef } from 'react';
import { useStore } from '../store/index.js';

export function usePinchZoom(targetRef) {
  const setZoom   = useStore(s => s.setZoom);
  const zoomRef   = useRef(useStore.getState().zoom);
  const startDist = useRef(null);
  const startZoom = useRef(null);

  useEffect(() => {
    return useStore.subscribe(s => { zoomRef.current = s.zoom; });
  }, []);

  useEffect(() => {
    const el = targetRef?.current ?? window;

    const dist = (a, b) =>
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = (e) => {
      if (e.touches.length !== 2) return;
      startDist.current = dist(e.touches[0], e.touches[1]);
      startZoom.current = zoomRef.current;
    };

    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || startDist.current === null) return;
      e.preventDefault();
      const currentDist = dist(e.touches[0], e.touches[1]);
      const scale = currentDist / startDist.current;
      const next  = Math.min(Math.max(startZoom.current * scale, 0.25), 2.0);
      setZoom(next);
    };

    const onTouchEnd = () => {
      startDist.current = null;
      startZoom.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [targetRef, setZoom]);
}
