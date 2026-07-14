# Fonts Directory

This folder is for self-hosted local fonts that are **automatically detected** at build time.

## How to add fonts

Just drop your font file here. No code changes needed.

```
public/fonts/my-handwriting.ttf  →  appears as "My Handwriting" in the font picker
```

Supported formats: `.ttf` `.otf` `.woff` `.woff2`

The filename becomes the display name - `my-font.ttf` → `My Font`, `caveat_regular.ttf` → `Caveat Regular`.

## How it works

Vite scans this folder at build time via `import.meta.glob` in `src/utils/fonts.js`:

```js
import.meta.glob('/public/fonts/*.{ttf,otf,woff,woff2}', { eager: true, as: 'url' })
```

Each detected font is registered as a `@font-face` rule at runtime via `registerLocalFonts()`. Local fonts appear under the **Local** category in the Font Picker modal.

## Built-in fonts (Google Fonts)

15 handwriting fonts are loaded from Google Fonts CDN via `index.html`. These appear under the **Google Fonts** category in the picker and do not live in this folder.

## User-uploaded fonts

When users upload a font via the Font Picker, it is stored as a base64 data URL in the browser's **IndexedDB** - not in this folder. It persists across sessions and appears under the **Custom** category.

## DO Not Sue me

I just searched free .ttf files and surfed around few websites then downloaded the fonts which I liked. Do NOT SUE ME for this, I used what I saw and was provided.