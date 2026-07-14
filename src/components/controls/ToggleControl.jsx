export function ToggleControl({ label, value, onChange, disabled }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
      <span className="text-xs text-neutral-600 dark:text-neutral-400">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-40 ${value ? 'bg-accent dark:bg-neutral-200' : 'bg-neutral-300 dark:bg-neutral-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-neutral-900 shadow transition-transform duration-200 ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}
