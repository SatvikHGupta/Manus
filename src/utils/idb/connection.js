import { openDB } from 'idb';

let _dbPromise = null;

export function getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB('manus-v2', 3, {
      upgrade(db, oldVersion, newVersion, tx) {
        if (!db.objectStoreNames.contains('pages'))     db.createObjectStore('pages',     { keyPath: 'id' });
        if (!db.objectStoreNames.contains('fonts'))     db.createObjectStore('fonts',     { keyPath: 'name' });
        if (!db.objectStoreNames.contains('meta'))      db.createObjectStore('meta',      { keyPath: 'key' });
        if (!db.objectStoreNames.contains('notebooks')) db.createObjectStore('notebooks', { keyPath: 'id' });

        // v3: every notebook switch/delete and the Firestore backup used to
        // call getAll() on the whole 'pages' store and filter in JS, no
        // matter which notebook was actually being touched. This index lets
        // those queries go straight to the relevant pages instead of
        // reading every page in every notebook every time.
        const pagesStore = tx.objectStore('pages');
        if (!pagesStore.indexNames.contains('by-notebookId')) {
          pagesStore.createIndex('by-notebookId', 'notebookId');
        }
      },
    });
  }
  return _dbPromise;
}

export function resetDBConnection() { _dbPromise = null; }
