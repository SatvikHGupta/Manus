import { getBreakpoint, computeFitZoomForBreakpoint } from '../../utils/layout/breakpoint.js';

const clampZoom = (v) => Math.min(Math.max(v, 0.20), 2.0);

export function createUISlice(set, get) {
  return {
    sidebarOpen:        true,
    sidebarTab:         'font',
    textPanelOpen:      true,

    sectionOpen: {
      font: true, line: true, word: true, letter: true,
      ink: true, paper: true, margins: true,
    },

    fontPickerOpen:       false,
    exportModalOpen:      false,
    helpModalOpen:        false,
    colorTagsModalOpen:   false,
    findReplaceOpen:      false,
    importModalOpen:      false,

    termsOpen:            false,
    commandPaletteOpen:   false,

    darkMode:             false,
    zoom:                 0.50,
    breakpoint:           typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop',
    appReady:             false,
    activeToasts:         [],

    // mobile
    mobileSettingsOpen:  false,

    // onboarding
    onboardingDone:      false,

    // Gate for the pre-app landing/login screens. True once someone has
    // either hit "Try now" (guest) or signed in at least once - persisted,
    // so a returning guest isn't bounced back to the marketing page every
    // reload. Being signed in (`user` truthy) unlocks the app regardless of
    // this flag - see the `unlocked` derivation in App.jsx.
    hasEnteredApp:       false,
    enterAppAsGuest:     () => set({ hasEnteredApp: true }),

    // new page behavior: 'duplicate' (inherit current page settings) | 'fresh' (defaults)
    newPageMode:         'duplicate',
    addPageChoiceOpen:   false,

    setSidebarOpen:   (v) => set({ sidebarOpen: v }),
    setTextPanelOpen: (v) => set({ textPanelOpen: v }),
    setSidebarTab:    (v) => set({ sidebarTab: v }),
    toggleSidebar:    ()  => set(s => ({ sidebarOpen: !s.sidebarOpen })),
    setSectionOpen:   (section, open) =>
      set(s => ({ sectionOpen: { ...s.sectionOpen, [section]: open } })),

    setFontPickerOpen:     (v) => set({ fontPickerOpen: v }),
    setExportModalOpen:    (v) => set({ exportModalOpen: v }),
    setHelpModalOpen:      (v) => set({ helpModalOpen: v }),
    setColorTagsModalOpen: (v) => set({ colorTagsModalOpen: v }),
    setFindReplaceOpen:    (v) => set({ findReplaceOpen: v }),
    setImportModalOpen:    (v) => set({ importModalOpen: v }),

    setTermsOpen:          (v) => set({ termsOpen: v }),
    setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

    toggleDarkMode: () => {
      set(s => {
        const next = !s.darkMode;
        document.documentElement.classList.toggle('dark', next);
        document.documentElement.classList.toggle('light', !next);
        return { darkMode: next };
      });
    },

    setZoom:    (v) => set({ zoom: clampZoom(v) }),
    zoomIn:     () => set(s => ({ zoom: clampZoom(s.zoom + 0.1) })),
    zoomOut:    () => set(s => ({ zoom: clampZoom(s.zoom - 0.1) })),
    resetZoom:  () => {
      const { pages, currentPageIndex, breakpoint } = get();
      const settings = pages[currentPageIndex]?.settings;
      const fit = settings ? computeFitZoomForBreakpoint(breakpoint, settings.pageWidth, settings.pageHeight) : null;
      set({ zoom: clampZoom(fit ?? 0.5) });
    },
    // Called only when the breakpoint tier actually changes (mobile/tablet/desktop),
    // not on every page-size tweak, so a user's manual zoom isn't silently
    // overwritten mid-session just because they picked a different paper size.
    autoFitZoomForBreakpoint: () => {
      const { pages, currentPageIndex, breakpoint } = get();
      const settings = pages[currentPageIndex]?.settings;
      if (!settings) return;
      const fit = computeFitZoomForBreakpoint(breakpoint, settings.pageWidth, settings.pageHeight);
      if (fit !== null) set({ zoom: clampZoom(fit) });
    },
    setBreakpoint: (bp) => set({ breakpoint: bp }),
    setAppReady:(v) => set({ appReady: v }),

    // mobile setters
    setMobileSettingsOpen: (v) => set({ mobileSettingsOpen: v }),

    // onboarding
    setOnboardingDone: (v) => set({ onboardingDone: v }),

    setNewPageMode:       (v) => set({ newPageMode: v }),
    setAddPageChoiceOpen: (v) => set({ addPageChoiceOpen: v }),

    addToast: (toast) => {
      const id    = crypto.randomUUID();
      const entry = { id, type: 'info', duration: 3000, ...toast };
      set(s => {
        const next = [...s.activeToasts, entry].slice(-3);
        return { activeToasts: next };
      });
      setTimeout(() => {
        set(s => ({ activeToasts: s.activeToasts.filter(t => t.id !== id) }));
      }, entry.duration);
      return id;
    },
    removeToast: (id) => set(s => ({ activeToasts: s.activeToasts.filter(t => t.id !== id) })),
  };
}
