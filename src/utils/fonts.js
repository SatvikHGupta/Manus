import { registerLocalFont } from './fonts/loader.js';

// Vite scans this at build time. Files dropped into public/fonts/ show up
// here automatically -- no code changes needed (see public/fonts/README.md).
const fontModules = import.meta.glob('/public/fonts/*.{ttf,otf,woff,woff2}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function toDisplayName(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function toFamily(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return 'Local_' + base.replace(/[^a-zA-Z0-9]/g, '_');
}

export const LOCAL_FONTS = Object.entries(fontModules)
  .map(([path, url]) => {
    const filename = path.split('/').pop();
    return {
      name: toDisplayName(filename),
      family: toFamily(filename),
      category: 'local',
      url,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

let _registered = false;

// LOCAL_FONTS is a static, build-time constant (baked in via import.meta.glob
// above), so there's never a real reason to call this more than once per
// page load - the guard below is intentional. It logs in dev instead of
// silently no-op'ing so a future caller that expects re-registration to do
// something (e.g. after dynamically changing available fonts) notices
// immediately rather than quietly getting nothing.
export function registerLocalFonts() {
  if (_registered) {
    if (import.meta.env?.DEV) {
      console.warn('registerLocalFonts() called again - local fonts are only ever registered once per page load; this call was a no-op.');
    }
    return;
  }
  _registered = true;
  for (const font of LOCAL_FONTS) {
    registerLocalFont(font.name, font.family, font.url);
  }
}
