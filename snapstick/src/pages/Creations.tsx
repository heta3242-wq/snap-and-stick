import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore, type Creation, type Shot } from '../store';
import { downloadURL, makeCanvas, toCanvas } from '../lib/develop';
import { loadImage } from '../data/stickers';
import { backend } from '../lib/backend';
import { StickerArt } from '../components/ui';

async function toShot(id: string, data: string): Promise<Shot> {
  const im = await loadImage(data);
  const c = makeCanvas(im.width, im.height); c.getContext('2d')!.drawImage(im, 0, 0);
  return { id, raw: c, thumb: toCanvas(c, c.width, c.height, 360).toDataURL('image/jpeg', .82) };
}

export default function Creations() {
  const s = useStore();
  const { creations, removeCreation, go, setBoothStep, toast, user, openAuth, signOut, deleteAccount } = s;
  const [confirm, setConfirm] = useState<string | null>(null);
  const [confirmAcct, setConfirmAcct] = useState(false);
  const [usage, setUsage] = useState(0);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => { if (user) backend.usage(user.id).then(setUsage).catch(() => {}); }, [user, creations]);

  const editAgain = async (c: Creation) => {
    if (!c.design || !c.shots?.length) return;
    setOpening(c.id);
    try {
      const shots = await Promise.all(c.shots.map((x) => toShot(x.id, x.data)));
      s.setThemeId(c.design.themeId); s.setVariantId(c.design.variantId); s.setLayout(c.design.layout);
      s.setShots(shots); s.setFavorites(shots.map((x) => x.id));
      s.setDesign({ ...c.design }); s.setLastExport(null);
      go('studio');
    } catch { toast('Couldn’t reopen that strip'); }
    finally { setOpening(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="label">{user ? `${user.name.split(' ')[0]}’s collection` : 'This visit'}</div>
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1] mt-2">My <span className="italic text-cherry">creations</span></h1>
          <p className="text-mocha mt-4 max-w-xl">{user
            ? 'Everything you finish is saved to your account on this device — download it again or reopen it to keep decorating.'
            : 'Strips you make right now live only in this tab. Create a free account to keep them — and reopen them later to edit.'}</p>
        </div>
        {user && (
          <div className="card p-4 text-sm min-w-[260px]">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-mocha">{user.email}</div>
            <div className="text-xs text-mocha mt-2">{creations.length} saved · {(usage / 1048576).toFixed(1)} MB on this device</div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
              {confirmAcct
                ? <button className="btn btn-rose btn-sm" onClick={() => { deleteAccount(); setConfirmAcct(false); }}>Delete everything?</button>
                : <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAcct(true)}>Delete account</button>}
            </div>
          </div>
        )}
      </div>

      {!user && (
        <div className="mt-8 rounded-[28px] bg-cocoa text-paper p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
          <StickerArt id="heartPink" className="absolute -right-4 -bottom-6 w-28 opacity-80 rotate-12" />
          <div className="flex-1">
            <div className="font-serif text-3xl">Don’t lose your little moments</div>
            <p className="text-paper/75 text-sm mt-1">Sign up to save every strip, note and edit — free, no email verification, stored privately on this device.</p>
          </div>
          <div className="flex gap-2 relative">
            <button className="btn bg-paper text-cocoa hover:bg-blush" onClick={() => openAuth('signup')}>Create account</button>
            <button className="btn border border-paper/40" onClick={() => openAuth('signin')}>Sign in</button>
          </div>
        </div>
      )}

      {creations.length === 0 ? (
        <div className="card mt-10 p-12 text-center relative overflow-hidden">
          <StickerArt id="polaroidFrame" className="w-24 mx-auto rotate-[-8deg]" />
          <div className="font-serif text-3xl mt-6">No strips yet</div>
          <p className="text-mocha mt-2">Your first little memory is one countdown away.</p>
          <button className="btn btn-primary mt-6" onClick={() => { setBoothStep(1); go('booth'); }}>📸 Enter the Photobooth</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          <AnimatePresence>
            {creations.map((c, i) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }} className="card p-3 flex flex-col">
                <div className="bg-beige/50 rounded-2xl p-4 flex items-center justify-center h-[280px] overflow-hidden">
                  <img src={c.thumb} alt="Photo strip" className="max-h-full max-w-full object-contain shadow-soft" style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }} />
                </div>
                <div className="px-1 pt-3 flex-1">
                  <div className="font-serif text-xl leading-tight">{c.layout}</div>
                  <div className="text-xs text-mocha mt-1">{new Date(c.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] bg-blush/40 rounded-full px-2 py-0.5">{c.theme}</span>
                    <span className="text-[11px] bg-butter/60 rounded-full px-2 py-0.5">{c.filter}</span>
                    {c.backUrl && <span className="text-[11px] bg-sky/60 rounded-full px-2 py-0.5">✉ note on back</span>}
                  </div>
                </div>
                {c.design && c.shots?.length ? <button className="btn btn-rose btn-sm mt-3 w-full" disabled={opening === c.id} onClick={() => editAgain(c)}>{opening === c.id ? 'Opening…' : '✎ Edit again'}</button> : null}
                {c.backUrl && <button className="btn btn-ghost btn-sm mt-2 w-full" onClick={() => downloadURL(c.backUrl!, `snap-and-stick-${c.id}-note.png`)}>✉ Download the note</button>}
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={() => { downloadURL(c.url, `snap-and-stick-${c.id}.png`); toast('Downloading…'); }}>Download</button>
                  {confirm === c.id
                    ? <button className="btn btn-rose btn-sm" onClick={() => { removeCreation(c.id); setConfirm(null); }}>Sure?</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(c.id)} aria-label="Delete">Delete</button>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
