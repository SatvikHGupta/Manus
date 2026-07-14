import { useStore } from '../store/index.js';

export function useFontUpload() {
  const uploadFont          = useStore(s => s.uploadFont);
  const fontUploadError     = useStore(s => s.fontUploadError);
  const clearFontUploadError = useStore(s => s.clearFontUploadError);

  return { uploadFont, fontUploadError, clearFontUploadError };
}
