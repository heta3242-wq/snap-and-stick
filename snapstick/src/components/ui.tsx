import { motion, AnimatePresence } from 'framer-motion';
import { useState, type ReactNode, type CSSProperties } from 'react';
import { useStore, type Route } from '../store';
import { sample } from '../lib/samples';
import { svgDataURL, STICKER_CATS } from '../data/stickers';
import { AccountButton } from './Auth';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative w-9 h-11 rounded-[6px] bg-cocoa shadow-soft flex flex-col gap-[3px] p-[4px] rotate-[-6deg]">
        {[0, 1, 2].map((i) => <div key={i} className="flex-1 rounded-[2px]" style={{ background: ['#e9b7b4', '#f1d99a', '#c9b9de'][i] }} />)}
      </div>
      <div className="leading-none">
        <div className={`font-serif text-[27px] tracking-tight ${light ? 'text-paper' : 'text-cocoa'}`}>Snap <span className="italic text-cherry">&amp;</span> Stick</div>
        <div className={`hidden sm:block text-[9px] tracking-[.3em] uppercase font-bold ${light ? 'text-paper/70' : 'text-mocha'}`}>photobooth · est. today</div>
      </div>
    </div>
  );
}

const NAV: [Route, string][] = [['home', 'Home'], ['themes', 'Explore Themes'], ['booth', 'Photobooth'], ['creations', 'My Creations'], ['about', 'About']];

export function Nav() {
  const { route, go, creations } = useStore();
  const [open, setOpen] = useState(false);
  const active = (r: Route) => route === r || (r === 'booth' && (route === 'studio' || route === 'final'));
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/80 border-b border-cocoa/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <button onClick={() => go('home')} aria-label="Snap & Stick home"><Logo /></button>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(([r, label]) => (
            <button key={r} onClick={() => go(r)} className={`relative px-3.5 py-2 rounded-full text-sm font-semibold transition ${active(r) ? 'text-cocoa' : 'text-mocha/80 hover:text-cocoa'}`}>
              {active(r) && <motion.span layoutId="navpill" className="absolute inset-0 bg-beige/70 rounded-full -z-10" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              {label}{r === 'creations' && creations.length > 0 && <span className="ml-1.5 text-[10px] bg-cherry text-paper rounded-full px-1.5 py-0.5">{creations.length}</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AccountButton />
          <button className="btn btn-primary btn-sm hidden lg:inline-flex" onClick={() => go('booth')}>📸 Enter booth</button>
          <button className="md:hidden w-10 h-10 rounded-full border border-cocoa/20 grid place-items-center" onClick={() => setOpen(!open)} aria-label="Menu">
            <div className="space-y-1"><span className="block w-4 h-[2px] bg-cocoa" /><span className="block w-4 h-[2px] bg-cocoa" /><span className="block w-3 h-[2px] bg-cocoa" /></div>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-cocoa/10 bg-paper">
            {NAV.map(([r, label]) => <button key={r} onClick={() => { go(r); setOpen(false); }} className={`block w-full text-left px-6 py-3.5 font-semibold ${active(r) ? 'text-cherry' : ''}`}>{label}</button>)}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const { go } = useStore();
  return (
    <footer className="mt-24 bg-cocoa text-paper/90">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-paper/70 max-w-sm leading-relaxed">A little photobooth that lives in your browser. Your photos are processed on your device and never uploaded anywhere.</p>
        </div>
        <div className="text-sm space-y-2.5">
          <div className="label !text-blush mb-3">Visit</div>
          {NAV.map(([r, l]) => <button key={r} className="block hover:text-blush" onClick={() => go(r)}>{l}</button>)}
        </div>
        <div className="text-sm">
          <div className="label !text-blush mb-3">Booth hours</div>
          <p className="text-paper/70">Open 24/7. No coins, no queue,<br />no sign-up. Just smile.</p>
          <p className="font-hand text-2xl mt-5 text-butter">see you in the booth ♡</p>
        </div>
      </div>
      <div className="text-center text-xs text-paper/40 pb-8 tracking-widest">© SNAP &amp; STICK · MADE WITH FILM GRAIN</div>
    </footer>
  );
}

export function Toast() {
  const { toastMsg } = useStore();
  return (
    <AnimatePresence>
      {toastMsg && (
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-cocoa text-paper px-5 py-3 rounded-full text-sm font-semibold shadow-soft">
          {toastMsg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A realistic HTML photo-strip mockup built from sample photos. */
export function StripMock({ scenes, filter = 'kodak', bg = '#fbf8f1', ink = '#4a2f24', caption = 'a little moment', font = 'Caveat', rot = 0, className = '', style, date = true, radius = 0 }:
  { scenes: string[]; filter?: string; bg?: string; ink?: string; caption?: string; font?: string; rot?: number; className?: string; style?: CSSProperties; date?: boolean; radius?: number }) {
  return (
    <div className={`p-2.5 pb-0 shadow-card ${className}`} style={{ background: bg, transform: `rotate(${rot}deg)`, ...style }}>
      <div className="flex flex-col gap-2">
        {scenes.map((s, i) => (
          <div key={i} className="relative overflow-hidden" style={{ borderRadius: radius }}>
            <img src={sample(s, filter)} alt="" className="block w-full aspect-[4/3] object-cover" draggable={false} />
            {date && i === scenes.length - 1 && <span className="absolute right-2 bottom-1 font-pixel text-[13px] text-[#ff8a1e] [text-shadow:0_0_4px_rgba(255,110,0,.8)]">'26 11 07</span>}
          </div>
        ))}
      </div>
      <div className="text-center py-3 leading-none" style={{ color: ink, fontFamily: `"${font}"`, fontSize: font === 'Caveat' ? 24 : 17 }}>{caption}</div>
    </div>
  );
}

export function PolaroidMock({ scene, filter = 'polaroid', caption = '', rot = 0, className = '', style }: { scene: string; filter?: string; caption?: string; rot?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`bg-[#fffdf8] p-2.5 pb-10 shadow-card relative ${className}`} style={{ transform: `rotate(${rot}deg)`, ...style }}>
      <img src={sample(scene, filter, 400, 400)} alt="" className="block w-full aspect-square object-cover" draggable={false} />
      <div className="absolute bottom-2 inset-x-0 text-center font-hand text-xl text-cocoa">{caption}</div>
    </div>
  );
}

const allSvg = STICKER_CATS.flatMap((c) => c.items.filter((i) => i.kind === 'svg'));
export function StickerArt({ id, className = '', style }: { id: string; className?: string; style?: CSSProperties }) {
  const it = allSvg.find((x) => x.id === id);
  if (!it) return null;
  return <img src={svgDataURL(it.src)} alt="" className={className} style={style} draggable={false} />;
}

export function Section({ eyebrow, title, children, className = '', right }: { eyebrow?: string; title: ReactNode; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 ${className}`}>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          {eyebrow && <div className="label mb-2">{eyebrow}</div>}
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05]">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export const PageFade = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35, ease: 'easeOut' }}>{children}</motion.div>
);
