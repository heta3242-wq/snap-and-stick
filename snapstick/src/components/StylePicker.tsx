import { motion } from 'framer-motion';
import { stylesFor } from '../data/styles';
import { svgDataURL } from '../data/stickers';
import { FONT_MAP } from '../data/themes';
import { patternTile } from '../data/patterns';
import { LayoutPreview } from './LayoutPreview';
import { defaultSettings } from '../store';

/** Grid of 4–5 style variants for one occasion, each previewed with its colours, caption font and starter stickers. */
export function StylePicker({ themeId, value, onPick, decorOn, setDecorOn, layoutKey, compact = false }: {
  themeId: string; value: string | null; onPick: (id: string) => void;
  decorOn: boolean; setDecorOn: (v: boolean) => void; layoutKey: string; compact?: boolean;
}) {
  const styles = stylesFor(themeId);
  const current = value ?? styles[0].id;
  const anyDecor = styles.some((s) => s.decor.length);
  return (
    <div>
      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {styles.map((v) => {
          const t = v.theme, on = current === v.id;
          const tile = patternTile(t.pattern, t.bg, t.accent);
          return (
            <motion.button key={v.id} whileHover={{ y: -3 }} whileTap={{ scale: .98 }} onClick={() => onPick(v.id)}
              className={`text-left rounded-2xl overflow-hidden border-2 bg-paper shadow-card transition ${on ? 'border-cherry' : 'border-transparent'}`}>
              <div className={`relative ${compact ? 'h-28' : 'h-36'} grid place-items-center`} style={{ background: tile ? `url(${tile.toDataURL()}) center/56px` : t.bg }}>
                <LayoutPreview layoutKey={layoutKey} theme={t} settings={{ ...defaultSettings(t, layoutKey) }} className={`${compact ? 'h-24' : 'h-32'} max-w-[70%] drop-shadow`} />
                {decorOn && v.decor.slice(0, 4).map((d, i) => (
                  <span key={i} className="absolute" style={{ left: ['6%', '72%', '8%', '74%'][i], top: ['6%', '10%', '58%', '62%'][i], transform: `rotate(${[-12, 10, -8, 14][i]}deg)` }}>
                    {d.kind === 'svg' ? <img src={svgDataURL(d.src)} alt="" className={compact ? 'h-7 max-w-[44px]' : 'h-9 max-w-[56px]'} /> : <span className={compact ? 'text-xl' : 'text-2xl'}>{d.src}</span>}
                  </span>
                ))}
                {on && <span className="absolute right-2 bottom-2 bg-cherry text-paper text-[10px] font-bold rounded-full px-2 py-0.5">✓</span>}
              </div>
              <div className="px-3 py-2">
                <div className="text-sm font-bold leading-tight">{v.name}</div>
                <div className="text-[13px] truncate text-mocha" style={{ fontFamily: FONT_MAP[t.font]?.css }}>{t.caption}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
      {anyDecor && (
        <label className={`mt-3 inline-flex items-center gap-2.5 font-semibold cursor-pointer bg-paper rounded-full pl-3 pr-4 py-2 border border-cocoa/10 ${compact ? 'text-xs' : 'text-sm'}`}>
          <input type="checkbox" checked={decorOn} onChange={(e) => setDecorOn(e.target.checked)} className="w-4 h-4 accent-[#b6403a]" />
          {compact ? 'Matching starter stickers' : 'Start with matching stickers'}{!compact && <span className="text-xs text-mocha font-normal">— move, resize or delete them anytime</span>}
        </label>
      )}
    </div>
  );
}
