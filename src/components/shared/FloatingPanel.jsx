import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MARGIN = 8;
const GAP = 4;

// anchorRef: ref to the trigger element this panel hangs off of.
// align: 'end' anchors the panel's right edge to the trigger's right edge
//        (the common "..." menu pattern); 'start' anchors left edges.
export function FloatingPanel({ anchorRef, open, onClose, align = 'end', children, className = '' }) {
  const panelRef = useRef(null);
  const [style, setStyle] = useState({ display: 'none' });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const reposition = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const panelWidth  = panelRef.current?.offsetWidth  ?? 0;
      const panelHeight = panelRef.current?.offsetHeight ?? 0;

      // Prefer opening below the trigger; flip above if there isn't room,
      // so the panel never renders partly off the bottom of the viewport
      // (previously it could overlap the card's own title, or run past the
      // window edge on short viewports).
      const openBelow = anchor.bottom + GAP + panelHeight <= window.innerHeight - MARGIN
        || anchor.bottom + GAP + panelHeight - window.innerHeight < anchor.top - GAP - panelHeight;

      let left = align === 'end' ? anchor.right - panelWidth : anchor.left;
      left = Math.min(Math.max(left, MARGIN), window.innerWidth - panelWidth - MARGIN);

      const top = openBelow
        ? Math.min(anchor.bottom + GAP, window.innerHeight - panelHeight - MARGIN)
        : Math.max(anchor.top - GAP - panelHeight, MARGIN);

      setStyle({ position: 'fixed', top, left, zIndex: 9999 });
    };

    reposition();
    // Recompute if the panel's own measured size changes (first paint has
    // offsetWidth/Height of 0) and if the page scrolls/resizes while open.
    const ro = new ResizeObserver(reposition);
    if (panelRef.current) ro.observe(panelRef.current);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, anchorRef, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      onClick={e => e.stopPropagation()}
      className={`bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
