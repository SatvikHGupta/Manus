import { useMemo } from 'react';
import { parseTextToLines } from '../../utils/text/parser.js';
import { computeLineNoise }  from '../../utils/noise/line-noise.js';
import { computeWordNoise }  from '../../utils/noise/word-noise.js';
import { computeCharNoise }  from '../../utils/noise/char-noise.js';
import { computeWordOpacity } from '../../utils/ink/flow.js';
import { buildInkFilter }   from '../../utils/ink/filter.js';
import { buildInkShadow }   from '../../utils/ink/shadow.js';
import { applyDerivedInkEffects } from '../../utils/ink/effects.js';
import { buildTextureDataUrl } from '../../utils/paper/texture.js';
import { pxSliderToUnit } from '../../constants/sliders.js';
import { LineRenderer }      from './LineRenderer.jsx';

export function InkLayer({ page, settings: rawSettings }) {
  const settings = useMemo(() => applyDerivedInkEffects(rawSettings), [rawSettings]);

  const lines = useMemo(() => {
    if (!page?.text) return [];
    return parseTextToLines(page.text, settings.fontColor, settings.fontSize);
  }, [page?.text, settings.fontColor, settings.fontSize]);

  const inkFilter = useMemo(() => {
    let f = buildInkFilter(settings);
    if (settings._pencilGrain) {
      f = f === 'none' ? 'grayscale(1)' : `${f} grayscale(1)`;
    }
    return f;
  }, [settings.inkBlurEnabled, settings.inkBlurAmount, settings._pencilGrain]);

  const inkShadow = useMemo(() => {
    let shadow = buildInkShadow(settings, settings.fontColor);
    if (settings._markerBoldPx) {
      const b = settings._markerBoldPx;
      const bold = `${b}px 0 0 ${settings.fontColor}, -${b}px 0 0 ${settings.fontColor}`;
      shadow = shadow === 'none' ? bold : `${shadow}, ${bold}`;
    }
    return shadow;
  }, [settings.inkShadowEnabled, settings.inkShadowAmount, settings.fontColor, settings._markerBoldPx]);

  const grainOverlayUrl = useMemo(
    () => (settings._pencilGrain ? buildTextureDataUrl(settings._pencilGrain) : null),
    [settings._pencilGrain]
  );

  const edgeSmudge = useMemo(() => {
    if (!settings.edgeSmudgeEnabled) return null;
    const unit = pxSliderToUnit(settings.edgeSmudgeAmount);
    return { enabled: true, side: settings.edgeSmudgeSide, blurPx: unit * 3, opacityDrop: unit * 0.5 };
  }, [settings.edgeSmudgeEnabled, settings.edgeSmudgeAmount, settings.edgeSmudgeSide]);

  return (
    <div style={{ position: 'relative', opacity: settings._pencilGrain ? 1 - settings._pencilGrain * 0.25 : 1 }}>
      <div style={{ filter: inkFilter }}>
        {lines.map((tokens, li) => {
          const lineNoise = computeLineNoise(li, settings.noiseSeed, settings);
          // Keying by index alone means inserting/deleting a line in the
          // middle shifts every later line's key, so React ends up patching
          // the wrong DOM node onto the wrong line's content. Folding in a
          // cheap content fingerprint keeps each line's identity stable
          // across re-tokenizing on every keystroke.
          const fingerprint = tokens.map(t => t.text ?? '').join('').slice(0, 24);
          return (
            <LineRenderer
              key={`${li}:${fingerprint}`}
              lineIndex={li}
              tokens={tokens}
              lineNoise={lineNoise}
              settings={settings}
              noiseSeed={settings.noiseSeed}
              inkShadow={inkShadow}
              computeWordNoise={computeWordNoise}
              computeCharNoise={computeCharNoise}
              computeWordOpacity={computeWordOpacity}
              edgeSmudge={edgeSmudge}
            />
          );
        })}
      </div>

      {grainOverlayUrl && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `url(${grainOverlayUrl})`,
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </div>
  );
}
