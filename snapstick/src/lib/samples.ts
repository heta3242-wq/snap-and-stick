// Procedurally painted sample "photographs" for homepage mockups (no external images needed).
import { develop, makeCanvas, mulberry32 } from './develop';

type Painter = (x: CanvasRenderingContext2D, w: number, h: number, r: () => number) => void;

const lin = (x: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) => {
  const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g;
};
const bokeh = (x: CanvasRenderingContext2D, w: number, h: number, r: () => number, cols: string[], n = 26) => {
  for (let i = 0; i < n; i++) {
    const cx = r() * w, cy = r() * h * .7, rad = 10 + r() * 40;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad); const c = cols[i % cols.length];
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.globalAlpha = .55; x.beginPath(); x.arc(cx, cy, rad, 0, 7); x.fill(); x.globalAlpha = 1;
  }
};

const SCENES: Record<string, Painter> = {
  beach: (x, w, h) => {
    x.fillStyle = lin(x, 0, h * .6, [[0, '#f6a77c'], [.6, '#f5c49a'], [1, '#fbe0c0']]); x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffeab0'; x.beginPath(); x.arc(w * .62, h * .55, h * .13, 0, 7); x.fill();
    x.fillStyle = lin(x, h * .58, h, [[0, '#6f9fb5'], [1, '#3e6f86']]); x.fillRect(0, h * .58, w, h);
    x.strokeStyle = 'rgba(255,240,210,.55)'; x.lineWidth = 3;
    for (let i = 0; i < 8; i++) { const y = h * .62 + i * 18; x.beginPath(); x.moveTo(w * .45, y); x.lineTo(w * .8, y); x.stroke(); }
    x.fillStyle = '#e8cfa3'; x.beginPath(); x.moveTo(0, h * .88); x.quadraticCurveTo(w * .5, h * .78, w, h * .92); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.strokeStyle = '#3b2a22'; x.lineWidth = 9; x.beginPath(); x.moveTo(w * .14, h); x.quadraticCurveTo(w * .18, h * .55, w * .26, h * .3); x.stroke();
    x.fillStyle = '#3b2a22';
    for (let i = 0; i < 6; i++) { x.save(); x.translate(w * .26, h * .3); x.rotate(-2.6 + i * .75); x.beginPath(); x.ellipse(55, 0, 60, 12, 0, 0, 7); x.fill(); x.restore(); }
  },
  meadow: (x, w, h, r) => {
    x.fillStyle = lin(x, 0, h * .6, [[0, '#9ec5e6'], [1, '#e6f0f3']]); x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.85)'; [[.2, .2], [.7, .14]].forEach(([a, b]) => { for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(w * a + i * 28, h * b + (i % 2) * 8, 26, 0, 7); x.fill(); } });
    x.fillStyle = '#a9c48b'; x.beginPath(); x.moveTo(0, h * .55); x.quadraticCurveTo(w * .4, h * .42, w, h * .58); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.fillStyle = '#86ab6c'; x.beginPath(); x.moveTo(0, h * .7); x.quadraticCurveTo(w * .6, h * .58, w, h * .72); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    const cols = ['#fff', '#f6c3cf', '#f1d27a', '#e88a9c'];
    for (let i = 0; i < 260; i++) { const y = h * .62 + r() * h * .38; x.fillStyle = cols[i % 4]; x.beginPath(); x.arc(r() * w, y, 2 + (y / h) * 5 * r(), 0, 7); x.fill(); }
  },
  city: (x, w, h, r) => {
    x.fillStyle = lin(x, 0, h, [[0, '#1b1d3a'], [.6, '#4a2f55'], [1, '#2a1c2c']]); x.fillRect(0, 0, w, h);
    bokeh(x, w, h, r, ['#ffcc73', '#ff8fa3', '#9ad0ff', '#ffe6a7'], 34);
    x.fillStyle = '#120f1d';
    let px = 0; while (px < w) { const bw = 40 + r() * 70, bh = h * (.25 + r() * .35); x.fillRect(px, h - bh, bw, bh);
      x.fillStyle = 'rgba(255,214,140,.8)'; for (let yy = h - bh + 12; yy < h - 10; yy += 18) for (let xx = px + 8; xx < px + bw - 8; xx += 14) if (r() > .55) x.fillRect(xx, yy, 6, 9);
      x.fillStyle = '#120f1d'; px += bw + 4; }
  },
  party: (x, w, h, r) => {
    x.fillStyle = lin(x, 0, h, [[0, '#f7c6d0'], [1, '#e7a7b8']]); x.fillRect(0, 0, w, h);
    bokeh(x, w, h, r, ['#fff3c4', '#ffffff', '#ffd1dc'], 20);
    x.fillStyle = '#f3e6d6'; x.fillRect(0, h * .78, w, h);
    x.fillStyle = '#fbf3ea'; x.fillRect(w * .32, h * .5, w * .36, h * .3); x.fillStyle = '#f2a9b8'; x.fillRect(w * .32, h * .5, w * .36, h * .07);
    x.fillStyle = '#fbf3ea'; x.fillRect(w * .38, h * .36, w * .24, h * .15); x.fillStyle = '#c9b9de'; x.fillRect(w * .38, h * .36, w * .24, h * .04);
    [.43, .5, .57].forEach((cx) => { x.fillStyle = '#9ec5e6'; x.fillRect(w * cx - 4, h * .25, 8, h * .11);
      const g = x.createRadialGradient(w * cx, h * .22, 0, w * cx, h * .22, 30); g.addColorStop(0, 'rgba(255,220,120,1)'); g.addColorStop(1, 'rgba(255,200,100,0)'); x.fillStyle = g; x.beginPath(); x.arc(w * cx, h * .22, 30, 0, 7); x.fill(); });
    [['#f2a9b8', .12, .25], ['#9ec5e6', .86, .2], ['#f1d27a', .78, .42]].forEach(([c, a, b]) => { x.fillStyle = c as string; x.beginPath(); x.ellipse(w * (a as number), h * (b as number), 34, 42, 0, 0, 7); x.fill(); });
  },
  lake: (x, w, h) => {
    x.fillStyle = lin(x, 0, h * .55, [[0, '#f3d1c6'], [1, '#f8e8d6']]); x.fillRect(0, 0, w, h);
    const mt = (c: string, pts: number[][]) => { x.fillStyle = c; x.beginPath(); x.moveTo(0, h * .6); pts.forEach(([a, b]) => x.lineTo(w * a, h * b)); x.lineTo(w, h * .6); x.fill(); };
    mt('#b9a6c9', [[.15, .3], [.32, .45], [.5, .22], [.7, .42], [.85, .3]]);
    mt('#8d7aa6', [[.1, .48], [.3, .38], [.55, .5], [.75, .36], [.95, .5]]);
    x.fillStyle = lin(x, h * .6, h, [[0, '#c9b9de'], [1, '#9fb7d3']]); x.fillRect(0, h * .6, w, h);
    x.globalAlpha = .25; x.scale(1, -1); x.translate(0, -h * 1.2); mt('#8d7aa6', [[.1, .48], [.3, .38], [.55, .5], [.75, .36], [.95, .5]]); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  },
  cafe: (x, w, h) => {
    x.fillStyle = '#d8bf9d'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(122,86,68,.18)'; x.lineWidth = 2; for (let y = 10; y < h; y += 34) { x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + 8, w * .6, y - 8, w, y + 4); x.stroke(); }
    x.save(); x.translate(w * .32, h * .52); x.rotate(-.18); x.fillStyle = '#7b5644'; x.fillRect(-120, -150, 240, 300); x.fillStyle = '#f7efe1'; x.fillRect(-108, -140, 220, 282); x.fillStyle = 'rgba(74,47,36,.35)'; for (let i = 0; i < 9; i++) x.fillRect(-90, -110 + i * 26, 170 - (i % 3) * 30, 6); x.restore();
    x.fillStyle = '#fbf6ec'; x.beginPath(); x.arc(w * .7, h * .42, 82, 0, 7); x.fill(); x.fillStyle = '#6b4130'; x.beginPath(); x.arc(w * .7, h * .42, 60, 0, 7); x.fill();
    x.fillStyle = '#e7c9a3'; x.beginPath(); x.ellipse(w * .7, h * .42, 26, 18, .4, 0, 7); x.fill();
    x.fillStyle = '#fbf6ec'; x.beginPath(); x.ellipse(w * .8, h * .78, 60, 34, 0, 0, 7); x.fill(); x.fillStyle = '#c8453e'; [[-14, 0], [12, -6], [6, 12]].forEach(([a, b]) => { x.beginPath(); x.arc(w * .8 + a, h * .78 + b, 11, 0, 7); x.fill(); });
  },
  balloons: (x, w, h, r) => {
    x.fillStyle = lin(x, 0, h, [[0, '#a9cbe8'], [1, '#f6dccb']]); x.fillRect(0, 0, w, h);
    const cols = ['#f2a9b8', '#f1d27a', '#c9b9de', '#ffffff', '#e88a6c'];
    for (let i = 0; i < 14; i++) { const cx = r() * w, cy = r() * h * .8, s = 16 + r() * 26; x.fillStyle = cols[i % 5];
      x.beginPath(); x.ellipse(cx, cy, s, s * 1.2, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(80,60,50,.35)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, cy + s * 1.2); x.quadraticCurveTo(cx + 8, cy + s * 2, cx, cy + s * 3); x.stroke(); }
  },
  snow: (x, w, h, r) => {
    x.fillStyle = lin(x, 0, h, [[0, '#273a52'], [1, '#5b6f88']]); x.fillRect(0, 0, w, h);
    x.fillStyle = '#eef3f7'; x.beginPath(); x.moveTo(0, h * .78); x.quadraticCurveTo(w * .5, h * .7, w, h * .8); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    const tree = (cx: number, by: number, s: number) => { x.fillStyle = '#1f3a2e'; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(cx, by - s * (1 - i * .25)); x.lineTo(cx + s * (.4 + i * .1), by - s * (.45 - i * .2)); x.lineTo(cx - s * (.4 + i * .1), by - s * (.45 - i * .2)); x.fill(); } };
    tree(w * .2, h * .82, 200); tree(w * .78, h * .84, 160); tree(w * .5, h * .78, 120);
    const g = x.createRadialGradient(w * .5, h * .7, 0, w * .5, h * .7, 60); g.addColorStop(0, 'rgba(255,210,120,.9)'); g.addColorStop(1, 'rgba(255,210,120,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; for (let i = 0; i < 140; i++) { x.globalAlpha = .4 + r() * .6; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 2.5, 0, 7); x.fill(); } x.globalAlpha = 1;
  },
};
export const SAMPLE_KEYS = Object.keys(SCENES);

const cache = new Map<string, string>();
export function sample(key: string, filter = 'none', w = 480, h = 360): string {
  const ck = `${key}|${filter}|${w}x${h}`;
  if (cache.has(ck)) return cache.get(ck)!;
  const c = makeCanvas(w, h), x = c.getContext('2d')!;
  x.save(); x.scale(w / 640, h / 480); SCENES[key](x, 640, 480, mulberry32(key.length * 31 + 7)); x.restore();
  const out = develop(c, filter, 1, key.length).toDataURL('image/jpeg', .86);
  cache.set(ck, out);
  return out;
}
/** Sample as a canvas (for the editor demo / uploads fallback). */
export function sampleCanvas(key: string, w = 960, h = 720) {
  const c = makeCanvas(w, h), x = c.getContext('2d')!;
  x.save(); x.scale(w / 640, h / 480); SCENES[key](x, 640, 480, mulberry32(key.length * 31 + 7)); x.restore();
  return c;
}
