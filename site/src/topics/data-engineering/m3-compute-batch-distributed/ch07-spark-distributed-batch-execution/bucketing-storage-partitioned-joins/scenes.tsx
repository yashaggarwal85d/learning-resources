import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** A table's buckets as a column of `n` cells between y0 and y0 + 140 at x, `w` wide. */
function Buckets({ x, n, y0 = 30, w = 110, k = 1, f = C.latte, label }: { x: number; n: number; y0?: number; w?: number; k?: number; f?: string; label: string }) {
  const h = (140 - (n - 1) * 6) / n;
  return (
    <g opacity={k}>
      <T x={x} y={y0 - 10} s={11} f={C.latte}>
        {label}
      </T>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y0 + i * (h + 6)} width={w} height={h} rx={2} fill={C.cocoa} stroke={f} strokeWidth={1.4} />
      ))}
    </g>
  );
}
/** The y centre of bucket i of n. */
const by = (i: number, n: number, y0 = 30) => {
  const h = (140 - (n - 1) * 6) / n;
  return y0 + i * (h + 6) + h / 2;
};

// 1 · Hook. Two tables, each written split by k into matching pieces; the join between them: does its shuffle vanish?
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two tables, already split the same way at write time. Does the join skip the shuffle entirely?" h={200}>
      <Buckets x={25} n={4} label="left, split by k" k={easeOut(seg(t, 0.2, 0.6))} />
      <Buckets x={430} n={4} label="right, split by k" k={easeOut(seg(t, 0.6, 1.0))} />
      <rect x={290} y={30} width={14} height={140} rx={2} fill="none" stroke={C.second} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.4, 1.8)) * (0.5 + 0.5 * Math.sin(t * 3))} />
      <T x={297} y={192} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        a shuffle here, or none?
      </T>
    </Svg>
  );
}

// 2 · Matched buckets. Bucket i joins straight to bucket i; no Exchange; both sides tagged Bucketed: true.
export function RevealMatchedBuckets({ t }: StepCtx) {
  const l = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="measured: zero Exchange at all. Both scans are tagged as a bucketed read." h={200}>
      <Buckets x={25} n={4} label="left · 4 buckets" f={C.focus} />
      <Buckets x={430} n={4} label="right · 4 buckets" f={C.focus} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={137} y1={by(i, 4)} x2={lerp(137, 428, l)} y2={by(i, 4)} stroke={C.focus} strokeWidth={1.6} />
      ))}
      <T x={297} y={192} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
        Exchange: 0 · Bucketed: true × 2
      </T>
    </Svg>
  );
}

// 3 · Predict. The right table re-split into 6 pieces; the 4 ↔ 6 lines cannot pair up.
export function PredictMismatchedCount({ t, answer }: StepCtx) {
  return (
    <Svg label="same join key, but the two tables don't agree on how many buckets. Still free?" h={200}>
      <Buckets x={25} n={4} label="left · 4 buckets" k={easeOut(seg(t, 0.1, 0.4))} />
      <Buckets x={430} n={6} label="right · 6 buckets" f={C.second} k={easeOut(seg(t, 0.4, 0.8))} />
      <T x={297} y={100} s={14} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        4 ↔ 6 ?
      </T>
      <Verdict answer={answer} y={192} text="not free: the counts must match" />
    </Svg>
  );
}

// 4 · Mismatch, measured. An Exchange bar rises; the left side's own tag flips to Bucketed: false (disabled by the planner).
export function RevealMismatchDisablesBoth({ t }: StepCtx) {
  const e = easeOut(seg(t, 0.6, 1.2));
  const fl = t > 2.0;
  return (
    <Svg label="measured: one real shuffle. The side that still matches on its own loses its bucketed read too." h={200}>
      <Buckets x={25} n={4} label="left · 4 buckets" f={fl ? C.cherryText : C.latte} />
      <Buckets x={430} n={6} label="right · 6 buckets" f={C.second} />
      <rect x={290} y={30} width={14} height={140 * e} rx={2} fill={C.second} />
      <T x={175} y={100} s={11} f={C.second} o={e}>
        Exchange: 1
      </T>
      <T x={25} y={192} s={11} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        left: Bucketed: false (disabled by query planner)
      </T>
    </Svg>
  );
}

// 5 · Predict. A DSv2 table (Iceberg) that reports its own partitioning: the same bucketBy underneath?
export function PredictDsv2Table({ t, answer }: StepCtx) {
  return (
    <Svg label="a DSv2 table, like Iceberg, partitioned the same way. Same bucketing mechanism underneath, or something else?" h={200}>
      <Cell x={25} y={24} w={170} h={30} label="Iceberg table" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={360} y={24} w={190} h={30} label="Spark's planner" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
      <Req x1={197} x2={355} y={39} k={easeInOut(seg(t, 0.8, 1.4))} label="my layout is…" f={C.second} />
      <T x={25} y={92} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        no bucketBy call anywhere?
      </T>
      <AnswerRow y={140} label="the mechanism" answer={answer} value="a different one" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="the catalog reports; Spark trusts it" />
    </Svg>
  );
}

// 6 · Storage-partitioned join (sourced). The table's catalog report replaces the bucketBy chip; the same zero-Exchange lines appear.
export function RevealStoragePartitionedJoin({ t }: StepCtx) {
  const l = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="sourced: a different mechanism entirely. The table's own reported layout, not a bucketBy call." h={200}>
      <Buckets x={25} n={4} label="Iceberg, reported layout" f={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Buckets x={430} n={4} label="reported layout" f={C.second} k={easeOut(seg(t, 0.4, 0.8))} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={137} y1={by(i, 4)} x2={lerp(137, 428, l)} y2={by(i, 4)} stroke={C.focus} strokeWidth={1.6} />
      ))}
      <T x={297} y={192} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        same result: no Exchange, a different road
      </T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bucketing pre-splits at write time; the match has to be exact; SPJ generalises the same idea to a table's own layout." h={250}>
      <Row y={40} label="split at write" value="no join shuffle" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="the agreement" value="exact, or withdrawn" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="a table format" value="reports its layout" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
