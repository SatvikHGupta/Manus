import { useMemo, forwardRef } from 'react';
import { PaperLayer }    from './PaperLayer.jsx';
import { InkLayer }      from './InkLayer.jsx';
import { MarginOverlays } from './MarginOverlays.jsx';
import { buildPaperBackground } from '../../utils/paper/background.js';
import { buildShadowStyle }     from '../../utils/paper/shadow.js';
import { buildPagePadding }     from '../../utils/paper/padding.js';

export const HandwritingPage = forwardRef(function HandwritingPage({ page }, ref) {
  const settings = page.settings;
  const bgStyle      = useMemo(() => buildPaperBackground(settings), [
    settings.paperColor, settings.paperCustomBg, settings.paperAgeEnabled, settings.paperAgeAmount,
  ]);
  const shadowStyle  = useMemo(() => buildShadowStyle(settings.paperShadowEnabled), [settings.paperShadowEnabled]);
  const paddingStyle = useMemo(() => buildPagePadding(settings), [
    settings.paperMarginTopEnabled, settings.paperMarginTop,
    settings.paperMarginLeftEnabled, settings.paperMarginLeft,
    settings.paperMarginRightEnabled, settings.paperMarginRight,
  ]);

  const pageStyle = useMemo(() => ({
    width:    settings.pageWidth,
    height:   settings.pageHeight,   
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    ...shadowStyle,
  }), [settings.pageWidth, settings.pageHeight, shadowStyle]);

  // Background color, custom background image, and the ruled/grid lines all
  // live in one filtered wrapper so the "aged paper" filter has actual
  // content to act on (a bare CSS `filter` on an empty div paints nothing).
  // Margins and ink stay outside so the aging effect only tints the paper,
  // not the handwriting itself.
  const paperVisualStyle = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    backgroundColor: settings.paperColor || 'white',
    filter: bgStyle._ageFilter || 'none',
  }), [settings.paperColor, bgStyle._ageFilter]);

  return (
    <div ref={ref} style={pageStyle} className="hnd-page">
      <div style={paperVisualStyle}>
        { }
        {bgStyle._customBg && (
          <div style={{ position: 'absolute', inset: 0, ...bgStyle._customBg }} />
        )}

        { }
        <PaperLayer settings={settings} />
      </div>

      { }
      <MarginOverlays settings={settings} />

      { }
      <div style={{ position: 'relative', zIndex: 3, ...paddingStyle }}>
        <InkLayer page={page} settings={settings} />
      </div>
    </div>
  );
});
