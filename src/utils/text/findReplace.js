export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildFindRegex(query, caseSensitive) {
  return new RegExp(escapeRegExp(query), caseSensitive ? 'g' : 'gi');
}

// Operates on the raw page text (tags included). Since tags always wrap
// whole words cleanly, a plain substring search/replace naturally leaves
// them untouched - no tag-aware parsing needed.
export function findMatches(text, query, caseSensitive) {
  if (!query) return [];
  const re = buildFindRegex(query, caseSensitive);
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length });
  }
  return matches;
}

export function replaceAllInText(text, query, replacement, caseSensitive) {
  if (!query) return text;
  return text.replace(buildFindRegex(query, caseSensitive), replacement);
}
