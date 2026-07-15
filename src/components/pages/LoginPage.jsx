import { useEffect, useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { Logo } from '../shared/Logo.jsx';
import { Button } from '../shared/Button.jsx';

export function LoginPage() {
  const firebaseEnabled = useStore(s => s.firebaseEnabled);
  const user            = useStore(s => s.user);
  const signIn           = useStore(s => s.signIn);
  const enterAppAsGuest  = useStore(s => s.enterAppAsGuest);
  const [signingIn, setSigningIn] = useState(false);

  // Reactive, not a manual redirect right after signIn() resolves - the
  // auth-state listener in authSlice is the single source of truth for
  // when `user` actually goes non-null, so this fires the instant it does
  // regardless of any popup-timing quirks.
  useEffect(() => {
    if (user) window.location.hash = '#/dashboard';
  }, [user]);

  const handleSignIn = async () => {
    setSigningIn(true);
    await signIn(); // failures surface via the existing toast in authSlice
    setSigningIn(false);
  };

  const continueAsGuest = () => {
    enterAppAsGuest();
    window.location.hash = '#/dashboard';
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <button
        onClick={() => { window.location.hash = '#/home'; }}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-accent dark:hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={22} />
        </div>

        <div className="border border-accent/15 dark:border-neutral-800 rounded-2xl p-6">
          {firebaseEnabled ? (
            <>
              <h1 className="text-lg font-semibold text-center mb-1">Sign in to Manus</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-6">
                Back up your notebooks and pick up where you left off on any device.
              </p>
              <Button size="lg" onClick={handleSignIn} loading={signingIn} className="w-full gap-2">
                {!signingIn && <User size={16} />}
                {signingIn ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-center mb-1">Sign-in isn't set up</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-6">
                This deployment hasn't configured cloud accounts yet. You can still use
                Manus fully as a guest - your work stays on this device.
              </p>
            </>
          )}

          <div className="flex items-center gap-2 my-5">
            <div className="flex-1 h-px bg-accent/10 dark:bg-neutral-800" />
            <span className="text-[10px] uppercase tracking-wide text-neutral-400">or</span>
            <div className="flex-1 h-px bg-accent/10 dark:bg-neutral-800" />
          </div>

          <Button variant="secondary" size="lg" onClick={continueAsGuest} className="w-full">
            Continue as guest
          </Button>
        </div>
      </div>
    </div>
  );
}
