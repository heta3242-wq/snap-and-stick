import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Group, Image as KImage, Text, Line, Ellipse, Transformer } from 'react-konva';
import type Konva from 'konva';
import { LAYOUT_MAP } from '../data/layouts';
import { patternTile } from '../data/patterns';
import { FONT_MAP } from '../data/themes';
import { stickerImage } from '../data/stickers';
import type { Design, El } from '../store';

export interface StripHandle { exportURL: (mult: number, mime?: string, quality?: number) => string; designSize: () => { W: number; H: number } }
interface Props {
  design: Design; photos: Record<string, HTMLCanvasElement | undefined>;
  scale: number; selected: string | null; onSelect: (id: string | null) => void;
  onElChange: (id: string, patch: Partial<El>, coalesce?: string) => void;
  drawMode: boolean; brush: { color: string; size: number }; onAddLine: (points: number[]) => void;
  fontsVersion: number;
}

function cover(img: { width: number; height: number }, w: number, h: number) {
  const r = Math.max(w / img.width, h / img.height);
  const cw = w / r, ch = h / r;
  return { x: (img.width - cw) / 2, y: (img.height - ch) / 2, width: cw, height: ch };
}

export const StripCanvas = forwardRef<StripHandle, Props>(function StripCanvas(p, ref) {
  const { design, photos, scale, selected, onSelect, onElChange, drawMode, brush } = p;
  const s = design.settings;
  const built = useMemo(() => LAYOUT_MAP[design.layout].build(s), [design.layout, s]);
  const stage = useRef<Konva.Stage>(null);
  const tr = useRef<Konva.Transformer>(null);
  const hl = useRef<Konva.Rect>(null);
  const [imgs, setImgs] = useState<Record<string, HTMLImageElement>>({});
  const [drawing, setDrawing] = useState<number[] | null>(null);
  const tile = useMemo(() => patternTile(s.pattern, s.bg, s.accent), [s.pattern, s.bg, s.accent]);

  // load sticker bitmaps
  useEffect(() => {
    design.elements.forEach((e) => {
      if (e.type === 'sticker' && !imgs[e.item.id]) stickerImage(e.item).then((im) => setImgs((m) => ({ ...m, [e.item.id]: im })));
    });
  }, [design.elements]); // eslint-disable-line

  // attach transformer
  useEffect(() => {
    const t = tr.current; if (!t) return;
    const node = selected && !selected.startsWith('slot:') ? stage.current?.findOne('#' + selected) : null;
    t.nodes(node && !drawMode ? [node] : []);
    t.getLayer()?.batchDraw();
  }, [selected, design.elements, drawMode, imgs]);

  useEffect(() => { stage.current?.batchDraw(); }, [p.fontsVersion]);

  useImperativeHandle(ref, () => ({
    designSize: () => ({ W: built.W, H: built.H }),
    exportURL: (mult, mime = 'image/png', quality = .95) => {
      const st = stage.current!, t = tr.current!, prev = t.nodes();
      t.nodes([]); hl.current?.visible(false); st.batchDraw();
      const url = st.toDataURL({ pixelRatio: mult / scale, mimeType: mime, quality });
      t.nodes(prev); hl.current?.visible(true); st.batchDraw();
      return url;
    },
  }), [built, scale]);

  const pointer = () => { const pos = stage.current!.getPointerPosition()!; return [pos.x / scale, pos.y / scale]; };
  const down = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (drawMode) { setDrawing(pointer()); return; }
    const target = e.target;
    if (target === stage.current || target.name() === 'bg') onSelect(null);
  };
  const move = () => { if (drawMode && drawing) setDrawing((d) => d ? [...d, ...pointer()] : d); };
  const up = () => { if (drawMode && drawing) { if (drawing.length >= 4) p.onAddLine(drawing); else p.onAddLine([...drawing, drawing[0] + .1, drawing[1] + .1]); setDrawing(null); } };

  const common = (e: El) => ({
    id: e.id, x: e.x, y: e.y, rotation: e.rotation, scaleX: e.scaleX, scaleY: e.scaleY, opacity: e.opacity,
    draggable: !drawMode,
    onMouseDown: (ev: Konva.KonvaEventObject<MouseEvent>) => { if (!drawMode) { ev.cancelBubble = true; onSelect(e.id); } },
    onTouchStart: (ev: Konva.KonvaEventObject<TouchEvent>) => { if (!drawMode) { ev.cancelBubble = true; onSelect(e.id); } },
    onDragEnd: (ev: Konva.KonvaEventObject<DragEvent>) => onElChange(e.id, { x: ev.target.x(), y: ev.target.y() }),
    onTransformEnd: (ev: Konva.KonvaEventObject<Event>) => {
      const n = ev.target;
      onElChange(e.id, { x: n.x(), y: n.y(), rotation: n.rotation(), scaleX: n.scaleX(), scaleY: n.scaleY() });
    },
    onMouseEnter: () => { if (!drawMode && stage.current) stage.current.container().style.cursor = 'move'; },
    onMouseLeave: () => { if (!drawMode && stage.current) stage.current.container().style.cursor = 'default'; },
  });

  const selSlot = selected?.startsWith('slot:') ? +selected.slice(5) : -1;
  const sl = selSlot >= 0 ? built.slots[selSlot] : null;

  return (
    <Stage ref={stage} width={built.W * scale} height={built.H * scale}
      onMouseDown={down} onTouchStart={down} onMouseMove={move} onTouchMove={move} onMouseUp={up} onTouchEnd={up}
      style={{ cursor: drawMode ? 'crosshair' : 'default', touchAction: drawMode ? 'none' : 'auto' }}>
      <Layer scaleX={scale} scaleY={scale}>
        <Rect name="bg" width={built.W} height={built.H} fill={s.bg}
          {...(tile ? { fillPatternImage: tile as unknown as HTMLImageElement, fillPatternRepeat: 'repeat', fillPriority: 'pattern' } : {})} />
        {built.deco.map((d, i) => d.t === 'rect'
          ? <Rect key={i} listening={false} x={d.x} y={d.y} width={d.w} height={d.h} fill={d.fill} rotation={d.rot ?? 0} cornerRadius={d.r ?? 0} opacity={d.opacity ?? 1}
              {...(d.shadow ? { shadowColor: '#2b1a10', shadowBlur: 22, shadowOpacity: .28, shadowOffsetY: 10 } : {})} />
          : d.t === 'text'
            ? <Text key={i} listening={false} x={d.x} y={d.y} text={d.text} fontSize={d.size} fill={d.fill} fontFamily={d.font ? `"${d.font}"` : undefined} rotation={d.rot ?? 0} width={d.w} align={d.align as any} />
            : <Ellipse key={i} listening={false} x={d.x} y={d.y} radiusX={d.rx} radiusY={d.ry} stroke={d.stroke} strokeWidth={d.width} rotation={d.rot ?? 0} opacity={.9} />)}

        {built.slots.map((slot, i) => {
          const id = design.slots[i];
          const img = id ? photos[id] : undefined;
          return (
            <Group key={i} x={slot.x} y={slot.y} rotation={slot.rot ?? 0}
              clipFunc={(ctx) => { ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(0, 0, slot.w, slot.h, s.radius) : ctx.rect(0, 0, slot.w, slot.h); ctx.closePath(); }}
              onMouseDown={(ev) => { if (!drawMode) { ev.cancelBubble = true; onSelect('slot:' + i); } }}
              onTouchStart={(ev) => { if (!drawMode) { ev.cancelBubble = true; onSelect('slot:' + i); } }}>
              {img
                ? <KImage image={img} width={slot.w} height={slot.h} crop={cover(img, slot.w, slot.h)} />
                : <>
                    <Rect width={slot.w} height={slot.h} fill="#e5d8c3" />
                    <Text width={slot.w} height={slot.h} align="center" verticalAlign="middle" text={`📷\nframe ${i + 1}`} fontSize={Math.min(slot.w, slot.h) * .1} fill="#7b5644" fontFamily='"DM Sans"' />
                  </>}
            </Group>
          );
        })}

        {s.frameLine > 0 && <Rect listening={false} x={s.frameLine / 2} y={s.frameLine / 2} width={built.W - s.frameLine} height={built.H - s.frameLine} stroke={s.frameColor} strokeWidth={s.frameLine} />}

        {design.elements.map((e) => {
          if (e.type === 'sticker') {
            const im = imgs[e.item.id];
            return im ? <KImage key={e.id} {...common(e)} image={im} width={e.w} height={e.h} offsetX={e.w / 2} offsetY={e.h / 2}
              shadowColor="#2b1a10" shadowBlur={e.w * .04} shadowOpacity={e.item.id.startsWith('tape') ? 0 : .22} shadowOffsetY={e.w * .02} /> : null;
          }
          if (e.type === 'text') {
            const isDate = e.role === 'date';
            return <Text key={e.id} {...common(e)} text={e.text} fontFamily={FONT_MAP[e.font]?.css ?? e.font} fontSize={e.fontSize} fill={e.fill} width={e.width} align={e.align}
              letterSpacing={e.letterSpacing ?? 0} lineHeight={1.15}
              {...(isDate ? { shadowColor: '#ff6a00', shadowBlur: 10, shadowOpacity: .9 } : {})} />;
          }
          return <Line key={e.id} {...common(e)} points={e.points} stroke={e.stroke} strokeWidth={e.strokeWidth} lineCap="round" lineJoin="round" tension={.45} hitStrokeWidth={Math.max(18, e.strokeWidth)} />;
        })}

        {drawing && <Line points={drawing} stroke={brush.color} strokeWidth={brush.size} lineCap="round" lineJoin="round" tension={.45} listening={false} />}

        {sl && <Rect ref={hl} listening={false} x={sl.x} y={sl.y} rotation={sl.rot ?? 0} width={sl.w} height={sl.h} stroke="#b6403a" strokeWidth={4 / scale} dash={[12 / scale, 8 / scale]} cornerRadius={s.radius} />}

        <Transformer ref={tr} rotateEnabled keepRatio enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={12} anchorCornerRadius={6} anchorFill="#fcf8f1" anchorStroke="#4a2f24" borderStroke="#4a2f24" borderDash={[6, 4]}
          rotateAnchorOffset={26} padding={6} ignoreStroke
          boundBoxFunc={(o, n) => (Math.abs(n.width) < 12 || Math.abs(n.height) < 12 ? o : n)} />
      </Layer>
    </Stage>
  );
});
