import { noisePRNG } from '../noise/prng.js';

export function computeWordOpacity(lineIndex, wordIndex, noiseSeed, settings) {
  if (!settings.inkFlowEnabled || settings.inkFlowAmount <= 0) return 1;
  const rand = noisePRNG(noiseSeed, lineIndex, wordIndex, 10);
  return Math.max(0.4, 1 - settings.inkFlowAmount * rand);
}
