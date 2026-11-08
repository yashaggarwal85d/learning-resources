import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the textbook structure, and exact data in memory; latte =
// secondary labels (a count, a weight, a bound); taupe = data on disk or not yet merged; caramel
// = the thing to look at (the merged sketch, the correct answer); cinnamon (rare) = the system's
// modification set against the textbook; cherry/cherryText = the bad outcome (an over-count, a
// wrong average).
//
// Every printed number is examples.py's fixed setup: eight partitions, seven of 6,000 rows and
// one of 60 (42,060 in all), amounts drawn between 8 and 40 or between 300 and 520, 64
// registers, 30 sampled values per partition and so weights of 200 and 2, filters of 2,048 bits
// and 4 hashes, 4 output ranges. Everything measured on the rows (the medians, the averages,
// the registers, the estimates, the sampled and true boundaries) comes from a seeded draw, so
// it is drawn to scale as shape only, never printed. The two filters' bit patterns are drawn
// schematically: examples.py's real filters are nearly saturated.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

/** Seeded measurements, drawn to scale only: each partition's median, the true median, the naive average, the merged sample's median. */
const MEDIANS = [24.0, 24.2, 23.6, 23.6, 24.2, 24.1, 24.2, 447.0];
const TRUE_MEDIAN = 24.0;
const NAIVE_AVG = 76.9;
const SKETCH_MEDIAN = 24.0;
/** Registers of partitions 1 and 2, and of all eight merged (identical to one pass over the whole stream). */
const REGS_A = [7, 5, 6, 7, 7, 8, 6, 8, 6, 7, 9, 5, 7, 6, 6, 6, 8, 8, 5, 9, 7, 6, 4, 8, 10, 7, 6, 9, 7, 6, 6, 6, 8, 7, 7, 7, 11, 7, 6, 5, 7, 6, 5, 6, 5, 7, 5, 8, 4, 8, 8, 5, 8, 7, 8, 7, 7, 8, 6, 6, 5, 7, 9, 7];
const REGS_B = [7, 6, 6, 7, 7, 8, 6, 8, 6, 7, 6, 5, 7, 6, 6, 6, 8, 8, 5, 9, 5, 8, 4, 8, 10, 7, 15, 4, 7, 6, 6, 6, 6, 7, 6, 7, 11, 6, 6, 5, 7, 6, 12, 6, 5, 7, 5, 6, 4, 8, 8, 5, 8, 7, 8, 7, 7, 8, 6, 6, 5, 7, 7, 7];
const REGS_ALL = [7, 6, 6, 7, 7, 8, 6, 8, 6, 7, 9, 5, 7, 6, 6, 6, 8, 8, 5, 9, 7, 8, 4, 8, 10, 7, 15, 9, 7, 6, 6, 6, 8, 7, 7, 7, 11, 7, 6, 5, 7, 6, 12, 6, 8, 7, 5, 8, 4, 8, 8, 5, 8, 7, 8, 7, 7, 8, 6, 6, 5, 7, 9, 7];
/** Summed per-partition estimates against the exact distinct count, as a ratio (seeded, drawn as length only). */
const SUM_RATIO = 22493 / 4052;
const MERGED_RATIO = 3823 / 4052;
/** Sampled range boundaries against the true quartiles (seeded, drawn as positions only). */
const SAMPLED_BOUNDS = [14.9, 23.1, 31.2];
const TRUE_BOUNDS = [16.0, 24.0, 32.1];

/** Amount axis for the median plots: 0 to 460, drawn left to right. */
const ax = (v: number) => 90 + v * 1.0;

function Registers({ x0, y0, regs, o = 1, grow = 1, col = C.crema, w = 7, hl }: { x0: number; y0: number; regs: number[]; o?: number; grow?: number; col?: string; w?: number; hl?: (i: number) => boolean }) {
  return (
    <g opacity={o}>
      {regs.map((r, i) => (
        <rect key={i} x={x0 + i * (w + 1)} y={y0 - r * 4 * grow} width={w} height={r * 4 * grow} fill={hl && hl(i) ? C.caramel : col} />
      ))}
      <line x1={x0} y1={y0} x2={x0 + regs.length * (w + 1)} y2={y0} stroke={C.mocha} />
    </g>
  );
}

function MedianPlot({ o = 1, dots = 8, y0 = 46 }: { o?: number; dots?: number; y0?: number }) {
  return (
    <g opacity={o}>
      {MEDIANS.map((m, i) => (
        <g key={i} opacity={i < dots ? 1 : 0}>
          <T x={20} y={y0 + i * 20 + 4} s={12} f={C.taupe}>{`p${i + 1}`}</T>
          <rect x={50} y={y0 + i * 20 - 5} width={i === 7 ? 0.4 : 36} height={10} fill={C.taupe} />
          <circle cx={ax(m)} cy={y0 + i * 20} r={5} fill={i === 7 ? C.cherryText : C.crema} />
        </g>
      ))}
      <line x1={ax(0)} y1={y0 + 170} x2={ax(460)} y2={y0 + 170} stroke={C.mocha} />
      <T x={ax(0)} y={y0 + 188} s={12} a="middle" f={C.taupe}>0</T>
      <T x={ax(460)} y={y0 + 188} s={12} a="end" f={C.taupe}>amount →</T>
    </g>
  );
}

// 1 · Hook: eight partition medians, one average, one true value
export function Hook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 0.4, 1.8, 8);
  const avg = easeOut(seg(t, 2.0, 2.7));
  const ask = easeOut(seg(t, 3.0, 3.7));
  const tru = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const lab = answered ? easeOut(seg(s, 1.0, 1.6)) : 0;
  return (
    <Svg label="Eight partitions: seven of 6,000 rows with medians clustered low, one of 60 rows holding only large orders, its median far to the right. The plain average of the eight medians sits between them. After answering: the true median lands inside the seven ordinary partitions' cluster" h={300}>
      <MedianPlot o={a} dots={k + 1} />
      <T x={ax(447)} y={40} s={12} a="end" f={C.cherryText} o={k >= 7 ? 1 : 0}>60 rows, large orders</T>
      <T x={50} y={34} s={12} f={C.taupe} o={a}>6,000 rows each</T>
      <g opacity={avg}>
        <line x1={ax(NAIVE_AVG)} y1={36} x2={ax(NAIVE_AVG)} y2={216} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 3" />
        <T x={ax(NAIVE_AVG) + 8} y={230} s={12} f={C.cherryText}>average of the medians</T>
      </g>
      <g opacity={tru}>
        <line x1={ax(TRUE_MEDIAN)} y1={36} x2={ax(TRUE_MEDIAN)} y2={216} stroke={C.caramel} strokeWidth={2.5} />
      </g>
      <T x={300} y={284} s={13} a="middle" f={C.caramel} o={rev(ask, tru)}>where is the true median?</T>
      <T x={300} y={284} s={13} a="middle" f={C.caramel} o={lab}>true median: inside the seven</T>
    </Svg>
  );
}

// 2 · What a mergeable aggregate already is
export function PartialAggregation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const scan = easeInOut(seg(t, 0.6, 1.8));
  const comb = easeOut(seg(t, 2.0, 2.9));
  const ord = easeOut(seg(t, 3.4, 4.2));
  return (
    <Svg label="Two subsets are scanned separately into small partial states, a maximum and a total, which combine by comparison and by addition into the single-pass answer. An order-sensitive aggregate has no combine step" h={280}>
      {[0, 1].map((p) => (
        <g key={p} opacity={a}>
          <T x={40} y={56 + p * 70} s={12} f={C.latte}>{`subset ${p === 0 ? 'A' : 'B'}`}</T>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={120 + i * 18} y={44 + p * 70} width={14} height={16} fill={i / 8 < scan ? C.taupe : C.crema} />
          ))}
          <rect x={290} y={40 + p * 70} width={100} height={24} fill={C.roast} stroke={C.crema} opacity={scan} />
          <T x={340} y={57 + p * 70} s={12} a="middle" f={C.crema} o={scan}>{p === 0 ? 'max A, sum A' : 'max B, sum B'}</T>
        </g>
      ))}
      <g opacity={comb}>
        <line x1={390} y1={52} x2={440} y2={86} stroke={C.latte} />
        <line x1={390} y1={122} x2={440} y2={96} stroke={C.latte} />
        <rect x={440} y={66} width={140} height={52} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
        <T x={510} y={86} s={12} a="middle" f={C.caramel}>max(A, B)</T>
        <T x={510} y={110} s={12} a="middle" f={C.caramel}>A + B</T>
      </g>
      <T x={300} y={176} s={12} a="middle" f={C.crema} o={comb}>the same answer as one pass over both</T>
      <g opacity={ord}>
        <T x={300} y={222} s={13} a="middle" f={C.cherryText}>order-sensitive aggregate: no combine ✕</T>
        <T x={300} y={248} s={12} a="middle" f={C.latte}>two scans forget how rows interleaved</T>
      </g>
    </Svg>
  );
}

// 3 · The merge law for a sketch
export function MergeLaw({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const m = easeInOut(seg(t, 1.0, 2.2));
  const eq = easeOut(seg(t, 2.4, 3.1));
  const note = easeOut(seg(t, 3.4, 4.1));
  return (
    <Svg label="sketch of A merged with sketch of B equals the sketch of A and B together, exactly or within a stated error" h={260}>
      <g opacity={a}>
        <rect x={lerp(60, 196, m)} y={50} width={90} height={36} fill={C.roast} stroke={C.crema} />
        <T x={lerp(105, 241, m)} y={73} s={12} a="middle" f={C.crema}>sketch(A)</T>
        <rect x={lerp(450, 314, m)} y={50} width={90} height={36} fill={C.roast} stroke={C.crema} />
        <T x={lerp(495, 359, m)} y={73} s={12} a="middle" f={C.crema}>sketch(B)</T>
      </g>
      <T x={300} y={110} s={14} a="middle" f={C.caramel} o={m >= 1 ? 1 : 0}>merge</T>
      <g opacity={eq}>
        <T x={300} y={140} s={14} a="middle" f={C.crema}>=</T>
        <rect x={230} y={152} width={140} height={36} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
        <T x={300} y={175} s={12} a="middle" f={C.caramel}>sketch(A ∪ B)</T>
      </g>
      <T x={300} y={226} s={12} a="middle" f={C.latte} o={note}>exactly, or within a stated error</T>
    </Svg>
  );
}

// 4 · HyperLogLog's registers: each keeps the longest run seen at its index
export function HllRegisters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const hash = easeOut(seg(t, 0.8, 1.6));
  const grow = easeOut(seg(t, 1.6, 3.4));
  const ship = easeOut(seg(t, 3.8, 4.6));
  return (
    <Svg label="A value is hashed; six bits pick one of 64 registers, and the register keeps the longest run of leading zeros any hash landing there produced. The 64 registers fill in as the stream passes; the small array itself is what gets stored and merged" h={280}>
      <g opacity={a}>
        <T x={40} y={34} s={12} f={C.crema}>customer id</T>
        <T x={170} y={34} s={12} f={C.latte}>→ hash →</T>
        <g opacity={hash}>
          <rect x={270} y={20} width={60} height={20} fill={C.cinnamon} />
          <T x={300} y={35} s={12} a="middle" f={C.ink}>6 bits</T>
          <rect x={332} y={20} width={210} height={20} fill={C.roast} stroke={C.crema} />
          <T x={437} y={35} s={12} a="middle" f={C.crema}>0001…: zero run</T>
          <T x={300} y={60} s={12} a="middle" f={C.cinnamon}>which register</T>
          <T x={437} y={60} s={12} a="middle" f={C.latte}>how long a run</T>
        </g>
      </g>
      <Registers x0={44} y0={180} regs={REGS_A} o={grow > 0 ? 1 : 0} grow={grow} />
      <T x={300} y={202} s={12} a="middle" f={C.latte} o={grow > 0 ? 1 : 0}>64 registers, each the longest run seen</T>
      <g opacity={ship}>
        <T x={300} y={236} s={13} a="middle" f={C.caramel}>stored, carried, merged as is</T>
        <T x={300} y={262} s={12} a="middle" f={C.latte}>estimated only once, at the end</T>
      </g>
    </Svg>
  );
}

// 5 · Predict: sum the two estimates, or merge the registers first?
export function SumVsMerge({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.05, 0.6));
  const ask = easeOut(seg(t, 0.6, 1.2));
  const sum = answered ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const merge = answered ? easeInOut(seg(s, 1.0, 2.2)) : 0;
  const lab = answered ? easeOut(seg(s, 2.3, 2.9)) : 0;
  const M = REGS_A.map((r, i) => Math.max(r, REGS_B[i]));
  return (
    <Svg label="Partition 1's registers and partition 2's registers, one shared customer in both. After answering: adding the two estimates counts that customer twice; merging takes the larger register at every index, and estimates once" h={290}>
      <T x={20} y={40} s={12} f={C.latte} o={a}>partition 1</T>
      <Registers x0={150} y0={70} regs={REGS_A} o={a} w={5} />
      <T x={20} y={110} s={12} f={C.latte} o={a}>partition 2</T>
      <Registers x0={150} y0={140} regs={REGS_B} o={a} w={5} />
      <T x={300} y={180} s={13} a="middle" f={C.caramel} o={rev(ask, sum)}>add the estimates, or merge the arrays?</T>
      <g opacity={sum * (1 - merge)}>
        <T x={300} y={180} s={13} a="middle" f={C.cherryText}>adding: a shared customer counts twice</T>
      </g>
      <T x={20} y={214} s={12} f={C.caramel} o={merge}>max per index</T>
      <Registers x0={150} y0={250} regs={M} o={merge} w={5} grow={merge} col={C.caramel} />
      <T x={300} y={280} s={12} a="middle" f={C.caramel} o={lab}>merge the arrays, estimate once</T>
    </Svg>
  );
}

// 6 · Measured: merged registers equal one pass; summed estimates over-count
export function RegisterMergeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const one = easeOut(seg(t, 0.8, 1.6));
  const same = easeOut(seg(t, 1.8, 2.4));
  const bars = easeOut(seg(t, 2.8, 4.0));
  const W = 70;
  return (
    <Svg label="All eight partitions' registers merged by maximum match, index for index, the registers a single pass builds. Summing the eight estimates instead runs several times past the true distinct count, while the merged estimate sits close to it" h={290}>
      <T x={20} y={36} s={12} f={C.caramel} o={a}>merged, 8 partitions</T>
      <Registers x0={200} y0={70} regs={REGS_ALL} o={a} w={5} col={C.caramel} />
      <T x={20} y={106} s={12} f={C.crema} o={one}>one single pass</T>
      <Registers x0={200} y0={140} regs={REGS_ALL} o={one} w={5} />
      <T x={300} y={166} s={13} a="middle" f={C.caramel} o={same}>identical, register for register</T>
      <g opacity={bars}>
        <T x={140} y={204} s={12} a="end" f={C.crema}>true count</T>
        <rect x={150} y={192} width={W * bars} height={14} fill={C.crema} />
        <T x={140} y={228} s={12} a="end" f={C.caramel}>merged</T>
        <rect x={150} y={216} width={W * MERGED_RATIO * bars} height={14} fill={C.caramel} />
        <T x={140} y={252} s={12} a="end" f={C.cherryText}>summed</T>
        <rect x={150} y={240} width={W * SUM_RATIO * bars} height={14} fill={C.cherry} />
        <T x={300} y={280} s={12} a="middle" f={C.cherryText} o={bars >= 1 ? 1 : 0}>summed: several times over the truth</T>
      </g>
    </Svg>
  );
}

// 7 · A quantile sketch: a bounded sample, an approximate answer, a stated error
export function QuantileSketch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const keep = easeOut(seg(t, 1.0, 2.0));
  const band = easeOut(seg(t, 2.2, 2.9));
  const two = easeOut(seg(t, 3.4, 4.4));
  const xs = Array.from({ length: 48 }, (_, i) => 60 + ((i * 37) % 48) * 10);
  return (
    <Svg label="A stream of values; the sketch keeps a small, chosen subset of them and answers the median within an error band. One system spends more memory for a narrow band, another keeps a smaller summary and accepts a wider one" h={290}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>every value in the stream</T>
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={lerp(52, i % 6 === 0 ? 100 : 52, keep)} r={4} fill={i % 6 === 0 ? C.crema : C.taupe} opacity={a * (i % 6 === 0 ? 1 : 1 - 0.7 * keep)} />
      ))}
      <T x={300} y={128} s={12} a="middle" f={C.crema} o={keep}>a bounded sample kept</T>
      <g opacity={band}>
        <rect x={270} y={88} width={60} height={24} fill={C.caramel} opacity={0.2} />
        <line x1={300} y1={84} x2={300} y2={116} stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={150} s={12} a="middle" f={C.caramel}>median, within a stated error</T>
      </g>
      <g opacity={two}>
        <T x={150} y={190} s={12} a="middle" f={C.crema}>more memory</T>
        <rect x={130} y={200} width={40} height={14} fill={C.caramel} opacity={0.4} />
        <T x={150} y={234} s={12} a="middle" f={C.latte}>tighter band</T>
        <T x={450} y={190} s={12} a="middle" f={C.crema}>smaller summary</T>
        <rect x={400} y={200} width={100} height={14} fill={C.caramel} opacity={0.4} />
        <T x={450} y={234} s={12} a="middle" f={C.latte}>looser band</T>
        <T x={300} y={270} s={12} a="middle" f={C.caramel}>same promise: merges close to the truth</T>
      </g>
    </Svg>
  );
}

// 8 · Measured: the naive average misses; the merged weighted sample lands on the true median
export function AveragingWrong({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const avg = easeOut(seg(t, 0.9, 1.6));
  const tru = easeOut(seg(t, 1.8, 2.5));
  const gap = easeOut(seg(t, 2.6, 3.2));
  const sk = easeInOut(seg(t, 3.4, 4.4));
  return (
    <Svg label="The average of the eight medians lands far to the right of the true median, a wide gap. The median of the merged, weighted sample slides in and lands on the true median" h={300}>
      <MedianPlot o={a} />
      <g opacity={avg}>
        <line x1={ax(NAIVE_AVG)} y1={36} x2={ax(NAIVE_AVG)} y2={216} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 3" />
        <T x={ax(NAIVE_AVG) + 8} y={36} s={12} f={C.cherryText}>naive average</T>
      </g>
      <line x1={ax(TRUE_MEDIAN)} y1={36} x2={ax(TRUE_MEDIAN)} y2={216} stroke={C.crema} strokeWidth={2} opacity={tru} />
      <g opacity={gap * (1 - sk)}>
        <line x1={ax(TRUE_MEDIAN)} y1={226} x2={ax(NAIVE_AVG)} y2={226} stroke={C.cherryText} strokeWidth={2} />
        <T x={ax(NAIVE_AVG) + 8} y={232} s={12} f={C.cherryText}>a wide gap</T>
      </g>
      <circle cx={lerp(ax(460), ax(SKETCH_MEDIAN), sk)} cy={226} r={7} fill={C.caramel} opacity={sk > 0 ? 1 : 0} />
      <T x={300} y={284} s={13} a="middle" f={C.caramel} o={sk >= 1 ? 1 : 0}>merged weighted sample: on the truth</T>
    </Svg>
  );
}

// 9 · The weighting: a reservoir sample weighted by its own partition's size
export function WeightedSampling({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const wt = easeOut(seg(t, 2.0, 2.8));
  const note = easeOut(seg(t, 3.2, 3.9));
  // Thirty values are drawn out of each partition and fall into its sample row: the big partition's from all along its
  // 6,000 rows, the small one's all from its thin sliver of 60. Then the weights attach: each big-partition value
  // swells (it speaks for 200 rows), each small-partition value shrinks (it speaks for 2).
  const R = rng(9);
  const fromBig = Array.from({ length: 30 }, () => 160 + R() * 400);
  const fromSmall = Array.from({ length: 30 }, () => 160 + R() * 4);
  const fall = (i: number) => easeInOut(seg(t, 0.8 + i * 0.022, 1.3 + i * 0.022));
  return (
    <Svg label="A partition of 6,000 rows and one of 60 each give a sample of 30 values. Each sampled value carries a weight of its partition's rows over its sample size: 200 for the large partition, 2 for the small one" h={270}>
      <g opacity={a}>
        <T x={40} y={40} s={12} f={C.crema}>6,000 rows</T>
        <rect x={160} y={28} width={400} height={18} fill={C.taupe} />
        <T x={40} y={130} s={12} f={C.crema}>60 rows</T>
        <rect x={160} y={118} width={4} height={18} fill={C.taupe} />
      </g>
      {Array.from({ length: 30 }, (_, i) => {
        const k = fall(i);
        return k > 0 ? <circle key={`b${i}`} cx={lerp(fromBig[i], 166 + i * 13, k)} cy={lerp(37, 66, k)} r={lerp(4, 5.5, wt)} fill={C.crema} /> : null;
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const k = fall(i);
        return k > 0 ? <circle key={`s${i}`} cx={lerp(fromSmall[i], 166 + i * 13, k)} cy={lerp(127, 156, k)} r={lerp(4, 2.5, wt)} fill={C.crema} /> : null;
      })}
      <g opacity={easeOut(seg(t, 1.2, 1.8))}>
        <T x={40} y={70} s={12} f={C.latte}>sample 30</T>
        <T x={40} y={160} s={12} f={C.latte}>sample 30</T>
      </g>
      <Decode text="each × 200" t={t} at={2.0} x={560} y={92} s={14} a="end" f={C.caramel} />
      <Decode text="each × 2" t={t} at={2.2} x={560} y={182} s={14} a="end" f={C.cinnamon} />
      <T x={300} y={lerp(244, 236, note)} s={13} a="middle" f={C.caramel} o={note}>the weight travels with the sample</T>
    </Svg>
  );
}

// 10 · Measured: range boundaries from samples alone, close to a full sort's
export function RangeBoundaries({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const tr = easeOut(seg(t, 0.9, 1.7));
  const sp = easeOut(seg(t, 2.0, 2.8));
  const note = easeOut(seg(t, 3.2, 3.9));
  const bx = (v: number) => 60 + (v - 8) * 15;
  // The full sort's quartiles drop in from above; then the cuts chosen from the samples slide in from the left end of
  // the axis and come to rest just beside them, close but not identical, and the lock-on frames one such pair.
  return (
    <Svg label="The amount axis from 8 to 40, cut into 4 output ranges. The true quartiles a full sort finds, and the boundaries chosen from the weighted samples alone, land close together" h={270}>
      <g opacity={a}>
        <T x={300} y={24} s={12} a="middle" f={C.latte}>cut the stream into 4 equal ranges</T>
        <rect x={bx(8)} y={110} width={Math.max(2, (bx(40) - bx(8)) * a)} height={20} fill={C.cocoa} />
        <T x={bx(8)} y={152} s={12} a="middle" f={C.taupe}>8</T>
        <T x={bx(40)} y={152} s={12} a="middle" f={C.taupe}>40</T>
      </g>
      {TRUE_BOUNDS.map((v, i) => (
        <Draw key={i} pts={[[bx(v), 70], [bx(v), 130]]} t={t} from={0.9 + i * 0.15} to={1.4 + i * 0.15} stroke={C.crema} w={2.5} pen={false} />
      ))}
      <T x={bx(TRUE_BOUNDS[2]) + 8} y={78} s={12} f={C.crema} o={tr}>full sort</T>
      {SAMPLED_BOUNDS.map((v, i) => {
        const k = easeInOut(seg(t, 2.0 + i * 0.15, 2.8 + i * 0.15));
        return k > 0 ? <line key={i} x1={lerp(bx(8), bx(v), k)} y1={110} x2={lerp(bx(8), bx(v), k)} y2={176} stroke={C.caramel} strokeWidth={2.5} /> : null;
      })}
      <T x={bx(SAMPLED_BOUNDS[2]) + 8} y={176} s={12} f={C.caramel} o={sp}>from samples</T>
      <Reticle x={(bx(TRUE_BOUNDS[1]) + bx(SAMPLED_BOUNDS[1])) / 2} y={123} w={40} h={116} t={t} at={3.2} />
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={note}>close, and no row fully sorted</T>
    </Svg>
  );
}

/** A schematic pair of filters (examples.py's real ones are nearly full): bits set in A, bits set in B. */
const BITS_A = [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1];
const BITS_B = [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0];

// 11 · A filter merges too: a bitwise union
export function BloomMerge({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const orF = seg(t, 1.0, 2.8) * 24;
  const note = easeOut(seg(t, 3.1, 3.8));
  const cell = (x: number, y: number, on: boolean, col: string, key: number) => <rect key={key} x={x} y={y} width={18} height={18} fill={on ? col : C.roast} stroke={C.mocha} />;
  // A column cursor sweeps left to right. At each position, every lit bit of A and of B drops straight down into the
  // merged row; the merged bit lights the moment either one lands, so the union is built visibly, position by position.
  const fall = (i: number) => easeIn2(clamp((orF - i) / 1.5));
  return (
    <Svg label="Two filters of the same size and hash count. The merged filter turns on, position by position, every bit either one had on, so anything either called present still tests present" h={260}>
      <T x={300} y={22} s={12} a="middle" f={C.latte} o={a}>same size (2,048 bits), same 4 hashes</T>
      <T x={20} y={52} s={12} f={C.crema} o={a}>A</T>
      <T x={20} y={84} s={12} f={C.crema} o={a}>B</T>
      <g opacity={a}>
        {BITS_A.map((b, i) => cell(60 + i * 21, 38, b === 1, C.crema, i))}
        {BITS_B.map((b, i) => cell(60 + i * 21, 70, b === 1, C.cinnamon, 100 + i))}
      </g>
      <T x={20} y={140} s={12} f={C.caramel} o={t >= 1.0 ? 1 : 0}>A OR B</T>
      {BITS_A.map((b, i) => (orF > i ? cell(60 + i * 21, 126, (b === 1 || BITS_B[i] === 1) && fall(i) >= 1, C.caramel, 200 + i) : null))}
      {BITS_A.map((b, i) => {
        const k = fall(i);
        if (k <= 0 || k >= 1) return null;
        return (
          <g key={`f${i}`}>
            {b === 1 && <rect x={63 + i * 21} y={lerp(41, 129, k)} width={12} height={12} fill={C.crema} />}
            {BITS_B[i] === 1 && <rect x={63 + i * 21} y={lerp(73, 129, k)} width={12} height={12} fill={C.cinnamon} />}
          </g>
        );
      })}
      {t >= 1.0 && orF < 24 && <rect x={58 + Math.min(23, Math.floor(orF)) * 21} y={34} width={22} height={114} fill="none" stroke={C.focus} strokeWidth={1} opacity={0.6} />}
      <T x={300} y={196} s={13} a="middle" f={C.caramel} o={note}>present in either: still present</T>
    </Svg>
  );
}

/** Accelerating fall, for bits dropping into the merged row. */
const easeIn2 = (x: number) => x * x;

// 12 · Where a sketch travels: built per machine, shuffled as bytes, merged once
export function WhereItTravels({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const build = easeOut(seg(t, 0.8, 1.8));
  const fly = easeInOut(seg(t, 2.0, 3.2));
  const merge = easeOut(seg(t, 3.4, 4.1));
  return (
    <Svg label="Three machines read their rows and each build a small sketch. The sketches cross the network as strings of bytes and merge once at the end into the answer, the same shape as the distributed top-N merge" h={270}>
      {[0, 1, 2].map((m) => (
        <g key={m} opacity={a}>
          <rect x={40 + m * 190} y={30} width={140} height={60} fill="none" stroke={C.mocha} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={50 + m * 190 + (i % 5) * 26} y={40 + Math.floor(i / 5) * 22} width={20} height={14} fill={C.taupe} />
          ))}
          <g opacity={build}>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={lerp(80 + m * 190, 255, fly) + i * 8} y={lerp(104, 196, fly)} width={6} height={10} fill={C.caramel} />
            ))}
          </g>
        </g>
      ))}
      <T x={300} y={150} s={12} a="middle" f={C.latte} o={fly > 0 && fly < 1 ? 1 : 0}>shuffled as bytes</T>
      <rect x={244} y={188} width={70} height={26} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={merge} />
      <T x={300} y={244} s={13} a="middle" f={C.caramel} o={merge}>merged once, at the end</T>
    </Svg>
  );
}

const EIGHT: [string, string][] = [
  ['hash table', 'spills'],
  ['sort', 'spills'],
  ['heap', 'merges streams'],
  ['queue', 'schedules'],
  ['union-find', 'clusters'],
  ['tree', 'indexes'],
  ['ring', 'places'],
  ['sketch', 'merges'],
];

// 13 · Recap: eight structures, one constraint each
export function Recap({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 3.0, 8);
  const end = easeOut(seg(t, 3.3, 4.0));
  return (
    <Svg label="Hash table that spills, sort that spills, heap that merges streams, queue that schedules, union-find that clusters, tree that indexes, ring that places, sketch that merges" h={260}>
      {EIGHT.map(([s, c], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <g key={s} opacity={i <= k ? 1 : 0}>
            <T x={150 + col * 280} y={40 + row * 40} s={13} a="end" f={i === 7 ? C.caramel : C.crema}>{s}</T>
            <T x={160 + col * 280} y={40 + row * 40} s={12} f={C.cinnamon}>{c}</T>
          </g>
        );
      })}
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={end}>a merge law checked, not assumed</T>
    </Svg>
  );
}

// 14 · Handoff: from reading structures to building them
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 1.0, 2.6, 4);
  const next = easeOut(seg(t, 3.0, 3.7));
  const steps = ['build', 'argue', 'test', 'explain'];
  return (
    <Svg label="Reading real systems, done. Next: build one from nothing, argue it correct, test it, explain it under a clock" h={240}>
      <T x={120} y={60} s={13} a="middle" f={C.latte} o={a}>reading ✓</T>
      {steps.map((s, i) => (
        <g key={s} opacity={i <= k ? 1 : 0}>
          <rect x={220 + i * 90} y={40} width={80} height={32} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
          <T x={260 + i * 90} y={61} s={12} a="middle" f={C.caramel}>{s}</T>
        </g>
      ))}
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={next}>next: practice, under a clock</T>
    </Svg>
  );
}
