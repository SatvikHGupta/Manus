import { noisePRNG } from './prng.js';

export function computeWordNoise(lineIndex, wordIndex, noiseSeed, settings) {
  const r0 = noisePRNG(noiseSeed, lineIndex, wordIndex, 3);
  const r1 = noisePRNG(noiseSeed, lineIndex, wordIndex, 4);
  const r2 = noisePRNG(noiseSeed, lineIndex, wordIndex, 5);
  const r3 = noisePRNG(noiseSeed, lineIndex, wordIndex, 6);

  return {
    spacingExtra: settings.wordSpacingNoiseEnabled
      ? (r0 - 0.5) * 2 * settings.wordSpacingNoiseMax
      : 0,
    baseline: settings.wordBaselineEnabled
      ? (r1 - 0.5) * 2 * settings.wordBaselineMax
      : 0,
    rotation: settings.wordRotationEnabled
      ? (r2 - 0.5) * 2 * settings.wordRotationMax
      : 0,
    letterSpacingExtra: settings.letterSpacingNoiseEnabled
      ? (r3 - 0.5) * 2 * settings.letterSpacingNoiseMax
      : 0,
  };
}
