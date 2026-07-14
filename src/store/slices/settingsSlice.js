import { DEFAULT_SETTINGS } from '../defaults.js';

// Settings now live PER-PAGE (page.settings). This slice exposes
// convenience actions that always operate on the CURRENT page's settings,
// plus "lastUsedSettings" which seeds new pages when the user picks
// "duplicate current settings" mode.
export function createSettingsSlice(set, get) {
  return {
    // Used only to seed a freshly created page before it exists in `pages`.
    lastUsedSettings: { ...DEFAULT_SETTINGS },

    updateSetting: (key, value) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get().recordHistory?.(page.id, () => ({ text: page.text, settings: page.settings }));
      const nextSettings = { ...page.settings, [key]: value };
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, settings: nextSettings, updatedAt: Date.now() } : p
      );
      set({ pages: newPages, lastUsedSettings: nextSettings });
      get().persistCurrentPageDebounced?.();
    },

    updateSettings: (patch) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get().recordHistory?.(page.id, () => ({ text: page.text, settings: page.settings }));
      const nextSettings = { ...page.settings, ...patch };
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, settings: nextSettings, updatedAt: Date.now() } : p
      );
      set({ pages: newPages, lastUsedSettings: nextSettings });
      get().persistCurrentPageDebounced?.();
    },

    resetSettings: () => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get().recordHistory?.(page.id, () => ({ text: page.text, settings: page.settings }));
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, settings: { ...DEFAULT_SETTINGS }, updatedAt: Date.now() } : p
      );
      set({ pages: newPages, lastUsedSettings: { ...DEFAULT_SETTINGS } });
      get().persistCurrentPage?.();
    },

    regenerateNoise: () => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get().recordHistory?.(page.id, () => ({ text: page.text, settings: page.settings }));
      const seed = (page.settings.noiseSeed + 1) % 0xFFFFFF;
      const nextSettings = { ...page.settings, noiseSeed: seed };
      const newPages = pages.map((p, i) =>
        i === currentPageIndex ? { ...p, settings: nextSettings } : p
      );
      set({ pages: newPages });
      get().persistCurrentPage?.();
    },
  };
}
