import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LAYOUT_MAP, type StripSettings } from './data/layouts';
import { type Theme } from './data/themes';
import { getStyle } from './data/styles';
import type { StickerItem } from './data/stickers';
import type { Note } from './lib/back';
import { backend, type User, type SavedCreation } from './lib/backend';

export type Route = 'home' | 'themes' | 'booth' | 'studio' | 'final' | 'creations' | 'about';
const ROUTES: Route[] = ['home', 'themes', 'booth', 'studio', 'final', 'creations', 'about'];

export interface Shot { id: string; raw: HTMLCanvasElement; thumb: string }
export type El =
  | { id: string; type: 'sticker'; item: StickerItem; x: number; y: number; w: number; h: number; rotation: number; scaleX: number; scaleY: number; opacity: number; decor?: boolean; anchor?: number }
  | { id: string; type: 'text'; text: string; font: string; fontSize: number; fill: string; x: number; y: number; width: number; align: 'left' | 'center' | 'right'; rotation: number; scaleX: number; scaleY: number; opacity: number; role?: 'caption' | 'date'; letterSpacing?: number }
  | { id: string; type: 'line'; points: number[]; stroke: string; strokeWidth: number; opacity: number; x: number; y: number; rotation: number; scaleX: number; scaleY: number };

export interface Design {
  themeId: string; variantId: string; decorOn: boolean; layout: string; filter: string; intensity: number;
  settings: StripSettings; elements: El[]; slots: (string | null)[];
  note: Note;
}
export type Creation = Omit<SavedCreation, 'userId'>;

export const uid = () => Math.random().toString(36).slice(2, 10);

export function defaultSettings(theme: Theme, layoutKey: string): StripSettings {
  const L = LAYOUT_MAP[layoutKey];
  const base: StripSettings = {
    bg: theme.bg, pattern: theme.pattern, accent: theme.accent, frameColor: theme.frame, frameLine: 0,
    border: 36, gap: 18, radius: 0, count: 4, aspect: '4:3',
  };
  const { border, gap, radius, count, aspect } = { ...base, ...L.defaults };
  const merged: StripSettings = { ...base, border, gap, radius, count, aspect };
  if (L.defaults.bg && (layoutKey === 'film' || layoutKey === 'contact') && !isDark(theme.bg)) { merged.bg = L.defaults.bg; merged.pattern = 'none'; }
  if (layoutKey === 'polaroid1' && !isDark(theme.bg)) { merged.bg = '#fffdf8'; merged.pattern = 'none'; }
  if ((layoutKey === 'scrapbook' || layoutKey === 'polaroid2') && merged.pattern === 'none') merged.pattern = 'paper';
  return merged;
}
export const isDark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };

interface Store {
  route: Route; go: (r: Route) => void;
  themeId: string; setThemeId: (id: string) => void; theme: Theme;
  variantId: string | null; setVariantId: (id: string) => void; decorOn: boolean; setDecorOn: (v: boolean) => void;
  layout: string; setLayout: (k: string) => void;
  shots: Shot[]; setShots: (s: Shot[] | ((p: Shot[]) => Shot[])) => void;
  favorites: string[]; setFavorites: (f: string[]) => void;
  design: Design | null; setDesign: (d: Design | null) => void;
  creations: Creation[]; addCreation: (c: Creation) => void; removeCreation: (id: string) => void;
  lastExport: Creation | null; setLastExport: (c: Creation | null) => void;
  boothStep: number; setBoothStep: (n: number) => void;
  boothFilter: string | null; setBoothFilter: (f: string | null) => void;
  toast: (m: string) => void; toastMsg: string;
  user: User | null; authReady: boolean;
  auth: 'signin' | 'signup' | null; openAuth: (m: 'signin' | 'signup' | null) => void;
  signIn: (email: string, pw: string) => Promise<void>; signUp: (name: string, email: string, pw: string) => Promise<void>;
  signOut: () => Promise<void>; deleteAccount: () => Promise<void>;
}
const Ctx = createContext<Store>(null!);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const read = (): Route => { const h = location.hash.replace('#', '') as Route; return ROUTES.includes(h) ? h : 'home'; };
  const [route, setRoute] = useState<Route>(read);
  const [themeId, setThemeId] = useState('classic');
  const [layout, setLayout] = useState('k4');
  const [variantId, setVariantId] = useState<string | null>(null);
  const [decorOn, setDecorOn] = useState(true);
  const [shots, setShots] = useState<Shot[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [design, setDesign] = useState<Design | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [lastExport, setLastExport] = useState<Creation | null>(null);
  const [boothStep, setBoothStep] = useState(1);
  const [boothFilter, setBoothFilter] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [auth, openAuth] = useState<'signin' | 'signup' | null>(null);

  // restore session
  useEffect(() => {
    backend.me().then(async (u) => {
      if (u) { setUser(u); setCreations(await backend.listCreations(u.id)); }
    }).catch(() => {}).finally(() => setAuthReady(true));
  }, []);
  const afterAuth = async (u: User, guest: Creation[]) => {
    for (const c of guest) await backend.saveCreation({ ...c, userId: u.id });
    setUser(u); setCreations(await backend.listCreations(u.id)); openAuth(null);
    return guest.length;
  };

  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((r: Route) => {
    if (location.hash !== '#' + r) { try { history.pushState(null, '', '#' + r); } catch { location.hash = r; } }
    setRoute(r); window.scrollTo({ top: 0 });
  }, []);
  // guard routes that need data
  useEffect(() => {
    if (route === 'studio' && !design) setRoute('booth');
    if (route === 'final' && !lastExport) setRoute(design ? 'studio' : 'booth');
  }, [route, design, lastExport]);

  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout((window as any).__t); (window as any).__t = window.setTimeout(() => setToastMsg(''), 2600); }, []);

  const value = useMemo<Store>(() => ({
    route, go, themeId, setThemeId: (id: string) => { setThemeId(id); setVariantId(null); setBoothFilter(null); }, theme: getStyle(themeId, variantId).theme,
    variantId, setVariantId: (id: string) => { setVariantId(id); setBoothFilter(null); }, decorOn, setDecorOn, layout, setLayout, shots, setShots, favorites, setFavorites,
    design, setDesign, creations,
    addCreation: (c) => { setCreations((p) => [c, ...p]); if (user) backend.saveCreation({ ...c, userId: user.id }).catch(() => toast('Couldn’t save to your account — storage may be full')); },
    removeCreation: (id) => { setCreations((p) => p.filter((x) => x.id !== id)); if (user) backend.deleteCreation(id).catch(() => {}); },
    user, authReady, auth, openAuth,
    signIn: async (e, pw) => { const u = await backend.signIn(e, pw); const n = await afterAuth(u, creations); toast(`Welcome back, ${u.name.split(' ')[0]} ♡${n ? ` — ${n} new strip${n > 1 ? 's' : ''} saved` : ''}`); },
    signUp: async (name, e, pw) => { const u = await backend.signUp(name, e, pw); const n = await afterAuth(u, creations); toast(`Account created ✦${n ? ` ${n} strip${n > 1 ? 's' : ''} saved` : ''}`); },
    signOut: async () => { await backend.signOut(); setUser(null); setCreations([]); toast('Signed out'); },
    deleteAccount: async () => { if (user) await backend.deleteAccount(user.id); setUser(null); setCreations([]); toast('Account and saved creations deleted'); },
    lastExport, setLastExport, boothStep, setBoothStep, boothFilter, setBoothFilter, toast, toastMsg,
  }), [user, authReady, auth, route, go, themeId, variantId, decorOn, layout, shots, favorites, design, creations, lastExport, boothStep, boothFilter, toast, toastMsg]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
