import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { develop, downloadURL, makeCanvas } from '../lib/develop';
import { StickerArt } from '../components/ui';
import { sideBySide } from '../lib/back';
import { loadImage } from '../data/stickers';

const CONFETTI = ['#f2a9b8', '#f1c94c', '#a9c7e8', '#c9b9de', '#c8453e', '#a9b79a'];

export default function Final() {
  const { lastExport: c, go, design, shots, toast, setBoothStep, user, openAuth } = useStore();
  const [printing, setPrinting] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ x: Math.random() * 100, d: Math.random() * 1.5, r: Math.random() * 360, c: CONFETTI[i % CONFETTI.length], s: 6 + Math.random() * 8 })), []);
  if (!c) return null;
  const name = `snap-and-stick-${new Date(c.date).toISOString().slice(0, 10)}`;

  const asJPG = () => {
    const im = new Image();
    im.onload = () => {
      const cv = makeCanvas(im.width, im.height), x = cv.getContext('2d')!;
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0);
      downloadURL(cv.toDataURL('image/jpeg', .94), name + '.jpg');
    };
    im.src = c.url;
  };
  const singles = () => {
    if (!design) return;
    const ids = [...new Set(design.slots.filter(Boolean) as string[])];
    ids.forEach((id, i) => {
      const s = shots.find((x) => x.id === id); if (!s) return;
      setTimeout(() => downloadURL(develop(s.raw, design.filter, design.intensity, i + id.charCodeAt(0)).toDataURL('image/jpeg', .95), `${name}-photo-${i + 1}.jpg`), i * 400);
    });
    toast(`Saving ${ids.length} photo${ids.length > 1 ? 's' : ''}…`);
  };
  const both = async () => {
    if (!c.backUrl) return;
    const [f, b] = await Promise.all([loadImage(c.url), loadImage(c.backUrl)]);
    downloadURL(sideBySide(f, b).toDataURL('image/png'), name + '-front-and-back.png');
  };
  const print = () => { setPrinting(true); setTimeout(() => { window.print(); setPrinting(false); }, 150); };
  const blob = async () => (await fetch(c.url)).blob();
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = async () => {
    try {
      const file = new File([await blob()], name + '.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'My Snap & Stick strip', text: 'a little moment, a forever memory ✦' });
      else if (navigator.share) await navigator.share({ title: 'Snap & Stick', text: 'I made a photo strip ✦' });
    } catch (e: any) { if (e?.name !== 'AbortError') toast('Sharing isn’t available here — try downloading instead'); }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span key={i} className="absolute top-0 rounded-sm pointer-events-none" style={{ left: `${p.x}%`, width: p.s, height: p.s * .5, background: p.c }}
          initial={{ y: -40, rotate: 0, opacity: 1 }} animate={{ y: 700, rotate: p.r + 360, opacity: 0 }} transition={{ duration: 3 + p.d, delay: p.d * .6, ease: 'easeIn' }} />
      ))}
      <div className="grid md:grid-cols-[1fr_1.05fr] gap-12 items-center">
        <motion.div initial={{ y: -60, opacity: 0, rotate: -6 }} animate={{ y: 0, opacity: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 60, damping: 12 }} className="relative justify-self-center">
          <div className="absolute -inset-6 bg-beige/70 rounded-[40px] rotate-3" />
          <div style={{ perspective: 2000 }}>
            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: .8, ease: [.45, .05, .2, 1] }} style={{ transformStyle: 'preserve-3d' }} className="relative bg-paper p-3 shadow-card cursor-pointer" onClick={() => c.backUrl && setFlipped(!flipped)}>
              <img src={c.url} alt="Your finished photo strip" className="developing block max-h-[70vh] max-w-full" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} />
              {c.backUrl && <div className="absolute inset-0 bg-paper p-3" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><img src={c.backUrl} alt="The note on the back" className="w-full h-full object-contain" /></div>}
            </motion.div>
          </div>
          {c.backUrl && <button className="relative mx-auto mt-4 flex btn btn-ghost btn-sm" onClick={() => setFlipped(!flipped)}>↻ {flipped ? 'See the front' : 'Turn over — there’s a note'}</button>}
          <div className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
          <StickerArt id="sparkleG" className="floaty absolute -right-8 top-10 w-14" />
          <StickerArt id="heartPink" className="floaty absolute -left-8 bottom-16 w-14" style={{ animationDelay: '1s' }} />
        </motion.div>
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6 }}>
            <div className="label">Fresh out of the booth</div>
            <h1 className="font-serif text-5xl sm:text-7xl leading-[.95] mt-2">Your memories <span className="italic text-cherry">are ready!</span></h1>
            <p className="text-mocha mt-4">{c.layout} · {c.theme} · {c.filter}.</p>
            {user
              ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold bg-sage/40 rounded-full px-4 py-2">✓ Saved to your account — <button className="underline" onClick={() => go('creations')}>My Creations</button></p>
              : <div className="mt-4 rounded-2xl bg-butter/50 border border-cocoa/10 p-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm flex-1 min-w-[200px]"><b>Want to keep it?</b> Right now it’s only saved for this visit. Sign up to keep it and edit it again later.</span>
                  <button className="btn btn-primary btn-sm" onClick={() => openAuth('signup')}>Sign up free</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openAuth('signin')}>Sign in</button>
                </div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .85 }} className="grid sm:grid-cols-2 gap-3 mt-8">
            <button className="btn btn-primary !py-4" onClick={() => downloadURL(c.url, name + '.png')}>⬇ Download PNG <span className="text-[10px] opacity-70">hi-res</span></button>
            <button className="btn btn-ghost !py-4" onClick={asJPG}>⬇ Download JPG</button>
            <button className="btn btn-ghost !py-4" onClick={singles}>🖼 Save individual photos</button>
            <button className="btn btn-ghost !py-4" onClick={print}>🖨 Printable version{c.backUrl ? ' (2 sides)' : ''}</button>
            {c.backUrl && <button className="btn btn-ghost !py-4" onClick={() => downloadURL(c.backUrl!, name + '-note.png')}>✉ Download the note (back)</button>}
            {c.backUrl && <button className="btn btn-ghost !py-4" onClick={both}>⧉ Front + back, one image</button>}
            {canShare && <button className="btn btn-rose !py-4 sm:col-span-2" onClick={share}>↗ Share</button>}
          </motion.div>
          <div className="flex flex-wrap gap-3 mt-6 text-sm">
            <button className="btn btn-ghost btn-sm" onClick={() => go('studio')}>← Keep decorating</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setBoothStep(2); go('booth'); }}>📸 New session</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setBoothStep(0); go('booth'); }}>Try another occasion</button>
          </div>
        </div>
      </div>
      <div className="print-area hidden flex-col">{printing && <><img src={c.url} alt="" style={{ breakAfter: 'page' }} />{c.backUrl && <img src={c.backUrl} alt="" />}</>}</div>
    </div>
  );
}
