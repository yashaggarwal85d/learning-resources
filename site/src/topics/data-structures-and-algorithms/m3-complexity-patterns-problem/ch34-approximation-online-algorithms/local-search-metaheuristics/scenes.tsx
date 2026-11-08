import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the algorithm's own solution (the tour, the
// population); latte = secondary labels; taupe = not yet decided; caramel = the thing to
// look at (the move being tried, the quantity that matters); cinnamon (rare) = the
// benchmark (the true optimum); cherry/cherryText = the bad outcome (a crossing tour, a
// local optimum the search is stuck in).
//
// Every printed number is examples.py's or a sourced quote's: 12! = 479,001,600 left-deep
// orders, a hundred random starts, geqo_threshold's default of 12, the '4-1-3-2' encoding.
// The twelve points, the tours, and which runs reached the optimum all come from seeded
// runs of examples.py's own loops (POINTS seed 3, two-opt seed 11, annealing seed 21,
// genetic seed 31), so they are drawn as shape only, never as printed lengths or counts.

/** examples.py's POINTS (seed 3), rounded to a tenth; drawn only. */
const PTS: [number, number][] = [
  [5.8, 10.7], [87.9, 11.7], [12.0, 83.0], [82.2, 95.4], [6.1, 5.7], [97.9, 9.5],
  [15.4, 89.6], [92.2, 84.4], [12.2, 15.9], [90.4, 13.9], [12.7, 83.0], [94.1, 91.5],
];

/** The Held-Karp optimum's tour (length 344.19, the asserted OPT). */
const OPT_TOUR = [0, 8, 2, 10, 6, 3, 11, 7, 5, 9, 1, 4];

/** The first of two-opt's hundred random starts (seed 11): the start, then the tour after
 * each improving move, as two_opt's own loop makes them. It stops at a local optimum (347.12). */
const TRACE: { tour: number[]; cut?: [number, number, number, number] }[] = [
  { tour: [2, 5, 0, 6, 10, 4, 1, 3, 9, 11, 8, 7] },
  { tour: [2, 0, 5, 6, 10, 4, 1, 3, 9, 11, 8, 7], cut: [2, 5, 0, 6] },
  { tour: [2, 10, 6, 5, 0, 4, 1, 3, 9, 11, 8, 7], cut: [2, 0, 10, 4] },
  { tour: [2, 10, 7, 8, 11, 9, 3, 1, 4, 0, 5, 6], cut: [10, 6, 7, 2] },
  { tour: [2, 10, 7, 11, 8, 9, 3, 1, 4, 0, 5, 6], cut: [7, 8, 11, 9] },
  { tour: [2, 10, 7, 9, 8, 11, 3, 1, 4, 0, 5, 6], cut: [7, 11, 9, 3] },
  { tour: [2, 10, 7, 3, 11, 8, 9, 1, 4, 0, 5, 6], cut: [7, 9, 3, 1] },
  { tour: [2, 10, 7, 3, 11, 1, 9, 8, 4, 0, 5, 6], cut: [11, 8, 1, 4] },
  { tour: [2, 10, 7, 3, 11, 0, 4, 8, 9, 1, 5, 6], cut: [11, 1, 0, 5] },
  { tour: [2, 10, 7, 3, 11, 5, 1, 9, 8, 4, 0, 6], cut: [11, 0, 5, 6] },
  { tour: [2, 10, 7, 3, 11, 5, 9, 1, 8, 4, 0, 6], cut: [5, 1, 9, 8] },
  { tour: [2, 0, 4, 8, 1, 9, 5, 11, 3, 7, 10, 6], cut: [2, 10, 0, 6] },
  { tour: [2, 0, 4, 8, 1, 9, 5, 3, 11, 7, 10, 6], cut: [5, 11, 3, 7] },
  { tour: [2, 0, 4, 8, 1, 9, 5, 7, 11, 3, 10, 6], cut: [5, 3, 7, 10] },
  { tour: [2, 0, 4, 8, 1, 9, 5, 7, 11, 3, 6, 10], cut: [3, 10, 6, 2] },
];

/** Which of the hundred runs ended on the true optimum, in run order ('1' = yes). */
const HIT_2OPT = '0100101011011011010110011101110101001001100110111101000010010100000100001000100111001100001100100001';
const HIT_SA = '1110111111111111111111111111111111111111111111111111111111111011111101111111111111111111111111111111';

/** The hundred final lengths, sorted: two-opt lands on two values only, the genetic search spreads wide. */
const LEN_2OPT = [...Array(45).fill(344.19), ...Array(55).fill(347.12)];
const LEN_GA = [
  ...Array(43).fill(344.2), 344.4, 344.4, 346.6, 346.6, 346.6, ...Array(19).fill(347.1), 347.9, 350.6, 351.0, 351.8,
  351.9, 354.3, 356.3, 357.8, 361.3, 362.4, 362.4, 364.4, 366.0, 368.3, 369.9, 371.6, 374.6, 375.7, 375.9, 376.9,
  378.1, 378.6, 382.2, 383.4, 383.9, 385.5, 389.3, 390.5, 398.9, 416.6, 418.3, 418.5, 418.5,
];

/** Order crossover as examples.py's order_crossover does it, with the cut fixed at 3..7: parent
 * A is the optimum, parent B two-opt's stuck tour. */
const PA = OPT_TOUR;
const PB = TRACE[TRACE.length - 1].tour;
const CUT_LO = 3;
const CUT_HI = 7;
const CHILD = (() => {
  const kept = PA.slice(CUT_LO, CUT_HI + 1);
  const fill = PB.filter((g) => !kept.includes(g));
  let j = 0;
  return PA.map((g, i) => (i >= CUT_LO && i <= CUT_HI ? g : fill[j++]));
})();

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

type Box = { x0: number; y0: number; k: number };
const at = (i: number, b: Box): [number, number] => [b.x0 + PTS[i][0] * b.k, b.y0 + (100 - PTS[i][1]) * b.k];

function Points({ b, r = 3.5, f = C.crema }: { b: Box; r?: number; f?: string }) {
  return (
    <g>
      {PTS.map((_, i) => {
        const [x, y] = at(i, b);
        return <circle key={i} cx={x} cy={y} r={r} fill={f} />;
      })}
    </g>
  );
}

function Tour({ tour, b, col, w = 1.6, dash }: { tour: number[]; b: Box; col: string; w?: number; dash?: string }) {
  const d = tour.map((p, i) => `${i ? 'L' : 'M'}${at(p, b).join(' ')}`).join(' ') + ' Z';
  return <path d={d} fill="none" stroke={col} strokeWidth={w} strokeDasharray={dash} strokeLinejoin="round" />;
}

function Edge({ p, q, b, col, w = 2.4, dash }: { p: number; q: number; b: Box; col: string; w?: number; dash?: string }) {
  const [x1, y1] = at(p, b);
  const [x2, y2] = at(q, b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={w} strokeDasharray={dash} />;
}

/** A cost landscape over the space of tours: a shallow dip (a local optimum) and a deeper one (the true best). */
const cost = (u: number) => 150 - 70 * Math.exp(-(((u - 0.29) / 0.094) ** 2)) - 110 * Math.exp(-(((u - 0.77) / 0.104) ** 2));
function Landscape({ x0, w, y0, sy, ball, ballCol }: { x0: number; w: number; y0: number; sy: number; ball: number; ballCol: string }) {
  const pts = Array.from({ length: 61 }, (_, i) => i / 60);
  const X = (u: number) => x0 + u * w;
  const Y = (u: number) => y0 + (150 - cost(u)) * sy;
  const d = pts.map((u, i) => `${i ? 'L' : 'M'}${X(u).toFixed(1)} ${Y(u).toFixed(1)}`).join(' ');
  return (
    <g>
      <path d={d} fill="none" stroke={C.taupe} strokeWidth={1.6} />
      <circle cx={X(ball)} cy={Y(ball) - 7} r={7} fill={ballCol} />
    </g>
  );
}

function DotGrid({ bits, x0, y0, gap, r, upto = 100 }: { bits: string; x0: number; y0: number; gap: number; r: number; upto?: number }) {
  return (
    <g>
      {bits.split('').map((c, i) => (
        <circle key={i} cx={x0 + (i % 10) * gap} cy={y0 + Math.floor(i / 10) * gap} r={r} fill={i < upto ? (c === '1' ? C.cinnamon : C.cherry) : 'none'} stroke={i < upto ? 'none' : C.mocha} strokeWidth={1} />
      ))}
    </g>
  );
}

// 1 · The hook: every proved bound set aside; twelve tables and their join-order count
export function JoinOrderCount({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const strike = easeInOut(seg(t, 0.7, 1.2));
  const k = stepIdx(t, 1.3, 2.5, 12);
  const n = easeOut(seg(t, 2.6, 3.1));
  const bushy = easeOut(seg(t, 3.3, 3.8));
  const none = easeOut(seg(t, 4.1, 4.6));
  return (
    <Svg label="Every bound proved so far is struck through and set aside. Twelve tables appear one by one; the left-deep orders of joining them number twelve factorial, 479,001,600, bushy shapes far more, and no machine checks them all" h={280}>
      <g opacity={a}>
        <T x={300} y={36} s={13} a="middle" serif f={strike > 0.5 ? C.taupe : C.crema}>every bound so far: proved</T>
        <line x1={160} y1={32} x2={160 + 280 * strike} y2={32} stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={60} s={12} a="middle" f={C.cherryText} o={strike}>set aside, on purpose</T>
      </g>
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} opacity={i <= k ? 1 : 0}>
          <rect x={33 + i * 46} y={92} width={34} height={28} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={50 + i * 46} y={111} s={12} a="middle" f={C.latte}>{`${i + 1}`}</T>
        </g>
      ))}
      <g opacity={n}>
        <T x={300} y={162} s={12} a="middle" f={C.latte}>left-deep orders, one table at a time:</T>
        <T x={300} y={192} s={16} a="middle" f={C.caramel}>12! = 479,001,600</T>
      </g>
      <T x={300} y={226} s={12} a="middle" f={C.latte} o={bushy}>bushy shapes: far more still</T>
      <T x={300} y={262} s={12} a="middle" f={C.cherryText} o={none}>no machine checks them all, one by one</T>
    </Svg>
  );
}

// 2 · A tour, its neighbourhood, and two-opt untangling it move by move
export function TwoOptMove({ t }: StepCtx) {
  const b: Box = { x0: 30, y0: 30, k: 2.2 };
  const pts = easeOut(seg(t, 0.1, 0.6));
  const tour0 = easeOut(seg(t, 0.6, 1.1));
  const m = stepIdx(t, 1.4, 4.0, TRACE.length - 1);
  const cur = TRACE[m + 1] ?? TRACE[0];
  const done = easeOut(seg(t, 4.1, 4.4));
  const cut = m >= 0 ? TRACE[m + 1].cut : undefined;
  return (
    <Svg label="Twelve points in four clusters and a random closed tour through them that crosses itself everywhere. Two-opt removes two edges and reconnects them the other way, move after move, until the tour no longer crosses and no move improves it" h={290}>
      <g opacity={pts}>
        <Points b={b} />
      </g>
      <g opacity={tour0}>
        <Tour tour={cur.tour} b={b} col={m < 0 ? C.cherry : C.crema} />
      </g>
      {cut && (
        <g>
          <Edge p={cut[0]} q={cut[1]} b={b} col={C.caramel} dash="4 3" />
          <Edge p={cut[2]} q={cut[3]} b={b} col={C.caramel} dash="4 3" />
          <Edge p={cut[0]} q={cut[2]} b={b} col={C.caramel} />
          <Edge p={cut[1]} q={cut[3]} b={b} col={C.caramel} />
        </g>
      )}
      <g opacity={tour0}>
        <T x={300} y={60} s={12} f={C.crema}>a tour: every point</T>
        <T x={300} y={80} s={12} f={C.crema}>once, then back home</T>
      </g>
      <g opacity={m >= 0 ? 1 : 0}>
        <T x={300} y={130} s={12} f={C.caramel}>two-opt: drop two edges,</T>
        <T x={300} y={150} s={12} f={C.caramel}>reconnect the other way</T>
      </g>
      <g opacity={done}>
        <T x={300} y={210} s={12} f={C.latte}>no move improves it:</T>
        <T x={300} y={230} s={12} f={C.latte}>the search stops</T>
      </g>
    </Svg>
  );
}

// 3 · The true optimum, and a hundred two-opt runs measured against it
export function TwoOptMeasured({ t }: StepCtx) {
  const b: Box = { x0: 30, y0: 50, k: 2.2 };
  const opt = easeOut(seg(t, 0.2, 1.0));
  const k = stepIdx(t, 1.3, 4.1, 100);
  const legend = easeOut(seg(t, 4.2, 4.7));
  return (
    <Svg label="The twelve points' true shortest tour, found by checking every possibility. Beside it a hundred two-opt runs from random starts fill in one by one: fewer than half land on the true best, the rest stop short" h={300}>
      <g opacity={opt}>
        <T x={30} y={30} s={12} f={C.cinnamon}>true best, all tours checked</T>
        <Tour tour={OPT_TOUR} b={b} col={C.cinnamon} w={1.8} />
        <Points b={b} />
      </g>
      <T x={330} y={30} s={12} f={C.latte} o={opt}>100 random starts</T>
      <DotGrid bits={HIT_2OPT} x0={340} y0={58} gap={22} r={7} upto={k + 1} />
      <g opacity={legend}>
        <circle cx={340} cy={282} r={6} fill={C.cinnamon} />
        <T x={352} y={286} s={12} f={C.latte}>hit it</T>
        <circle cx={430} cy={282} r={6} fill={C.cherry} />
        <T x={442} y={286} s={12} f={C.cherryText}>stopped short</T>
      </g>
    </Svg>
  );
}

// 4 · Predict: could accepting a worse move free a stuck search?
export function PredictAnnealing({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const roll = easeInOut(seg(t, 0.2, 1.4));
  const stuck = easeOut(seg(t, 1.5, 2.0));
  const ask = easeOut(seg(t, 2.3, 2.9));
  const over = answered ? easeInOut(seg(s, 0.3, 2.0)) : 0;
  const u = answered ? lerp(0.29, 0.77, over) : lerp(0.04, 0.29, roll);
  return (
    <Svg label="A cost landscape over tours with a shallow dip and a deeper one. A ball rolls downhill into the shallow dip and sticks there, every neighbour worse. After answering, the ball climbs over the hill and settles in the deeper dip, the true best" h={270}>
      <Landscape x0={60} w={480} y0={50} sy={1.1} ball={u} ballCol={over > 0.95 ? C.cinnamon : C.cherry} />
      <T x={60} y={30} s={11} f={C.latte}>higher = a longer tour</T>
      <g opacity={stuck * (1 - over)}>
        <T x={199} y={200} s={12} a="middle" f={C.cherryText}>stuck: every</T>
        <T x={199} y={218} s={12} a="middle" f={C.cherryText}>neighbour is worse</T>
      </g>
      <g opacity={ask * (1 - over)}>
        <path d="M222 120 Q 270 60 330 70" fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={340} y={74} s={14} f={C.caramel}>?</T>
      </g>
      <T x={300} y={258} s={12} a="middle" f={C.caramel} o={over > 0 ? 0 : ask}>would accepting a worse move ever help?</T>
      <T x={430} y={258} s={12} a="middle" f={C.cinnamon} o={over}>uphill once, then the true best</T>
    </Svg>
  );
}

// 5 · Simulated annealing: a falling temperature, then the same hundred runs measured
export function AnnealingMeasured({ t }: StepCtx) {
  const rule = easeOut(seg(t, 0.1, 0.6));
  const temp = 1 - easeInOut(seg(t, 0.5, 3.0));
  // The ball wanders uphill freely while hot, then settles as the temperature falls.
  const p = seg(t, 0.5, 3.0);
  const u = p < 0.25 ? lerp(0.05, 0.29, easeInOut(p / 0.25))
    : p < 0.45 ? lerp(0.29, 0.5, easeInOut((p - 0.25) / 0.2))
    : p < 0.6 ? lerp(0.5, 0.33, easeInOut((p - 0.45) / 0.15))
    : p < 0.85 ? lerp(0.33, 0.77, easeInOut((p - 0.6) / 0.25))
    : 0.77 + 0.02 * Math.sin((p - 0.85) * 40) * (1 - p) * 6;
  const k = stepIdx(t, 3.1, 4.6, 100);
  const grids = easeOut(seg(t, 3.0, 3.3));
  const cap = easeOut(seg(t, 4.6, 5.0));
  return (
    <Svg label="A worse move is accepted with probability exp of minus the cost rise over the temperature. As the temperature bar falls, the ball hops uphill early and settles in the deepest dip late. Then the hundred two-opt results sit beside a hundred annealing runs, nearly all of which reach the true best" h={290}>
      <T x={30} y={26} s={12} f={C.caramel} o={rule}>worse move kept with exp(−(e′−e)/T)</T>
      <g opacity={rule}>
        <rect x={30} y={60} width={18} height={150} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <rect x={32} y={60 + 148 * (1 - temp)} width={14} height={148 * temp} fill={C.caramel} opacity={0.75} />
        <T x={20} y={232} s={11} f={C.latte}>temp. T</T>
        <Landscape x0={70} w={250} y0={70} sy={0.75} ball={u} ballCol={p >= 0.85 ? C.cinnamon : C.crema} />
      </g>
      <g opacity={grids}>
        <T x={360} y={62} s={12} f={C.latte}>two-opt</T>
        <DotGrid bits={HIT_2OPT} x0={364} y0={84} gap={10} r={3.5} />
        <T x={470} y={62} s={12} f={C.latte}>annealing</T>
        <DotGrid bits={HIT_SA} x0={474} y0={84} gap={10} r={3.5} upto={k + 1} />
      </g>
      <T x={300} y={276} s={12} a="middle" f={C.cinnamon} o={cap}>same instance: the true best, far more often</T>
    </Svg>
  );
}

// 6 · A genetic search: population, selection, crossover, mutation, and how it measured
export function GeneticSurprise({ t }: StepCtx) {
  const pop = stepIdx(t, 0.1, 0.8, 8);
  const sel = easeOut(seg(t, 0.9, 1.3));
  const rows = easeOut(seg(t, 1.4, 1.8));
  const fill = stepIdx(t, 1.9, 2.9, 12);
  const mut = easeOut(seg(t, 3.0, 3.3));
  const phase2 = easeInOut(seg(t, 3.4, 3.8));
  const strip = easeOut(seg(t, 3.8, 4.4));
  const cap = easeOut(seg(t, 4.5, 4.9));
  const mini: Box[] = Array.from({ length: 8 }, (_, i) => ({ x0: 30 + i * 70, y0: 40, k: 0.5 }));
  const popTours = [TRACE[0].tour, TRACE[3].tour, TRACE[6].tour, TRACE[9].tour, PA, TRACE[2].tour, PB, TRACE[5].tour];
  const chosen = [4, 6];
  const cellX = (i: number) => 150 + i * 35;
  const order = CHILD.map((_, i) => (i >= CUT_LO && i <= CUT_HI ? -1 : i)).filter((i) => i >= 0);
  return (
    <Svg label="A population of eight tours; the two fitter ones are selected as parents. Order crossover copies a slice of parent A into the child and fills the rest in parent B's order; mutation occasionally swaps two. Then the hundred final lengths: two-opt's sit on two values, this genetic search's spread far longer" h={300}>
      <g opacity={1 - phase2}>
        <T x={30} y={26} s={12} f={C.latte}>a population of tours</T>
        {mini.map((b, i) => (
          <g key={i} opacity={i <= pop ? (chosen.includes(i) ? 1 : lerp(1, 0.35, sel)) : 0}>
            <rect x={b.x0 - 4} y={b.y0 - 4} width={58} height={58} fill="none" stroke={chosen.includes(i) && sel > 0.5 ? C.caramel : C.mocha} strokeWidth={chosen.includes(i) && sel > 0.5 ? 1.8 : 1} />
            <Tour tour={popTours[i]} b={b} col={C.crema} w={1} />
          </g>
        ))}
        <T x={300} y={124} s={12} a="middle" f={C.caramel} o={sel}>the fitter two become parents</T>
        <g opacity={rows}>
          {[
            ['A', PA, 156],
            ['B', PB, 194],
          ].map(([lab, row, y]) => (
            <g key={lab as string}>
              <T x={110} y={(y as number) + 4} s={12} f={C.latte}>{lab as string}</T>
              {(row as number[]).map((g, i) => (
                <g key={i}>
                  <rect x={cellX(i) - 14} y={(y as number) - 12} width={28} height={22} fill="none" stroke={lab === 'A' && i >= CUT_LO && i <= CUT_HI ? C.caramel : C.mocha} strokeWidth={1.2} />
                  <T x={cellX(i)} y={(y as number) + 4} s={12} a="middle" f={C.latte}>{`${g}`}</T>
                </g>
              ))}
            </g>
          ))}
          <T x={76} y={240} s={12} f={C.crema}>child</T>
          {CHILD.map((g, i) => {
            const inSlice = i >= CUT_LO && i <= CUT_HI;
            const vis = inSlice ? fill >= 0 : order.indexOf(i) < fill;
            const swapped = mut > 0.5 && (i === 9 || i === 10);
            const shown = swapped ? CHILD[i === 9 ? 10 : 9] : g;
            return (
              <g key={i} opacity={vis ? 1 : 0}>
                <rect x={cellX(i) - 14} y={224} width={28} height={22} fill="none" stroke={swapped ? C.cherry : inSlice ? C.caramel : C.crema} strokeWidth={1.4} />
                <T x={cellX(i)} y={240} s={12} a="middle" f={inSlice ? C.caramel : C.crema}>{`${shown}`}</T>
              </g>
            );
          })}
          <T x={300} y={280} s={12} a="middle" f={C.latte} o={mut}>mutation: now and then, swap two</T>
        </g>
      </g>
      <g opacity={strip}>
        <T x={30} y={60} s={12} f={C.latte}>a hundred final tour lengths</T>
        <line x1={140} y1={180} x2={560} y2={180} stroke={C.mocha} strokeWidth={1} />
        <T x={560} y={200} s={11} a="end" f={C.latte}>longer →</T>
        <T x={30} y={114} s={12} f={C.latte}>two-opt</T>
        {LEN_2OPT.map((L, i) => (
          <rect key={`a${i}`} x={140 + (L - 344) * 5.4} y={98} width={3} height={22} fill={C.crema} opacity={0.12} />
        ))}
        <T x={30} y={154} s={12} f={C.latte}>genetic</T>
        {LEN_GA.map((L, i) => (
          <rect key={`g${i}`} x={140 + (L - 344) * 5.4} y={138} width={3} height={22} fill={C.cherry} opacity={0.3} />
        ))}
      </g>
      <T x={300} y={250} s={12} a="middle" f={C.cherryText} o={cap}>this genetic search: worse than plain two-opt</T>
    </Svg>
  );
}

// 7 · PostgreSQL's GEQO, read from its own documentation
export function GeqoDocumented({ t }: StepCtx) {
  const line = easeOut(seg(t, 0.1, 0.8));
  const sides = easeOut(seg(t, 0.8, 1.4));
  const tree = stepIdx(t, 1.6, 2.6, 3);
  const str = easeOut(seg(t, 2.7, 3.1));
  const cross = easeInOut(seg(t, 3.3, 4.2));
  const mut = easeOut(seg(t, 4.4, 4.9));
  const X = (n: number) => 60 + (n - 2) * 34;
  return (
    <Svg label="A line of FROM-item counts from 2 to 16 with geqo_threshold's default of 12 marked: below it the exhaustive planner, at or above it the genetic one. A left-deep join tree of relations 4, 1, 3, 2 becomes the integer string 4-1-3-2; two such strings cross over into a child; mutation is struck out, deprecated" h={290}>
      <g opacity={line}>
        <line x1={X(2)} y1={50} x2={X(16)} y2={50} stroke={C.mocha} strokeWidth={1.2} />
        {Array.from({ length: 15 }, (_, i) => i + 2).map((n) => (
          <line key={n} x1={X(n)} y1={45} x2={X(n)} y2={55} stroke={n === 12 ? C.caramel : C.mocha} strokeWidth={n === 12 ? 2 : 1} />
        ))}
        <T x={X(12)} y={30} s={12} a="middle" f={C.caramel}>geqo_threshold = 12</T>
      </g>
      <g opacity={sides}>
        <T x={X(6)} y={76} s={12} a="middle" f={C.crema}>exhaustive</T>
        <T x={X(14)} y={76} s={12} a="middle" f={C.caramel}>genetic</T>
      </g>
      <g>
        {[
          [0, 'M80 200 L100 170 M120 200 L100 170'],
          [1, 'M100 170 L120 140 M150 170 L120 140'],
          [2, 'M120 140 L140 110 M180 140 L140 110'],
        ].map(([i, d]) => (
          <path key={i as number} d={d as string} stroke={C.crema} strokeWidth={1.4} fill="none" opacity={tree >= (i as number) ? 1 : 0} />
        ))}
        {[
          [80, 214, '4', 0],
          [120, 214, '1', 0],
          [150, 184, '3', 1],
          [180, 154, '2', 2],
        ].map(([x, y, s, i]) => (
          <T key={s as string} x={x as number} y={y as number} s={12} a="middle" f={C.latte} o={tree >= (i as number) ? 1 : 0}>{s as string}</T>
        ))}
      </g>
      <g opacity={str}>
        <path d="M200 160 L240 160" stroke={C.latte} strokeWidth={1.2} />
        <T x={250} y={164} s={14} f={C.caramel}>'4-1-3-2'</T>
        <T x={250} y={186} s={11} f={C.latte}>join 4 and 1, then 3, then 2</T>
      </g>
      <g opacity={cross}>
        <T x={392} y={124} s={12} f={C.crema}>parent</T>
        <T x={392} y={146} s={12} f={C.crema}>parent</T>
        <path d={`M460 ${lerp(120, 132, cross)} L500 136 M460 ${lerp(142, 136, cross)} L500 136`} stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={508} y={140} s={12} f={C.caramel}>child</T>
      </g>
      <g opacity={mut}>
        <T x={300} y={242} s={12} a="middle" f={C.taupe}>mutation</T>
        <line x1={250} y1={238} x2={350} y2={238} stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={266} s={12} a="middle" f={C.latte}>deprecated: no repair step needed</T>
      </g>
    </Svg>
  );
}

// 8 · Predict: which query should trust the genetic planner?
export function PredictGeqoThreshold({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const flow = seg(t, 0.6, 3.2);
  const ask = easeOut(seg(t, 3.0, 3.5));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  // The constant query's runs stream along its timeline like a conveyor; the hourly one's single run drops in once.
  // After the answer a planning block lands on every run: once on the left, on each run on the right, and the
  // planning time each side has paid grows as a bar underneath, one barely there, the other running away.
  const clock = t + s;
  const RX = (i: number) => 324 + ((i * 11 - clock * 14) % 242 + 242) % 242;
  const drop = (i: number) => (answered ? easeOut(seg(s, 0.4 + i * 0.05, 0.7 + i * 0.05)) : 0);
  const one = easeOutBack(seg(t, 0.6, 1.0));
  const paid = answered ? easeInOut(seg(s, 0.6, 2.4)) : 0;
  return (
    <Svg label="Two timelines. Left, a query that runs once an hour: one run. Right, a query that runs constantly: runs streaming past. After answering, a planning block appears before each run: once on the left, before every single run on the right, where a weaker plan's cost repeats" h={270}>
      <g opacity={a}>
        <T x={30} y={50} s={12} f={C.latte}>runs once an hour</T>
        <line x1={30} y1={120} x2={270} y2={120} stroke={C.mocha} strokeWidth={1} />
        <T x={320} y={50} s={12} f={C.latte}>runs constantly</T>
        <line x1={320} y1={120} x2={570} y2={120} stroke={C.mocha} strokeWidth={1} />
      </g>
      {one > 0 && <rect x={150} y={lerp(70, 104, one)} width={6} height={16} fill={C.crema} />}
      {Array.from({ length: 22 }).map((_, i) => {
        const d = drop(i);
        return flow * 22 > i ? (
          <g key={i}>
            <rect x={RX(i)} y={104} width={6} height={16} fill={C.crema} />
            {d > 0 && <rect x={RX(i)} y={lerp(60, 84, d)} width={6} height={16} fill={C.cherry} opacity={clamp(d * 3)} />}
          </g>
        ) : null;
      })}
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>which one should risk a weaker plan?</T>
      <g opacity={rev}>
        <rect x={136} y={lerp(60, 84, rev)} width={20} height={16} fill={C.caramel} />
        <T x={30} y={160} s={12} f={C.cinnamon}>plans once: the risk</T>
        <T x={30} y={180} s={12} f={C.cinnamon}>is small here</T>
        <T x={320} y={160} s={12} f={C.cherryText}>plans every run:</T>
        <T x={320} y={180} s={12} f={C.cherryText}>a weak plan repeats</T>
        <T x={30} y={214} s={12} f={C.quiet}>planning paid</T>
        <rect x={30} y={224} width={Math.max(3, 8 * paid)} height={8} rx={2} fill={C.caramel} />
        <rect x={320} y={224} width={Math.max(3, 250 * paid)} height={8} rx={2} fill={C.cherry} />
      </g>
    </Svg>
  );
}

// 9 · Recap: the documentation's own caveat, the honest call, and what comes next
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.7));
  const b = easeOut(seg(t, 0.8, 1.4));
  const tilt = easeInOut(seg(t, 1.8, 2.8));
  const call = easeOut(seg(t, 2.6, 3.2));
  const end = easeOut(seg(t, 3.6, 4.2));
  const ang = lerp(0, 9, tilt);
  return (
    <Svg label="A tour piece whose cost stands alone, beside a join piece whose cost depends on the rest. A balance tips: the cost of checking every order against the risk of a weaker plan, and the guarantee is given up only where checking costs more. Then the three searches, none saying where it stops, and online paging next" h={290}>
      <g opacity={a}>
        <rect x={40} y={30} width={60} height={22} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={116} y={46} s={12} f={C.crema}>a tour piece: its cost stands alone</T>
      </g>
      <g opacity={b}>
        <rect x={40} y={66} width={60} height={22} fill="none" stroke={C.cherry} strokeWidth={1.4} />
        <T x={116} y={82} s={12} f={C.cherryText}>a join piece: depends on the rest</T>
      </g>
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        <path d="M300 170 L290 190 L310 190 Z" fill={C.latte} />
        <g transform={`rotate(${ang} 300 168)`}>
          <line x1={170} y1={168} x2={430} y2={168} stroke={C.latte} strokeWidth={1.6} />
          <rect x={150} y={146} width={40} height={20} fill={C.cherry} opacity={0.6} />
          <rect x={410} y={146} width={40} height={20} fill={C.caramel} opacity={0.6} />
        </g>
        <T x={170} y={110} s={11} a="middle" f={C.latte}>weaker-plan risk</T>
        <T x={430} y={110} s={11} a="middle" f={C.latte}>checking every order</T>
      </g>
      <T x={300} y={222} s={12} a="middle" f={C.caramel} o={call}>give up the guarantee only where checking costs more</T>
      <g opacity={end}>
        <T x={300} y={252} s={12} a="middle" f={C.latte}>local search, annealing, genetic: none says where</T>
        <T x={300} y={278} s={12} a="middle" f={C.caramel}>next: online paging</T>
      </g>
    </Svg>
  );
}
