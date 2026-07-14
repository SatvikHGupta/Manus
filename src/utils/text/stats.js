export function computeTextStats(text) {
  if (!text) return { chars: 0, words: 0, lines: 0 };
  const clean = text.replace(/<\/?[\w]+>/g, ''); 
  return {
    chars: clean.length,
    words: clean.trim() ? clean.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
  };
}
