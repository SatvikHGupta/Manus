import { getDB } from './connection.js';

export async function idbGetAllNotebooks() {
  const db = await getDB();
  return db.getAll('notebooks');
}
export async function idbPutNotebook(notebook) {
  const db = await getDB();
  return db.put('notebooks', notebook);
}
export async function idbDeleteNotebook(id) {
  const db = await getDB();
  return db.delete('notebooks', id);
}
