import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pipette } from 'lucide-react';

const isValidHex = (h) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h ?? '');

export function ColorSwatches({ colors, value, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rect, setRect]             = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const isPreset = colors.some(c => c.value === value);

  const openPicker = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setPickerOpen(true);
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setPickerOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const popStyle = rect ? {
    position: 'fixed',
    top: Math.min(rect.bottom + 6, window.innerHeight - 120),
    left: Math.min(rect.left, window.innerWidth - 176),
    zIndex: 9999,
  } : {};

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {colors.map(c => (
        <button
          key={c.value}
          title={c.name}
          onClick={() => onChange(c.value)}
          className={`w-6 h-6 rounded-full border transition-all hover:scale-110 shadow-sm ${value === c.value ? 'ring-2 ring-offset-2 ring-accent dark:ring-offset-neutral-900 dark:ring-neutral-200 scale-110' : 'border-accent/25 dark:border-neutral-600'}`}
          style={{ backgroundColor: c.value }}
        />
      ))}

      <button
        ref={btnRef}
        type="button"
        title="Custom color"
        onClick={openPicker}
        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-110 shadow-sm shrink-0 ${!isPreset ? 'ring-2 ring-offset-2 ring-accent dark:ring-offset-neutral-900 dark:ring-neutral-200 scale-110' : 'border-accent/25 dark:border-neutral-600'}`}
        style={!isPreset ? { backgroundColor: value } : { background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
      >
        {isPreset && <Pipette size={11} className="text-white drop-shadow" />}
      </button>

      {pickerOpen && rect && createPortal(
        <div
          ref={popRef}
          style={popStyle}
          className="bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-xl shadow-2xl p-3 flex flex-col gap-2 w-[164px]"
        >
          <input
            type="color"
            value={isValidHex(value) ? value : '#000000'}
            onChange={e => onChange(e.target.value)}
            className="w-full h-8 rounded-md cursor-pointer border border-accent/15 dark:border-neutral-700 bg-transparent"
          />
          <input
            type="text"
            key={value}
            defaultValue={value}
            placeholder="#000000"
            spellCheck={false}
            onBlur={e => { if (isValidHex(e.target.value)) onChange(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && isValidHex(e.currentTarget.value)) onChange(e.currentTarget.value); }}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-accent/15 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-accent/50 dark:focus:border-neutral-500"
          />
        </div>,
        document.body
      )}
    </div>
  );
}
