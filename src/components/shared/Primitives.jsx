import { cn } from '../../utils/cn.js';

export function Badge({ children, variant = 'default', className }) {
  const styles = {
    default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
    success: 'bg-green-50 dark:bg-green-950 text-green-600',
    error:   'bg-red-50 dark:bg-red-950 text-red-500',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-600',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', styles[variant], className)}>
      {children}
    </span>
  );
}

export function Divider({ className }) {
  return <div className={cn('h-px bg-neutral-100 dark:bg-neutral-800 my-1', className)} />;
}

export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800', className)} />
  );
}
