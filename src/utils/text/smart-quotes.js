export function applySmartQuotes(prev, next) {
  if (!next || next.length <= prev.length) return next;
  return next
    .replace(/(^|[\s([{<])"(?=\S)/g, '$1\u201C')
    .replace(/\S"/g, (m) => m[0] + '\u201D')
    .replace(/(^|[\s([{<])'(?=\S)/g, '$1\u2018')
    .replace(/\S'/g, (m) => m[0] + '\u2019');
}
