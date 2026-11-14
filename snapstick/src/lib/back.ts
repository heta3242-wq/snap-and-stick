// Renders the BACK of a photo strip: a handwritten note on photo paper.
import { FONT_MAP } from '../data/themes';
import { makeCanvas, mulberry32 } from './develop';

export interface Note {
  enabled: boolean;
  text: string; to: string; from: string;
  font: string; ink: string; paper: string;
  lined: boolean; showDate: boolean; doodles: boolean; postmark: boolean;
}
export const NOTE_PAPERS = [
  { c: '#fbf6ec', n: 'Cream' }, { c: '#ffffff', n: 'White' }, { c: '#e7d3b4', n: 'Kraft' },
  { c: '#f9e1e6', n: 'Blush' }, { c: '#e3ecf6', n: 'Airmail' }, { c: '#e9efe0', n: 'Sage' }, { c: '#2b221d', n: 'Ink black' },
];
export const NOTE_INKS = ['#3b2a22', '#1f2a44', '#b6403a', '#c46a86', '#5a4bd0', '#2f6b4f', '#fbf6ec'];
export const NOTE_FONTS = ['Caveat', 'Homemade Apple', 'Pacifico', 'Special Elite', 'Instrument Serif', 'Cormorant Garamond', 'DM Sans'];

export function defaultNote(): Note {
  return {
    enabled: false, text: 'thank you for this little moment.\nlet’s keep making more of them ♡', to: '', from: '',
    font: 'Caveat', ink: '#3b2a22', paper: '#fbf6ec', lined: true, showDate: true, doodles: true, postmark: false,
  };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  text.split('\n').forEach((para) => {
    if (!para.trim()) { out.push(''); return; }
    let line = '';
    para.split(/\s+/).forEach((w) => {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; }
      else line = test;
    });
    out.push(line);
  });
  return out;
}
const isDark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath(); ctx.moveTo(x, y + s * .35);
  ctx.bezierCurveTo(x - s, y - s * .3, x - s * .4, y - s, x, y - s * .45);
  ctx.bezierCurveTo(x + s * .4, y - s, x + s, y - s * .3, x, y + s * .35); ctx.stroke();
}
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.stroke();
}

export function renderBack(note: Note, W: number, H: number, mult = 1): HTMLCanvasElement {
  const c = makeCanvas(W * mult, H * mult), ctx = c.getContext('2d')!;
  ctx.scale(mult, mult);
  const dark = isDark(note.paper);
  const rand = mulberry32(7);
  // paper + fibres
  ctx.fillStyle = note.paper; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / 900; i++) {
    ctx.fillStyle = dark ? `rgba(255,255,255,${rand() * .05})` : `rgba(90,60,40,${rand() * .05})`;
    ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2);
  }
  const m = Math.max(28, Math.min(W, H) * .08);
  const unit = Math.min(W, 900);
  const fdef = FONT_MAP[note.font];
  const fam = fdef?.css ?? note.font;
  const fscale = fdef?.scale ?? 1;
  const faint = dark ? 'rgba(255,255,255,.35)' : 'rgba(74,47,36,.45)';

  // header
  ctx.fillStyle = faint; ctx.textBaseline = 'alphabetic';
  ctx.font = `${Math.round(unit * .028)}px "Special Elite", monospace`;
  ctx.textAlign = 'left'; ctx.fillText('a little note —', m, m + unit * .03);

  let top = m + unit * .07;
  const bottomReserve = unit * ((note.from ? .1 : 0) + (note.showDate ? .07 : 0)) + m;

  // "To" line
  if (note.to) {
    ctx.fillStyle = note.ink;
    ctx.font = `${Math.round(unit * .07 * fscale)}px ${fam}`;
    ctx.fillText(`to ${note.to},`, m, top + unit * .07);
    top += unit * .11;
  }

  // body — auto-fit font size to the space
  const areaH = H - top - bottomReserve, maxW = W - m * 2;
  let fs = Math.min(unit * .075, 72) * fscale, lines: string[] = [], lh = 0;
  for (let i = 0; i < 40; i++) {
    ctx.font = `${fs}px ${fam}`;
    lines = wrap(ctx, note.text || '', maxW);
    lh = fs * (note.font === 'Homemade Apple' ? 1.9 : 1.45);
    if (lines.length * lh <= areaH || fs < 12) break;
    fs *= .92;
  }
  // ruled lines aligned to text baselines
  if (note.lined) {
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.12)' : 'rgba(80,110,170,.22)'; ctx.lineWidth = 1.2;
    for (let y = top + lh; y < H - m * .6; y += lh) { ctx.beginPath(); ctx.moveTo(m * .5, y + fs * .18); ctx.lineTo(W - m * .5, y + fs * .18); ctx.stroke(); }
    ctx.strokeStyle = dark ? 'rgba(255,140,140,.25)' : 'rgba(200,70,70,.28)';
    ctx.beginPath(); ctx.moveTo(m * .75, 0); ctx.lineTo(m * .75, H); ctx.stroke();
  }
  ctx.fillStyle = note.ink; ctx.font = `${fs}px ${fam}`; ctx.textAlign = 'left';
  lines.forEach((ln, i) => ctx.fillText(ln, m, top + lh * (i + 1)));

  // from + date
  let by = H - m;
  ctx.textAlign = 'right';
  if (note.showDate) {
    ctx.fillStyle = faint; ctx.font = `${Math.round(unit * .045 * (FONT_MAP.Caveat.scale))}px "Caveat", cursive`;
    ctx.fillText(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase(), W - m, by);
    by -= unit * .07;
  }
  if (note.from) {
    ctx.fillStyle = note.ink; ctx.font = `${Math.round(unit * .07 * fscale)}px ${fam}`;
    ctx.fillText(`— ${note.from}`, W - m, by);
  }

  if (note.doodles) {
    ctx.strokeStyle = note.ink; ctx.globalAlpha = .55; ctx.lineWidth = Math.max(2, unit * .005); ctx.lineCap = 'round';
    heart(ctx, W - m - unit * .02, m + unit * .02, unit * .03);
    star(ctx, W - m - unit * .09, m + unit * .045, unit * .018);
    if (!note.postmark) heart(ctx, m + unit * .03, H - m - unit * .01, unit * .025);
    ctx.globalAlpha = 1;
  }
  if (note.postmark) {
    const r = unit * .085, cx = m + r * 1.1, cy = H - m - r * 1.1;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.18); ctx.globalAlpha = .5;
    ctx.strokeStyle = dark ? '#f1c94c' : '#b6403a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${r * .26}px "Special Elite", monospace`; ctx.fillText('WITH LOVE', 0, -r * .12);
    ctx.font = `${r * .22}px "Special Elite", monospace`;
    const d = new Date(); ctx.fillText(`${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`, 0, r * .22);
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(r * 1.15, -r * .45 + i * r * .3); ctx.bezierCurveTo(r * 1.6, -r * .6 + i * r * .3, r * 2, -r * .3 + i * r * .3, r * 2.5, -r * .45 + i * r * .3); ctx.stroke(); }
    ctx.restore();
  }
  return c;
}

/** Front and back side by side on one sheet (for sharing/printing). */
export function sideBySide(front: HTMLImageElement | HTMLCanvasElement, back: HTMLCanvasElement | HTMLImageElement) {
  const gap = Math.round(front.width * .06), pad = gap;
  const c = makeCanvas(front.width + back.width + gap + pad * 2, Math.max(front.height, back.height) + pad * 2);
  const x = c.getContext('2d')!;
  x.fillStyle = '#efe6d8'; x.fillRect(0, 0, c.width, c.height);
  x.shadowColor = 'rgba(60,35,20,.3)'; x.shadowBlur = gap * .4; x.shadowOffsetY = gap * .15;
  x.drawImage(front, pad, pad); x.drawImage(back, pad + front.width + gap, pad);
  return c;
}
