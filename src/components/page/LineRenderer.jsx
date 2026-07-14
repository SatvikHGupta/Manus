import { useMemo } from 'react';

export function LineRenderer({
  lineIndex, tokens, lineNoise, settings, noiseSeed,
  inkShadow, computeWordNoise, computeCharNoise, computeWordOpacity,
  edgeSmudge,
}) {
  const lineStyle = useMemo(() => ({
    display:      'flex',
    flexWrap:     'wrap',
    // Was 'baseline' - with minHeight taller than the content (which is
    // exactly what happens as lineSpacing grows), baseline alignment lets
    // the browser redistribute the extra space in a way that isn't pinned
    // to a fixed spot, so words visibly drifted down as spacing increased
    // instead of just the gap above them growing. 'flex-end' pins words to
    // a fixed spot at the bottom of their own row regardless of row
    // height, so lineSpacing now only controls the gap between lines.
    alignItems:   'flex-end',
    minHeight:    settings.lineSpacing + (lineNoise.spacingOffset ?? 0),
    marginBottom: Math.max(0, lineNoise.spacingOffset ?? 0),
    transform:    [
      lineNoise.baselineDrift ? `translateY(${lineNoise.baselineDrift}px)` : '',
      lineNoise.slope ? `skewX(${lineNoise.slope}deg)` : '',
    ].filter(Boolean).join(' ') || undefined,
  }), [lineNoise, settings.lineSpacing]);

  const totalWords = useMemo(
    () => tokens.reduce((n, t) => n + (t.type === 'space' ? 0 : 1), 0),
    [tokens]
  );

  let wordIndex = 0;

  return (
    <div style={lineStyle}>
      {tokens.map((token, ti) => {
        if (token.type === 'space') {
          
          const spaceWidth = token.length * settings.wordSpacing;
          return <span key={ti} style={{ display: 'inline-block', width: spaceWidth }} />;
        }

        const wi           = wordIndex++;
        const wn            = computeWordNoise(lineIndex, wi, noiseSeed, settings);
        const opacity       = computeWordOpacity(lineIndex, wi, noiseSeed, settings);
        const baseFontSize  = token.fontSize ?? settings.fontSize;

        const isFirstWord = wi === 0;
        const isLastWord  = wi === totalWords - 1;
        const smudgeHere  = edgeSmudge?.enabled && (
          (isFirstWord && (edgeSmudge.side === 'both' || edgeSmudge.side === 'start')) ||
          (isLastWord  && (edgeSmudge.side === 'both' || edgeSmudge.side === 'end'))
        );

        const wordStyle = {
          fontFamily:    settings.fontFamily,
          fontSize:      baseFontSize + (lineNoise.fontSizeOffset ?? 0),
          color:         token.color,
          letterSpacing: settings.letterSpacing + (wn.letterSpacingExtra ?? 0),
          transform:     `translateY(${wn.baseline + settings.wordVerticalOffset}px) rotate(${wn.rotation}deg)`,
          transformOrigin: 'bottom left',
          marginRight:   Math.max(0, settings.wordSpacing + (wn.spacingExtra ?? 0)),
          opacity:       smudgeHere ? opacity * (1 - edgeSmudge.opacityDrop) : opacity,
          filter:        smudgeHere && edgeSmudge.blurPx > 0 ? `blur(${edgeSmudge.blurPx}px)` : undefined,
          textShadow:    inkShadow !== 'none' ? inkShadow : undefined,
          textDecoration: [
            token.underline      ? 'underline'    : '',
            token.strikethrough  ? 'line-through' : '',
          ].filter(Boolean).join(' ') || undefined,
          display: 'inline-block',
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          maxWidth: '100%',
        };

        if (!settings.perCharNoiseEnabled) {
          return <span key={ti} style={wordStyle}>{token.text}</span>;
        }

        
        return (
          <span key={ti} style={{ ...wordStyle, letterSpacing: 0 }}>
            {[...token.text].map((ch, ci) => {
              const cn = computeCharNoise(lineIndex, wi, ci, noiseSeed, settings);
              return (
                <span key={ci} style={{
                  display:       'inline-block',
                  transform:     `translateY(${cn.translateY}px) rotate(${cn.rotate}deg) scale(${cn.scale})`,
                  transformOrigin: 'bottom center',
                  letterSpacing: settings.letterSpacing + (wn.letterSpacingExtra ?? 0),
                }}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
