import { useState, useRef, useEffect } from 'react';
import { LogOut, Cloud, CloudOff, User } from 'lucide-react';
import { useStore } from '../../store/index.js';

export function AccountButton() {
  const firebaseEnabled = useStore(s => s.firebaseEnabled);
  const user            = useStore(s => s.user);
  const signIn          = useStore(s => s.signIn);
  const signOutOfAccount = useStore(s => s.signOutOfAccount);
  const syncing         = useStore(s => s.syncing);
  const lastSyncAt      = useStore(s => s.lastSyncAt);
  const lastSyncError   = useStore(s => s.lastSyncError);

  const [menuOpen, setMenuOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  // If the account switches (sign out -> sign in as someone else), give the
  // new photo a fresh chance to load rather than staying stuck on the
  // previous account's failure.
  useEffect(() => { setPhotoError(false); }, [user?.photoURL]);

  // Firebase isn't set up at all - nothing to show. Guest mode is
  // already the entire app experience, so there's no "disabled" button
  // cluttering the navbar for a feature that doesn't exist yet.
  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-accent/15 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <User size={13} />
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setMenuOpen(o => !o)} className="shrink-0">
        {user.photoURL && !photoError ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? user.email}
            referrerPolicy="no-referrer"
            onError={() => setPhotoError(true)}
            className="w-7 h-7 rounded-full object-cover border border-accent/15 dark:border-neutral-700"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent dark:bg-neutral-200 text-white dark:text-black flex items-center justify-center text-[11px] font-semibold">
            {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-9 z-30 bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-[200px] text-xs">
          <div className="px-3 py-2.5 border-b border-accent/10 dark:border-neutral-800">
            <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{user.displayName || user.email}</p>
            {user.displayName && <p className="text-neutral-400 truncate">{user.email}</p>}
          </div>
          <div className="px-3 py-2 flex items-center gap-1.5 text-neutral-500 border-b border-accent/10 dark:border-neutral-800">
            {syncing ? (
              <><Cloud size={12} className="animate-pulse" /> Backing up...</>
            ) : lastSyncError ? (
              <><CloudOff size={12} className="text-red-500" /> Backup failed</>
            ) : lastSyncAt ? (
              <><Cloud size={12} /> Backed up {new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
            ) : (
              <><Cloud size={12} /> Backup pending</>
            )}
          </div>
          <button
            onClick={() => { setMenuOpen(false); signOutOfAccount(); }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left text-neutral-700 dark:text-neutral-300"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
