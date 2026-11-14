import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, uid, type Design, type El, type Shot } from '../store';
import { StripCanvas, type StripHandle } from '../components/StripCanvas';
import { LayoutPreview } from '../components/LayoutPreview';
import { LAYOUTS, LAYOUT_MAP, ASPECTS } from '../data/layouts';
import { THEMES, THEME_MAP, FONTS, themeBadges, FONT_MAP } from '../data/themes';
import { FILTERS, FILTER_MAP } from '../data/filters';
import { STICKER_CATS, stickerImage, svgDataURL, type StickerItem } from '../data/stickers';
import { PATTERNS, patternTile } from '../data/patterns';
import { develop, toCanvas } from '../lib/develop';
import { initialDesign, reflow, dateText, captionInk, decorElements } from '../lib/design';
import { getStyle } from '../data/styles';
import { StylePicker } from '../components/StylePicker';
import { defaultSettings } from '../store';
import { chime } from '../lib/sound';
import { renderBack, NOTE_PAPERS, NOTE_INKS, NOTE_FONTS, type Note } from '../lib/back';

type Tab = 'layouts' | 'themes' | 'filters' | 'stickers' | 'text' | 'backgrounds' | 'draw' | 'note';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'layouts', label: 'Layouts', icon: '▦' }, { id: 'themes', label: 'Themes', icon: '✿' }, { id: 'filters', label: 'Filters', icon: '◐' },
  { id: 'stickers', label: 'Stickers', icon: '♡' }, { id: 'text', label: 'Text', icon: 'Aa' }, { id: 'backgrounds', label: 'Backgrounds', icon: '▤' }, { id: 'draw', label: 'Draw', icon: '✎' }, { id: 'note', label: 'Note', icon: '✉' },
];

const ICONS: Record<string, ReactNode> = {
  layouts: <><rect x="4" y="3" width="7" height="18" rx="1.5" /><rect x="14" y="3" width="6" height="8" rx="1.5" /><rect x="14" y="13" width="6" height="8" rx="1.5" /></>,
  themes: <><circle cx="12" cy="12" r="3" /><path d="M12 3a3 3 0 0 1 0 6M12 15a3 3 0 0 1 0 6M3 12a3 3 0 0 1 6 0M15 12a3 3 0 0 1 6 0" /></>,
  filters: <><circle cx="9" cy="10" r="5.5" /><circle cx="15" cy="10" r="5.5" /><circle cx="12" cy="15" r="5.5" /></>,
  stickers: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  text: <path d="M5 6V4h14v2M12 4v16M9 20h6" />,
  backgrounds: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10l6-6M4 16 16 4M8 20 20 8M14 20l6-6" /></>,
  draw: <path d="M4 20l1-4L16 5l3 3L8 19l-4 1ZM14 7l3 3" />,
  note: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  flip: <><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></>,
  edit: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  compare: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M12 3v18" /><path d="M12 5h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6Z" fill="currentColor" stroke="none" opacity=".35" /></>,
};
export const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{ICONS[name]}</svg>
);
const BASIC_COLORS = ['#ffffff', '#fbf6ec', '#f7f0e4', '#eadcc6', '#d9c4a5', '#f9dbe4', '#f2a9b8', '#e9b7b4', '#c8453e', '#7d1f22', '#f1d99a', '#e8823a', '#cfe3d0', '#a9b79a', '#c9dff0', '#a9c7e8', '#1f2a44', '#c9b9de', '#7b5644', '#4a2f24', '#2b221d', '#111111'];

/* ---------- undo / redo ---------- */
function useHistory(initial: Design) {
  const [h, setH] = useState({ past: [] as Design[], present: initial, future: [] as Design[] });
  const last = useRef({ k: '', t: 0 });
  const set = useCallback((up: Design | ((d: Design) => Design), coalesce?: string) => {
    const now = Date.now();
    const merge = !!coalesce && last.current.k === coalesce && now - last.current.t < 700;
    last.current = coalesce ? { k: coalesce, t: now } : { k: '', t: 0 };
    setH((s) => {
      const next = typeof up === 'function' ? up(s.present) : up;
      if (next === s.present) return s;
      if (merge) return { ...s, present: next, future: [] };
      return { past: [...s.past.slice(-100), s.present], present: next, future: [] };
    });
  }, []);
  const undo = useCallback(() => { last.current = { k: '', t: 0 }; setH((s) => s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s); }, []);
  const redo = useCallback(() => { last.current = { k: '', t: 0 }; setH((s) => s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s); }, []);
  return { design: h.present, set, undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}

export default function Studio() {
  const store = useStore();
  const { design: stored, shots, favorites, setDesign, go, toast, setLastExport, addCreation, setShots } = store;
  const { design, set, undo, redo, canUndo, canRedo } = useHistory(stored!);
  const theme = getStyle(design.themeId, design.variantId).theme;
  const [tab, setTab] = useState<Tab>('stickers');
  const [sheet, setSheet] = useState<Tab | 'edit' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [compare, setCompare] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [brush, setBrush] = useState({ color: '#c8453e', size: 8 });
  const [fontsVersion, setFontsVersion] = useState(0);
  const [developing, setDeveloping] = useState(true);
  const [exportMult, setExportMult] = useState(2);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [photos, setPhotos] = useState<Record<string, HTMLCanvasElement>>({});
  const box = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ w: 600, h: 600 });
  const canvas = useRef<StripHandle>(null);
  const cache = useRef(new Map<string, HTMLCanvasElement>());
  const shotMap = useMemo(() => Object.fromEntries(shots.map((s) => [s.id, s])), [shots]);

  useEffect(() => { setDesign(design); }, [design]); // eslint-disable-line
  useEffect(() => {
    Promise.all(FONTS.map((f) => document.fonts.load(`40px "${f.key}"`).catch(() => null))).then(() => setFontsVersion((v) => v + 1));
    const t = setTimeout(() => setDeveloping(false), 1700);
    return () => clearTimeout(t);
  }, []);

  // measure stage container
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // develop photos with current filter + intensity (debounced, cached)
  useEffect(() => {
    const ids = [...new Set(design.slots.filter(Boolean) as string[])];
    const t = setTimeout(() => {
      const out: Record<string, HTMLCanvasElement> = {};
      ids.forEach((id, i) => {
        const shot = shotMap[id]; if (!shot) return;
        const key = `${id}|${design.filter}|${design.intensity.toFixed(2)}`;
        if (!cache.current.has(key)) cache.current.set(key, develop(shot.raw, design.filter, design.intensity, i + id.charCodeAt(0)));
        out[id] = cache.current.get(key)!;
      });
      setPhotos(out);
    }, 90);
    return () => clearTimeout(t);
  }, [design.slots, design.filter, design.intensity, shotMap]);
  const originals = useMemo(() => Object.fromEntries(shots.map((s) => [s.id, s.raw])), [shots]);

  const built = useMemo(() => LAYOUT_MAP[design.layout].build(design.settings), [design.layout, design.settings]);
  const fit = Math.min((boxSize.w - 40) / built.W, (boxSize.h - 40) / built.H);
  const scale = Math.max(.05, fit * zoom);
  const note = design.note;
  const backPreview = useMemo(() => renderBack(note, built.W, built.H, Math.min(2, scale * (window.devicePixelRatio || 1))).toDataURL('image/jpeg', .9), [note, built.W, built.H, scale, fontsVersion]);
  const setNote = (patch: Partial<Note>, k?: string) => { set((d) => ({ ...d, note: { ...d.note, ...patch } }), k); setSide('back'); };

  /* ---------- element helpers ---------- */
  const selEl = design.elements.find((e) => e.id === selected) ?? null;
  const patchEl = useCallback((id: string, patch: Partial<El>, coalesce?: string) => {
    set((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as El) : e)) }), coalesce);
  }, [set]);
  const addEl = (e: El) => { set((d) => ({ ...d, elements: [...d.elements, e] })); setSelected(e.id); setDrawMode(false); };
  const center = () => ({ x: built.W / 2 + (Math.random() - .5) * built.W * .3, y: built.H * (.3 + Math.random() * .3) });
  const addSticker = async (item: StickerItem) => {
    const im = await stickerImage(item);
    const base = Math.min(built.W, built.H) * (item.kind === 'emoji' ? .18 : .24) * (im.width > im.height * 2 ? 1.6 : 1);
    const w = base, h = base * im.height / im.width;
    const c = center();
    addEl({ id: uid(), type: 'sticker', item, x: c.x, y: c.y, w, h, rotation: (Math.random() - .5) * 24, scaleX: 1, scaleY: 1, opacity: 1 });
    if (sheet) setSheet(null);
  };
  const addText = (text: string, font: string, extra: Partial<Extract<El, { type: 'text' }>> = {}) => {
    const fs = Math.round(built.W * .075 * (FONT_MAP[font]?.scale ?? 1));
    const w = built.W * .8;
    addEl({ id: uid(), type: 'text', text, font, fontSize: fs, fill: captionInk(theme, design.settings.bg), x: (built.W - w) / 2, y: built.H * .4, width: w, align: 'center', rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, ...extra });
    if (sheet) setSheet(null);
  };
  const removeSel = () => {
    if (!selected) return;
    if (selected.startsWith('slot:')) { setSelected(null); return; }
    set((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== selected) })); setSelected(null);
  };
  const duplicate = () => {
    if (!selEl) return;
    const copy = { ...selEl, id: uid(), x: selEl.x + 30, y: selEl.y + 30, role: undefined } as El;
    addEl(copy);
  };
  const reorder = (id: string, how: 'up' | 'down' | 'front' | 'back') => set((d) => {
    const arr = [...d.elements], i = arr.findIndex((e) => e.id === id); if (i < 0) return d;
    const [e] = arr.splice(i, 1);
    const j = how === 'front' ? arr.length : how === 'back' ? 0 : how === 'up' ? Math.min(arr.length, i + 1) : Math.max(0, i - 1);
    arr.splice(j, 0, e); return { ...d, elements: arr };
  });

  /* ---------- design-level actions ---------- */
  const setLayout = (key: string) => set((d) => {
    const geo = defaultSettings(getStyle(d.themeId, d.variantId).theme, key);
    const special = (k: string) => k === 'film' || k === 'contact' || k === 'polaroid1';
    const colours = special(key) || special(d.layout) ? { bg: geo.bg, pattern: geo.pattern } : {};
    return reflow(d, { layout: key, settings: { ...d.settings, border: geo.border, gap: geo.gap, radius: geo.radius, count: geo.count, aspect: geo.aspect, ...colours } }, favorites);
  });
  const setSetting = (patch: Partial<Design['settings']>, k?: string) => set((d) => reflow(d, { settings: { ...d.settings, ...patch } }, favorites), k);
  const applyTheme = (id: string, variantId: string | null = null) => set((d) => {
    const style = getStyle(id, variantId), t = style.theme, old = getStyle(d.themeId, d.variantId).theme;
    const geo = defaultSettings(t, d.layout);
    const settings = { ...d.settings, bg: geo.bg, pattern: geo.pattern, accent: t.accent, frameColor: t.frame };
    const kept = d.elements.filter((e) => !(e.type === 'sticker' && e.decor)).map((e) => (e.type === 'text' && e.role === 'caption'
      ? { ...e, font: t.font, fill: captionInk(t, settings.bg), text: e.text === old.caption ? t.caption : e.text } : e));
    const elements = d.decorOn ? [...kept, ...decorElements(style, LAYOUT_MAP[d.layout].build(settings))] : kept;
    return reflow(d, { themeId: id, variantId: style.id, filter: t.filter, settings, elements }, favorites);
  });
  const setDecor = (on: boolean) => set((d) => {
    const kept = d.elements.filter((e) => !(e.type === 'sticker' && e.decor));
    return { ...d, decorOn: on, elements: on ? [...kept, ...decorElements(getStyle(d.themeId, d.variantId), built)] : kept };
  });
  const reset = () => { set({ ...initialDesign(design.themeId, design.variantId, design.layout, theme.filter, favorites, design.decorOn), note: design.note }); setSelected(null); toast('Back to a fresh strip (your note is kept)'); };
  const removeAll = () => { set((d) => ({ ...d, elements: [] })); setSelected(null); };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 'd' && !typing) { e.preventDefault(); duplicate(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selected) { e.preventDefault(); removeSel(); }
      else if (e.key === 'Escape') { setSelected(null); setDrawMode(false); }
    };
    window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on);
  });

  /* ---------- finish ---------- */
  const finish = () => {
    setSelected(null);
    requestAnimationFrame(() => {
      const url = canvas.current!.exportURL(exportMult);
      const im = new Image();
      im.onload = () => {
        const thumb = toCanvas(im, im.width, im.height, 520).toDataURL('image/jpeg', .85);
        const backUrl = note.enabled ? renderBack(note, built.W, built.H, exportMult).toDataURL('image/png') : undefined;
        const used = [...new Set(design.slots.filter(Boolean) as string[])];
        const shotsData = used.map((id) => shotMap[id]).filter(Boolean).map((s) => ({ id: s.id, data: s.raw.toDataURL('image/jpeg', .9) }));
        const c = { id: uid(), url, backUrl, thumb, design, shots: shotsData, date: Date.now(), theme: theme.name, filter: FILTER_MAP[design.filter].name, layout: LAYOUT_MAP[design.layout].name };
        addCreation(c); setLastExport(c); chime(); go('final');
      };
      im.src = url;
    });
  };

  const selectEl = (id: string | null) => { setSelected(id); if (id && window.innerWidth < 1024) setSheet('edit'); };

  /* ---------- panels ---------- */
  const leftPanel = (t: Tab) => {
    switch (t) {
      case 'layouts': return <LayoutsPanel design={design} theme={theme} setLayout={setLayout} setSetting={setSetting} />;
      case 'themes': return <ThemesPanel design={design} apply={applyTheme} setDecor={setDecor} />;
      case 'filters': return <FiltersPanel design={design} set={set} base={shotMap[design.slots.find(Boolean) ?? ''] ?? shots[0]} />;
      case 'stickers': return <StickersPanel theme={theme} add={addSticker} styleKey={[design.themeId, design.variantId]} />;
      case 'text': return <TextPanel add={addText} theme={theme} />;
      case 'backgrounds': return <BackgroundPanel design={design} theme={theme} setSetting={setSetting} />;
      case 'note': return <NotePanel note={note} setNote={setNote} />;
      case 'draw': return <DrawPanel drawMode={drawMode} setDrawMode={(v) => { setDrawMode(v); setSelected(null); if (v && sheet) setSheet(null); }} brush={brush} setBrush={setBrush} />;
    }
  };
  const rightPanel = (
    <RightPanel design={design} selected={selected} selEl={selEl} patchEl={patchEl} setSelected={selectEl} remove={removeSel} duplicate={duplicate} reorder={reorder}
      set={set} shots={shots} theme={theme} onReplace={(slot, id) => set((d) => { const s = [...d.slots]; s[slot] = id; return { ...d, slots: s }; })}
      onUploadToSlot={(slot, shot) => { setShots((p) => [...p, shot]); set((d) => { const s = [...d.slots]; s[slot] = shot.id; return { ...d, slots: s }; }); }} />
  );

  return (
    <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)_300px] h-[calc(100dvh-68px)] overflow-hidden">
      {/* LEFT */}
      <aside className="hidden lg:flex flex-col border-r border-cocoa/10 bg-paper/60 min-h-0">
        <div className="grid grid-cols-8 border-b border-cocoa/10">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSide(t.id === 'note' ? 'back' : 'front'); }} className={`py-3 flex flex-col items-center gap-1 text-[9.5px] font-bold transition ${tab === t.id ? 'text-cherry bg-paper' : 'text-mocha hover:text-cocoa'}`} title={t.label}>
              <Icon name={t.id} />{t.label === 'Backgrounds' ? 'Backdrop' : t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin p-4">
          <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>{leftPanel(tab)}</motion.div></AnimatePresence>
        </div>
      </aside>

      {/* CENTER */}
      <section className="flex flex-col min-h-0 min-w-0 h-[calc(100dvh-68px-64px)] lg:h-auto">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-cocoa/10 bg-cream/80">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scroll-thin">
          <IconBtn label="Undo" onClick={undo} disabled={!canUndo}>↶</IconBtn>
          <IconBtn label="Redo" onClick={redo} disabled={!canRedo}>↷</IconBtn>
          <span className="w-px h-6 bg-cocoa/15 mx-1" />
          <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          <button className="btn btn-ghost btn-sm" onClick={removeAll} disabled={!design.elements.length} title="Remove all stickers, text and doodles">Clear all</button>
          <span className="w-px h-6 bg-cocoa/15 mx-1" />
          <IconBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(.4, +(z - .15).toFixed(2)))}>−</IconBtn>
          <button className="text-xs font-bold w-12 tabular-nums" onClick={() => setZoom(1)} title="Fit to screen">{Math.round(zoom * 100)}%</button>
          <IconBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + .15).toFixed(2)))}>+</IconBtn>
          <button className="btn btn-ghost btn-sm select-none" onPointerDown={() => setCompare(true)} onPointerUp={() => setCompare(false)} onPointerLeave={() => setCompare(false)} title="Hold to see originals"><Icon name="compare" size={16} /><span className="hidden 2xl:inline">Compare</span></button>
          <button className={`btn btn-sm ${side === 'back' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSide(side === 'front' ? 'back' : 'front')} title="Flip the strip"><Icon name="flip" size={16} /><span className="hidden xl:inline">{side === 'front' ? 'Back' : 'Front'}</span></button>
          </div>
          <div className="flex-none flex items-center gap-2">
            <select value={exportMult} onChange={(e) => setExportMult(+e.target.value)} className="hidden sm:block text-xs font-semibold bg-paper border border-cocoa/20 rounded-full px-2 py-1.5" title="Export size">
              <option value={1}>Standard</option><option value={2}>High-res 2×</option><option value={3}>Print 3×</option>
            </select>
            <button className="btn btn-rose btn-sm !px-4" onClick={finish}>Finish ✦</button>
          </div>
        </div>
        <div ref={box} className="relative flex-1 min-h-0 overflow-auto scroll-thin" style={{ background: 'radial-gradient(circle at 50% 40%, #f3e9da, #e6d6bf)' }}>
          <div className="min-w-full min-h-full grid place-items-center p-5" style={{ width: built.W * scale + 40, height: built.H * scale + 40 }}>
            <div style={{ perspective: 2400 }}>
            <motion.div animate={{ rotateY: side === 'back' ? 180 : 0 }} transition={{ duration: .75, ease: [.45, .05, .2, 1] }} style={{ transformStyle: 'preserve-3d' }} className="relative">
            <div className="shadow-[0_24px_50px_-20px_rgba(60,35,20,.55)] relative" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', pointerEvents: side === 'back' ? 'none' : undefined }}>
              <StripCanvas ref={canvas} design={design} photos={compare ? originals : photos} scale={scale} selected={selected} onSelect={selectEl}
                onElChange={patchEl} drawMode={drawMode} brush={brush} onAddLine={(pts) => set((d) => ({ ...d, elements: [...d.elements, { id: uid(), type: 'line', points: pts, stroke: brush.color, strokeWidth: brush.size, opacity: 1, x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }] }))}
                fontsVersion={fontsVersion} />
              <AnimatePresence>
                {developing && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }} className="absolute inset-0 grid place-items-center pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(60,30,15,.85), rgba(160,90,40,.55))', backdropFilter: 'sepia(1) blur(6px)' }}>
                    <div className="text-center text-paper">
                      <div className="w-12 h-12 mx-auto rounded-full border-4 border-paper/30 border-t-paper animate-spin" />
                      <div className="font-serif italic text-2xl mt-3">developing…</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute inset-0 shadow-[0_24px_50px_-20px_rgba(60,35,20,.55)]" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', pointerEvents: side === 'front' ? 'none' : undefined }}>
              <img src={backPreview} alt="Back of the strip" className="w-full h-full block" draggable={false} style={{ opacity: note.enabled ? 1 : .45, filter: note.enabled ? undefined : 'grayscale(.3)' }} />
              {!note.enabled && (
                <div className="absolute inset-0 grid place-items-center p-4">
                  <div className="bg-paper/95 rounded-2xl p-4 text-center shadow-soft max-w-[240px]">
                    <div className="font-serif text-xl leading-tight">The back is blank</div>
                    <p className="text-xs text-mocha mt-1">Leave a little note for whoever keeps this strip.</p>
                    <button className="btn btn-primary btn-sm mt-3" onClick={() => { setNote({ enabled: true }); setTab('note'); if (window.innerWidth < 1024) setSheet('note'); }}>✉ Write a note</button>
                  </div>
                </div>
              )}
            </div>
            </motion.div>
            </div>
          </div>
          {side === 'back' && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cocoa text-paper text-xs font-bold rounded-full px-3 py-1.5 flex items-center gap-2 z-10">BACK OF THE STRIP <button className="underline" onClick={() => setSide('front')}>flip to front</button></div>}
          {compare && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cocoa text-paper text-xs font-bold rounded-full px-3 py-1">ORIGINAL</div>}
          {drawMode && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cherry text-paper text-xs font-bold rounded-full px-3 py-1.5 flex items-center gap-2">✎ Drawing mode <button className="underline" onClick={() => setDrawMode(false)}>done</button></div>}
        </div>
      </section>

      {/* RIGHT */}
      <aside className="hidden lg:block border-l border-cocoa/10 bg-paper/60 overflow-y-auto scroll-thin p-4 min-h-0">{rightPanel}</aside>

      {/* MOBILE toolbar + sheet */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-paper border-t border-cocoa/10 flex">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setSheet(sheet === t.id ? null : t.id); setSide(t.id === 'note' ? 'back' : 'front'); }} className={`flex-1 min-w-[38px] flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-bold ${sheet === t.id ? 'text-cherry' : 'text-mocha'}`}>
            <Icon name={t.id} size={20} />{t.label === 'Backgrounds' ? 'Backdrop' : t.label === 'Stickers' ? 'Sticker' : t.label}
          </button>
        ))}
        <button onClick={() => setSheet(sheet === 'edit' ? null : 'edit')} className={`flex-1 min-w-[38px] flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-bold ${sheet === 'edit' ? 'text-cherry' : 'text-mocha'}`}>
          <Icon name="edit" size={20} />Edit
        </button>
      </nav>
      <AnimatePresence>
        {sheet && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed inset-x-0 bottom-16 z-40 max-h-[52vh] overflow-y-auto scroll-thin bg-paper rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(60,35,20,.4)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-1.5 rounded-full bg-cocoa/20 absolute left-1/2 -translate-x-1/2 top-2" />
              <div className="font-serif text-xl">{sheet === 'edit' ? 'Edit' : TABS.find((t) => t.id === sheet)!.label}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSheet(null)}>Close</button>
            </div>
            {sheet === 'edit' ? rightPanel : leftPanel(sheet)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= small UI ================= */
function IconBtn({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return <button aria-label={label} title={label} onClick={onClick} disabled={disabled} className="w-9 h-9 flex-none rounded-full grid place-items-center text-lg font-bold hover:bg-beige disabled:opacity-30 transition">{children}</button>;
}
function Group({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return <div className="mb-5"><div className="flex items-center justify-between mb-2.5"><div className="label">{title}</div>{right}</div>{children}</div>;
}
function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="block mb-3">
      <div className="flex justify-between text-xs font-semibold mb-1"><span>{label}</span><span className="text-mocha tabular-nums">{fmt ? fmt(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}
function Swatches({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {[...new Set(colors)].map((c) => <button key={c} onClick={() => onChange(c)} className={`w-7 h-7 rounded-full border transition ${value.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-cherry ring-offset-2 border-transparent' : 'border-cocoa/20 hover:scale-110'}`} style={{ background: c }} aria-label={c} />)}
      <label className="w-7 h-7 rounded-full border border-cocoa/20 overflow-hidden relative cursor-pointer" title="Custom colour" style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
      </label>
    </div>
  );
}

/* ================= LEFT PANELS ================= */
function LayoutsPanel({ design, theme, setLayout, setSetting }: { design: Design; theme: any; setLayout: (k: string) => void; setSetting: (p: Partial<Design['settings']>, k?: string) => void }) {
  const L = LAYOUT_MAP[design.layout], s = design.settings;
  return (
    <>
      <Group title="Layout">
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button key={l.key} onClick={() => setLayout(l.key)} className={`rounded-xl p-1.5 bg-beige/40 border-2 transition hover:bg-beige ${design.layout === l.key ? 'border-cherry' : 'border-transparent'}`} title={l.name}>
              <div className="h-20 grid place-items-center"><LayoutPreview layoutKey={l.key} theme={theme} className="max-h-full max-w-full" /></div>
              <div className="text-[10px] font-bold mt-1 leading-tight">{l.name}</div>
            </button>
          ))}
        </div>
      </Group>
      <Group title="Customise strip">
        {L.counts && <Slider label="Number of photos" value={s.count} min={Math.min(...L.counts)} max={Math.max(...L.counts)} onChange={(v) => setSetting({ count: v }, 'count')} />}
        <div className="text-xs font-semibold mb-1.5">Photo shape</div>
        <div className="flex flex-wrap gap-1.5 mb-3">{ASPECTS.map((a) => <button key={a.key} className="chip !py-1 !px-2.5 !text-[11px]" data-on={s.aspect === a.key} onClick={() => setSetting({ aspect: a.key })}>{a.name}</button>)}</div>
        <Slider label="Border thickness" value={s.border} min={0} max={120} onChange={(v) => setSetting({ border: v }, 'border')} />
        <Slider label="Photo spacing" value={s.gap} min={0} max={80} onChange={(v) => setSetting({ gap: v }, 'gap')} />
        <Slider label="Corner radius" value={s.radius} min={0} max={80} onChange={(v) => setSetting({ radius: v }, 'radius')} />
        <p className="text-[11px] text-mocha">Strip size: {Math.round(L.build(s).W)} × {Math.round(L.build(s).H)} px (before export scale)</p>
      </Group>
    </>
  );
}

function ThemesPanel({ design, apply, setDecor }: { design: Design; apply: (id: string, v?: string | null) => void; setDecor: (on: boolean) => void }) {
  const current = design.themeId;
  return (
    <>
    <Group title={`Styles · ${THEME_MAP[current].name}`}>
      <StylePicker compact themeId={current} value={design.variantId} onPick={(v) => apply(current, v)} decorOn={design.decorOn} setDecorOn={setDecor} layoutKey={design.layout} />
    </Group>
    <Group title="Switch occasion or aesthetic">
      <p className="text-[11px] text-mocha -mt-1 mb-3">Switches colours, caption font and film — your stickers and photos stay.</p>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button key={t.id} onClick={() => apply(t.id)} className={`text-left rounded-2xl p-3 border-2 transition hover:-translate-y-0.5 ${current === t.id ? 'border-cocoa' : 'border-transparent'}`} style={{ background: t.bg, color: t.ink }}>
            <div className="text-xl">{t.icon}</div>
            <div className="font-serif text-[15px] leading-tight mt-1">{t.name}</div>
            <div className="flex gap-0.5 mt-1.5">{t.palette.slice(0, 4).map((c) => <span key={c} className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: c }} />)}</div>
          </button>
        ))}
      </div>
    </Group>
    </>
  );
}

const thumbCache = new Map<string, string>();
function FiltersPanel({ design, set, base }: { design: Design; set: (u: (d: Design) => Design, k?: string) => void; base?: Shot }) {
  const [, force] = useState(0);
  const small = useMemo(() => base ? toCanvas(base.raw, base.raw.width, base.raw.height, 180) : null, [base]);
  useEffect(() => {
    if (!small || !base) return;
    let i = 0; let cancelled = false;
    const step = () => {
      if (cancelled) return;
      const f = FILTERS[i]; if (!f) return;
      const k = base.id + f.key;
      if (!thumbCache.has(k)) thumbCache.set(k, develop(small, f.key, 1, 3).toDataURL('image/jpeg', .8));
      i++; force((x) => x + 1); setTimeout(step, 0);
    };
    step(); return () => { cancelled = true; };
  }, [small, base]);
  const groups = ['Original', 'Vintage', 'Retro', 'Aesthetic'] as const;
  return (
    <>
      <Group title="Filter intensity">
        <Slider label={FILTER_MAP[design.filter].name} value={Math.round(design.intensity * 100)} min={0} max={100} fmt={(v) => v + '%'} onChange={(v) => set((d) => ({ ...d, intensity: v / 100 }), 'intensity')} />
        <p className="text-[11px] text-mocha -mt-1">Hold <b>Compare</b> above the strip to see your originals.</p>
      </Group>
      {groups.map((g) => (
        <Group key={g} title={g}>
          <div className="grid grid-cols-3 gap-2">
            {FILTERS.filter((f) => f.group === g).map((f) => {
              const th = base ? thumbCache.get(base.id + f.key) : null;
              return (
                <button key={f.key} onClick={() => set((d) => ({ ...d, filter: f.key, intensity: d.filter === f.key ? d.intensity : 1 }))} className="group text-center">
                  <div className={`aspect-square rounded-xl overflow-hidden border-2 transition ${design.filter === f.key ? 'border-cherry scale-[1.03]' : 'border-transparent group-hover:border-cocoa/30'}`} style={{ background: f.swatch }}>
                    {th && <img src={th} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 leading-tight ${design.filter === f.key ? 'text-cherry' : ''}`}>{f.name}</div>
                </button>
              );
            })}
          </div>
        </Group>
      ))}
    </>
  );
}

function StickersPanel({ theme, add, styleKey }: { theme: any; add: (i: StickerItem) => void; styleKey: [string, string] }) {
  const [cat, setCat] = useState('theme');
  const themeItems = useMemo(() => [...getStyle(styleKey[0], styleKey[1]).decor, ...themeBadges(theme), ...theme.cats.flatMap((c: string) => STICKER_CATS.find((x) => x.id === c)!.items.filter((i) => i.kind === 'svg'))].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i), [theme, styleKey[0], styleKey[1]]);
  const items = cat === 'theme' ? themeItems : STICKER_CATS.find((c) => c.id === cat)!.items;
  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button className="chip !py-1 !px-2.5 !text-[11px]" data-on={cat === 'theme'} onClick={() => setCat('theme')}>{theme.icon} For {theme.name}</button>
        {STICKER_CATS.map((c) => <button key={c.id} className="chip !py-1 !px-2.5 !text-[11px]" data-on={cat === c.id} onClick={() => setCat(c.id)}>{c.icon} {c.name}</button>)}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => (
          <button key={it.id} onClick={() => add(it)} className="sticker-btn aspect-square rounded-xl bg-paper border border-cocoa/10 grid place-items-center p-1.5 hover:shadow-soft" title="Add sticker">
            {it.kind === 'svg' ? <img src={svgDataURL(it.src)} alt="" className="max-w-full max-h-full" draggable={false} /> : <span className="text-[30px] leading-none">{it.src}</span>}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-mocha mt-4">Tap to add. Drag to move, use the corner handles to resize and the top handle to rotate.</p>
    </>
  );
}

const TEXT_PRESETS = [
  { label: 'Handwritten', font: 'Caveat', text: 'cutie ♡' }, { label: 'Love letter', font: 'Homemade Apple', text: 'xoxo' },
  { label: 'Diner script', font: 'Pacifico', text: 'hello!' }, { label: 'Editorial', font: 'Instrument Serif', text: 'a little moment' },
  { label: 'Elegant', font: 'Cormorant Garamond', text: 'forever' }, { label: 'Typewriter', font: 'Special Elite', text: 'ROLL 07' },
  { label: 'Bubble', font: 'Bagel Fat One', text: 'YAY!' }, { label: 'Pixel / VHS', font: 'VT323', text: 'PLAY ▶' },
];
function TextPanel({ add, theme }: { add: (t: string, f: string, extra?: any) => void; theme: any }) {
  return (
    <>
      <Group title="Add text">
        <div className="grid grid-cols-2 gap-2">
          {TEXT_PRESETS.map((p) => (
            <button key={p.label} onClick={() => add(p.text, p.font)} className="rounded-xl bg-paper border border-cocoa/10 p-3 text-left hover:shadow-soft hover:-translate-y-0.5 transition">
              <div className="text-xl leading-tight truncate" style={{ fontFamily: FONT_MAP[p.font].css }}>{p.text}</div>
              <div className="text-[10px] text-mocha font-bold mt-1">{p.label}</div>
            </button>
          ))}
        </div>
      </Group>
      <Group title="Stamps & captions">
        <div className="flex flex-col gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => add(dateText(), 'VT323', { fill: '#ff8a1e', role: undefined })}>📅 Film date stamp</button>
          <button className="btn btn-ghost btn-sm" onClick={() => add(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase(), 'Caveat')}>✍︎ Handwritten date</button>
          {theme.badges.map((b: string) => <button key={b} className="btn btn-ghost btn-sm" onClick={() => add(b, theme.font)}>“{b}”</button>)}
        </div>
      </Group>
      <p className="text-[11px] text-mocha">Select any text on the strip to edit its words, font, size, colour and rotation.</p>
    </>
  );
}

function BackgroundPanel({ design, theme, setSetting }: { design: Design; theme: any; setSetting: (p: Partial<Design['settings']>, k?: string) => void }) {
  const s = design.settings;
  return (
    <>
      <Group title="Background colour"><Swatches colors={[...theme.palette, ...BASIC_COLORS]} value={s.bg} onChange={(c) => setSetting({ bg: c }, 'bg')} /></Group>
      <Group title="Pattern">
        <div className="grid grid-cols-4 gap-2">
          {PATTERNS.map((p) => {
            const tile = patternTile(p.key, s.bg, s.accent);
            return (
              <button key={p.key} onClick={() => setSetting({ pattern: p.key })} className="text-center">
                <div className={`aspect-square rounded-xl border-2 ${s.pattern === p.key ? 'border-cherry' : 'border-cocoa/10'}`} style={{ background: tile ? `url(${tile.toDataURL()}) center/48px` : s.bg }} />
                <div className="text-[10px] font-bold mt-1">{p.name}</div>
              </button>
            );
          })}
        </div>
      </Group>
      <Group title="Pattern colour"><Swatches colors={[theme.accent, ...BASIC_COLORS]} value={s.accent} onChange={(c) => setSetting({ accent: c }, 'accent')} /></Group>
      <Group title="Frame">
        <Slider label="Frame line" value={s.frameLine} min={0} max={40} onChange={(v) => setSetting({ frameLine: v }, 'frameLine')} />
        <div className="text-xs font-semibold mb-1.5">Frame colour</div>
        <Swatches colors={[theme.frame, ...theme.palette, ...BASIC_COLORS]} value={s.frameColor} onChange={(c) => setSetting({ frameColor: c, frameLine: s.frameLine || 12 }, 'frameColor')} />
      </Group>
    </>
  );
}

function DrawPanel({ drawMode, setDrawMode, brush, setBrush }: { drawMode: boolean; setDrawMode: (v: boolean) => void; brush: { color: string; size: number }; setBrush: (b: { color: string; size: number }) => void }) {
  return (
    <>
      <button className={`btn w-full ${drawMode ? 'btn-rose' : 'btn-primary'}`} onClick={() => setDrawMode(!drawMode)}>{drawMode ? '✓ Done drawing' : '✎ Start doodling'}</button>
      <p className="text-[11px] text-mocha mt-2 mb-5">Draw hearts, arrows and little notes right on your strip. Each stroke can be selected, moved or deleted later.</p>
      <Group title="Brush colour"><Swatches colors={['#c8453e', '#f2a9b8', '#ffffff', '#4a2f24', '#111111', '#f1c94c', '#e8823a', '#a9c7e8', '#5a4bd0', '#a9b79a']} value={brush.color} onChange={(c) => setBrush({ ...brush, color: c })} /></Group>
      <Slider label="Brush size" value={brush.size} min={2} max={40} onChange={(v) => setBrush({ ...brush, size: v })} />
      <div className="h-14 rounded-xl bg-beige/50 grid place-items-center"><svg width="180" height="40"><path d="M10 28 C40 4 70 36 100 18 S150 8 170 22" stroke={brush.color} strokeWidth={brush.size} fill="none" strokeLinecap="round" /></svg></div>
    </>
  );
}

function NotePanel({ note, setNote }: { note: Note; setNote: (p: Partial<Note>, k?: string) => void }) {
  return (
    <>
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-paper border border-cocoa/10 p-3 mb-4 cursor-pointer">
        <span><span className="font-semibold text-sm block">Note on the back</span><span className="text-[11px] text-mocha">Printed on the reverse of your strip</span></span>
        <input type="checkbox" className="w-5 h-5 accent-[#b6403a]" checked={note.enabled} onChange={(e) => setNote({ enabled: e.target.checked })} />
      </label>
      <div>
        <Group title="Your note">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input value={note.to} onChange={(e) => setNote({ to: e.target.value, enabled: true }, 'nto')} placeholder="To…" maxLength={40} className="rounded-xl border border-cocoa/20 bg-white px-3 py-2 text-sm" />
            <input value={note.from} onChange={(e) => setNote({ from: e.target.value, enabled: true }, 'nfrom')} placeholder="From…" maxLength={40} className="rounded-xl border border-cocoa/20 bg-white px-3 py-2 text-sm" />
          </div>
          <textarea value={note.text} onChange={(e) => setNote({ text: e.target.value, enabled: true }, 'ntext')} rows={6} maxLength={600} placeholder="Write something sweet…"
            className="w-full rounded-xl border border-cocoa/20 bg-white p-3 text-[17px] leading-snug resize-none" style={{ fontFamily: FONT_MAP[note.font]?.css }} />
          <div className="text-[10px] text-mocha text-right">{note.text.length}/600 · text shrinks to fit</div>
        </Group>
        <Group title="Handwriting">
          <div className="grid grid-cols-2 gap-1.5">
            {NOTE_FONTS.map((f) => (
              <button key={f} onClick={() => { document.fonts.load(`40px "${f}"`).finally(() => setNote({ font: f })); }} className={`rounded-xl border-2 px-2 py-2 text-left bg-paper ${note.font === f ? 'border-cherry' : 'border-transparent'}`}>
                <div className="text-lg leading-none truncate" style={{ fontFamily: FONT_MAP[f].css }}>dear you</div>
                <div className="text-[10px] text-mocha font-bold mt-1">{FONT_MAP[f].name}</div>
              </button>
            ))}
          </div>
        </Group>
        <Group title="Ink"><Swatches colors={NOTE_INKS} value={note.ink} onChange={(c) => setNote({ ink: c }, 'nink')} /></Group>
        <Group title="Paper">
          <div className="flex flex-wrap gap-2">
            {NOTE_PAPERS.map((p) => (
              <button key={p.c} onClick={() => setNote({ paper: p.c, ...(p.c === '#2b221d' && note.ink !== '#fbf6ec' ? { ink: '#fbf6ec' } : {}), ...(p.c !== '#2b221d' && note.ink === '#fbf6ec' ? { ink: '#3b2a22' } : {}) })} className="text-center">
                <span className={`block w-10 h-12 rounded-md border-2 shadow-sm ${note.paper === p.c ? 'border-cherry' : 'border-cocoa/10'}`} style={{ background: p.c }} />
                <span className="text-[9.5px] font-bold">{p.n}</span>
              </button>
            ))}
          </div>
        </Group>
        <Group title="Details">
          {([['lined', 'Ruled lines'], ['showDate', 'Handwritten date'], ['doodles', 'Little doodles'], ['postmark', '“With love” postmark']] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between py-1.5 text-sm font-semibold cursor-pointer">
              {l}<input type="checkbox" className="w-4 h-4 accent-[#b6403a]" checked={note[k]} onChange={(e) => setNote({ [k]: e.target.checked } as Partial<Note>)} />
            </label>
          ))}
        </Group>
        <p className="text-[11px] text-mocha">The back downloads with your strip — on its own, or front and back side by side. Printing gives you both pages for double-sided printing.</p>
      </div>
    </>
  );
}

/* ================= RIGHT PANEL ================= */
function RightPanel({ design, selected, selEl, patchEl, setSelected, remove, duplicate, reorder, set, shots, theme, onReplace, onUploadToSlot }: {
  design: Design; selected: string | null; selEl: El | null; patchEl: (id: string, p: Partial<El>, k?: string) => void; setSelected: (id: string | null) => void;
  remove: () => void; duplicate: () => void; reorder: (id: string, how: 'up' | 'down' | 'front' | 'back') => void; set: (u: (d: Design) => Design, k?: string) => void;
  shots: Shot[]; theme: any; onReplace: (slot: number, id: string) => void; onUploadToSlot: (slot: number, s: Shot) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const slot = selected?.startsWith('slot:') ? +selected.slice(5) : -1;
  const colors = [theme.ink, theme.frame, ...theme.palette, '#ff8a1e', ...BASIC_COLORS];

  const layerBtns = selEl && (
    <div className="grid grid-cols-4 gap-1.5 mb-3">
      {([['back', '⇊', 'To back'], ['down', '↓', 'Backward'], ['up', '↑', 'Forward'], ['front', '⇈', 'To front']] as const).map(([how, ic, l]) => (
        <button key={how} className="btn btn-ghost btn-sm !px-0 flex-col !gap-0 !py-1.5" onClick={() => reorder(selEl.id, how)} title={l}><span>{ic}</span><span className="text-[9px]">{l}</span></button>
      ))}
    </div>
  );
  const common = selEl && (
    <>
      <Slider label="Rotation" value={Math.round(selEl.rotation)} min={-180} max={180} fmt={(v) => v + '°'} onChange={(v) => patchEl(selEl.id, { rotation: v }, 'rot' + selEl.id)} />
      <Slider label="Opacity" value={Math.round(selEl.opacity * 100)} min={10} max={100} fmt={(v) => v + '%'} onChange={(v) => patchEl(selEl.id, { opacity: v / 100 }, 'op' + selEl.id)} />
      <div className="label mb-2 mt-4">Layer</div>
      {layerBtns}
      <div className="grid grid-cols-2 gap-2">
        <button className="btn btn-ghost btn-sm" onClick={duplicate}>⧉ Duplicate</button>
        <button className="btn btn-rose btn-sm" onClick={remove}>🗑 Delete</button>
      </div>
    </>
  );

  return (
    <div>
      {selEl?.type === 'sticker' && (
        <Group title="Sticker">
          <Slider label="Size" value={Math.round(selEl.scaleX * 100)} min={20} max={400} fmt={(v) => v + '%'} onChange={(v) => patchEl(selEl.id, { scaleX: (Math.sign(selEl.scaleX) || 1) * v / 100, scaleY: v / 100 }, 'size' + selEl.id)} />
          <button className="btn btn-ghost btn-sm w-full mb-3" onClick={() => patchEl(selEl.id, { scaleX: -selEl.scaleX })}>⇋ Flip</button>
          {common}
        </Group>
      )}
      {selEl?.type === 'text' && (
        <Group title={selEl.role === 'caption' ? 'Caption' : selEl.role === 'date' ? 'Date stamp' : 'Text'}>
          <textarea value={selEl.text} onChange={(e) => patchEl(selEl.id, { text: e.target.value }, 'txt' + selEl.id)} rows={2} className="w-full rounded-xl border border-cocoa/20 bg-white p-2.5 text-sm mb-3 resize-none" />
          <select value={selEl.font} onChange={(e) => { const f = e.target.value; document.fonts.load(`40px "${f}"`).finally(() => patchEl(selEl.id, { font: f })); }} className="w-full rounded-xl border border-cocoa/20 bg-white p-2 text-sm mb-3" style={{ fontFamily: FONT_MAP[selEl.font]?.css }}>
            {FONTS.map((f) => <option key={f.key} value={f.key} style={{ fontFamily: f.css }}>{f.name} — {f.key}</option>)}
          </select>
          <Slider label="Font size" value={Math.round(selEl.fontSize)} min={10} max={240} onChange={(v) => patchEl(selEl.id, { fontSize: v }, 'fs' + selEl.id)} />
          <div className="flex gap-1.5 mb-3">{(['left', 'center', 'right'] as const).map((a) => <button key={a} className="chip flex-1 justify-center !py-1" data-on={selEl.align === a} onClick={() => patchEl(selEl.id, { align: a })}>{a}</button>)}</div>
          <Slider label="Letter spacing" value={selEl.letterSpacing ?? 0} min={-4} max={30} onChange={(v) => patchEl(selEl.id, { letterSpacing: v }, 'ls' + selEl.id)} />
          <div className="text-xs font-semibold mb-1.5">Colour</div>
          <div className="mb-4"><Swatches colors={colors} value={selEl.fill} onChange={(c) => patchEl(selEl.id, { fill: c }, 'fill' + selEl.id)} /></div>
          {common}
        </Group>
      )}
      {selEl?.type === 'line' && (
        <Group title="Doodle">
          <div className="text-xs font-semibold mb-1.5">Colour</div>
          <div className="mb-3"><Swatches colors={colors} value={selEl.stroke} onChange={(c) => patchEl(selEl.id, { stroke: c }, 'st' + selEl.id)} /></div>
          <Slider label="Thickness" value={selEl.strokeWidth} min={1} max={40} onChange={(v) => patchEl(selEl.id, { strokeWidth: v }, 'sw' + selEl.id)} />
          {common}
        </Group>
      )}
      {slot >= 0 && (
        <Group title={`Photo frame ${slot + 1}`}>
          <p className="text-[11px] text-mocha -mt-1 mb-2.5">Choose which shot goes in this frame.</p>
          <div className="grid grid-cols-3 gap-1.5">
            {shots.map((s) => <button key={s.id} onClick={() => onReplace(slot, s.id)} className={`rounded-lg overflow-hidden border-2 ${design.slots[slot] === s.id ? 'border-cherry' : 'border-transparent'}`}><img src={s.thumb} className="w-full aspect-[4/3] object-cover" alt="" /></button>)}
          </div>
          <button className="btn btn-ghost btn-sm w-full mt-3" onClick={() => fileRef.current?.click()}>⬆ Upload a photo here</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return; const im = new Image();
            im.onload = () => { const c = toCanvas(im, im.naturalWidth, im.naturalHeight, 1600); onUploadToSlot(slot, { id: uid(), raw: c, thumb: toCanvas(c, c.width, c.height, 360).toDataURL('image/jpeg', .8) }); };
            im.src = URL.createObjectURL(f); e.target.value = '';
          }} />
        </Group>
      )}
      {!selEl && slot < 0 && (
        <Group title="Strip">
          <p className="text-sm text-mocha mb-3">Tap a sticker, text or photo on the strip to edit it here.</p>
          <Slider label={`Filter · ${FILTER_MAP[design.filter].name}`} value={Math.round(design.intensity * 100)} min={0} max={100} fmt={(v) => v + '%'} onChange={(v) => set((d) => ({ ...d, intensity: v / 100 }), 'intensity')} />
        </Group>
      )}

      <Group title={`Layers (${design.elements.length})`}>
        {design.elements.length === 0 && <p className="text-xs text-mocha">No stickers or text yet.</p>}
        <div className="flex flex-col gap-1">
          {[...design.elements].reverse().map((e) => (
            <div key={e.id} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 cursor-pointer transition ${selected === e.id ? 'bg-cocoa text-paper' : 'hover:bg-beige/60'}`} onClick={() => setSelected(e.id)}>
              <span className="w-8 h-8 flex-none rounded-lg bg-paper/90 grid place-items-center overflow-hidden text-cocoa">
                {e.type === 'sticker' ? (e.item.kind === 'svg' ? <img src={svgDataURL(e.item.src)} className="max-w-[26px] max-h-[26px]" alt="" /> : <span className="text-lg">{e.item.src}</span>) : e.type === 'text' ? <span className="text-xs font-bold">Aa</span> : <span>✎</span>}
              </span>
              <span className="text-xs font-semibold truncate flex-1">{e.type === 'text' ? e.text : e.type === 'line' ? 'Doodle' : 'Sticker'}</span>
              <button className="text-xs opacity-60 hover:opacity-100 px-1" onClick={(ev) => { ev.stopPropagation(); reorder(e.id, 'up'); }} title="Move up">↑</button>
              <button className="text-xs opacity-60 hover:opacity-100 px-1" onClick={(ev) => { ev.stopPropagation(); reorder(e.id, 'down'); }} title="Move down">↓</button>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}
