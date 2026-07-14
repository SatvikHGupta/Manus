export function noisePRNG(pageSeed, lineIndex, wordIndex, propIndex) {
  const combined = (pageSeed * 2654435761 + lineIndex * 40503 + wordIndex * 12289 + propIndex) >>> 0;
  let x = combined + 0x9E3779B9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 0x100000000;
}
