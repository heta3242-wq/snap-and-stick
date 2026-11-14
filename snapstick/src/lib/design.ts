import { LAYOUT_MAP, type Built, type StripSettings } from '../data/layouts';
import { FONT_MAP, pickInk, type Theme } from '../data/themes';
import { getStyle, type StyleVariant } from '../data/styles';
import type { StickerItem } from '../data/stickers';
import { defaultSettings, isDark, uid, type Design, type El } from '../store';
import { defaultNote } from './back';

export function dateText(d = new Date()) {
  return `'${String(d.getFullYear()).slice(2)}  ${String(d.getMonth() + 1).padStart(2, '0')}  ${String(d.getDate()).padStart(2, '0')}`;
}
export function captionInk(theme: Theme, bg: string) {
  return isDark(bg) === isDark(theme.ink) ? pickInk(bg) : theme.ink;
}
export function placeCaption(el: Extract<El, { type: 'text' }>, b: Built) {
  const fs = b.capSize * (FONT_MAP[el.font]?.scale ?? 1);
  return { ...el, fontSize: Math.round(fs), x: (b.W - b.capW) / 2, y: b.capY - fs * .62, width: b.capW, rotation: 0, scaleX: 1, scaleY: 1 };
}
export function placeDate(el: Extract<El, { type: 'text' }>, b: Built) {
  return { ...el, fontSize: Math.round(b.date.size), x: b.date.x - 400, y: b.date.y - b.date.size * .5, width: 400, rotation: 0, scaleX: 1, scaleY: 1 };
}
export function defaultTexts(theme: Theme, b: Built, s: StripSettings): El[] {
  const cap = placeCaption({ id: uid(), type: 'text', role: 'caption', text: theme.caption, font: theme.font, fontSize: 40, fill: captionInk(theme, s.bg), x: 0, y: 0, width: 100, align: 'center', rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 }, b);
  const date = placeDate({ id: uid(), type: 'text', role: 'date', text: dateText(), font: 'VT323', fontSize: 30, fill: '#ff8a1e', x: 0, y: 0, width: 400, align: 'right', rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 }, b);
  return [cap, date];
}
function anchors(b: Built) {
  const tall = b.H > b.W * 1.4, wide = b.W > b.H * 1.4;
  return tall ? [[.14, .06], [.88, .28], [.12, .54], [.87, .8]] : wide ? [[.07, .2], [.33, .84], [.67, .16], [.93, .8]] : [[.1, .09], [.9, .12], [.1, .86], [.9, .82]];
}
const ROTS = [-14, 12, -9, 15];
export function aspectOf(item: StickerItem) {
  if (item.kind === 'emoji') return 1;
  const vb = item.src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return vb ? +vb[1] / +vb[2] : 1;
}
/** Starter stickers for a style, tucked into the corners/edges so faces stay clear. */
export function decorElements(style: StyleVariant, b: Built): El[] {
  const A = anchors(b), base = Math.min(190, Math.min(b.W, b.H) * .2);
  return style.decor.slice(0, 4).map((item, i) => {
    const ar = aspectOf(item);
    const w = ar >= 1 ? base * Math.min(ar, 1.7) : base * 1.15 * ar;
    return { id: uid(), type: 'sticker' as const, item, x: A[i][0] * b.W, y: A[i][1] * b.H, w, h: w / ar, rotation: ROTS[i], scaleX: 1, scaleY: 1, opacity: 1, decor: true, anchor: i };
  });
}
export function initialDesign(themeId: string, variantId: string | null, layout: string, filter: string, favs: string[], decorOn = true): Design {
  const style = getStyle(themeId, variantId);
  const theme = style.theme;
  const settings = defaultSettings(theme, layout);
  const b = LAYOUT_MAP[layout].build(settings);
  return {
    themeId, variantId: style.id, decorOn, layout, filter, intensity: 1, settings,
    elements: [...defaultTexts(theme, b, settings), ...(decorOn ? decorElements(style, b) : [])],
    slots: b.slots.map((_, i) => (favs.length ? favs[i % favs.length] : null)),
    note: defaultNote(),
  };
}
/** Re-flow a design after layout or geometry changes: keeps colours, stickers and photo picks. */
export function reflow(d: Design, next: Partial<Design>, favs: string[]): Design {
  const nd = { ...d, ...next };
  const oldB = LAYOUT_MAP[d.layout].build(d.settings);
  const b = LAYOUT_MAP[nd.layout].build(nd.settings);
  const sx = b.W / oldB.W, sy = b.H / oldB.H;
  const pool = favs.length ? favs : (d.slots.filter(Boolean) as string[]);
  const slots = b.slots.map((_, i) => d.slots[i] ?? (pool.length ? pool[i % pool.length] : null));
  const theme = getStyle(nd.themeId, nd.variantId).theme;
  const A = anchors(b);
  const bgChanged = nd.settings.bg !== d.settings.bg;
  const elements = nd.elements.map((e) => {
    if (e.type === 'text' && e.role === 'caption') {
      const fill = bgChanged && e.fill === captionInk(theme, d.settings.bg) ? captionInk(theme, nd.settings.bg) : e.fill;
      return placeCaption({ ...e, fill }, b);
    }
    if (e.type === 'text' && e.role === 'date') return placeDate(e, b);
    if (e.type === 'sticker' && e.decor && e.anchor != null) return { ...e, x: A[e.anchor][0] * b.W, y: A[e.anchor][1] * b.H };
    if (sx === 1 && sy === 1) return e;
    return { ...e, x: e.x * sx, y: e.y * sy };
  });
  return { ...nd, slots, elements };
}
