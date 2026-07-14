// `caretPosition` is { top, left, lineHeight } relative to the textarea's
// own top-left (see utils/text/caretPosition.js) - previously this only
// ever anchored to a fixed bottomOffset from the panel's bottom edge, so in
// a tall/scrolled textarea the suggestions could pop up far from where the
// user was actually typing.
export function TagAutocomplete({ suggestions, onSelect, caretPosition }) {
  if (!suggestions || suggestions.length === 0) return null;

  const style = caretPosition
    ? {
        top: Math.max(0, caretPosition.top + caretPosition.lineHeight + 4),
        left: Math.max(4, caretPosition.left),
      }
    : { bottom: 60, left: 16 }; // no measurement yet - reasonable default

  return (
    <div
      className="absolute z-10 max-w-[220px] bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden"
      style={style}
    >
      {suggestions.slice(0, 8).map(s => (
        <button
          key={s.tag}
          onMouseDown={e => { e.preventDefault(); onSelect(s.tag); }}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
        >
          {s.preview && (
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: s.preview }}
            />
          )}
          <code className="font-mono">{`<${s.tag}>`}</code>
          <span className="text-neutral-400">{s.type}</span>
        </button>
      ))}
    </div>
  );
}
