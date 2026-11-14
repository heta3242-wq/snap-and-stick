export type Aspect = '4:3' | '1:1' | '3:4' | '16:9';
export const ASPECTS: { key: Aspect; name: string; r: number }[] = [
  { key: '4:3', name: 'Classic 4:3', r: 4 / 3 }, { key: '1:1', name: 'Square', r: 1 }, { key: '3:4', name: 'Portrait', r: 3 / 4 }, { key: '16:9', name: 'Wide', r: 16 / 9 },
];
const ar = (a: Aspect) => ASPECTS.find((x) => x.key === a)!.r;

export interface StripSettings {
  bg: string; pattern: string; accent: string;
  frameColor: string; frameLine: number;
  border: number; gap: number; radius: number;
  count: number; aspect: Aspect;
}
export interface Slot { x: number; y: number; w: number; h: number; rot?: number }
export type Deco =
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill: string; rot?: number; r?: number; shadow?: boolean; opacity?: number }
  | { t: 'text'; x: number; y: number; text: string; size: number; fill: string; font?: string; rot?: number; w?: number; align?: string }
  | { t: 'ring'; x: number; y: number; rx: number; ry: number; stroke: string; width: number; rot?: number };
export interface Built { W: number; H: number; slots: Slot[]; deco: Deco[]; capY: number; capSize: number; capW: number; date: { x: number; y: number; size: number } }

export interface LayoutDef {
  key: string; name: string; desc: string; counts?: number[];
  defaults: Partial<StripSettings>;
  build: (s: StripSettings) => Built;
}

const rotPt = (x: number, y: number, deg: number) => { const a = (deg * Math.PI) / 180; return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) }; };
const dateOn = (sl: Slot) => ({ x: sl.x + sl.w - sl.w * .05, y: sl.y + sl.h - sl.h * .15, size: Math.max(22, sl.h * .085) });

function grid(cols: number, rows: number, pw: number, s: StripSettings, capH: number, top = 0): Built {
  const ph = Math.round(pw / ar(s.aspect)), b = s.border, g = s.gap;
  const slots: Slot[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push({ x: b + c * (pw + g), y: top + b + r * (ph + g), w: pw, h: ph });
  const W = 2 * b + cols * pw + (cols - 1) * g;
  const bottom = top + b + rows * ph + (rows - 1) * g;
  const H = bottom + capH;
  return { W, H, slots, deco: [], capY: bottom + capH * .48, capSize: Math.min(capH * .36, W * .085), capW: W - 2 * Math.max(b, 30), date: dateOn(slots[slots.length - 1]) };
}

const vertical = (key: string, name: string, desc: string, n: number): LayoutDef => ({
  key, name, desc, counts: [1, 2, 3, 4, 5, 6],
  defaults: { count: n, border: 36, gap: 18, radius: 0, aspect: '4:3' },
  build: (s) => grid(1, s.count, 560, s, 190),
});

export const LAYOUTS: LayoutDef[] = [
  vertical('k4', 'Korean 4-cut', 'The classic vertical strip of four.', 4),
  vertical('cut3', '3-cut strip', 'Three frames, one tidy strip.', 3),
  vertical('couple2', '2-cut couple', 'Two frames — made for two.', 2),
  { key: 'cut6', name: '6-cut strip', desc: 'Two columns, six little moments.', defaults: { border: 30, gap: 16, aspect: '3:4' }, build: (s) => grid(2, 3, 380, s, 200) },
  { key: 'grid2', name: '2×2 grid', desc: 'A square of four favourites.', defaults: { border: 40, gap: 20, aspect: '1:1' }, build: (s) => grid(2, 2, 460, s, 200) },
  { key: 'collage3', name: '3×3 collage', desc: 'Nine frames, one big memory.', defaults: { border: 34, gap: 14, aspect: '1:1' }, build: (s) => grid(3, 3, 320, s, 210) },
  {
    key: 'polaroid1', name: 'Single Polaroid', desc: 'One instant photo with a thick chin.', defaults: { border: 44, gap: 0, aspect: '1:1', bg: '#fbf8f1', pattern: 'none' },
    build: (s) => { const b = s.border, pw = 640; const r = grid(1, 1, pw, { ...s, border: b }, 250); return r; },
  },
  {
    key: 'polaroid2', name: 'Double Polaroid', desc: 'Two instants, casually overlapping.', defaults: { border: 34, aspect: '1:1', pattern: 'paper' },
    build: (s) => {
      const pw = 520, ph = Math.round(pw / ar(s.aspect)), m = s.border, chin = 150, cw = pw + 2 * m, ch = ph + m + chin;
      const cards = [{ x: 90, y: 110, rot: -5 }, { x: 640, y: 150, rot: 4 }];
      const W = 640 + cw + 70, H = 150 + ch + 230;
      const deco: Deco[] = [], slots: Slot[] = [];
      cards.forEach((c) => {
        deco.push({ t: 'rect', x: c.x, y: c.y, w: cw, h: ch, fill: '#fffdf8', rot: c.rot, shadow: true, r: 4 });
        const o = rotPt(m, m, c.rot); slots.push({ x: c.x + o.x, y: c.y + o.y, w: pw, h: ph, rot: c.rot });
      });
      return { W, H, slots, deco, capY: H - 95, capSize: 70, capW: W - 120, date: dateOn(slots[1]) };
    },
  },
  {
    key: 'film', name: 'Retro film strip', desc: '35mm negative with sprocket holes.', counts: [3, 4, 5, 6], defaults: { count: 4, border: 30, gap: 14, aspect: '4:3', bg: '#211a16', pattern: 'none', radius: 6 },
    build: (s) => {
      const n = s.count, pw = 400, ph = Math.round(pw / ar(s.aspect)), band = 92, b = s.border, g = s.gap;
      const W = 2 * b + n * pw + (n - 1) * g, F = ph + 2 * band, H = F + 130;
      const slots: Slot[] = Array.from({ length: n }, (_, i) => ({ x: b + i * (pw + g), y: band, w: pw, h: ph }));
      const deco: Deco[] = [];
      for (let x = 18; x < W - 30; x += 46) { deco.push({ t: 'rect', x, y: 24, w: 24, h: 32, fill: '#f3ead8', r: 5 }); deco.push({ t: 'rect', x, y: F - 56, w: 24, h: 32, fill: '#f3ead8', r: 5 }); }
      deco.push({ t: 'rect', x: 0, y: F - 2, w: W, h: 3, fill: 'rgba(243,234,216,.18)' });
      slots.forEach((sl, i) => deco.push({ t: 'text', x: sl.x + 8, y: band - 26, text: `${i * 2 + 12}  ▸ ${i * 2 + 12}A`, size: 18, fill: '#e8823a', font: 'VT323' }));
      deco.push({ t: 'text', x: W - 330, y: band - 26, text: 'SNAP&STICK 400', size: 18, fill: '#e8823a', font: 'VT323', w: 300, align: 'right' });
      return { W, H, slots, deco, capY: F + 62, capSize: 58, capW: W * .8, date: dateOn(slots[n - 1]) };
    },
  },
  {
    key: 'contact', name: 'Contact sheet', desc: 'A darkroom proof sheet of 12 frames.', defaults: { border: 50, gap: 12, aspect: '4:3', bg: '#1d1714', pattern: 'none' },
    build: (s) => {
      const top = 90, r = grid(4, 3, 280, s, 120, top);
      const deco: Deco[] = [];
      for (let row = 0; row < 3; row++) {
        const sl = r.slots[row * 4];
        deco.push({ t: 'rect', x: s.border - 10, y: sl.y - 34, w: r.W - 2 * s.border + 20, h: sl.h + 64, fill: '#2b231e' });
        r.slots.slice(row * 4, row * 4 + 4).forEach((x, i) => deco.push({ t: 'text', x: x.x + 4, y: x.y - 26, text: `▸${row * 4 + i + 1}  KODAK SAFETY`, size: 15, fill: '#e8a23a', font: 'VT323' }));
      }
      const f = r.slots[0];
      deco.push({ t: 'ring', x: f.x + f.w / 2, y: f.y + f.h / 2, rx: f.w * .58, ry: f.h * .62, stroke: '#e0473c', width: 6, rot: -6 });
      deco.push({ t: 'text', x: s.border, y: 34, text: 'CONTACT SHEET · ROLL 07', size: 30, fill: '#efe4cf', font: 'Special Elite' });
      return { ...r, deco, capY: r.H - 66, capSize: 46 };
    },
  },
  {
    key: 'scrapbook', name: 'Scrapbook collage', desc: 'Tilted prints, tape and doodles.', defaults: { border: 22, aspect: '4:3', bg: '#ead9bd', pattern: 'paper', accent: '#7b5644' },
    build: (s) => {
      const a = ar(s.aspect), m = s.border;
      const spots = [{ x: 90, y: 110, w: 540, rot: -4 }, { x: 610, y: 330, w: 500, rot: 5 }, { x: 110, y: 690, w: 480, rot: 3 }, { x: 570, y: 880, w: 540, rot: -3 }];
      const deco: Deco[] = [], slots: Slot[] = [];
      spots.forEach((p, i) => {
        const h = Math.round(p.w / a);
        deco.push({ t: 'rect', x: p.x, y: p.y, w: p.w + 2 * m, h: h + 2 * m, fill: '#fffdf8', rot: p.rot, shadow: true });
        const o = rotPt(m, m, p.rot); slots.push({ x: p.x + o.x, y: p.y + o.y, w: p.w, h, rot: p.rot });
      });
      const tapeCol = ['#f1d99a', '#f2a9b8', '#a9b77d', '#c9b9de'];
      spots.forEach((p, i) => { const o = rotPt(p.w / 2 - 50, -16, p.rot); deco.push({ t: 'rect', x: p.x + o.x, y: p.y + o.y, w: 120, h: 36, fill: tapeCol[i], rot: p.rot + (i % 2 ? 6 : -6), opacity: .8 }); });
      const H = Math.max(...slots.map((x) => x.y + x.h)) + 230;
      return { W: 1200, H, slots, deco, capY: H - 110, capSize: 84, capW: 1000, date: dateOn(slots[3]) };
    },
  },
  {
    key: 'story', name: 'Instagram story', desc: '1080×1920 — ready to post.', defaults: { border: 60, gap: 44, aspect: '4:3', radius: 18 },
    build: (s) => {
      const pw = 700, ph = Math.round(pw / ar(s.aspect)), g = s.gap, W = 1080;
      const total = 3 * ph + 2 * g, H = 1920, top = Math.max(60, (H - 230 - total) / 2);
      const rots = [-2, 2, -1.5];
      const slots: Slot[] = rots.map((rot, i) => ({ x: (W - pw) / 2, y: top + i * (ph + g), w: pw, h: ph, rot }));
      return { W, H, slots, deco: [], capY: H - 120, capSize: 92, capW: 960, date: dateOn(slots[2]) };
    },
  },
];
export const LAYOUT_MAP = Object.fromEntries(LAYOUTS.map((l) => [l.key, l])) as Record<string, LayoutDef>;
export const photoCountFor = (key: string, s: StripSettings) => LAYOUT_MAP[key].build(s).slots.length;
