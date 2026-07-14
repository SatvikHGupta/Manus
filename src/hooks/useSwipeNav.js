import { useCallback, useRef } from 'react';

export function useSwipeNav({ onSwipeLeft, onSwipeRight, velocityThreshold = 450, distThreshold = 60 }) {
  const start = useRef(null);

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    start.current = { x: e.touches[0].clientX, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!start.current) return;
    const dx = e.changedTouches[0].clientX - start.current.x;
    const dt = Date.now() - start.current.t;
    const vx = Math.abs(dx) / dt * 1000;
    start.current = null;

    if (Math.abs(dx) < distThreshold && vx < velocityThreshold) return;

    if (dx < 0) onSwipeLeft?.();
    else        onSwipeRight?.();
  }, [onSwipeLeft, onSwipeRight, velocityThreshold, distThreshold]);

  return { onTouchStart, onTouchEnd };
}
