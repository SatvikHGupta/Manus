import { idbDeleteFont } from '../../utils/idb/fonts.js';
import { idbPutPage } from '../../utils/idb/pages.js';
import { unloadFontFace, familyFromName, persistCustomFont } from '../../utils/fonts/loader.js';
import { fileToDataUrl } from '../../utils/fonts/b64.js';
import { MAX_FONTS } from '../../constants/limits.js';
import { invalidateFontCache } from '../../utils/export/capture.js';
import { DEFAULT_SETTINGS } from '../defaults.js';

export function createFontsSlice(set, get) {
  return {
    customFonts:     [],
    fontUploadError: null,

    loadFontsFromDB: async () => {
      try {
        const { loadFontsFromDB } = await import('../../utils/fonts/loader.js');
        const fonts = await loadFontsFromDB();
        set({ customFonts: fonts });
      } catch (err) {
        // Non-fatal - app works fine with no custom fonts loaded - but silent
        // failure here made "my fonts disappeared" reports impossible to debug.
        console.warn('[fonts] failed to load custom fonts from IndexedDB:', err);
      }
    },

    uploadFont: async (file) => {
      const { customFonts } = get();

      
      const rawName  = file.name.replace(/\.[^.]+$/, '').trim();
      const normalized = rawName.toLowerCase().replace(/\s+/g, '');
      const isDupe = customFonts.some(
        f => f.name.toLowerCase().replace(/\s+/g, '') === normalized
      );
      if (isDupe) {
        set({ fontUploadError: `"${rawName}" is already uploaded.` });
        return;
      }
      if (customFonts.length >= MAX_FONTS) {
        set({ fontUploadError: `Maximum ${MAX_FONTS} custom fonts allowed.` });
        return;
      }

      const ext = file.name.split('.').pop();
      const allowed = ['ttf', 'otf', 'woff', 'woff2'];
      if (!allowed.includes(ext.toLowerCase())) {
        set({ fontUploadError: 'Only TTF, OTF, WOFF, WOFF2 files are supported.' });
        return;
      }

      const MAX_FONT_BYTES = 5 * 1024 * 1024; // 5MB - covers virtually all real font files
      if (file.size > MAX_FONT_BYTES) {
        set({ fontUploadError: 'That font file is too large (max 5MB).' });
        return;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        const uniqueSuffix = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);
        const family = `${familyFromName(rawName)}_${uniqueSuffix}`;
        await persistCustomFont(rawName, family, dataUrl, 'custom');
        set({
          customFonts: [...customFonts, { name: rawName, family, dataUrl, category: 'custom' }],
          fontUploadError: null,
        });
        invalidateFontCache(); 
      } catch {
        set({ fontUploadError: 'Failed to upload font. Please try a different file.' });
      }
    },

    removeCustomFont: async (name) => {
      const { customFonts, pages } = get();
      const font = customFonts.find(f => f.name === name);
      if (!font) return;

      
      unloadFontFace(font.family);

      await idbDeleteFont(name);
      set({ customFonts: customFonts.filter(f => f.name !== name) });

      
      const now = Date.now();
      const affectedIds = new Set();
      const updatedPages = pages.map(p => {
        if (p.settings?.fontFamily === font.family) {
          affectedIds.add(p.id);
          return { ...p, settings: { ...p.settings, fontFamily: DEFAULT_SETTINGS.fontFamily }, updatedAt: now };
        }
        return p;
      });

      if (affectedIds.size > 0) {
        set({ pages: updatedPages });
        try {
          for (const p of updatedPages) {
            if (affectedIds.has(p.id)) await idbPutPage(p);
          }
        } catch { /* ignore */ }
      }

      invalidateFontCache();
    },

    clearFontUploadError: () => set({ fontUploadError: null }),
  };
}
