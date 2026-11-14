import { FILTER_MAP, cssFilter, type FilterDef } from '../data/filters';

export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Apply a filter to a source image and return a new canvas. Deterministic per seed (no flicker on re-render). */
export function develop(src: CanvasImageSource & { width: number; height: number }, filterKey: string, t = 1, seed = 1): HTMLCanvasElement {
  const f: FilterDef = FILTER_MAP[filterKey] ?? FILTER_MAP.none;
  const w = src.width, h = src.height, k = w / 1280; // scale effects with resolution
  const c = makeCanvas(w, h), ctx = c.getContext('2d', { willReadFrequently: true })!;
  if (f.key === 'none' || t <= 0) { ctx.drawImage(src, 0, 0); return c; }
  const css = f.css.blur ? cssFilter({ ...f, css: { ...f.css, blur: f.css.blur * Math.max(1, k * 2) } }, t) : cssFilter(f, t);
  ctx.filter = css; ctx.drawImage(src, 0, 0); ctx.filter = 'none';
  const rand = mulberry32(seed * 9973 + 17);

  if (f.glow) {
    const g = makeCanvas(w, h), gc = g.getContext('2d')!;
    gc.filter = `blur(${Math.round(18 * Math.max(.5, k))}px) brightness(1.1)`; gc.drawImage(c, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = f.glow * t; ctx.drawImage(g, 0, 0); ctx.restore();
  }
  if (f.tint) {
    ctx.save(); ctx.globalCompositeOperation = f.tint[2]; ctx.fillStyle = hexA(f.tint[0], f.tint[1] * t); ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  if (f.fade) { ctx.fillStyle = `rgba(242,230,212,${f.fade * t})`; ctx.fillRect(0, 0, w, h); }
  if (f.flash) {
    const g = ctx.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .42, Math.max(w, h) * .55);
    g.addColorStop(0, `rgba(255,255,250,${.55 * f.flash * t})`); g.addColorStop(.6, `rgba(255,255,250,${.12 * f.flash * t})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  if (f.leak) {
    const g = ctx.createRadialGradient(w * .92, h * .08, 0, w * .92, h * .08, w * .8);
    g.addColorStop(0, `rgba(255,120,40,${.65 * f.leak * t})`); g.addColorStop(.45, `rgba(255,60,80,${.18 * f.leak * t})`); g.addColorStop(1, 'rgba(255,60,80,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createLinearGradient(0, 0, w * .25, 0);
    g2.addColorStop(0, `rgba(255,170,60,${.35 * f.leak * t})`); g2.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  if (f.rgb || f.grain) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const shift = f.rgb ? Math.round(f.rgb * k * t) : 0;
    const srcD = shift ? new Uint8ClampedArray(d) : null;
    const gAmt = (f.grain ?? 0) * 255 * t;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = (row + x) * 4;
        if (srcD) {
          d[i] = srcD[(row + Math.max(0, x - shift)) * 4];
          d[i + 2] = srcD[(row + Math.min(w - 1, x + shift)) * 4 + 2];
        }
        if (gAmt) { const n = (rand() - .5) * gAmt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  if (f.scan) {
    ctx.fillStyle = `rgba(0,0,0,${.2 * t})`;
    const step = Math.max(3, Math.round(4 * k));
    for (let y = 0; y < h; y += step) ctx.fillRect(0, y, w, step * .4);
    const by = h * (.55 + rand() * .35);
    ctx.fillStyle = `rgba(255,255,255,${.12 * t})`; ctx.fillRect(0, by, w, h * .04);
    ctx.fillStyle = `rgba(255,255,255,${.06 * t})`; ctx.fillRect(0, by + h * .05, w, h * .012);
  }
  if (f.dust) {
    const n = Math.round(160 * f.dust * t);
    for (let i = 0; i < n; i++) {
      const x = rand() * w, y = rand() * h, r = (rand() * 2.2 + .4) * Math.max(1, k * 1.5);
      ctx.fillStyle = rand() > .5 ? `rgba(255,252,240,${.5 + rand() * .4})` : `rgba(20,14,10,${.35 + rand() * .4})`;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * (rand() * .7 + .3), rand() * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = Math.max(1, k * 1.2);
    for (let i = 0; i < Math.round(7 * t); i++) {
      const x = rand() * w;
      ctx.strokeStyle = `rgba(255,250,235,${.25 + rand() * .3})`;
      ctx.beginPath(); ctx.moveTo(x, rand() * h * .3); ctx.bezierCurveTo(x + (rand() - .5) * 20, h * .4, x + (rand() - .5) * 20, h * .6, x + (rand() - .5) * 30, h * (.7 + rand() * .3)); ctx.stroke();
    }
    for (let i = 0; i < 4; i++) { // hairs
      const x = rand() * w, y = rand() * h;
      ctx.strokeStyle = 'rgba(30,20,15,.45)';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + rand() * 60 * k, y + rand() * 40 * k, x + rand() * 90 * k, y - rand() * 30 * k); ctx.stroke();
    }
  }
  if (f.vig) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.hypot(w, h) * .58);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,10,5,${f.vig * t})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  return c;
}

/** Downscale an image source into a canvas with max dimension. */
export function toCanvas(src: CanvasImageSource, sw: number, sh: number, maxDim = 1280, mirror = false) {
  const r = Math.min(1, maxDim / Math.max(sw, sh));
  const c = makeCanvas(sw * r, sh * r), ctx = c.getContext('2d')!;
  if (mirror) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

export function downloadURL(url: string, name: string) {
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
