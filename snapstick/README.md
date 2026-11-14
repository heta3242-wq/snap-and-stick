# Snap & Stick: an aesthetic virtual photobooth

A photobooth that runs entirely in the browser. You capture or upload photos, build a photo strip, decorate it, and download the result. All photo processing happens on your device and nothing is uploaded anywhere.

**Stack:** React 18 + TypeScript, Tailwind CSS v4, Framer Motion, Konva / react-konva (the interactive editor), the Canvas API (filters and export) and the MediaDevices API (webcam). Fonts are bundled through @fontsource, so the app works offline.

## Run it

```bash
npm install
npm run dev      # local dev server → http://localhost:5173
npm run build    # production build → dist/
npm run single   # one self-contained HTML file → dist-single/index.html
```

The webcam needs a **secure context**: `https://`, `localhost`, or the single HTML file opened straight from disk. When you deploy `dist/`, host it on any static host that serves over HTTPS (Netlify, Vercel, GitHub Pages, IIS with SSL, and so on).

## The flow

Home → Layout (12) + Style (occasion is optional: Classic by default, or 17 themes with 4–5 styles each) → Camera / upload → Pick favourites → Studio editor → Final screen with downloads → My Creations

## Where things live

| Path | What it holds |
|---|---|
| `src/data/themes.ts` | Occasion and aesthetic themes: palette, pattern, caption font, default filter, layout, featured sticker categories and theme text badges |
| `src/data/styles.ts` | 4–5 style variants per occasion (colours, pattern, caption, font, filter) plus each style's starter stickers |
| `src/lib/back.ts` | Renders the note on the back of the strip and the front + back side-by-side sheet |
| `src/data/layouts.ts` | 12 layout generators. Each one returns the canvas size, photo slots, decorations (film holes, Polaroid cards, tape) and the caption and date positions |
| `src/data/filters.ts` + `src/lib/develop.ts` | 24 film filters plus Original. Each filter is a CSS colour grade combined with pixel effects (grain, light leak, VHS colour shift and scanlines, dust and scratches, glow, flash and vignette), and every effect scales with the intensity slider |
| `src/data/stickers.ts` | The sticker library: 14 categories of hand-drawn SVG stickers plus emoji. Stickers are rasterised once to PNG so exports stay crisp |
| `src/data/patterns.ts` | Background pattern tiles |
| `src/components/StripCanvas.tsx` | The Konva stage: background, photos, stickers, text, doodles, transformer and export |
| `src/pages/Studio.tsx` | The editor: left tools, centre canvas, right settings and layers, a mobile bottom toolbar, and undo/redo history |
| `src/pages/Booth.tsx` | The capture flow: camera switching, timer, photo count, live filter preview, flash and shutter, per-shot retake, upload, and picking favourites |
| `src/lib/samples.ts` | Painted sample "photos" used for the homepage mockups and the "Use sample photos" option |

## Keyboard shortcuts in the studio

| Keys | Action |
|---|---|
| Ctrl/⌘ + Z | Undo |
| Ctrl/⌘ + Shift + Z or Ctrl + Y | Redo |
| Ctrl/⌘ + D | Duplicate the selected item |
| Delete | Remove the selected item |
| Esc | Deselect |

## Accounts & saving

When someone signs up, their finished strips are saved, including the editable design and photos, so "Edit again" can reopen them in the studio. All of this is handled in `src/lib/backend.ts` behind a small `Backend` interface:

- **Now (`LocalBackend`):** accounts and creations are stored in the browser's IndexedDB on that device. Passwords are hashed with PBKDF2-SHA256 (120k iterations, random salt). Nothing is uploaded.
- **Cloud later:** write a class that implements the same interface (`signUp`, `signIn`, `me`, `signOut`, `listCreations`, `saveCreation`, `deleteCreation`, `deleteAccount`, `usage`) using `fetch()` against your API, then change the last line of the file to use it. No UI changes are needed.
