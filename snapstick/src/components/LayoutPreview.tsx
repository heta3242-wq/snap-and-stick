import { LAYOUT_MAP, type StripSettings } from '../data/layouts';
import { defaultSettings } from '../store';
import type { Theme } from '../data/themes';

const TONES = ['#e9b7b4', '#f1d99a', '#c9b9de', '#a9c7e8', '#a9b79a', '#d9c4a5'];

export function LayoutPreview({ layoutKey, theme, settings, className = '' }: { layoutKey: string; theme: Theme; settings?: StripSettings; className?: string }) {
  const s = settings ?? defaultSettings(theme, layoutKey);
  const b = LAYOUT_MAP[layoutKey].build(s);
  return (
    <svg viewBox={`0 0 ${b.W} ${b.H}`} className={className} preserveAspectRatio="xMidYMid meet">
      <rect width={b.W} height={b.H} fill={s.bg} rx={4} />
      {b.deco.map((d, i) => d.t === 'rect'
        ? <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill={d.fill} opacity={d.opacity ?? 1} rx={d.r ?? 0} transform={`rotate(${d.rot ?? 0} ${d.x} ${d.y})`} style={d.shadow ? { filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.25))' } : undefined} />
        : d.t === 'ring' ? <ellipse key={i} cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} fill="none" stroke={d.stroke} strokeWidth={d.width} /> : null)}
      {b.slots.map((sl, i) => (
        <rect key={i} x={sl.x} y={sl.y} width={sl.w} height={sl.h} rx={s.radius} fill={TONES[i % TONES.length]} transform={`rotate(${sl.rot ?? 0} ${sl.x} ${sl.y})`} />
      ))}
      <rect x={b.W / 2 - b.capW * .3} y={b.capY - b.capSize * .18} width={b.capW * .6} height={b.capSize * .36} rx={b.capSize * .18} fill={theme.ink} opacity={.35} />
    </svg>
  );
}
