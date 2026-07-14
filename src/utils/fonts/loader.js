import { idbGetAllFonts, idbPutFont } from '../idb/fonts.js';

const _injected = new Set();

export function injectFontFace(name, family, dataUrl) {
  const id = `font-${family.replace(/\s+/g, '_')}`;
  if (_injected.has(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `@font-face { font-family: '${family}'; src: url('${dataUrl}'); font-display: swap; }`;
  document.head.appendChild(style);
  _injected.add(id);
}

export function unloadFontFace(family) {
  const id = `font-${family.replace(/\s+/g, '_')}`;
  const el = document.getElementById(id);
  if (el) { el.remove(); _injected.delete(id); }
}

export async function loadFontsFromDB() {
  try {
    const fonts = await idbGetAllFonts();
    for (const font of fonts) {
      injectFontFace(font.name, font.family, font.dataUrl);
    }
    return fonts;
  } catch {
    return [];
  }
}

export function registerLocalFont(name, family, path) {
  injectFontFace(name, family, path);
}

export function familyFromName(name) {
  return 'HND_' + name.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function persistCustomFont(name, family, dataUrl, category = 'custom') {
  await idbPutFont({ name, family, dataUrl, category });
  injectFontFace(name, family, dataUrl);
}
