import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a page's own stored keys; latte = secondary labels (a
// fill level, a run label); taupe = an empty slot; caramel = the thing to look at (a page about
// to split or merge, a sibling-linked scan path); cinnamon = the alternative being compared
// (the pointer-tree baseline, the naive re-descending scan); cherry = the bad outcome (an
// overflowing page, a scan with no sibling link to follow).

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}-e`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function node(cx: number, cy: number, r: number, colour = C.crema, opacity = 1) {
  return <circle key={`${cx}-${cy}-n`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

// A page: a wide rounded rectangle of `slots` keys, drawn as small ticks in a row.
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

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: a pointer-based tree (Ch.4) next to a wide disk page
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A tall pointer-based tree beside a single wide disk page holding many keys at once" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>last chapter's tree: one key per node</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          {i > 0 && edge(110 + (i % 2 === 0 ? -10 : 10), 36 + (i - 1) * 24, 110, 36 + i * 24, C.cinnamon, 0.5)}
          {node(110, 36 + i * 24, 6, C.cinnamon, 0.8)}
        </g>
      ))}
      <T x={260} y={24} s={13} f={C.crema} o={a}>this chapter's page: many keys, one trip</T>
      {page(260, 50, 300, 10, C.crema, a, 9)}
      <T x={30} y={270} s={13} f={C.latte} o={a}>the same comparison-optimal height still costs one I/O per node visited</T>
    </Svg>
  );
}

// 2 · B+Tree shape: root / inner / leaf layers, perfectly balanced
export function BTreeShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Three layers of pages: a root, two inner nodes, and four leaves, every leaf at the same depth" h={300}>
      {page(220, 20, 160, 2, C.crema, 1, 2)}
      <T x={400} y={32} s={12} f={C.latte}>root</T>
      {edge(260, 36, 150, 100, C.latte)}
      {edge(360, 36, 450, 100, C.latte)}
      {page(90, 90, 160, 3, C.crema, 1, 3)}
      {page(380, 90, 160, 3, C.crema, 1, 2)}
      <T x={560} y={100} s={12} f={C.latte} a="end">inner</T>
      {[90, 230, 380, 520].map((x, i) => (
        <g key={i}>{edge(x <= 230 ? 170 : 460, 106, x + 40, 170, C.latte)}</g>
      ))}
      {[90, 230, 380, 520].map((x, i) => (
        <g key={i}>{page(x, 160, 90, 2, C.crema, a, 2)}</g>
      ))}
      <T x={560} y={170} s={12} f={C.latte} a="end" o={a}>leaves — every one at the same depth</T>
      <T x={30} y={260} s={13} f={C.latte} o={a}>every node but the root stays at least half full</T>
    </Svg>
  );
}

// 3 · Predict: a leaf just overflowed
export function SplitPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A leaf page holding one key more than its limit, pulsing" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>this leaf's limit: three keys</T>
      {page(150, 90, 300, 4, C.cherry, Math.max(0.5, pulse), 4)}
      <T x={150} y={130} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'a split, and a key promoted up' : 'one key over the limit — what happens?'}
      </T>
    </Svg>
  );
}

// 4 · Split reveal: leaf copies the middle key up; inner node pushes it up instead
export function SplitReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="An overfull leaf splitting into two leaves, with the middle key copied up to the parent" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>before: one overfull leaf</T>
      {page(150, 40, 300, 4, C.cherry, Math.max(0.3, 1 - a), 4)}
      <T x={30} y={110} s={13} f={C.crema} o={a}>after: two half-full leaves, a key copied up</T>
      {page(90, 230, 10, 2, C.crema, a, 2)}
      <path d="M 110 230 L 160 150" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(150, 130, 130, 2, C.crema, a, 2)}
      {page(320, 130, 130, 2, C.crema, a, 2)}
      <T x={150} y={120} s={12} f={C.caramel} o={a}>leaf split: key copied up</T>
      <T x={320} y={190} s={12} f={C.latte} o={b}>inner split would push the key up instead — kept in neither child</T>
    </Svg>
  );
}

// 5 · Predict: a leaf just underflowed
export function MergePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="An underfull leaf beside a full sibling and a half-full sibling" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>this leaf's minimum: one key</T>
      {page(90, 90, 120, 3, C.cherry, Math.max(0.5, pulse), 0)}
      {page(240, 90, 120, 3, C.crema, 1, 3)}
      {page(390, 90, 120, 3, C.crema, 1, 1)}
      <T x={90} y={130} s={11} f={C.cherryText}>empty</T>
      <T x={240} y={130} s={11} f={C.latte}>full sibling</T>
      <T x={390} y={130} s={11} f={C.latte}>half-full sibling</T>
      <T x={30} y={190} s={13} f={answered ? C.crema : C.latte} o={1}>
        {answered ? 'borrow if a sibling can spare one, else merge' : 'below the minimum — what happens?'}
      </T>
    </Svg>
  );
}

// 6 · Merge reveal: borrow (height unchanged) vs. merge (height can shrink)
export function MergeReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.9));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="Two side-by-side outcomes: borrowing one key from a sibling, and merging with a sibling" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>borrow: one key moves over, height unchanged</T>
      {page(90, 40, 100, 3, C.crema, 1, 1)}
      <path d="M 220 48 L 170 48" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(220, 40, 100, 3, C.crema, 1, 2)}
      <T x={320} y={120} s={13} f={C.crema} o={b}>merge: two leaves combine, the parent's key is deleted</T>
      {page(90, 230, 90, 3, C.cherry, Math.max(0.3, 1 - b), 1)}
      {page(230, 230, 90, 3, C.crema, Math.max(0.3, 1 - b), 2)}
      <path d="M 180 238 L 230 238" stroke={C.caramel} strokeWidth={1.6} opacity={b} />
      {page(140, 230, 180, 3, C.crema, b, 3)}
      <T x={30} y={290} s={13} f={C.latte} o={b}>this is the only move that can shorten the tree</T>
    </Svg>
  );
}

// 7 · Sibling-linked range scan: one descent, then streaming across leaves
export function SiblingScan({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.5, 1.6));
  const leaves = [90, 210, 330, 450];
  return (
    <Svg label="A path descending once to the first leaf, then streaming across sibling-linked leaves" h={300}>
      <path d="M 300 20 L 90 100" stroke={C.caramel} strokeWidth={1.8} opacity={a} markerEnd="url(#arrow)" />
      <T x={300} y={14} s={12} f={C.latte} o={a}>one descent</T>
      {leaves.map((x, i) => (
        <g key={i}>
          {page(x, 100, 90, 2, C.crema, 1, 2)}
          {i < leaves.length - 1 && (
            <line x1={x + 90} y1={108} x2={leaves[i + 1]} y2={108} stroke={C.caramel} strokeWidth={1.6} opacity={Math.max(0, Math.min(1, b * (leaves.length - 1) - i))} markerEnd="url(#arrow)" />
          )}
        </g>
      ))}
      <T x={30} y={250} s={13} f={C.crema} o={b}>sibling links, not the root, carry the scan forward</T>
      <T x={30} y={275} s={13} f={C.cinnamon} o={b}>a re-descending scan would pay for the whole climb again, every leaf</T>
    </Svg>
  );
}

// 8 · Fanout / height formula
export function FanoutHeight({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="The fanout formula next to two trees: a low-fanout tree drawn tall, a high-fanout tree drawn short" h={320}>
      <T x={30} y={30} s={14} f={C.crema} serif>fanout ≈ page size ÷ (key size + pointer size)</T>
      <T x={30} y={54} s={14} f={C.crema} serif o={a}>height ≈ log, base fanout, of the key count</T>
      <T x={30} y={100} s={12} f={C.cinnamon}>small page, big keys: low fanout</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={120} cy={120 + i * 24} r={5} fill={C.cinnamon} opacity={0.8} />
      ))}
      <T x={320} y={100} s={12} f={C.crema} o={b}>big page, small keys: high fanout</T>
      {page(300, 115, 260, 12, C.crema, b, 11)}
      <T x={30} y={280} s={13} f={C.latte} o={b}>the bigger the fanout, the shorter the tree — for the identical key count</T>
    </Svg>
  );
}

// 9 · I/O comparison: Chapter 4's comparisons vs. this topic's I/Os, same keys
export function IOComparison({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.3));
  const c = easeOut(seg(t, 0.7, 1.6));
  return (
    <Svg label="Three bars for the identical key count: a pointer tree's comparisons, this topic's illustrative B+Tree I/Os, and a realistic-page B+Tree's I/Os" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>pointer tree (Ch.4): one comparison per node, same keys</T>
      {fill(30, 36, 260 * a, 18, C.cinnamon, 0.8)}
      <T x={30} y={90} s={13} f={C.crema} o={b}>this topic's small-page B+Tree: far fewer nodes to visit</T>
      {fill(30, 102, 100 * b, 18, C.caramel, Math.max(0.3, b))}
      <T x={30} y={156} s={13} f={C.crema} o={c}>a realistic disk page: fewer still</T>
      {fill(30, 168, 40 * c, 18, C.caramel, Math.max(0.3, c))}
      <T x={30} y={230} s={13} f={C.latte} o={c}>same keys, same ordering guarantee, a fraction of the cost</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Three measured bars: split/borrow/merge counts while building and modifying the tree, a range scan's real I/O count against re-descending, and the fanout-height formula checked against a billion keys" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>splits while building, borrows and merges while deleting</T>
      {fill(30, 36, 60 * a, 14, C.caramel, Math.max(0.3, a))}
      {fill(30, 54, 30 * a, 14, C.caramel, Math.max(0.3, a))}
      {fill(30, 72, 20 * a, 14, C.caramel, Math.max(0.3, a))}
      <T x={30} y={130} s={13} f={C.crema} o={b}>range scan: sibling links vs. re-descending for every key</T>
      {fill(30, 142, 30 * b, 16, C.caramel, Math.max(0.3, b))}
      {fill(30, 164, 220 * b, 16, C.cinnamon, Math.max(0.3, b) * 0.7)}
      <T x={30} y={230} s={13} f={C.crema} o={c}>fanout/height formula, checked against a billion keys on a realistic page</T>
      {fill(30, 242, 60 * c, 16, C.caramel, Math.max(0.3, c))}
      <T x={30} y={300} s={13} f={C.latte} o={c}>every bar here is a measurement from examples.py, not an assumption</T>
    </Svg>
  );
}
