import { noisePRNG } from './prng.js';

export function computeLineNoise(lineIndex, noiseSeed, settings) {
  const r0 = noisePRNG(noiseSeed, lineIndex, 0, 0);
  const r1 = noisePRNG(noiseSeed, lineIndex, 0, 1);
  const r2 = noisePRNG(noiseSeed, lineIndex, 0, 2);
  const r3 = noisePRNG(noiseSeed, lineIndex, 0, 3);

  return {
    
    spacingOffset: settings.lineSpacingNoiseEnabled
      ? (r0 - 0.5) * 2 * settings.lineSpacingNoiseMax
      : 0,
    
    slope: settings.lineSlopeEnabled
      ? (r1 - 0.5) * 2 * settings.lineSlopeMax
      : 0,
    
    fontSizeOffset: settings.lineFontNoiseEnabled
      ? (r2 - 0.5) * 2 * settings.lineFontNoiseMax
      : 0,
    
    baselineDrift: settings.baselineDriftEnabled
      ? (r3 - 0.5) * 2 * settings.baselineDriftMax
      : 0,
  };
}
