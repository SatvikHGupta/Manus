import { getDB } from './connection.js';

export async function idbGetAllPages() {
  const db = await getDB();
  return db.getAll('pages');
}
export async function idbGetPagesByNotebookId(notebookId) {
  const db = await getDB();
  return db.getAllFromIndex('pages', 'by-notebookId', notebookId);
}
export async function idbPutPage(page) {
  const db = await getDB();
  return db.put('pages', page);
}
export async function idbDeletePage(id) {
  const db = await getDB();
  return db.delete('pages', id);
}
export async function idbClearPages() {
  const db = await getDB();
  return db.clear('pages');
}
