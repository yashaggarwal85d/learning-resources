import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, seg } from '../../../../../reels/anim';
import { Bar, C, SERIF, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py.

/** Seconds since the learner answered a predict step (the player's clock is already finished by then), so reveals can animate. */
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

/** A notation letter set in the serif inside a mono line, so Θ never reads as 0. */
const G = ({ children }: { children: string }) => <tspan fontFamily={SERIF}>{children}</tspan>;
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '' };
/** 2.0e-5 → 2×10⁻⁵ */
const sci = (v: number) => {
  const [m, e] = v.toExponential(1).split('e');
  return `${m.replace(/\.0$/, '')}×10${[...e].map((c) => SUP[c]).join('')}`;
};

// 1 · The three questions every cost claim answers, drawn from the claim itself.
export function Opening({ t }: StepCtx) {
  const rows = [
    ['Which bound?', 'O, Ω, Θ, o, ω', 'how the function relates'],
    ['Which case?', 'best, worst, average, expected', 'which function we bound'],
    ['Which resource?', 'time, space', 'what is being counted'],
  ];
  const claim = easeOut(seg(t, 0, 0.4));
  return (
    <Svg label="The claim quicksort is O of n log n hides three questions: which bound, which case, which resource" h={400}>
      <T x={30} y={36} s={22} f={C.caramel} serif w={700} o={claim}>“quicksort is O(n log n)”</T>
      {rows.map(([q, v, d], i) => {
        const a = easeOut(seg(t, 0.4 + i * 0.4, 1.0 + i * 0.4));
        const y = 64 + i * 110;
        return (
          <g key={q} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <line x1={14} y1={46} x2={14} y2={y + 49} stroke={C.mocha} strokeWidth={2} />
            <line x1={14} y1={y + 49} x2={30} y2={y + 49} stroke={C.mocha} strokeWidth={2} />
            <rect x={30} y={y} width={540} height={98} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={52} y={y + 30} s={17} f={C.caramel} w={700}>{q}</T>
            <T x={52} y={y + 56} s={14} f={C.crema} w={600}>{v}</T>
            <T x={52} y={y + 80} s={13} f={C.latte}>{d}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Θ as a sandwich with witnesses c1, c2, n0: plot f(n) / n² against the band [3, 4].
export function Sandwich({ t }: StepCtx) {
  const r = (n: number) => 3 + 10 / n; // (3n² + 10n) / n²
  const N = 16, N1 = 2, X0 = 50, W = 500, Y0 = 330, H = 270, R0 = 2, R1 = 8;
  const px = (n: number) => X0 + (n / N) * W;
  const py = (v: number) => Y0 - ((v - R0) / (R1 - R0)) * H;
  const sweep = N1 + easeInOut(seg(t, 0.4, 3.4)) * (N - N1);
  const n0 = 10;
  const ok = sweep >= n0;
  const trace = (a: number, b: number) => {
    const pts: string[] = [];
    for (let n = a; n <= Math.min(b, sweep) + 1e-9; n += 0.25) pts.push(`${pts.length ? 'L' : 'M'}${px(n).toFixed(1)} ${py(r(n)).toFixed(1)}`);
    return pts.join(' ');
  };
  const at9 = easeOut(seg(sweep, 8.6, 9.4));
  return (
    <Svg label="The ratio (3n squared plus 10n) over n squared sits above 4 for n below 10 and stays between 3 and 4 from n equals 10 onward" h={380}>
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.mocha} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 10} stroke={C.mocha} />
      <rect x={X0} y={py(4)} width={W} height={py(3) - py(4)} fill={C.cocoa} />
      <line x1={X0} y1={py(4)} x2={X0 + W} y2={py(4)} stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
      <line x1={X0} y1={py(3)} x2={X0 + W} y2={py(3)} stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
      <T x={530} y={py(4) - 8} s={13} f={C.latte} a="end">4n² / n²  (c₂ = 4)</T>
      <T x={530} y={py(3) + 20} s={13} f={C.latte} a="end">3n² / n²  (c₁ = 3)</T>
      <line x1={px(n0)} y1={Y0} x2={px(n0)} y2={Y0 - H} stroke={C.cinnamon} strokeDasharray="3 5" opacity={ok ? 1 : 0.35} />
      <path d={trace(N1, n0)} stroke={C.cherryText} strokeWidth={3.5} fill="none" />
      <path d={trace(n0, N)} stroke={C.caramel} strokeWidth={3.5} fill="none" />
      <T x={170} y={96} s={13} f={C.caramel} w={700}>(3n² + 10n) / n²</T>
      <circle cx={px(9)} cy={py(r(9))} r={5} fill={C.cherryText} opacity={at9} />
      <line x1={px(9) + 3} y1={py(r(9)) - 6} x2={px(n0) + 16} y2={126} stroke={C.cherryText} strokeWidth={1.5} opacity={at9} />
      <T x={px(n0) + 14} y={100} s={13} f={C.cherryText} o={at9}>n = 9: 333 &gt; 324</T>
      <T x={px(n0) + 14} y={118} s={13} f={C.cherryText} o={at9}>still above 4n²</T>
      <T x={px(n0)} y={Y0 + 22} s={14} f={ok ? C.caramel : C.taupe} a="middle" w={700}>n₀ = 10</T>
      <T x={X0} y={Y0 + 22} s={13} f={C.taupe}>n</T>
      <T x={30} y={30} s={14} f={ok ? C.crema : C.taupe} w={600}>{ok ? <>from n₀ on, always between: <G>Θ</G>(n²)</> : 'below n₀ the curve is still above 4'}</T>
    </Svg>
  );
}

// 3 · 2^(n+1) versus 2^(2n): a constant ratio or a growing one, on one log axis (bar height = log₂ of the ratio).
export function PowerRatios({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const ns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const U = 13; // units per doubling
  return (
    <Svg label="2 to the n plus 1 over 2 to the n is always 2; 4 to the n over 2 to the n doubles with every n; bars drawn on a log scale" h={340}>
      <T x={30} y={34} s={13} f={C.taupe}>BAR HEIGHT = LOG₂ OF THE RATIO</T>
      <T x={30} y={78} s={14} f={C.crema} w={600}>2ⁿ⁺¹ / 2ⁿ</T>
      {ns.map((n, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1));
        return <rect key={n} x={170 + i * 40} y={80 - U * a} width={30} height={U * a} rx={4} fill={C.caramel} />;
      })}
      <line x1={165} y1={80} x2={575} y2={80} stroke={C.mocha} />
      <T x={575} y={106} s={13} f={C.caramel} a="end">always 2</T>
      <T x={30} y={246} s={14} f={C.crema} w={600}>2²ⁿ / 2ⁿ</T>
      {ns.map((n, i) => {
        const a = shown ? easeOut(seg(s, i * 0.08, 0.3 + i * 0.08)) : 0;
        const hgt = U * n * a;
        return <rect key={n} x={170 + i * 40} y={252 - hgt} width={30} height={hgt} rx={4} fill={C.cherry} />;
      })}
      {shown ? <T x={575} y={282} s={13} f={C.latte} a="end" o={easeOut(seg(s, 0.8, 1.2))}>= 2ⁿ, no constant c holds</T> : <T x={170} y={200} s={16} f={C.taupe}>your call: bounded, or growing?</T>}
      <line x1={165} y1={252} x2={575} y2={252} stroke={C.mocha} />
    </Svg>
  );
}

// 4 · o and ω: read the ratio.
export function Ratios({ t }: StepCtx) {
  const rows: [string, string, (n: number) => number, string][] = [
    ['n log n  vs  n²', 'o', (n) => (n * Math.log2(n)) / (n * n), 'ratio → 0: little-o'],
    ['3n² + 10n  vs  n²', 'Θ', (n) => (3 * n * n + 10 * n) / (n * n), 'ratio → 3: Theta, not little-o'],
    ['n²  vs  n log n', 'ω', (n) => (n * n) / (n * Math.log2(n)), 'ratio → ∞: little-omega'],
  ];
  const ns = [10, 1000, 1000000];
  const heads = ['n = 10', 'n = 10³', 'n = 10⁶'];
  return (
    <Svg label="The ratio of f to g as n grows: toward zero is little-o, toward a constant is theta, toward infinity is little-omega" h={400}>
      <T x={30} y={30} s={13} f={C.taupe}>f(n) / g(n)</T>
      {heads.map((h, j) => <T key={h} x={50 + j * 112} y={54} s={13} f={C.taupe}>{h}</T>)}
      {rows.map(([lab, sym, g, verdict], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.6, 0.8 + i * 0.6));
        const y = 68 + i * 108;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={92} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 30} s={16} f={C.crema} w={600}>{lab}</T>
            <T x={550} y={y + 34} s={30} f={C.caramel} a="end" serif w={800}>{sym}</T>
            {ns.map((n, j) => {
              const v = g(n);
              return <T key={n} x={50 + j * 112} y={y + 60} s={14} f={C.latte}>{v < 0.001 || v >= 1000 ? sci(v) : v.toFixed(v < 1 ? 4 : 2)}</T>;
            })}
            <T x={50} y={y + 82} s={13} f={C.caramel}>{verdict}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Bound type and case are independent axes. Insertion sort, n = 8, comparisons.
export function CaseGrid({ t }: StepCtx) {
  const rows: [string, number, string, string][] = [
    ['best  (sorted)', 7, 'n − 1', 'Θ(n)'],
    ['average (random)', 19.3, 'n(n−1)/4+n−Hₙ', 'Θ(n²)'],
    ['worst (reversed)', 28, 'n(n−1)/2', 'Θ(n²)'],
  ];
  return (
    <Svg label="Insertion sort on 8 items: 7 comparisons best case, about 19.3 on average, 28 worst case" h={380}>
      <T x={30} y={34} s={13} f={C.taupe}>INSERTION SORT, n = 8, COMPARISONS COUNTED</T>
      {rows.map(([lab, v, form, th], i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.7, 1.3 + i * 0.7));
        const y = 62 + i * 92;
        return (
          <g key={lab}>
            <T x={30} y={y + 16} s={15} f={C.crema} w={600}>{lab}</T>
            <Bar x={30} y={y + 28} w={(v / 28) * 360 * a} h={30} full={360} fill={i === 0 ? C.caramel : C.cherry} />
            <T x={400} y={y + 50} s={15} f={C.crema} w={700}>{(v * a).toFixed(v % 1 ? 1 : 0)}</T>
            <T x={570} y={y + 40} s={20} f={C.caramel} a="end" w={800} o={a}>{th}</T>
            <T x={570} y={y + 68} s={13} f={C.latte} a="end" o={a}>{form}</T>
          </g>
        );
      })}
      <T x={30} y={350} s={13} f={C.latte} o={easeOut(seg(t, 3, 3.6))}>each row is its own function, with its own O, Ω, Θ</T>
    </Svg>
  );
}

// 6 · Expected versus average: quicksort on sorted input, n = 1000.
export function PivotChoice({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a = easeOut(seg(t, 0.2, 1.4));
  const b = shown ? easeOut(seg(s, 0, 0.7)) : 0;
  const w2 = (540 * 10986) / 499500;
  return (
    <Svg label="Quicksort on 1000 sorted keys: 499,500 comparisons with a fixed first pivot, about 10,986 with a random pivot" h={330}>
      {!portrait && <T x={30} y={34} s={13} f={C.taupe}>QUICKSORT, 1,000 KEYS ALREADY IN ORDER</T>}
      <T x={30} y={84} s={15} f={C.crema} w={600}>first element as pivot, this input</T>
      <Bar x={30} y={96} w={540 * a} h={34} full={540} fill={C.cherry} />
      <T x={560} y={119} s={15} f={C.crema} a="end" w={700}>{Math.round(499500 * a).toLocaleString('en-US')}</T>
      <T x={30} y={184} s={15} f={C.crema} w={600}>random pivot, any input order</T>
      <Bar x={30} y={196} w={w2 * b} h={34} full={540} fill={C.caramel} />
      {shown ? <T x={30 + w2 + 12} y={219} s={15} f={C.crema} w={700} o={easeOut(seg(s, 0.4, 0.7))}>10,986 expected</T> : <T x={44} y={219} s={15} f={C.taupe}>?</T>}
      <T x={30} y={278} s={13} f={C.latte}>the coins are the algorithm's:</T>
      <T x={30} y={298} s={13} f={C.latte}>no input is bad, only an unlucky run</T>
    </Svg>
  );
}

// 7 · Expected is not a guarantee: the spread of 2,000 seeded runs.
const HIST = [55, 1086, 704, 139, 13, 2, 1, 0];
export function Spread({ t }: StepCtx) {
  const max = 1086;
  const bx = (v: number) => 40 + ((v - 9000) / 1000) * 66; // comparisons → x
  const capX = bx(14000) - 6;
  const capA = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="Comparisons in 2,000 randomized quicksort runs: tightly bunched around the mean 10,991, three runs past 14,000, the slowest 15,583" h={380}>
      <T x={30} y={34} s={13} f={C.taupe}>2,000 RUNS · COMPARISONS · BUCKETS OF 1,000</T>
      {HIST.map((h, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.2, 0.9 + i * 0.2));
        const hh = h > 0 ? Math.max((h / max) * 200, 9) * a : 0;
        return (
          <g key={i}>
            <rect x={40 + i * 66} y={270 - hh} width={54} height={hh} rx={5} fill={i >= 5 ? C.cherry : C.caramel} />
            <T x={67 + i * 66} y={292} s={13} f={C.latte} a="middle">{9 + i}k</T>
            {h > 0 && <T x={67 + i * 66} y={262 - hh} s={13} f={i >= 5 ? C.cherryText : C.crema} a="middle" o={a}>{h}</T>}
          </g>
        );
      })}
      <line x1={bx(10991)} y1={270} x2={bx(10991)} y2={50} stroke={C.crema} strokeWidth={1.5} strokeDasharray="3 4" opacity={easeOut(seg(t, 1.8, 2.2))} />
      <T x={bx(10991) + 8} y={56} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>mean 10,991</T>
      <line x1={capX} y1={270} x2={capX} y2={78} stroke={C.cinnamon} strokeWidth={2} strokeDasharray="6 5" opacity={capA} />
      <T x={capX + 8} y={92} s={13} f={C.latte} o={capA}>w.h.p. cap (example)</T>
      <T x={capX + 8} y={110} s={13} f={C.cherryText} o={capA}>3 runs beyond it</T>
      <T x={40} y={334} s={14} f={C.crema} w={600} o={easeOut(seg(t, 2.2, 2.8))}>mean 10,991 · fastest 9,449 · slowest 15,583</T>
      <T x={40} y={358} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.4))}>a thin tail here; only a w.h.p. bound promises one</T>
    </Svg>
  );
}

// 8 · Time versus space: duplicate detection among 1,000 distinct numbers.
export function TimeSpace({ t }: StepCtx) {
  const rows: [string, string, string, string][] = [
    ['compare every pair', '499,500', '0', 'time n²'],
    ['heapsort in place, scan', '17,830', '0', 'time n log n'],
    ['hash set', '1,000', '1,000', 'expected time n'],
  ];
  return (
    <Svg label="Finding a duplicate among 1000 distinct numbers: pairs 499,500 comparisons and no extra storage; heapsort 17,830 and none; hash set 1,000 lookups and 1,000 stored values" h={380}>
      <T x={30} y={34} s={13} f={C.taupe}>1,000 DISTINCT NUMBERS: NO DUPLICATE (WORST CASE)</T>
      <T x={420} y={64} s={13} f={C.taupe} a="end">STEPS</T>
      <T x={550} y={64} s={13} f={C.taupe} a="end">EXTRA VALUES</T>
      {rows.map(([lab, steps, extra, th], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.7, 0.9 + i * 0.7));
        const y = 74 + i * 92;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={82} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 30} s={15} f={C.crema} w={600}>{lab}</T>
            <T x={50} y={y + 62} s={13} f={C.caramel}>{th}</T>
            <T x={420} y={y + 60} s={20} f={C.crema} a="end" w={700}>{steps}</T>
            <T x={550} y={y + 60} s={20} f={extra === '0' ? C.caramel : C.cherryText} a="end" w={700}>{extra}</T>
          </g>
        );
      })}
      <T x={30} y={368} s={13} f={C.latte} o={easeOut(seg(t, 3, 3.6))}>time bought with space: name both resources</T>
    </Svg>
  );
}

// 9 · The constant hides inside the O: 100n against n².
export function Crossover({ t }: StepCtx) {
  const N = 140, X0 = 50, W = 510, Y0 = 320, H = 260;
  const px = (n: number) => X0 + (n / N) * W;
  const py = (v: number) => Y0 - (Math.min(v, 20000) / 20000) * H;
  const sweep = easeInOut(seg(t, 0.3, 3.2)) * N;
  const line = (g: (n: number) => number) => {
    const pts: string[] = [];
    for (let n = 0; n <= sweep; n += 1) pts.push(`${pts.length ? 'L' : 'M'}${px(n).toFixed(1)} ${py(g(n)).toFixed(1)}`);
    return pts.join(' ');
  };
  const after = sweep >= 100;
  return (
    <Svg label="The line 100n is above n squared until n equals 100, then below it" h={380}>
      <rect x={px(0)} y={Y0 - H} width={px(100) - px(0)} height={H} fill={C.cocoa} opacity={0.55} />
      <rect x={px(100)} y={Y0 - H} width={px(N) - px(100)} height={H} fill={C.mocha} opacity={0.22} />
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.mocha} />
      <path d={line((n) => 100 * n)} stroke={C.caramel} strokeWidth={3.5} fill="none" />
      <path d={line((n) => n * n)} stroke={C.cherry} strokeWidth={3.5} fill="none" />
      <T x={px(40) - 8} y={py(4000) - 14} s={14} f={C.caramel} w={700} a="end">100n</T>
      <T x={px(128)} y={py(16384) - 8} s={14} f={C.cherryText} w={700} a="end" o={sweep >= 128 ? 1 : 0}>n²</T>
      <line x1={px(100)} y1={Y0} x2={px(100)} y2={Y0 - H} stroke={C.cinnamon} strokeDasharray="3 5" opacity={after ? 1 : 0.3} />
      <T x={px(50)} y={Y0 - H + 28} s={13} f={C.latte} a="middle" o={sweep >= 40 ? 1 : 0}>n² cheaper here</T>
      <T x={px(100) + 12} y={Y0 - 12} s={13} f={C.latte} o={after ? 1 : 0}>100n cheaper here</T>
      <T x={px(100)} y={Y0 + 24} s={14} f={after ? C.caramel : C.taupe} a="middle" w={700}>n = 100</T>
      <T x={30} y={30} s={14} f={C.crema} w={600}>{after ? 'past n = 100, 100n is the cheaper one' : 'below n = 100 the “worse” n² is cheaper'}</T>
    </Svg>
  );
}

// 10 · Size is bits, not value.
export function BitsNotValue({ t }: StepCtx) {
  const rows: [string, string, string, number][] = [
    ['a 32-bit prime', '65,534', 'trial divisions to prove it prime', 32],
    ['a 64-bit prime', '4 billion+', 'the input only doubled in size', 64],
  ];
  return (
    <Svg label="Trial division on a 32-bit prime takes 65,534 steps; on a 64-bit prime over four billion: polynomial in the value, exponential in the bits" h={340}>
      <T x={30} y={34} s={13} f={C.taupe}>PRIMALITY BY TRIAL DIVISION · O(√v) IN THE VALUE v</T>
      {rows.map(([lab, v, d, bits], i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.9, 1.1 + i * 0.9));
        const y = 50 + i * 120;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={108} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 28} s={16} f={C.crema} w={600}>{lab}</T>
            {Array.from({ length: bits }, (_, k) => (
              <rect key={k} x={50 + k * 4.6} y={y + 40} width={3.6} height={12} rx={1} fill={(k * 5 + 3) % 7 < 3 ? C.latte : C.mocha} />
            ))}
            <T x={50} y={y + 82} s={13} f={C.latte}>{d}</T>
            {i ? <T x={550} y={y + 66} s={26} f={C.cherryText} a="end" serif w={800}>{v}</T> : <T x={550} y={y + 66} s={20} f={C.caramel} a="end" w={700}>{v}</T>}
          </g>
        );
      })}
      <T x={30} y={322} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 3))}>32 more bits of input: about 65,536 times the steps</T>
    </Svg>
  );
}

// 11 · The ladder at one million items. Bar length is time on a log scale, from 1 ns to 585 years.
export function Ladder({ t }: StepCtx) {
  const YEAR = 3600 * 24 * 365;
  const rows: [string, string, string, number][] = [
    ['log n', '19.9 steps', '20 ns', 19.9e-9],
    ['n log n', '20 million steps', '0.02 s', 0.02],
    ['n²', '1 trillion steps', '16.7 min', 1000],
    ['2ⁿ at n = 64', '1.8 × 10¹⁹ steps', '585 years', 585 * YEAR],
  ];
  const lo = Math.log10(1e-9), hi = Math.log10(585 * YEAR);
  return (
    <Svg label="At one million items and a billion steps per second: log n takes 20 nanoseconds, n log n 0.02 seconds, n squared 16.7 minutes; 2 to the n at n equals 64 takes 585 years" h={360}>
      <T x={30} y={34} s={13} f={C.taupe}>n = 1,000,000 · ONE BILLION STEPS A SECOND (ASSUMED)</T>
      {rows.map(([lab, steps, time, secs], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.6, 0.9 + i * 0.6));
        const frac = (Math.log10(secs) - lo) / (hi - lo);
        const y = 60 + i * 70;
        return (
          <g key={lab}>
            <T x={30} y={y + 16} s={16} f={C.crema} w={600} o={a}>{lab}</T>
            <T x={200} y={y + 16} s={13} f={C.latte} o={a}>{steps}</T>
            <T x={570} y={y + 16} s={14} f={C.caramel} a="end" w={700} o={a}>{time}</T>
            <Bar x={30} y={y + 26} w={540 * frac * a} h={20} full={540} fill={i < 2 ? C.caramel : C.cherry} />
          </g>
        );
      })}
      <T x={30} y={346} s={13} f={C.taupe} o={easeOut(seg(t, 2.6, 3.2))}>bar length: time on a log scale, 1 ns to 585 years</T>
    </Svg>
  );
}

// 12 · Recap, ending on the opening claim decoded.
const RECAP = [
  ['O, Ω, Θ', 'inequalities with c and n₀'],
  ['o, ω', 'strict: ratio → 0 or ∞'],
  ['bound ≠ case', 'bound: inequality, case: function'],
  ['avg ≠ expected', 'random input vs own coins'],
  ['w.h.p.', 'failure ≤ 1/nᶜ, you choose c'],
  ['time ↔ space', 'name both, and what you count'],
  ['constants, size', 'small n: constants; n is bits'],
];
const DECODED = [
  ['bound', 'O (upper)'],
  ['case', 'expected, random pivots'],
  ['resource', 'time (comparisons)'],
];
export function Recap({ t }: StepCtx) {
  const d = easeOut(seg(t, 1.8, 2.5));
  return (
    <Svg label="Recap of the seven points, and the opening claim decoded: an upper bound on expected time, counting comparisons, with random pivots" h={412}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15));
        const y = 4 + i * 40;
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={540} height={34} rx={9} fill={C.roast} />
            <T x={46} y={y + 24} s={17} f={C.caramel} serif w={700}>{k}</T>
            <T x={236} y={y + 22} s={13} f={C.crema}>{v}</T>
          </g>
        );
      })}
      <g opacity={d}>
        <line x1={30} y1={296} x2={570} y2={296} stroke={C.mocha} />
        <T x={30} y={322} s={13} f={C.taupe}>“quicksort is O(n log n)”, DECODED</T>
        {DECODED.map(([k, v], i) => (
          <g key={k}>
            <T x={46} y={348 + i * 26} s={14} f={C.latte}>{k}</T>
            <T x={170} y={348 + i * 26} s={14} f={C.crema} w={600}>{v}</T>
          </g>
        ))}
      </g>
    </Svg>
  );
}
