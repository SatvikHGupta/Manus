import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, devtools } from 'zustand/middleware';
import { createSettingsSlice } from './slices/settingsSlice.js';
import { createPagesSlice }    from './slices/pagesSlice.js';
import { createFontsSlice }    from './slices/fontsSlice.js';
import { createHistorySlice }  from './slices/historySlice.js';
import { createNotebooksSlice } from './slices/notebooksSlice.js';
import { createAuthSlice }      from './slices/authSlice.js';
import { createUISlice }       from './slices/uiSlice.js';
import { DEFAULT_SETTINGS }    from './defaults.js';

export const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...createSettingsSlice(set, get),
        ...createPagesSlice(set, get),
        ...createFontsSlice(set, get),
        ...createHistorySlice(set, get),
        ...createNotebooksSlice(set, get),
        ...createAuthSlice(set, get),
        ...createUISlice(set, get),
      }),
      {
        name: 'manus-v2-settings',
        version: 3,

        // Settings now live PER-PAGE inside each page object (stored in IDB,
        // not localStorage). Only the "last used" snapshot and pure UI/app
        // preferences are persisted here.
        partialize: (s) => ({
          lastUsedSettings: s.lastUsedSettings,
          darkMode:         s.darkMode,
          zoom:             s.zoom,
          sidebarOpen:      s.sidebarOpen,
          textPanelOpen:    s.textPanelOpen,
          sectionOpen:      s.sectionOpen,
          onboardingDone:   s.onboardingDone,
          hasEnteredApp:    s.hasEnteredApp,
          newPageMode:      s.newPageMode,
          currentNotebookId: s.currentNotebookId,
        }),

        merge: (persisted, current) => ({
          ...current,
          lastUsedSettings: { ...DEFAULT_SETTINGS, ...(persisted?.lastUsedSettings ?? {}) },
          darkMode:         persisted?.darkMode      ?? false,
          zoom:             persisted?.zoom          ?? 0.50,
          sidebarOpen:      persisted?.sidebarOpen   ?? true,
          textPanelOpen:    persisted?.textPanelOpen ?? true,
          sectionOpen:      { ...current.sectionOpen, ...(persisted?.sectionOpen ?? {}) },
          onboardingDone:   persisted?.onboardingDone ?? false,
          hasEnteredApp:    persisted?.hasEnteredApp  ?? false,
          newPageMode:      persisted?.newPageMode     ?? 'duplicate',
          currentNotebookId: persisted?.currentNotebookId ?? null,
        }),

        onRehydrateStorage: () => (state) => {
          if (!state) return;
          const dark = state.darkMode ?? false;
          document.documentElement.classList.toggle('dark',  dark);
          document.documentElement.classList.toggle('light', !dark);
        },

        // v2 -> v3: settings moved from one global object to per-page.
        // Old global `settings` becomes the seed for `lastUsedSettings`;
        // actual per-page settings get backfilled when pages load from IDB
        // (see pagesSlice.loadPagesFromDB legacy-page migration).
        migrate: (old, version) => {
          if (version < 3) {
            return {
              lastUsedSettings: { ...DEFAULT_SETTINGS, ...(old?.settings ?? {}) },
              darkMode:    old?.darkMode    ?? false,
              zoom:        old?.zoom        ?? 0.50,
              sidebarOpen: old?.sidebarOpen ?? true,
              sectionOpen: {},
              newPageMode: 'duplicate',
            };
          }
          return old;
        },
      }
    ),
    { name: 'manus-v2' }
  )
);

export const useSettings     = ()    => useStore(s => s.pages[s.currentPageIndex]?.settings ?? s.lastUsedSettings);
export const useSetting      = (key) => useStore(s => (s.pages[s.currentPageIndex]?.settings ?? s.lastUsedSettings)[key]);
export const usePages        = ()    => useStore(s => s.pages);
export const useCurrentPage  = ()    => useStore(s => s.pages[s.currentPageIndex]);
export const useCurrentIndex = ()    => useStore(s => s.currentPageIndex);
export const useUI           = ()    => useStore(useShallow(s => ({
  sidebarOpen:        s.sidebarOpen,
  sidebarTab:         s.sidebarTab,
  textPanelOpen:      s.textPanelOpen,
  sectionOpen:        s.sectionOpen,
  fontPickerOpen:     s.fontPickerOpen,
  exportModalOpen:    s.exportModalOpen,
  helpModalOpen:      s.helpModalOpen,
  colorTagsModalOpen: s.colorTagsModalOpen,
  findReplaceOpen:    s.findReplaceOpen,
  importModalOpen:    s.importModalOpen,
  termsOpen:          s.termsOpen,
  commandPaletteOpen: s.commandPaletteOpen,
  darkMode:           s.darkMode,
  zoom:               s.zoom,
  appReady:           s.appReady,
  activeToasts:       s.activeToasts,
})));
export const useCustomFonts  = () => useStore(s => s.customFonts);
export const useSaveStatus   = () => useStore(s => s.saveStatus);
export const useNotebooks         = () => useStore(s => s.notebooks);
export const useCurrentNotebookId = () => useStore(s => s.currentNotebookId);
export const useCurrentNotebook   = () => useStore(s => s.notebooks.find(n => n.id === s.currentNotebookId));
export const useAuthUser          = () => useStore(s => s.user);
