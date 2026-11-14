export type FilterGroup = 'Original' | 'Vintage' | 'Retro' | 'Aesthetic';

export interface FilterDef {
  key: string;
  name: string;
  group: FilterGroup;
  swatch: string;
  css: { sepia?: number; saturate?: number; contrast?: number; brightness?: number; hue?: number; grayscale?: number; blur?: number };
  tint?: [string, number, GlobalCompositeOperation];
  fade?: number;   // lifts blacks with cream
  leak?: number;   // warm light leak
  grain?: number;
  vig?: number;    // vignette strength
  rgb?: number;    // chromatic shift in px (at 1280w)
  scan?: boolean;  // VHS scanlines
  dust?: number;   // dust & scratches
  glow?: number;   // bloom
  flash?: number;  // on-camera flash hotspot
}

export const FILTERS: FilterDef[] = [
  { key: 'none', name: 'Original', group: 'Original', swatch: '#e9dccb', css: {} },
  // Vintage
  { key: 'film70', name: '1970s Film', group: 'Vintage', swatch: '#d9874a', css: { sepia: .4, saturate: 1.3, contrast: 1.05, hue: -8 }, tint: ['#ff8c28', .22, 'soft-light'], leak: .5, grain: .08, vig: .35 },
  { key: 'disposable', name: '90s Disposable', group: 'Vintage', swatch: '#9fbf7a', css: { saturate: 1.25, contrast: 1.15, brightness: 1.05 }, tint: ['#40ff90', .08, 'soft-light'], grain: .12, vig: .45, flash: .25 },
  { key: 'kodak', name: 'Kodak Warm', group: 'Vintage', swatch: '#e9b44c', css: { sepia: .2, saturate: 1.3, contrast: 1.08, brightness: 1.04 }, tint: ['#ffb43c', .26, 'soft-light'], grain: .06, vig: .3 },
  { key: 'fuji', name: 'Fuji Soft', group: 'Vintage', swatch: '#9cc9b4', css: { saturate: .9, contrast: .95, brightness: 1.05, hue: 8 }, tint: ['#8fdcc0', .2, 'soft-light'], fade: .08, grain: .05 },
  { key: 'sepia', name: 'Sepia', group: 'Vintage', swatch: '#a9825a', css: { sepia: 1, contrast: 1.05 }, grain: .06, vig: .3 },
  { key: 'faded', name: 'Faded Photo', group: 'Vintage', swatch: '#d8cbb8', css: { saturate: .65, contrast: .82, brightness: 1.08 }, fade: .22, vig: .15 },
  { key: 'grain', name: 'Film Grain', group: 'Vintage', swatch: '#8a8178', css: { contrast: 1.1, saturate: 1.05 }, grain: .26 },
  { key: 'leak', name: 'Light Leak', group: 'Vintage', swatch: '#f08a5d', css: { saturate: 1.15 }, leak: .95, vig: .2 },
  { key: 'dust', name: 'Dust & Scratches', group: 'Vintage', swatch: '#b5a58f', css: { sepia: .25, contrast: 1.1 }, dust: 1, grain: .1, vig: .35 },
  // Retro
  { key: 'vhs', name: 'VHS', group: 'Retro', swatch: '#7a5ccf', css: { saturate: 1.6, contrast: 1.15, brightness: 1.02 }, rgb: 7, scan: true, grain: .12, tint: ['#3c0078', .12, 'screen'], vig: .3 },
  { key: 'y2k', name: 'Y2K Digicam', group: 'Retro', swatch: '#8fb8ff', css: { saturate: 1.35, contrast: 1.2, brightness: 1.08, hue: -5 }, tint: ['#78b4ff', .14, 'soft-light'], flash: .2, grain: .05 },
  { key: 'flash', name: '2000s Flash', group: 'Retro', swatch: '#f4f1ea', css: { brightness: 1.12, contrast: 1.25, saturate: 1.1 }, flash: .6, vig: .6 },
  { key: 'analog', name: 'Analog Film', group: 'Retro', swatch: '#c7a27c', css: { sepia: .15, saturate: 1.1, contrast: 1.05 }, fade: .08, grain: .15, vig: .3 },
  { key: 'polaroid', name: 'Polaroid Fade', group: 'Retro', swatch: '#efe1c6', css: { contrast: .88, brightness: 1.08, saturate: .85, sepia: .18 }, fade: .18, grain: .05, vig: .25 },
  { key: 'orange', name: 'Retro Orange', group: 'Retro', swatch: '#e8742f', css: { sepia: .35, saturate: 1.6, hue: -15, contrast: 1.1 }, tint: ['#ff6a00', .26, 'soft-light'], vig: .3 },
  { key: 'cine', name: 'Cinematic Warm', group: 'Retro', swatch: '#b8693f', css: { saturate: 1.1, contrast: 1.22, brightness: .97 }, tint: ['#ff9a3c', .2, 'soft-light'], vig: .5, grain: .05 },
  { key: 'noir', name: 'B&W Noir', group: 'Retro', swatch: '#2c2a29', css: { grayscale: 1, contrast: 1.4, brightness: .95 }, grain: .16, vig: .55 },
  // Aesthetic
  { key: 'dreamy', name: 'Dreamy Glow', group: 'Aesthetic', swatch: '#c9b9de', css: { brightness: 1.08, saturate: 1.15, contrast: .95 }, glow: .5, tint: ['#b9a6e3', .28, 'soft-light'], vig: .2 },
  { key: 'softpink', name: 'Soft Pink', group: 'Aesthetic', swatch: '#f2b8c8', css: { brightness: 1.06, saturate: 1.05 }, tint: ['#ff9ec4', .3, 'soft-light'], fade: .06, glow: .2 },
  { key: 'mocha', name: 'Mocha', group: 'Aesthetic', swatch: '#8a6450', css: { sepia: .45, saturate: .8, contrast: 1.05, brightness: .97 }, tint: ['#7a4a2b', .26, 'soft-light'], fade: .06, vig: .3 },
  { key: 'golden', name: 'Golden Hour', group: 'Aesthetic', swatch: '#f0b24f', css: { sepia: .2, saturate: 1.35, brightness: 1.06 }, tint: ['#ffb347', .32, 'soft-light'], leak: .35, vig: .25 },
  { key: 'pastel', name: 'Pastel', group: 'Aesthetic', swatch: '#f6d6e4', css: { saturate: .75, brightness: 1.1, contrast: .85 }, fade: .15, tint: ['#ffd6e8', .16, 'soft-light'] },
  { key: 'coolblue', name: 'Cool Blue', group: 'Aesthetic', swatch: '#7fa6cf', css: { saturate: .95, contrast: 1.05, hue: 10 }, tint: ['#5aa0ff', .26, 'soft-light'], vig: .25 },
  { key: 'softfocus', name: 'Soft Focus', group: 'Aesthetic', swatch: '#e7dcd0', css: { blur: 1.4, brightness: 1.05 }, glow: .45 },
  { key: 'matte', name: 'Matte', group: 'Aesthetic', swatch: '#b9b1a6', css: { contrast: .85, saturate: .9 }, fade: .2, vig: .15 },
];

export const FILTER_MAP: Record<string, FilterDef> = Object.fromEntries(FILTERS.map((f) => [f.key, f]));

/** CSS filter string for a filter at intensity t (0..1). Works for both <video> previews and canvas ctx.filter. */
export function cssFilter(f: FilterDef, t: number): string {
  const c = f.css, parts: string[] = [];
  if (c.sepia) parts.push(`sepia(${(c.sepia * t).toFixed(3)})`);
  if (c.grayscale) parts.push(`grayscale(${(c.grayscale * t).toFixed(3)})`);
  if (c.saturate) parts.push(`saturate(${(1 + (c.saturate - 1) * t).toFixed(3)})`);
  if (c.contrast) parts.push(`contrast(${(1 + (c.contrast - 1) * t).toFixed(3)})`);
  if (c.brightness) parts.push(`brightness(${(1 + (c.brightness - 1) * t).toFixed(3)})`);
  if (c.hue) parts.push(`hue-rotate(${(c.hue * t).toFixed(1)}deg)`);
  if (c.blur) parts.push(`blur(${(c.blur * t).toFixed(2)}px)`);
  return parts.length ? parts.join(' ') : 'none';
}
