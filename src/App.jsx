import { useEffect, useRef, useState } from 'react';
import { useStore, useNotebooks, useCurrentNotebookId } from './store/index.js';
import { MainLayout }           from './components/layout/MainLayout.jsx';
import { AppLoader }            from './components/shared/AppLoader.jsx';
import { ToastStack }           from './components/shared/ToastStack.jsx';
import { ExportModal }          from './components/modals/ExportModal.jsx';
import { HelpModal }            from './components/modals/HelpModal.jsx';
import { ColorTagsModal }       from './components/modals/ColorTagsModal.jsx';
import { FindReplaceModal }     from './components/modals/FindReplaceModal.jsx';
import { ImportModal }          from './components/modals/ImportModal.jsx';
import { FontPickerModal }      from './components/modals/FontPickerModal.jsx';
import { AddPageModal }         from './components/modals/AddPageModal.jsx';
import { CommandPalette }       from './components/command-palette/CommandPalette.jsx';
import { TermsPage }            from './components/pages/TermsPage.jsx';
import { HomePage }             from './components/pages/HomePage.jsx';
import { LoginPage }            from './components/pages/LoginPage.jsx';
import { OnboardingTour }       from './components/onboarding/OnboardingTour.jsx';
import { Dashboard }            from './components/dashboard/Dashboard.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useZoom }              from './hooks/useZoom.js';
import { useBreakpointSync }    from './hooks/useBreakpointSync.js';
import { usePageMeta }          from './hooks/usePageMeta.js';
import { registerLocalFonts }   from './utils/fonts.js';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const handler = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

function navigate(hash) {
  if (window.location.hash !== hash) window.location.hash = hash;
}

export default function App() {
  const appReady          = useStore(s => s.appReady);
  const setAppReady       = useStore(s => s.setAppReady);
  const initNotebooksAndPages = useStore(s => s.initNotebooksAndPages);
  const loadFontsFromDB   = useStore(s => s.loadFontsFromDB);
  const initAuth          = useStore(s => s.initAuth);
  const authReady         = useStore(s => s.authReady);
  const user              = useStore(s => s.user);
  const hasEnteredApp     = useStore(s => s.hasEnteredApp);
  const notebooks         = useNotebooks();
  const currentNotebookId = useCurrentNotebookId();
  const termsOpen         = useStore(s => s.termsOpen);
  const setTermsOpen      = useStore(s => s.setTermsOpen);
  const pageRefs          = useRef([]);

  const hash = useHashRoute();
  useKeyboardShortcuts();
  useZoom();
  useBreakpointSync();

  useEffect(() => {
    registerLocalFonts();
    Promise.all([
      initNotebooksAndPages(),
      loadFontsFromDB(),
    ]).finally(() => setAppReady(true));
  }, []);

  // Independent of the boot gate above - sign-in state can change at any
  // point during the session (or be a no-op forever, if Firebase isn't
  // configured). It's still awaited by `booted` below though, so a
  // returning signed-in user never flashes the marketing home page for a
  // frame before their session is restored.
  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, []);

  useEffect(() => { window.__pageRefs = pageRefs; }, []);

  const booted = appReady && authReady;

  // Two real, coarse boot phases - local data (notebooks+fonts) then the
  // Firebase auth-state check. Deriving the message/percent straight from
  // these two existing booleans (rather than hand-tracking finer-grained
  // percentages through the boot promise chain) means there's nothing here
  // that can drift out of sync with what's actually still loading.
  const bootStage = !appReady
    ? { message: 'Loading notebooks & fonts...', percent: 35 }
    : !authReady
      ? { message: 'Checking your session...', percent: 80 }
      : { message: 'Ready.', percent: 100 };

  // Protected-route gate: unlocked once someone has hit "Try now" (guest)
  // OR is actually signed in - either one is sufficient, checked here and
  // nowhere else, so there's exactly one source of truth for "can this
  // person see the app".
  const unlocked    = hasEnteredApp || !!user;
  const isHome      = hash === '#/home';
  const isLogin     = hash === '#/login';
  const isTerms     = hash === '#/terms';
  const onDashboard = hash === '#/dashboard';
  // True only when MainLayout (the actual notebook editor) is on screen -
  // this is the sole thing OnboardingTour should ever run against, since
  // every one of its steps targets an element that only exists there.

  // Keeps the URL bar honest - content itself is picked below from
  // `unlocked` directly (not from hash), so this never causes a flash;
  // it just corrects the hash to match what's actually on screen.
  useEffect(() => {
    if (!booted) return;
    if (!unlocked && !isHome && !isLogin && !isTerms) {
      navigate('#/home');
    } else if (unlocked && isLogin) {
      navigate('#/dashboard');
    }
  }, [booted, unlocked, isHome, isLogin, isTerms]);

  // Per-route title - hash routing means there's no server-rendered <title>
  // to fall back on for any of these, this is the only thing that ever sets it.
  const inEditor = unlocked && !isHome && !isLogin && !onDashboard;

  const pageTitle = (() => {
    if (isLogin && !unlocked) return 'Sign in \u00b7 Manus';
    if (!unlocked || isHome) return 'Manus - Handwriting from typed text';
    if (onDashboard) return 'Notebooks \u00b7 Manus';
    const nb = notebooks.find(n => n.id === currentNotebookId);
    return nb ? `${nb.name} \u00b7 Manus` : 'Manus';
  })();
  usePageMeta(
    pageTitle,
    !unlocked && !isLogin
      ? 'Turn typed text into realistic handwriting. Export as PNG or PDF. No account required.'
      : undefined
  );

  let content;
  if (isLogin && !unlocked) {
    content = <LoginPage />;
  } else if (!unlocked || isHome) {
    content = <HomePage />;
  } else if (onDashboard) {
    content = <Dashboard onOpenNotebook={() => navigate('#/')} />;
  } else {
    content = <MainLayout pageRefs={pageRefs} />;
  }

  return (
    <>
      <AppLoader ready={booted} message={bootStage.message} percent={bootStage.percent} />

      {booted && (
        <>
          {content}

          {unlocked && (
            <>
              <FontPickerModal />
              <ExportModal pageRefs={pageRefs} />
              <HelpModal />
              <ColorTagsModal />
              <FindReplaceModal />
              <ImportModal />
              <AddPageModal />
              <CommandPalette />
              {inEditor && <OnboardingTour />}
            </>
          )}

          {(termsOpen || isTerms) && (
            <TermsPage onClose={() => { setTermsOpen(false); if (isTerms) navigate(unlocked ? '#/dashboard' : '#/home'); }} />
          )}

          <ToastStack />
        </>
      )}
    </>
  );
}
