import { useStore } from '../store/index.js';

export function useToast() {
  const addToast = useStore(s => s.addToast);
  return {
    success: (message, duration = 3000) => addToast({ type: 'success', message, duration }),
    error:   (message, duration = 4000) => addToast({ type: 'error',   message, duration }),
    info:    (message, duration = 3000) => addToast({ type: 'info',    message, duration }),
  };
}
