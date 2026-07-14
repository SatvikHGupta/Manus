// Mirrors the textarea's text into an invisible, identically-styled div and
// measures where a marker span lands - the standard technique for getting
// pixel caret coordinates out of a plain <textarea> (no native API exists
// for this). Returns coordinates relative to the textarea's own top-left,
// already adjusted for its current scroll position.
const MIRRORED_PROPS = [
  'boxSizing', 'width', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'lineHeight', 'fontFamily',
  'textAlign', 'textTransform', 'textIndent', 'letterSpacing', 'wordSpacing', 'tabSize',
];

export function getCaretCoordinates(textarea, position) {
  if (!textarea) return { top: 0, left: 0, lineHeight: 20 };

  const computed = window.getComputedStyle(textarea);
  const div = document.createElement('div');
  const style = div.style;

  style.position = 'absolute';
  style.visibility = 'hidden';
  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.top = '-9999px';
  style.left = '-9999px';
  MIRRORED_PROPS.forEach(prop => { style[prop] = computed[prop]; });

  document.body.appendChild(div);
  div.textContent = textarea.value.substring(0, position);

  const span = document.createElement('span');
  // A trailing space collapses to zero width, which would measure the
  // caret one character too far left/up - a period is a safe stand-in.
  span.textContent = textarea.value.substring(position) || '.';
  div.appendChild(span);

  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2;
  const coordinates = {
    top:  span.offsetTop  + parseFloat(computed.borderTopWidth)  - textarea.scrollTop,
    left: span.offsetLeft + parseFloat(computed.borderLeftWidth) - textarea.scrollLeft,
    lineHeight,
  };

  document.body.removeChild(div);
  return coordinates;
}
