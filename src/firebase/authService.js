import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseEnabled } from './config.js';

export function watchAuthState(callback) {
  if (!firebaseEnabled) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Live subscription on the user's own profile doc - this is how a device
// finds out it's been superseded by another device signing in (see
// activeSessionId below), including finding out about it after having
// been offline, the moment it reconnects.
export function watchUserDoc(uid, callback) {
  if (!firebaseEnabled || !uid) return () => {};
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  }, () => callback(null));
}

// Only called from the explicit, interactive "Sign in" button click - a
// restored session on app boot never calls this, which is what makes
// activeSessionId a reliable signal of "a real sign-in happened here",
// not just "a tab reloaded".
export async function signInWithGoogle(deviceId) {
  if (!firebaseEnabled) {
    throw new Error("Sign-in isn't set up yet - Firebase hasn't been configured for this app.");
  }
  const result = await signInWithPopup(auth, googleProvider);
  try {
    await touchUserProfile(result.user);
    await claimSession(result.user.uid, deviceId);
  } catch (err) {
    // Firebase Auth itself succeeded here, but the app-level sign-in
    // (profile write + session claim) didn't. Without this, the auth-state
    // listener in authSlice would still flip `user` non-null the instant
    // signInWithPopup resolved above, showing "signed in" everywhere even
    // though sign-in as a whole failed - undo it so signIn()'s catch block
    // and the resulting UI state agree with each other.
    try { await signOut(auth); } catch { /* ignore */ }
    throw err;
  }
  return result.user;
}

export async function signOutUser() {
  if (!firebaseEnabled) return;
  await signOut(auth);
}

// Marks this device as the one and only active session for the account.
// Firestore rules restrict this write to the account's own uid, same as
// every other field on this doc.
export async function claimSession(uid, deviceId) {
  if (!firebaseEnabled) return;
  await setDoc(doc(db, 'users', uid), {
    activeSessionId: deviceId,
    activeSessionStartedAt: serverTimestamp(),
  }, { merge: true });
}

// Called on a deliberate sign-out, so the slot doesn't sit "claimed" by a
// session that isn't actually running anymore.
export async function releaseSession(uid) {
  if (!firebaseEnabled || !uid) return;
  try {
    await setDoc(doc(db, 'users', uid), {
      activeSessionId: null,
      activeSessionStartedAt: null,
    }, { merge: true });
  } catch { /* best-effort - signing out locally still proceeds either way */ }
}

// Creates/updates users/{uid} with login count + a simple day-based visit
// streak. Called once per sign-in (not on every reload while already
// signed in - see authSlice, which only calls this from the explicit
// sign-in flow).
export async function touchUserProfile(user) {
  if (!firebaseEnabled || !user) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, local-ish

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      loginCount: 1,
      lastVisitDate: today,
      currentStreak: 1,
      longestStreak: 1,
      activeSessionId: null,
      activeSessionStartedAt: null,
      lastBackupAt: null,
      lastBackupStatus: null,
      lastBackupError: null,
    });
    return;
  }

  const data = snap.data();
  let { currentStreak = 0, longestStreak = 0, lastVisitDate } = data;

  if (lastVisitDate !== today) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    currentStreak = lastVisitDate === yesterday ? currentStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  await setDoc(ref, {
    email: user.email,
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    lastLoginAt: serverTimestamp(),
    loginCount: (data.loginCount ?? 0) + 1,
    lastVisitDate: today,
    currentStreak,
    longestStreak,
  }, { merge: true });
}
