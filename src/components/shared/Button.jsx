import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary:   'bg-accent dark:bg-white text-white dark:text-black hover:opacity-85',
  secondary: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:opacity-80',
  danger:    'bg-red-500 text-white hover:opacity-80',
  ghost:     'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
};

const SIZES = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2 text-sm',
  lg:  'px-5 py-2.5 text-sm',
  icon:'p-2',
};

export function Button({
  children, variant = 'primary', size = 'md',
  className, disabled, onClick, ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-opacity disabled:opacity-40',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]       ?? SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
