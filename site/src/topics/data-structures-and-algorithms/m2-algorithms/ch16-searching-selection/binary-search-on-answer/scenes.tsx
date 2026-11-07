import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16's own): crema = a candidate at rest; latte = secondary labels; taupe = the
// eliminated region; caramel = the thing to look at this beat (mid, the predicate lamp, the answer); cinnamon (rare) =
// the second picture beside the first; cherryText = the bug or the bad outcome.
// Every printed number is examples.py's or a quoted source: weights [7, 2, 5, 10, 8] in 2 trips -> capacity 18 in 4
// iterations; the search's own capacities on the way (10 = the largest weight, mids 21, 15, 18, 17) run here by
// examples.py's loop; the non-monotone [T, F, T, T, F] -> index 2, true at 0, 2, 3; sqrt 2 from 1 and 2 to 1.414214
// in 20 iterations, 21 at half the precision; Megiddo's 1983 framing quoted from SOURCES.md. The shrinking bisection
// intervals are drawn as shape only.

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

const W = [7, 2, 5, 10, 8];
const MAXW = Math.max(...W);
const SUMW = W.reduce((a, b) => a + b, 0);

/** examples.py's greedy packing: the groups (as index lists) at a capacity. */
function groups(cap: number) {
  const out: number[][] = [[]];
  let cur = 0;
  W.forEach((w, i) => {
    if (cur + w > cap) {
      out.push([]);
      cur = 0;
    }
    out[out.length - 1].push(i);
    cur += w;
  });
  return out;
}
const feasible = (cap: number) => cap >= MAXW && groups(cap).length <= 2;

/** examples.py's min_capacity_for_trips: [lo, hi] after every iteration, with the mid tested. */
const CAP_TRACE: { lo: number; hi: number; mid: number }[] = (() => {
  let lo = MAXW;
  let hi = SUMW;
  const out = [{ lo, hi, mid: -1 }];
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) hi = mid;
    else lo = mid + 1;
    out.push({ lo, hi, mid });
  }
  return out;
})();

/** The packages packed into trucks at a capacity: each group a row, each weight a box of its width. */
function Packing({ cap, x, y, s = 10, o = 1 }: { cap: number; x: number; y: number; s?: number; o?: number }) {
  const g = groups(cap);
  return (
    <g opacity={o}>
      {g.map((grp, r) => {
        let off = 0;
        return (
          <g key={r}>
            <rect x={x} y={y + r * 30} width={cap * s} height={24} rx={3} fill="none" stroke={r < 2 ? C.latte : C.cherryText} strokeWidth={1.2} strokeDasharray="4 3" />
            {grp.map((i) => {
              const bx = x + off * s;
              off += W[i];
              return (
                <g key={i}>
                  <rect x={bx + 1} y={y + r * 30 + 3} width={W[i] * s - 2} height={18} rx={2} fill={C.crema} opacity={0.75} />
                  <T x={bx + (W[i] * s) / 2} y={y + r * 30 + 16} s={12} a="middle" f={C.espresso}>{W[i]}</T>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Opening. Five packages, 7 2 5 10 8. The truck's capacity line slides; at each width the packages repack into
// trips; the question: the smallest capacity that needs only two.
export function Opening({ t }: StepCtx) {
  const cap = Math.round(lerp(12, 24, easeInOut(seg(t, 0.5, 2.6))));
  return (
    <Svg label="Five packages weighing 7, 2, 5, 10 and 8. As the truck's capacity grows the packages repack into fewer trips; what is the smallest capacity that needs only two?" h={240}>
      <T x={30} y={24} s={12} f={C.latte}>packages, in order: 7 2 5 10 8</T>
      <Packing cap={cap} x={30} y={40} s={14} />
      <T x={30} y={200} s={12} f={groups(cap).length <= 2 ? C.caramel : C.cherryText}>{groups(cap).length <= 2 ? 'two trips' : 'too many trips'}</T>
      <T x={300} y={228} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>smallest capacity for two trips?</T>
    </Svg>
  );
}

// 2 · Predict. A row of yes/no lamps over capacities: false, false, ..., then true from 18 on. One lamp in the true
// region pulses dark: what if a predicate is not monotone? After answering: the search lands and reports an answer,
// with no warning.
export function PredictMonotone({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const N = SUMW - MAXW + 1;
  const X = (c: number) => 40 + (c - MAXW) * 23;
  const fallen = answered ? easeOutBack(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="Lamps for each capacity from 10 up: false until 18, true from then on, a monotone predicate. One lamp flips back to false: a predicate that isn't monotone. After answering: the search still lands and returns an answer, with no warning" h={240}>
      <T x={40} y={24} s={12} f={C.latte}>"capacity is enough?" for 10 and up</T>
      {Array.from({ length: N }, (_, i) => {
        const c = MAXW + i;
        const bad = c === 24;
        const on = feasible(c) && !(bad && t > 0.8);
        return <circle key={c} cx={X(c) + 8} cy={70} r={8} fill={on ? C.caramel : 'none'} stroke={bad && t > 0.8 ? C.cherryText : on ? C.caramel : C.latte} strokeWidth={1.3} opacity={bad && t > 0.8 && !answered ? pulse : 1} />;
      })}
      <T x={X(18) + 8} y={98} s={12} a="middle" f={C.caramel}>18</T>
      {answered && (
        <g opacity={clamp(fallen, 0, 1)}>
          <path d={`M${X(18) + 8} ${lerp(140, 110, clamp(fallen, 0, 1))} l-6 10 l12 0 z`} fill={C.caramel} />
          <T x={300} y={160} s={13} a="middle" f={C.cherryText}>an answer comes back, no warning</T>
        </g>
      )}
      {!answered && <T x={300} y={200} s={14} a="middle" f={C.caramel} o={pulse}>and if it isn't monotone?</T>}
    </Svg>
  );
}

// 3 · The reframe. A capacity axis from the largest weight, 10, to the sum; lo and hi are capacities. Each iteration
// tests mid with a greedy packing beneath: 21 fits in two trips, 15 doesn't, 18 does, 17 doesn't. They close on 18, in
// 4 iterations.
export function Reframe({ t }: StepCtx) {
  const P = (c: number) => 40 + ((c - MAXW) / (SUMW - MAXW)) * 520;
  const per = 0.85;
  const k = clamp((t - 0.4) / per, 0, CAP_TRACE.length - 1);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, CAP_TRACE.length - 1);
  const f = easeInOut(clamp((k - i0 - 0.55) / 0.45, 0, 1));
  const lo = lerp(CAP_TRACE[i0].lo, CAP_TRACE[i1].lo, f);
  const hi = lerp(CAP_TRACE[i0].hi, CAP_TRACE[i1].hi, f);
  const mid = i1 > i0 ? CAP_TRACE[i1].mid : -1;
  const done = k >= CAP_TRACE.length - 1;
  return (
    <Svg label="A capacity axis from 10, the largest weight, to the sum of the weights; lo and hi are capacities. Each mid is tested by a greedy packing: 21 fits in two trips, 15 does not, 18 does, 17 does not; they close on 18 in 4 iterations" h={280}>
      <path d={`M40 60 L560 60`} stroke={C.latte} strokeWidth={1.2} />
      <rect x={P(lo)} y={52} width={Math.max(2, P(hi) - P(lo))} height={16} rx={2} fill={C.caramel} opacity={0.3} />
      <T x={40} y={90} s={12} a="middle" f={C.latte}>10</T>
      <T x={560} y={90} s={12} a="middle" f={C.latte}>sum</T>
      <path d={`M${P(lo)} 44 l-5 -9 l10 0 z`} fill={C.crema} />
      <T x={P(lo)} y={28} s={12} a="middle" f={C.crema}>lo</T>
      <path d={`M${P(hi)} 44 l-5 -9 l10 0 z`} fill={C.latte} opacity={done ? 0 : 1} />
      <T x={P(hi) + (done ? 0 : 0)} y={28} s={12} a="middle" f={C.latte} o={done ? 0 : 1}>{Math.abs(P(hi) - P(lo)) < 24 ? '' : 'hi'}</T>
      {mid > 0 && !done && (
        <g>
          <circle cx={P(mid)} cy={60} r={6} fill={feasible(mid) ? C.caramel : C.cherryText} />
          <T x={P(mid)} y={90} s={12} a="middle" f={feasible(mid) ? C.caramel : C.cherryText}>{mid}</T>
          <Packing cap={mid} x={40} y={110} s={9} />
          <T x={40} y={220} s={12} f={feasible(mid) ? C.caramel : C.cherryText}>{feasible(mid) ? 'two trips: enough' : 'three trips: not enough'}</T>
        </g>
      )}
      {done && (
        <g opacity={easeOut(seg(t, 0.4 + per * (CAP_TRACE.length - 1), 0.8 + per * (CAP_TRACE.length - 1)))}>
          <Packing cap={18} x={40} y={110} s={9} />
          <T x={40} y={220} s={13} f={C.caramel}>18, in 4 iterations</T>
        </g>
      )}
      <T x={40} y={262} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>same loop: lo, hi, mid are capacities now</T>
    </Svg>
  );
}

// 4 · A broken precondition. Lamps true, false, true, true, false. The identical loop: mid 2 is true, so hi = 2; mid 1
// is false, so lo = 2; it returns 2, confidently. Then index 0 lights red: true, never examined.
export function BrokenPrecondition({ t }: StepCtx) {
  const P = [true, false, true, true, false];
  const X = (i: number) => 120 + i * 80;
  const FR = [
    { lo: 0, hi: 5, mid: -1 },
    { lo: 0, hi: 2, mid: 2 },
    { lo: 2, hi: 2, mid: 1 },
  ];
  const k = clamp((t - 0.5) / 0.9, 0, 2);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, 2);
  const f = easeInOut(clamp((k - i0 - 0.5) / 0.5, 0, 1));
  const lo = lerp(FR[i0].lo, FR[i1].lo, f);
  const hi = lerp(FR[i0].hi, FR[i1].hi, f);
  const mid = i1 > i0 ? FR[i1].mid : -1;
  const done = k >= 2;
  const miss = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="A predicate true, false, true, true, false. The identical loop tests index 2, true, then index 1, false, and returns 2 confidently. The first true position is index 0, which the search never examined" h={260}>
      {P.map((v, i) => (
        <g key={i}>
          <circle cx={X(i) + 20} cy={80} r={16} fill={v ? C.caramel : 'none'} stroke={i === 0 && miss > 0.5 ? C.cherryText : v ? C.caramel : C.latte} strokeWidth={i === 0 && miss > 0.5 ? 3 : 1.4} opacity={i >= lo - 0.01 && i < hi - 0.01 ? 1 : 0.35} />
          <T x={X(i) + 20} y={120} s={12} a="middle" f={C.latte}>{i}</T>
          <T x={X(i) + 20} y={48} s={12} a="middle" f={v ? C.caramel : C.latte}>{v ? 'T' : 'F'}</T>
        </g>
      ))}
      {mid >= 0 && <circle cx={X(mid) + 20} cy={80} r={22} fill="none" stroke={C.crema} strokeWidth={1.4} />}
      {done && (
        <g opacity={easeOutBack(seg(t, 2.4, 2.8))}>
          <path d={`M${X(2) + 20} 132 l-6 10 l12 0 z`} fill={C.caramel} />
          <T x={X(2) + 20} y={162} s={13} a="middle" f={C.caramel}>returns 2</T>
        </g>
      )}
      <T x={X(0)} y={200} s={13} f={C.cherryText} o={miss}>first true: 0, never examined</T>
      <T x={300} y={240} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>true at 0, 2 and 3: no single boundary</T>
    </Svg>
  );
}

// 5 · Real-valued bisection. An axis from 1 to 2; the bracket around the square root of two halves, row after row,
// the rows stacking ever narrower toward one point; stopped not at an empty range but at a precision bound: 1.414214.
export function RealValuedBisection({ t }: StepCtx) {
  const P = (v: number) => 40 + (v - 1) * 520;
  const rows: [number, number][] = [];
  let lo = 1;
  let hi = 2;
  for (let i = 0; i < 8; i++) {
    rows.push([lo, hi]);
    const m = (lo + hi) / 2;
    if (m * m < 2) lo = m;
    else hi = m;
  }
  const k = clamp((t - 0.3) / 0.35, 0, 8);
  return (
    <Svg label="An axis from 1 to 2. The bracket around the square root of two halves row after row, narrowing toward one point; the loop stops at a precision bound, not an empty range: 1.414214 after 20 iterations" h={280}>
      <path d={`M${P(1)} 30 L${P(2)} 30`} stroke={C.latte} strokeWidth={1.2} />
      <T x={P(1)} y={22} s={12} a="middle" f={C.latte}>1</T>
      <T x={P(2)} y={22} s={12} a="middle" f={C.latte}>2</T>
      {rows.map(([a, b], i) => (
        <rect key={i} x={P(a)} y={44 + i * 20} width={(P(b) - P(a)) * clamp(k - i, 0, 1)} height={12} rx={2} fill={C.caramel} opacity={0.35 + 0.08 * i} />
      ))}
      <path d={`M${P(Math.SQRT2)} 36 L${P(Math.SQRT2)} 210`} stroke={C.crema} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.8, 3.2))} />
      <T x={30} y={236} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>stop when hi − lo ≤ ε, not when lo == hi</T>
      <T x={30} y={264} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>√2 ≈ 1.414214, 20 iterations</T>
    </Svg>
  );
}

// 6 · Predict. Twenty halving boxes in a row and a precision gap; the gap halves, pulsing. After answering: one more
// box drops in at the end, 20 becoming 21.
export function PredictDoubling({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const extra = answered ? easeOutBack(seg(s, 0.3, 0.9)) : 0;
  const gap = 40 * (1 - 0.5 * (0.5 + 0.5 * Math.sin(t * 3)));
  return (
    <Svg label="Twenty halvings reach a precision of one in a million. Halve the precision: after answering, a single extra halving is added, 21 in all" h={240}>
      <T x={40} y={28} s={12} f={C.latte}>halvings to reach ε</T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={40 + i * 24} y={44} width={18} height={18} rx={2} fill={C.crema} opacity={0.75} />
      ))}
      {answered && <rect x={40 + 20 * 24} y={lerp(14, 44, clamp(extra, 0, 1.1))} width={18} height={18} rx={2} fill={C.caramel} opacity={clamp(extra, 0, 1)} />}
      <T x={40} y={100} s={12} f={C.crema}>20</T>
      {answered && <T x={40 + 20 * 24 + 9} y={100} s={13} a="middle" f={C.caramel} o={clamp(extra, 0, 1)}>21</T>}
      <path d={`M${300 - gap / 2} 140 L${300 - gap / 2} 160 M${300 + gap / 2} 140 L${300 + gap / 2} 160`} stroke={C.caramel} strokeWidth={1.6} opacity={answered ? 0.4 : 1} />
      <T x={300} y={180} s={12} a="middle" f={C.latte}>ε → ε / 2</T>
      {!answered && <T x={300} y={222} s={14} a="middle" f={C.caramel} o={pulse}>twice as many?</T>}
      {answered && <T x={300} y={222} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>one more halving, not double</T>}
    </Svg>
  );
}

// 7 · The count ignores the predicate. The formula; then two predicates side by side, a cheap test and a costly one,
// each feeding the same row of 20 halvings, filling at the same pace.
export function IterationCountIndependent({ t }: StepCtx) {
  const fill = clamp((t - 1.0) / 2.0, 0, 1) * 20;
  return (
    <Svg label="Iterations equal the ceiling of log base two of span over epsilon. A cheap predicate and an expensive one both take the same 20 halvings: the formula never mentions what is being tested" h={260}>
      <Eq x={300} y={40} a="middle">⌈log₂(span / ε)⌉</Eq>
      {[
        ['cheap test', 10],
        ['costly test', 34],
      ].map(([l, r], row) => (
        <g key={l as string} opacity={easeOut(seg(t, 0.4 + row * 0.3, 0.8 + row * 0.3))}>
          <circle cx={70} cy={100 + row * 70} r={r as number} fill="none" stroke={row ? C.cinnamon : C.crema} strokeWidth={1.4} />
          <circle cx={70} cy={100 + row * 70} r={(r as number) * 0.4} fill={row ? C.cinnamon : C.crema} opacity={0.5 + 0.4 * Math.sin(t * (row ? 1.5 : 6))} />
          <T x={120} y={86 + row * 70} s={12} f={row ? C.cinnamon : C.crema}>{l as string}</T>
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={120 + i * 22} y={96 + row * 70} width={16} height={14} rx={2} fill={C.caramel} opacity={clamp(fill - i, 0, 1) * 0.85} />
          ))}
        </g>
      ))}
      <T x={300} y={240} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.1, 3.5))}>both: 20 halvings</T>
    </Svg>
  );
}

// 8 · Parametric search. An outer loop proposes a threshold; a decision box answers yes or no; the threshold moves
// accordingly, the bracket closing; Megiddo, 1983: a decision algorithm into an optimization algorithm.
export function ParametricSearch({ t }: StepCtx) {
  const k = clamp((t - 0.6) / 0.6, 0, 4);
  const marks = [0.5, 0.25, 0.375, 0.4375, 0.40625];
  const i0 = Math.floor(k);
  const m = lerp(marks[i0], marks[Math.min(i0 + 1, 4)], easeInOut(k - i0));
  const yes = i0 % 2 === 1;
  const ping = (t * 2) % 1;
  return (
    <Svg label="An outer binary search proposes a threshold and a decision procedure answers whether a solution at least that good exists; the threshold moves and the bracket closes. Megiddo, 1983: a decision algorithm turned into an optimization algorithm" h={280}>
      <rect x={40} y={40} width={200} height={60} rx={6} fill="none" stroke={C.crema} strokeWidth={1.4} />
      <T x={140} y={66} s={12} a="middle" f={C.crema}>outer search</T>
      <T x={140} y={86} s={12} a="middle" f={C.latte}>proposes t</T>
      <rect x={360} y={40} width={200} height={60} rx={6} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.4} />
      <T x={460} y={66} s={12} a="middle" f={C.caramel}>decision</T>
      <T x={460} y={86} s={12} a="middle" f={C.latte}>as good as t?</T>
      <path d="M240 60 L360 60 M360 80 L240 80" stroke={C.latte} strokeWidth={1.2} />
      <circle cx={lerp(240, 360, ping)} cy={60} r={4} fill={C.crema} opacity={t > 0.6 ? 1 : 0} />
      <circle cx={lerp(360, 240, ping)} cy={80} r={4} fill={yes ? C.caramel : C.cherryText} opacity={t > 0.6 ? 1 : 0} />
      <path d="M40 160 L560 160" stroke={C.latte} strokeWidth={1.2} />
      <circle cx={40 + m * 520} cy={160} r={7} fill={C.caramel} opacity={t > 0.6 ? 1 : 0} />
      <T x={40 + m * 520} y={186} s={12} a="middle" f={C.caramel} o={t > 0.6 ? 1 : 0}>t</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <T x={40} y={234} s={12} f={C.crema}>Megiddo, 1983: "transforming a decision algorithm</T>
        <T x={40} y={256} s={12} f={C.crema}>... into an optimization algorithm"</T>
      </g>
    </Svg>
  );
}

// 9 · Recap. Three chips: the answer space, a precision bound, parametric search. Then a sorted row turns: its cells
// rotate round, the order hidden, not gone. Search in rotated and sorted matrices, next.
export function Recap({ t }: StepCtx) {
  const CH = ['the answer space', 'a precision bound', 'parametric search'];
  // The next topic's own arrays: [0, 1, 2, 4, 5, 6, 7] rotated to [4, 5, 6, 7, 0, 1, 2].
  const ROW = [0, 1, 2, 4, 5, 6, 7];
  const rot = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="Three ideas: search over the answer space, stop at a precision bound, parametric search. Then a sorted row rotates round, its order hidden rather than gone: search in rotated and sorted matrices, next" h={220}>
      {CH.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35));
        return (
          <g key={c} opacity={clamp(a, 0, 1)}>
            <rect x={30 + i * 185} y={20} width={175} height={30} rx={15} fill="none" stroke={C.caramel} strokeWidth={1.3} />
            <T x={117 + i * 185} y={40} s={12} a="middle" f={C.caramel}>{c}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        {ROW.map((v, i) => {
          const pos = lerp(i, (i + 4) % ROW.length, rot);
          return (
            <g key={v}>
              <rect x={80 + pos * 64} y={100 - Math.sin(rot * Math.PI) * (i < 3 ? 24 : -24)} width={50} height={28} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
              <T x={105 + pos * 64} y={119 - Math.sin(rot * Math.PI) * (i < 3 ? 24 : -24)} s={12} a="middle" f={C.crema}>{v}</T>
            </g>
          );
        })}
      </g>
      <T x={300} y={180} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.1, 3.5))}>rotated and sorted matrices, next</T>
    </Svg>
  );
}
