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

const OPEN = ['Trino', 'ClickHouse', 'DuckDB'];
const WH = ['Snowflake', 'BigQuery', 'Redshift'];
/** BigQuery's on-demand rate per byte against Redshift Spectrum's, from examples.py's own constants: 6.25 per TiB versus 5 per TB. */
const BQ_PER_BYTE = 6.25 / 1024 ** 4;
const RS_PER_BYTE = 5 / 1000 ** 4;

// 1 · Hook. Six engine cards in two rows, each sourced on its own terms; one question box drops in under them.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="three proprietary engines, now taught on their own terms. one question was left for all of them." h={200}>
      {[...OPEN, ...WH].map((e, i) => (
        <Cell key={e} x={25 + (i % 3) * 185} y={20 + Math.floor(i / 3) * 44} w={170} h={28} label={e} stroke={i < 3 ? C.mocha : C.second} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} />
      ))}
      <Cell x={150} y={130} w={300} h={34} label="which one, and when?" stroke={C.focus} o={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}

// 2 · Predict. A real local Iceberg table with DuckDB beside it, against a stack of published price sheets: which gives a usable number?
export function PredictMeasureOrLookup({ t, answer }: StepCtx) {
  return (
    <Svg label="a real local iceberg table sits in this sandbox. a real query, or a published price -- which gives a usable number today?" h={200}>
      <Cell x={25} y={20} w={200} h={30} label="DuckDB + Iceberg, here" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={360 + i * 8} y={16 + i * 6} width={150} height={34} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} />
      ))}
      <T x={384} y={50} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        published prices
      </T>
      <T x={300} y={40} s={13} f={C.second} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        or
      </T>
      <AnswerRow y={130} label="a usable number" answer={answer} value="both, side by side" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={178} text="measure what runs here; source the rest" />
    </Svg>
  );
}

// 3 · Six engines. Left: the three this chapter ran, each ticked. Right: the three read from their docs, each with a page mark.
export function RevealSixEngines({ t }: StepCtx) {
  return (
    <Svg label="three open engines this chapter built; three warehouses this chapter sourced. six engines, one comparison." h={230}>
      <T x={25} y={24} s={12} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))}>
        ran here, by hand
      </T>
      <T x={320} y={24} s={12} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        read from their docs
      </T>
      {OPEN.map((e, i) => (
        <g key={e}>
          <Cell x={25} y={40 + i * 44} w={170} h={28} label={e} stroke={C.focus} o={easeOut(seg(t, 0.3 + i * 0.25, 0.6 + i * 0.25))} />
          <MiniTick x={208} y={54 + i * 44} k={easeOut(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25))} />
        </g>
      ))}
      {WH.map((e, i) => (
        <g key={e}>
          <Cell x={320} y={40 + i * 44} w={170} h={28} label={e} stroke={C.second} o={easeOut(seg(t, 1.6 + i * 0.25, 1.9 + i * 0.25))} />
          <path d={`M505 ${44 + i * 44} h14 l6 6 v14 h-20 z`} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 1.9 + i * 0.25, 2.2 + i * 0.25))} />
        </g>
      ))}
      <T x={300} y={200} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        by design: six engines, one comparison
      </T>
    </Svg>
  );
}

// 4 · Concurrency. One query's bar never shortens; instead more lanes appear on both sides. Open: you add nodes. Warehouse: clusters
// and slot pools the vendor runs.
export function RevealIsolationConcurrency({ t }: StepCtx) {
  const lanes = (x: number, t0: number, f: string) =>
    [0, 1, 2, 3].map((i) => {
      const k = easeOut(seg(t, t0 + i * 0.4, t0 + 0.3 + i * 0.4));
      return <rect key={i} x={x} y={50 + i * 22} width={160 * k} height={12} rx={2} fill={f} opacity={i === 0 ? 1 : 0.75} />;
    });
  return (
    <Svg label="open engines scale by adding nodes or replicas; warehouses scale concurrency with multi-cluster and slot pools." h={230}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        open engines
      </T>
      {lanes(25, 0.3, C.focus)}
      <T x={320} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        warehouses
      </T>
      {lanes(320, 0.3, C.second)}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        add nodes or replicas
      </T>
      <T x={320} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        more clusters, slot pools
      </T>
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        your machines
      </T>
      <T x={320} y={190} s={12} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        the vendor's machines
      </T>
      <T x={25} y={220} s={11} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        no query got faster: more of them run at once
      </T>
    </Svg>
  );
}

// 5 · Two kinds of tuning. Left: one query passes through the optimizer and out. Right: a table's blocks are reshuffled overnight;
// the warehouses that do it tick in.
export function RevealCostTuning({ t }: StepCtx) {
  const q = easeInOut(seg(t, 0.4, 1.6));
  const sh = easeInOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="open engines optimize the query plan only; warehouses also tune storage layout automatically, no admin needed." h={230}>
      <Cell x={95} y={40} w={120} h={30} label="optimizer" o={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={lerp(25, 285, q)} cy={55} r={5} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        one query, passing through
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const from = (i * 4) % 6;
        return <rect key={i} x={330 + lerp(from, i, sh) * 38} y={40} width={32} height={30} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 1.4, 1.8))} />;
      })}
      <T x={330} y={100} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        the table itself, reshaped
      </T>
      {['Snowflake', 'BigQuery', 'Redshift'].map((e, i) => (
        <g key={e} opacity={easeOut(seg(t, 3.0 + i * 0.3, 3.3 + i * 0.3))}>
          <T x={330} y={140 + i * 28} s={12} f={C.crema}>
            {e}
          </T>
          <MiniTick x={450} y={134 + i * 28} k={1} f={C.second} />
        </g>
      ))}
    </Svg>
  );
}

// 6 · Predict. One measured scan, drawn as a bar; two published rate tags hang next to it. Which prices it higher?
export function PredictBigQueryVsRedshift({ t, answer }: StepCtx) {
  return (
    <Svg label="duckdb scans a real iceberg table for real. which warehouse's own published rate prices that same scan higher?" h={200}>
      <T x={25} y={24} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        bytes scanned, measured
      </T>
      <rect x={25} y={34} width={220 * easeOut(seg(t, 0.3, 1.0))} height={14} fill={C.focus} />
      <Cell x={300} y={20} w={120} h={28} label="$6.25 / TiB" o={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={430} y={20} w={120} h={28} label="$5 / TB" o={easeOut(seg(t, 1.4, 1.7))} />
      <T x={300} y={74} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        BigQuery
      </T>
      <T x={430} y={74} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        Redshift Spectrum
      </T>
      <AnswerRow y={130} label="prices it higher" answer={answer} value="BigQuery on-demand" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={178} text="a TiB holds more bytes than a TB" />
    </Svg>
  );
}

// 7 · The real measurement. The measured bar from DuckDB's own plan feeds two multipliers; BigQuery's cost bar ends past Redshift's,
// in the true ratio of the two rates; Snowflake's slot stays an empty dashed outline.
export function RevealRealMeasurement({ t }: StepCtx) {
  const m = easeOut(seg(t, 0.2, 0.9));
  const bq = easeOut(seg(t, 1.6, 2.4));
  const rs = easeOut(seg(t, 2.0, 2.8));
  const wb = 300;
  const wr = (wb * RS_PER_BYTE) / BQ_PER_BYTE;
  return (
    <Svg label="one real duckdb scan, two sourced warehouse rates applied to it. snowflake bills compute time, not bytes, so no third figure." h={230}>
      <T x={25} y={24} s={12} f={C.focus} o={m}>
        EXPLAIN ANALYZE: Data Read
      </T>
      <rect x={25} y={34} width={220 * m} height={14} fill={C.focus} />
      <T x={25} y={84} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        BigQuery
      </T>
      <rect x={180} y={74} width={wb * bq} height={14} fill={C.second} />
      <T x={25} y={124} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        Redshift Spectrum
      </T>
      <rect x={180} y={114} width={wr * rs} height={14} fill={C.latte} />
      <T x={25} y={164} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        Snowflake
      </T>
      <rect x={180} y={154} width={300} height={14} fill="none" stroke={C.mocha} strokeDasharray="5 4" opacity={easeOut(seg(t, 3.0, 3.4))} />
      <T x={25} y={204} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        bills compute time, not bytes: no figure
      </T>
    </Svg>
  );
}

// 8 · Gravity and governance. Left: the open engine's query reaches the data where it lies, no catalog padlock. Right: a region line
// with an egress charge on crossing, and governance locked inside the billing account.
export function RevealGravityGovernance({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.2));
  const c = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="open engines query data where it sits, no catalog lock-in; warehouses add egress across regions and their own governance." h={230}>
      <Cell x={25} y={30} w={120} h={28} label="open engine" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={147} x2={245} y={44} k={a} f={C.focus} />
      <Cell x={150} y={100} w={100} h={28} label="your data" o={easeOut(seg(t, 0.1, 0.4))} />
      <path d={`M200 ${98} V${lerp(98, 64, a)}`} stroke={C.mocha} strokeWidth={1.2} />
      <T x={25} y={170} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        owns nothing, so locks in nothing
      </T>
      <line x1={440} y1={20} x2={440} y2={140} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="6 4" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <Cell x={310} y={30} w={110} h={28} label="warehouse" stroke={C.second} o={easeOut(seg(t, 1.6, 2.0))} />
      <circle cx={lerp(365, 520, c)} cy={90} r={6} fill={C.cherryText} opacity={c > 0 ? 1 : 0} />
      <T x={455} y={124} s={11} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        egress
      </T>
      <Lock x={330} y={110} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={310} y={170} s={11} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        governance, inside the account
      </T>
      <T x={300} y={212} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        neither is free: different currencies
      </T>
    </Svg>
  );
}

// 9 · Synthesis. A balance beam that tips one way, then the other, then settles level: what you buy decides.
export function RevealSynthesis({ t }: StepCtx) {
  const tilt = 8 * Math.sin(seg(t, 0.6, 2.6) * Math.PI * 2) * (1 - seg(t, 2.0, 2.8));
  return (
    <Svg label="a warehouse wins when its governance and pooled concurrency are worth paying for; a lakehouse engine wins on compute you already own." h={230}>
      <path d="M300 120 l-14 30 h28 z" fill={C.mocha} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <g transform={`rotate(${tilt.toFixed(2)} 300 120)`} opacity={easeOut(seg(t, 0.1, 0.4))}>
        <line x1={100} y1={120} x2={500} y2={120} stroke={C.latte} strokeWidth={3} />
        <rect x={60} y={86} width={150} height={30} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} />
        <rect x={390} y={86} width={150} height={30} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} />
      </g>
      <T x={135} y={40} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        warehouse
      </T>
      <T x={465} y={40} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        lakehouse engine
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        governance, pooled concurrency: real purchases
      </T>
      <T x={25} y={216} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        or compute you already own
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="six engines, five dimensions, one real measurement and two sourced estimates on top of it. next: turning stored data into more stored data." h={250}>
      <Row y={40} label="six engines" value="one comparison" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="one measurement" value="run for real, here" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="two estimates" value="sourced rates on top" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
