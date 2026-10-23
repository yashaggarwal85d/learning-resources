import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (a chain, the real result);
// cinnamon = the compared alternative (a real library, the next topic's preview); cherry = the
// one failure/discard frame (the worst case). At most two accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

function node(x: number, y: number, colour = C.caramel, opacity = 1) {
  return <circle key={`${x}-${y}-n`} cx={x} cy={y} r={9} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

// 1 · A hash function says nothing about collisions
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="Two keys, both arrows converging on the same bucket slot, after a hash function that used to look one-to-one" h={300}>
      <T x={30} y={28} s={13} f={C.latte}>h(key) &rarr; slot, as before</T>
      <T x={30} y={60} s={13} f={C.crema}>key A</T>
      <T x={30} y={100} s={13} f={C.crema}>key B</T>
      {cell(140, 70, 28, 28, C.cherry, a)}
      <T x={150} y={89} s={13} f={C.cherry} o={a}>?</T>
      <T x={30} y={200} s={13} f={C.latte}>a hash function says nothing about this</T>
    </Svg>
  );
}

// 2 · Link records in the same slot into a list
export function ChainMechanism({ t }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.2, 1.6) * 4) + 1);
  return (
    <Svg label="One bucket slot growing a linked list downward as each new colliding key arrives" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>bucket i</T>
      {cell(30, 40, 60, 24, C.crema)}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {node(60, 100 + i * 50)}
          {i > 0 && <line x1={60} y1={91 + i * 50} x2={60} y2={100 + i * 50 - 9} stroke={C.caramel} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={90} y={104} s={12} f={C.crema}>entry 1</T>
      {n > 1 && <T x={90} y={154} s={12} f={C.crema}>entry 2</T>}
      {n > 2 && <T x={90} y={204} s={12} f={C.crema}>entry 3</T>}
      {n > 3 && <T x={90} y={254} s={12} f={C.crema}>entry 4</T>}
      <T x={30} y={300} s={13} f={C.caramel}>Chapter 2's own linked list, reused</T>
    </Svg>
  );
}

// 3 · A real standard library already does this
export function RealLibrary({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="Java's HashMap drawn as a bucket array of chains, labelled from its own source comment, with a footnote about overgrown bins becoming trees" h={320}>
      <T x={30} y={26} s={14} f={C.caramel} serif>java.util.HashMap</T>
      <T x={30} y={48} s={13} f={C.crema}>"a binned (bucketed) hash table"</T>
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          {cell(30 + i * 60, 60, 44, 20, C.crema, a)}
          {i % 2 === 0 && node(30 + i * 60 + 22, 100, C.caramel, a)}
        </g>
      ))}
      <T x={30} y={150} s={13} f={C.latte}>default load factor: 0.75</T>
      <T x={30} y={172} s={13} f={C.latte}>rehash past load factor &times; capacity</T>
      <T x={30} y={220} s={13} f={C.cinnamon} o={easeOut(seg(t, 0.8, 1.5))}>footnote: an overgrown bin becomes</T>
      <T x={30} y={242} s={13} f={C.cinnamon} o={easeOut(seg(t, 0.8, 1.5))}>a balanced tree &mdash; not pure chaining</T>
    </Svg>
  );
}

// 4 · Chaining never fails — it just gets slow
export function WorstCase({ t }: StepCtx) {
  const n = Math.min(7, Math.floor(seg(t, 0.2, 1.8) * 7) + 1);
  return (
    <Svg label="Every key routed to the same bucket, one chain growing to hold everything, drawn in cherry" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>every key &rarr; the same bucket</T>
      {cell(30, 38, 60, 22, C.cherry)}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {node(60, 100 + i * 28, C.cherry)}
          {i > 0 && <line x1={60} y1={91 + i * 28} x2={60} y2={100 + i * 28 - 9} stroke={C.cherry} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={30} y={290} s={13} f={C.cherry}>access degrades to Θ(n) &mdash; but never fails</T>
    </Svg>
  );
}

// 5 · Predict: at load factor 1.5, how long is a random key's chain?
export function ChainPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A bucket array at load factor 1.5, one random key's arrow pointing at its bucket, asking how long that chain probably is" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>&alpha; &asymp; 1.5 (more keys than buckets)</T>
      {Array.from({ length: 8 }, (_, i) => cell(30 + i * 34, 50, 26, 22, C.crema, 0.6))}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>how long is a random key's chain?</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>about &alpha; itself &mdash; the load factor</T>
          <T x={30} y={162} s={13} f={C.latte}>n / m, by definition</T>
        </>
      )}
    </Svg>
  );
}

// 6 · The average is always alpha — that's not the real claim
export function ChainLengthReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.1));
  const b = easeOut(seg(t, 0.5, 1.4));
  return (
    <Svg label="The cited Theta(1+alpha) formula beside the real measured longest chain staying close to the average at each load factor, versus the worst case's longest chain holding everything" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>cited: expected search cost = &Theta;(1 + &alpha;)</T>
      <T x={30} y={70} s={13} f={C.crema}>average chain length = &alpha;, always, by counting</T>
      {cell(30, 82, 120, 18, C.crema, a)}
      <T x={30} y={128} s={13} f={C.caramel} o={b}>longest chain stays close to average</T>
      {cell(30, 140, 150, 18, C.caramel, b)}
      <T x={30} y={190} s={13} f={C.cherry} o={easeOut(seg(t, 0.9, 1.6))}>worst case: longest chain = all of n</T>
      {cell(30, 202, 300, 18, C.cherry, easeOut(seg(t, 0.9, 1.6)))}
      <T x={30} y={260} s={13} f={C.latte}>the average alone says nothing about this</T>
    </Svg>
  );
}

// 7 · The one real cost: a pointer per entry
export function PointerCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.1));
  return (
    <Svg label="A chain's node with its next-pointer highlighted, beside a dimmed preview of an entry living directly in the table with no pointer at all" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>chaining: every entry pays for a pointer</T>
      {node(60, 70, C.caramel)}
      <line x1={69} y1={70} x2={120} y2={70} stroke={C.cherry} strokeWidth={1.6} />
      {node(130, 70, C.caramel)}
      <T x={60} y={100} s={12} f={C.cherry}>next</T>
      <T x={30} y={170} s={13} f={C.latte} o={a}>open addressing (next topic): entry lives</T>
      <T x={30} y={192} s={13} f={C.latte} o={a}>in the table itself &mdash; no pointer</T>
      {cell(30, 206, 50, 22, C.cinnamon, a * 0.6)}
    </Svg>
  );
}

// 8 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Three load factors side by side, each with its measured average and longest chain labelled, next to the worst case's single overflowing chain" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>&alpha; = 0.50: avg 0.50, longest 4</T>
      {cell(30, 34, 160 * a, 16, C.caramel, Math.max(0.3, a))}
      <T x={30} y={76} s={13} f={C.crema}>&alpha; = 0.75: avg 0.75, longest 6</T>
      {cell(30, 86, 210 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={128} s={13} f={C.crema}>&alpha; = 1.50: avg 1.50, longest 8</T>
      {cell(30, 138, 280 * c, 16, C.caramel, Math.max(0.3, c))}
      <T x={30} y={190} s={13} f={C.latte}>every longest chain stays a small fraction of n</T>
      <T x={30} y={230} s={13} f={C.cherry} o={easeOut(seg(t, 1.2, 1.8))}>worst case: one chain holds all of n</T>
    </Svg>
  );
}
