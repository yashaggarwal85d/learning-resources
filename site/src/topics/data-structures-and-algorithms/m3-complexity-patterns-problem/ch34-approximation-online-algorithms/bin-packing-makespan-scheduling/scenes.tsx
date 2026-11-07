import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's or the title's: the 30-item tight family (6 × 0.51, 6 × 0.27, 6 × 0.26,
// 12 × 0.23), FFD's 11 bins against a volume of 9, Dósa's 11/9 · OPT + 6/9; the small instance 3, 6, 5, 3, 4, 5, 3, 5
// in bins of 12, FFD 4 against a brute-force 3; Graham's family at m = 2 to 5, LPT 7, 11, 15, 19 against 6, 9, 12, 15,
// ratios 1.1667, 1.2222, 1.25, 1.2667 = 4/3 − 1/(3m); list scheduling's trap at m = 3, 5 against 3; Spark's
// next-fit-decreasing split of the 15 file sizes into 7 partitions under 150 with an open cost of 10. The three-bin
// packing shown for the small instance is one valid witness of examples.py's brute-force optimum.

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

/** Bins as columns; each bin a list of item sizes stacked from the bottom. */
function Bins({ bins, x0, y0, cap, h, w, gap, col, labels = true, upto = Infinity }: { bins: number[][]; x0: number; y0: number; cap: number; h: number; w: number; gap: number; col: (b: number, i: number) => string; labels?: boolean; upto?: number }) {
  let shown = 0;
  return (
    <g>
      {bins.map((bin, b) => {
        let acc = 0;
        return (
          <g key={b}>
            <rect x={x0 + b * (w + gap)} y={y0 - h} width={w} height={h} fill="none" stroke={C.latte} strokeWidth={1} />
            {bin.map((v, i) => {
              const hh = (v / cap) * h;
              const y = y0 - acc - hh;
              acc += hh;
              const vis = shown++ < upto;
              return (
                <g key={i} opacity={vis ? 1 : 0}>
                  <rect x={x0 + b * (w + gap) + 2} y={y + 1} width={w - 4} height={hh - 2} rx={1} fill={col(b, i)} opacity={0.85} />
                  {labels && hh >= 14 && <T x={x0 + b * (w + gap) + w / 2} y={y + hh / 2 + 4} s={12} f={col(b, i) === C.cherry ? C.crema : C.band} a="middle">{v}</T>}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Opening. Three guarantee shapes against the optimum: flat (a fixed multiple), climbing (a log), and the new one,
// a fixed multiple plus a constant on top, which lights.
export function Opening({ t }: StepCtx) {
  const X0 = 60, X1 = 540, Y0 = 230;
  const a = easeInOut(seg(t, 0.3, 1.3));
  const b = easeInOut(seg(t, 1.3, 2.3));
  const c = easeInOut(seg(t, 2.5, 3.5));
  const line = (f: (u: number) => number, d: number) => Array.from({ length: 21 }, (_, i) => i / 20).filter((u) => u <= d + 1e-9).map((u) => `${lerp(X0, X1, u)},${Y0 - f(u)}`).join(' ');
  return (
    <Svg label="Three shapes of guarantee against the optimum. A flat multiple of it. A multiple that climbs like a log. And the new one: a fixed multiple of the optimum plus a constant on top" h={280}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={30} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">optimum</T>
      <polyline points={line((u) => u * 120, a)} fill="none" stroke={C.latte} strokeWidth={1.6} />
      <polyline points={line((u) => Math.log(1 + u * 20) * 60, b)} fill="none" stroke={C.mocha} strokeWidth={1.6} />
      <polyline points={line((u) => 30 + u * 140, c)} fill="none" stroke={C.caramel} strokeWidth={2.6} />
      <T x={X1} y={Y0 - 120 + 16} s={12} f={C.latte} a="end" o={a >= 1 ? 1 : 0}>flat ratio</T>
      <T x={X1} y={Y0 - Math.log(21) * 60 - 8} s={12} f={C.taupe} a="end" o={b >= 1 ? 1 : 0}>log ratio</T>
      <T x={X0 + 10} y={40} s={13} f={C.caramel} o={c >= 1 ? 1 : 0}>new: ratio × optimum + a constant</T>
    </Svg>
  );
}

// 2 · FirstFitDecreasing. The small instance sorted largest first, 6, 5, 5, 5, 4, 3, 3, 3; each item drops into the
// first open bin with room, a new bin opening only when none has room: [6, 5], [5, 5], [4, 3, 3], [3].
const SMALL_SORTED = [6, 5, 5, 5, 4, 3, 3, 3];
const SMALL_FFD = [[6, 5], [5, 5], [4, 3, 3], [3]];
export function FirstFitDecreasing({ t }: StepCtx) {
  const k = stepIdx(t, 0.4, 3.6, 8);
  return (
    <Svg label="The items sorted largest first: six, five, five, five, four, three, three, three. Each drops into the first open bin that still has room, and a new bin opens only when none does: six and five, five and five, four three three, and three" h={290}>
      <T x={40} y={30} s={12} f={C.latte}>sorted, largest first</T>
      {SMALL_SORTED.map((v, i) => (
        <g key={i} opacity={i > k ? 1 : 0.2}>
          <rect x={40 + i * 40} y={42} width={34} height={22} rx={2} fill={i === k + 1 ? C.caramel : C.crema} opacity={0.85} />
          <T x={57 + i * 40} y={58} s={12} f={C.band} a="middle">{v}</T>
        </g>
      ))}
      <Bins bins={SMALL_FFD.slice(0, Math.max(0, [1, 1, 2, 2, 3, 3, 3, 4][Math.max(0, k)] * (k >= 0 ? 1 : 0)))} x0={60} y0={250} cap={12} h={144} w={80} gap={40} col={() => C.caramel} upto={k + 1} />
      <T x={40} y={276} s={12} f={C.latte}>bins of 12: first one with room</T>
    </Svg>
  );
}

// 3 · TightFamily. The 30-item family packed by FFD into 11 bins: six of 0.51 + 0.27, two of three 0.26, three of four
// 0.23. A dashed line marks the volume, 9 bins' worth; the bound 11/9 · OPT + 6/9 sits just above.
const J_BINS = [
  ...Array.from({ length: 6 }, () => [0.51, 0.27]),
  ...Array.from({ length: 2 }, () => [0.26, 0.26, 0.26]),
  ...Array.from({ length: 3 }, () => [0.23, 0.23, 0.23, 0.23]),
];
export function TightFamily({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.6, 11);
  const vol = easeOut(seg(t, 2.8, 3.4));
  const bound = easeOut(seg(t, 3.8, 4.4));
  const cols = (b: number, i: number) => (b < 6 ? (i === 0 ? C.crema : C.latte) : b < 8 ? C.cinnamon : C.caramel);
  return (
    <Svg label="The thirty-item family packed by First-Fit Decreasing into eleven bins: six bins of 0.51 and 0.27, two of three 0.26s, three of four 0.23s. The total volume is nine bins' worth; Dósa's bound, eleven ninths of the optimum plus six ninths, sits just above" h={290}>
      <Bins bins={J_BINS.slice(0, k + 1)} x0={30} y0={200} cap={1} h={150} w={44} gap={6} col={cols} labels={false} />
      <line x1={30} y1={226} x2={30 + 9 * 50 - 6} y2={226} stroke={C.cinnamon} strokeWidth={2} opacity={vol} />
      <T x={30} y={246} s={12} f={C.cinnamon} o={vol}>volume: 9 bins' worth</T>
      <T x={560} y={246} s={12} f={C.caramel} a="end" o={k >= 10 ? 1 : 0}>FFD: 11 bins</T>
      <T x={30} y={276} s={12} f={C.crema} o={bound}>Dósa 2007: FFD ≤ 11/9 · OPT + 6/9</T>
      <T x={30} y={34} s={12} f={C.latte} o={k >= 0 ? 1 : 0}>30 items: 0.51, 0.27, 0.26, 0.23</T>
    </Svg>
  );
}

// 4 · PredictSmallInstance. FFD's four bins for the small instance. After answering, the items slide into three bins
// that are completely full or nearly: [6, 3, 3], [5, 4, 3], [5, 5].
export function PredictSmallInstance({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const mv = answered ? easeInOut(seg(s, 0.3, 1.5)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="First-Fit Decreasing's four bins for the eight items. After answering, the same items rearrange into just three bins: six, three, three; five, four, three; and five, five" h={290}>
      <g opacity={mv > 0 ? 0 : a}>
        <T x={60} y={36} s={12} f={C.latte}>FFD: 4 bins</T>
        <Bins bins={SMALL_FFD} x0={60} y0={240} cap={12} h={168} w={80} gap={40} col={() => C.latte} />
      </g>
      <g opacity={mv}>
        <T x={60} y={36} s={12} f={C.caramel}>3 bins suffice</T>
        <Bins bins={[[6, 3, 3], [5, 4, 3], [5, 5]]} x0={60} y0={240} cap={12} h={168} w={80} gap={40} col={() => C.caramel} />
      </g>
    </Svg>
  );
}

// 5 · SmallInstanceProved. Side by side: FFD's 4 bins and the brute-force 3, the fourth bin of FFD holding a single 3.
export function SmallInstanceProved({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const b = easeOut(seg(t, 1.2, 1.9));
  const x = easeOut(seg(t, 2.3, 2.9));
  return (
    <Svg label="Side by side: First-Fit Decreasing's four bins, the last holding a single three, and the three bins brute force proves enough" h={290}>
      <g opacity={a}>
        <T x={30} y={36} s={12} f={C.latte}>FFD: 4</T>
        <Bins bins={SMALL_FFD} x0={30} y0={240} cap={12} h={168} w={54} gap={10} col={(bi) => (bi === 3 ? C.cherry : C.latte)} />
      </g>
      <g opacity={b}>
        <T x={340} y={36} s={12} f={C.caramel}>brute force: 3</T>
        <Bins bins={[[6, 3, 3], [5, 4, 3], [5, 5]]} x0={340} y0={240} cap={12} h={168} w={54} gap={10} col={() => C.caramel} />
      </g>
      <T x={30} y={270} s={12} f={C.cherryText} o={x}>one bin too many</T>
    </Svg>
  );
}

/** Machines as horizontal lanes; each lane a list of job lengths laid end to end. */
function Lanes({ lanes, x0, y0, unit, lh, col, upto = Infinity }: { lanes: number[][]; x0: number; y0: number; unit: number; lh: number; col: (m: number, i: number, v: number) => string; upto?: number }) {
  let shown = 0;
  return (
    <g>
      {lanes.map((lane, m) => {
        let acc = 0;
        return (
          <g key={m}>
            <T x={x0 - 8} y={y0 + m * (lh + 8) + lh / 2 + 4} s={12} f={C.latte} a="end">{`m${m + 1}`}</T>
            {lane.map((v, i) => {
              const x = x0 + acc * unit;
              acc += v;
              const vis = shown++ < upto;
              return (
                <g key={i} opacity={vis ? 1 : 0}>
                  <rect x={x + 1} y={y0 + m * (lh + 8)} width={v * unit - 2} height={lh} rx={2} fill={col(m, i, v)} opacity={0.85} />
                  <T x={x + (v * unit) / 2} y={y0 + m * (lh + 8) + lh / 2 + 4} s={12} f={col(m, i, v) === C.cherry ? C.crema : C.band} a="middle">{v}</T>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// LPT on Graham's m = 3 jobs [5, 5, 4, 4, 3, 3, 3]: m1 5 3 3, m2 5 3, m3 4 4, each job to the least-loaded machine.
// Trace: 5→m1, 5→m2, 4→m3, 4→m3 (4 < 5), 3→m1, 3→m2, 3→ any of the three at 8 → m1. Loads 11, 8, 8.
const LPT3 = [[5, 3, 3], [5, 3], [4, 4]];
const OPT3 = [[5, 4], [5, 4], [3, 3, 3]];

// 6 · MakespanIntro. Three machines; jobs are handed out and laid end to end per machine; the machine that finishes
// last is outlined: its end is the makespan.
export function MakespanIntro({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.6, 7);
  const last = easeOut(seg(t, 2.8, 3.4));
  const U = 34;
  return (
    <Svg label="Three machines. Jobs are handed out one by one and laid end to end on each machine. The machine that finishes last is outlined: where it ends is the makespan, the finishing time for everybody" h={260}>
      <Lanes lanes={LPT3} x0={60} y0={50} unit={U} lh={34} col={() => C.crema} upto={k >= 0 ? k + 1 : 0} />
      <rect x={58} y={46} width={11 * U + 4} height={42} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} opacity={last} />
      <line x1={60 + 11 * U} y1={36} x2={60 + 11 * U} y2={190} stroke={C.caramel} strokeDasharray="4 3" opacity={last} />
      <T x={60 + 11 * U + 8} y={40} s={12} f={C.caramel} o={last}>makespan</T>
      <T x={60} y={232} s={12} f={C.latte} o={last}>the last machine to finish decides</T>
    </Svg>
  );
}

// 7 · PredictOrderMatters. Two queues of the same jobs, one sorted longest first, one in arrival order. After
// answering, the two guarantees plot against the machine count: 4/3 − 1/(3m) stays low, 2 − 1/m climbs toward 2.
export function PredictOrderMatters({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const p = answered ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const X0 = 300, X1 = 560, Y0 = 250, Y1 = 60;
  const px = (m: number) => X0 + ((m - 1) / 9) * (X1 - X0);
  const py = (r: number) => Y0 - (r - 1) * (Y0 - Y1);
  const curve = (f: (m: number) => number) => Array.from({ length: 10 }, (_, i) => i + 1).filter((m) => m - 1 <= p * 9 + 1e-9).map((m) => `${px(m)},${py(f(m))}`).join(' ');
  const arrival = [1, 1, 3, 1, 1, 1, 1];
  const sorted = [...arrival].sort((x, y) => y - x);
  return (
    <Svg label="Two queues of the same jobs: one sorted longest first, one in arrival order. After answering, the two guarantees plot against the machine count: four thirds minus one over three m stays low, while two minus one over m climbs toward two" h={290}>
      <g opacity={a}>
        <T x={30} y={40} s={12} f={C.caramel}>sorted first</T>
        {sorted.map((v, i) => <rect key={i} x={30 + sorted.slice(0, i).reduce((x, y) => x + y, 0) * 22} y={50} width={v * 22 - 2} height={18} rx={2} fill={C.caramel} />)}
        <T x={30} y={110} s={12} f={C.cinnamon}>arrival order</T>
        {arrival.map((v, i) => <rect key={i} x={30 + arrival.slice(0, i).reduce((x, y) => x + y, 0) * 22} y={120} width={v * 22 - 2} height={18} rx={2} fill={C.cinnamon} />)}
      </g>
      <g opacity={answered ? 1 : 0}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
        <line x1={X0} y1={py(2)} x2={X1} y2={py(2)} stroke={C.line} strokeDasharray="2 4" />
        <T x={X0 - 6} y={py(2) + 4} s={12} f={C.latte} a="end">2</T>
        <T x={X0 - 6} y={Y0 + 4} s={12} f={C.latte} a="end">1</T>
        <polyline points={curve((m) => 4 / 3 - 1 / (3 * m))} fill="none" stroke={C.caramel} strokeWidth={2.4} />
        <polyline points={curve((m) => 2 - 1 / m)} fill="none" stroke={C.cinnamon} strokeWidth={2.4} />
        <T x={X1} y={py(4 / 3) + 18} s={12} f={C.caramel} a="end" o={p}>4/3 − 1/(3m)</T>
        <T x={X1} y={py(1.9) - 12} s={12} f={C.cinnamon} a="end" o={p}>2 − 1/m</T>
        <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">machines m</T>
      </g>
    </Svg>
  );
}

// 8 · GrahamFamily. Graham's family at m = 3: LPT's lanes finish at 11, the brute-force optimum's at 9. Then the ratios
// for m = 2 to 5, 1.1667, 1.2222, 1.25, 1.2667, land as dots exactly on the curve 4/3 − 1/(3m).
const GRAHAM = [
  { m: 2, lpt: 7, opt: 6, r: '1.1667' },
  { m: 3, lpt: 11, opt: 9, r: '1.2222' },
  { m: 4, lpt: 15, opt: 12, r: '1.25' },
  { m: 5, lpt: 19, opt: 15, r: '1.2667' },
];
export function GrahamFamily({ t }: StepCtx) {
  const U = 18;
  const lpt = stepIdx(t, 0.2, 1.4, 7);
  const opt = easeOut(seg(t, 1.6, 2.2));
  const dots = stepIdx(t, 2.6, 4.0, 4);
  const X0 = 360, X1 = 560, Y0 = 250, Y1 = 120;
  const px = (m: number) => X0 + ((m - 2) / 3) * (X1 - X0);
  const py = (r: number) => Y0 - ((r - 1.1) / 0.2) * (Y0 - Y1);
  const curve = Array.from({ length: 31 }, (_, i) => 2 + (i / 30) * 3).map((m) => `${px(m)},${py(4 / 3 - 1 / (3 * m))}`).join(' ');
  return (
    <Svg label="Graham's family at three machines: the sorted rule's lanes finish at eleven, the brute-force optimum's at nine. Then the ratios for two to five machines, 1.1667, 1.2222, 1.25 and 1.2667, land as dots exactly on the curve four thirds minus one over three m" h={290}>
      <T x={60} y={26} s={12} f={C.crema}>m = 3, LPT: 11</T>
      <Lanes lanes={LPT3} x0={60} y0={36} unit={U} lh={18} col={() => C.crema} upto={lpt + 1} />
      <T x={60} y={140} s={12} f={C.caramel} o={opt}>optimum: 9</T>
      <g opacity={opt}>
        <Lanes lanes={OPT3} x0={60} y0={150} unit={U} lh={18} col={() => C.caramel} />
      </g>
      <polyline points={curve} fill="none" stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 3" opacity={dots >= 0 ? 1 : 0} />
      {GRAHAM.map((g, i) => (
        <g key={g.m} opacity={i <= dots ? 1 : 0}>
          <circle cx={px(g.m)} cy={py(g.lpt / g.opt)} r={5} fill={C.caramel} />
          <T x={px(g.m)} y={py(g.lpt / g.opt) - 10} s={12} f={C.caramel} a="middle">{`${g.lpt}/${g.opt}`}</T>
          <T x={px(g.m)} y={Y0 + 20} s={12} f={C.latte} a="middle">m={g.m}</T>
        </g>
      ))}
      <T x={X0} y={Y1 - 20} s={12} f={C.latte} o={dots >= 3 ? 1 : 0}>dashed: 4/3 − 1/(3m)</T>
    </Svg>
  );
}

// 9 · ListSchedWorstCase. m = 3, six unit jobs then one job of 3, unsorted: the ones spread evenly, then the 3 lands on
// a tied machine, ending at 5. Sorted first, the 3 goes first and the ones fill around it: 3, the optimum.
export function ListSchedWorstCase({ t }: StepCtx) {
  const U = 40;
  const a = stepIdx(t, 0.3, 2.2, 7);
  const b = stepIdx(t, 2.8, 4.4, 7);
  return (
    <Svg label="Three machines, six unit jobs and then one job of three, in arrival order: the ones spread evenly, then the three lands on a tied machine and it ends at five. Sorted first instead, the three goes first and the ones fill in around it: it ends at three, the optimum" h={290}>
      <T x={60} y={26} s={12} f={C.cinnamon}>arrival order: ends at 5</T>
      <Lanes lanes={[[1, 1, 3], [1, 1], [1, 1]]} x0={60} y0={36} unit={U} lh={22} col={(_, __, v) => (v === 3 ? C.cherry : C.cinnamon)} upto={a >= 0 ? a + 1 : 0} />
      <line x1={60 + 5 * U} y1={30} x2={60 + 5 * U} y2={130} stroke={C.cherryText} strokeDasharray="4 3" opacity={a >= 6 ? 1 : 0} />
      <T x={60} y={156} s={12} f={C.caramel} o={b >= 0 ? 1 : 0}>sorted first: ends at 3</T>
      <Lanes lanes={[[3], [1, 1, 1], [1, 1, 1]]} x0={60} y0={166} unit={U} lh={22} col={() => C.caramel} upto={b + 1} />
      <line x1={60 + 3 * U} y1={160} x2={60 + 3 * U} y2={260} stroke={C.caramel} strokeDasharray="4 3" opacity={b >= 6 ? 1 : 0} />
      <T x={400} y={100} s={13} f={C.cherryText} o={a >= 6 ? 1 : 0}>5 / 3</T>
      <T x={400} y={230} s={13} f={C.caramel} o={b >= 6 ? 1 : 0}>3 / 3</T>
    </Svg>
  );
}

// 10 · SparkAlgorithm. The 15 file sizes, largest first, into partitions of at most 150 with 10 added per file: only
// the newest partition is checked (outlined), earlier ones close for good: [120], [95], [95], [60, 60], [60, 40],
// [40, 40, 40], [20, 20, 20, 20, 20].
const SPARK = [[120], [95], [95], [60, 60], [60, 40], [40, 40, 40], [20, 20, 20, 20, 20]];
export function SparkAlgorithm({ t }: StepCtx) {
  const k = stepIdx(t, 0.4, 3.8, 15);
  const cap = easeOut(seg(t, 4.0, 4.5));
  let n = 0;
  const firstIdx = SPARK.map((p) => { const f = n; n += p.length; return f; });
  const openP = SPARK.findIndex((p, i) => k >= firstIdx[i] && k < firstIdx[i] + p.length);
  return (
    <Svg label="Fifteen file sizes, largest first, packed into partitions of at most 150 with an open cost of 10 added per file. Only the newest partition is ever checked for room; every earlier one is closed for good. The result: seven partitions" h={290}>
      <T x={30} y={26} s={12} f={C.latte}>next fit decreasing: only the newest is checked</T>
      {SPARK.map((p, i) => {
        let acc = 0;
        const x = 30 + i * 78;
        const closed = openP > i;
        return (
          <g key={i} opacity={k >= firstIdx[i] ? 1 : 0}>
            <rect x={x} y={60} width={66} height={180} fill="none" stroke={i === openP ? C.caramel : C.latte} strokeWidth={i === openP ? 2 : 1} />
            {p.map((v, j) => {
              const hh = ((v + 10) / 150) * 180;
              const y = 240 - acc - hh;
              acc += hh;
              return (
                <g key={j} opacity={k >= firstIdx[i] + j ? 1 : 0}>
                  <rect x={x + 3} y={y + 1} width={60} height={hh - 2} rx={1} fill={closed ? C.latte : C.caramel} opacity={0.85} />
                  <T x={x + 33} y={y + hh / 2 + 4} s={12} f={C.band} a="middle">{v}</T>
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={30} y={270} s={12} f={C.crema} o={cap}>7 partitions; the 11/9 proof covers first fit, not this</T>
    </Svg>
  );
}

// 11 · Recap. The two guarantees side by side, 11/9 · OPT + 6/9 and 4/3 − 1/(3m), each measured against a computable
// floor; then an arrow toward the next topic, where the proof is given up on purpose.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 1.0, 1.6));
  const c = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="The two guarantees side by side: eleven ninths of the optimum plus six ninths for packing, four thirds minus one over three m for scheduling, each measured against a computable floor. Then an arrow toward the next topic, where the proof is given up on purpose" h={260}>
      <g opacity={a}>
        <rect x={30} y={30} width={250} height={70} rx={6} fill="none" stroke={C.caramel} />
        <T x={45} y={58} s={12} f={C.caramel}>packing</T>
        <T x={45} y={84} s={13} f={C.crema}>11/9 · OPT + 6/9</T>
      </g>
      <g opacity={b}>
        <rect x={310} y={30} width={250} height={70} rx={6} fill="none" stroke={C.caramel} />
        <T x={325} y={58} s={12} f={C.caramel}>scheduling</T>
        <T x={325} y={84} s={13} f={C.crema}>4/3 − 1/(3m)</T>
      </g>
      <g opacity={c}>
        <line x1={160} y1={150} x2={440} y2={150} stroke={C.cinnamon} strokeWidth={1.6} strokeDasharray="5 4" />
        <path d="M446 150 l-10 -6 l0 12 Z" fill={C.cinnamon} />
        <T x={300} y={180} s={12} f={C.cinnamon} a="middle">next: local search, no proof on purpose</T>
      </g>
    </Svg>
  );
}
