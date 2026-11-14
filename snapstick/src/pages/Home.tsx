import { motion } from 'framer-motion';
import { useStore } from '../store';
import { THEMES } from '../data/themes';
import { FILTER_MAP } from '../data/filters';
import { StripMock, PolaroidMock, StickerArt, Section } from '../components/ui';
import { sample } from '../lib/samples';

const OCCASION_SCENES: Record<string, string[]> = {
  birthday: ['party', 'balloons'], love: ['beach', 'meadow'], friends: ['city', 'party'], anniversary: ['lake', 'cafe'], graduation: ['city', 'balloons'],
  christmas: ['snow', 'cafe'], halloween: ['city', 'snow'], travel: ['beach', 'lake'], wedding: ['meadow', 'lake'], everyday: ['cafe', 'meadow'],
};

export default function Home() {
  const { go, setThemeId, setLayout, setBoothStep } = useStore();
  const pick = (id: string) => {
    const t = THEMES.find((x) => x.id === id)!;
    setThemeId(id); setLayout(t.layout); setBoothStep(1); go('booth');
  };
  const occasions = THEMES.filter((t) => t.kind === 'occasion');
  const aesthetics = THEMES.filter((t) => t.kind === 'aesthetic');

  return (
    <div>
      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center overflow-visible">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-paper border border-cocoa/10 rounded-full pl-2 pr-4 py-1.5 text-xs font-semibold shadow-sm">
            <span className="bg-cherry text-paper rounded-full px-2 py-0.5 text-[10px] tracking-widest">NEW</span> 17 occasion &amp; aesthetic themes
          </motion.div>
          <h1 className="font-serif text-[54px] sm:text-[76px] lg:text-[88px] leading-[.95] tracking-[-0.02em] mt-6">
            A little moment,<br /><span className="italic text-cherry">a forever</span> memory.
          </h1>
          <p className="mt-6 text-lg text-mocha max-w-md leading-relaxed">Step into your own little photobooth. Capture, decorate, and turn your moments into something worth keeping.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn btn-primary !px-7 !py-4 text-base" onClick={() => { setBoothStep(1); go('booth'); }}>📸 Enter the Photobooth</button>
            <button className="btn btn-ghost !px-7 !py-4 text-base" onClick={() => go('themes')}>Explore the Collection →</button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mocha">
            {['No sign-up', 'Photos stay on your device', '25 film filters', '150+ stickers'].map((t) => <span key={t} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose" />{t}</span>)}
          </div>
        </div>

        {/* collage */}
        <div className="relative h-[520px] sm:h-[600px]">
          <div className="absolute inset-6 rounded-[40px] bg-beige/60 rotate-2" />
          <motion.div initial={{ y: 40, opacity: 0, rotate: -12 }} animate={{ y: 0, opacity: 1, rotate: -7 }} transition={{ delay: .1, type: 'spring', stiffness: 80 }} className="absolute left-[4%] top-[4%] w-[34%] z-10">
            <StripMock scenes={['party', 'balloons', 'cafe', 'meadow']} filter="softpink" bg="#f9dbe4" ink="#7a3b55" caption="happy birthday!" font="Pacifico" />
          </motion.div>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, rotate: 4 }} transition={{ delay: .25, type: 'spring', stiffness: 80 }} className="absolute left-[38%] top-[10%] w-[30%] z-20">
            <StripMock scenes={['beach', 'lake', 'city', 'snow']} filter="kodak" bg="#2b221d" ink="#efe7d8" caption="scene 04" font="Special Elite" />
          </motion.div>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .4, type: 'spring', stiffness: 80 }} className="absolute right-[2%] top-[2%] w-[32%] z-10">
            <PolaroidMock scene="meadow" filter="polaroid" caption="sunday ♡" rot={8} />
          </motion.div>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .55, type: 'spring', stiffness: 80 }} className="absolute right-[6%] bottom-[6%] w-[36%] z-30">
            <PolaroidMock scene="cafe" filter="mocha" caption="coffee first" rot={-5} />
          </motion.div>
          <div className="tape left-[40%] top-[7%] rotate-[-8deg] z-30" />
          <div className="tape right-[14%] bottom-[38%] rotate-[24deg] z-40 !bg-blush/80" />
          {/* floating stickers */}
          <StickerArt id="bowPink" className="floaty absolute w-20 left-[0%] bottom-[22%] z-40" style={{ ['--r' as any]: '-12deg' }} />
          <StickerArt id="sparkleG" className="floaty absolute w-12 left-[33%] top-[0%] z-40" style={{ animationDelay: '1s' }} />
          <StickerArt id="heartRed" className="floaty absolute w-14 right-[38%] bottom-[14%] z-40" style={{ animationDelay: '2s', ['--r' as any]: '10deg' }} />
          <StickerArt id="cherry" className="floaty absolute w-16 right-[0%] top-[42%] z-40" style={{ animationDelay: '.5s' }} />
          <StickerArt id="burstWow" className="floaty absolute w-20 left-[28%] bottom-[2%] z-40" style={{ animationDelay: '1.5s', ['--r' as any]: '-8deg' }} />
        </div>
      </section>

      {/* ticker */}
      <div className="bg-cocoa text-butter overflow-hidden py-3 my-6 -rotate-1 shadow-soft">
        <motion.div className="whitespace-nowrap font-serif italic text-2xl" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}>
          {Array(2).fill('say cheese ✦ four-cut strips ✦ polaroids ✦ film grain ✦ coquette bows ✦ y2k sparkle ✦ light leaks ✦ birthday wishes ✦ best friends ✦ wish you were here ✦ ').join('')}
        </motion.div>
      </div>

      {/* OCCASIONS */}
      <Section eyebrow="Start here" title={<>Pick your <span className="italic text-cherry">occasion</span></>} className="pt-16"
        right={<button className="btn btn-ghost btn-sm hidden sm:inline-flex" onClick={() => go('themes')}>All themes →</button>}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {occasions.map((t, i) => (
            <motion.button key={t.id} onClick={() => pick(t.id)} whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .04 }}
              className="group relative text-left rounded-[26px] overflow-hidden h-[250px] sm:h-[270px] shadow-card" style={{ background: t.bg }}>
              <div className="absolute right-[-10px] top-4 w-[52%] rotate-[8deg] group-hover:rotate-[2deg] transition-transform duration-500">
                <div className="p-1.5 pb-4 shadow-soft" style={{ background: t.palette[1] }}>
                  {OCCASION_SCENES[t.id].map((s) => <img key={s} src={sample(s, t.filter, 240, 180)} className="block w-full mb-1" alt="" />)}
                </div>
              </div>
              <div className="absolute left-4 top-4 text-3xl">{t.icon}</div>
              <div className="absolute inset-x-0 bottom-0 p-4 pt-10" style={{ background: `linear-gradient(transparent, ${t.bg} 40%)` }}>
                <div className="font-serif text-2xl leading-none" style={{ color: t.ink }}>{t.name}</div>
                <div className="text-xs mt-1.5 opacity-80" style={{ color: t.ink }}>{t.blurb}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* HOW */}
      <Section eyebrow="How the booth works" title="Four little steps" className="pt-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[['01', 'Pick a vibe', 'Choose an occasion or aesthetic — it loads its own frames, fonts, colours and stickers.', 'sparkleP'],
            ['02', 'Choose a layout', 'Korean four-cut, Polaroids, film strips, contact sheets, scrapbooks and more.', 'filmRoll'],
            ['03', 'Strike a pose', 'Countdown, flash, snap. Retake any shot, then pick your favourites.', 'camera'],
            ['04', 'Decorate & keep', 'Stickers, doodles, captions, film filters — then download, print or share.', 'heartPink']].map(([n, t, d, s]) => (
            <div key={n} className="card p-6 relative overflow-hidden">
              <StickerArt id={s} className="absolute -right-3 -top-3 w-20 opacity-90 rotate-12" />
              <div className="font-serif italic text-5xl text-rose">{n}</div>
              <div className="font-serif text-2xl mt-3">{t}</div>
              <p className="text-sm text-mocha mt-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FILTER SHOWCASE */}
      <Section eyebrow="The darkroom" title={<>Film looks that feel <span className="italic">real</span></>} className="pt-24">
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-thin snap-x">
          {['none', 'film70', 'kodak', 'disposable', 'polaroid', 'vhs', 'noir', 'dreamy', 'golden', 'mocha', 'leak', 'dust'].map((f, i) => (
            <figure key={f} className="snap-start flex-none w-[200px] bg-paper p-2 pb-3 shadow-card" style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}>
              <img src={sample('beach', f, 360, 270)} alt="" className="w-full block" />
              <figcaption className="font-hand text-xl text-center mt-1.5">{FILTER_MAP[f].name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* AESTHETICS */}
      <Section eyebrow="Or follow an aesthetic" title="Moods & aesthetics" className="pt-20">
        <div className="flex flex-wrap gap-3">
          {aesthetics.map((t) => (
            <button key={t.id} onClick={() => pick(t.id)} className="group flex items-center gap-3 rounded-full pl-2 pr-5 py-2 shadow-card border border-cocoa/10 hover:-translate-y-1 transition" style={{ background: t.bg, color: t.ink }}>
              <span className="w-10 h-10 rounded-full grid place-items-center text-xl bg-white/50">{t.icon}</span>
              <span className="font-serif text-xl">{t.name}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        <div className="relative rounded-[36px] bg-cocoa text-paper overflow-hidden px-8 py-14 sm:p-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div className="label !text-blush">The booth is open</div>
            <h3 className="font-serif text-5xl sm:text-6xl mt-3 leading-[1]">Ready when <span className="italic text-blush">you</span> are.</h3>
            <p className="mt-4 text-paper/70 max-w-md">Everything happens on your device — your photos never leave your browser.</p>
            <button className="btn bg-paper text-cocoa mt-8 !px-7 !py-4 hover:bg-blush" onClick={() => { setBoothStep(1); go('booth'); }}>📸 Enter the Photobooth</button>
          </div>
          <div className="relative h-64 hidden md:block">
            <div className="absolute right-10 top-0 w-40 rotate-6"><StripMock scenes={['snow', 'cafe', 'lake']} filter="film70" bg="#f3e6d0" caption="cozy" /></div>
            <div className="absolute right-48 top-6 w-40 -rotate-6"><StripMock scenes={['meadow', 'beach', 'balloons']} filter="pastel" bg="#fbe9ec" ink="#b05a6c" caption="lovely" font="Pacifico" /></div>
            <StickerArt id="sparkleW" className="floaty absolute w-14 right-2 bottom-0" />
          </div>
        </div>
      </section>
    </div>
  );
}
