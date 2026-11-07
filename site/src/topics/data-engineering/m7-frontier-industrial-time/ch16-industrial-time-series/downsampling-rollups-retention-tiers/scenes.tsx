import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Downsampling, rollups and retention tiers: hourly means over their sample counts, merge rules row by row, rollup
// cards merged against raw, a late reading reopening one bucket, three tiers with stitched queries, and a spike.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

// examples.py's day: 24 hours, 60 samples an hour averaging 208, except hour 3 (a restart): 3 samples averaging 279.
const HX = (h: number) => 70 + h * 20;
const MEAN = (h: number) => (h === 3 ? 279 : 208);
const COUNT = (h: number) => (h === 3 ? 3 : 60);
const my = (v: number) => Math.max(26, 130 - (v - 206) * 6);

/** The 24 hourly means as dots, with their sample counts as bars beneath (hidden when `counts` is 0). */
function Day({ k, counts, redRestart = false }: { k: number; counts: number; redRestart?: boolean }) {
  return (
    <g>
      {Array.from({ length: 24 }, (_, h) => {
        const kk = Math.min(1, Math.max(0, k * 24 - h));
        return kk <= 0 ? null : (
          <g key={h} opacity={kk}>
            <circle cx={HX(h)} cy={my(MEAN(h))} r={4} fill={h === 3 ? C.second : C.primary} />
            {counts > 0 && <rect x={HX(h) - 6} y={190 - COUNT(h) * 0.5 * counts} width={12} height={COUNT(h) * 0.5 * counts} fill={h === 3 && redRestart ? C.badText : C.line} />}
          </g>
        );
      })}
    </g>
  );
}

// 1 · The day draws hour by hour: a mean dot per hour and its sample count as a bar. Hour 3's dot sits high at 279 on a
// sliver of a bar (3 samples). Then two lines settle: the average of the 24 means at 210.96 (red, pulled up by hour 3)
// and the raw mean at 208.15.
export function Hook({ t }: StepCtx) {
  const naive = easeOut(seg(t, 2.6, 3.2));
  const truth = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="a daily mean built from averaging hourly means disagrees with the raw mean, because a restart hour's tiny sample count was weighted equally with every full hour" h={200}>
      <Day k={easeOut(seg(t, 0.2, 2.2))} counts={1} redRestart={naive > 0} />
      <T x={HX(3) + 10} y={my(279) + 4} s={12} f={C.second} o={easeOut(seg(t, 1.0, 1.4))}>
        restart hour: 3 samples, 279 ↑
      </T>
      {naive > 0 && <line x1={60} y1={my(210.96)} x2={lerp(60, 540, naive)} y2={my(210.96)} stroke={C.badText} strokeWidth={1.6} strokeDasharray="5 3" />}
      {truth > 0 && <line x1={60} y1={my(208.15)} x2={lerp(60, 540, truth)} y2={my(208.15)} stroke={C.focus} strokeWidth={1.4} />}
      <T x={575} y={my(210.96) - 6} s={13} f={C.badText} a="end" o={naive}>
        mean of means 210.96
      </T>
      <T x={575} y={my(208.15) + 18} s={13} f={C.focus} a="end" o={truth}>
        raw 208.15
      </T>
    </Svg>
  );
}

// 2 · Two rollups, hour 0 and the restart hour 3, side by side. Row by row their fields merge: min 206, max 280,
// sum 13,317, count 63 — each with a tick. The last row, p50 (208 and 279), has no merge rule: ✕.
const MROWS: [string, string, string, string][] = [
  ['min', '206', '278', '206'],
  ['max', '210', '280', '280'],
  ['sum', '12,480', '837', '13,317'],
  ['count', '60', '3', '63'],
  ['p50', '208', '279', '?'],
];
export function RevealMergeableAggregates({ t }: StepCtx) {
  return (
    <Svg label="a minimum, a maximum, a sum and a count can each be merged from two rollups into the rollup of their union; a quantile can't be merged this way at all" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={250} y={22} s={12} f={C.quiet} a="end">
          hour 0
        </T>
        <T x={360} y={22} s={12} f={C.quiet} a="end">
          hour 3
        </T>
        <T x={520} y={22} s={12} f={C.quiet} a="end">
          merged
        </T>
      </g>
      {MROWS.map(([l, a, b, m], i) => {
        const y = 52 + i * 36;
        const row = easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15));
        const mk = easeOut(seg(t, 1.0 + i * 0.6, 1.4 + i * 0.6));
        const bad = i === 4;
        return (
          <g key={l}>
            <T x={40} y={y} s={14} f={bad ? C.badText : C.primary} o={row}>
              {l}
            </T>
            <T x={250} y={y} s={14} f={C.secondary} a="end" o={row}>
              {a}
            </T>
            <T x={360} y={y} s={14} f={C.second} a="end" o={row}>
              {b}
            </T>
            {mk > 0 && <path d={`M372 ${y - 5} h${50 * mk}`} stroke={bad ? C.badText : C.line} strokeWidth={1.4} />}
            <T x={520} y={y} s={15} f={bad ? C.badText : C.focus} a="end" o={mk}>
              {m}
            </T>
            {bad ? <Cross x={548} y={y - 5} k={easeOutBack(seg(t, 3.6, 4.0))} /> : <Tick x={544} y={y - 5} k={mk} />}
          </g>
        );
      })}
    </Svg>
  );
}

/** A small rollup card: two lines, sum and count. */
const Card = ({ x, y, title, sum, count, o, color = C.line }: { x: number; y: number; title: string; sum: string; count: string; o: number; color?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={150} height={74} rx={5} fill={C.panel} stroke={color} />
      <T x={x + 12} y={y + 20} s={12} f={C.quiet}>
        {title}
      </T>
      <T x={x + 12} y={y + 42} s={13} f={C.primary}>
        {`sum ${sum}`}
      </T>
      <T x={x + 12} y={y + 62} s={13} f={C.primary}>
        {`count ${count}`}
      </T>
    </g>
  );

// 3 · Two rollup cards — hour 2 (12,480 / 60) and hour 3 (837 / 3) — slide together into one merged card,
// 13,317 / 63. Before the answer a raw card waits with "?". After it, the raw card fills with the same two numbers and
// a tick joins them: mean 211.38 either way.
export function PredictMerge({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const slide = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="two hourly rollups, storing sum and count instead of an average, are merged into one — does the merged result equal computing directly from every raw reading?" h={200}>
      <Card x={lerp(20, 60, slide)} y={lerp(14, 60, slide)} title="hour 2" sum="12,480" count="60" o={easeOut(seg(t, 0, 0.4)) * (1 - easeOut(seg(t, 1.6, 1.9)))} />
      <Card x={lerp(20, 60, slide)} y={lerp(106, 60, slide)} title="hour 3" sum="837" count="3" o={easeOut(seg(t, 0.2, 0.6)) * (1 - easeOut(seg(t, 1.6, 1.9)))} color={C.second} />
      <Card x={60} y={60} title="merged" sum="13,317" count="63" o={easeOut(seg(t, 1.7, 2.1))} color={C.focus} />
      <T x={300} y={104} s={20} f={C.secondary} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        =
      </T>
      {!on ? (
        <g opacity={easeOut(seg(t, 2.4, 2.8))}>
          <rect x={390} y={60} width={150} height={74} rx={5} fill={C.panel} stroke={C.line} strokeDasharray="4 3" />
          <T x={465} y={104} s={16} f={C.secondary} a="middle">
            raw?
          </T>
        </g>
      ) : (
        <g>
          <Card x={390} y={60} title="every raw reading" sum="13,317" count="63" o={easeOut(seg(s, 0.2, 0.6))} color={C.focus} />
          <Tick x={300} y={150} k={easeOut(seg(s, 0.6, 1.0))} />
          <T x={300} y={184} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 0.8, 1.2))}>
            mean 211.38 either way
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · The whole day on a number line from 207 to 212. The merged rollup's 287,877 ÷ 1,383 lands on 208.15 exactly on
// top of the raw mean (tick); the average of averages lands at 210.96, off to the side (✕).
const vx = (v: number) => 80 + (v - 207) * 90;
export function RevealMergedExactly({ t }: StepCtx) {
  const a = easeOutBack(seg(t, 1.0, 1.5));
  const b = easeOutBack(seg(t, 1.8, 2.3));
  const c = easeOutBack(seg(t, 3.0, 3.5));
  return (
    <Svg label="the merged sum and count equal the raw total and count exactly, so the derived mean matches — the naive average of hourly averages does not come close" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={80} y1={110} x2={530} y2={110} stroke={C.line} strokeWidth={1.2} />
        {[207, 208, 209, 210, 211, 212].map((v) => (
          <g key={v}>
            <line x1={vx(v)} y1={106} x2={vx(v)} y2={114} stroke={C.line} />
            <T x={vx(v)} y={132} s={12} f={C.quiet} a="middle">
              {String(v)}
            </T>
          </g>
        ))}
      </g>
      <circle cx={vx(208.15)} cy={110} r={7 * Math.min(1.2, a)} fill={C.focus} opacity={Math.min(1, a)} />
      <T x={vx(208.15)} y={40} s={13} f={C.focus} a="middle" o={Math.min(1, a)}>
        raw 208.15
      </T>
      <circle cx={vx(208.15)} cy={110} r={11} fill="none" stroke={C.second} strokeWidth={2} opacity={Math.min(1, b)} />
      <T x={vx(208.15)} y={62} s={12} f={C.second} a="middle" o={Math.min(1, b)}>
        287,877 ÷ 1,383
      </T>
      <Tick x={vx(208.15) + 22} y={88} k={easeOut(seg(t, 2.3, 2.6))} />
      <circle cx={vx(210.96)} cy={110} r={7 * Math.min(1.2, c)} fill={C.badText} opacity={Math.min(1, c)} />
      <T x={vx(210.96)} y={170} s={13} f={C.badText} a="middle" o={Math.min(1, c)}>
        mean of means 210.96
      </T>
      <Cross x={vx(210.96)} y={88} k={easeOutBack(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 5 · Twenty-four materialised buckets. A late reading of 500 drops into hour 3 alone; that bucket glows and its fields
// tick over — max 280 → 500, count 3 → 4, mean 279 → 334.25 — while every other bucket stays dim and untouched.
export function RevealLateData({ t }: StepCtx) {
  const drop = easeIn(seg(t, 0.8, 1.6));
  const upd = easeOut(seg(t, 1.8, 2.4));
  const rows: [string, string, string][] = [
    ['max', '280', '500'],
    ['count', '3', '4'],
    ['mean', '279', '334.25'],
  ];
  return (
    <Svg label="a reading arriving after its bucket was already materialized changes that bucket's max, count and mean — only the one affected bucket is recomputed" h={200}>
      {Array.from({ length: 24 }, (_, h) => (
        <rect
          key={h}
          x={HX(h) - 8}
          y={40}
          width={16}
          height={26}
          rx={2}
          fill={h === 3 && upd > 0 ? C.second : C.band}
          stroke={h === 3 ? C.second : C.line}
          opacity={easeOut(seg(t, 0, 0.4)) * (h === 3 || upd <= 0 ? 1 : lerp(1, 0.5, upd))}
        />
      ))}
      <T x={HX(3)} y={84} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        hour 3
      </T>
      {drop > 0 && drop < 1 && <circle cx={HX(3)} cy={lerp(0, 52, drop)} r={6} fill={C.focus} />}
      <T x={HX(3) + 16} y={20} s={13} f={C.focus} o={easeOut(seg(t, 0.4, 0.8)) * (1 - drop)}>
        late reading: 500
      </T>
      {rows.map(([l, a, b], i) => {
        const y = 118 + i * 28;
        return (
          <g key={l} opacity={easeOut(seg(t, 1.4 + i * 0.2, 1.8 + i * 0.2))}>
            <T x={70} y={y} s={14} f={C.secondary}>
              {l}
            </T>
            <T x={260} y={y} s={14} f={C.quiet} a="end">
              {a}
            </T>
            <T x={290} y={y} s={14} f={C.quiet}>
              →
            </T>
            <T x={420} y={y} s={15} f={C.focus} a="end" o={easeOut(seg(t, 2.0 + i * 0.3, 2.4 + i * 0.3))}>
              {b}
            </T>
          </g>
        );
      })}
      <T x={575} y={196} s={12} f={C.quiet} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        23 others untouched
      </T>
    </Svg>
  );
}

// 6 · Three tier bars on a log axis from 12 hours back to two years: raw to 7 days, minute rollups to 90, hour rollups to
// 730, each with its storage. Then three queries stretch out beneath: 12 h lights raw, 30 days lights minute, 200 days
// lights minute and hour together, joined by a stitch.
const lx = (d: number) => 170 + ((Math.log10(d) + 1) / (2.863 + 1)) * 350;
const TIERS: [string, number, string][] = [
  ['raw', 7, '9.68 MB'],
  ['minute', 90, '4.15 MB'],
  ['hour', 730, '0.56 MB'],
];
export function RevealThreeTiers({ t }: StepCtx) {
  const qs: [string, number, number[]][] = [
    ['12 h', 0.5, [0]],
    ['30 d', 30, [1]],
    ['200 d', 200, [1, 2]],
  ];
  const lit = (i: number) => qs.some(([, , tiers], q) => tiers.includes(i) && seg(t, 2.0 + q * 0.9, 2.4 + q * 0.9) > 0 && seg(t, 2.9 + q * 0.9, 3.0 + q * 0.9) < 1);
  return (
    <Svg label="raw for days, minute rollups for months, hour rollups for years; a short query reads raw, a long one reads the coarsest tier, and a spanning query stitches both" h={260}>
      {TIERS.map(([l, d, mb], i) => {
        const y = 30 + i * 38;
        const k = easeInOut(seg(t, 0.2 + i * 0.4, 0.8 + i * 0.4));
        return (
          <g key={l}>
            <T x={30} y={y + 15} s={14} f={C.primary} o={k}>
              {l}
            </T>
            <rect x={lx(0.1)} y={y} width={(lx(d) - lx(0.1)) * k} height={22} fill={lit(i) ? C.focus : i === 0 ? C.primary : i === 1 ? C.secondary : C.quiet} />
            <T x={lx(0.1) + 8} y={y + 15} s={12} f={C.ink} o={easeOut(seg(t, 0.8 + i * 0.4, 1.1 + i * 0.4))}>
              {mb}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.4, 1.8))}>
        {[
          [0.5, '12 h'],
          [7, '7 d'],
          [90, '90 d'],
          [730, '2 y'],
        ].map(([d, l]) => (
          <T key={l as string} x={lx(d as number)} y={152} s={12} f={C.quiet} a="middle">
            {l as string}
          </T>
        ))}
      </g>
      {qs.map(([l, d, tiers], q) => {
        const y = 176 + q * 28;
        const k = easeInOut(seg(t, 2.0 + q * 0.9, 2.6 + q * 0.9));
        return (
          <g key={l} opacity={Math.min(1, k * 2)}>
            <T x={30} y={y + 5} s={12} f={C.secondary}>
              {`query ${l}`}
            </T>
            <line x1={lx(0.1)} y1={y} x2={lerp(lx(0.1), lx(d), k)} y2={y} stroke={C.second} strokeWidth={3} />
            <T x={575} y={y + 5} s={13} f={tiers.length > 1 ? C.focus : C.primary} a="end" o={easeOut(seg(t, 2.6 + q * 0.9, 2.9 + q * 0.9))}>
              {tiers.length > 1 ? 'stitched' : TIERS[tiers[0]][0]}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Hour 10's sixty samples as dots near 208; three of them shoot up to 600. The mean line lifts only to 227.6; the
// max marker rides the spike to 600 exactly.
const py = (v: number) => 176 - (v - 200) * 0.36;
export function RevealSpike({ t }: StepCtx) {
  const up = easeOutBack(seg(t, 0.8, 1.4));
  const mean = easeOut(seg(t, 1.8, 2.6));
  const mx = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a single real spike in one bucket barely moves that bucket's mean, while the same bucket's max shows the spike exactly" h={200}>
      {Array.from({ length: 60 }, (_, i) => {
        const spike = i % 20 === 0;
        const v = spike ? lerp(208 + ((i % 5) - 2), 600, up) : 208 + ((i % 5) - 2);
        return <circle key={i} cx={70 + i * 6.6} cy={py(v)} r={2.6} fill={spike && up > 0 ? C.badText : C.primary} opacity={easeOut(seg(t, 0, 0.5))} />;
      })}
      {mean > 0 && <line x1={60} y1={py(lerp(208, 227.6, mean))} x2={470} y2={py(lerp(208, 227.6, mean))} stroke={C.second} strokeWidth={2} />}
      <T x={575} y={py(227.6) + 4} s={14} f={C.second} a="end" o={mean}>
        mean 227.6
      </T>
      {mx > 0 && <line x1={60} y1={py(600)} x2={lerp(60, 470, mx)} y2={py(600)} stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 3" />}
      <T x={575} y={py(600) + 4} s={14} f={C.focus} a="end" o={mx}>
        max 600
      </T>
      <T x={70} y={196} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.5))}>
        hour 10, 60 samples
      </T>
    </Svg>
  );
}

// 8 · Four rows, each with a glyph of its picture.
const GLYPH = [
  (k: number) => (
    <g>
      <rect x={30} y={-14} width={28} height={16} rx={2} fill="none" stroke={C.line} />
      <rect x={lerp(76, 62, k)} y={-14} width={28} height={16} rx={2} fill="none" stroke={C.second} />
    </g>
  ),
  (k: number) => (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 18} y={-12} width={14} height={14} fill={i === 1 && k > 0.5 ? C.second : C.band} stroke={C.line} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-14} width={40} height={7} fill={C.secondary} />
      <rect x={30} y={-4} width={80} height={7} fill={C.line} />
      <line x1={30} y1={8} x2={lerp(30, 100, k)} y2={8} stroke={C.second} strokeWidth={2} />
    </g>
  ),
  (k: number) => (
    <g>
      <line x1={30} y1={-2} x2={100} y2={-2} stroke={C.second} strokeWidth={2} />
      <line x1={30} y1={-14} x2={lerp(30, 100, k)} y2={-14} stroke={C.focus} strokeDasharray="4 2" />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['derive the mean, never store it', 'a late reading reopens one bucket', 'a long query stitches tiers', 'mean and max keep different truths'];
  return (
    <Svg label="only mergeable aggregates survive a rollup, a late reading reopens its bucket, a spanning query stitches tiers, and a mean and a max keep different truths" h={260}>
      {rows.map((r, i) => {
        const a = 0.3 + i * 1.15;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.9));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${50 + i * 56})`}>
            {GLYPH[i](k)}
            <T x={130} y={0} s={14} f={C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · The day's 24 mean dots and one daily figure, but no count bars beneath — just "?". After the answer the counts
// rise into place and hour 3's sliver (3 samples) lights red: without them, the daily number can't be checked.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const counts = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="a dashboard reports a daily mean with no record of how many samples went into each hour behind it — is that daily number trustworthy on its own?" h={200}>
      <Day k={easeOut(seg(t, 0.2, 1.6))} counts={counts} redRestart={counts > 0.5} />
      <T x={575} y={56} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.4, 1.8))}>
        daily mean, no counts kept
      </T>
      {!on ? (
        <T x={300} y={180} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          samples per hour: ?
        </T>
      ) : (
        <T x={575} y={80} s={13} f={C.badText} a="end" o={easeOut(seg(s, 0.9, 1.3))}>
          can't be checked
        </T>
      )}
    </Svg>
  );
}
