import { noisePRNG } from './prng.js';

export function computeCharNoise(lineIndex, wordIndex, charIndex, noiseSeed, settings) {
  if (!settings.perCharNoiseEnabled || settings.perCharNoiseMax <= 0) {
    return { rotate: 0, translateY: 0, scale: 1 };
  }
  const r0 = noisePRNG(noiseSeed, lineIndex * 100000 + wordIndex, charIndex, 7);
  const r1 = noisePRNG(noiseSeed, lineIndex * 100000 + wordIndex, charIndex, 8);
  const r2 = noisePRNG(noiseSeed, lineIndex * 100000 + wordIndex, charIndex, 9);
  const m  = settings.perCharNoiseMax;

  return {
    rotate:     (r0 - 0.5) * 2 * m * 3,   
    translateY: (r1 - 0.5) * 2 * m * 2,   
    scale:      1 + (r2 - 0.5) * m * 0.1, 
  };
}
