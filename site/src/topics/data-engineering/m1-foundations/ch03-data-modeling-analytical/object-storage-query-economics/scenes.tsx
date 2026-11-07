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

/** A grid of cells, `cols` by `rows`; `lit(col, row)` gives each cell's highlight between 0 and 1. */
function Grid({
  x,
  y,
  cols,
  rows,
  cw,
  ch,
  lit,
  f = C.focus,
  o = 1,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cw: number;
  ch: number;
  lit: (c: number, r: number) => number;
  f?: string;
  o?: number;
}) {
  return (
    <g opacity={o}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const l = lit(c, r);
        return (
          <rect
            key={i}
            x={x + c * (cw + 3)}
            y={y + r * (ch + 3)}
            width={cw}
            height={ch}
            rx={2}
            fill={l > 0 ? f : C.cocoa}
            fillOpacity={l > 0 ? 0.2 + 0.5 * l : 1}
            stroke={l > 0 ? f : C.mocha}
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}

/** Twelve small month files in a row, starting at x; `lit(i)` lights each, `cap` draws each file's own header overhead. */
function Months({ x, y, lit, cap = 0, w = 36, f = C.focus, o = 1 }: { x: number; y: number; lit: (i: number) => number; cap?: number; w?: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 12 }, (_, i) => {
        const l = lit(i);
        return (
          <g key={i}>
            <rect x={x + i * (w + 4)} y={y} width={w} height={30} rx={2} fill={l > 0 ? f : C.cocoa} fillOpacity={l > 0 ? 0.2 + 0.5 * l : 1} stroke={l > 0 ? f : C.mocha} strokeWidth={1} />
            <rect x={x + i * (w + 4)} y={y} width={w} height={6 * cap} rx={1} fill={C.cherryText} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

const SHAPES = ['JSON', 'Parquet', 'by month', 'Iceberg'];

// 1 · Hook. The same rows, drawn four ways: one wide JSON file, one striped Parquet file, twelve month files, an Iceberg table
// with its metadata tag; one query arrow points at all four.
export function Hook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5));
  const q = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="one dataset, one query, four storage shapes — which costs least?" h={250}>
      <Row y={40} label="one dataset" value="four storage shapes" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one query" value="which costs least?" k={easeOut(seg(t, 3.0, 3.5))} />
      {SHAPES.map((s, i) => {
        const x = 25 + i * 140;
        return (
          <g key={s} opacity={k(i)}>
            {i === 0 && <rect x={x} y={130} width={125} height={56} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />}
            {i === 1 && <Grid x={x} y={130} cols={5} rows={1} cw={22.6} ch={56} lit={() => 0} />}
            {i === 2 && <Months x={x} y={130} lit={() => 0} w={6.5} />}
            {i === 3 && (
              <>
                <Grid x={x} y={140} cols={5} rows={1} cw={22.6} ch={46} lit={() => 0} />
                <rect x={x} y={128} width={125} height={9} rx={2} fill={C.second} opacity={0.7} />
              </>
            )}
            <T x={x + 62} y={208} s={11} f={C.latte} a="middle">
              {s}
            </T>
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={300} y1={112} x2={lerp(300, 87 + i * 140, q)} y2={lerp(112, 126, q)} stroke={C.focus} strokeWidth={1.5} opacity={q > 0 ? 1 : 0} />
      ))}
    </Svg>
  );
}

const METERS: [string, number, number][] = [
  ['storage', 0.8, 1.6],
  ['requests', 1.1, 2.9],
  ['transfer', 1.4, 2.2],
];

// 2 · Billing axes. Three separate meters, each needle swinging on its own; the storage meter then splits into the three things
// its own rate depends on.
export function RevealBillingAxesQuote({ t }: StepCtx) {
  return (
    <Svg label="storage, requests, transfer — billed separately, not bundled" h={250}>
      <Row y={40} label="billed separately" value="not one bundled price" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="storage rate, by" value="size, time, class" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {METERS.map(([l, a, b], i) => {
        const cx = 100 + i * 200;
        const k = easeOut(seg(t, a - 0.4, a));
        const ang = Math.PI * (1 - 0.15 - 0.7 * easeInOut(seg(t, a, b)));
        return (
          <g key={l} opacity={k}>
            <path d={`M${cx - 40} 175 A40 40 0 0 1 ${cx + 40} 175`} fill="none" stroke={C.mocha} strokeWidth={4} />
            <line x1={cx} y1={175} x2={cx + 34 * Math.cos(ang)} y2={175 - 34 * Math.sin(ang)} stroke={i === 0 ? C.focus : C.crema} strokeWidth={2.5} />
            <T x={cx} y={198} s={12} f={C.latte} a="middle">
              {l}
            </T>
          </g>
        );
      })}
      {['size', 'time', 'class'].map((l, i) => (
        <Cell key={l} x={25 + i * 60} y={210} w={52} h={22} label={l} o={easeOut(seg(t, 3.2 + i * 0.25, 3.5 + i * 0.25))} stroke={C.focus} />
      ))}
    </Svg>
  );
}

// 3 · Predict: cheap to write, cheap to query? JSON written with a tick; a query arrives; then the question.
export function PredictFormatCost({ t, answer }: StepCtx) {
  return (
    <Svg label="cheap to write — does that mean cheap to query too?" h={210}>
      <Row y={40} label="JSON" value="cheap to write" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="no schema, no writer" o={easeOut(seg(t, 0.3, 0.6))} />
      <Tick y={66} k={easeOut(seg(t, 0.7, 1.1))} />
      <line x1={235} y1={73} x2={lerp(235, 520, easeInOut(seg(t, 1.0, 1.6)))} y2={73} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <AnswerRow y={140} label="cheap to query" answer={answer} value="no, it pays more" f={C.cherryText} k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="querying it is a separate cost" f={C.cherryText} />
    </Svg>
  );
}

// 4 · JSON vs Parquet. The same question sweeps both: JSON lights every cell of every row; Parquet lights only the two columns
// the question needs; the measured ratio lands.
export function RevealJsonVsParquetMeasured({ t }: StepCtx) {
  const sw = seg(t, 0.8, 2.4);
  const lit = (r: number) => clamp(sw * 4 - r, 0, 1);
  return (
    <Svg label="same query, same rows — JSON reads far more bytes than Parquet" h={250}>
      <Row y={40} label="JSON" value="far more bytes read" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="Parquet" value="only the columns needed" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <T x={140} y={118} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        JSON
      </T>
      <Grid x={25} y={126} cols={5} rows={4} cw={43} ch={16} lit={(_, r) => lit(r)} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.8))} />
      <T x={460} y={118} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        Parquet
      </T>
      <Grid x={345} y={126} cols={5} rows={4} cw={43} ch={16} lit={(c, r) => (c >= 3 ? lit(r) : 0)} o={easeOut(seg(t, 0.4, 0.8))} />
      <T x={300} y={225} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        JSON reads more than 5× the bytes
      </T>
    </Svg>
  );
}

// 5 · Two billing models. On the left, three queries scan in turn and the bytes meter steps up with each; on the right, a
// reserved block of capacity fills steadily with time whatever the queries do.
export function RevealBillingModelsQuote({ t }: StepCtx) {
  const steps = [0.35, 0.25, 0.4];
  let acc = 0;
  const cap = seg(t, 2.4, 4.2);
  return (
    <Svg label="bytes scanned, billed — or reserved compute time, billed — never both the same way" h={250}>
      <Row y={40} label="on-demand" value="billed per byte scanned" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="capacity" value="billed per reserved time" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <rect x={25} y={150} width={250} height={20} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {steps.map((w, i) => {
        const x = 25 + acc * 250;
        acc += w;
        const k = easeOut(seg(t, 0.8 + i * 0.5, 1.2 + i * 0.5));
        return (
          <g key={i}>
            <rect x={x} y={150} width={250 * w * k} height={20} rx={2} fill={C.crema} opacity={0.35 + 0.15 * i} />
            <Cell x={25 + i * 85} y={190} w={75} h={22} label={`query ${i + 1}`} o={k} />
          </g>
        );
      })}
      <T x={25} y={138} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        bytes scanned
      </T>
      <rect x={325} y={150} width={250} height={20} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 2.2, 2.5))} />
      <rect x={325} y={150} width={250 * cap} height={20} rx={2} fill={C.focus} opacity={0.45} />
      <T x={325} y={138} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        reserved slots, over time
      </T>
    </Svg>
  );
}

// 6 · Predict: always cheaper? One file splits into twelve month files; then the question.
export function PredictPartitionAlwaysWins({ t, answer }: StepCtx) {
  const sp = easeInOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="more, smaller files — always the cheaper choice?" h={210}>
      <Row y={40} label="split by month" value="always cheaper?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * lerp(41.7, 46, sp)}
          y={60}
          width={lerp(45.8, 40, sp)}
          height={26}
          rx={2}
          fill={C.cocoa}
          stroke={C.mocha}
          strokeWidth={sp > 0 ? 1 : 0}
          opacity={easeOut(seg(t, 0.1, 0.4))}
        />
      ))}
      <rect x={25} y={60} width={503} height={26} rx={3} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={1 - sp} />
      <AnswerRow y={140} label="always cheaper" answer={answer} value="depends on the query" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="narrow or broad decides it" />
    </Svg>
  );
}

// 7 · A narrow query. One month asked: the single file is swept end to end; the month layout opens only month three's file.
export function RevealNarrowQueryMeasured({ t }: StepCtx) {
  const sw = seg(t, 1.0, 2.2);
  const m = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="one month out of twelve — partitioned layout reads far fewer bytes" h={250}>
      <Row y={40} label="one month of twelve" value="only its file opened" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="bytes read" value="far fewer, split by month" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        one file
      </T>
      <rect x={25} y={130} width={476} height={30} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={25} y={130} width={476 * sw} height={30} rx={3} fill={C.cherryText} opacity={0.35} />
      <T x={25} y={185} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        split by month
      </T>
      <Months x={25} y={193} lit={(i) => (i === 2 ? m : 0)} o={easeOut(seg(t, 0.6, 0.9))} />
    </Svg>
  );
}

// 8 · A broad query. Every month asked: all twelve month files open, each paying its own red header overhead; the single
// file is read once; the month layout's total comes out larger.
export function RevealBroadQueryMeasured({ t }: StepCtx) {
  const sw = seg(t, 0.8, 1.8);
  const open = (i: number) => clamp(seg(t, 0.8, 2.2) * 12 - i, 0, 1);
  const cap = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="every month at once — the partitioned layout now reads more, not less" h={250}>
      <Row y={40} label="every month" value="all twelve files opened" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="split layout reads" value="more, not less" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        one file, read once
      </T>
      <rect x={25} y={130} width={476} height={30} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={25} y={130} width={476 * sw} height={30} rx={3} fill={C.focus} opacity={0.35} />
      <rect x={25} y={130} width={476} height={6 * cap} rx={1} fill={C.cherryText} opacity={0.8} />
      <T x={25} y={185} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        split by month: twelve opens
      </T>
      <Months x={25} y={193} lit={open} cap={cap} f={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))} />
      <T x={575} y={238} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        overhead, twelve times
      </T>
    </Svg>
  );
}

/** Storage footprint bars; only the asserted relationships are drawn: JSON past three times the single file, Iceberg a
 * little over the file it wraps. */
const FOOT: [string, number, string][] = [
  ['JSON', 1, C.cherryText],
  ['one Parquet file', 0.26, C.crema],
  ['Parquet by month', 0.27, C.crema],
  ['Iceberg table', 0.28, C.crema],
];

// 9 · Storage on disk. Four footprint bars grow: JSON runs far past the three columnar layouts; a bracket marks it at more
// than three times.
export function RevealStorageMeasured({ t }: StepCtx) {
  return (
    <Svg label="disk alone — JSON's footprint dwarfs every columnar layout of the same rows" h={250}>
      <Row y={40} label="on disk" value="JSON, far larger" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="storage and query cost" value="move apart" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      {FOOT.map(([l, w, f], i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.4, 1.6 + i * 0.4));
        return (
          <g key={l}>
            <T x={25} y={130 + i * 28} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
              {l}
            </T>
            <rect x={170} y={118 + i * 28} width={400 * w * k} height={16} rx={2} fill={f} opacity={0.6} />
          </g>
        );
      })}
      <T x={575} y={244} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        JSON: more than 3× one Parquet file
      </T>
    </Svg>
  );
}

// 10 · Predict: does the wrapper change bytes? A Parquet file; an Iceberg frame of transactions and catalog closes round it;
// then the question.
export function PredictIcebergWrapper({ t, answer }: StepCtx) {
  const w = easeInOut(seg(t, 0.6, 1.3));
  return (
    <Svg label="transactions and a catalog added — does that change bytes scanned too?" h={210}>
      <Row y={40} label="Iceberg wrapper" value="transactions, catalog" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={175} y={64} w={250} h={22} label="the same Parquet file" o={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={lerp(25, 160, w)} y={57} width={lerp(550, 280, w)} height={36} rx={5} fill="none" stroke={C.second} strokeWidth={2} opacity={w} />
      <AnswerRow y={140} label="bytes scanned change" answer={answer} value="no, the same" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="it adds transactions, not bytes" />
    </Svg>
  );
}

// 11 · Iceberg measured. For the narrow and the broad question, the bare Parquet bar and the Iceberg bar grow side by side and
// end together, within ten percent.
export function RevealIcebergMeasured({ t }: StepCtx) {
  const PAIRS: [string, number][] = [
    ['narrow question', 0.25],
    ['broad question', 0.85],
  ];
  return (
    <Svg label="same data, Iceberg-wrapped — bytes read track the bare Parquet file beneath it" h={250}>
      <Row y={40} label="Iceberg vs Parquet" value="within 10%" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={85} label="bytes read" value="narrow and broad alike" k={easeOut(seg(t, 3.2, 3.7))} />
      {PAIRS.map(([l, w], i) => {
        const y = 125 + i * 60;
        const k = easeOut(seg(t, 0.6 + i * 0.8, 1.6 + i * 0.8));
        return (
          <g key={l}>
            <T x={25} y={y} s={11} f={C.latte} o={easeOut(seg(t, 0.4 + i * 0.8, 0.7 + i * 0.8))}>
              {l}
            </T>
            <rect x={25} y={y + 8} width={420 * w * k} height={12} rx={2} fill={C.crema} opacity={0.6} />
            <rect x={25} y={y + 23} width={420 * w * k} height={12} rx={2} fill={C.second} opacity={0.8} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <rect x={25} y={233} width={14} height={10} rx={2} fill={C.crema} opacity={0.6} />
        <T x={45} y={242} s={11} f={C.latte}>
          Parquet
        </T>
        <rect x={135} y={233} width={14} height={10} rx={2} fill={C.second} opacity={0.8} />
        <T x={155} y={242} s={11} f={C.second}>
          Iceberg
        </T>
      </g>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="separate meters; layout, not format, moves bytes scanned; it depends on the query" h={220}>
      <Row y={50} label="billing" value="separate meters" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="bytes scanned" value="moved by layout" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="best layout" value="narrow or broad?" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: always the latest day. One large file and a by-day layout; after the answer only the last day's file lights in
// the split layout, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const l = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="always the latest single day, never more — which layout fits?" h={230}>
      <Row y={40} label="always the latest day" value="never more" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="build it on" answer={answer} value="split by day" k={easeOut(seg(t, 0.4, 0.9))} />
      <Months x={25} y={115} lit={(i) => (i === 11 ? l : 0)} o={easeOut(seg(t, 0.5, 0.8))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            partitioned down to the query's grain
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
