import { COLOR_TAG_MAP } from '../../constants/tags.js';

// Tokenizes the ENTIRE text in a single pass (rather than line-by-line) so
// that an open color/size/underline/strikethrough tag correctly carries
// across a line break instead of silently resetting on every new line.
// Color/size use proper stacks so nested tags (e.g. `<r>red <b>black</b>
// still red</r>`) restore the *outer* tag's formatting when the inner tag
// closes, instead of resetting all the way back to the page default.
export function parseTextToLines(text, defaultColor, defaultSize) {
  const baseColor = defaultColor || 'black';
  const baseSize  = defaultSize  || 22;

  const lines = [];
  let currentLine = [];

  // Each stack entry remembers which specific tag opened it (e.g. 'r', 'bl',
  // 'f16'), not just the resulting color/size. That way a closing tag only
  // resolves back to its actual opener - if tags are crossed like
  // "<r>a<bl>b</r>c</bl>", </r> now auto-closes the more-recently-opened
  // <bl> too (matching how browsers resiliently handle mismatched HTML)
  // instead of just popping whatever happened to be on top of a plain
  // color-only stack.
  const colorStack = [{ tag: null, color: baseColor }];
  const sizeStack  = [{ tag: null, size: baseSize }];
  let underlineDepth  = 0;
  let strikeDepth     = 0;

  const closeStackTo = (stack, tag) => {
    for (let i = stack.length - 1; i > 0; i--) {
      if (stack[i].tag === tag) { stack.length = i; return true; }
    }
    return false; // no matching opener - ignore this close
  };

  const re = /<\/?[\w]+>|\n|[ \t]+|[^\s<]+|</g;
  let match;
  const TAG_RE = /^<\/?[\w]+>$/;

  const pushWord = (tok) => {
    currentLine.push({
      type: 'word',
      text: tok,
      color: colorStack[colorStack.length - 1].color,
      fontSize: sizeStack[sizeStack.length - 1].size,
      underline: underlineDepth > 0,
      strikethrough: strikeDepth > 0,
    });
  };

  while ((match = re.exec(text)) !== null) {
    const tok = match[0];

    if (tok === '\n') {
      lines.push(currentLine);
      currentLine = [];
      continue;
    }

    if (TAG_RE.test(tok) && tok.startsWith('</')) {
      const tag = tok.slice(2, -1);
      if (COLOR_TAG_MAP[tag])   { closeStackTo(colorStack, tag); continue; }
      if (/^f\d+$/.test(tag))  { closeStackTo(sizeStack, tag);  continue; }
      if (tag === 'u') { underlineDepth = Math.max(0, underlineDepth - 1); continue; }
      if (tag === 's') { strikeDepth    = Math.max(0, strikeDepth - 1);   continue; }
      // Not a recognized closing tag (e.g. someone literally typed
      // "</TODO>") - render it as text instead of silently dropping it.
      pushWord(tok);
      continue;
    }

    if (TAG_RE.test(tok)) {
      const tag = tok.slice(1, -1);
      if (COLOR_TAG_MAP[tag]) { colorStack.push({ tag, color: COLOR_TAG_MAP[tag] }); continue; }
      if (/^f(\d+)$/.test(tag)) { sizeStack.push({ tag, size: parseInt(tag.slice(1), 10) }); continue; }
      if (tag === 'u') { underlineDepth++; continue; }
      if (tag === 's') { strikeDepth++; continue; }
      // Not a recognized tag (e.g. "<name>", "<TODO>", a stray placeholder) -
      // render it literally instead of vanishing from the page.
      pushWord(tok);
      continue;
    }

    if (/^[ \t]+$/.test(tok)) {
      currentLine.push({ type: 'space', length: tok.length });
      continue;
    }

    pushWord(tok);
  }

  lines.push(currentLine);
  return lines;
}

// Cheap, standalone check (doesn't build line/word objects) so the editor
// can warn "you left a tag open" - previously an unclosed tag would just
// silently color/underline/etc. everything for the rest of the page with
// no feedback anywhere about why.
export function hasUnclosedTags(text) {
  if (!text) return false;
  const re = /<\/?[\w]+>/g;
  let match;
  let colorDepth = 0, sizeDepth = 0, underlineDepth = 0, strikeDepth = 0;
  while ((match = re.exec(text)) !== null) {
    const tok = match[0];
    const closing = tok.startsWith('</');
    const tag = closing ? tok.slice(2, -1) : tok.slice(1, -1);
    if (COLOR_TAG_MAP[tag])   { colorDepth     = Math.max(0, colorDepth     + (closing ? -1 : 1)); continue; }
    if (/^f\d+$/.test(tag))  { sizeDepth      = Math.max(0, sizeDepth      + (closing ? -1 : 1)); continue; }
    if (tag === 'u')          { underlineDepth = Math.max(0, underlineDepth + (closing ? -1 : 1)); continue; }
    if (tag === 's')          { strikeDepth    = Math.max(0, strikeDepth    + (closing ? -1 : 1)); continue; }
  }
  return colorDepth > 0 || sizeDepth > 0 || underlineDepth > 0 || strikeDepth > 0;
}
