import { mulberry32 } from '../lib/develop';

export const PATTERNS = [
  { key: 'none', name: 'Plain' }, { key: 'paper', name: 'Paper' }, { key: 'dots', name: 'Polka' }, { key: 'gingham', name: 'Gingham' },
  { key: 'checker', name: 'Checker' }, { key: 'stripes', name: 'Stripes' }, { key: 'grid', name: 'Grid paper' }, { key: 'hearts', name: 'Hearts' },
  { key: 'stars', name: 'Stars' }, { key: 'snow', name: 'Snow' }, { key: 'confetti', name: 'Confetti' },
] as const;

function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const cache = new Map<string, HTMLCanvasElement>();
export function patternTile(key: string, bg: string, accent: string): HTMLCanvasElement | null {
  if (key === 'none') return null;
  const ck = `${key}|${bg}|${accent}`;
  if (cache.has(ck)) return cache.get(ck)!;
  const sz = key === 'paper' ? 256 : key === 'confetti' || key === 'snow' ? 160 : 64;
  const c = document.createElement('canvas'); c.width = c.height = sz;
  const x = c.getContext('2d')!;
  x.fillStyle = bg; x.fillRect(0, 0, sz, sz);
  const r = mulberry32(42);
  switch (key) {
    case 'paper': {
      const img = x.getImageData(0, 0, sz, sz), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      x.putImageData(img, 0, 0);
      x.strokeStyle = alpha('#7b5644', .06);
      for (let i = 0; i < 30; i++) { x.beginPath(); const y = r() * sz; x.moveTo(0, y); x.lineTo(sz, y + (r() - .5) * 20); x.stroke(); }
      break;
    }
    case 'dots': x.fillStyle = accent; [[16, 16], [48, 48]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 6, 0, 7); x.fill(); }); break;
    case 'gingham': x.fillStyle = alpha(accent, .32); x.fillRect(0, 0, 32, 64); x.fillRect(0, 0, 64, 32); break;
    case 'checker': x.fillStyle = accent; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32); break;
    case 'stripes': x.fillStyle = accent; x.fillRect(0, 0, 32, 64); break;
    case 'grid': x.strokeStyle = alpha(accent, .35); x.lineWidth = 1.5; x.strokeRect(0, 0, 32, 32); x.strokeRect(32, 0, 32, 32); x.strokeRect(0, 32, 32, 32); x.strokeRect(32, 32, 32, 32); break;
    case 'hearts': {
      x.fillStyle = accent;
      const h = (cx: number, cy: number, s: number) => { x.beginPath(); x.moveTo(cx, cy + s * .35); x.bezierCurveTo(cx - s, cy - s * .3, cx - s * .4, cy - s, cx, cy - s * .45); x.bezierCurveTo(cx + s * .4, cy - s, cx + s, cy - s * .3, cx, cy + s * .35); x.fill(); };
      h(16, 18, 11); h(48, 50, 11); break;
    }
    case 'stars': {
      x.fillStyle = accent;
      const s = (cx: number, cy: number, R: number) => { x.beginPath(); x.moveTo(cx, cy - R); x.quadraticCurveTo(cx, cy, cx + R, cy); x.quadraticCurveTo(cx, cy, cx, cy + R); x.quadraticCurveTo(cx, cy, cx - R, cy); x.quadraticCurveTo(cx, cy, cx, cy - R); x.fill(); };
      s(16, 16, 9); s(48, 46, 6); break;
    }
    case 'snow': x.fillStyle = alpha(accent, .9); for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(r() * sz, r() * sz, 1 + r() * 3, 0, 7); x.fill(); } break;
    case 'confetti': {
      const cols = ['#f2a9b8', '#f1c94c', '#a9c7e8', '#c9b9de', accent];
      for (let i = 0; i < 22; i++) { x.save(); x.translate(r() * sz, r() * sz); x.rotate(r() * 3); x.fillStyle = cols[i % cols.length]; x.fillRect(-5, -2.5, 10, 5); x.restore(); }
      break;
    }
  }
  cache.set(ck, c);
  return c;
}
