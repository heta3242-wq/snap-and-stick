// Style variants per occasion: each one restyles the theme and comes with a starter sticker set.
import { THEME_MAP, themeBadges, type Theme } from './themes';
import { SVG, type StickerItem } from './stickers';

type Spec = Partial<Pick<Theme, 'bg' | 'pattern' | 'accent' | 'ink' | 'frame' | 'font' | 'caption' | 'filter' | 'palette'>> & { name: string; decor: string[] };

const V: Record<string, Spec[]> = {
  classic: [
    { name: 'Classic White', decor: [] },
    { name: 'Classic Black', bg: '#111111', ink: '#ffffff', frame: '#ffffff', filter: 'noir', decor: [] },
    { name: 'Cream Film', bg: '#f7f0e4', pattern: 'paper', accent: '#7b5644', ink: '#4a2f24', font: 'Special Elite', caption: 'say cheese', filter: 'analog', decor: [] },
    { name: 'Booth Red', bg: '#b6403a', ink: '#fbf6ec', frame: '#fbf6ec', font: 'Bagel Fat One', caption: 'PHOTO BOOTH', filter: 'film70', decor: ['starGold', 'sparkleW'] },
  ],
  birthday: [
    { name: 'Pastel Party', decor: ['balloonPink', 'balloonBlue', 'e:🎂', 'sparkleG'] },
    { name: 'Golden Gala', bg: '#1f1a17', pattern: 'none', accent: '#e2b64a', ink: '#e9cf8a', frame: '#e2b64a', font: 'Playfair Display', caption: 'cheers to another year', filter: 'golden', decor: ['champagne', 'starGold', 'sparkleG', 'confetti'] },
    { name: 'Confetti Pop', bg: '#fff4d6', pattern: 'confetti', accent: '#c8453e', ink: '#c8453e', font: 'Bagel Fat One', caption: "IT'S MY BIRTHDAY!", filter: 'y2k', decor: ['partyHat', 'confetti', 'burstWow', 'e:🎉'] },
    { name: 'Balloon Sky', bg: '#d7e8f5', pattern: 'dots', accent: '#ffffff', ink: '#3c5a78', font: 'Caveat', caption: 'make a wish ♡', filter: 'fuji', decor: ['balloonBlue', 'balloonLilac', 'balloonPink', 'e:☁️'] },
    { name: 'Sweet Sixteen', bg: '#e6dcf5', pattern: 'hearts', accent: '#f2c7cf', ink: '#7a3b55', font: 'Homemade Apple', caption: 'sweet & sixteen', filter: 'pastel', decor: ['cake', 'bowPink', 'sparkleP', 'heartPink'] },
  ],
  love: [
    { name: 'Blush Hearts', decor: ['heartRed', 'bowPink', 'e:🌹', 'cherry'] },
    { name: 'Red Romance', bg: '#7a1f27', pattern: 'none', ink: '#fbf1e6', frame: '#fbf1e6', font: 'Playfair Display', caption: 'be mine', filter: 'film70', decor: ['heartCream', 'e:🌹', 'sparkleW', 'letter'] },
    { name: 'Love Letter', bg: '#fbf1e6', pattern: 'paper', accent: '#c8453e', ink: '#8f2430', font: 'Caveat', caption: 'sealed with a kiss', filter: 'polaroid', decor: ['letter', 'e:💋', 'heartDoodle', 'tapePink'] },
    { name: 'Cherry Kiss', bg: '#fff7f2', pattern: 'gingham', accent: '#c8453e', ink: '#b8282f', font: 'Pacifico', caption: 'cherry on top', filter: 'kodak', decor: ['cherry', 'e:🍒', 'heartRed', 'bowRed'] },
    { name: 'Midnight Date', bg: '#1f2a44', pattern: 'stars', accent: '#f1d27a', ink: '#f9e1e6', font: 'Instrument Serif', caption: 'under the same moon', filter: 'dreamy', decor: ['moon', 'starGold', 'sparkleW', 'heartPink'] },
  ],
  friends: [
    { name: 'Gingham Picnic', decor: ['smileyRetro', 'daisy', 'e:🫶', 'starPink'] },
    { name: 'Doodle Chaos', bg: '#ffffff', pattern: 'grid', accent: '#a9c7e8', ink: '#4a2f24', font: 'Caveat', caption: 'certified chaos', filter: 'y2k', decor: ['smiley', 'bubble', 'kao1', 'twinkles'] },
    { name: 'Four-Cut Club', bg: '#1d1d1d', pattern: 'none', ink: '#ffffff', frame: '#ffffff', font: 'DM Sans', caption: 'friends ✿ forever', filter: 'pastel', decor: ['e:🐰', 'e:🐻', 'sparkleW', 'kao3'] },
    { name: 'Summer Daze', bg: '#cfe3d0', pattern: 'dots', accent: '#ffffff', ink: '#2f6b4f', font: 'Pacifico', caption: 'summer with you', filter: 'golden', decor: ['e:🍉', 'e:🕶️', 'sparkleG', 'e:🌼'] },
    { name: 'Scrapbook Gang', bg: '#ead9bd', pattern: 'paper', accent: '#7b5644', ink: '#4a2f24', font: 'Special Elite', caption: 'the usual suspects', filter: 'analog', decor: ['tapeKraft', 'tapePink', 'labelMemories', 'starGold'] },
  ],
  anniversary: [
    { name: 'Champagne', decor: ['champagne', 'e:🌹', 'sparkleG', 'heartCream'] },
    { name: 'Rose Garden', bg: '#f9e1e6', pattern: 'none', accent: '#d98c8c', ink: '#8f2430', font: 'Cormorant Garamond', caption: 'in full bloom', filter: 'softpink', decor: ['bouquet', 'e:🌹', 'tulip', 'heartPink'] },
    { name: 'Golden Years', bg: '#2b221d', pattern: 'none', accent: '#e2b64a', ink: '#e9cf8a', frame: '#e2b64a', font: 'Cormorant Garamond', caption: 'year after year', filter: 'kodak', decor: ['rings', 'starGold', 'sparkleG', 'e:🥂'] },
    { name: 'Love Notes', bg: '#fbf6ec', pattern: 'grid', accent: '#c9a477', ink: '#6b4a2e', font: 'Homemade Apple', caption: 'my favourite chapter', filter: 'polaroid', decor: ['letter', 'tapeButter', 'heartDoodle', 'labelToday'] },
    { name: 'Moonlit', bg: '#1f2a44', pattern: 'stars', accent: '#f1d27a', ink: '#f3e6d0', font: 'Instrument Serif', caption: 'to the moon & back', filter: 'dreamy', decor: ['moon', 'starGold', 'heartCream', 'sparkleW'] },
  ],
  graduation: [
    { name: 'Navy & Gold', decor: ['gradCap', 'diploma', 'starGold', 'sparkleG'] },
    { name: 'Black Tie', bg: '#151515', pattern: 'none', ink: '#e2b64a', font: 'Playfair Display', caption: 'WE DID IT!', filter: 'noir', decor: ['gradCap', 'medal', 'sparkleW', 'burstStar'] },
    { name: 'Class Confetti', bg: '#f3ead8', pattern: 'confetti', accent: '#c8a24a', ink: '#1f2a44', font: 'Bagel Fat One', caption: 'class of 2026', filter: 'y2k', decor: ['gradCap', 'confetti', 'e:🎉', 'starGold'] },
    { name: 'Ivy League', bg: '#24442f', pattern: 'none', ink: '#f3ead8', frame: '#f3ead8', font: 'Cormorant Garamond', caption: 'the future is bright', filter: 'analog', decor: ['diploma', 'medal', 'e:📚', 'starGold'] },
    { name: 'Yearbook', bg: '#ffffff', pattern: 'grid', accent: '#a9c7e8', ink: '#1f2a44', font: 'Special Elite', caption: 'most likely to succeed', filter: 'disposable', decor: ['tapeButter', 'gradCap', 'labelMemories', 'smileyRetro'] },
  ],
  christmas: [
    { name: 'Merry Red', decor: ['xmasTree', 'gift', 'snowflake', 'e:🎅'] },
    { name: 'Evergreen', bg: '#24442f', pattern: 'snow', accent: '#ffffff', ink: '#fbf3e6', font: 'Cormorant Garamond', caption: 'merry & bright', filter: 'kodak', decor: ['xmasTree', 'snowflake', 'starGold', 'e:🎄'] },
    { name: 'Candy Cane', bg: '#fbf3e6', pattern: 'stripes', accent: '#f6d5d5', ink: '#b6403a', font: 'Pacifico', caption: 'ho ho ho!', filter: 'film70', decor: ['gift', 'e:🍭', 'bowRed', 'sparkleW'] },
    { name: 'Snow Day', bg: '#e3ecf6', pattern: 'snow', accent: '#ffffff', ink: '#1f2a44', font: 'Caveat', caption: 'let it snow', filter: 'coolblue', decor: ['snowflake', 'e:⛄', 'e:❄️', 'sparkleW'] },
    { name: 'Cozy Cabin', bg: '#7b5644', pattern: 'none', ink: '#fbf3e6', frame: '#fbf3e6', font: 'Special Elite', caption: 'hot cocoa season', filter: 'mocha', decor: ['e:☕', 'e:🧦', 'xmasTree', 'starGold'] },
  ],
  halloween: [
    { name: 'Spooky Film', decor: ['pumpkin', 'ghost', 'bat', 'e:🕸️'] },
    { name: 'Pumpkin Patch', bg: '#e8823a', pattern: 'none', ink: '#1d1714', frame: '#1d1714', font: 'Bagel Fat One', caption: 'BOO!', filter: 'orange', decor: ['pumpkin', 'e:🍂', 'bat', 'leaf'] },
    { name: 'Ghostly', bg: '#efe4cf', pattern: 'paper', accent: '#3b2a3f', ink: '#3b2a3f', font: 'Special Elite', caption: 'boo to you', filter: 'faded', decor: ['ghost', 'e:👻', 'bat', 'sparkleW'] },
    { name: 'Witchy Purple', bg: '#3b2a3f', pattern: 'stars', accent: '#e8823a', ink: '#f09447', font: 'Cormorant Garamond', caption: 'season of the witch', filter: 'vhs', decor: ['moon', 'bat', 'starGold', 'e:🔮'] },
    { name: 'Vintage Horror', bg: '#1d1714', pattern: 'none', ink: '#e0473c', font: 'Special Elite', caption: 'NIGHT OF THE BOOTH', filter: 'dust', decor: ['bat', 'e:🕷️', 'burstWow', 'ghost'] },
  ],
  travel: [
    { name: 'Postcard', decor: ['stamp', 'plane', 'locTag', 'tapeKraft'] },
    { name: 'Airmail', bg: '#e3ecf6', pattern: 'none', ink: '#3c5a78', font: 'Special Elite', caption: 'par avion ✈', filter: 'fuji', decor: ['plane', 'stamp', 'postcard', 'e:🌍'] },
    { name: 'Beach Club', bg: '#fdf0d8', pattern: 'dots', accent: '#a9c7e8', ink: '#e8742f', font: 'Pacifico', caption: 'salty hair, happy heart', filter: 'golden', decor: ['e:🌴', 'e:🐚', 'e:☀️', 'sparkleG'] },
    { name: 'City Break', bg: '#2b221d', pattern: 'none', ink: '#efe7d8', frame: '#efe7d8', font: 'Instrument Serif', caption: 'lost in the city', filter: 'cine', decor: ['pin', 'e:🗼', 'plane', 'sparkleW'] },
    { name: 'Road Trip', bg: '#d8e3c9', pattern: 'grid', accent: '#7b5644', ink: '#2f6b4f', font: 'Caveat', caption: 'are we there yet?', filter: 'disposable', decor: ['e:🚗', 'pin', 'e:🗺️', 'tapeSage'] },
  ],
  wedding: [
    { name: 'Ivory Classic', decor: ['rings', 'bouquet', 'sparkleW', 'pearls'] },
    { name: 'Garden Florals', bg: '#e9efe0', pattern: 'none', ink: '#4f6b45', frame: '#4f6b45', font: 'Cormorant Garamond', caption: 'love in bloom', filter: 'fuji', decor: ['bouquet', 'sprig', 'daisy', 'e:🌿'] },
    { name: 'Champagne Toast', bg: '#f3e6d0', pattern: 'paper', accent: '#c9a477', ink: '#6b4a2e', font: 'Playfair Display', caption: 'cheers to love', filter: 'golden', decor: ['champagne', 'rings', 'sparkleG', 'e:🥂'] },
    { name: 'Modern Mono', bg: '#111111', pattern: 'none', ink: '#ffffff', frame: '#ffffff', font: 'DM Sans', caption: 'MR & MRS', filter: 'noir', decor: ['rings', 'sparkleW', 'heartCream', 'bowCream'] },
    { name: 'Blush Romance', bg: '#f9e1e6', pattern: 'hearts', accent: '#f2c7cf', ink: '#b05a6c', font: 'Homemade Apple', caption: 'happily ever after', filter: 'softpink', decor: ['bowPink', 'pearls', 'heartPink', 'e:💐'] },
  ],
  everyday: [
    { name: 'Paper Diary', decor: ['tapeKraft', 'sparkleG', 'e:☕', 'daisy'] },
    { name: 'Minimal White', bg: '#ffffff', pattern: 'none', ink: '#2b221d', font: 'Instrument Serif', caption: 'a little moment', filter: 'none', decor: ['sparkleG'] },
    { name: 'Café Mocha', bg: '#7b5644', pattern: 'none', ink: '#f3e6d0', frame: '#f3e6d0', font: 'Caveat', caption: 'coffee first', filter: 'mocha', decor: ['e:☕', 'e:🥐', 'sparkleG', 'heartCream'] },
    { name: 'Sunday Picnic', bg: '#fff7f2', pattern: 'gingham', accent: '#a9b79a', ink: '#4f6b45', font: 'Pacifico', caption: 'slow sundays', filter: 'kodak', decor: ['e:🍓', 'daisy', 'e:🧺', 'sparkleG'] },
    { name: 'Film Diary', bg: '#211a16', pattern: 'none', ink: '#efe7d8', frame: '#efe7d8', font: 'Special Elite', caption: 'roll 07', filter: 'analog', decor: ['filmRoll', 'camera', 'sparkleW', 'starGold'] },
  ],
};

export interface StyleVariant { id: string; name: string; theme: Theme; decor: StickerItem[] }

/** Resolve a decor id ('svgKey', 'e:🎈' or 'badge:N') into a sticker item. */
function resolve(id: string, t: Theme): StickerItem | null {
  if (id.startsWith('e:')) return { id, kind: 'emoji', src: id.slice(2) };
  if (id.startsWith('badge:')) return themeBadges(t)[+id.slice(6)] ?? null;
  return SVG[id] ? { id, kind: 'svg', src: SVG[id] } : null;
}

const cache = new Map<string, StyleVariant[]>();
export function stylesFor(themeId: string): StyleVariant[] {
  if (cache.has(themeId)) return cache.get(themeId)!;
  const base = THEME_MAP[themeId];
  const specs = V[themeId] ?? [{ name: base.name, decor: [] }];
  const out = specs.map((sp, i) => {
    const { name, decor, ...over } = sp;
    const theme: Theme = { ...base, ...over, palette: over.bg && !base.palette.includes(over.bg) ? [over.bg, ...base.palette] : base.palette };
    return { id: `${themeId}-${i}`, name, theme, decor: decor.map((d) => resolve(d, theme)).filter(Boolean) as StickerItem[] };
  });
  cache.set(themeId, out);
  return out;
}
export function getStyle(themeId: string, variantId?: string | null): StyleVariant {
  const list = stylesFor(themeId);
  return list.find((v) => v.id === variantId) ?? list[0];
}
