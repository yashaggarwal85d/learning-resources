import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an outcome that happened; latte = secondary labels; taupe = not yet drawn;
// caramel = the thing to look at (the expectation line, the indicator that fired, the pair being judged); cinnamon
// (rare) = the alternative compared (the other derivation, the other curve); cherryText = the bad outcome (a pair split
// apart, never compared).
//
// Every printed number is examples.py's: the urn of 3 red and 2 blue and its 1.2; fixed points, n × 1/n = 1 at n = 10;
// quicksort's exact 24.44, 647.85 and 10,985.91 against 2n ln n = 13,816 at 1,000 keys; the coupon collector's 29.3 at
// 10 and 225.0 at 50. The 200 seeded quicksort runs and the 2,000 seeded coupon runs are drawn as histogram shapes only
// (binned from examples.py's runs); permutations and draws shown moving are illustrations and print nothing.

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
/** A fixed pseudo-random sequence for illustrations (never printed). */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const H = (n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1)).reduce((a, b) => a + b, 0);
const qsExpected = (n: number) => 2 * (n + 1) * H(n) - 4 * n;
const fmt2 = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// examples.py's 200 seeded runs at n = 1,000, binned by 200 comparisons from 9,500 (shape only).
const QS_BINS = [1, 3, 8, 12, 30, 22, 31, 18, 24, 14, 9, 6, 9, 6, 2, 1, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0];
const QS_LO = 9500, QS_W = 200;
// examples.py's 2,000 seeded coupon runs at n = 50, binned by 20 draws from 100 (shape only).
const CC_BINS = [14, 52, 151, 246, 307, 299, 247, 184, 161, 120, 64, 37, 45, 21, 12, 10, 15, 4, 3, 1, 4, 1, 1, 0, 0, 1, 0, 0, 0, 0];
const CC_LO = 100, CC_W = 20;

// 1 · Opening. Two hundred runs of randomized quicksort on the same thousand keys drop one by one into a histogram of
// comparison counts, each landing somewhere different; then one line, the exact expectation, 10,985.91, lands among them.
export function Opening({ t }: StepCtx) {
  const total = QS_BINS.reduce((a, b) => a + b, 0);
  const shown = Math.max(0, stepIdx(t, 0.2, 2.8, total) + 1);
  const X0 = 50, BW = 19, Y0 = 220, UH = 5;
  const fill: number[] = new Array(QS_BINS.length).fill(0);
  // Drop runs into bins in a fixed interleaved order, so the shape grows evenly.
  const order: number[] = [];
  const left = [...QS_BINS];
  while (order.length < total) for (let b = 0; b < left.length; b++) if (left[b]-- > 0) order.push(b);
  order.slice(0, shown).forEach((b) => fill[b]++);
  const line = easeOut(seg(t, 3.0, 3.4));
  const ex = X0 + ((qsExpected(1000) - QS_LO) / QS_W) * BW;
  return (
    <Svg label="Two hundred runs of randomized quicksort on the same thousand keys drop one by one into a histogram of comparison counts, each run landing somewhere different. Then one line, the exact expectation of 10,985.91 comparisons, lands among them" h={300}>
      <T x={X0} y={28} s={12} f={C.latte}>200 runs, same 1,000 keys: comparisons</T>
      <line x1={X0} y1={Y0} x2={X0 + QS_BINS.length * BW} y2={Y0} stroke={C.line} />
      {fill.map((n, b) => Array.from({ length: n }, (_, k) => <rect key={`${b}-${k}`} x={X0 + b * BW + 2} y={Y0 - (k + 1) * UH} width={BW - 4} height={UH - 1} fill={C.crema} />))}
      <g opacity={line}>
        <line x1={ex} y1={46} x2={ex} y2={Y0 + 6} stroke={C.caramel} strokeWidth={2.4} />
        <T x={ex + 8} y={60} s={13} f={C.caramel}>{`exact: ${fmt2(qsExpected(1000))}`}</T>
      </g>
      <T x={300} y={270} s={13} f={C.crema} a="middle" o={line}>one exact number, no recurrence</T>
    </Svg>
  );
}

// 2 · PredictGrowthOrder. Four candidate curves draw on log-log axes from n = 10 to 1,000: n log₂ n, 2n ln n, n²/4,
// n log₂ n + n. After answering: 2n ln n lights, the others dim.
const CURVES = [
  { name: 'n log₂ n', f: (n: number) => n * Math.log2(n) },
  { name: '2n ln n', f: (n: number) => 2 * n * Math.log(n) },
  { name: 'n²/4', f: (n: number) => (n * n) / 4 },
  { name: 'n log₂ n + n', f: (n: number) => n * Math.log2(n) + n },
];
export function PredictGrowthOrder({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X0 = 70, X1 = 420, Y0 = 240, Y1 = 30;
  const px = (n: number) => X0 + ((Math.log10(n) - 1) / 2) * (X1 - X0);
  const py = (v: number) => Y0 - ((Math.log10(v) - 1) / 4.5) * (Y0 - Y1);
  const pick = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="Four candidate curves draw on log-log axes from ten keys to a thousand: n log two n, two n ln n, n squared over four, and n log two n plus n. After answering: two n ln n lights and the others dim" h={300}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">keys, 10 to 1,000</T>
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">cost</T>
      {CURVES.map((c, i) => {
        const d = easeInOut(seg(t, 0.2 + i * 0.4, 0.8 + i * 0.4));
        const pts = Array.from({ length: 21 }, (_, k) => 10 * 100 ** (k / 20)).filter((n) => Math.log10(n) - 1 <= 2 * d + 1e-9);
        const hot = answered && i === 1;
        const col = hot ? C.caramel : answered ? C.mocha : C.latte;
        return (
          <g key={c.name}>
            <polyline points={pts.map((n) => `${px(n)},${py(c.f(n))}`).join(' ')} fill="none" stroke={col} strokeWidth={hot ? 3 : 1.6} />
            <T x={440} y={60 + i * 44} s={12} f={hot ? C.caramel : answered ? C.taupe : C.crema} o={d >= 1 ? 1 : 0}>{c.name}</T>
          </g>
        );
      })}
      {answered && <T x={440} y={250} s={12} f={C.caramel} o={pick}>shape; exact next</T>}
    </Svg>
  );
}

// 3 · LinearityUrn. An urn of three red and two blue. The first draw: red with 3/5. The second, without replacement,
// branches on the first: 2/4 after a red, 3/4 after a blue; together still 3/5. Expected reds: 3/5 + 3/5 = 1.2, the same
// as counting every ordered pair of draws.
export function LinearityUrn({ t }: StepCtx) {
  const balls = ['R', 'R', 'R', 'B', 'B'];
  const b1 = easeOut(seg(t, 0.4, 0.9));
  const br = easeOut(seg(t, 1.2, 1.8));
  const b2 = easeOut(seg(t, 2.1, 2.6));
  const tot = easeOut(seg(t, 3.2, 3.6));
  const col = (c: string) => (c === 'R' ? C.cherryText : C.cinnamon);
  return (
    <Svg label="An urn of three red balls and two blue. The first draw is red with three fifths. The second, without replacement, branches on the first: two quarters after a red, three quarters after a blue, and together still three fifths. Expected reds over two draws: three fifths plus three fifths, 1.2, the same as counting every ordered pair" h={300}>
      {balls.map((c, i) => <circle key={i} cx={60 + (i % 3) * 26} cy={60 + Math.floor(i / 3) * 26} r={10} fill={col(c)} opacity={0.85} />)}
      <path d="M40 40 L40 100 Q40 112 52 112 L120 112 Q132 112 132 100 L132 40" fill="none" stroke={C.latte} strokeWidth={1.4} />
      <g opacity={b1}>
        <T x={180} y={50} s={12} f={C.latte}>first draw red</T>
        <T x={180} y={74} s={14} f={C.crema}>3/5</T>
      </g>
      <g opacity={br}>
        <line x1={240} y1={78} x2={320} y2={54} stroke={C.cherryText} strokeWidth={1.4} />
        <line x1={240} y1={78} x2={320} y2={106} stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={330} y={58} s={12} f={C.latte}>after red: red 2/4</T>
        <T x={330} y={110} s={12} f={C.latte}>after blue: red 3/4</T>
      </g>
      <g opacity={b2}>
        <T x={180} y={160} s={12} f={C.latte}>second draw red, overall</T>
        <T x={180} y={184} s={14} f={C.crema}>3/5 · 2/4 + 2/5 · 3/4 = 3/5</T>
      </g>
      <T x={180} y={236} s={14} f={C.caramel} o={tot}>3/5 + 3/5 = 1.2 reds expected</T>
      <T x={180} y={262} s={12} f={C.latte} o={tot}>dependent draws, still additive</T>
    </Svg>
  );
}

// 4 · IndicatorVariable. One event, position 1 of a shuffled ten staying put: its indicator flickers 0 or 1 run after
// run, a strip of ticks; the bar of its average settles at the dashed line, Pr = 1/10. Then a count written as a sum of
// such indicators becomes a sum of probabilities.
export function IndicatorVariable({ t }: StepCtx) {
  const rnd = lcg(7);
  const runs = Array.from({ length: 60 }, () => (rnd() < 0.1 ? 1 : 0));
  const k = stepIdx(t, 0.2, 2.6, runs.length);
  const seen = runs.slice(0, k + 1);
  const avg = seen.length ? seen.reduce((a: number, b) => a + b, 0) / seen.length : 0;
  const cap = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="One event, the first position of a shuffled ten staying put. Its indicator reads one or zero, run after run, a strip of ticks; the bar of its average settles at the dashed line, the event's probability, one tenth. A count written as a sum of such indicators becomes a sum of probabilities" h={300}>
      <T x={40} y={30} s={12} f={C.latte}>I = 1 if position 1 stays put, else 0</T>
      {seen.map((v, i) => <line key={i} x1={40 + i * 8} y1={110} x2={40 + i * 8} y2={110 - (v ? 50 : 6)} stroke={v ? C.caramel : C.taupe} strokeWidth={3} />)}
      <line x1={40} y1={110} x2={520} y2={110} stroke={C.line} />
      <rect x={40} y={150} width={400 * avg * 5 > 480 ? 480 : 400 * avg * 5} height={18} fill={C.crema} opacity={k >= 0 ? 0.8 : 0} />
      <line x1={40 + 400 * 0.5} y1={142} x2={40 + 400 * 0.5} y2={176} stroke={C.caramel} strokeDasharray="4 3" strokeWidth={2} />
      <T x={40 + 400 * 0.5 + 8} y={196} s={12} f={C.caramel}>average → Pr = 1/10</T>
      <T x={300} y={252} s={13} f={C.crema} a="middle" o={cap}>a count = I₁ + I₂ + … : add the probabilities</T>
    </Svg>
  );
}

// 5 · FixedPointsReveal. Ten positions and a shuffle drawn as arrows from each spot to where it lands; shuffle after
// shuffle, the spots that stay put light. Ten indicators, each 1/10, add to exactly 1, whatever their dependence.
export function FixedPointsReveal({ t }: StepCtx) {
  const n = 10;
  const shuffles = Array.from({ length: 4 }, (_, k) => {
    const r = lcg(31 + k * 7);
    const p = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  });
  const k = stepIdx(t, 0.3, 2.7, shuffles.length);
  const p = k >= 0 ? shuffles[k] : null;
  const sx = (i: number) => 60 + i * 50;
  const sum = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="Ten positions, and a shuffle drawn as arrows from each spot to where its item lands. Shuffle after shuffle, the spots whose item stays put light. Ten indicators, each one tenth, add to exactly one fixed point on average, whatever their dependence" h={300}>
      {Array.from({ length: n }, (_, i) => {
        const fixed = p && p[i] === i;
        return (
          <g key={i}>
            <rect x={sx(i) - 16} y={40} width={32} height={26} rx={3} fill={fixed ? C.caramel : C.band} stroke={C.latte} />
            <rect x={sx(i) - 16} y={130} width={32} height={26} rx={3} fill={fixed ? C.caramel : C.band} stroke={C.latte} />
            {p && <line x1={sx(i)} y1={68} x2={sx(p[i])} y2={128} stroke={fixed ? C.caramel : C.taupe} strokeWidth={fixed ? 2.4 : 1} />}
            <T x={sx(i)} y={190} s={12} f={C.latte} a="middle" o={sum}>1/10</T>
          </g>
        );
      })}
      <T x={300} y={240} s={14} f={C.caramel} a="middle" o={sum}>10 × 1/10 = 1 fixed point, on average</T>
      <T x={300} y={268} s={12} f={C.latte} a="middle" o={sum}>n × 1/n = 1, for every n</T>
    </Svg>
  );
}

// 6 · QuicksortPairSetup. Ten keys in rank order; the pair ranked 3 and 8 is marked, with four keys between them. A
// first run picks its first pivot among them in the middle: the pair is split, never compared (red). A second run's
// first pivot lands on one of the pair: they are compared. Chance: 2 of the 6 keys from 3 to 8, 2/6.
export function QuicksortPairSetup({ t }: StepCtx) {
  const I = 3, J = 8;
  const kx = (r: number) => 60 + (r - 1) * 52;
  const mark = easeOut(seg(t, 0.2, 0.6));
  const run1 = t >= 0.9 && t < 2.3;
  const run2 = t >= 2.3;
  const p1 = 5, p2 = 8;
  const piv = run1 ? p1 : run2 ? p2 : -1;
  const drop = run1 ? easeOut(seg(t, 0.9, 1.3)) : run2 ? easeOut(seg(t, 2.3, 2.7)) : 0;
  const verdict = run1 ? t >= 1.5 : run2 ? t >= 2.9 : false;
  const prob = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="Ten keys in rank order; the pair ranked three and eight is marked, with four keys between them. A first run's first pivot among them lands in the middle: the pair is split apart and never compared, in red. A second run's first pivot lands on one of the pair: they are compared. The chance is two of the six keys from three to eight, two sixths" h={300}>
      <rect x={kx(I) - 20} y={100} width={kx(J) - kx(I) + 40} height={50} rx={6} fill={C.caramel} opacity={0.05 * mark} stroke={C.mocha} />
      {Array.from({ length: 10 }, (_, i) => {
        const r = i + 1;
        const end = r === I || r === J;
        return (
          <g key={r}>
            <circle cx={kx(r)} cy={125} r={14} fill={C.band} stroke={end ? C.caramel : C.latte} strokeWidth={end ? 2.4 : 1.4} />
            <T x={kx(r)} y={130} s={12} f={end ? C.caramel : C.crema} a="middle">{String(r)}</T>
          </g>
        );
      })}
      {piv > 0 && <path d={`M${kx(piv)} ${lerp(40, 92, drop)} l-8 -12 l16 0 Z`} fill={run1 ? C.cherryText : C.caramel} />}
      {verdict && run1 && <path d={`M${kx(I)} 160 Q${kx(p1)} 200 ${kx(J)} 160`} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" />}
      {verdict && run2 && <path d={`M${kx(I)} 160 Q${(kx(I) + kx(J)) / 2} 200 ${kx(J)} 160`} fill="none" stroke={C.caramel} strokeWidth={2.4} />}
      {run1 && verdict && <T x={300} y={236} s={13} f={C.cherryText} a="middle">first pivot between them: never compared</T>}
      {run2 && verdict && prob <= 0 && <T x={300} y={236} s={13} f={C.caramel} a="middle">first pivot is one of them: compared</T>}
      {prob > 0 && <T x={300} y={236} s={14} f={C.caramel} a="middle" o={prob}>{`Pr = 2/(${J} − ${I} + 1) = 2/${J - I + 1}`}</T>}
    </Svg>
  );
}

// 7 · QuicksortSumReveal. The triangle of every pair of ten ranks, each cell's shade its chance 2/(gap + 1); the cells
// fill and add to 24.44. Then a thousand keys: the exact 10,985.91 bar beside 2n ln n's 13,816.
export function QuicksortSumReveal({ t }: StepCtx) {
  const n = 10, cell = 20, X0 = 40, Y0 = 30;
  const cells: [number, number][] = [];
  for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) cells.push([i, j]);
  const k = stepIdx(t, 0.2, 2.0, cells.length);
  const sum10 = t >= 2.1;
  const bars = easeOut(seg(t, 2.7, 3.5));
  const W = 260, max = 14000;
  return (
    <Svg label="The triangle of every pair among ten ranks, each cell shaded by its chance, two over the gap plus one; the cells fill and add to 24.44 comparisons. Then a thousand keys: the exact 10,985.91 beside two n ln n, 13,816" h={300}>
      {cells.map(([i, j], c) => (c <= k ? <rect key={c} x={X0 + (j - 2) * cell} y={Y0 + (i - 1) * cell} width={cell - 2} height={cell - 2} fill={C.caramel} opacity={2 / (j - i + 1)} /> : null))}
      <T x={X0} y={236} s={13} f={C.caramel} o={sum10 ? 1 : 0}>{`10 keys: ${fmt2(qsExpected(10))}`}</T>
      <g opacity={bars}>
        <T x={290} y={60} s={12} f={C.latte}>1,000 keys</T>
        <rect x={290} y={76} width={(qsExpected(1000) / max) * W * bars} height={20} fill={C.caramel} />
        <T x={290} y={116} s={13} f={C.caramel}>{`exact ${fmt2(qsExpected(1000))}`}</T>
        <rect x={290} y={136} width={((2 * 1000 * Math.log(1000)) / max) * W * bars} height={20} fill={C.cinnamon} />
        <T x={290} y={176} s={13} f={C.cinnamon}>{`2n ln n ${Math.round(2 * 1000 * Math.log(1000)).toLocaleString('en-US')}`}</T>
      </g>
      <T x={300} y={270} s={13} f={C.crema} a="middle" o={bars}>the shape, with an exact correction</T>
    </Svg>
  );
}

// 8 · SecondDerivation. Left, a recurrence unrolls into a tree of smaller sorts (blue); right, the pair triangle fills
// (white). Both arrows run down into the same number: 647.85 at a hundred keys.
export function SecondDerivation({ t }: StepCtx) {
  const lv = stepIdx(t, 0.2, 1.8, 4);
  const tri = seg(t, 0.2, 1.8);
  const meet = easeOut(seg(t, 2.1, 2.7));
  const cap = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="Left, a recurrence unrolls into a tree of smaller sorts, in blue. Right, the triangle of pair probabilities fills, in white. Both arrows run down into the same number, 647.85 comparisons at a hundred keys" h={300}>
      <T x={150} y={26} s={12} f={C.cinnamon} a="middle">a recurrence</T>
      {Array.from({ length: 4 }, (_, d) => (d <= lv ? Array.from({ length: 2 ** d }, (_, i) => {
        const w = 200 / 2 ** d;
        return <rect key={`${d}-${i}`} x={50 + i * w + 2} y={40 + d * 28} width={w - 4} height={18} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />;
      }) : null))}
      <T x={450} y={26} s={12} f={C.caramel} a="middle">a chance per pair</T>
      {Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 - i }, (_, j) => {
        const c = (i * 6 + j) / 21;
        return c <= tri * 1.75 ? <rect key={`${i}-${j}`} x={380 + (i + j) * 22} y={40 + i * 22} width={20} height={20} fill={C.caramel} opacity={2 / (j + 2)} /> : null;
      }))}
      <g opacity={meet}>
        <path d="M150 160 Q180 205 250 212" fill="none" stroke={C.cinnamon} strokeWidth={1.8} />
        <path d="M450 180 Q430 210 350 212" fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={300} y={216} s={14} f={C.crema} a="middle">{fmt2(qsExpected(100))}</T>
      </g>
      <T x={300} y={262} s={13} f={C.crema} a="middle" o={cap}>100 keys, two routes, one number</T>
    </Svg>
  );
}

// 9 · CouponCollectorReveal. Ten coupons; draws arrive and each new one lights. Each phase, waiting for the next unseen
// coupon, stacks as a bar of its expected length, 10/10, 10/9, …, 10/1; the bars add to 10 × H₁₀ = 29.3.
export function CouponCollectorReveal({ t }: StepCtx) {
  const n = 10;
  const r = lcg(12);
  const draws: number[] = [];
  const seen = new Set<number>();
  while (seen.size < n) {
    const d = Math.floor(r() * n);
    draws.push(d);
    seen.add(d);
  }
  const k = stepIdx(t, 0.2, 2.6, draws.length);
  const got = new Set(draws.slice(0, k + 1));
  const phases = Array.from({ length: n }, (_, i) => n / (n - i));
  const ph = stepIdx(t, 0.4, 3.0, n);
  const sc = 15;
  let acc = 0;
  const cap = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="Ten coupons; draws arrive and each new coupon lights as it is first seen. Each phase, the wait for the next unseen coupon, stacks as a bar of its expected length, ten tenths, ten ninths, up to ten over one; together 10 times the tenth harmonic number, 29.3 draws" h={300}>
      {Array.from({ length: n }, (_, i) => <rect key={i} x={50 + i * 50} y={30} width={36} height={24} rx={3} fill={got.has(i) ? C.crema : C.band} stroke={k >= 0 && draws[k] === i ? C.caramel : C.latte} strokeWidth={k >= 0 && draws[k] === i ? 2.4 : 1} />)}
      <T x={50} y={84} s={12} f={C.latte}>wait per phase</T>
      {phases.map((w, i) => {
        const x = 50 + acc * sc;
        acc += w;
        return i <= ph ? <rect key={i} x={x} y={96 + (i % 2) * 4} width={w * sc - 2} height={22} fill={i % 2 ? C.caramel : C.crema} opacity={0.85} /> : null;
      })}
      <T x={50} y={152} s={12} f={C.latte} o={ph >= 0 ? 1 : 0}>later phases wait longer</T>
      <T x={300} y={220} s={14} f={C.caramel} a="middle" o={cap}>{`10 × H₁₀ = ${(10 * H(10)).toFixed(1)} draws`}</T>
    </Svg>
  );
}

// 10 · WhatLinearityLacks. Two thousand coupon runs at fifty coupons as a histogram, one line at the mean, 225.0. Then a
// few single runs light far from it on either side: the average says nothing about them.
export function WhatLinearityLacks({ t }: StepCtx) {
  const X0 = 40, BW = 17, Y0 = 220, max = Math.max(...CC_BINS);
  const grow = easeOut(seg(t, 0.2, 1.2));
  const line = easeOut(seg(t, 1.4, 1.8));
  const picks = [1, 4, 13, 19];
  const pk = stepIdx(t, 2.1, 3.3, picks.length);
  const mean = 50 * H(50);
  const mx = X0 + ((mean - CC_LO) / CC_W) * BW;
  return (
    <Svg label="Two thousand coupon runs at fifty coupons as a histogram, and one line at the mean, 225 draws. Then single runs light far from it on either side: the average promises nothing about any one of them" h={300}>
      <line x1={X0} y1={Y0} x2={X0 + CC_BINS.length * BW} y2={Y0} stroke={C.line} />
      {CC_BINS.map((c, b) => <rect key={b} x={X0 + b * BW + 1} y={Y0 - (c / max) * 150 * grow} width={BW - 2} height={(c / max) * 150 * grow} fill={picks.slice(0, pk + 1).includes(b) ? C.cherryText : C.crema} opacity={0.8} />)}
      <g opacity={line}>
        <line x1={mx} y1={40} x2={mx} y2={Y0 + 6} stroke={C.caramel} strokeWidth={2.4} />
        <T x={mx + 8} y={52} s={13} f={C.caramel}>{`mean ${mean.toFixed(1)}`}</T>
      </g>
      <T x={X0} y={250} s={12} f={C.latte}>2,000 runs, 50 coupons: draws</T>
      <T x={300} y={280} s={13} f={C.cherryText} a="middle" o={pk >= 0 ? 1 : 0}>one run can land anywhere</T>
    </Svg>
  );
}

// 11 · Recap. Three counts, each broken into indicators that light and add: ten positions to 1; the pair triangle to
// 24.44; ten coupon phases to 29.3.
export function Recap({ t }: StepCtx) {
  const a = stepIdx(t, 0.2, 1.2, 10);
  const b = stepIdx(t, 1.3, 2.3, 45);
  const c = stepIdx(t, 2.4, 3.4, 10);
  const cap = easeOut(seg(t, 3.6, 4.0));
  const tri: [number, number][] = [];
  for (let i = 1; i <= 10; i++) for (let j = i + 1; j <= 10; j++) tri.push([i, j]);
  return (
    <Svg label="Three counts, each broken into indicators that light and add: ten positions to one fixed point; the triangle of pairs to 24.44 comparisons; ten coupon phases to 29.3 draws. Linearity, every time, dependence or not" h={300}>
      <T x={30} y={30} s={12} f={C.latte}>fixed points</T>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={30 + (i % 5) * 26} y={44 + Math.floor(i / 5) * 26} width={22} height={22} fill={i <= a ? C.caramel : C.band} opacity={i <= a ? 0.3 : 1} stroke={C.latte} />)}
      <T x={30} y={130} s={14} f={C.caramel} o={a >= 9 ? 1 : 0}>1</T>
      <T x={220} y={30} s={12} f={C.latte}>comparisons</T>
      {tri.map(([i, j], k) => <rect key={k} x={220 + (j - 2) * 15} y={44 + (i - 1) * 15} width={13} height={13} fill={C.caramel} opacity={k <= b ? 2 / (j - i + 1) : 0.05} />)}
      <T x={220} y={200} s={14} f={C.caramel} o={b >= 44 ? 1 : 0}>{fmt2(qsExpected(10))}</T>
      <T x={400} y={30} s={12} f={C.latte}>coupon draws</T>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={400} y={44 + i * 14} width={(10 / (10 - i)) * 15} height={11} fill={i <= c ? C.crema : C.band} stroke={C.mocha} />)}
      <T x={400} y={200} s={14} f={C.caramel} o={c >= 9 ? 1 : 0}>{(10 * H(10)).toFixed(1)}</T>
      <T x={300} y={262} s={13} f={C.crema} a="middle" o={cap}>indicators, then linearity, every time</T>
    </Svg>
  );
}
