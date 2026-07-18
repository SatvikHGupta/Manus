import {
  watchAuthState, watchUserDoc, signInWithGoogle, signOutUser,
  releaseSession,
} from '../../firebase/authService.js';
import { pushAllToFirestore, pullMissingNotebooksFromFirestore } from '../../firebase/syncService.js';
import { firebaseEnabled } from '../../firebase/config.js';
import { getDeviceId } from '../../utils/deviceId.js';
import { MANUAL_SYNC_COOLDOWN_MS } from '../../constants/limits.js';

const HOUR_MS = 60 * 60 * 1000;

// All of these are plain module-level handles, not store state - they're
// live subscriptions/timers, not data, and don't need to be reactive.
let authStateUnsubscribe = null;
let userDocUnsubscribe   = null;
let backupTimeoutId      = null;
let backupIntervalId     = null;

function stopBackupSchedule() {
  if (backupTimeoutId)  { clearTimeout(backupTimeoutId);   backupTimeoutId  = null; }
  if (backupIntervalId) { clearInterval(backupIntervalId); backupIntervalId = null; }
}

function toMillis(ts) {
  return typeof ts?.toMillis === 'function' ? ts.toMillis() : null;
}

export function createAuthSlice(set, get) {
  return {
    user: null,
    // If Firebase isn't configured there's nothing to wait for - guest
    // mode shouldn't sit on a loading screen for an optional feature
    // nobody has set up yet.
    authReady: !firebaseEnabled,
    firebaseEnabled,
    deviceId: firebaseEnabled ? getDeviceId() : null,
    syncing: false,
    lastSyncAt: null,
    lastSyncError: null,

    // Called once at boot (see App.jsx). Entirely a no-op when Firebase
    // isn't configured.
    initAuth: () => {
      if (!firebaseEnabled) return () => {};

      authStateUnsubscribe = watchAuthState((firebaseUser) => {
        if (userDocUnsubscribe) { userDocUnsubscribe(); userDocUnsubscribe = null; }
        stopBackupSchedule();

        if (!firebaseUser) {
          set({ user: null, authReady: true });
          return;
        }

        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          },
          authReady: true,
        });

        // Live session-ownership + backup-status feed. This is what makes
        // "another device signed in while I was closed/offline" surface
        // the instant this device reconnects - the very first snapshot
        // read here already reflects reality, no special offline-detection
        // logic needed.
        userDocUnsubscribe = watchUserDoc(firebaseUser.uid, (data) => {
          get().handleUserDocUpdate(data);
        });
      });

      return () => {
        authStateUnsubscribe?.();
        userDocUnsubscribe?.();
        stopBackupSchedule();
      };
    },

    handleUserDocUpdate: (data) => {
      if (!data) return;

      set({
        lastSyncAt: toMillis(data.lastBackupAt) ?? get().lastSyncAt,
        lastSyncError: data.lastBackupStatus === 'error' ? (data.lastBackupError || 'Backup failed.') : null,
      });

      const myDeviceId = get().deviceId;
      const remoteSessionId = data.activeSessionId;

      if (!remoteSessionId) return; // nothing claimed yet - claim happens explicitly on sign-in, not here

      if (remoteSessionId === myDeviceId) {
        get().ensureBackupScheduleRunning();
        return;
      }

      get().handleSessionSuperseded();
    },

    // Fires when this device discovers a *different* device now holds the
    // session - whether that happened moments ago or while this device
    // was completely offline. Local notes are never touched; this only
    // ends the cloud-sync session on this device.
    handleSessionSuperseded: async () => {
      if (!get().user) return; // already handled, avoid double toast
      stopBackupSchedule();
      if (userDocUnsubscribe) { userDocUnsubscribe(); userDocUnsubscribe = null; }
      try { await signOutUser(); } catch { /* ignore */ }
      set({ user: null, lastSyncError: null });
      get().addToast?.({
        type: 'info',
        message: 'You were signed out here - this account is now signed in on another device. Your notes on this device are safe.',
      });
    },

    signIn: async () => {
      try {
        const user = await signInWithGoogle(get().deviceId);
        const { pulled, error } = await pullMissingNotebooksFromFirestore(user.uid);
        if (error) {
          get().addToast?.({ type: 'error', message: `Couldn't check for cloud backups: ${error}` });
        } else if (pulled > 0) {
          await get().initNotebooksAndPages();
          get().addToast?.({ type: 'success', message: `Restored ${pulled} notebook${pulled === 1 ? '' : 's'} from your account.` });
        }
      } catch (err) {
        get().addToast?.({ type: 'error', message: err?.message ?? 'Sign-in failed.' });
      }
    },

    signOutOfAccount: async () => {
      const uid = get().user?.uid;
      stopBackupSchedule();
      if (userDocUnsubscribe) { userDocUnsubscribe(); userDocUnsubscribe = null; }
      if (uid) await releaseSession(uid);
      try { await signOutUser(); } catch { /* ignore */ }
      set({ user: null });
    },

    // Aligns every signed-in user's backup to the same wall-clock moments
    // (the top of every UTC hour) rather than "an hour after whenever you
    // happened to sign in" - plus one immediate backup right on claim, so
    // there's no waiting up to an hour for the first snapshot.
    ensureBackupScheduleRunning: () => {
      if (backupTimeoutId || backupIntervalId) return; // already scheduled
      get().flushAndSyncNow();
      const msUntilNextHour = HOUR_MS - (Date.now() % HOUR_MS);
      backupTimeoutId = setTimeout(() => {
        get().flushAndSyncNow();
        backupIntervalId = setInterval(() => get().flushAndSyncNow(), HOUR_MS);
      }, msUntilNextHour);
    },

    // One full local -> Firestore push. Local IndexedDB is never cleared
    // or modified by this - a one-way, non-destructive backup. Actual
    // lastSyncAt/lastSyncError come back through the live doc listener
    // above (single source of truth), not set directly here.
    flushAndSyncNow: async () => {
      const user = get().user;
      if (!user) return;
      // Force-commit any text edit still sitting in the 300ms debounce
      // window before snapshotting. Rather than guessing a fixed delay
      // (which could easily be shorter than the actual async IndexedDB
      // write triggered by the flush), poll the real saveStatus flag that
      // updatePageText() itself sets - so this genuinely waits for the
      // write to land, with a generous cap in case something goes wrong.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('manus:flush-pending-save'));
        await new Promise(resolve => {
          const deadline = Date.now() + 1500;
          const check = () => {
            if (get().saveStatus !== 'saving' || Date.now() > deadline) return resolve();
            setTimeout(check, 30);
          };
          setTimeout(check, 30); // let the flush's synchronous set({saveStatus:'saving'}) land first
        });
      }
      set({ syncing: true });
      const { flushedDeletes = [] } = await pushAllToFirestore(user.uid, get().pendingCloudDeletes);
      if (flushedDeletes.length) {
        set({ pendingCloudDeletes: get().pendingCloudDeletes.filter(id => !flushedDeletes.includes(id)) });
      }
      set({ syncing: false });
    },

    // Manual "sync now" - an on-demand version of the same push, gated by
    // a cooldown so it can't be used to hammer past the hourly cadence
    // (protects the shared Firestore write quota). Enforced here, in the
    // action itself, not just as a disabled prop on the button, so any
    // future second call site can't accidentally bypass it. Based on
    // lastSyncAt, which only ever moves on an actual successful backup
    // (see syncService.js) - so a failed attempt never traps someone in
    // a 15-minute wait to retry something that's already broken.
    syncNow: async () => {
      if (get().syncing) return; // already in flight
      const { lastSyncAt } = get();
      if (lastSyncAt && Date.now() - lastSyncAt < MANUAL_SYNC_COOLDOWN_MS) return;
      await get().flushAndSyncNow();
    },
  };
}
