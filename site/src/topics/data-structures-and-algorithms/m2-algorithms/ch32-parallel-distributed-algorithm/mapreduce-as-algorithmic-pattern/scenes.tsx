import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's: three map tasks of 30 words, 90 records with no combiner; the Zipf
// vocabulary's 40, 20, 14, … counts; the mean groups [2, 4], [10], [100, 0, 0, 0], their means 3, 10, 25, the wrong
// 12.67 against the true and fixed 16.57; the chain join's 1 round, replication 1, 5,000 per server against the
// triangle's 1 round, replication 2, 15,000 per server, on 4 servers; doubling rounds 4 to 20 for chains of 16 to
// 2^20 links. The combined record count comes from a seeded sample and is drawn as shape only; records shown moving
// are illustrations and print nothing.

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

const RECORDS_NO_COMB = 90;
const RECORDS_COMB = 22; // examples.py's seeded sample: drawn as shape only
// Which reducer each illustrated record goes to, and its key's shade (illustration).
const KEYCOL = [C.crema, C.latte, C.caramel, C.cinnamon];

function Box({ x, y, w, h, label, col }: { x: number; y: number; w: number; h: number; label: string; col: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={col} strokeWidth={1.4} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={12} f={col} a="middle">{label}</T>
    </g>
  );
}

/** Records streaming along a lane from x0 to x1: n chips spaced over time, looping while `on`. */
function Stream({ y, n, t, a, b, col, x0 = 120, x1 = 470 }: { y: number; n: number; t: number; a: number; b: number; col: string; x0?: number; x1?: number }) {
  const u = seg(t, a, b);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const start = i / n;
        const f = clamp((u - start * 0.7) / 0.3, 0, 1);
        if (f <= 0 || f >= 1) return null;
        return <rect key={i} x={lerp(x0, x1, f)} y={y - 5 + ((i * 7) % 3) * 4} width={8} height={4} rx={1} fill={col} />;
      })}
    </g>
  );
}

// 1 · Opening. Three map tasks send word records to the reducers. Top lane: one record per word, a dense stream.
// Middle lane: the same counts folded early, a thin stream. Bottom lane: an average folded early, a wrong answer.
export function Opening({ t }: StepCtx) {
  const l2 = easeOut(seg(t, 1.6, 2.0));
  const l3 = easeOut(seg(t, 3.0, 3.4));
  const lane = (y: number, label: string, col: string, o: number, n: number, a: number, b: number, end: string, endCol: string) => (
    <g opacity={o}>
      <T x={30} y={y - 16} s={12} f={col}>{label}</T>
      <Box x={30} y={y - 6} w={80} h={30} label="map ×3" col={C.latte} />
      <line x1={120} y1={y + 9} x2={470} y2={y + 9} stroke={C.line} strokeDasharray="3 4" />
      <Box x={480} y={y - 6} w={90} h={30} label="reduce" col={C.latte} />
      <Stream y={y + 9} n={n} t={t} a={a} b={b} col={col === C.cherryText ? C.cherryText : C.caramel} />
      <T x={570} y={y + 42} s={12} f={endCol} a="end" o={seg(t, b - 0.1, b) >= 1 ? 1 : 0}>{end}</T>
    </g>
  );
  return (
    <Svg label="Three map tasks send word records to the reducers. Top lane: one record per word, a dense stream. Middle lane: the same counts folded together early, a thin stream, the same answer. Bottom lane: an average folded early, and the answer comes out wrong" h={290}>
      {lane(40, 'one record per word', C.crema, 1, 60, 0.2, 1.6, 'right answer', C.crema)}
      {lane(128, 'folded early: counts', C.caramel, l2, 12, 1.6, 2.9, 'same answer', C.caramel)}
      {lane(216, 'folded early: averages', C.cherryText, l3, 12, 3.0, 4.2, 'wrong answer', C.cherryText)}
    </Svg>
  );
}

// Mean example from examples.py.
const GA = [2, 4], GB = [10], GC = [100, 0, 0, 0];
const MEAN_OF_MEANS = (3 + 10 + 25) / 3; // 12.67
const POOLED = 116 / 7; // 16.57
const NX = (v: number) => 50 + v * 5;

// 2 · PredictCombinedMean. Seven values in three groups on a number line. After answering, each group's own mean
// marks, those three average to one point, and the pooled mean of all seven lands somewhere else.
export function PredictCombinedMean({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const m = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const mm = answered ? easeOut(seg(s, 1.0, 1.6)) : 0;
  const pm = answered ? easeOut(seg(s, 1.8, 2.4)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const groups = [
    { vals: GA, col: C.crema, mean: 3, y: 90 },
    { vals: GB, col: C.latte, mean: 10, y: 110 },
    { vals: GC, col: C.cinnamon, mean: 25, y: 130 },
  ];
  return (
    <Svg label="Seven values in three groups on a number line from zero to a hundred. After answering, each group's own mean is marked, those three means average to one point, and the pooled mean of all seven lands somewhere else" h={260}>
      <line x1={NX(0)} y1={170} x2={NX(100)} y2={170} stroke={C.line} />
      <T x={NX(0)} y={190} s={12} f={C.latte} a="middle">0</T>
      <T x={NX(100)} y={190} s={12} f={C.latte} a="middle">100</T>
      {groups.map((g, gi) => (
        <g key={gi} opacity={a}>
          {g.vals.map((v, k) => <circle key={k} cx={NX(v) + (v === 0 ? k * 7 - 7 : 0)} cy={g.y} r={5} fill={g.col} />)}
          <line x1={NX(g.mean)} y1={g.y - 10} x2={NX(g.mean)} y2={170} stroke={g.col} strokeDasharray="2 3" opacity={m} />
        </g>
      ))}
      <g opacity={mm}>
        <path d={`M${NX(MEAN_OF_MEANS)} 176 l-7 12 l14 0 Z`} fill={C.cherryText} />
        <T x={NX(MEAN_OF_MEANS) - 4} y={230} s={12} f={C.cherryText}>mean of means</T>
      </g>
      <g opacity={pm}>
        <path d={`M${NX(POOLED)} 176 l-7 12 l14 0 Z`} fill={C.caramel} />
        <T x={NX(POOLED) + 12} y={206} s={12} f={C.caramel}>pooled mean</T>
      </g>
      <T x={NX(0)} y={254} s={12} f={C.latte} o={pm}>the gap depends on how the values split</T>
    </Svg>
  );
}

// 3 · MapShuffleReduce. Three map tasks turn records into key-value pairs; each pair travels to one of two reducers
// chosen by hash(key) mod R; each reducer then sees every value for its keys. Keys and routes are an illustration.
const PAIRS = [
  { m: 0, k: 0 }, { m: 0, k: 1 }, { m: 0, k: 2 },
  { m: 1, k: 1 }, { m: 1, k: 3 }, { m: 1, k: 0 },
  { m: 2, k: 2 }, { m: 2, k: 0 }, { m: 2, k: 3 },
];
const RED_OF = (k: number) => (k === 0 || k === 2 ? 0 : 1);
export function MapShuffleReduce({ t }: StepCtx) {
  const emit = easeOut(seg(t, 0.4, 1.2));
  const move = easeInOut(seg(t, 1.6, 3.2));
  const red = easeOut(seg(t, 3.4, 4.0));
  const my = (m: number) => 40 + m * 76;
  const ry = (r: number) => 70 + r * 110;
  return (
    <Svg label="Three map tasks turn their records into key-value pairs. Each pair travels to one of two reducers, chosen by the hash of its key modulo the reducer count. Each reducer then holds every value for its own keys" h={290}>
      {[0, 1, 2].map((m) => <Box key={m} x={30} y={my(m)} w={90} h={50} label={`map ${m + 1}`} col={C.latte} />)}
      {[0, 1].map((r) => <Box key={r} x={470} y={ry(r)} w={100} h={60} label={`reduce ${r + 1}`} col={red > 0 ? C.caramel : C.latte} />)}
      {PAIRS.map((p, i) => {
        const slot = PAIRS.slice(0, i).filter((q) => q.m === p.m).length;
        const into = PAIRS.slice(0, i).filter((q) => RED_OF(q.k) === RED_OF(p.k)).length;
        const sx = 132 + slot * 22, sy = my(p.m) + 18;
        const tx = 300 + (into % 5) * 22 - 0, ty = ry(RED_OF(p.k)) + 10 + Math.floor(into / 5) * 22;
        const f = clamp(move * 1.6 - i * 0.07, 0, 1);
        const e = easeInOut(f);
        return <rect key={i} x={lerp(sx, tx + 60, e)} y={lerp(sy, ty, e)} width={16} height={14} rx={2} fill={KEYCOL[p.k]} opacity={emit} />;
      })}
      <T x={300} y={278} s={12} f={C.caramel} a="middle" o={move > 0 ? 1 : 0}>shuffle: hash(key) mod R</T>
    </Svg>
  );
}

// 4 · WordCountWalkthrough. A map task reads "the a the and the" and emits (word, 1) for each; at the reducer every
// 1 for "the" lands together and sums. Then the six lines between three maps and two reducers light: the one place
// everything meets.
const SENT = ['the', 'a', 'the', 'and', 'the'];
export function WordCountWalkthrough({ t }: StepCtx) {
  const em = stepIdx(t, 0.2, 1.4, 5);
  const go = easeInOut(seg(t, 1.6, 2.4));
  const sum = easeOut(seg(t, 2.5, 3.0));
  const all = easeOut(seg(t, 3.3, 3.9));
  const thes = SENT.map((w, i) => ({ w, i })).filter((x) => x.w === 'the');
  return (
    <Svg label="A map task reads the, a, the, and, the, and emits each word with a count of one. At the reducer every one for the lands together and sums to three. Then the six lines between three map tasks and two reducers light up: the one place where everything meets" h={290}>
      <T x={30} y={30} s={12} f={C.latte}>map reads</T>
      {SENT.map((w, i) => (
        <g key={i}>
          <T x={40 + i * 90} y={58} s={13} f={C.crema}>{w}</T>
          <T x={40 + i * 90} y={84} s={12} f={C.caramel} o={i <= em && !(w === 'the' && go > 0) ? 1 : 0}>({w},1)</T>
        </g>
      ))}
      {thes.map((x, k) => (
        <T key={k} x={lerp(40 + x.i * 90, 400 + k * 40, go)} y={lerp(84, 130, go)} s={12} f={C.caramel} o={go > 0 && sum <= 0 ? 1 : 0}>1</T>
      ))}
      <T x={400} y={130} s={13} f={C.caramel} o={sum}>the: 1 + 1 + 1 = 3</T>
      <g opacity={all}>
        {[0, 1, 2].map((m) => <rect key={m} x={60} y={170 + m * 36} width={70} height={24} rx={3} fill="none" stroke={C.latte} />)}
        {[0, 1].map((r) => <rect key={r} x={440} y={184 + r * 40} width={70} height={24} rx={3} fill="none" stroke={C.latte} />)}
        {[0, 1, 2].map((m) => [0, 1].map((r) => <line key={`${m}-${r}`} x1={130} y1={182 + m * 36} x2={440} y2={196 + r * 40} stroke={C.caramel} strokeWidth={1.6} />))}
        <T x={285} y={282} s={12} f={C.caramel} a="middle">every map meets every reducer here</T>
      </g>
    </Svg>
  );
}

// 5 · WhyShuffleIsTheCost. Five machines (dashed): the map and reduce boxes run where their data already sits and
// stay dim; only the shuffle's lines cross machine boundaries, and records pulse along them.
export function WhyShuffleIsTheCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const dim = easeOut(seg(t, 1.2, 1.8));
  const pulse = seg(t, 1.8, 4.2);
  const cap = easeOut(seg(t, 3.8, 4.4));
  const my = (m: number) => 34 + m * 70;
  const ry = (r: number) => 64 + r * 100;
  return (
    <Svg label="Five machines drawn as dashed boxes. The map and reduce steps run where their data already sits and fade back. Only the shuffle's lines cross from one machine to another, and records pulse along them: that crossing is what the job pays for" h={290}>
      <g opacity={a}>
        {[0, 1, 2].map((m) => (
          <g key={m}>
            <rect x={20} y={my(m) - 8} width={130} height={56} rx={6} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
            <rect x={36} y={my(m) + 6} width={90} height={28} rx={3} fill="none" stroke={C.latte} opacity={1 - 0.6 * dim} />
            <T x={81} y={my(m) + 25} s={12} f={C.latte} a="middle" o={1 - 0.6 * dim}>map</T>
          </g>
        ))}
        {[0, 1].map((r) => (
          <g key={r}>
            <rect x={440} y={ry(r) - 8} width={140} height={56} rx={6} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
            <rect x={460} y={ry(r) + 6} width={100} height={28} rx={3} fill="none" stroke={C.latte} opacity={1 - 0.6 * dim} />
            <T x={510} y={ry(r) + 25} s={12} f={C.latte} a="middle" o={1 - 0.6 * dim}>reduce</T>
          </g>
        ))}
        {[0, 1, 2].map((m) => [0, 1].map((r) => {
          const x1 = 150, y1 = my(m) + 20, x2 = 440, y2 = ry(r) + 20;
          const f = ((pulse * 3 + m * 0.21 + r * 0.37) % 1);
          return (
            <g key={`${m}-${r}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={dim > 0 ? C.caramel : C.line} strokeWidth={1.4} />
              {pulse > 0 && pulse < 1 && <circle cx={lerp(x1, x2, f)} cy={lerp(y1, y2, f)} r={3.5} fill={C.caramel} />}
            </g>
          );
        }))}
      </g>
      <T x={300} y={262} s={12} f={C.caramel} a="middle" o={cap}>only the shuffle leaves its machine</T>
    </Svg>
  );
}

// 6 · CombinerIntro. The vocabulary's Zipf counts as bars (the: 40, a: 20, and: 14, …). Then one map task's own
// records for the head words (examples.py's seeded task 1, shape only) fold into one record per word before they leave.
const ZIPF = [40, 20, 14, 6, 4, 3, 3, 2, 2, 1];
export function CombinerIntro({ t }: StepCtx) {
  const bars = easeOut(seg(t, 0.2, 1.2));
  const fold = easeInOut(seg(t, 1.8, 3.2));
  const cap = easeOut(seg(t, 3.4, 3.9));
  const local = [{ w: 'the', n: 13 }, { w: 'a', n: 6 }, { w: 'and', n: 4 }]; // map task 1's own records (seeded: shape only)
  return (
    <Svg label="The vocabulary's word counts as bars, heavily skewed: the, forty; a, twenty; and, fourteen; a long thin tail. Then one map task's own records for the head words fold into one record per word before anything leaves the machine" h={290}>
      {ZIPF.map((c, i) => (
        <g key={i}>
          <rect x={40 + i * 26} y={130 - c * 2.4 * bars} width={20} height={c * 2.4 * bars} fill={i < 3 ? C.crema : C.latte} />
        </g>
      ))}
      {['the', 'a', 'and'].map((w, i) => <T key={w} x={50 + i * 26} y={150} s={12} f={C.crema} a="middle" o={bars}>{w}</T>)}
      <T x={40} y={176} s={12} f={C.latte} o={bars}>Zipf: a few words dominate</T>
      <rect x={330} y={20} width={240} height={190} rx={6} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
      <T x={340} y={40} s={12} f={C.latte}>one map task's output</T>
      {local.map((l, r) => (
        <g key={l.w}>
          {Array.from({ length: l.n }, (_, k) => (
            <rect key={k} x={lerp(350 + k * 16, 350, fold)} y={58 + r * 50} width={12} height={18} rx={2} fill={C.caramel} opacity={k === 0 ? 1 : 1 - fold} />
          ))}
          <T x={380} y={72 + r * 50} s={12} f={C.caramel} o={fold >= 1 ? 1 : 0}>{l.w}, summed</T>
        </g>
      ))}
      <T x={330} y={236} s={12} f={C.caramel} o={cap}>one record per word per task</T>
      <T x={330} y={258} s={12} f={C.latte} o={cap}>only for an order-free reduce</T>
    </Svg>
  );
}

// 7 · CombinerMeasured. Records shuffled: 90 with no combiner, far fewer with one (shape only). Then the two runs'
// final counts, side by side as identical bar charts.
const FINAL = [37, 19, 16, 5, 3, 4, 2, 1, 1, 2]; // examples.py's final counts (seeded sample): shape only
export function CombinerMeasured({ t }: StepCtx) {
  const X0 = 170, W = 380;
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.3, 2.0));
  const res = easeOut(seg(t, 2.4, 3.2));
  const eq = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="Records shuffled across the network: ninety with no combiner, far fewer with one. Then the two runs' final word counts, side by side, identical bar for bar" h={290}>
      <T x={X0 - 10} y={44} s={12} f={C.latte} a="end">no combiner</T>
      <rect x={X0} y={30} width={W * a} height={20} fill={C.latte} />
      <T x={X0 + W} y={24} s={12} f={C.crema} a="end" o={a >= 1 ? 1 : 0}>90 records</T>
      <T x={X0 - 10} y={88} s={12} f={C.caramel} a="end">combiner</T>
      <rect x={X0} y={74} width={W * (RECORDS_COMB / RECORDS_NO_COMB) * b} height={20} fill={C.caramel} />
      {[0, 1].map((side) => (
        <g key={side} opacity={res}>
          <T x={side === 0 ? 60 : 340} y={140} s={12} f={side === 0 ? C.latte : C.caramel}>{side === 0 ? 'answer, no combiner' : 'answer, combiner'}</T>
          {FINAL.map((c, i) => (
            <rect key={i} x={(side === 0 ? 60 : 340) + i * 20} y={240 - c * 2.2} width={14} height={c * 2.2} fill={side === 0 ? C.latte : C.caramel} />
          ))}
        </g>
      ))}
      <T x={300} y={276} s={13} f={C.crema} a="middle" o={eq}>identical, word for word</T>
    </Svg>
  );
}

// 8 · CombinerAlgebra. Three partial results a, b, c meet in three different groupings and orders: (a + b) + c,
// a + (b + c), (c + a) + b. Each tree folds to the same total: associativity and commutativity.
export function CombinerAlgebra({ t }: StepCtx) {
  const trees = [
    { top: ['a', 'b'], last: 'c', label: '(a + b) + c' },
    { top: ['b', 'c'], last: 'a', label: 'a + (b + c)' },
    { top: ['c', 'a'], last: 'b', label: '(c + a) + b' },
  ];
  const eq = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="Three partial results, a, b and c, meet in three different groupings and orders: a plus b, then c; b plus c, then a; c plus a, then b. Each tree folds to the same total, which is what associativity and commutativity promise" h={290}>
      {trees.map((tr, i) => {
        const x0 = 100 + i * 200;
        const f1 = easeOut(seg(t, 0.3 + i * 1.0, 0.8 + i * 1.0));
        const f2 = easeOut(seg(t, 0.8 + i * 1.0, 1.3 + i * 1.0));
        return (
          <g key={i}>
            <T x={x0 - 40} y={44} s={14} f={C.crema} a="middle">{tr.top[0]}</T>
            <T x={x0} y={44} s={14} f={C.crema} a="middle">{tr.top[1]}</T>
            <T x={x0 + 40} y={44} s={14} f={C.crema} a="middle">{tr.last}</T>
            <line x1={x0 - 40} y1={52} x2={x0 - 20} y2={lerp(52, 96, f1)} stroke={C.latte} />
            <line x1={x0} y1={52} x2={x0 - 20} y2={lerp(52, 96, f1)} stroke={C.latte} />
            <circle cx={x0 - 20} cy={104} r={8} fill={C.latte} opacity={f1} />
            <line x1={x0 - 20} y1={112} x2={x0 + 10} y2={lerp(112, 152, f2)} stroke={C.latte} opacity={f1 >= 1 ? 1 : 0} />
            <line x1={x0 + 40} y1={52} x2={x0 + 10} y2={lerp(52, 152, f2)} stroke={C.latte} opacity={f1 >= 1 ? 1 : 0} />
            <circle cx={x0 + 10} cy={160} r={10} fill={C.caramel} opacity={f2} />
            <T x={x0} y={200} s={12} f={C.latte} a="middle" o={f2}>{tr.label}</T>
          </g>
        );
      })}
      <T x={300} y={246} s={13} f={C.caramel} a="middle" o={eq}>any grouping, any order: one total</T>
      <T x={300} y={270} s={12} f={C.latte} a="middle" o={eq}>the framework picks both, not you</T>
    </Svg>
  );
}

// 9 · PredictMeanCombiner. Three groups of different sizes as stacks of values. After answering, each stack shrinks
// to its own mean, and the three means average with equal weight though the groups hold 2, 1 and 4 values.
export function PredictMeanCombiner({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const shrink = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const cap = answered ? easeOut(seg(s, 1.4, 2.0)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const gs = [
    { vals: GA, name: 'group 1' },
    { vals: GB, name: 'group 2' },
    { vals: GC, name: 'group 3' },
  ];
  return (
    <Svg label="Three groups of different sizes, each a stack of its values. After answering, each stack collapses to a single box, its own mean, and the three boxes count equally although the groups hold two, one and four values" h={260}>
      {gs.map((g, i) => (
        <g key={i} opacity={a}>
          {g.vals.map((_, k) => (
            <rect key={k} x={80 + i * 170} y={lerp(170 - (k + 1) * 26, 144, shrink)} width={90} height={22} rx={2} fill={k === 0 ? C.caramel : C.latte} opacity={k === 0 ? 1 : 1 - shrink} />
          ))}
          <T x={125 + i * 170} y={192} s={12} f={C.latte} a="middle">{g.name}</T>
        </g>
      ))}
      <T x={300} y={236} s={12} f={C.caramel} a="middle" o={cap}>each mean counts once, whatever its size</T>
    </Svg>
  );
}

// 10 · BrokenMeanFix. Left: the three means 3, 10 and 25 averaged give 12.67 (red), against the pooled mean of all
// seven, 16.57. Right: the fix carries (sum, count) pairs (6, 2), (10, 1), (100, 4), adds them to (116, 7), and divides
// once: 16.57.
export function BrokenMeanFix({ t }: StepCtx) {
  const r1 = stepIdx(t, 0.3, 1.5, 3);
  const bad = easeOut(seg(t, 1.6, 2.1));
  const r2 = stepIdx(t, 2.4, 3.6, 3);
  const good = easeOut(seg(t, 3.7, 4.2));
  const means = ['3', '10', '25'];
  const pairs = ['(6, 2)', '(10, 1)', '(100, 4)'];
  return (
    <Svg label="Left, the three group means, three, ten and twenty-five, averaged to 12.67, shown in red against the pooled mean of all seven values, 16.57. Right, the fix carries sum-and-count pairs, six and two, ten and one, a hundred and four, adds them to a hundred and sixteen over seven, and divides once: 16.57" h={290}>
      <T x={40} y={30} s={12} f={C.cherryText}>combine means</T>
      {means.map((m, i) => <T key={i} x={60} y={64 + i * 28} s={14} f={C.crema} o={i <= r1 ? 1 : 0}>{m}</T>)}
      <line x1={50} y1={146} x2={190} y2={146} stroke={C.latte} opacity={bad} />
      <T x={60} y={172} s={14} f={C.cherryText} o={bad}>avg 12.67</T>
      <T x={320} y={30} s={12} f={C.caramel}>combine (sum, count)</T>
      {pairs.map((p, i) => <T key={i} x={340} y={64 + i * 28} s={14} f={C.crema} o={i <= r2 ? 1 : 0}>{p}</T>)}
      <line x1={330} y1={146} x2={520} y2={146} stroke={C.latte} opacity={good} />
      <T x={340} y={172} s={14} f={C.crema} o={good}>(116, 7)</T>
      <T x={340} y={200} s={14} f={C.caramel} o={good}>116 / 7 = 16.57</T>
      <T x={40} y={250} s={12} f={C.latte} o={good}>true mean of all seven: 16.57</T>
      <T x={40} y={274} s={12} f={C.caramel} o={good}>divide once, at the very end</T>
    </Svg>
  );
}

// 11 · MPCModelReveal. Four servers across two rounds: each round, a compute block on every server, then an all-to-all
// exchange; after each exchange, the server that received the most is outlined. The tally counts rounds and that load.
const RECV = [[3, 5, 2, 4], [4, 2, 6, 3]]; // records received per server per round (illustration)
export function MPCModelReveal({ t }: StepCtx) {
  const sy = (s: number) => 40 + s * 50;
  const rx = (r: number) => 60 + r * 250;
  const cap = easeOut(seg(t, 4.2, 4.7));
  return (
    <Svg label="Four servers across two rounds. In each round every server computes locally, then all of them exchange data with all of the others; after each exchange, the server that received the most is outlined. The model counts only the rounds and that largest load" h={290}>
      {[0, 1, 2, 3].map((s) => <T key={s} x={30} y={sy(s) + 16} s={12} f={C.latte} a="end">{s + 1}</T>)}
      {[0, 1].map((r) => {
        const comp = easeOut(seg(t, 0.3 + r * 2.0, 0.8 + r * 2.0));
        const ex = seg(t, 0.9 + r * 2.0, 1.8 + r * 2.0);
        const peak = RECV[r].indexOf(Math.max(...RECV[r]));
        return (
          <g key={r}>
            <T x={rx(r)} y={24} s={12} f={C.crema}>round {r + 1}</T>
            {[0, 1, 2, 3].map((s) => (
              <g key={s}>
                <rect x={rx(r)} y={sy(s)} width={80 * comp} height={24} rx={2} fill={C.latte} opacity={0.7} />
                <rect x={rx(r) + 170} y={sy(s)} width={RECV[r][s] * 10 * clamp(ex * 2 - 1, 0, 1)} height={24} rx={2} fill={s === peak ? C.caramel : C.latte} />
                {s === peak && ex >= 1 && <rect x={rx(r) + 166} y={sy(s) - 4} width={RECV[r][s] * 10 + 8} height={32} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.6} />}
              </g>
            ))}
            {[0, 1, 2, 3].map((a) => [0, 1, 2, 3].map((b) => (
              <line key={`${a}-${b}`} x1={rx(r) + 84} y1={sy(a) + 12} x2={rx(r) + 164} y2={sy(b) + 12} stroke={C.caramel} strokeWidth={0.8} opacity={ex > 0 && ex < 1 ? 0.6 : 0.12 * (ex >= 1 ? 1 : 0)} />
            )))}
          </g>
        );
      })}
      <T x={60} y={256} s={12} f={C.crema} o={cap}>cost = rounds, and the largest load</T>
      <T x={60} y={278} s={12} f={C.caramel} o={cap}>any one server receives in a round</T>
    </Svg>
  );
}

// 12 · JoinShapesMeasured. Left, the chain S1(x, y) ⋈ S2(y, z): both sides partition on y to four servers, each record
// sent once — 1 round, replication 1, 5,000 per server. Right, the triangle R, S, T: each record goes to two servers —
// 1 round, replication 2, 15,000 per server.
export function JoinShapesMeasured({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.3, 1.0));
  const lr = easeInOut(seg(t, 1.0, 2.0));
  const r = easeOut(seg(t, 2.3, 3.0));
  const rr = easeInOut(seg(t, 3.0, 4.0));
  const srv = (x0: number, k: number) => ({ x: x0 + k * 56, y: 150 });
  return (
    <Svg label="Left, the chain join of S1 on x and y with S2 on y and z: both sides partition on y across four servers, each record sent once: one round, replication one, five thousand per server. Right, the triangle of R, S and T: each record goes to two servers: one round, replication two, fifteen thousand per server" h={290}>
      <g opacity={l}>
        <T x={20} y={30} s={12} f={C.crema}>chain: S1(x,y), S2(y,z)</T>
        <circle cx={60} cy={70} r={8} fill={C.latte} /><circle cx={130} cy={70} r={8} fill={C.latte} /><circle cx={200} cy={70} r={8} fill={C.latte} />
        <line x1={68} y1={70} x2={122} y2={70} stroke={C.latte} /><line x1={138} y1={70} x2={192} y2={70} stroke={C.latte} />
        {[0, 1, 2, 3].map((k) => {
          const p = srv(40, k);
          return (
            <g key={k}>
              <rect x={p.x} y={p.y} width={44} height={40} rx={3} fill="none" stroke={C.latte} />
              <rect x={lerp(130 - 8, p.x + 10, lr)} y={lerp(80, p.y + 12, lr)} width={24} height={14} rx={2} fill={C.caramel} />
            </g>
          );
        })}
        <T x={20} y={226} s={12} f={C.caramel} o={lr >= 1 ? 1 : 0}>1 round, replication 1</T>
        <T x={20} y={248} s={12} f={C.crema} o={lr >= 1 ? 1 : 0}>5,000 per server</T>
      </g>
      <g opacity={r}>
        <T x={330} y={30} s={12} f={C.crema}>triangle: R, S, T</T>
        <circle cx={400} cy={52} r={8} fill={C.latte} /><circle cx={360} cy={104} r={8} fill={C.latte} /><circle cx={440} cy={104} r={8} fill={C.latte} />
        <line x1={400} y1={52} x2={360} y2={104} stroke={C.latte} /><line x1={400} y1={52} x2={440} y2={104} stroke={C.latte} /><line x1={360} y1={104} x2={440} y2={104} stroke={C.latte} />
        {[0, 1, 2, 3].map((k) => {
          const p = srv(330, k);
          return (
            <g key={k}>
              <rect x={p.x} y={p.y} width={44} height={40} rx={3} fill="none" stroke={C.latte} />
              <rect x={lerp(392, p.x + 4, rr)} y={lerp(70, p.y + 6, rr)} width={18} height={12} rx={2} fill={C.cinnamon} />
              <rect x={lerp(392, p.x + 22, rr)} y={lerp(70, p.y + 22, rr)} width={18} height={12} rx={2} fill={C.cinnamon} />
            </g>
          );
        })}
        <T x={330} y={226} s={12} f={C.cinnamon} o={rr >= 1 ? 1 : 0}>1 round, replication 2</T>
        <T x={330} y={248} s={12} f={C.crema} o={rr >= 1 ? 1 : 0}>15,000 per server</T>
      </g>
      <T x={300} y={280} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 4.1, 4.6))}>4 servers, same sizes: the shape decides</T>
    </Svg>
  );
}

// 13 · TransitiveClosureLimit. A chain of sixteen links; each round doubles how far is known reachable: 2, 4, 8,
// 16 links, four rounds. Then the rounds needed for chains of 16 up to 2^20 links: 4 climbing to 20, never flat.
const DBL = Array.from({ length: 17 }, (_, i) => 4 + i);
export function TransitiveClosureLimit({ t }: StepCtx) {
  const r = stepIdx(t, 0.3, 2.3, 4);
  const plot = easeInOut(seg(t, 2.6, 3.8));
  const x = (i: number) => 40 + i * 32;
  const X0 = 80, X1 = 540, Y0 = 266, Y1 = 150;
  const px = (k: number) => X0 + (k / 16) * (X1 - X0);
  const py = (v: number) => Y0 - ((v - 0) / 20) * (Y0 - Y1);
  const shown = DBL.filter((_, k) => k <= plot * 16 + 1e-9);
  return (
    <Svg label="A chain of sixteen links. Each round doubles how far along is known reachable: two links, four, eight, sixteen, four rounds in all. Then the rounds needed for chains from sixteen links up to two to the twentieth: four, climbing to twenty, never levelling off" h={300}>
      {Array.from({ length: 17 }, (_, i) => <circle key={i} cx={x(i)} cy={50} r={4} fill={C.latte} />)}
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={x(i) + 4} y1={50} x2={x(i + 1) - 4} y2={50} stroke={C.mocha} />)}
      {r >= 0 && <rect x={x(0) - 6} y={40} width={x(2 ** (r + 1)) - x(0) + 12} height={20} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {r >= 0 && <T x={x(0)} y={88} s={12} f={C.caramel}>round {r + 1}: reach {2 ** (r + 1)} links</T>}
      <g opacity={plot > 0 ? 1 : 0}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
        <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">20</T>
        <T x={X0 - 8} y={py(4) + 4} s={12} f={C.latte} a="end">4</T>
        <polyline points={shown.map((v, k) => `${px(k)},${py(v)}`).join(' ')} fill="none" stroke={C.cherryText} strokeWidth={2.2} />
        <T x={X0} y={Y1 - 14} s={12} f={C.latte}>rounds, for 16 up to 2^20 links</T>
      </g>
    </Svg>
  );
}

// 14 · JoinAsShuffle. Records from two tables, tagged L and R, route by join key to three reducers, where each
// reducer pairs what matched. Then one hot key keeps arriving and its reducer's bar runs far past the others.
const JKEYS = [0, 1, 2, 0, 1, 0, 2, 0, 0, 1]; // join key per record (illustration)
export function JoinAsShuffle({ t }: StepCtx) {
  const go = seg(t, 0.4, 2.4);
  const hot = easeInOut(seg(t, 2.8, 4.0));
  const cap = easeOut(seg(t, 4.0, 4.5));
  const rx = (k: number) => 360 + 0;
  const ry = (k: number) => 40 + k * 64;
  return (
    <Svg label="Records from two tables, tagged L and R, route by their join key to three reducers, where each reducer pairs whatever matched. Then one hot key keeps arriving, and its reducer's load runs far past the others" h={290}>
      <T x={30} y={30} s={12} f={C.crema}>table L</T>
      <T x={30} y={150} s={12} f={C.cinnamon}>table R</T>
      {JKEYS.map((k, i) => {
        const fromL = i % 2 === 0;
        const f = easeInOut(clamp(go * 1.8 - i * 0.08, 0, 1));
        const into = JKEYS.slice(0, i).filter((q) => q === k).length;
        const sx = 40 + Math.floor(i / 2) * 30, sy = fromL ? 40 : 160;
        const tx = rx(k) + into * 22, ty = ry(k) + 6;
        return <rect key={i} x={lerp(sx, tx, f)} y={lerp(sy, ty, f)} width={18} height={16} rx={2} fill={fromL ? C.crema : C.cinnamon} />;
      })}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={rx(k) - 6} y={ry(k)} width={220} height={28} rx={3} fill="none" stroke={k === 0 && hot > 0 ? C.cherryText : C.latte} />
          <T x={rx(k) - 14} y={ry(k) + 19} s={12} f={C.latte} a="end">key {k + 1}</T>
        </g>
      ))}
      <rect x={rx(0) + 5 * 22} y={ry(0) + 6} width={hot * 96} height={16} rx={2} fill={C.cherry} stroke={C.cherryText} />
      <T x={30} y={250} s={12} f={C.cherryText} o={cap}>one hot key, one overloaded reducer</T>
      <T x={30} y={272} s={12} f={C.latte} o={cap}>paid in network time</T>
    </Svg>
  );
}

// 15 · Recap. Left: a few rounds of independent work, three blocks, the same three rounds however many machines.
// Right: an exponential curve, and the same curve divided across many machines, still climbing out of the frame.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const c1 = easeInOut(seg(t, 1.2, 2.4));
  const c2 = easeInOut(seg(t, 2.4, 3.6));
  const nx = (k: number) => 330 + k * 24;
  const curve = (div: number, d: number) =>
    Array.from({ length: 11 }, (_, k) => k).filter((k) => k <= d * 10 + 1e-9).map((k) => `${nx(k)},${Math.max(20, 220 - (2 ** k) / div * 0.5)}`).join(' ');
  return (
    <Svg label="Left: a few rounds of independent work, three blocks, the same three rounds however many machines join. Right: an exponential curve, and the same curve divided across many machines, climbing out of the frame a few steps later" h={290}>
      <g opacity={a}>
        {[0, 1, 2].map((r) => <rect key={r} x={40 + r * 80} y={120} width={64} height={40} rx={4} fill={C.caramel} opacity={0.8} />)}
        <T x={40} y={190} s={12} f={C.caramel}>a few rounds: stays a few</T>
      </g>
      <line x1={330} y1={220} x2={570} y2={220} stroke={C.line} />
      <polyline points={curve(1, c1)} fill="none" stroke={C.cherryText} strokeWidth={2} />
      <polyline points={curve(64, c2)} fill="none" stroke={C.cinnamon} strokeWidth={2} />
      <T x={330} y={246} s={12} f={C.cherryText} o={c1}>exponential</T>
      <T x={330} y={268} s={12} f={C.cinnamon} o={c2}>÷ many machines: still exponential</T>
    </Svg>
  );
}
