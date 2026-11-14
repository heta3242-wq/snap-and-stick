import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, uid, type Shot } from '../store';
import { THEMES, THEME_MAP } from '../data/themes';
import { LAYOUTS, LAYOUT_MAP } from '../data/layouts';
import { FILTERS, FILTER_MAP, cssFilter } from '../data/filters';
import { LayoutPreview } from '../components/LayoutPreview';
import { StylePicker } from '../components/StylePicker';
import { stylesFor } from '../data/styles';
import { toCanvas } from '../lib/develop';
import { sampleCanvas, SAMPLE_KEYS } from '../lib/samples';
import { initialDesign } from '../lib/design';
import { beep, shutter, unlockAudio, setSound, soundOn, chime } from '../lib/sound';
import { defaultSettings } from '../store';

const STEPS = ['Occasion (optional)', 'Layout', 'Capture', 'Favourites'];
const COUNTS = [1, 2, 3, 4, 6];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function makeShot(c: HTMLCanvasElement): Shot {
  const t = toCanvas(c, c.width, c.height, 360);
  return { id: uid(), raw: c, thumb: t.toDataURL('image/jpeg', .82) };
}

export default function Booth() {
  const { boothStep: step, setBoothStep: setStep, themeId, setThemeId, layout, setLayout, theme } = useStore();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="label">The photobooth · {theme.icon} {theme.name}</div>
          <h1 className="font-serif text-4xl sm:text-6xl leading-none mt-2">{['Pick an occasion — or don’t', 'Choose a layout', 'Strike a pose', 'Pick your favourites'][step]}</h1>
        </div>
        <ol className="flex items-center gap-1.5 text-xs font-semibold">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5">
              <button disabled={i > step && i !== 0} onClick={() => setStep(i)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${i === step ? 'bg-cocoa text-paper' : i < step ? 'bg-beige text-cocoa hover:bg-sand' : 'text-mocha/50'}`}>
                <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${i === step ? 'bg-paper text-cocoa' : 'bg-paper/60'}`}>{i < step ? '✓' : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < 3 && <span className="w-3 h-px bg-cocoa/20" />}
            </li>
          ))}
        </ol>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .3 }} className="mt-8">
          {step === 0 && <OccasionStep onPick={(id) => { setThemeId(id); setLayout(THEME_MAP[id].layout); setStep(1); }} current={themeId} />}
          {step === 1 && <LayoutStep onPick={(k) => { setLayout(k); setStep(2); }} current={layout} />}
          {step === 2 && <CaptureStep onDone={() => setStep(3)} />}
          {step === 3 && <FavouritesStep />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OccasionStep({ onPick, current }: { onPick: (id: string) => void; current: string }) {
  const groups = [['Occasions', THEMES.filter((t) => t.kind === 'occasion')], ['Aesthetics', THEMES.filter((t) => t.kind === 'aesthetic')]] as const;
  const classic = THEME_MAP.classic;
  return (
    <div>
      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: .99 }} onClick={() => onPick('classic')}
        className={`w-full mb-10 text-left rounded-3xl p-6 sm:p-7 shadow-card border-2 bg-paper flex flex-col sm:flex-row sm:items-center gap-4 ${current === 'classic' ? 'border-cocoa' : 'border-transparent'}`}>
        <span className="text-4xl">{classic.icon}</span>
        <span className="flex-1"><span className="font-serif text-3xl block leading-tight">Just a normal photobooth</span><span className="text-sm text-mocha">No occasion needed — a clean classic strip. You can still use every sticker, filter and layout.</span></span>
        <span className="btn btn-primary">Continue →</span>
      </motion.button>
      {groups.map(([g, list]) => (
        <div key={g} className="mb-10">
          <div className="label mb-4">{g}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {list.map((t) => (
              <motion.button key={t.id} whileHover={{ y: -4 }} whileTap={{ scale: .97 }} onClick={() => onPick(t.id)}
                className={`relative text-left rounded-3xl p-4 h-36 shadow-card overflow-hidden border-2 transition ${current === t.id ? 'border-cocoa' : 'border-transparent'}`} style={{ background: t.bg, color: t.ink }}>
                <div className="text-3xl">{t.icon}</div>
                <div className="font-serif text-xl leading-tight mt-2">{t.name}</div>
                <div className="flex gap-1 absolute right-3 top-4">{t.palette.slice(0, 4).map((c) => <span key={c} className="w-3 h-3 rounded-full border border-black/10" style={{ background: c }} />)}</div>
                {current === t.id ? <span className="absolute right-3 bottom-3 text-[10px] font-bold bg-paper text-cocoa rounded-full px-2 py-0.5">SELECTED</span>
                  : stylesFor(t.id).length > 1 && <span className="absolute right-3 bottom-3 text-[10px] font-bold bg-paper/70 text-cocoa rounded-full px-2 py-0.5">{stylesFor(t.id).length} styles</span>}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LayoutStep({ onPick, current }: { onPick: (k: string) => void; current: string }) {
  const { theme, themeId, setBoothStep, setThemeId, variantId, setVariantId, decorOn, setDecorOn } = useStore();
  const nStyles = stylesFor(themeId).length;
  return (
    <>
    {nStyles > 1 && (
      <div className="mb-10">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <div className="label">{theme.icon} {themeId === 'classic' ? 'Classic' : THEME_MAP[themeId].name} · {nStyles} styles</div>
            <div className="font-serif text-2xl mt-1">Pick a style</div>
          </div>
        </div>
        <StylePicker themeId={themeId} value={variantId} onPick={setVariantId} decorOn={decorOn} setDecorOn={setDecorOn} layoutKey={current} />
      </div>
    )}
    <div className="font-serif text-2xl mb-3">Then a layout</div>
    <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
      <span className="text-mocha">Style:</span>
      <span className="chip" data-on="true">{theme.icon} {theme.id === 'classic' ? 'Classic — no occasion' : theme.name}</span>
      <button className="chip" onClick={() => setBoothStep(0)}>✿ Pick an occasion (optional)</button>
      {theme.id !== 'classic' && <button className="chip" onClick={() => setThemeId('classic')}>✕ Back to classic</button>}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {LAYOUTS.map((l) => (
        <motion.button key={l.key} whileHover={{ y: -5 }} whileTap={{ scale: .98 }} onClick={() => onPick(l.key)}
          className={`card text-left p-4 flex flex-col border-2 ${current === l.key ? '!border-cocoa' : ''}`}>
          <div className="h-48 rounded-2xl bg-beige/50 grid place-items-center p-4">
            <LayoutPreview layoutKey={l.key} theme={theme} className="max-h-full max-w-full drop-shadow-md" />
          </div>
          <div className="font-serif text-xl mt-3 leading-tight">{l.name}</div>
          <div className="text-xs text-mocha mt-1">{l.desc}</div>
          <div className="text-[11px] font-bold mt-2 text-cherry">{((n) => `${n} frame${n > 1 ? 's' : ''}`)(LAYOUT_MAP[l.key].build(defaultSettings(theme, l.key)).slots.length)}</div>
        </motion.button>
      ))}
    </div>
    </>
  );
}

function CaptureStep({ onDone }: { onDone: () => void }) {
  const { shots, setShots, layout, theme, toast, boothFilter, setBoothFilter } = useStore();
  const layoutFrames = LAYOUT_MAP[layout].build(defaultSettings(theme, layout)).slots.length;
  const defaultCount = COUNTS.reduce((a, c) => (Math.abs(c - layoutFrames) < Math.abs(a - layoutFrames) ? c : a), 4);
  const [count, setCount] = useState(shots.length ? Math.min(6, Math.max(1, shots.length)) : defaultCount);
  const [frames, setFrames] = useState<(Shot | null)[]>(() => Array.from({ length: Math.max(count, shots.length) }, (_, i) => shots[i] ?? null));
  const [timer, setTimer] = useState(3);
  const filter = boothFilter ?? theme.filter;
  const setFilter = setBoothFilter;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camErr, setCamErr] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [devIdx, setDevIdx] = useState(0);
  const [mirror, setMirror] = useState(true);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [num, setNum] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sound, setSnd] = useState(soundOn);
  const video = useRef<HTMLVideoElement>(null);
  const cancel = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // keep frame count in sync
  useEffect(() => {
    setFrames((prev) => {
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? null);
      prev.slice(count).forEach((s) => s && next.push(s));
      return next;
    });
  }, [count]);
  useEffect(() => { setShots(frames.filter(Boolean) as Shot[]); }, [frames]); // eslint-disable-line

  const stop = useCallback((s: MediaStream | null) => s?.getTracks().forEach((t) => t.stop()), []);
  const start = useCallback(async (opts: { deviceId?: string; facing?: 'user' | 'environment' } = {}) => {
    setCamErr('');
    if (!navigator.mediaDevices?.getUserMedia) { setCamErr('This browser can’t open the camera on this page. Try Chrome, Safari or Edge over https — or upload photos.'); return; }
    try {
      stop(stream);
      const video_: MediaTrackConstraints = { width: { ideal: 1280 }, height: { ideal: 960 } };
      if (opts.deviceId) video_.deviceId = { exact: opts.deviceId }; else video_.facingMode = opts.facing ?? facing;
      const s = await navigator.mediaDevices.getUserMedia({ video: video_, audio: false });
      setStream(s);
      const settings = s.getVideoTracks()[0]?.getSettings?.() ?? {};
      const label = s.getVideoTracks()[0]?.label?.toLowerCase() ?? '';
      const isBack = settings.facingMode === 'environment' || /back|rear|environment/.test(label);
      setMirror(!isBack);
      const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
      setDevices(devs);
    } catch (e: any) {
      setStream(null);
      setCamErr(e?.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow it from your browser’s address bar, or upload photos instead.' : `Couldn’t start the camera (${e?.name ?? 'error'}). You can upload photos instead.`);
    }
  }, [stream, facing, stop]);

  useEffect(() => { start(); return () => { cancel.current = true; }; }, []); // eslint-disable-line
  useEffect(() => () => stop(stream), [stream, stop]);
  useEffect(() => { if (video.current && stream) { video.current.srcObject = stream; video.current.play().catch(() => {}); } }, [stream]);

  const switchCam = () => {
    if (devices.length > 1 && !/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      const n = (devIdx + 1) % devices.length; setDevIdx(n); start({ deviceId: devices[n].deviceId });
    } else { const f = facing === 'user' ? 'environment' : 'user'; setFacing(f); start({ facing: f }); }
  };

  const grab = () => {
    const v = video.current!;
    return makeShot(toCanvas(v, v.videoWidth || 1280, v.videoHeight || 960, 1280, mirror));
  };
  const countdown = async () => {
    for (let n = timer; n > 0; n--) { if (cancel.current) return false; setNum(n); beep(n === 1 ? 1320 : 880); await sleep(1000); }
    setNum(null); return !cancel.current;
  };
  const snap = (idx: number) => {
    setFlash(true); shutter(); setTimeout(() => setFlash(false), 260);
    const s = grab();
    setFrames((p) => { const n = [...p]; n[idx] = s; return n; });
  };
  const run = async (indices: number[]) => {
    if (!stream || busy || !indices.length) return;
    unlockAudio(); cancel.current = false; setBusy(true);
    for (let k = 0; k < indices.length; k++) {
      if (!(await countdown())) break;
      snap(indices[k]);
      await sleep(k < indices.length - 1 ? 900 : 400);
    }
    setNum(null); setBusy(false);
    if (!cancel.current) chime();
  };
  const startSession = () => {
    const empty = frames.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0);
    run(empty.length ? empty : frames.map((_, i) => i));
  };
  const retakeAll = () => { setFrames(Array(count).fill(null)); };
  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const imgs = await Promise.all([...files].filter((f) => f.type.startsWith('image/')).map((f) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); })));
    setFrames((prev) => {
      const n = [...prev];
      imgs.forEach((im) => { const s = makeShot(toCanvas(im, im.naturalWidth, im.naturalHeight, 1600)); const e = n.indexOf(null); if (e >= 0) n[e] = s; else n.push(s); });
      return n;
    });
    toast(`${imgs.length} photo${imgs.length > 1 ? 's' : ''} added`);
  };
  const useSamples = () => {
    setFrames((prev) => prev.map((f, i) => f ?? makeShot(sampleCanvas(SAMPLE_KEYS[(i * 3 + 1) % SAMPLE_KEYS.length]))));
    toast('Sample photos loaded');
  };

  const f = FILTER_MAP[filter];
  const filled = frames.filter(Boolean).length;
  const vignette = f.vig ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
      <div className="min-w-0">
        <div className="relative rounded-[32px] bg-cocoa p-3 sm:p-4 shadow-card">
          <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden bg-[#1a1411]">
            <video ref={video} playsInline muted autoPlay className="w-full h-full object-cover" style={{ transform: mirror ? 'scaleX(-1)' : undefined, filter: cssFilter(f, 1) }} />
            {f.tint && <div className="absolute inset-0 pointer-events-none" style={{ background: f.tint[0], opacity: f.tint[1], mixBlendMode: f.tint[2] as any }} />}
            {f.fade && <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(242,230,212,${f.fade})` }} />}
            {f.leak && <div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{ background: `radial-gradient(circle at 92% 8%, rgba(255,120,40,${.6 * f.leak}), rgba(255,60,80,.15) 35%, transparent 65%)` }} />}
            {f.flash && <div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{ background: `radial-gradient(circle at 50% 42%, rgba(255,255,250,${.5 * f.flash}), transparent 60%)` }} />}
            {f.scan && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 2px, transparent 2px 4px)' }} />}
            {vignette > 0 && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(20,10,5,${vignette}) 115%)` }} />}

            {!stream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-paper gap-4" style={{ background: 'repeating-linear-gradient(45deg,#231a15 0 16px,#2b211b 16px 32px)' }}>
                <div className="text-5xl">📷</div>
                <div className="font-serif text-3xl">{camErr ? 'The camera is shy' : 'Waking up the camera…'}</div>
                {camErr && <p className="text-sm text-paper/75 max-w-sm">{camErr}</p>}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button className="btn bg-paper text-cocoa btn-sm" onClick={() => start()}>Try camera again</button>
                  <button className="btn btn-sm border border-paper/40" onClick={() => fileRef.current?.click()}>⬆ Upload photos</button>
                  <button className="btn btn-sm border border-paper/40" onClick={useSamples}>Use sample photos</button>
                </div>
              </div>
            )}
            {stream && <div className="absolute left-4 top-4 flex items-center gap-2 bg-black/40 text-paper rounded-full px-3 py-1 text-xs font-bold backdrop-blur"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE · {f.name}</div>}
            {stream && (
              <button onClick={switchCam} className="absolute right-4 top-4 bg-black/40 text-paper rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-black/60" title="Switch camera">⟲ Switch camera</button>
            )}
            <AnimatePresence>
              {num !== null && (
                <motion.div key={num} initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .6, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute inset-0 grid place-items-center pointer-events-none">
                  <span className="font-serif italic text-[130px] sm:text-[190px] text-paper leading-none [text-shadow:0_8px_30px_rgba(0,0,0,.45)]">{num}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* shutter + flash */}
            <AnimatePresence>
              {flash && <>
                <motion.div className="absolute inset-x-0 top-0 bg-[#120c09] pointer-events-none" initial={{ height: 0 }} animate={{ height: '50%' }} exit={{ height: 0 }} transition={{ duration: .09 }} />
                <motion.div className="absolute inset-x-0 bottom-0 bg-[#120c09] pointer-events-none" initial={{ height: 0 }} animate={{ height: '50%' }} exit={{ height: 0 }} transition={{ duration: .09 }} />
                <motion.div className="absolute inset-0 bg-white pointer-events-none" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: .5, delay: .1 }} />
              </>}
            </AnimatePresence>
          </div>
          {/* film slots */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto scroll-thin pb-1">
            {frames.map((s, i) => (
              <div key={i} className="relative flex-none w-[92px] sm:w-[108px] aspect-[4/3] rounded-lg overflow-hidden bg-[#2b211b] border border-paper/15 group">
                {s ? <img src={s.thumb} className="w-full h-full object-cover developing" alt={`Shot ${i + 1}`} /> : <div className="w-full h-full grid place-items-center text-paper/40 font-serif italic text-2xl">{i + 1}</div>}
                {s && (
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition flex items-center justify-center gap-1.5">
                    <button disabled={!stream || busy} onClick={() => run([i])} className="text-[10px] font-bold bg-paper text-cocoa rounded-full px-2 py-1 disabled:opacity-50" title="Retake this shot">↻ Retake</button>
                    <button onClick={() => setFrames((p) => p.map((x, j) => (j === i ? null : x)))} className="text-[10px] font-bold bg-cherry text-paper rounded-full w-6 h-6" title="Remove">×</button>
                  </div>
                )}
                {!s && stream && !busy && <button className="absolute inset-0" onClick={() => run([i])} title={`Take shot ${i + 1}`} aria-label={`Take shot ${i + 1}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* controls */}
      <aside className="card p-5 h-fit space-y-5 min-w-0">
        <div>
          <div className="label mb-2">Timer</div>
          <div className="flex gap-2">{[3, 5, 10].map((t) => <button key={t} className="chip flex-1 justify-center" data-on={timer === t} onClick={() => setTimer(t)} disabled={busy}>{t}s</button>)}</div>
        </div>
        <div>
          <div className="label mb-2">How many photos</div>
          <div className="flex gap-2">{COUNTS.map((c) => <button key={c} className="chip flex-1 justify-center" data-on={count === c} onClick={() => setCount(c)} disabled={busy}>{c}</button>)}</div>
          <p className="text-[11px] text-mocha mt-1.5">Your {LAYOUT_MAP[layout].name} has {layoutFrames} frame{layoutFrames > 1 ? 's' : ''}.</p>
        </div>
        <div>
          <div className="label mb-2">Live film</div>
          <div className="grid grid-cols-5 gap-x-1 gap-y-2.5 max-h-[230px] overflow-y-auto scroll-thin pr-1 pt-1">
            {FILTERS.map((x) => (
              <button key={x.key} onClick={() => setFilter(x.key)} className={`flex flex-col items-center gap-1 ${filter === x.key ? '' : 'opacity-70 hover:opacity-100'}`}>
                <span className={`w-11 h-11 rounded-full border-2 ${filter === x.key ? 'border-cocoa scale-110' : 'border-transparent'} transition`} style={{ background: `linear-gradient(135deg, ${x.swatch}, #fff8)` }} />
                <span className="text-[9.5px] leading-tight text-center font-semibold">{x.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2.5 pt-1">
          {busy
            ? <button className="btn btn-ghost w-full" onClick={() => { cancel.current = true; }}>■ Stop</button>
            : <button className="btn btn-rose w-full !py-4 text-base" disabled={!stream} onClick={startSession}>📸 {filled ? (filled === frames.length ? 'Shoot all again' : 'Shoot remaining') : 'Start the countdown'}</button>}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>⬆ Upload</button>
            <button className="btn btn-ghost btn-sm" onClick={retakeAll} disabled={busy || !filled}>↺ Retake all</button>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-mocha cursor-pointer">
            <input type="checkbox" checked={sound} onChange={(e) => { setSnd(e.target.checked); setSound(e.target.checked); }} className="accent-[#b6403a]" /> Booth sounds
            {stream && <><span className="mx-1">·</span><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} className="accent-[#b6403a]" /> Mirror</>}
          </label>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
        </div>
        <div className="border-t border-dashed border-cocoa/20 pt-4">
          <div className="text-sm font-semibold">{filled} of {frames.length} shots ready</div>
          <button className="btn btn-primary w-full mt-3" disabled={!filled || busy} onClick={() => { setShots(frames.filter(Boolean) as Shot[]); onDone(); }}>Choose favourites →</button>
        </div>
      </aside>
    </div>
  );
}

function FavouritesStep() {
  const { shots, layout, theme, themeId, variantId, decorOn, setFavorites, favorites, setDesign, go, design, boothFilter } = useStore();
  const frames = LAYOUT_MAP[layout].build(defaultSettings(theme, layout)).slots.length;
  const [sel, setSel] = useState<string[]>(() => {
    const valid = favorites.filter((id) => shots.some((s) => s.id === id));
    return valid.length ? valid : shots.slice(0, Math.max(frames, shots.length)).map((s) => s.id);
  });
  const toggle = (id: string) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const create = () => {
    setFavorites(sel);
    const filter = boothFilter ?? theme.filter;
    setDesign(initialDesign(themeId, variantId, layout, filter, sel, decorOn));
    go('studio');
  };
  const note = useMemo(() => sel.length < frames ? `We’ll repeat your picks to fill all ${frames} frames — or go back and take more.` : sel.length > frames ? `Only the first ${frames} will be used — you can swap any frame in the studio.` : 'Perfect fit!', [sel.length, frames]);

  if (!shots.length) return <div className="card p-10 text-center">No photos yet — go back and take a few.</div>;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-mocha">Tap to choose the order your photos appear in your <b>{LAYOUT_MAP[layout].name}</b> ({frames} frames). <span className="text-cherry font-semibold">{note}</span></p>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => setSel(shots.map((s) => s.id))}>Select all</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSel([])}>Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {shots.map((s, i) => {
          const n = sel.indexOf(s.id);
          return (
            <motion.button key={s.id} whileTap={{ scale: .97 }} onClick={() => toggle(s.id)} className={`relative bg-paper p-2 pb-8 shadow-card transition ${n >= 0 ? 'ring-4 ring-cherry' : 'opacity-75 hover:opacity-100'}`} style={{ transform: `rotate(${(i % 3) - 1}deg)` }}>
              <img src={s.thumb} alt="" className="w-full aspect-[4/3] object-cover developing" />
              <span className="absolute bottom-1.5 left-3 font-hand text-lg">shot no. {i + 1}</span>
              {n >= 0 && <span className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-cherry text-paper font-bold grid place-items-center shadow-soft">{n + 1}</span>}
            </motion.button>
          );
        })}
      </div>
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button className="btn btn-primary !px-8 !py-4 text-base shadow-soft" disabled={!sel.length} onClick={create}>
          {design ? 'Develop a new strip ✦' : 'Develop my strip ✦'}
        </button>
      </div>
    </div>
  );
}
