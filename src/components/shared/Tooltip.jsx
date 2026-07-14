import { useRef, useState, useLayoutEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

const GAP = 6;
const MARGIN = 8;
const LONG_PRESS_MS = 500;
const TOUCH_AUTO_HIDE_MS = 1500;

export function Tooltip({ children, label, shortcut, side = 'bottom' }) {
  const [visible, setVisible] = useState(false);
  const [rect, setRect]       = useState(null);
  const [resolvedSide, setResolvedSide] = useState(side);
  const [tipSize, setTipSize] = useState({ width: 0, height: 0 });
  const triggerRef = useRef(null);
  const tipRef      = useRef(null);
  const longPressTimer = useRef(null);

  const show = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setVisible(true);
  };
  const hide = () => setVisible(false);

  // Touch devices have no hover concept, so the label/shortcut text was
  // previously unreachable on phones/tablets for any icon-only button. A
  // long-press reveals it without interfering with the normal tap-to-click
  // behavior (touchend still fires the underlying button's click as usual).
  const onTouchStart = () => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(show, LONG_PRESS_MS);
  };
  const onTouchMove = () => clearTimeout(longPressTimer.current);
  const onTouchEnd = () => {
    clearTimeout(longPressTimer.current);
    if (visible) setTimeout(hide, TOUCH_AUTO_HIDE_MS);
  };

  // After the tooltip mounts (so we know its real size), flip side if it
  // would overflow the viewport, and keep it fully on-screen either way.
  useLayoutEffect(() => {
    if (!visible || !rect || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    setTipSize({ width: tip.width, height: tip.height });
    let next = side;

    if (side === 'bottom' && rect.bottom + GAP + tip.height > window.innerHeight - MARGIN) next = 'top';
    if (side === 'top' && rect.top - GAP - tip.height < MARGIN) next = 'bottom';
    if (side === 'right' && rect.right + GAP + tip.width > window.innerWidth - MARGIN) next = 'left';
    if (side === 'left' && rect.left - GAP - tip.width < MARGIN) next = 'right';

    if (next !== resolvedSide) setResolvedSide(next);
  }, [visible, rect, side, resolvedSide]);

  useLayoutEffect(() => { if (!visible) { setResolvedSide(side); setTipSize({ width: 0, height: 0 }); } }, [visible, side]);

  // The bubble below only ever appears on hover/focus/long-press, so it was
  // the *only* place an icon-only button's name lived - screen readers got
  // nothing. Give the trigger a real accessible name from `label` (unless it
  // already sets its own aria-label) and mark the visual bubble as
  // decorative so it isn't double-announced.
  const trigger = cloneElement(children, {
    'aria-label': children.props['aria-label'] ?? label,
  });

  const getStyle = () => {
    if (!rect) return { display: 'none' };
    const style = { position: 'fixed', zIndex: 9999 };

    if (resolvedSide === 'bottom' || resolvedSide === 'top') {
      let left = rect.left + rect.width / 2;
      const halfW = tipSize.width / 2;
      left = Math.min(Math.max(left, MARGIN + halfW), window.innerWidth - MARGIN - halfW);
      style.left = left;
      style.transform = 'translateX(-50%)';
      if (resolvedSide === 'bottom') style.top = rect.bottom + GAP;
      else style.bottom = window.innerHeight - rect.top + GAP;
    } else {
      let top = rect.top + rect.height / 2;
      const halfH = tipSize.height / 2;
      top = Math.min(Math.max(top, MARGIN + halfH), window.innerHeight - MARGIN - halfH);
      style.top = top;
      style.transform = 'translateY(-50%)';
      if (resolvedSide === 'right') style.left = rect.right + GAP;
      else style.right = window.innerWidth - rect.left + GAP;
    }
    return style;
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {trigger}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={tipRef}
              style={getStyle()}
              aria-hidden="true"
              className="pointer-events-none whitespace-nowrap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <div className="flex items-center gap-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg">
                <span>{label}</span>
                {shortcut && (
                  <kbd className="text-[10px] opacity-60 font-mono">{shortcut}</kbd>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
