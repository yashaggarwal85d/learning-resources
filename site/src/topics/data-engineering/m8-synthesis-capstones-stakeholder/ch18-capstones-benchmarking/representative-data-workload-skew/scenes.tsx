import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Representative data and workload skew, drawn from examples.py run on this sandbox's Postgres: the uniform build's
// 30 orders per customer, the seeded Zipfian build's counts for customers 1–20 (customer 1: 194; ten cold customers
// average 25.5), the planner's estimates on 6,000-row tables (correlated: 686 estimated against 2,029 actual, 66% off;
// independent: 688 against 698, 1% off), scale factor 1 = 2,000 × 30 = 60,000 rows, and seed 77's SHA-256, whose
// first 12 hex digits (296c85e2febc) match on both runs. Lookup times are this machine's, so they are drawn as
// positions only. The hook's "1% / nearly a third" is the step's own scenario about real traffic.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

// examples.py, seed 1: the Zipfian generator's order counts for customers 1–20 (customer 1 is the hottest, 194 orders),
// against the uniform build's 30 orders for every customer. Ten sampled cold customers average 25.5 orders.
const ZIPF = [194, 114, 120, 105, 79, 93, 78, 81, 73, 73, 84, 61, 86, 70, 80, 80, 67, 68, 71, 65];
const UNIFORM = 30;

/** Per-customer order-count bars, morphing from the uniform 30 to the Zipfian counts by `m`; value v is drawn v × sc px. */
const Counts = ({ x0, y0, m, sc, bw = 24, hi = -1 }: { x0: number; y0: number; m: number; sc: number; bw?: number; hi?: number }) => (
  <g>
    {ZIPF.map((z, i) => {
      const v = lerp(UNIFORM, z, m);
      return <rect key={i} x={x0 + i * bw} y={y0 - v * sc} width={bw - 4} height={v * sc} fill={i === hi && m > 0.5 ? C.badText : C.secondary} />;
    })}
  </g>
);

// 0 · Left, the benchmark: a flat row of equal bars, no hot spot. Right, the same week's real traffic: a strip of 100
// customer cells, one of which swells to take nearly a third of the strip's lookups (the step's own scenario).
export function Hook({ t }: StepCtx) {
  const swell = easeInOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="the last benchmark reported a clean, flat latency distribution, while real traffic the same week shows one percent of customers carrying nearly a third of all lookups." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={24} s={12} f={C.secondary}>
          the benchmark
        </T>
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={25 + i * 12} y={110} width={9} height={30} fill={C.secondary} opacity={easeOut(seg(t, 0.1 + i * 0.03, 0.3 + i * 0.03))} />
        ))}
        <T x={25} y={164} s={12} f={C.focus}>
          flat, no hot spots
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <T x={300} y={24} s={12} f={C.secondary}>
          real traffic, that week
        </T>
        <rect x={300} y={80} width={275 * (0.33 * swell + 0.01 * (1 - swell))} height={60} fill={C.badText} opacity={0.75} />
        {Array.from({ length: 99 }, (_, i) => {
          const start = 300 + 275 * (0.33 * swell + 0.01 * (1 - swell));
          const w = (275 - (start - 300)) / 99;
          return <rect key={i} x={start + i * w} y={80} width={Math.max(0.5, w - 0.6)} height={60} fill={C.line} />;
        })}
        <T x={300} y={164} s={12} f={C.badText} o={easeOut(seg(t, 2.2, 2.5))}>
          1% of customers
        </T>
        <T x={300} y={184} s={12} f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
          nearly a third of lookups
        </T>
      </g>
    </Svg>
  );
}

// 1 · Two suspects: the query, the data. After the answer the query gets ✓ fine, the data ✕ "uniform ids", and an arrow
// to the fix: a seeded, skewed generator.
export function PredictWhatBroke({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="what did the benchmark's own data get wrong, and what single change would fix it?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={20} w={170} label="the query" lit={on && s > 0.3} />
        <Box x={25} y={80} w={170} label="the data" stroke={on && s > 0.8 ? C.badText : undefined} />
      </g>
      <T x={575} y={70} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 0.6, 1.0))}>
        which one?
      </T>
      {on && (
        <g>
          <Tick x={212} y={36} k={easeOut(seg(s, 0.3, 0.5))} />
          <T x={230} y={41} s={12} f={C.focus} o={easeOut(seg(s, 0.3, 0.5))}>
            fine all along
          </T>
          <Cross x={212} y={96} k={easeOut(seg(s, 0.8, 1.0))} />
          <T x={230} y={101} s={12} f={C.badText} o={easeOut(seg(s, 0.8, 1.0))}>
            uniform random ids
          </T>
          <g opacity={easeOut(seg(s, 1.3, 1.7))}>
            <path d="M110 112 V140 H300" fill="none" stroke={C.second} strokeWidth={1.4} />
            <path d="M294 134 l6 6 l-6 6" fill="none" stroke={C.second} strokeWidth={1.4} />
            <T x={310} y={145} s={13} f={C.second}>
              seeded, skewed generator
            </T>
          </g>
        </g>
      )}
    </Svg>
  );
}

// 2 · The uniform build: customers' order counts rise one by one and every bar stops at the same height, 30. Below,
// the lookups' row of dots stays level: equally fast for whoever you ask.
export function RevealUniformFlat({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="the same query, the same load shape, a uniform random customer id — no hot-key effect anywhere." h={200}>
      <line x1={25} y1={110} x2={505} y2={110} stroke={C.line} />
      {ZIPF.map((_, i) => (
        <rect
          key={i}
          x={25 + i * 24}
          y={110 - UNIFORM * 1.6 * Math.min(1, grow * 1.5 - i * 0.025)}
          width={20}
          height={Math.max(0, UNIFORM * 1.6 * Math.min(1, grow * 1.5 - i * 0.025))}
          fill={C.secondary}
        />
      ))}
      <T x={575} y={40} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        30 each
      </T>
      <T x={25} y={130} s={11} f={C.quiet} o={easeOut(seg(t, 0.4, 0.7))}>
        orders per customer
      </T>
      <g opacity={easeOut(seg(t, 2.1, 2.5))}>
        {ZIPF.map((_, i) => (
          <circle key={i} cx={35 + i * 22} cy={168} r={4} fill={C.primary} />
        ))}
        <T x={575} y={172} s={12} f={C.focus} a="end">
          equally fast
        </T>
        <T x={25} y={194} s={11} f={C.quiet}>
          lookup time
        </T>
      </g>
    </Svg>
  );
}

// 3 · Change only the generator. The same 20 bars morph to the seeded Zipfian counts: customer 1 shoots up to 194,
// red, against cold customers averaging 25.5. Then its lookup dot drops lower than the others: measurably slower.
export function RevealZipfianKeys({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.5, 1.8));
  const slow = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a seeded Zipfian generator reproduces a few customers carrying a hugely disproportionate share of orders, and a measurably slower lookup for the busiest one." h={220}>
      <line x1={25} y1={150} x2={505} y2={150} stroke={C.line} />
      <Counts x0={25} y0={150} m={m} sc={0.68} hi={0} />
      <T x={70} y={24} s={13} f={C.badText} o={easeOut(seg(t, 1.6, 2.0))}>
        customer 1: 194 orders
      </T>
      <T x={575} y={60} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        cold: 25.5 average
      </T>
      <g opacity={easeOut(seg(t, 2.6, 2.9))}>
        {ZIPF.map((_, i) => (
          <circle key={i} cx={35 + i * 22} cy={i === 0 ? 176 + 20 * slow : 176} r={4} fill={i === 0 ? C.badText : C.primary} />
        ))}
        <T x={575} y={180} s={12} f={C.secondary} a="end">
          lookup time ↓
        </T>
      </g>
      <T x={575} y={212} s={12} f={C.badText} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        the hot key, slower
      </T>
    </Svg>
  );
}

// 4 · Two 6,000-row tables, the same query: country = US and currency = USD. Correlated (country decides currency): the
// planner's estimate bar stops at 686 while the actual bar climbs on to 2,029 — 66% off. Independent: estimate 688,
// actual 698 — 1% off.
export function RevealCorrelatedColumns({ t }: StepCtx) {
  const sc = 0.17;
  const rows: [string, number, number, string, number][] = [
    ['correlated', 686, 2029, '66% off', 0.4],
    ['independent', 688, 698, '1% off', 2.2],
  ];
  return (
    <Svg label="a planner that assumes independent columns misestimates a join badly once two columns are correlated, same query shape, same row count." h={240}>
      <T x={25} y={22} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        country = US and currency = USD, 6,000 rows each
      </T>
      {rows.map(([l, est, act, err, st], i) => {
        const y = 50 + i * 96;
        const e = easeOut(seg(t, st + 0.3, st + 0.8));
        const a = easeOut(seg(t, st + 0.8, st + 1.4));
        const bad = i === 0;
        return (
          <g key={l} opacity={easeOut(seg(t, st, st + 0.3))}>
            <T x={25} y={y + 4} s={13} f={C.primary}>
              {l}
            </T>
            <T x={140} y={y + 30} s={11} f={C.quiet} a="end">
              estimate
            </T>
            <rect x={150} y={y + 20} width={est * sc * e} height={14} fill={C.secondary} />
            <T x={156 + est * sc} y={y + 32} s={12} f={C.secondary} o={e}>
              {est.toLocaleString('en-US')}
            </T>
            <T x={140} y={y + 54} s={11} f={C.quiet} a="end">
              actual
            </T>
            <rect x={150} y={y + 44} width={act * sc * a} height={14} fill={bad ? C.badText : C.focus} />
            <T x={156 + act * sc * a} y={y + 56} s={12} f={bad ? C.badText : C.focus} o={a}>
              {act.toLocaleString('en-US')}
            </T>
            <T x={575} y={y + 4} s={13} f={bad ? C.badText : C.second} a="end" o={easeOut(seg(t, st + 1.3, st + 1.6))}>
              {err}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · The size, stated: a "scale factor" readout lands on 1, then the arithmetic writes itself out — 2,000 customers ×
// 30 orders × 1 = 60,000 rows — as the industry benchmarks' own convention does.
export function RevealScaleFactor({ t }: StepCtx) {
  const parts = ['2,000 customers', '× 30 orders', '× scale factor 1', '= 60,000 rows'];
  return (
    <Svg label="the dataset's own size, stated as a number, following the same convention an entire industry's own benchmark standards use." h={180}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={20} width={160} height={50} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={105} y={36} s={11} f={C.secondary} a="middle">
          scale factor
        </T>
        <T x={105} y={66} s={18} f={C.focus} a="middle">
          1
        </T>
      </g>
      {parts.map((p, i) => (
        <T key={p} x={25 + (i % 2) * 280} y={110 + Math.floor(i / 2) * 30} s={13} f={i === 3 ? C.focus : C.primary} o={easeOut(seg(t, 0.6 + i * 0.4, 0.9 + i * 0.4))}>
          {p}
        </T>
      ))}
      <T x={575} y={50} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 2.4, 2.8))}>
        TPC's convention: stated,
      </T>
      <T x={575} y={68} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 2.4, 2.8))}>
        so results compare
      </T>
    </Svg>
  );
}

// 6 · The generator as committed code, "seed 77". It runs twice, separately: two streams of rows pour out, and each
// ends in the same SHA-256 prefix, 296c85e2febc. An = and a ✓: byte-for-byte identical.
export function RevealSeededGenerator({ t }: StepCtx) {
  const r1 = seg(t, 0.8, 1.8);
  const r2 = seg(t, 1.6, 2.6);
  return (
    <Svg label="the same seed, run twice, produces byte-identical data every time — a committed, reusable artifact of the benchmark." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={70} width={150} height={56} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={100} y={92} s={12} f={C.secondary} a="middle">
          generator.py
        </T>
        <T x={100} y={114} s={13} f={C.focus} a="middle">
          seed 77
        </T>
      </g>
      {[r1, r2].map((r, j) => {
        const y = 40 + j * 96;
        return (
          <g key={j}>
            <line x1={175} y1={98} x2={240} y2={y + 6} stroke={C.line} strokeWidth={1} opacity={r > 0 ? 1 : 0} />
            {Array.from({ length: 10 }, (_, i) => {
              const p = r * 10 - i;
              return p <= 0 ? null : <rect key={i} x={250 + i * 16} y={y} width={12} height={12} rx={1} fill={C.secondary} opacity={Math.min(1, p)} />;
            })}
            <T x={420} y={y + 11} s={12} f={C.second} o={r >= 1 ? 1 : 0}>
              296c85e2febc
            </T>
            <T x={250} y={y + 32} s={11} f={C.quiet} o={r > 0 ? 1 : 0}>
              {j === 0 ? 'run 1' : 'run 2'}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <T x={470} y={98} s={18} f={C.focus} a="middle">
          =
        </T>
        <Tick x={505} y={94} k={1} />
        <T x={575} y={194} s={12} f={C.focus} a="end">
          byte-for-byte identical
        </T>
      </g>
    </Svg>
  );
}

// 7 · Four lines with their pictures: the flat bars hiding the hot one, the two estimate bars, the scale readout, the
// two matching hashes.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['uniform data', 'hides the hot key'],
    ['independent columns', 'hide a broken estimate'],
    ['stated size', 'scale factor, as a number'],
    ['seeded generator', 'committed, reproducible'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  const m = easeInOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="uniform data hides hot keys and correlation; a seeded Zipfian generator, an explicit scale factor, and a committed artifact make the benchmark honest." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <Counts x0={460} y0={66} m={m} sc={0.22} bw={5.5} hi={0} />
      </g>
      <g opacity={k(1)}>
        <rect x={470} y={100} width={686 * 0.05} height={8} fill={C.secondary} />
        <rect x={470} y={114} width={2029 * 0.05} height={8} fill={C.badText} />
      </g>
      <g opacity={k(2)}>
        <rect x={480} y={164} width={60} height={34} rx={5} fill={C.panel} stroke={C.focus} />
        <T x={510} y={187} s={14} f={C.focus} a="middle">
          1
        </T>
      </g>
      <g opacity={k(3)}>
        <T x={575} y={242} s={11} f={C.second} a="end">
          296c85e2…
        </T>
        <T x={575} y={262} s={11} f={C.second} a="end">
          296c85e2…
        </T>
      </g>
    </Svg>
  );
}

// 8 · A clean result card over two column icons marked "independent" and "uniform". After the answer the card is
// stamped "a result about this data only", and two warnings attach: a hot key it couldn't see, an estimate that breaks.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="a clean benchmark result on independent, uniformly random columns — should it be trusted for production?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={20} width={200} height={70} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={125} y={50} s={14} f={C.focus} a="middle">
          clean result
        </T>
        <Tick x={125} y={70} k={1} />
      </g>
      <g opacity={easeOut(seg(t, 0.5, 0.9))}>
        <Box x={25} y={110} w={95} label="uniform" />
        <Box x={130} y={110} w={130} label="independent" />
      </g>
      <T x={575} y={60} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.2, 1.6))}>
        trust it for production?
      </T>
      {on && (
        <g>
          <T x={290} y={42} s={12} f={C.badText} o={easeOut(seg(s, 0.2, 0.5))}>
            true only for this data
          </T>
          <g opacity={easeOut(seg(s, 0.8, 1.1))}>
            <line x1={120} y1={126} x2={290} y2={98} stroke={C.badText} strokeWidth={1.2} />
            <T x={295} y={102} s={12} f={C.primary}>
              hot key: invisible
            </T>
          </g>
          <g opacity={easeOut(seg(s, 1.3, 1.6))}>
            <line x1={260} y1={126} x2={290} y2={138} stroke={C.badText} strokeWidth={1.2} />
            <T x={295} y={142} s={12} f={C.primary}>
              estimate: breaks
            </T>
          </g>
          <T x={575} y={186} s={12} f={C.second} a="end" o={easeOut(seg(s, 1.9, 2.3))}>
            re-run on production-shaped data
          </T>
        </g>
      )}
    </Svg>
  );
}
