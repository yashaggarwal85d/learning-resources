import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the structure's own live state; latte = secondary labels;
// taupe = an empty/discarded slot; caramel = the thing to look at (the run being compacted, a
// filter's own saving); cinnamon = the alternative being compared (the other policy, a uniform
// filter); cherry = the bad outcome (unbounded run growth, an obsolete copy wasting space).

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// A run/page: a wide rounded rectangle of `slots` keys, drawn as small ticks in a row.
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

// A level: a labelled, bounded box holding one or more runs stacked inside it.
function levelBox(x: number, y: number, w: number, h: number, colour = C.latte, opacity = 1) {
  return <rect key={`${x}-${y}-lvl`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.1} opacity={opacity} strokeDasharray="3,2" />;
}

// 1 · Opening: a tall stack of sealed runs, the backlog a write path leaves behind
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A tall stack of sealed runs below a memtable, growing with every flush" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a memtable, flushing again and again</T>
      {page(60, 44, 260, 8, C.crema, 1, 6)}
      {[0, 1, 2, 3].map((i) => (
        <g key={`run-${i}`}>{page(60, 80 + i * 26, 260 - i * 14, 6, C.cinnamon, Math.max(0.3, a), 6)}</g>
      ))}
      <T x={30} y={230} s={13} f={C.cherryText} o={a}>every run flushed is one more run every read must check</T>
      <T x={30} y={270} s={13} f={C.crema} o={a}>this topic: what actually happens to the pile, and what it costs</T>
    </Svg>
  );
}

// 2 · Predict: the pile keeps growing
export function CompactionPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A stack of runs, pulsing, with a question over it" h={260}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`run-${i}`}>{page(80, 40 + i * 26, 300 - i * 20, 6, i === 4 ? C.cherry : C.cinnamon, i === 4 ? Math.max(0.5, pulse) : 0.6, 6)}</g>
      ))}
      <T x={30} y={210} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'merge some runs together sometimes, on a schedule' : 'what should happen to this pile?'}
      </T>
    </Svg>
  );
}

// 3 · Leveled reveal: a small, non-overlapping run per level, merging down past its target
export function LeveledReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.6, 1.3));
  return (
    <Svg label="Three levels, each one non-overlapping run, a small level merging down into a bigger one" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>each level: one run, a target size, non-overlapping keys</T>
      {levelBox(60, 40, 120, 30, C.latte, 1)}
      {page(66, 48, 108, 6, C.crema, Math.max(0.3, 1 - a), 6)}
      {levelBox(220, 40, 220, 30, C.latte, 1)}
      {page(226, 48, 208, 8, C.crema, 1, 6)}
      <path d="M 120 55 L 220 55" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      <T x={60} y={100} s={12} f={C.crema} o={a}>a read checks one run per level, at most</T>
      <T x={30} y={160} s={13} f={C.cherryText} o={b}>a key near the top can be rewritten again at every level it crosses</T>
    </Svg>
  );
}

// 4 · Tiered reveal: several similar-sized runs accumulate, then merge together at once
export function TieredReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.6, 1.3));
  return (
    <Svg label="Several same-sized runs sitting side by side, sweeping together into one wider run" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>similar-sized runs sit unmerged, waiting</T>
      {[0, 1, 2].map((i) => (
        <g key={`run-${i}`}>{page(60 + i * 90, 40, 80, 5, C.cinnamon, Math.max(0.3, 1 - a), 5)}</g>
      ))}
      <path d="M 180 55 L 260 100" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(260, 110, 110, 6, C.crema, a, 6)}
      <T x={30} y={160} s={12} f={C.crema} o={a}>merged together only once enough have piled up</T>
      <T x={30} y={220} s={13} f={C.cherryText} o={b}>a read now has to check every run still sitting unmerged</T>
    </Svg>
  );
}

// 5 · Define: three bars, unlabeled, waiting to be filled
export function AmplificationDefine({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.4, 0.9));
  const c = easeOut(seg(t, 0.7, 1.3));
  return (
    <Svg label="Three unlabeled bars for write, read, and space amplification" h={260}>
      <T x={30} y={24} s={13} f={C.crema} o={a}>write: extra bytes written beyond the one logical write</T>
      {fill(30, 36, 160 * a, 16, C.latte, 0.7)}
      <T x={30} y={90} s={13} f={C.crema} o={b}>read: extra runs checked beyond the one that holds the key</T>
      {fill(30, 102, 160 * b, 16, C.latte, 0.7)}
      <T x={30} y={156} s={13} f={C.crema} o={c}>space: extra on-disk bytes beyond the live data itself</T>
      {fill(30, 168, 160 * c, 16, C.latte, 0.7)}
      <T x={30} y={220} s={12} f={C.latte} o={c}>every policy is a choice about which of these to pay down</T>
    </Svg>
  );
}

// 6 · Predict: can one policy win on all three
export function TradeoffPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Three bars from the previous step, with sliders that move together" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>leveled wins on two. tiered wins on the other one.</T>
      {fill(30, 50, 160, 14, C.cinnamon, 0.7)}
      {fill(30, 74, 60, 14, C.crema, 0.7)}
      {fill(30, 98, 60, 14, C.crema, 0.7)}
      <T x={30} y={160} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'no — minimizing any two forces the third up' : 'can a policy win on all three at once?'}
      </T>
    </Svg>
  );
}

// 7 · Reveal: leveled vs. tiered vs. hybrid, three bars each, no winner on all three
export function TradeoffReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.45, 1));
  const c = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="Three policies' bars side by side: leveled, tiered, and a hybrid between them" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>leveled</T>
      {fill(30, 36, 60 * a, 14, C.cinnamon, 0.8)}
      {fill(30, 54, 170 * a, 14, C.crema, 0.8)}
      {fill(30, 72, 40 * a, 14, C.crema, 0.8)}
      <T x={220} y={24} s={12} f={C.latte}>tiered</T>
      {fill(220, 36, 170 * b, 14, C.crema, 0.8)}
      {fill(220, 54, 60 * b, 14, C.cinnamon, 0.8)}
      {fill(220, 72, 160 * b, 14, C.cinnamon, 0.8)}
      <T x={410} y={24} s={12} f={C.latte}>hybrid</T>
      {fill(410, 36, 110 * c, 14, C.latte, 0.8)}
      {fill(410, 54, 110 * c, 14, C.latte, 0.8)}
      {fill(410, 72, 100 * c, 14, C.latte, 0.8)}
      <T x={30} y={140} s={13} f={C.crema} o={c}>a hybrid lands between both, on the axes it mixes — it relocates the trade</T>
    </Svg>
  );
}

// 8 · Monkey: per-level filter sizing beats a flat, uniform rate at the same total memory
export function MonkeyReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.5, 1.2));
  return (
    <Svg label="A flat row of equal filter bars beside a row of filter bars sized by level, same total area" h={280}>
      <T x={30} y={24} s={13} f={C.cinnamon} o={a}>same false-positive rate at every level — the common default</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={`u-${i}`}>{fill(30 + i * 90, 40, 70, 20, C.cinnamon, Math.max(0.3, a))}</g>
      ))}
      <T x={30} y={140} s={13} f={C.crema} o={b}>a tighter filter on a small level, a looser one on a big level — same total memory</T>
      {[18, 30, 55, 90].map((w, i) => (
        <g key={`m-${i}`}>{fill(30 + i * 90, 156, w, 20, C.caramel, Math.max(0.3, b))}</g>
      ))}
      <T x={30} y={220} s={12} f={C.latte} o={b}>lower total false-positive rate, measured with real filters, same budget</T>
    </Svg>
  );
}

// 9 · Dostoevsky: a marker sliding along the leveled-tiered spectrum, per workload
export function DostoevskyReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 1));
  return (
    <Svg label="A spectrum from tiered to leveled, with a marker sliding to the point a workload calls for" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>tiered</T>
      <T x={430} y={24} s={13} f={C.latte}>leveled</T>
      {fill(30, 40, 420, 6, C.taupe, 0.6)}
      <circle cx={30 + 420 * a * 0.3} cy={43} r={7} fill={C.caramel} />
      <T x={30} y={90} s={13} f={C.crema} o={a}>merges only at the largest level by default, more only where a workload needs it</T>
      <T x={30} y={150} s={13} f={C.cherryText} o={a}>still no setting minimizes read, write, and space amplification together</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Measured bars for write, read and space amplification on leveled and tiered, and a filter-memory comparison" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>write / read / space amplification: leveled vs. tiered, identical workload</T>
      {fill(30, 36, 120 * a, 14, C.cinnamon, Math.max(0.3, a))}
      {fill(30, 54, 60 * a, 14, C.caramel, Math.max(0.3, a))}
      {fill(30, 72, 160 * a, 14, C.caramel, Math.max(0.3, a))}
      <T x={30} y={120} s={13} f={C.crema} o={b}>summed false-positive rate: a uniform filter split vs. Monkey's, same memory</T>
      {fill(30, 132, 140 * b, 16, C.cinnamon, Math.max(0.3, b))}
      {fill(30, 154, 80 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={210} s={13} f={C.latte} o={c}>every bar here is a measurement from examples.py, not an assumption</T>
    </Svg>
  );
}
