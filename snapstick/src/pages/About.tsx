import { useStore } from '../store';
import { StripMock, StickerArt, PolaroidMock } from '../components/ui';

export default function About() {
  const { go, setBoothStep } = useStore();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <div className="label">About the booth</div>
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1] mt-2">Made for the <span className="italic text-cherry">little</span> moments.</h1>
          <p className="text-mocha mt-6 leading-relaxed text-lg">Snap &amp; Stick started with a simple feeling — the giddy squeeze into a photobooth with your favourite people, the flash, the wait, and the strip that ends up taped to a mirror for years.</p>
          <p className="text-mocha mt-4 leading-relaxed">We rebuilt that ritual for your browser: real countdowns, film-inspired looks, sticker sheets you can’t stop playing with, and layouts borrowed from Korean four-cut booths, Polaroids and old contact sheets.</p>
          <button className="btn btn-primary mt-8" onClick={() => { setBoothStep(1); go('booth'); }}>📸 Enter the Photobooth</button>
        </div>
        <div className="relative h-[440px]">
          <div className="absolute left-4 top-0 w-44 -rotate-6"><StripMock scenes={['cafe', 'meadow', 'lake', 'beach']} filter="analog" bg="#fbf8f1" caption="us, lately" /></div>
          <div className="absolute right-4 top-16 w-52"><PolaroidMock scene="balloons" filter="pastel" caption="hello ♡" rot={7} /></div>
          <StickerArt id="bowRed" className="floaty absolute w-20 right-24 bottom-6" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5 mt-20">
        {[['🔒', 'Private by design', 'All processing — camera, filters, stickers, exports — happens locally in your browser. Photos are never uploaded or stored on a server.'],
          ['🎞️', 'Real film character', 'Grain, light leaks, dust, VHS fuzz and flash falloff are painted pixel by pixel, so every export carries the look.'],
          ['💛', 'No account, no watermark', 'Walk in, snap, decorate, download. Your strips are yours — clean, full resolution, no logos.']].map(([i, t, d]) => (
          <div key={t} className="card p-7"><div className="text-3xl">{i}</div><div className="font-serif text-2xl mt-3">{t}</div><p className="text-sm text-mocha mt-2 leading-relaxed">{d}</p></div>
        ))}
      </div>
      <div className="card p-8 mt-8">
        <div className="font-serif text-2xl">A few booth tips</div>
        <ul className="mt-3 text-sm text-mocha space-y-2 list-disc pl-5">
          <li>Camera access needs a secure page (https or a file opened on your computer). If your browser blocks it, you can always upload photos instead.</li>
          <li>Pick your favourite shots after the session — you can swap any frame in the studio by tapping a photo.</li>
          <li>Hold the <b>Compare</b> button in the studio to peek at your original, unfiltered photos.</li>
          <li>Use <b>Ctrl/Cmd + Z</b> and <b>Ctrl/Cmd + Shift + Z</b> to undo and redo.</li>
        </ul>
      </div>
    </div>
  );
}
