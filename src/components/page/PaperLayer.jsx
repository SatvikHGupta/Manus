import { useMemo } from 'react';
import { buildPaperLines } from '../../utils/paper/lines.js';
import { buildTextureDataUrl } from '../../utils/paper/texture.js';

export function PaperLayer({ settings }) {
  const linesUrl = useMemo(() => buildPaperLines(settings), [
    settings.paperType, settings.paperLineColor, settings.lineSpacing,
    settings.pageWidth, settings.pageHeight,
  ]);

  const textureUrl = useMemo(() => {
    if (!settings.paperTextureEnabled) return null;
    return buildTextureDataUrl(settings.paperTextureAmount);
  }, [settings.paperTextureEnabled, settings.paperTextureAmount]);

  return (
    <>
      {linesUrl && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `url("${linesUrl}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${settings.pageWidth}px ${settings.pageHeight}px`,
          pointerEvents: 'none',
        }} />
      )}
      {textureUrl && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: `url("${textureUrl}")`,
          backgroundRepeat: 'repeat',
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }} />
      )}
    </>
  );
}
