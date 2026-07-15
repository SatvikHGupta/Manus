import { Moon, Sun, ArrowRight, Download, Cloud, ShieldCheck, PenLine } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { Logo } from '../shared/Logo.jsx';
import { Button } from '../shared/Button.jsx';

const FEATURES = [
  {
    icon: PenLine,
    title: 'Looks like actual handwriting',
    body: 'Ink flows, letters jitter a little, pressure varies - a dozen+ handwriting fonts, not just a font swap.',
  },
  {
    icon: Download,
    title: 'Export and go',
    body: 'PNG, PDF, or SVG. One page or the whole notebook. Print it or hand it in.',
  },
  {
    icon: Cloud,
    title: 'Cloud backup, if you want it',
    body: "Sign in with Google to keep notebooks synced across devices. Skip it and it just stays on this device.",
  },
  {
    icon: ShieldCheck,
    title: 'Nothing leaves your browser',
    body: "It's all rendered client-side. Your text isn't sent anywhere unless you sign in.",
  },
];

export function HomePage() {
  const darkMode        = useStore(s => s.darkMode);
  const toggleDarkMode   = useStore(s => s.toggleDarkMode);
  const enterAppAsGuest  = useStore(s => s.enterAppAsGuest);
  const firebaseEnabled  = useStore(s => s.firebaseEnabled);
  const user             = useStore(s => s.user);
  const hasEnteredApp    = useStore(s => s.hasEnteredApp);
  const unlocked         = hasEnteredApp || !!user;

  const goToApp = () => {
    if (!hasEnteredApp) enterAppAsGuest();
    window.location.hash = '#/dashboard';
  };

  return (
    <div className="h-screen overflow-y-auto flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl w-full mx-auto">
        <Logo size={20} />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            title="Toggle dark mode"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {firebaseEnabled && !user && (
            <Button variant="secondary" size="sm" onClick={() => { window.location.hash = '#/login'; }}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          Type it. Manus writes it out by hand.
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg max-w-xl mb-8">
          Paste your text in and get it back as a handwritten page - ruled, grid, dot, Cornell,
          or Indian-ruled paper, whichever handwriting font fits. Export as an image or PDF.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={goToApp} className="gap-2">
            {unlocked ? 'Back to your notebooks' : 'Try it now'} <ArrowRight size={16} />
          </Button>
          {firebaseEnabled && !user && (
            <Button variant="secondary" size="lg" onClick={() => { window.location.hash = '#/login'; }}>
              Sign in with Google
            </Button>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-4">
          {unlocked ? 'Signed in - your notebooks are right where you left them.' : "No account needed to try it. Everything stays on this device unless you sign in."}
        </p>
      </main>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-16 max-w-4xl mx-auto w-full">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 p-4 rounded-2xl border border-accent/10 dark:border-neutral-800">
            <Icon size={20} className="text-accent dark:text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">{title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="px-6 py-6 text-center text-xs text-neutral-400 border-t border-accent/10 dark:border-neutral-800">
        <button
          onClick={() => { window.location.hash = '#/terms'; }}
          className="hover:text-accent dark:hover:text-neutral-200 transition-colors"
        >
          Terms & privacy
        </button>
      </footer>
    </div>
  );
}
