// Sticker library: hand-drawn SVG stickers (original artwork) + emoji. Everything renders locally.
const INK = '#4a2f24';
const S = (vb: string, inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
const st = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

const heartPath = 'M50 88 C18 64 5 45 14 28 C23 11 43 14 50 30 C57 14 77 11 86 28 C95 45 82 64 50 88Z';
const heart = (fill: string, shine = true) => S('0 0 100 100', `<path d="${heartPath}" fill="${fill}" ${st}/>${shine ? '<ellipse cx="31" cy="33" rx="8" ry="5" fill="#fff" opacity=".75" transform="rotate(-35 31 33)"/>' : ''}`);
const sparkle = (fill: string) => S('0 0 100 100', `<path d="M50 4 C54 40 60 46 96 50 C60 54 54 60 50 96 C46 60 40 54 4 50 C40 46 46 40 50 4Z" fill="${fill}" ${st}/>`);
const star5 = (fill: string) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 20 : 45, a = (i * Math.PI) / 5 - Math.PI / 2; p.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(52 + r * Math.sin(a)).toFixed(1)}`); }
  return S('0 0 100 100', `<polygon points="${p.join(' ')}" fill="${fill}" ${st}/>`);
};
const burst = (fill: string, txt = '', tc = INK) => {
  const p: string[] = []; const n = 14;
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? 36 : 47, a = (i * Math.PI) / n - Math.PI / 2; p.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`); }
  return S('0 0 100 100', `<polygon points="${p.join(' ')}" fill="${fill}" ${st}/>${txt ? `<text x="50" y="57" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="${txt.length > 4 ? 15 : 20}" fill="${tc}" transform="rotate(-10 50 50)">${txt}</text>` : ''}`);
};
const bow = (fill: string, knot: string) => S('0 0 120 100', `
  <path d="M60 42 C45 20 14 12 10 30 C6 48 34 58 60 50Z" fill="${fill}" ${st}/>
  <path d="M60 42 C75 20 106 12 110 30 C114 48 86 58 60 50Z" fill="${fill}" ${st}/>
  <path d="M56 50 C50 66 40 80 30 94 L44 92 L50 98 C56 82 60 66 60 52Z" fill="${fill}" ${st}/>
  <path d="M64 50 C70 66 80 80 90 94 L76 92 L70 98 C64 82 60 66 60 52Z" fill="${fill}" ${st}/>
  <rect x="50" y="36" width="20" height="20" rx="7" fill="${knot}" ${st}/>
  <path d="M22 30 C30 26 40 30 48 38 M98 30 C90 26 80 30 72 38" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`);
const balloon = (fill: string) => S('0 0 80 130', `<path d="M40 88 C40 100 32 108 38 118 C44 126 36 128 40 130" stroke="${INK}" stroke-width="2.5" fill="none"/><ellipse cx="40" cy="44" rx="32" ry="40" fill="${fill}" ${st}/><path d="M34 84 L46 84 L40 92Z" fill="${fill}" ${st}/><ellipse cx="27" cy="28" rx="7" ry="12" fill="#fff" opacity=".55" transform="rotate(25 27 28)"/>`);
const daisy = (petal: string, center: string) => S('0 0 100 100', Array.from({ length: 10 }, (_, i) => `<ellipse cx="50" cy="25" rx="11" ry="21" fill="${petal}" ${st} transform="rotate(${i * 36} 50 50)"/>`).join('') + `<circle cx="50" cy="50" r="14" fill="${center}" ${st}/>`);
const tape = (a: string, b: string) => S('0 0 160 40', `<defs><pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="${a}"/><rect x="6" width="6" height="12" fill="${b}"/></pattern></defs><path d="M4 4 L156 4 L151 12 L156 20 L151 28 L156 36 L4 36 L9 28 L4 20 L9 12Z" fill="url(#p)" opacity=".86"/>`);
const tapeSolid = (a: string) => S('0 0 160 40', `<path d="M4 4 L156 4 L151 12 L156 20 L151 28 L156 36 L4 36 L9 28 L4 20 L9 12Z" fill="${a}" opacity=".78"/>`);

export function badge(text: string, bg: string, fg: string, opts: { font?: string; size?: number; shape?: 'pill' | 'ticket' | 'label' | 'script' } = {}) {
  const font = opts.font ?? 'Arial Black,Impact,sans-serif';
  const fs = opts.size ?? 27;
  const w = Math.round(text.length * fs * .78 + 48);
  if (opts.shape === 'script') {
    return S(`0 0 ${w} 70`, `<text x="${w / 2}" y="48" text-anchor="middle" font-family="${font}" font-size="${fs + 6}" fill="${fg}" stroke="#fff" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${text}</text>`);
  }
  if (opts.shape === 'ticket') {
    return S(`0 0 ${w} 62`, `<path d="M4 4 H${w - 4} V22 A9 9 0 0 0 ${w - 4} 40 V58 H4 V40 A9 9 0 0 0 4 22Z" fill="${bg}" ${st}/><path d="M18 12 H${w - 18} V50 H18Z" fill="none" stroke="${fg}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="5 4"/><text x="${w / 2}" y="40" text-anchor="middle" font-family="${font}" font-size="${fs * .85}" fill="${fg}" letter-spacing="2">${text}</text>`);
  }
  if (opts.shape === 'label') {
    return S(`0 0 ${w} 56`, `<rect x="3" y="3" width="${w - 6}" height="50" rx="6" fill="${bg}" ${st}/><text x="${w / 2}" y="37" text-anchor="middle" font-family="${font}" font-size="${fs * .9}" fill="${fg}" letter-spacing="1">${text}</text>`);
  }
  return S(`0 0 ${w} 62`, `<rect x="3" y="3" width="${w - 6}" height="56" rx="28" fill="${bg}" ${st}/><text x="${w / 2}" y="41" text-anchor="middle" font-family="${font}" font-size="${fs}" fill="${fg}" letter-spacing="1">${text}</text>`);
}

export const SVG: Record<string, string> = {
  // love
  heartRed: heart('#c8453e'), heartPink: heart('#f2a9b8'), heartCream: heart('#fbf1dc'),
  heartDoodle: S('0 0 100 100', `<path d="${heartPath}" fill="none" stroke="#c8453e" stroke-width="5" stroke-linecap="round"/><path d="M30 40 C35 30 45 32 48 40" stroke="#c8453e" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  letter: S('0 0 120 86', `<rect x="4" y="4" width="112" height="78" rx="6" fill="#fbf1dc" ${st}/><path d="M4 8 L60 50 L116 8" fill="none" ${st}/><path d="${'M60 70 C46 60 40 52 44 45 C48 38 56 40 60 47 C64 40 72 38 76 45 C80 52 74 60 60 70Z'}" fill="#c8453e" stroke="${INK}" stroke-width="2.5"/>`),
  cherry: S('0 0 100 100', `<path d="M33 66 Q40 35 62 12 M70 64 Q62 40 62 12" fill="none" stroke="#3d6b2f" stroke-width="4" stroke-linecap="round"/><path d="M62 12 Q80 6 90 22 Q72 27 62 12Z" fill="#6aa04a" ${st}/><circle cx="31" cy="73" r="17" fill="#b8282f" ${st}/><circle cx="70" cy="71" r="17" fill="#b8282f" ${st}/><circle cx="25" cy="67" r="4" fill="#fff" opacity=".85"/><circle cx="64" cy="65" r="4" fill="#fff" opacity=".85"/>`),
  lovebadge: badge('LOVE YOU', '#f2a9b8', '#8f2430', { shape: 'pill' }),
  xoxo: badge('xoxo', '#fff', '#c8453e', { shape: 'script', font: 'Brush Script MT,cursive', size: 40 }),
  // flowers
  daisy: daisy('#ffffff', '#f1c94c'), daisyPink: daisy('#f6c3cf', '#f8e3a0'),
  tulip: S('0 0 80 130', `<path d="M40 60 V126" stroke="#5f8a46" stroke-width="5"/><path d="M40 100 C26 90 16 92 12 80 C26 78 36 86 40 96" fill="#7aa75a" ${st}/><path d="M18 22 C20 50 30 62 40 62 C50 62 60 50 62 22 L50 34 L40 14 L30 34Z" fill="#e88a9c" ${st}/>`),
  sprig: S('0 0 80 140', `<path d="M40 136 C40 100 38 60 44 8" stroke="#6b7f4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>` + [20, 40, 60, 80, 100].map((y, i) => `<ellipse cx="${i % 2 ? 54 : 28}" cy="${y}" rx="13" ry="6" fill="#a9b77d" stroke="#6b7f4a" stroke-width="2.5" transform="rotate(${i % 2 ? -35 : 35} ${i % 2 ? 54 : 28} ${y})"/>`).join('')),
  bouquet: S('0 0 100 120', `<path d="M38 70 L50 116 L62 70Z" fill="#efe0c6" ${st}/><path d="M42 92 C50 86 58 92 60 98 L50 104Z" fill="#e88a9c" ${st}/><circle cx="34" cy="48" r="16" fill="#f2a9b8" ${st}/><circle cx="64" cy="44" r="16" fill="#f8e3a0" ${st}/><circle cx="50" cy="28" r="16" fill="#fbf1dc" ${st}/><circle cx="50" cy="28" r="5" fill="#f1c94c"/><circle cx="34" cy="48" r="5" fill="#c8453e"/><circle cx="64" cy="44" r="5" fill="#e88a2f"/>`),
  // stars & sparkles
  sparkleW: sparkle('#ffffff'), sparkleP: sparkle('#f6c3cf'), sparkleG: sparkle('#f1d27a'),
  starGold: star5('#f1c94c'), starPink: star5('#f2a9b8'),
  twinkles: S('0 0 120 100', `<path d="M40 10 C43 36 47 40 72 44 C47 48 43 52 40 78 C37 52 33 48 8 44 C33 40 37 36 40 10Z" fill="#fff" ${st}/><path d="M92 50 C94 64 96 66 110 68 C96 70 94 72 92 86 C90 72 88 70 74 68 C88 66 90 64 92 50Z" fill="#f1d27a" ${st}/><circle cx="96" cy="20" r="6" fill="#f2a9b8" ${st}/>`),
  burstStar: burst('#f1c94c'), burstWow: burst('#c8453e', 'WOW!', '#fff'),
  moon: S('0 0 100 100', `<path d="M66 8 C36 12 18 40 26 66 C34 90 64 98 88 82 C60 84 40 64 44 40 C46 26 54 14 66 8Z" fill="#f8e3a0" ${st}/><circle cx="46" cy="58" r="4" fill="${INK}" opacity=".25"/>`),
  // birthday
  cake: S('0 0 120 120', `<rect x="20" y="62" width="80" height="44" rx="6" fill="#f6c3cf" ${st}/><rect x="30" y="38" width="60" height="28" rx="6" fill="#fbf1dc" ${st}/><path d="M20 76 Q30 86 40 76 Q50 86 60 76 Q70 86 80 76 Q90 86 100 76" fill="none" stroke="#fff" stroke-width="5"/><path d="M30 50 Q40 58 50 50 Q60 58 70 50 Q80 58 90 50" fill="none" stroke="#f2a9b8" stroke-width="4"/>${[44, 60, 76].map(x => `<rect x="${x - 3}" y="18" width="6" height="20" rx="2" fill="#b9d1e3" ${st}/><path d="M${x} 4 C${x + 6} 10 ${x + 4} 16 ${x} 16 C${x - 4} 16 ${x - 6} 10 ${x} 4Z" fill="#f1a33c"/>`).join('')}<rect x="10" y="104" width="100" height="8" rx="4" fill="#c9b9de" ${st}/>`),
  balloonPink: balloon('#f2a9b8'), balloonBlue: balloon('#a9c7e8'), balloonLilac: balloon('#c9b9de'),
  partyHat: S('0 0 90 110', `<path d="M45 8 L80 100 H10Z" fill="#c9b9de" ${st}/><path d="M30 48 L58 48 M22 70 L68 70" stroke="#fff" stroke-width="7"/><circle cx="45" cy="8" r="9" fill="#f1c94c" ${st}/><path d="M6 100 Q45 112 84 100" fill="none" ${st}/>`),
  confetti: S('0 0 120 100', [['#f2a9b8', 10, 20, 20], ['#f1c94c', 50, 10, -30], ['#a9c7e8', 90, 24, 40], ['#c9b9de', 30, 60, 60], ['#c8453e', 74, 66, -20], ['#a9b77d', 100, 80, 10], ['#f2a9b8', 54, 88, 70]].map(([c, x, y, r]) => `<rect x="${x}" y="${y}" width="12" height="6" rx="2" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('') + '<circle cx="20" cy="84" r="4" fill="#f1c94c"/><circle cx="108" cy="46" r="4" fill="#f2a9b8"/>'),
  hbd: badge('HAPPY BIRTHDAY', '#f6c3cf', INK, { shape: 'ticket', size: 24 }),
  // travel
  stamp: S('0 0 100 120', `<path d="M6 6 ${Array.from({ length: 9 }, (_, i) => `L${12 + i * 10} 6`).join(' ')} L94 6 L94 114 L6 114Z" fill="#fbf1dc" stroke="${INK}" stroke-width="3" stroke-dasharray="6 4"/><rect x="16" y="16" width="68" height="70" fill="#a9c7e8" ${st}/><circle cx="64" cy="36" r="9" fill="#f1c94c"/><path d="M16 86 L36 56 L50 72 L62 60 L84 86Z" fill="#7aa75a" ${st}/><text x="50" y="104" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${INK}">AIR MAIL</text>`),
  postcard: S('0 0 140 96', `<rect x="4" y="4" width="132" height="88" rx="4" fill="#fbf1dc" ${st}/><path d="M74 14 V82" stroke="${INK}" stroke-width="2"/><rect x="108" y="12" width="20" height="24" fill="#f2a9b8" stroke="${INK}" stroke-width="2"/><path d="M84 52 H126 M84 64 H126 M84 76 H120" stroke="${INK}" stroke-width="2" opacity=".5"/><text x="38" y="44" text-anchor="middle" font-family="Brush Script MT,cursive" font-size="22" fill="#c8453e">Greetings</text><text x="38" y="66" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="13" fill="${INK}">from here</text>`),
  plane: S('0 0 140 80', `<path d="M8 44 C40 38 90 34 124 30 C134 30 136 38 128 42 C96 50 50 54 14 54Z" fill="#fbf1dc" ${st}/><path d="M66 38 L44 8 L58 8 L90 36Z" fill="#a9c7e8" ${st}/><path d="M64 50 L46 74 L60 74 L86 48Z" fill="#a9c7e8" ${st}/><path d="M18 44 L10 22 L22 22 L32 42Z" fill="#c8453e" ${st}/><path d="M96 38 h6 M106 36 h6 M116 35 h4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`),
  pin: S('0 0 80 110', `<path d="M40 104 C24 76 8 62 8 40 C8 20 22 6 40 6 C58 6 72 20 72 40 C72 62 56 76 40 104Z" fill="#c8453e" ${st}/><circle cx="40" cy="40" r="13" fill="#fbf1dc" ${st}/>`),
  locTag: badge('📍 somewhere nice', '#fbf1dc', INK, { shape: 'label', font: 'Georgia,serif', size: 24 }),
  bonVoyage: badge('BON VOYAGE', '#a9c7e8', INK, { shape: 'ticket', size: 24 }),
  // music
  vinyl: S('0 0 100 100', `<circle cx="50" cy="50" r="46" fill="#231a15"/><g fill="none" stroke="#45372e" stroke-width="1.6"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="28"/></g><path d="M22 30 A34 34 0 0 1 40 18" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="50" cy="50" r="15" fill="#c8453e"/><circle cx="50" cy="50" r="3" fill="#fbf1dc"/>`),
  cassette: S('0 0 140 90', `<rect x="4" y="4" width="132" height="82" rx="9" fill="${INK}"/><rect x="16" y="13" width="108" height="42" rx="4" fill="#f2a9b8"/><rect x="16" y="13" width="108" height="11" fill="#c8453e"/><circle cx="48" cy="40" r="10" fill="#fbf1dc"/><circle cx="92" cy="40" r="10" fill="#fbf1dc"/><rect x="58" y="34" width="24" height="12" fill="${INK}" opacity=".55"/><path d="M36 86 L44 66 H96 L104 86Z" fill="#6b5446"/><text x="70" y="22" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="8" fill="#fff">MIXTAPE</text>`),
  notes: S('0 0 110 100', `<path d="M30 78 V22 L90 10 V66" fill="none" ${st} stroke-width="5"/><path d="M30 22 L90 10 V24 L30 36Z" fill="${INK}"/><ellipse cx="20" cy="80" rx="13" ry="10" fill="${INK}" transform="rotate(-20 20 80)"/><ellipse cx="80" cy="68" rx="13" ry="10" fill="${INK}" transform="rotate(-20 80 68)"/>`),
  // retro
  camera: S('0 0 120 90', `<rect x="6" y="20" width="108" height="64" rx="10" fill="#7b5644" ${st}/><rect x="6" y="38" width="108" height="10" fill="#c9a27a"/><rect x="18" y="10" width="26" height="14" rx="3" fill="${INK}"/><circle cx="64" cy="54" r="22" fill="#fbf1dc" ${st}/><circle cx="64" cy="54" r="12" fill="#3c5a78" ${st}/><circle cx="59" cy="49" r="3.5" fill="#fff"/><rect x="92" y="26" width="14" height="8" rx="2" fill="#f1c94c"/>`),
  filmRoll: S('0 0 140 70', `<rect x="4" y="8" width="132" height="54" fill="#2b221d"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${10 + i * 12}" y="12" width="6" height="6" rx="1" fill="#fbf1dc"/><rect x="${10 + i * 12}" y="52" width="6" height="6" rx="1" fill="#fbf1dc"/>`).join('')}<rect x="12" y="22" width="36" height="26" fill="#d98c8c"/><rect x="52" y="22" width="36" height="26" fill="#e9b44c"/><rect x="92" y="22" width="36" height="26" fill="#a9c7e8"/>`),
  polaroidFrame: S('0 0 100 120', `<rect x="4" y="4" width="92" height="112" rx="3" fill="#fff" ${st}/><rect x="12" y="12" width="76" height="70" fill="#d9c4a5"/><circle cx="64" cy="34" r="8" fill="#f1d27a"/><path d="M12 82 L36 52 L52 68 L64 56 L88 82Z" fill="#a9b77d"/>`),
  smileyRetro: S('0 0 100 100', `<circle cx="50" cy="50" r="45" fill="#f1c94c" ${st}/><ellipse cx="36" cy="40" rx="5" ry="9" fill="${INK}"/><ellipse cx="64" cy="40" rx="5" ry="9" fill="${INK}"/><path d="M27 58 Q50 84 73 58" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  groovy: badge('GROOVY', '#f1c94c', INK), est: badge('EST. 1979', '#2b221d', '#f1c94c', { shape: 'label' }),
  // y2k
  butterfly: S('0 0 120 100', `<path d="M60 50 C40 10 6 12 10 36 C12 52 36 54 58 52Z" fill="#a9c7e8" ${st}/><path d="M60 50 C80 10 114 12 110 36 C108 52 84 54 62 52Z" fill="#a9c7e8" ${st}/><path d="M58 54 C36 56 20 76 30 88 C40 96 54 76 60 58Z" fill="#c9b9de" ${st}/><path d="M62 54 C84 56 100 76 90 88 C80 96 66 76 60 58Z" fill="#c9b9de" ${st}/><path d="M60 30 V84" ${st} stroke-width="6"/><path d="M58 30 C54 20 48 14 44 12 M62 30 C66 20 72 14 76 12" fill="none" ${st}/>`),
  chromeHeart: S('0 0 100 100', `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#b9c3cf"/><stop offset=".55" stop-color="#eef2f6"/><stop offset=".8" stop-color="#8d98a6"/><stop offset="1" stop-color="#dfe5ec"/></linearGradient></defs><path d="${heartPath}" fill="url(#g)" stroke="#5a6470" stroke-width="3"/><ellipse cx="32" cy="32" rx="9" ry="5" fill="#fff" transform="rotate(-35 32 32)"/>`),
  chromeStar: S('0 0 100 100', `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#b9c3cf"/><stop offset=".6" stop-color="#f4f6f9"/><stop offset="1" stop-color="#8d98a6"/></linearGradient></defs><path d="M50 2 C54 40 60 46 98 50 C60 54 54 60 50 98 C46 60 40 54 2 50 C40 46 46 40 50 2Z" fill="url(#g)" stroke="#5a6470" stroke-width="3"/>`),
  flipPhone: S('0 0 70 130', `<rect x="10" y="4" width="50" height="60" rx="10" fill="#f2a9b8" ${st}/><rect x="18" y="12" width="34" height="40" rx="4" fill="#cfe3f0" ${st}/><rect x="10" y="66" width="50" height="60" rx="10" fill="#f2a9b8" ${st}/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${23 + c * 12}" cy="${84 + r * 12}" r="3.5" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`).join('')).join('')}<text x="35" y="38" text-anchor="middle" font-family="Arial" font-size="12" fill="${INK}">:)</text>`),
  y2kBadge: badge('Y2K BABY', '#c9b9de', '#fff', { shape: 'pill' }),
  // bows
  bowPink: bow('#f2a9b8', '#e98ea3'), bowRed: bow('#c8453e', '#a8352f'), bowCream: bow('#fbf1dc', '#efdcbc'), bowBlack: bow('#2b221d', '#463830'),
  pearls: S('0 0 160 60', Array.from({ length: 11 }, (_, i) => { const x = 10 + i * 14, y = 14 + Math.sin(i / 10 * Math.PI) * 30; return `<circle cx="${x}" cy="${y}" r="8" fill="#fbf7ef" stroke="#c9b9a6" stroke-width="2"/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.5" fill="#fff"/>`; }).join('')),
  lace: S('0 0 100 100', `<path d="${heartPath}" fill="#fff" stroke="#e5c7c7" stroke-width="10" stroke-dasharray="2 5" stroke-linecap="round"/><path d="${heartPath}" fill="#fff" stroke="#e5c7c7" stroke-width="2" transform="scale(.8) translate(12 10)"/>`),
  // emoticons
  smiley: S('0 0 100 100', `<circle cx="50" cy="50" r="45" fill="#f8e3a0" ${st}/><circle cx="36" cy="42" r="5" fill="${INK}"/><circle cx="64" cy="42" r="5" fill="${INK}"/><ellipse cx="26" cy="58" rx="7" ry="4" fill="#f2a9b8"/><ellipse cx="74" cy="58" rx="7" ry="4" fill="#f2a9b8"/><path d="M38 60 Q50 72 62 60" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`),
  kao1: badge('(◕‿◕)', '#fbf1dc', INK, { shape: 'pill', font: 'Arial,sans-serif' }),
  kao2: badge('ʕ•ᴥ•ʔ', '#f6c3cf', INK, { shape: 'pill', font: 'Arial,sans-serif' }),
  kao3: badge('<3', '#c8453e', '#fff', { shape: 'pill' }),
  bubble: S('0 0 120 90', `<path d="M10 8 H110 V60 H52 L30 84 L34 60 H10Z" fill="#fff" ${st}/><text x="60" y="44" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="25" fill="#c8453e">hi!!</text>`),
  // seasonal
  snowflake: S('0 0 100 100', `<g stroke="#8db3d6" stroke-width="5" stroke-linecap="round" fill="none">${[0, 60, 120].map(r => `<g transform="rotate(${r} 50 50)"><path d="M50 6 V94"/><path d="M50 22 L40 12 M50 22 L60 12 M50 78 L40 88 M50 78 L60 88"/></g>`).join('')}</g><circle cx="50" cy="50" r="6" fill="#fff" stroke="#8db3d6" stroke-width="3"/>`),
  xmasTree: S('0 0 100 120', `<path d="M50 6 L88 92 H12Z" fill="#5f8a5a" ${st}/><path d="M24 64 Q50 76 76 60 M32 40 Q50 50 66 38" fill="none" stroke="#f1d27a" stroke-width="3"/><rect x="42" y="92" width="16" height="18" fill="#7b5644" ${st}/>${[[40, 54, '#c8453e'], [62, 72, '#f1c94c'], [34, 80, '#a9c7e8'], [56, 40, '#f2a9b8']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="${INK}" stroke-width="2"/>`).join('')}<path d="M50 0 L53 7 L60 7 L54 11 L56 18 L50 14 L44 18 L46 11 L40 7 L47 7Z" fill="#f1c94c" stroke="${INK}" stroke-width="2"/>`),
  gift: S('0 0 100 100', `<rect x="12" y="40" width="76" height="54" fill="#c8453e" ${st}/><rect x="6" y="26" width="88" height="18" fill="#d8574f" ${st}/><rect x="44" y="26" width="12" height="68" fill="#f1d27a" stroke="${INK}" stroke-width="3"/><path d="M50 26 C40 8 22 10 28 22 C32 28 44 26 50 26 C56 26 68 28 72 22 C78 10 60 8 50 26Z" fill="#f1d27a" ${st}/>`),
  pumpkin: S('0 0 110 100', `<path d="M54 18 C54 10 58 6 64 4" stroke="#5f6f3a" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="58" rx="24" ry="34" fill="#e8823a" ${st}/><ellipse cx="76" cy="58" rx="24" ry="34" fill="#e8823a" ${st}/><ellipse cx="55" cy="58" rx="22" ry="36" fill="#f09447" ${st}/><path d="M40 52 L48 44 L52 54Z M70 52 L62 44 L58 54Z" fill="${INK}"/><path d="M38 68 Q55 82 72 68 L66 72 L60 68 L55 74 L50 68 L44 72Z" fill="${INK}"/>`),
  ghost: S('0 0 90 110', `<path d="M10 100 V44 C10 22 26 6 45 6 C64 6 80 22 80 44 V100 L68 90 L57 100 L45 90 L33 100 L22 90Z" fill="#fbf7ef" ${st}/><ellipse cx="34" cy="44" rx="5" ry="8" fill="${INK}"/><ellipse cx="56" cy="44" rx="5" ry="8" fill="${INK}"/><ellipse cx="45" cy="62" rx="6" ry="5" fill="${INK}"/><ellipse cx="24" cy="54" rx="5" ry="3" fill="#f2a9b8"/><ellipse cx="66" cy="54" rx="5" ry="3" fill="#f2a9b8"/>`),
  bat: S('0 0 140 70', `<path d="M70 20 C64 20 62 26 62 30 C50 18 34 12 8 18 C20 24 24 34 22 44 C30 38 40 38 46 46 C52 38 60 40 66 48 L70 56 L74 48 C80 40 88 38 94 46 C100 38 110 38 118 44 C116 34 120 24 132 18 C106 12 90 18 78 30 C78 26 76 20 70 20Z" fill="#2b221d"/><path d="M64 14 L66 22 M76 14 L74 22" stroke="#2b221d" stroke-width="4"/><circle cx="66" cy="30" r="2" fill="#f1c94c"/><circle cx="74" cy="30" r="2" fill="#f1c94c"/>`),
  leaf: S('0 0 100 100', `<path d="M50 6 L58 30 L80 22 L72 44 L94 50 L72 58 L80 80 L58 70 L50 94 L42 70 L20 80 L28 58 L6 50 L28 44 L20 22 L42 30Z" fill="#d8743a" ${st}/><path d="M50 30 V98" stroke="${INK}" stroke-width="3"/>`),
  // celebrate
  gradCap: S('0 0 140 100', `<path d="M70 8 L134 36 L70 64 L6 36Z" fill="#231d1a" ${st}/><path d="M34 50 V74 C50 90 90 90 106 74 V50 L70 66Z" fill="#2f2723" ${st}/><path d="M70 36 L118 46 V78" stroke="#e2b64a" stroke-width="4" fill="none"/><path d="M112 78 L118 98 L124 78Z" fill="#e2b64a" stroke="${INK}" stroke-width="2"/><circle cx="70" cy="36" r="5" fill="#e2b64a"/>`),
  diploma: S('0 0 140 80', `<rect x="14" y="18" width="112" height="44" rx="22" fill="#fbf1dc" ${st}/><ellipse cx="22" cy="40" rx="10" ry="22" fill="#efdcbc" ${st}/><path d="M64 18 V62 M76 18 V62" stroke="#c8453e" stroke-width="7"/><path d="M70 62 L60 78 M70 62 L80 78" stroke="#c8453e" stroke-width="5" stroke-linecap="round"/>`),
  medal: S('0 0 90 120', `<path d="M20 4 L40 50 L52 46 L34 4Z" fill="#3c5a78" ${st}/><path d="M70 4 L50 50 L38 46 L56 4Z" fill="#c8453e" ${st}/><circle cx="45" cy="76" r="32" fill="#e2b64a" ${st}/><circle cx="45" cy="76" r="22" fill="none" stroke="#fff3c4" stroke-width="3"/><text x="45" y="86" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="28" fill="${INK}">1</text>`),
  champagne: S('0 0 100 120', `<path d="M24 10 H50 C50 40 44 52 37 52 C30 52 24 40 24 10Z" fill="#f6e3a6" ${st}/><path d="M37 52 V96 M26 98 H48" ${st}/><path d="M52 18 H78 C78 48 72 60 65 60 C58 60 52 48 52 18Z" fill="#f6e3a6" ${st}/><path d="M65 60 V102 M54 104 H76" ${st}/><circle cx="33" cy="26" r="2.5" fill="#fff"/><circle cx="66" cy="34" r="2.5" fill="#fff"/><path d="M48 6 L52 0 M58 8 L64 4 M40 4 L38 -2" stroke="#e2b64a" stroke-width="3"/>`),
  rings: S('0 0 120 90', `<circle cx="44" cy="52" r="30" fill="none" stroke="#e2b64a" stroke-width="8"/><circle cx="76" cy="52" r="30" fill="none" stroke="#d9c4a5" stroke-width="8"/><path d="M38 14 L44 4 L50 14 L44 22Z" fill="#dff1f8" stroke="${INK}" stroke-width="2"/>`),
  // tape & labels
  tapePink: tape('#f2a9b8', '#fde4ec'), tapeSage: tape('#a9b77d', '#e5ead6'), tapeKraft: tapeSolid('#d9b98c'), tapeButter: tapeSolid('#f1d99a'), tapeLilac: tape('#c9b9de', '#efe8f7'),
  labelToday: badge('today ♡', '#fbf1dc', INK, { shape: 'label', font: 'Georgia,serif' }),
  labelMemories: badge('MEMORIES', '#2b221d', '#fbf1dc', { shape: 'label', font: 'Courier New,monospace' }),
};

export interface StickerItem { id: string; kind: 'svg' | 'emoji'; src: string }
export interface StickerCat { id: string; name: string; icon: string; items: StickerItem[] }

const svgs = (ids: string[]): StickerItem[] => ids.map((id) => ({ id, kind: 'svg', src: SVG[id] }));
const emo = (s: string): StickerItem[] => [...new Intl.Segmenter().segment(s)].map((x) => x.segment).filter((x) => x.trim()).map((e) => ({ id: 'e:' + e, kind: 'emoji', src: e }));

export const STICKER_CATS: StickerCat[] = [
  { id: 'love', name: 'Hearts & Love', icon: '💗', items: [...svgs(['heartRed', 'heartPink', 'heartCream', 'heartDoodle', 'letter', 'cherry', 'lovebadge', 'xoxo']), ...emo('💋🌹💌💘💞🫶😘💍')] },
  { id: 'flowers', name: 'Flowers', icon: '🌷', items: [...svgs(['daisy', 'daisyPink', 'tulip', 'sprig', 'bouquet']), ...emo('🌸🌼🌻🌷💐🪷🌺🍀')] },
  { id: 'stars', name: 'Stars & Sparkles', icon: '✨', items: [...svgs(['sparkleW', 'sparkleP', 'sparkleG', 'starGold', 'starPink', 'twinkles', 'burstStar', 'burstWow', 'moon']), ...emo('⭐🌟✨💫🌙')] },
  { id: 'animals', name: 'Cute Animals', icon: '🐰', items: emo('🐰🐻🐱🐶🦋🐞🐥🦢🐸🐼🦊🐨🐹🐧🦄🐝') },
  { id: 'food', name: 'Food & Drinks', icon: '🍓', items: [...svgs(['cherry']), ...emo('🍓🍰🧁🍩🍦☕🧋🍕🍪🥐🍋🍑🥂🍾🍿🍫')] },
  { id: 'birthday', name: 'Birthday', icon: '🎂', items: [...svgs(['cake', 'balloonPink', 'balloonBlue', 'balloonLilac', 'partyHat', 'confetti', 'hbd']), ...emo('🎂🎈🎉🎁🕯️🥳🎊')] },
  { id: 'travel', name: 'Travel', icon: '✈️', items: [...svgs(['stamp', 'postcard', 'plane', 'pin', 'locTag', 'bonVoyage']), ...emo('🧳🗺️🏝️🌍🚗📷⛱️🗼🌅')] },
  { id: 'music', name: 'Music', icon: '🎧', items: [...svgs(['vinyl', 'cassette', 'notes']), ...emo('🎧🎸🎵🎶🎤📻🎹🥁')] },
  { id: 'retro', name: 'Retro Objects', icon: '📼', items: [...svgs(['camera', 'filmRoll', 'polaroidFrame', 'smileyRetro', 'groovy', 'est', 'vinyl', 'cassette']), ...emo('📼💾☎️📟🕹️📺📻')] },
  { id: 'y2k', name: 'Y2K Accessories', icon: '🦋', items: [...svgs(['butterfly', 'chromeHeart', 'chromeStar', 'flipPhone', 'y2kBadge']), ...emo('💿📱🦋💅🎀👛🕶️')] },
  { id: 'bows', name: 'Coquette Bows', icon: '🎀', items: [...svgs(['bowPink', 'bowRed', 'bowCream', 'bowBlack', 'pearls', 'lace', 'heartPink', 'cherry']), ...emo('🎀🩰🦢🕯️')] },
  { id: 'emoticons', name: 'Emoticons', icon: '😊', items: [...svgs(['smiley', 'smileyRetro', 'kao1', 'kao2', 'kao3', 'bubble']), ...emo('😊🥹😍😎🤪😘🥰😜🤍')] },
  { id: 'seasonal', name: 'Seasonal', icon: '🎄', items: [...svgs(['snowflake', 'xmasTree', 'gift', 'pumpkin', 'ghost', 'bat', 'leaf']), ...emo('🎄🎃👻🦇❄️⛄🍁🎅🕸️🌞')] },
  { id: 'celebrate', name: 'Celebrate', icon: '🎓', items: [...svgs(['gradCap', 'diploma', 'medal', 'champagne', 'rings', 'starGold', 'confetti']), ...emo('🎓📜🏆🥂🍾💍👰🤵💐')] },
  { id: 'tape', name: 'Tape & Labels', icon: '🏷️', items: svgs(['tapePink', 'tapeSage', 'tapeKraft', 'tapeButter', 'tapeLilac', 'labelToday', 'labelMemories', 'est']) },
];

/** Rasterise a sticker (SVG or emoji) to a PNG image once and cache it. */
const cache = new Map<string, Promise<HTMLImageElement>>();
export function stickerImage(item: StickerItem): Promise<HTMLImageElement> {
  const key = item.id + (item.kind === 'svg' ? item.src.length : '');
  if (!cache.has(key)) cache.set(key, rasterise(item));
  return cache.get(key)!;
}
export function svgDataURL(svg: string) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

async function rasterise(item: StickerItem): Promise<HTMLImageElement> {
  const c = document.createElement('canvas');
  if (item.kind === 'emoji') {
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.font = '210px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(item.src, 128, 140);
  } else {
    const im = await loadImage(svgDataURL(item.src));
    const vb = item.src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const vw = vb ? +vb[1] : 100, vh = vb ? +vb[2] : 100, sc = 420 / Math.max(vw, vh);
    c.width = Math.round(vw * sc); c.height = Math.round(vh * sc);
    c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
  }
  return loadImage(c.toDataURL('image/png'));
}
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}
