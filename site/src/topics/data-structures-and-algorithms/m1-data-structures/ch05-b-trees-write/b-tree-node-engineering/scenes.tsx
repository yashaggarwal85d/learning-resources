import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a page's own stored keys; latte = secondary labels (bytes
// saved, a fill-factor percentage, a posting-list count); taupe = wasted/empty space; caramel =
// the thing to look at (the truncated routing entry, the normalized byte form, the right-most
// page being split); cinnamon = the alternative being compared (the naive/full-key version, the
// one-at-a-time insertion cost); cherry = the bad outcome (a flood of splits from an over-packed
// page).

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

function page(x: number, y: number, w: number, slots: number, colour = C.crema, opacity = 1, filledSlots?: number) {
  const filled = filledSlots ?? slots;
  const slotW = w / slots;
  const items = [] as React.ReactNode[];
  items.push(<rect key={`${x}-${y}-p`} x={x} y={y} width={w} height={16} rx={2} fill="none" stroke={colour} strokeWidth={1.3} opacity={opacity} />);
  for (let i = 0; i < slots; i++) {
    const sx = x + i * slotW + slotW / 2;
    const isFilled = i < filled;
    items.push(<circle key={`${x}-${y}-s${i}`} cx={sx} cy={y + 8} r={2.4} fill={isFilled ? colour : 'none'} stroke={isFilled ? 'none' : C.taupe} strokeWidth={1} opacity={opacity} />);
  }
  return items;
}

// 1 · Opening: topic 26's page, half shaded as wasted space
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A disk page with half its space shaded as wasted, next to the same page with every byte spent" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>spent carelessly</T>
      {page(30, 50, 260, 12, C.crema, 1, 5)}
      {fill(30, 50, 260 * 0.55, 16, C.taupe, 0.4)}
      <T x={320} y={24} s={13} f={C.crema} o={a}>spent well — this topic</T>
      {page(320, 50, 260, 12, C.crema, a, 11)}
      <T x={30} y={270} s={13} f={C.latte} o={a}>the same fanout formula, a very different fanout</T>
    </Svg>
  );
}

// 2 · Slotted layout: header + slot array + growing data area
export function SlottedLayout({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A page's header, a slot array of offsets, and a variable-length data area growing from the other end" h={300}>
      <rect x={30} y={40} width={540} height={16} rx={2} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={300} y={52} s={11} a="middle" f={C.latte}>header: used-slot count, last offset</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={30 + i * 30} y={70} width={24} height={14} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.2} opacity={a} />
      ))}
      <T x={30} y={100} s={11} f={C.caramel} o={a}>slot array: fixed-size offsets</T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={560 - i * 70} y={70} width={60} height={14} rx={2} fill={C.crema} opacity={Math.max(0.3, a)} />
      ))}
      <T x={420} y={100} s={11} f={C.crema} a="end" o={a}>variable-length tuples, growing leftward</T>
      <path d="M 300 120 L 300 150" stroke={C.latte} strokeWidth={1.4} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={260} s={13} f={C.latte} o={a}>nothing shifts — a new tuple just claims the next slot and the next free bytes</T>
    </Svg>
  );
}

// 3 · Predict: what gets copied into the new routing entry
export function PrefixSuffixPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A full key about to be copied up into a new routing entry, pulsing" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>a leaf just split; a routing entry is about to be written</T>
      {page(150, 90, 300, 1, C.caramel, Math.max(0.5, pulse), 1)}
      <T x={150} y={130} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'only the distinguishing bytes, not the whole key' : 'what actually gets copied up?'}
      </T>
    </Svg>
  );
}

// 4 · Suffix truncation reveal: full key vs. truncated routing entry
export function PrefixSuffixReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  const b = easeOut(seg(t, 0.55, 1.3));
  return (
    <Svg label="A full key shrinking down to just the bytes that distinguish the split, copied into the parent" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>the leaf keeps the full key — it must answer "is this exact key here"</T>
      {page(150, 40, 200, 1, C.cinnamon, 1, 1)}
      <T x={30} y={130} s={13} f={C.crema} o={a}>the routing entry above keeps only what distinguishes the split</T>
      <path d="M 250 56 L 250 160" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(210, 160, 80, 1, C.caramel, a, 1)}
      <T x={30} y={280} s={13} f={C.latte} o={b}>shorter, discriminating pivot tuples — never re-scanned, never re-stored</T>
    </Svg>
  );
}

// 5 · Key normalization: a signed integer's bytes flipped to byte-comparable form
export function KeyNormalization({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="A typed key's bytes reordered into a big-endian, sign-adjusted, byte-comparable form" h={300}>
      <T x={30} y={30} s={13} f={C.cinnamon}>typed comparison: parse the type, then compare</T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 34} y={44} width={28} height={16} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
      ))}
      <T x={30} y={110} s={13} f={C.crema} o={a}>normalized: sign bit flipped, bytes reordered</T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 34} y={124} width={28} height={16} rx={2} fill={i === 0 ? C.caramel : C.crema} opacity={Math.max(0.3, a)} />
      ))}
      <T x={30} y={190} s={12} f={C.latte} o={b}>one plain byte comparison, every time, regardless of type</T>
    </Svg>
  );
}

// 6 · Predict: bulk-load a million sorted keys
export function BulkLoadPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A long row of already-sorted keys about to become a tree, pulsing" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>already sorted — nothing left to discover about their order</T>
      {page(90, 90, 420, 16, C.caramel, Math.max(0.5, pulse), 16)}
      <T x={90} y={130} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'sort once, build the leaf level directly' : 'one at a time, or something else?'}
      </T>
    </Svg>
  );
}

// 7 · Bulk-load reveal: right-most page only
export function BulkLoadReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.5, 1.4));
  const pages = [90, 210, 330, 450];
  return (
    <Svg label="A row of leaf pages filled left to right, with only the right-most page ever touched again" h={300}>
      {pages.map((x, i) => (
        <g key={i}>{page(x, 60, 90, 2, i === pages.length - 1 ? C.caramel : C.crema, 1, i === pages.length - 1 ? Math.round(2 * a) : 2)}</g>
      ))}
      <T x={30} y={120} s={13} f={C.crema} o={a}>only this page, furthest right, is still being written</T>
      <path d="M 560 68 L 540 68" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {pages.slice(0, 2).map((x, i) => (
        <circle key={i} cx={x + 45} cy={20} r={4} fill={C.cinnamon} opacity={0.2 + 0.1 * i} />
      ))}
      <T x={30} y={30} s={11} f={C.cinnamon} o={b}>every page behind it is already finished, never revisited</T>
      <T x={30} y={260} s={13} f={C.latte} o={b}>no root-to-leaf descent ever wasted re-finding room</T>
    </Svg>
  );
}

// 8 · Fill factor: packed-full vs. room-left-on-purpose
export function FillFactor({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="A fully packed page risking an imminent split, next to a page with room left on purpose" h={300}>
      <T x={30} y={24} s={13} f={C.cherryText}>packed completely full: static table, or a flood of splits next write</T>
      {page(30, 40, 260, 10, C.cherry, 1, 10)}
      <T x={320} y={24} s={13} f={C.crema} o={a}>room left on purpose: absorbs writes without splitting</T>
      {page(320, 40, 260, 10, C.crema, a, 7)}
      <T x={30} y={250} s={13} f={C.latte} o={b}>one knob, two very different tables to tune it for</T>
    </Svg>
  );
}

// 9 · Deduplication: repeated keys merged into one key plus a posting list
export function Deduplication({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.9));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="Several repeated-key tuples merging into one key with a posting list of pointers" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>without dedup: one tuple per occurrence</T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 70} y={40} width={60} height={16} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
      ))}
      <path d="M 300 60 L 300 110" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={140} s={13} f={C.crema} o={a}>with dedup: one key, one posting list of pointers</T>
      <rect x={200} y={150} width={40} height={16} rx={2} fill={C.caramel} opacity={Math.max(0.3, a)} />
      <rect x={244} y={150} width={140} height={16} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={a} />
      <T x={30} y={220} s={12} f={C.latte} o={b}>merged only at the one moment a split was about to happen</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Three measured bars: truncation/normalization byte savings, bulk-load page writes against one-at-a-time insertion, and a deduplication savings ratio" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>pivot-tuple bytes: full key vs. suffix-truncated</T>
      {fill(30, 36, 220 * a, 16, C.cinnamon, Math.max(0.3, a) * 0.7)}
      {fill(30, 56, 100 * a, 16, C.caramel, Math.max(0.3, a))}
      <T x={30} y={120} s={13} f={C.crema} o={b}>page writes: one-at-a-time vs. a bulk load, same sorted keys</T>
      {fill(30, 132, 240 * b, 16, C.cinnamon, Math.max(0.3, b) * 0.7)}
      {fill(30, 152, 20 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.crema} o={c}>storage: with and without deduplication, same repeated keys</T>
      {fill(30, 232, 200 * c, 16, C.cinnamon, Math.max(0.3, c) * 0.7)}
      {fill(30, 252, 110 * c, 16, C.caramel, Math.max(0.3, c))}
      <T x={30} y={300} s={13} f={C.latte} o={c}>every bar here is a measurement from examples.py, not an assumption</T>
    </Svg>
  );
}
