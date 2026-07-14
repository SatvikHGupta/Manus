import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseEnabled } from './config.js';
import { idbGetAllNotebooks, idbPutNotebook } from '../utils/idb/notebooks.js';
import { idbGetAllPages, idbPutPage } from '../utils/idb/pages.js';

// Pushes every local notebook (and its pages) to Firestore as one document
// per notebook. This is a full snapshot on every call, not an incremental
// diff - deliberately simple so there's no separate "pending changes"
// bookkeeping that could itself get out of sync. Called on an hourly
// timer while signed in (see authSlice) - local IndexedDB is never
// cleared or touched by this, it's a one-way push, cache stays intact.
// Firestore hard-caps a single document at 1MB. Nesting every page's text +
// settings inside one document per notebook means a notebook with many/long
// pages could someday cross that limit - checked up front (with a safety
// margin) so that notebook is skipped with a clear, specific reason instead
// of the whole backup failing on a generic Firestore error partway through
// the loop.
const FIRESTORE_DOC_SOFT_LIMIT_BYTES = 900_000;

function estimateByteSize(value) {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return 0;
  }
}

export async function pushAllToFirestore(uid) {
  if (!firebaseEnabled || !uid) return { error: 'Firebase is not configured.' };
  try {
    const [notebooks, allPages] = await Promise.all([idbGetAllNotebooks(), idbGetAllPages()]);
    const skipped = [];
    for (const nb of notebooks) {
      const pages = allPages.filter(p => p.notebookId === nb.id);
      const payload = {
        id: nb.id,
        name: nb.name,
        coverEmoji: nb.coverEmoji,
        coverColor: nb.coverColor,
        createdAt: nb.createdAt,
        updatedAt: nb.updatedAt,
        order: nb.order,
        pinned: !!nb.pinned,
        pages,
      };
      if (estimateByteSize(payload) > FIRESTORE_DOC_SOFT_LIMIT_BYTES) {
        skipped.push(nb.name);
        continue;
      }
      await setDoc(doc(db, 'users', uid, 'notebooks', nb.id), payload);
    }
    const backupError = skipped.length
      ? `Too large to back up: ${skipped.join(', ')}. Split these into more notebooks.`
      : null;
    await setDoc(doc(db, 'users', uid), {
      lastBackupAt: serverTimestamp(),
      lastBackupStatus: backupError ? 'partial' : 'ok',
      lastBackupError: backupError,
    }, { merge: true });
    return { error: backupError, notebookCount: notebooks.length };
  } catch (err) {
    const message = err?.message ?? 'Backup failed.';
    try {
      await setDoc(doc(db, 'users', uid), {
        lastBackupStatus: 'error',
        lastBackupError: message,
      }, { merge: true });
    } catch { /* if even the status write fails, the caller's toast still covers it */ }
    return { error: message };
  }
}

// Only ADDS notebooks that don't already exist locally by id - never
// overwrites or deletes anything already on this device. This means
// signing in on a device that already has local work merges in whatever
// the cloud has that isn't here yet, rather than risking clobbering
// either copy. True two-way conflict resolution isn't attempted here.
export async function pullMissingNotebooksFromFirestore(uid) {
  if (!firebaseEnabled || !uid) return { pulled: 0, error: 'Firebase is not configured.' };
  try {
    const localNotebooks = await idbGetAllNotebooks();
    const localIds = new Set(localNotebooks.map(n => n.id));
    const snap = await getDocs(collection(db, 'users', uid, 'notebooks'));

    let pulled = 0;
    for (const docSnap of snap.docs) {
      const remote = docSnap.data();
      const notebookId = remote.id ?? docSnap.id;
      if (localIds.has(notebookId)) continue;

      await idbPutNotebook({
        id: notebookId,
        name: remote.name ?? 'Untitled notebook',
        coverEmoji: remote.coverEmoji ?? '\ud83d\udcd3',
        coverColor: remote.coverColor ?? '#94a3b8',
        createdAt: remote.createdAt ?? Date.now(),
        updatedAt: remote.updatedAt ?? Date.now(),
        order: remote.order ?? 0,
        pinned: !!remote.pinned,
      });

      for (const page of remote.pages ?? []) {
        await idbPutPage({ ...page, notebookId });
      }
      pulled++;
    }
    return { pulled, error: null };
  } catch (err) {
    return { pulled: 0, error: err?.message ?? 'Restore failed.' };
  }
}
