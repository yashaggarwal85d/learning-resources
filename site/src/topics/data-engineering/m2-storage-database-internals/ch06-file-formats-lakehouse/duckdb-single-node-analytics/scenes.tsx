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

/** The one process: a wide outlined box with a title, holding whatever children the scene puts inside it. */
function Proc({ y = 14, h = 110, k = 1, label = 'your Python process' }: { y?: number; h?: number; k?: number; label?: string }) {
  return (
    <g opacity={k}>
      <rect x={20} y={y} width={555} height={h} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.4} />
      <T x={34} y={y + 22} s={11} f={C.latte}>
        {label}
      </T>
    </g>
  );
}

/** A narrow-question scan: a file of `n` row ticks; matching ticks stay lit, the rest dim once pushdown `p` runs. */
function PushdownScan({ t, label, fmt }: { t: number; label: string; fmt: string }) {
  const p = easeInOut(seg(t, 1.6, 2.6));
  return (
    <g>
      <Cell x={25} y={20} w={200} h={30} label={label} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={250} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        {fmt}
      </T>
      <Req x1={25} x2={210} y={76} k={easeOut(seg(t, 0.8, 1.4))} label="WHERE status = 'error'" f={C.second} />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={25 + i * 13.5} y={96} width={10} height={40} fill={i % 10 === 3 ? C.focus : C.latte} opacity={easeOut(seg(t, 0.3, 0.7)) * (i % 10 === 3 ? 1 : 1 - 0.8 * p)} />
      ))}
      <Row y={176} label="500,000 rows" value={p > 0.9 ? '500 match' : '…'} valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
    </g>
  );
}

// 1 · Hook. A server box with its own heartbeat to keep alive, then the engine folding inside the process you're already in.
export function Hook({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="a dedicated server, still a system to run. the opposite extreme: no server process at all. duckdb." h={200}>
      <Cell x={lerp(380, 120, f)} y={lerp(30, 70, f)} w={150} h={30} label={f < 0.5 ? 'a server to run' : 'DuckDB'} stroke={f < 0.5 ? C.mocha : C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={540} cy={45} r={4 + 2 * Math.sin(t * 6)} fill={C.cherryText} opacity={1 - f} />
      <Proc y={20} h={110} k={easeOut(seg(t, 1.2, 1.6))} label="the process you're already in" />
      <T x={300} y={170} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        no server to keep alive
      </T>
    </Svg>
  );
}

// 2 · Predict. A dataframe and the engine sit in one process; does SQL need an export round trip, or a direct reach?
export function PredictDataFrameExport({ t, answer }: StepCtx) {
  return (
    <Svg label="a pandas dataframe sits in the same process. export it first, or query it directly?" h={200}>
      <Proc y={10} h={90} k={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={40} y={46} w={150} h={30} label="pandas_df" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={380} y={46} w={150} h={30} label="DuckDB" stroke={C.focus} o={easeOut(seg(t, 0.7, 1.0))} />
      <path d={`M192 61 h${180 * easeInOut(seg(t, 1.2, 1.9))}`} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="5 4" />
      <AnswerRow y={140} label="before SQL" answer={answer} value="query it directly" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="nothing written out, nothing reloaded" />
    </Svg>
  );
}

// 3 · DataFrame interop. A direct line from DuckDB into pandas_df returns sum 45; then into polars_df, sum 10. No export box between.
export function RevealDataFrameInterop({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.2));
  const b = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="a real pandas sum and a real polars sum, both queried directly, for real, no export step." h={230}>
      <Proc y={10} h={150} />
      <Cell x={400} y={70} w={150} h={30} label="DuckDB" stroke={C.focus} />
      <Cell x={40} y={44} w={170} h={30} label="pandas · 10 rows" />
      <Cell x={40} y={104} w={170} h={30} label="polars · 5 rows" />
      {[a, b].map((k, i) => (
        <g key={i} opacity={k > 0 ? 1 : 0}>
          <line x1={398} y1={59 + i * 60} x2={lerp(398, 215, k)} y2={59 + i * 60} stroke={C.focus} strokeWidth={1.8} />
          <path d={`M${lerp(398, 215, k)} ${59 + i * 60} l8 -5 v10 z`} fill={C.focus} />
        </g>
      ))}
      <T x={250} y={50} s={12} f={C.focus} o={easeOut(seg(t, 1.2, 1.6))}>
        sum(x) = 45
      </T>
      <T x={250} y={110} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        sum(y) = 10
      </T>
      <T x={25} y={200} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        no conversion step, either time
      </T>
    </Svg>
  );
}

// 4 · Vectorized and morsel-parallel. Batches of values (blocks, not dots) feed one lane, then four; the four-lane timer bar stops far
// short of the one-lane bar. Shapes only: the timing is machine-dependent.
export function RevealVectorizedMorsel({ t }: StepCtx) {
  const one = easeInOut(seg(t, 1.0, 3.6));
  const four = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="the identical aggregation, real wall-clock time, four threads well ahead of one." h={230}>
      <T x={25} y={28} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        batches, not single values
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={260 + i * 48} y={14} width={40} height={18} rx={2} fill={C.second} opacity={easeOut(seg(t, 0.2 + i * 0.08, 0.5 + i * 0.08))} />
      ))}
      <T x={25} y={74} s={12} f={C.crema} o={easeOut(seg(t, 0.8, 1.0))}>
        1 thread
      </T>
      <rect x={140} y={62} width={400 * one} height={14} fill={C.latte} />
      <T x={25} y={124} s={12} f={C.crema} o={easeOut(seg(t, 0.8, 1.0))}>
        4 threads
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={140} y={106 + i * 7} width={115 * four} height={5} fill={C.focus} />
      ))}
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        four lanes finish well ahead
      </T>
    </Svg>
  );
}

// 5 · Predict. A memory cap line; a 3,000,000-row sort's bar grows up to it and past.
export function PredictOverMemoryLimit({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="a sort bigger than the configured memory limit. does the query fail, or finish anyway?" h={200}>
      <T x={25} y={28} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        sort 3,000,000 rows
      </T>
      <rect x={25} y={40} width={Math.min(300, 480 * g)} height={16} fill={C.latte} />
      {480 * g > 300 && <rect x={325} y={40} width={480 * g - 300} height={16} fill={C.cherryText} />}
      <line x1={325} y1={32} x2={325} y2={66} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={325} y={84} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        memory_limit 200MB
      </T>
      <AnswerRow y={140} label="the sort" answer={answer} value="finishes anyway" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="the overflow goes to disk" />
    </Svg>
  );
}

// 6 · Out-of-core spill. The over-cap part of the bar peels off into spill files that land on a disk shelf; memory stays under the line;
// the row count reads off.
export function RevealOutOfCoreSpill({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="real spill files land on disk, under the memory limit, and the full row count still comes back right." h={230}>
      <T x={25} y={28} s={12} f={C.latte}>
        in memory
      </T>
      <rect x={25} y={40} width={300} height={16} fill={C.latte} />
      <line x1={325} y1={32} x2={325} y2={66} stroke={C.second} strokeWidth={2} />
      {[0, 1, 2].map((i) => {
        const k = clamp(sp * 3 - i);
        return <rect key={i} x={lerp(330 + i * 60, 200 + i * 70, easeOut(k))} y={lerp(40, 116, easeOut(k))} width={56} height={16} rx={2} fill={C.cherryText} opacity={k > 0 ? 1 : 0} />;
      })}
      <line x1={180} y1={138} x2={430} y2={138} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={136} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        disk
      </T>
      <T x={450} y={136} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
        spill files
      </T>
      <Row y={196} label="rows sorted" value={num(Math.round(lerp(0, 3000000, easeOut(seg(t, 2.6, 3.6)))))} valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}

// 7 · Iceberg, directly. One file of row ticks; the filter rides into the scan and nine in ten blocks dim before they are touched.
export function RevealIcebergDirectQuery({ t }: StepCtx) {
  return (
    <Svg label="a real local iceberg table, queried directly -- the filter pushed into the parquet scan itself, for real." h={230}>
      <PushdownScan t={t} label="iceberg_scan(...)" fmt="no server, no catalog service" />
    </Svg>
  );
}

// 8 · Delta, directly. The same scan shape against a Delta table: same narrow question, same 500.
export function RevealDeltaDirectQuery({ t }: StepCtx) {
  return (
    <Svg label="the identical shape against a real local delta table -- no spark anywhere, same correct count." h={230}>
      <PushdownScan t={t} label="delta_scan(...)" fmt="a different project, same reach" />
    </Svg>
  );
}

// 9 · DuckLake. The catalog is an ordinary table beside the data: each write adds a plain snapshot row.
export function RevealDuckLakeCatalog({ t }: StepCtx) {
  const rows: [string, number][] = [
    ['snapshot 0 · empty', 0.3],
    ['snapshot 1 · 1,000 rows', 1.2],
    ['snapshot 2 · 1,500 rows', 2.4],
  ];
  return (
    <Svg label="two real writes become two real, independently queryable versioned snapshots -- the catalog is just sql." h={230}>
      <Cell x={25} y={20} w={150} h={30} label="data files" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={230} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        ducklake_snapshots: an ordinary table
      </T>
      {rows.map(([l, s], i) => {
        const k = easeOut(seg(t, s, s + 0.4));
        return (
          <g key={l} opacity={k} transform={`translate(${((1 - k) * 20).toFixed(2)} 0)`}>
            <rect x={230} y={44 + i * 40} width={320} height={30} rx={3} fill={C.cocoa} stroke={i === 0 ? C.mocha : C.focus} strokeWidth={1.4} />
            <T x={244} y={64 + i * 40} s={12} f={i === 0 ? C.latte : C.crema}>
              {l}
            </T>
          </g>
        );
      })}
      <Req x1={25} x2={225} y={112} k={easeOut(seg(t, 1.0, 1.3))} label="write 1" f={C.second} />
      <Req x1={25} x2={225} y={152} k={easeOut(seg(t, 2.2, 2.5))} label="write 2" f={C.second} />
      <T x={230} y={200} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        each version, queryable as plain rows
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['no service', 'in your process'],
    ['batches', 'split across workers'],
    ['overflow', 'spilled, never failed'],
    ['formats', 'read directly'],
  ];
  return (
    <Svg label="in-process, vectorized, morsel-parallel, spills when it must, reads iceberg, delta and ducklake directly. next: snowflake." h={250}>
      {rows.map(([a, b], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={i === 3 ? C.focus : C.crema} k={easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8))} />
      ))}
    </Svg>
  );
}
