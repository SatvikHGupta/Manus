import { useCallback, useRef, useState, useEffect } from 'react';

export function useDebounce(fn, delay) {
  const fnRef    = useRef(fn);
  const timerRef = useRef(null);
  fnRef.current  = fn;
  return useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]);
}

export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
