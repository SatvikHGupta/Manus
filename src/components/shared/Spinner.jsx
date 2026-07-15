import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

// The one loading indicator for the whole app - a plain spinning circle,
// themed off the same accent/neutral tokens everything else uses. Anywhere
// something is loading (a button, a modal, a status row) should reach for
// this instead of a one-off pulse/fade animation, so "loading" always looks
// and feels the same everywhere.
export function Spinner({ size = 16, className }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-accent dark:text-neutral-300', className)}
    />
  );
}
