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

/** A strip of `n` granule cells from x0 to x1 at y; `lit(i)` returns 1 for a read granule, 0 for a skipped one, between for fading. */
function Granules({ n, y, x0 = 25, x1 = 575, h = 26, lit, o = 1 }: { n: number; y: number; x0?: number; x1?: number; h?: number; lit: (i: number) => number; o?: number }) {
  const w = (x1 - x0) / n;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const l = lit(i);
        return <rect key={i} x={x0 + i * w + 1} y={y} width={w - 2} height={h} rx={1.5} fill={l > 0.5 ? C.focus : C.mocha} opacity={0.3 + 0.7 * l} />;
      })}
    </g>
  );
}

/** A part file: a cocoa box with a row-count label. */
function Part({ x, y, w = 150, label, k = 1, stroke = C.latte, dash = false }: { x: number; y: number; w?: number; label: string; k?: number; stroke?: string; dash?: boolean }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={w} height={34} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.6} strokeDasharray={dash ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + 22} s={12} f={C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

// 1 · Hook. Trino with a dashed, empty storage slot under it; ClickHouse with a solid disk of its own.
export function Hook({ t }: StepCtx) {
  const d = easeOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="trino owns no storage of its own. what if the engine owned it directly? clickhouse." h={200}>
      <Cell x={60} y={30} w={140} h={30} label="Trino" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={60} y={90} width={140} height={40} rx={4} fill="none" stroke={C.mocha} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.5, 0.9))} />
      <T x={130} y={115} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.9))}>
        no storage
      </T>
      <Cell x={360} y={30} w={160} h={30} label="ClickHouse" stroke={C.focus} o={easeOut(seg(t, 1.3, 1.7))} />
      <line x1={440} y1={62} x2={440} y2={lerp(62, 88, d)} stroke={C.focus} strokeWidth={1.8} />
      <Part x={360} y={90} w={160} label="its own storage" stroke={C.focus} k={d} />
      <T x={300} y={180} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        what does owning it buy?
      </T>
    </Svg>
  );
}

// 2 · Predict. Two batches fall toward a table one after the other: grow one file, or set two side by side?
export function PredictPartsOrRewrite({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.0));
  const b = easeOut(seg(t, 1.2, 1.9));
  return (
    <Svg label="two separate inserts land on a table. one growing file, or two separate files?" h={200}>
      <Part x={60} y={lerp(-10, 40, a)} w={130} label="batch 1" k={a} />
      <Part x={210} y={lerp(-10, 40, b)} w={130} label="batch 2" k={b} />
      <T x={370} y={62} s={13} f={C.second} o={easeOut(seg(t, 2.0, 2.4))}>
        merged in, or beside?
      </T>
      <AnswerRow y={130} label="two inserts make" answer={answer} value="two separate files" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={178} text="each batch its own untouched part" />
    </Svg>
  );
}

// 3 · Immutable parts, then a merge. Two 50,000-row parts; OPTIMIZE reads both into one fresh 100,000-row part; the pair goes dashed.
export function RevealImmutableParts({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.6, 2.6));
  const r = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="two separate, immutable parts, for real. a real merge collapses them to one, same row count." h={230}>
      <Part x={25} y={20} label="part 1 · 50,000" k={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.6 * r)} dash={r > 0.5} />
      <Part x={195} y={20} label="part 2 · 50,000" k={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.6 * r)} dash={r > 0.5} />
      <T x={370} y={42} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        2 active parts
      </T>
      <line x1={100} y1={56} x2={lerp(100, 175, m)} y2={lerp(56, 104, m)} stroke={C.second} strokeWidth={1.5} />
      <line x1={270} y1={56} x2={lerp(270, 195, m)} y2={lerp(56, 104, m)} stroke={C.second} strokeWidth={1.5} />
      <T x={370} y={86} s={11} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        OPTIMIZE: a merge
      </T>
      <Part x={95} y={106} w={180} label="merged · 100,000" stroke={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
      <T x={370} y={128} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        1 active part
      </T>
      <Row y={200} label="rows, before = after" value="100,000" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 4 · The sparse primary index. 24 granules along a time axis; the query's one hour sits inside granule 10; a cursor jumps straight there.
export function RevealSparsePrimaryIndex({ t }: StepCtx) {
  const j = easeInOut(seg(t, 1.6, 2.2));
  const l = easeOut(seg(t, 2.2, 2.6));
  const gx = 25 + 10 * (550 / 24);
  return (
    <Svg label="an hour-wide range over two hundred thousand rows reads one of twenty-four granules, for real." h={230}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        200,000 rows, ORDER BY ts
      </T>
      <Granules n={24} y={50} lit={(i) => (i === 10 ? l : 0.15 * easeOut(seg(t, 0.2, 0.6)))} />
      <T x={25} y={110} s={12} f={C.second} o={easeOut(seg(t, 0.9, 1.3))}>
        one hour on Jan 2
      </T>
      <path d={`M${lerp(25, gx + 11, j)} 86 l-6 10 h12 z`} fill={C.second} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <Row y={170} label="granules read" value={l > 0.5 ? '1 of 24' : '…'} valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}

// 5 · Predict. 37 granules ordered by time; the filter is on status_code, which the sort never touched.
export function PredictNonSortedColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="a filter on a column that isn't the sort key. scan everything, or still skip most of it?" h={200}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        WHERE status_code = 500
      </T>
      <Granules n={37} y={46} lit={() => 0.15 * easeOut(seg(t, 0.4, 1.0))} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        sorted by ts, not status_code
      </T>
      <AnswerRow y={140} label="the scan" answer={answer} value="most still skipped" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="a structure just for that column" />
    </Svg>
  );
}

// 6 · The minmax index. Each block of four granules carries its min and max; every block whose range misses 500 greys out; one block,
// granules 16 to 19, survives: 4 of 37 read.
export function RevealMinmaxSkipIndex({ t }: StepCtx) {
  const sw = seg(t, 1.0, 2.8);
  const lit = (i: number) => {
    const blk = Math.floor(i / 4);
    const reached = sw * 10 > blk;
    if (blk === 4) return reached ? 1 : 0.15;
    return reached ? 0 : 0.15;
  };
  return (
    <Svg label="a real minmax index still prunes most granules, on a column the sort order never touches." h={230}>
      <Granules n={37} y={30} lit={lit} />
      <line x1={25 + sw * 550} y1={24} x2={25 + sw * 550} y2={62} stroke={C.second} strokeWidth={2} opacity={sw > 0 && sw < 1 ? 1 : 0} />
      <T x={25} y={100} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        block min 200 · max 200
      </T>
      <T x={575} y={100} s={12} f={C.latte} a="end" o={easeOut(seg(t, 0.6, 1.0))}>
        skip
      </T>
      <T x={25} y={134} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>
        block min 200 · max 500
      </T>
      <T x={575} y={134} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.8, 2.2))}>
        read
      </T>
      <Row y={194} label="granules read" value="4 of 37" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 7 · The materialized view as an insert trigger. Rows fly into src; each insert fires into the running total, which counts 0 → 30 → 60.
export function RevealMaterializedView({ t }: StepCtx) {
  const i1 = easeInOut(seg(t, 1.0, 1.7));
  const i2 = easeInOut(seg(t, 2.4, 3.1));
  const tot = lerp(0, 30, easeOut(seg(t, 1.7, 2.1))) + lerp(0, 30, easeOut(seg(t, 3.1, 3.5)));
  return (
    <Svg label="a materialized view fires as a real insert trigger -- no query needed against the source." h={230}>
      <Part x={25} y={80} w={140} label="src" />
      <Part x={400} y={80} w={160} label={`total: ${num(tot)}`} stroke={C.focus} />
      <T x={360} y={140} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.7))}>
        a running total only
      </T>
      <rect x={lerp(25, 60, i1)} y={lerp(42, 64, i1)} width={70} height={14} rx={3} fill={C.second} opacity={i1 > 0 && i1 < 1 ? 1 : 0} />
      <T x={25} y={36} s={11} f={C.latte} o={i1 > 0 ? 1 - i1 : 0}>
        10 + 20
      </T>
      <rect x={lerp(100, 80, i2)} y={lerp(42, 64, i2)} width={40} height={14} rx={3} fill={C.second} opacity={i2 > 0 && i2 < 1 ? 1 : 0} />
      <T x={160} y={36} s={11} f={C.latte} o={i2 > 0 ? 1 - i2 : 0}>
        30
      </T>
      <Req x1={167} x2={395} y={97} k={easeOut(seg(t, 1.5, 1.9))} label="fires on insert" f={C.focus} />
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        no command issued after the write
      </T>
    </Svg>
  );
}

// 8 · ReplacingMergeTree. id 1 'a' (ver 1) and id 1 'b' (ver 2) both answer; a merge pass sweeps across and 'a' fades out.
export function RevealReplacingMergeTree({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 2.2, 3.2));
  const gone = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="two versions of one row both stay visible until a real merge collapses them to the latest." h={230}>
      <Part x={25} y={20} w={220} label="id 1 · 'a' · ver 1" k={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.8 * gone)} />
      <Part x={25} y={70} w={220} label="id 1 · 'b' · ver 2" stroke={gone > 0.5 ? C.focus : C.latte} k={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={150} label="rows answered" value={gone > 0.5 ? '1, only b' : '2'} valueColor={gone > 0.5 ? C.focus : C.crema} k={easeOut(seg(t, 1.0, 1.4))} />
      <line x1={258} y1={14} x2={258} y2={lerp(14, 110, sw)} stroke={C.second} strokeWidth={2.5} opacity={sw > 0 ? 1 - gone * 0.6 : 0} />
      <T x={290} y={66} s={12} f={C.second} o={easeOut(seg(t, 2.0, 2.4))}>
        a merge pass runs
      </T>
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        until then, both versions stay
      </T>
    </Svg>
  );
}

// 9 · Lightweight delete. A 1,000-row grid; rows 0 to 99 are stamped and the count drops to 900 at once, while the bytes-on-disk bar
// stays the same length until a later merge.
export function RevealLightweightDelete({ t }: StepCtx) {
  const st = easeOut(seg(t, 0.8, 1.4));
  const n = Math.round(lerp(1000, 900, easeOut(seg(t, 1.2, 1.8))));
  return (
    <Svg label="a real lightweight delete drops the row count immediately, by marking rows, not rewriting the table." h={230}>
      <rect x={21} y={16} width={50 * 5 + 6} height={20 * 5 + 6} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} x={25 + (i % 50) * 5} y={20 + Math.floor(i / 50) * 5} width={4} height={4} fill={C.second} opacity={st} />
      ))}
      <T x={300} y={38} s={11} f={C.second} o={st}>
        DELETE WHERE id &lt; 100: stamped
      </T>
      <Row y={80} label="" value={`count: ${num(n)}`} valueColor={n === 900 ? C.focus : C.crema} k={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25} y={160} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        on disk
      </T>
      <rect x={120} y={150} width={300} height={12} fill={C.latte} opacity={easeOut(seg(t, 2.2, 2.6))} />
      <T x={440} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        not smaller yet
      </T>
      <rect x={120} y={186} width={300} height={12} fill="none" stroke={C.mocha} strokeDasharray="4 3" opacity={easeOut(seg(t, 3.2, 3.6))} />
      <rect x={120} y={186} width={270} height={12} fill={C.focus} opacity={0.6 * easeOut(seg(t, 3.4, 3.8))} />
      <T x={25} y={196} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        next merge
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['parts', 'never edited'],
    ['skipping', 'sort order and minmax'],
    ['a view', 'updates on write'],
    ['old versions', 'kept until a merge'],
  ];
  return (
    <Svg label="a real engine owning its own storage: parts, two skip mechanisms, an insert trigger, real merges. next: duckdb." h={250}>
      {rows.map(([a, b], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={i === 3 ? C.focus : C.crema} k={easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8))} />
      ))}
    </Svg>
  );
}
