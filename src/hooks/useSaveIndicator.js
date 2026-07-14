import { useEffect, useRef } from 'react';
import { useSaveStatus, useStore } from '../store/index.js';

export function useSaveIndicator() {
  const status    = useSaveStatus();
  const timerRef  = useRef(null);

  
  useEffect(() => {
    if (status === 'saved') {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        useStore.setState({ saveStatus: 'idle' });
      }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [status]);

  return status;
}
