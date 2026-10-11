import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';

// Every number shown here is computed or asserted by examples.py.
const C = { roast: '#2a1d16', cocoa: '#3b2a21', mocha: '#5a4032', taupe: '#8b7766', latte: '#c8ac8c', crema: '#e9d9bf', caramel: '#d49a57', cinnamon: '#b8612f', cherry: '#8e2f2a', espresso: '#17100c' };
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SERIF = 'Fraunces, Georgia, serif';

const Svg = ({ label, h = 380, children }: { label: string; h?: number; children: ReactNode }) => (
  <svg viewBox={`0 0 600 ${h}`} className="h-full w-full" role="img" aria-label={label}>
    {children}
  </svg>
);
const T = ({ x, y, s = 15, f = C.latte, a = 'start', w = 500, o = 1, serif = false, children }: { x: number; y: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; serif?: boolean; children: ReactNode }) => (
  <text x={x} y={y} fontSize={s} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }} fill={f} textAnchor={a} fontWeight={w} opacity={o} fontFamily={serif ? SERIF : MONO} letterSpacing={serif ? 0 : '0.03em'}>
    {children}
  </text>
);
const Bar = ({ x, y, w, h, full, fill, o = 1 }: { x: number; y: number; w: number; h: number; full: number; fill: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={full} height={h} rx={7} fill={C.cocoa} />
    <rect x={x} y={y} width={Math.max(3, w)} height={h} rx={7} fill={fill} />
  </g>
);

// 1 · The three questions every cost claim answers.
export function Opening({ t }: StepCtx) {
  const rows = [
    ['Which bound?', 'O, Ω, Θ, o, ω', 'how the function relates'],
    ['Which case?', 'best, worst, average, expected', 'which function we bound'],
    ['Which resource?', 'time, space', 'what is being counted'],
  ];
  return (
    <Svg label="Every cost claim answers three questions: which bound, which case, which resource" h={360}>
      <T x={30} y={44} s={13} f={C.taupe}>A COST CLAIM HAS THREE PARTS</T>
      {rows.map(([q, v, d], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.4, 0.8 + i * 0.4));
        const y = 70 + i * 90;
        return (
          <g key={q} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={540} height={74} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={52} y={y + 32} s={22} f={C.caramel} serif w={700}>{q}</T>
            <T x={52} y={y + 58} s={13} f={C.latte}>{d}</T>
            <T x={548} y={y + 44} s={14} f={C.crema} a="end" w={600}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Θ as a sandwich with witnesses c1, c2, n0.
export function Sandwich({ t }: StepCtx) {
  const f = (n: number) => 3 * n * n + 10 * n;
  const N = 16, X0 = 50, W = 500, Y0 = 330, H = 270, MAX = 4 * N * N;
  const px = (n: number) => X0 + (n / N) * W;
  const py = (v: number) => Y0 - (v / MAX) * H;
  const path = (g: (n: number) => number) => Array.from({ length: 65 }, (_, i) => `${i ? 'L' : 'M'}${px((i / 64) * N).toFixed(1)} ${py(g((i / 64) * N)).toFixed(1)}`).join(' ');
  const sweep = easeInOut(seg(t, 0.4, 3.4)) * N;
  const n0 = 10;
  const ok = sweep >= n0;
  return (
    <Svg label="3n squared plus 10n lies between 3n squared and 4n squared from n equals 10 onward" h={380}>
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.mocha} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 10} stroke={C.mocha} />
      <path d={path((n) => 4 * n * n)} stroke={C.latte} strokeWidth={2} fill="none" strokeDasharray="6 5" />
      <path d={path((n) => 3 * n * n)} stroke={C.latte} strokeWidth={2} fill="none" strokeDasharray="6 5" />
      <path d={path(f)} stroke={C.caramel} strokeWidth={3.5} fill="none" strokeDasharray="900" strokeDashoffset={900 * (1 - clamp(sweep / N))} />
      {/* legend in the empty top-left: the three curves end too close together to label at their tips */}
      <line x1={70} y1={68} x2={100} y2={68} stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
      <T x={110} y={73} s={13} f={C.latte}>4n²  (c₂ = 4)</T>
      <line x1={70} y1={94} x2={100} y2={94} stroke={C.caramel} strokeWidth={3.5} />
      <T x={110} y={99} s={13} f={C.caramel} w={700}>3n² + 10n</T>
      <line x1={70} y1={120} x2={100} y2={120} stroke={C.latte} strokeWidth={2} strokeDasharray="6 5" />
      <T x={110} y={125} s={13} f={C.latte}>3n²  (c₁ = 3)</T>
      <line x1={px(n0)} y1={Y0} x2={px(n0)} y2={Y0 - H} stroke={C.cinnamon} strokeDasharray="3 5" opacity={ok ? 1 : 0.35} />
      <T x={px(n0)} y={Y0 + 22} s={14} f={ok ? C.caramel : C.taupe} a="middle" w={700}>n₀ = 10</T>
      <T x={X0} y={Y0 + 22} s={13} f={C.taupe}>n</T>
      <T x={30} y={30} s={14} f={ok ? C.crema : C.taupe} w={600}>{ok ? 'from n₀ on, always between: Θ(n²)' : 'below n₀ the top line is still crossed'}</T>
    </Svg>
  );
}

// 3 · 2^(n+1) versus 2^(2n): a constant ratio or a growing one.
export function PowerRatios({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const ns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <Svg label="2 to the n plus 1 over 2 to the n is always 2; 4 to the n over 2 to the n doubles with every n" h={360}>
      <T x={30} y={34} s={13} f={C.taupe}>RATIO TO 2ⁿ, FOR n = 1 … 10</T>
      <T x={30} y={78} s={14} f={C.crema} w={600}>2ⁿ⁺¹ / 2ⁿ</T>
      {ns.map((n, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1));
        return <rect key={n} x={170 + i * 40} y={80 - 26 * a} width={30} height={26 * a} rx={4} fill={C.caramel} />;
      })}
      <T x={575} y={106} s={13} f={C.caramel} a="end">always 2</T>
      <T x={30} y={246} s={14} f={C.crema} w={600}>2²ⁿ / 2ⁿ</T>
      {ns.map((n, i) => {
        const a = shown ? easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08)) : 0;
        const hgt = Math.min(130, (2 ** n / 1024) * 130) * a;
        return <rect key={n} x={170 + i * 40} y={252 - hgt} width={30} height={hgt} rx={4} fill={C.cherry} />;
      })}
      {shown ? <T x={575} y={282} s={13} f={C.latte} a="end">= 2ⁿ, no constant c holds</T> : <T x={170} y={200} s={16} f={C.taupe}>your call: bounded, or growing?</T>}
      <line x1={165} y1={252} x2={575} y2={252} stroke={C.mocha} />
    </Svg>
  );
}

// 4 · o and ω: read the ratio.
export function Ratios({ t }: StepCtx) {
  const rows: [string, string, (n: number) => number, string][] = [
    ['n log n  vs  n²', 'o', (n) => (n * Math.log2(n)) / (n * n), 'ratio → 0   so  o'],
    ['3n² + 10n  vs  n²', 'Θ', (n) => (3 * n * n + 10 * n) / (n * n), 'ratio → 3   so  Θ, not o'],
    ['n²  vs  n log n', 'ω', (n) => (n * n) / (n * Math.log2(n)), 'ratio → ∞   so  ω'],
  ];
  const ns = [10, 1000, 1000000];
  return (
    <Svg label="The ratio of f to g as n grows: toward zero is little-o, toward a constant is theta, toward infinity is little-omega" h={380}>
      <T x={30} y={34} s={13} f={C.taupe}>f(n) / g(n)  AT  n = 10 · 1,000 · 1,000,000</T>
      {rows.map(([lab, sym, g, verdict], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.6, 0.8 + i * 0.6));
        const y = 62 + i * 108;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={92} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 30} s={16} f={C.crema} w={600}>{lab}</T>
            <T x={550} y={y + 34} s={30} f={C.caramel} a="end" serif w={800}>{sym}</T>
            {ns.map((n, j) => {
              const v = g(n);
              return <T key={n} x={50 + j * 112} y={y + 60} s={14} f={C.latte}>{v < 0.001 || v >= 1000 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}</T>;
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
            <T x={570} y={y + 44} s={20} f={C.caramel} a="end" serif w={800} o={a}>{th}</T>
            <T x={570} y={y + 64} s={12} f={C.latte} a="end" o={a}>{form}</T>
          </g>
        );
      })}
      <T x={30} y={350} s={13} f={C.latte} o={easeOut(seg(t, 3, 3.6))}>each row is its own function, with its own O, Ω, Θ</T>
    </Svg>
  );
}

// 6 · Expected versus average: quicksort on sorted input, n = 1000.
export function PivotChoice({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const a = easeOut(seg(t, 0.4, 1.8));
  return (
    <Svg label="Quicksort on 1000 sorted keys: 499,500 comparisons with a fixed first pivot, about 10,986 with a random pivot" h={330}>
      <T x={30} y={34} s={13} f={C.taupe}>QUICKSORT, 1,000 KEYS ALREADY IN ORDER</T>
      <T x={30} y={84} s={15} f={C.crema} w={600}>first element as pivot</T>
      <Bar x={30} y={96} w={540 * a} h={34} full={540} fill={C.cherry} />
      <T x={560} y={119} s={15} f={C.crema} a="end" w={700}>{Math.round(499500 * a).toLocaleString('en-US')}</T>
      <T x={30} y={184} s={15} f={C.crema} w={600}>random pivot, every run</T>
      <Bar x={30} y={196} w={shown ? (540 * 10986) / 499500 * easeOut(seg(t, 0.2, 1.2)) : 0} h={34} full={540} fill={C.caramel} />
      {shown ? <T x={30 + (540 * 10986) / 499500 + 12} y={219} s={15} f={C.crema} w={700}>10,986 expected</T> : <T x={30} y={219} s={15} f={C.taupe}>?</T>}
      <T x={30} y={290} s={13} f={C.latte}>the coins are the algorithm's: no input is bad, only an unlucky run</T>
    </Svg>
  );
}

// 7 · Expected is not a guarantee: the spread of 2,000 seeded runs.
const HIST = [55, 1086, 704, 139, 13, 2, 1, 0];
export function Spread({ t }: StepCtx) {
  const max = 1086;
  return (
    <Svg label="Comparisons in 2,000 randomized quicksort runs: tightly bunched around 10,986, the worst run 15,583" h={380}>
      <T x={30} y={34} s={13} f={C.taupe}>2,000 RUNS · COMPARISONS · BUCKETS OF 1,000</T>
      {HIST.map((h, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.2, 0.9 + i * 0.2));
        const hh = (h / max) * 200 * a;
        return (
          <g key={i}>
            <rect x={40 + i * 66} y={270 - hh} width={54} height={hh} rx={5} fill={i === 5 || i === 6 ? C.cherry : C.caramel} />
            <T x={67 + i * 66} y={292} s={12} f={C.latte} a="middle">{9 + i}k</T>
            {h > 0 && <T x={67 + i * 66} y={262 - hh} s={12} f={C.crema} a="middle" o={a}>{h}</T>}
          </g>
        );
      })}
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
      <T x={420} y={64} s={12} f={C.taupe} a="end">STEPS</T>
      <T x={550} y={64} s={12} f={C.taupe} a="end">EXTRA VALUES</T>
      {rows.map(([lab, steps, extra, th], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.7, 0.9 + i * 0.7));
        const y = 74 + i * 92;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={82} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 30} s={15} f={C.crema} w={600}>{lab}</T>
            <T x={50} y={y + 62} s={13} f={C.caramel}>{th}</T>
            <T x={420} y={y + 60} s={20} f={C.crema} a="end" w={700}>{steps}</T>
            <T x={550} y={y + 60} s={20} f={extra === '0' ? C.caramel : C.cherry} a="end" w={700}>{extra}</T>
          </g>
        );
      })}
      <T x={30} y={368} s={13} f={C.latte} o={easeOut(seg(t, 3, 3.6))}>time bought with space: name both resources</T>
    </Svg>
  );
}

// 9 · The constant hides inside the O: 100n against n².
export function Crossover({ t }: StepCtx) {
  const N = 140, X0 = 50, W = 510, Y0 = 320, H = 260, MAX = 140 * 140;
  const px = (n: number) => X0 + (n / N) * W;
  const py = (v: number) => Y0 - (Math.min(v, 20000) / 20000) * H;
  const sweep = easeInOut(seg(t, 0.3, 3.2)) * N;
  const line = (g: (n: number) => number) => {
    const pts: string[] = [];
    for (let n = 0; n <= sweep; n += 1) pts.push(`${pts.length ? 'L' : 'M'}${px(n).toFixed(1)} ${py(g(n)).toFixed(1)}`);
    return pts.join(' ');
  };
  void MAX;
  const after = sweep >= 100;
  return (
    <Svg label="The line 100n is above n squared until n equals 100, then below it" h={380}>
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.mocha} />
      <path d={line((n) => 100 * n)} stroke={C.caramel} strokeWidth={3.5} fill="none" />
      <path d={line((n) => n * n)} stroke={C.cherry} strokeWidth={3.5} fill="none" />
      <T x={px(40)} y={py(4000) - 12} s={14} f={C.caramel} w={700}>100n</T>
      <T x={px(118)} y={py(13924) + 22} s={14} f={C.cherry} w={700} a="start">n²</T>
      <line x1={px(100)} y1={Y0} x2={px(100)} y2={Y0 - H} stroke={C.cinnamon} strokeDasharray="3 5" opacity={after ? 1 : 0.3} />
      <T x={px(100)} y={Y0 + 24} s={14} f={after ? C.caramel : C.taupe} a="middle" w={700}>n = 100</T>
      <T x={30} y={30} s={14} f={C.crema} w={600}>{after ? 'past n = 100, 100n is the cheaper one' : 'below n = 100 the “worse” n² is cheaper'}</T>
    </Svg>
  );
}

// 10 · Size is bits, not value.
export function BitsNotValue({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['a 32-bit prime', '65,534', 'trial divisions to prove it prime'],
    ['a 64-bit prime', '4 billion+', 'the input only doubled in size'],
  ];
  return (
    <Svg label="Trial division on a 32-bit prime takes 65,534 steps; on a 64-bit prime over four billion: polynomial in the value, exponential in the bits" h={330}>
      <T x={30} y={34} s={13} f={C.taupe}>PRIMALITY BY TRIAL DIVISION · O(√v) IN THE VALUE v</T>
      {rows.map(([lab, v, d], i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.9, 1.1 + i * 0.9));
        const y = 62 + i * 110;
        return (
          <g key={lab} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={30} y={y} width={540} height={92} rx={16} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={y + 32} s={16} f={C.crema} w={600}>{lab}</T>
            <T x={50} y={y + 64} s={13} f={C.latte}>{d}</T>
            <T x={550} y={y + 56} s={26} f={i ? C.cherry : C.caramel} a="end" serif w={800}>{v}</T>
          </g>
        );
      })}
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 3))}>32 more bits of input: about 65,536 times the steps</T>
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
      <T x={30} y={346} s={12} f={C.taupe} o={easeOut(seg(t, 2.6, 3.2))}>bar length: time on a log scale, 1 ns to 585 years</T>
    </Svg>
  );
}

// 12 · Recap.
const RECAP = [
  ['O, Ω, Θ', 'inequalities with c and n₀'],
  ['o, ω', 'strict: ratio → 0 or ∞'],
  ['bound ≠ case', 'function vs inequality'],
  ['average ≠ expected', 'random input vs own coins'],
  ['w.h.p.', 'failure ≤ 1/nᶜ, you choose c'],
  ['time ↔ space', 'name both, and what you count'],
  ['constants, size', 'small n: constants; n is bits'],
];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Recap of the seven points" h={380}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15));
        const y = 8 + i * 52;
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={540} height={44} rx={11} fill={C.roast} />
            <T x={50} y={y + 29} s={17} f={C.caramel} serif w={700}>{k}</T>
            <T x={262} y={y + 28} s={13} f={C.crema}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}
void lerp;
