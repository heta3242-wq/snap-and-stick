import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { THEMES, themeBadges, FONT_MAP, pickInk } from '../data/themes';
import { STICKER_CATS, svgDataURL } from '../data/stickers';
import { LAYOUT_MAP } from '../data/layouts';
import { FILTER_MAP } from '../data/filters';
import { StripMock } from '../components/ui';

const SCENES = [['cafe', 'meadow', 'beach'], ['party', 'balloons', 'city'], ['lake', 'snow', 'cafe'], ['beach', 'city', 'meadow']];

export default function Themes() {
  const { go, setThemeId, setLayout, setBoothStep } = useStore();
  const [tab, setTab] = useState<'all' | 'occasion' | 'aesthetic'>('all');
  const list = THEMES.filter((t) => tab === 'all' || t.kind === tab);
  const use = (id: string) => { const t = THEMES.find((x) => x.id === id)!; setThemeId(id); setLayout(t.layout); setBoothStep(1); go('booth'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="label">The collection</div>
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1] mt-2">Explore <span className="italic text-cherry">themes</span></h1>
          <p className="text-mocha mt-4 max-w-lg">Every theme comes with its own frames, colours, fonts, filter and sticker pack. Browse freely — nothing to sign up for.</p>
        </div>
        <div className="flex gap-2 bg-paper rounded-full p-1.5 shadow-sm border border-cocoa/10 self-start md:self-auto">
          {(['all', 'occasion', 'aesthetic'] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === k ? 'bg-cocoa text-paper' : 'text-mocha'}`}>
              {k === 'all' ? 'Everything' : k === 'occasion' ? 'Occasions' : 'Aesthetics'}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        <AnimatePresence>
          {list.map((t, i) => {
            const badges = themeBadges(t).slice(0, 2);
            const extras = t.cats.slice(0, 2).map((c) => STICKER_CATS.find((x) => x.id === c)!.items.find((x) => x.kind === 'svg')).filter(Boolean);
            return (
              <motion.article layout key={t.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}
                className="card overflow-hidden group flex flex-col">
                <div className="relative h-[260px] overflow-hidden" style={{ background: t.bg }}>
                  <div className="absolute left-6 top-6 w-[34%] transition-transform duration-500 group-hover:-rotate-2 -rotate-6">
                    <StripMock scenes={SCENES[i % 4]} filter={t.filter} bg={t.palette[1]} ink={pickInk(t.palette[1])} caption={t.caption} font={t.font} date={false} />
                  </div>
                  <div className="absolute right-4 top-6 flex flex-col items-end gap-3">
                    {badges.map((b) => <img key={b.id} src={svgDataURL(b.src)} className="h-9 drop-shadow-sm odd:rotate-3 even:-rotate-3" alt="" />)}
                    <div className="flex gap-2">{extras.map((e) => <img key={e!.id} src={svgDataURL(e!.src)} className="w-14 h-14 object-contain drop-shadow-sm" alt="" />)}</div>
                  </div>
                  <span className="absolute left-4 bottom-3 text-[10px] tracking-[.2em] font-bold uppercase px-2.5 py-1 rounded-full bg-paper/85">{t.kind}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-3xl leading-none">{t.icon} {t.name}</h3>
                  </div>
                  <p className="text-sm text-mocha mt-2">{t.blurb}</p>
                  <div className="flex items-center gap-1.5 mt-4">
                    {t.palette.map((c) => <span key={c} className="w-6 h-6 rounded-full border border-cocoa/15" style={{ background: c }} />)}
                    <span className="ml-auto text-lg" style={{ fontFamily: FONT_MAP[t.font]?.css }}>Aa</span>
                  </div>
                  <div className="text-xs text-mocha mt-3">Layout: <b>{LAYOUT_MAP[t.layout].name}</b> · Filter: <b>{FILTER_MAP[t.filter].name}</b></div>
                  <button className="btn btn-primary mt-5 w-full" onClick={() => use(t.id)}>Use this theme</button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="card mt-10 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-serif text-3xl">No occasion? No problem.</div>
          <p className="text-mocha text-sm mt-1">Use the plain Classic booth — every sticker, filter and layout is still there.</p>
        </div>
        <button className="btn btn-rose" onClick={() => { setThemeId('classic'); setBoothStep(1); go('booth'); }}>Open the Classic booth →</button>
      </div>
    </div>
  );
}
