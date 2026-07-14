import { getDB } from './connection.js';

export async function idbGetAllFonts() {
  const db = await getDB();
  return db.getAll('fonts');
}
export async function idbPutFont(font) {
  
  const db = await getDB();
  return db.put('fonts', font);
}
export async function idbDeleteFont(name) {
  const db = await getDB();
  return db.delete('fonts', name);
}
