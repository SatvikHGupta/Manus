import { useMemo } from 'react';

export function MarginOverlays({ settings }) {
  const { paperMarginColor, marginTopText, marginLeftText, marginRightText } = settings;
  const color = paperMarginColor || 'black';

  const left  = useMemo(() => settings.paperMarginLeftEnabled  ? settings.paperMarginLeft  : null, [settings.paperMarginLeftEnabled,  settings.paperMarginLeft]);
  const right = useMemo(() => settings.paperMarginRightEnabled ? settings.paperMarginRight : null, [settings.paperMarginRightEnabled, settings.paperMarginRight]);
  const top   = useMemo(() => settings.paperMarginTopEnabled   ? settings.paperMarginTop   : null, [settings.paperMarginTopEnabled,   settings.paperMarginTop]);

  // Preserve user-typed text exactly - leading/trailing spaces, line breaks - via pre-wrap.
  // Text flows normally (horizontal) and wraps once it reaches the margin's own width.
  const textStyle = {
    fontSize: 11,
    color,
    opacity: 0.8,
    fontFamily: 'var(--font-ui)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    lineHeight: 1.4,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {left  != null && <div style={{ position: 'absolute', top: 0, bottom: 0, left,  width: settings.paperMarginLeftThickness  ?? 2, backgroundColor: color, opacity: 0.85 }} />}
      {right != null && <div style={{ position: 'absolute', top: 0, bottom: 0, right, width: settings.paperMarginRightThickness ?? 2, backgroundColor: color, opacity: 0.85 }} />}
      {top   != null && <div style={{ position: 'absolute', left: 0, right: 0,  top,  height: settings.paperMarginTopThickness  ?? 2, backgroundColor: color, opacity: 0.85 }} />}

      {top != null && marginTopText && (
        <div style={{ ...textStyle, position: 'absolute', left: 8, right: 8, top: top < 22 ? top + 4 : top - 22 }}>
          {marginTopText}
        </div>
      )}
      {left != null && marginLeftText && (
        <div style={{
          ...textStyle, position: 'absolute',
          left: 6, top: (top ?? 0) + 12,
          width: Math.max(left - 12, 20),
        }}>
          {marginLeftText}
        </div>
      )}
      {right != null && marginRightText && (
        <div style={{
          ...textStyle, position: 'absolute',
          right: 6, top: (top ?? 0) + 12,
          width: Math.max(right - 12, 20),
        }}>
          {marginRightText}
        </div>
      )}
    </div>
  );
}
