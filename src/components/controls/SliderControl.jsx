import { useDebounce } from '../../hooks/useDebounce.js';

export function SliderControl({ label, value, min, max, step = 1, onChange, disabled, unit = '' }) {
  const debouncedChange = useDebounce(onChange, 30); 

  const display = typeof value === 'number'
    ? parseFloat(value.toFixed(step < 1 ? 2 : 0))
    : value;

  return (
    <label className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{label}</span>
        <span className="font-mono text-neutral-700 dark:text-neutral-300">{display}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={e => debouncedChange(parseFloat(e.target.value))}
        // py-3 pads the input's own hit-testing box (browsers register
        // pointer/touch drags anywhere within the element's bounding box,
        // not just the visually-thin track) without changing how thin the
        // track itself looks - a plain h-1.5 track alone is too small a
        // touch target on phones.
        className="w-full h-1.5 py-3 box-content rounded-full accent-accent dark:accent-neutral-200 disabled:opacity-40 touch-none"
      />
    </label>
  );
}
