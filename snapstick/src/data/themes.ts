import { badge, type StickerItem } from './stickers';

export interface Theme {
  id: string; name: string; kind: 'basic' | 'occasion' | 'aesthetic'; icon: string; blurb: string;
  bg: string; palette: string[]; pattern: string; accent: string; ink: string; frame: string;
  font: string; caption: string; filter: string; layout: string;
  cats: string[]; badges: string[];
}

export const FONTS = [
  { key: 'Caveat', name: 'Handwritten', css: '"Caveat", cursive', scale: 1.25 },
  { key: 'Homemade Apple', name: 'Love letter', css: '"Homemade Apple", cursive', scale: .8 },
  { key: 'Pacifico', name: 'Diner script', css: '"Pacifico", cursive', scale: 1 },
  { key: 'Instrument Serif', name: 'Editorial', css: '"Instrument Serif", serif', scale: 1.15 },
  { key: 'Playfair Display', name: 'Classic serif', css: '"Playfair Display", serif', scale: 1 },
  { key: 'Cormorant Garamond', name: 'Elegant', css: '"Cormorant Garamond", serif', scale: 1.15 },
  { key: 'Bagel Fat One', name: 'Bubble', css: '"Bagel Fat One", sans-serif', scale: .95 },
  { key: 'Special Elite', name: 'Typewriter', css: '"Special Elite", monospace', scale: .9 },
  { key: 'VT323', name: 'Pixel / VHS', css: '"VT323", monospace', scale: 1.3 },
  { key: 'DM Sans', name: 'Clean sans', css: '"DM Sans", sans-serif', scale: .95 },
];
export const FONT_MAP = Object.fromEntries(FONTS.map((f) => [f.key, f]));

export const THEMES: Theme[] = [
  { id: 'classic', name: 'Classic', kind: 'basic', icon: '📷', blurb: 'A plain, timeless strip — no occasion needed.', bg: '#ffffff', palette: ['#ffffff', '#111111', '#f7f0e4', '#f9dbe4', '#d7e4ff'], pattern: 'none', accent: '#eadcc6', ink: '#2b221d', frame: '#2b221d', font: 'Instrument Serif', caption: 'say cheese', filter: 'none', layout: 'k4', cats: ['stars', 'love', 'emoticons', 'flowers'], badges: ['say cheese', 'today ♡', 'MEMORIES'] },
  { id: 'birthday', name: 'Birthday', kind: 'occasion', icon: '🎂', blurb: 'Cake, candles, balloons and a wish.', bg: '#f9dbe4', palette: ['#f9dbe4', '#e6dcf5', '#d7e8f5', '#fff4d6', '#ffffff'], pattern: 'confetti', accent: '#c9b9de', ink: '#7a3b55', frame: '#f2a9b8', font: 'Pacifico', caption: 'happy birthday!', filter: 'softpink', layout: 'k4', cats: ['birthday', 'stars', 'food'], badges: ['HAPPY BIRTHDAY', 'make a wish', 'BIRTHDAY GIRL', 'party time'] },
  { id: 'love', name: "Love & Valentine's", kind: 'occasion', icon: '💌', blurb: 'Hearts, roses, bows and love letters.', bg: '#f6d3d6', palette: ['#f6d3d6', '#fbf1e6', '#c8453e', '#f2a9b8', '#7a1f27'], pattern: 'hearts', accent: '#eeb4bb', ink: '#8f2430', frame: '#c8453e', font: 'Homemade Apple', caption: 'you & me', filter: 'softpink', layout: 'couple2', cats: ['love', 'bows', 'flowers'], badges: ['BE MINE', 'xoxo', 'LOVE YOU', 'my person'] },
  { id: 'friends', name: 'Best Friends', kind: 'occasion', icon: '🫶', blurb: 'Doodles, smileys and four-cut chaos.', bg: '#fbe7a6', palette: ['#fbe7a6', '#cfe3d0', '#f6c3cf', '#c9dff0', '#ffffff'], pattern: 'gingham', accent: '#f2a9b8', ink: '#4a2f24', frame: '#4a2f24', font: 'Bagel Fat One', caption: 'besties forever', filter: 'disposable', layout: 'k4', cats: ['emoticons', 'stars', 'flowers', 'animals'], badges: ['BESTIES', 'BFF', 'partners in crime', 'girls night'] },
  { id: 'anniversary', name: 'Anniversary', kind: 'occasion', icon: '🥂', blurb: 'Champagne tones, roses and handwriting.', bg: '#f3e6d0', palette: ['#f3e6d0', '#e9d6b8', '#fbf7ef', '#d9b9a6', '#5a3e2b'], pattern: 'paper', accent: '#c9a477', ink: '#6b4a2e', frame: '#c9a477', font: 'Playfair Display', caption: 'still you, always', filter: 'golden', layout: 'polaroid2', cats: ['love', 'celebrate', 'flowers'], badges: ['HAPPY ANNIVERSARY', 'forever & always', 'EST. 2019'] },
  { id: 'graduation', name: 'Graduation', kind: 'occasion', icon: '🎓', blurb: 'Caps, diplomas, black and gold.', bg: '#1f2a44', palette: ['#1f2a44', '#151515', '#f3ead8', '#c8a24a', '#ffffff'], pattern: 'none', accent: '#c8a24a', ink: '#e9cf8a', frame: '#c8a24a', font: 'Playfair Display', caption: 'class of 2026', filter: 'kodak', layout: 'k4', cats: ['celebrate', 'stars', 'retro'], badges: ['CLASS OF 2026', 'WE DID IT!', 'the future is bright'] },
  { id: 'christmas', name: 'Christmas', kind: 'occasion', icon: '🎄', blurb: 'Snowflakes, trees, ribbons and gifts.', bg: '#7d1f22', palette: ['#7d1f22', '#24442f', '#fbf3e6', '#e8d9c2', '#1b2b22'], pattern: 'snow', accent: '#fbf3e6', ink: '#fbf3e6', frame: '#e2b64a', font: 'Playfair Display', caption: 'merry & bright', filter: 'kodak', layout: 'k4', cats: ['seasonal', 'stars', 'food'], badges: ['MERRY CHRISTMAS', 'ho ho ho', 'cozy season'] },
  { id: 'halloween', name: 'Halloween', kind: 'occasion', icon: '🎃', blurb: 'Pumpkins, ghosts, bats and grainy film.', bg: '#1d1714', palette: ['#1d1714', '#3b2a3f', '#e8823a', '#efe4cf'], pattern: 'none', accent: '#e8823a', ink: '#f09447', frame: '#e8823a', font: 'Special Elite', caption: 'spooky season', filter: 'dust', layout: 'film', cats: ['seasonal', 'stars', 'emoticons'], badges: ['BOO!', 'SPOOKY SEASON', 'trick or treat'] },
  { id: 'travel', name: 'Travel & Vacation', kind: 'occasion', icon: '✈️', blurb: 'Postcards, stamps and location tags.', bg: '#ead9bd', palette: ['#ead9bd', '#a9c7e8', '#fbf6ec', '#d8e3c9', '#3c5a78'], pattern: 'paper', accent: '#7b5644', ink: '#3c5a78', frame: '#3c5a78', font: 'Special Elite', caption: 'wish you were here', filter: 'fuji', layout: 'scrapbook', cats: ['travel', 'tape', 'food'], badges: ['WISH YOU WERE HERE', 'BON VOYAGE', 'out of office'] },
  { id: 'wedding', name: 'Wedding', kind: 'occasion', icon: '💍', blurb: 'Ivory, champagne and soft florals.', bg: '#fbf8f1', palette: ['#fbf8f1', '#f1e6d2', '#e9e4dc', '#ffffff', '#cbb89a'], pattern: 'none', accent: '#d9c4a5', ink: '#7b6a55', frame: '#d9c4a5', font: 'Cormorant Garamond', caption: 'happily ever after', filter: 'matte', layout: 'polaroid1', cats: ['flowers', 'celebrate', 'bows'], badges: ['JUST MARRIED', 'mr & mrs', 'I DO'] },
  { id: 'everyday', name: 'Everyday Memories', kind: 'occasion', icon: '☕', blurb: 'Neutral, casual, a little scrapbooky.', bg: '#f7f0e4', palette: ['#f7f0e4', '#eadcc6', '#ffffff', '#2b221d', '#a9b79a'], pattern: 'paper', accent: '#7b5644', ink: '#4a2f24', frame: '#4a2f24', font: 'Caveat', caption: 'a little moment', filter: 'analog', layout: 'k4', cats: ['stars', 'flowers', 'food', 'tape'], badges: ['today ♡', 'little things', 'MEMORIES'] },
  { id: 'y2k', name: 'Y2K', kind: 'aesthetic', icon: '🦋', blurb: 'Chrome hearts, butterflies, flip phones.', bg: '#d7e4ff', palette: ['#d7e4ff', '#f6d0f0', '#e6e9ef', '#c9b9de', '#101018'], pattern: 'stars', accent: '#ffffff', ink: '#5a4bd0', frame: '#5a4bd0', font: 'Bagel Fat One', caption: 'y2k baby', filter: 'y2k', layout: 'k4', cats: ['y2k', 'stars', 'emoticons'], badges: ['Y2K BABY', "that's hot", '✧ cyber ✧'] },
  { id: 'coquette', name: 'Coquette', kind: 'aesthetic', icon: '🎀', blurb: 'Bows, pearls, lace and blush.', bg: '#fbe9ec', palette: ['#fbe9ec', '#fff7f2', '#f2c7cf', '#f7efe6', '#2b221d'], pattern: 'gingham', accent: '#f2b6c1', ink: '#b05a6c', frame: '#f2a9b8', font: 'Homemade Apple', caption: 'lovely', filter: 'softpink', layout: 'k4', cats: ['bows', 'love', 'flowers'], badges: ['coquette', 'lovely girl', 'ballet core'] },
  { id: 'korean', name: 'Korean Booth', kind: 'aesthetic', icon: '📸', blurb: 'Clean four-cut, bright and simple.', bg: '#ffffff', palette: ['#ffffff', '#1d1d1d', '#ffd8e0', '#dff0e9', '#d9e6ff'], pattern: 'none', accent: '#ffd8e0', ink: '#1d1d1d', frame: '#1d1d1d', font: 'DM Sans', caption: 'four cut ✿ today', filter: 'pastel', layout: 'k4', cats: ['emoticons', 'animals', 'stars'], badges: ['four cut', '✿ today ✿', 'cheese~'] },
  { id: 'retro90s', name: 'Retro 90s', kind: 'aesthetic', icon: '📼', blurb: 'VHS fuzz, checkerboards and mixtapes.', bg: '#2b6e8f', palette: ['#2b6e8f', '#f1c94c', '#e8573e', '#fbf1dc', '#1d1714'], pattern: 'checker', accent: '#1d1714', ink: '#fbf1dc', frame: '#f1c94c', font: 'VT323', caption: 'totally rad', filter: 'vhs', layout: 'film', cats: ['retro', 'music', 'emoticons'], badges: ['TOTALLY RAD', 'PLAY ▶', 'REWIND'] },
  { id: 'indie', name: 'Indie Film', kind: 'aesthetic', icon: '🎬', blurb: 'Cinematic warmth and film edges.', bg: '#2b221d', palette: ['#2b221d', '#efe7d8', '#7b5644', '#a9b79a'], pattern: 'none', accent: '#7b5644', ink: '#efe7d8', frame: '#efe7d8', font: 'Special Elite', caption: 'scene 04, take 2', filter: 'cine', layout: 'film', cats: ['retro', 'music', 'tape'], badges: ['SCENE 04', 'ROLL 2', 'directed by us'] },
  { id: 'pastel', name: 'Cute Pastel', kind: 'aesthetic', icon: '🍡', blurb: 'Sugar-soft colours and tiny animals.', bg: '#fde2e4', palette: ['#fde2e4', '#e2ece9', '#fff1e6', '#dfe7fd', '#f0e6ff'], pattern: 'dots', accent: '#ffffff', ink: '#7a6a8a', frame: '#c9b9de', font: 'Caveat', caption: 'soft days', filter: 'pastel', layout: 'grid2', cats: ['animals', 'flowers', 'food', 'stars'], badges: ['soft days', 'cutie', 'hello ✿'] },
  { id: 'academia', name: 'Dark Academia', kind: 'aesthetic', icon: '📚', blurb: 'Mocha tones, old paper and ink.', bg: '#3b2a20', palette: ['#3b2a20', '#5a4636', '#d8c8a8', '#1f1915'], pattern: 'none', accent: '#5a4636', ink: '#d8c8a8', frame: '#d8c8a8', font: 'Cormorant Garamond', caption: 'ex libris', filter: 'mocha', layout: 'k4', cats: ['retro', 'tape', 'flowers'], badges: ['EX LIBRIS', 'carpe diem', 'study notes'] },
];
export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<string, Theme>;

export function themeBadges(t: Theme): StickerItem[] {
  const shapes = ['pill', 'ticket', 'script', 'label'] as const;
  return t.badges.map((txt, i) => {
    const shape = shapes[i % shapes.length];
    const bg = i % 2 ? t.palette[1] ?? '#fff' : t.frame;
    const fg = shape === 'script' ? t.frame : pickInk(bg);
    const font = shape === 'script' ? 'Brush Script MT,Segoe Script,cursive' : shape === 'label' ? 'Georgia,serif' : 'Arial Black,Impact,sans-serif';
    return { id: `badge:${t.id}:${i}`, kind: 'svg' as const, src: badge(txt, bg, fg, { shape, font, size: shape === 'script' ? 36 : 25 }) };
  });
}
export function pickInk(hex: string) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#4a2f24' : '#fbf6ec';
}
