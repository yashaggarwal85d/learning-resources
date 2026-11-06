import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Latency percentiles and histogram aggregation, drawn from examples.py: 500 requests with one 2-second stall at
// request 250; the percentile ladder p50, p95, p99, p99.9, max; two hosts' p99s against their merged p99 (positions
// only, since those are this machine's timings); fan-out over 100 shards at 1% each, 1 − 0.99¹⁰⁰ = 0.634, 0.632 over
// 20,000 seeded trials; and 120 requests at 30 a second with the same 2-second stall at request 60, where the
// constant-rate backlog drains 1/30 s per request. "40 ms", "4 s" and "p99 5 ms" are the steps' own scenario numbers.

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

/** A right-skewed histogram silhouette from x0 to x0 + w, peak at fraction `pk`, tail weight `tl`; scale `k` (0..1). */
const Hist = ({ x0, y0, w, h, pk, tl, k = 1, c = C.secondary, n = 24 }: { x0: number; y0: number; w: number; h: number; pk: number; tl: number; k?: number; c?: string; n?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const u = i / n;
      const v = u < pk ? Math.pow(u / pk, 1.6) : Math.exp(-((u - pk) / tl));
      const hh = v * h * k;
      return <rect key={i} x={x0 + (i * w) / n} y={y0 - hh} width={w / n - 1.5} height={hh} fill={c} opacity={0.8} />;
    })}
  </g>
);

// 0 · A field of requests: 500 dots, every one short. The tidy average card reads "mean 40 ms". Then one dot turns red
// and stretches into a long bar: one shopper, four seconds, in the same run. (The scenario's own numbers, from the
// step's body text.)
export function Hook({ t }: StepCtx) {
  const red = easeOut(seg(t, 1.2, 1.5));
  const stretch = easeInOut(seg(t, 1.5, 2.6));
  return (
    <Svg label="a load test reports a mean of forty milliseconds, and a shopper waits four seconds, in the same run." h={200}>
      {Array.from({ length: 500 }, (_, i) => {
        const o = easeOut(seg(t, (i % 25) * 0.02, 0.3 + (i % 25) * 0.02));
        return i === 287 ? null : <rect key={i} x={25 + (i % 25) * 9} y={20 + Math.floor(i / 25) * 7} width={6} height={4} fill={C.line} opacity={o} />;
      })}
      <rect x={25 + 12 * 9} y={20 + 11 * 7} width={6 + 320 * stretch} height={4} fill={red > 0 ? C.badText : C.line} />
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <rect x={300} y={20} width={180} height={44} rx={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={390} y={48} s={14} f={C.focus} a="middle">
          mean 40 ms
        </T>
      </g>
      <T x={575} y={126} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.4, 2.7))}>
        one shopper: 4 s
      </T>
      <T x={25} y={180} s={12} f={C.secondary} o={easeOut(seg(t, 2.7, 3.1))}>
        the average never said
      </T>
    </Svg>
  );
}

// 1 · Two blanks: "which numbers?" and "which load?". After the answer a ladder of five ticks rises beside the first,
// its far end lit; under the second, "waits for each reply" is struck and "fixed schedule" gets the ✓.
export function PredictWhichNumbers({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const rungs = ['p50', 'p95', 'p99', 'p99.9', 'max'];
  return (
    <Svg label="which numbers would have shown the gap, and which load generator would have caught it?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={30} s={13} f={C.secondary}>
          which numbers?
        </T>
        <T x={25} y={110} s={13} f={C.secondary}>
          which load?
        </T>
      </g>
      {!on && (
        <T x={575} y={70} s={14} f={C.focus} a="end" o={easeOut(seg(t, 0.8, 1.2))}>
          ?
        </T>
      )}
      {on &&
        rungs.map((r, i) => {
          const k = easeOutBack(seg(s, 0.1 + i * 0.12, 0.4 + i * 0.12));
          return (
            <g key={r} opacity={Math.min(1, k)}>
              <line x1={200 + i * 80} y1={56} x2={200 + i * 80} y2={lerp(56, 40, k)} stroke={i >= 3 ? C.badText : C.secondary} strokeWidth={2} />
              <T x={200 + i * 80} y={72} s={12} f={i >= 3 ? C.badText : C.primary} a="middle">
                {r}
              </T>
            </g>
          );
        })}
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.9, 1.2))}>
            <Box x={25} y={124} w={260} label="waits for each reply" stroke={C.badText} f={C.secondary} />
            <Box x={322} y={124} w={228} label="fixed schedule" lit />
          </g>
          <Cross x={300} y={140} k={easeOut(seg(s, 1.3, 1.5))} />
          <Tick x={562} y={140} k={easeOut(seg(s, 1.5, 1.7))} />
        </g>
      )}
    </Svg>
  );
}

// 2 · examples.py's 500 requests as a strip of thin bars, one 2-second stall injected at request 250. The stall's bar
// shoots off the top. The mean line, drawn to the same scale, barely lifts; a p99.9 marker jumps straight to the stall.
export function RevealMeansHideTails({ t }: StepCtx) {
  const n = Math.floor(seg(t, 0.3, 1.6) * 500);
  const stall = easeOut(seg(t, 1.0, 1.4));
  const mean = easeOut(seg(t, 2.0, 2.4));
  const p999 = easeOutBack(seg(t, 2.9, 3.4));
  return (
    <Svg label="a rare, large stall barely moves the mean while the tail percentiles move sharply." h={220}>
      <line x1={25} y1={170} x2={525} y2={170} stroke={C.line} />
      {Array.from({ length: n }, (_, i) => (i === 250 ? null : <rect key={i} x={25 + i} y={166} width={1} height={4} fill={C.secondary} />))}
      {n > 250 && <rect x={274} y={170 - 150 * stall} width={3} height={150 * stall} fill={C.badText} />}
      <T x={285} y={30} s={12} f={C.badText} o={stall}>
        one 2 s stall
      </T>
      <g opacity={mean}>
        <line x1={25} y1={164} x2={525} y2={164} stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 3" />
        <T x={575} y={160} s={12} f={C.focus} a="end">
          mean
        </T>
      </g>
      <T x={25} y={196} s={12} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        diluted across 499 others
      </T>
      <g opacity={Math.min(1, p999)}>
        <line x1={530} y1={20} x2={570} y2={20} stroke={C.badText} strokeWidth={2} />
        <T x={575} y={40} s={12} f={C.badText} a="end">
          p99.9
        </T>
      </g>
    </Svg>
  );
}

// 3 · One skewed distribution. Five markers land along it in order — p50, p95, p99, p99.9, max — and each one's
// question appears in the list below as its marker plants.
export function RevealPercentileLadder({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['p50', 'the typical request', 0.2],
    ['p95', 'a somewhat unlucky user', 0.48],
    ['p99', 'a very unlucky one', 0.66],
    ['p99.9', 'rare: needs volume to see', 0.84],
    ['max', 'the single worst', 0.98],
  ];
  const x0 = 25;
  const w = 550;
  return (
    <Svg label="five points on the same distribution, each answering a different real question." h={260}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Hist x0={x0} y0={90} w={w} h={70} pk={0.15} tl={0.14} c={C.line} n={44} />
        <line x1={x0} y1={90} x2={x0 + w} y2={90} stroke={C.line} />
      </g>
      {rows.map(([p, q, u], i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.6, 1.1 + i * 0.6));
        const x = x0 + u * w;
        return (
          <g key={p} opacity={k}>
            <line x1={x} y1={lerp(10, 22, k)} x2={x} y2={94} stroke={i >= 3 ? C.badText : C.focus} strokeWidth={1.6} />
            <T x={x} y={16} s={11} f={i >= 3 ? C.badText : C.focus} a={i === 4 ? 'end' : 'middle'}>
              {p}
            </T>
            <T x={25} y={124 + i * 28} s={12} f={i >= 3 ? C.badText : C.focus}>
              {p}
            </T>
            <T x={100} y={124 + i * 28} s={12} f={C.primary}>
              {q}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Host A's narrow histogram and host B's wider one, each with its own p99 tick. Their two p99s average to a dashed
// tick in between. Then the histograms add, bar by bar, into one merged histogram, and its true p99 lands somewhere
// else — almost at host B's. (examples.py: A 0.47, B 1.40, average 0.93, merged 1.38 on this machine; drawn as
// positions only.)
export function RevealHistogramMerge({ t }: StepCtx) {
  const X = (ms: number) => 40 + (ms / 1.6) * 520;
  const avg = easeOut(seg(t, 1.4, 1.8));
  const merge = easeInOut(seg(t, 2.3, 3.2));
  const tp = easeOutBack(seg(t, 3.4, 3.9));
  return (
    <Svg label="two hosts' percentiles, naively averaged, versus the true percentile of their merged histogram." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.6 * merge)}>
        <Hist x0={X(0.1)} y0={lerp(70, 180, merge)} w={X(0.5) - X(0.1)} h={50} pk={0.3} tl={0.2} c={C.secondary} n={12} />
        <T x={25} y={24} s={12} f={C.secondary}>
          host A
        </T>
        <line x1={X(0.47)} y1={20} x2={X(0.47)} y2={74} stroke={C.secondary} strokeWidth={1.4} />
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.6 * merge)}>
        <Hist x0={X(0.6)} y0={lerp(130, 180, merge)} w={X(1.5) - X(0.6)} h={40} pk={0.25} tl={0.3} c={C.second} n={18} />
        <T x={25} y={110} s={12} f={C.second}>
          host B
        </T>
        <line x1={X(1.4)} y1={80} x2={X(1.4)} y2={134} stroke={C.second} strokeWidth={1.4} />
      </g>
      <T x={X(0.47)} y={14} s={11} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        p99
      </T>
      <T x={X(1.4)} y={76} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        p99
      </T>
      <g opacity={avg}>
        <line x1={X(0.93)} y1={40} x2={X(0.93)} y2={190} stroke={C.badText} strokeWidth={1.6} strokeDasharray="5 3" />
        <T x={X(0.93)} y={36} s={12} f={C.badText} a="middle">
          averaged
        </T>
      </g>
      <line x1={25} y1={180} x2={575} y2={180} stroke={C.line} opacity={merge} />
      <g opacity={Math.min(1, tp)}>
        <line x1={X(1.38)} y1={150} x2={X(1.38)} y2={190} stroke={C.focus} strokeWidth={2} />
        <T x={X(1.38)} y={208} s={12} f={C.focus} a="middle">
          merged p99
        </T>
      </g>
      <T x={25} y={232} s={12} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        histograms add; percentiles don't
      </T>
    </Svg>
  );
}

// 5 · One shard: 100 calls, 1 in its tail (1%). Then one request fans out to 100 shards; each shard draws its own 1%,
// and the chance at least one is slow climbs to 1 − 0.99¹⁰⁰ = 0.634 (examples.py's 20,000 seeded trials: 0.632).
export function RevealFanoutAmplification({ t }: StepCtx) {
  const fan = easeInOut(seg(t, 1.4, 2.4));
  const hit = t > 2.6;
  return (
    <Svg label="a hundred-shard fan-out hits at least one shard's own tail far more often than any one shard's own rate suggests." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4)) * (1 - 0.7 * fan)}>
        <T x={25} y={22} s={12} f={C.secondary}>
          one shard
        </T>
        {Array.from({ length: 100 }, (_, i) => (
          <rect key={i} x={25 + (i % 10) * 12} y={32 + Math.floor(i / 10) * 12} width={9} height={9} rx={1} fill={i === 63 ? C.badText : C.line} />
        ))}
        <T x={25} y={170} s={13} f={C.focus}>
          1 in 100 slow
        </T>
      </g>
      <g opacity={fan}>
        <circle cx={230} cy={90} r={7} fill={C.focus} />
        {Array.from({ length: 100 }, (_, i) => {
          const x = 300 + (i % 10) * 27;
          const y = 32 + Math.floor(i / 10) * 13;
          return (
            <g key={i}>
              <line x1={230} y1={90} x2={lerp(230, x, fan)} y2={lerp(90, y, fan)} stroke={C.line} strokeWidth={0.4} />
              <rect x={lerp(230, x, fan) - 4} y={lerp(90, y, fan) - 4} width={8} height={8} rx={1} fill={hit && i === 41 ? C.badText : C.secondary} />
            </g>
          );
        })}
      </g>
      <T x={575} y={190} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        at least one slow: 0.634
      </T>
      <T x={575} y={216} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        1 − 0.99¹⁰⁰; simulated 0.632
      </T>
    </Svg>
  );
}

// 6 · Two lanes at 30 requests a second, the same 2-second stall at request 60. Closed-loop: sends stop during the
// stall and resume after — one slow request, the rest normal. Constant-rate: send ticks keep coming on schedule; each
// one queued behind the stall waits, latency falling 1/30 s per request as the backlog drains: all 60 that follow.
export function RevealClosedLoopVsConstantRate({ t }: StepCtx) {
  const X = (i: number) => 40 + i * 4.3;
  const n = Math.floor(seg(t, 0.4, 3.4) * 120);
  const Lat = ({ y0, cr }: { y0: number; cr: boolean }) => (
    <g>
      <line x1={X(0)} y1={y0} x2={X(120)} y2={y0} stroke={C.line} />
      {Array.from({ length: n }, (_, i) => {
        const back = cr && i >= 60 ? 2000 - (i - 60) * (1000 / 30) : i === 60 ? 2000 : 0;
        const h = back > 0 ? (back / 2000) * 60 : 3;
        return <rect key={i} x={X(i)} y={y0 - h} width={3} height={h} fill={back > 0 ? C.badText : C.secondary} />;
      })}
    </g>
  );
  return (
    <Svg label="two generators, the same offered load, the same injected stall." h={260}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={22} s={12} f={C.secondary}>
          waits for each reply
        </T>
        <Lat y0={100} cr={false} />
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={132} s={12} f={C.secondary}>
          fixed schedule, 30 a second
        </T>
        <Lat y0={210} cr={true} />
      </g>
      <T x={575} y={78} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        tail looks calm
      </T>
      <T x={575} y={236} s={12} f={C.badText} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        the whole backlog, reported
      </T>
      <T x={X(60)} y={252} s={11} f={C.quiet} a="middle" o={n > 60 ? 1 : 0}>
        2 s stall
      </T>
    </Svg>
  );
}

// 7 · Four lines with their pictures: a mean line under one tall bar, five ladder ticks, two histograms adding into one,
// and the fan-out's one red shard.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['an average', 'hides a tail'],
    ['the ladder', 'five questions, not one'],
    ['histograms', 'merge; percentiles never average'],
    ['fan-out', 'multiplies tail risk'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  const m = easeInOut(seg(t, 2.3, 2.9));
  return (
    <Svg label="report the ladder, merge histograms, respect fan-out, and generate load that doesn't hide its own worst case." h={300}>
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
        <line x1={470} y1={62} x2={570} y2={62} stroke={C.focus} strokeDasharray="4 3" />
        <rect x={520} y={22} width={3} height={42} fill={C.badText} />
      </g>
      <g opacity={k(1)}>
        {[0, 1, 2, 3, 4].map((j) => (
          <line key={j} x1={475 + j * 22} y1={120} x2={475 + j * 22} y2={104} stroke={j >= 3 ? C.badText : C.secondary} strokeWidth={2} />
        ))}
      </g>
      <g opacity={k(2)}>
        <rect x={lerp(470, 500, m)} y={lerp(166, 186, m)} width={30} height={14} fill={C.secondary} opacity={0.7} />
        <rect x={lerp(530, 500, m)} y={lerp(166, 172, m)} width={30} height={14} fill={C.second} opacity={0.7} />
      </g>
      <g opacity={k(3)}>
        <circle cx={480} cy={255} r={4} fill={C.focus} />
        {[0, 1, 2, 3, 4].map((j) => (
          <g key={j}>
            <line x1={480} y1={255} x2={555} y2={235 + j * 10} stroke={C.line} strokeWidth={0.8} />
            <rect x={553} y={232 + j * 10} width={7} height={7} fill={j === 2 ? C.badText : C.secondary} />
          </g>
        ))}
      </g>
    </Svg>
  );
}

// 8 · Ten host cards, each "p99 5 ms" (the step's own scenario). "Fleet p99 = 5 ms?" After the answer the ten slide down
// and stack into one merged histogram; its p99 marker reads "?", read off the merge, not assumed.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const m = on ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  return (
    <Svg label="ten hosts, each independently reporting its own p99 of five milliseconds." h={200}>
      {Array.from({ length: 10 }, (_, i) => {
        const x = 25 + (i % 5) * 112;
        const y = 16 + Math.floor(i / 5) * 46;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.08, 0.3 + i * 0.08)) * (1 - m)}>
            <rect x={lerp(x, 230, m)} y={lerp(y, 130, m)} width={100} height={36} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
            {m < 0.02 && (
              <T x={x + 50} y={y + 23} s={12} f={C.primary} a="middle">
                p99 5 ms
              </T>
            )}
          </g>
        );
      })}
      <T x={575} y={140} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.2, 1.6))}>
        fleet p99 = 5 ms?
      </T>
      {on && (
        <g opacity={easeOut(seg(s, 1.0, 1.4))}>
          <Hist x0={120} y0={150} w={360} h={110} pk={0.2} tl={0.2} c={C.second} n={30} />
          <line x1={120} y1={150} x2={480} y2={150} stroke={C.line} />
          <line x1={400} y1={30} x2={400} y2={154} stroke={C.focus} strokeWidth={1.8} />
          <T x={410} y={36} s={12} f={C.focus}>
            fleet p99: ?
          </T>
          <T x={25} y={186} s={12} f={C.secondary} o={easeOut(seg(s, 1.6, 2.0))}>
            not necessarily: merge the ten, read it
          </T>
        </g>
      )}
    </Svg>
  );
}
