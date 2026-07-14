import { COLOR_TAG_MAP } from '../../constants/tags.js';

export function getTagSuggestions(partial) {
  const allTags = [
    ...Object.keys(COLOR_TAG_MAP).map(t => ({ tag: t, type: 'color', preview: COLOR_TAG_MAP[t] })),
    { tag: 'f16', type: 'size', preview: null },
    { tag: 'f20', type: 'size', preview: null },
    { tag: 'f24', type: 'size', preview: null },
    { tag: 'f28', type: 'size', preview: null },
    { tag: 'f36', type: 'size', preview: null },
    { tag: 'u',   type: 'format', preview: null },
    { tag: 's',   type: 'format', preview: null },
  ];
  if (!partial) return allTags;
  return allTags.filter(t => t.tag.startsWith(partial.toLowerCase()));
}
