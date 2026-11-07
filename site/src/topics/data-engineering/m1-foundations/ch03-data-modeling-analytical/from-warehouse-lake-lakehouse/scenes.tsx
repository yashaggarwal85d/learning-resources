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

/** The coupled box: a storage half and a compute half side by side, with an optional fill level in the storage half. */
function Box({ x, y, k, fill = 0, f = C.mocha }: { x: number; y: number; k: number; fill?: number; f?: string }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={260} height={90} rx={6} fill="none" stroke={f} strokeWidth={2} />
      <line x1={x + 130} y1={y} x2={x + 130} y2={y + 90} stroke={C.mocha} strokeWidth={1.5} />
      <rect x={x + 6} y={y + 84 - 78 * fill} width={118} height={78 * fill} rx={3} fill={fill > 0.95 ? C.cherryText : C.second} opacity={0.45} />
      <T x={x + 65} y={y + 50} s={12} f={C.crema} a="middle">
        storage
      </T>
      <T x={x + 195} y={y + 50} s={12} f={C.crema} a="middle">
        compute
      </T>
    </g>
  );
}

/** A small file icon: a page with a folded corner, tilted by `r` degrees. */
function File({ x, y, o = 1, r = 0, f = C.latte }: { x: number; y: number; o?: number; r?: number; f?: string }) {
  return (
    <g opacity={o} transform={`rotate(${r.toFixed(1)} ${x + 11} ${y + 14})`}>
      <path d={`M${x} ${y} h15 l7 7 v21 h-22 z`} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      <path d={`M${x + 15} ${y} v7 h7`} fill="none" stroke={f} strokeWidth={1.2} />
    </g>
  );
}

// 1 · Hook. One box, storage and compute together; the data in the storage half rises until it presses the top.
export function Hook({ t }: StepCtx) {
  const fl = easeInOut(seg(t, 1.2, 3.2));
  return (
    <Svg label="one box, storage and compute together, sized for peak" h={240}>
      <Row y={40} label="one box" value="storage and compute together" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="data outgrows it" value="then what?" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <Box x={25} y={120} k={easeOut(seg(t, 0.4, 0.9))} fill={0.2 + 0.8 * fl} f={fl > 0.95 ? C.cherryText : C.mocha} />
      <T x={575} y={170} s={12} f={C.latte} a="end" o={easeOut(seg(t, 0.9, 1.3))}>
        sized for the busiest moment
      </T>
    </Svg>
  );
}

// 2 · The first generation. The same box; a clamp closes around both halves; bought, sized and billed tag on one by one.
export function RevealFirstGenQuote({ t }: StepCtx) {
  const cl = easeInOut(seg(t, 0.9, 1.5));
  return (
    <Svg label="first generation: compute and storage, coupled, one appliance" h={240}>
      <Row y={40} label="first generation" value="one appliance" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="compute and storage" value="coupled" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <Box x={25} y={125} k={easeOut(seg(t, 0.4, 0.8))} fill={0.4} />
      <path d={`M${lerp(5, 17, cl)} 120 v100 M${lerp(305, 293, cl)} 120 v100`} stroke={C.focus} strokeWidth={3} opacity={cl > 0 ? 1 : 0} />
      {['bought together', 'sized together', 'billed together'].map((l, i) => (
        <Cell key={l} x={345} y={122 + i * 32} w={230} h={26} label={l} o={easeOut(seg(t, 1.8 + i * 0.4, 2.2 + i * 0.4))} stroke={C.focus} />
      ))}
    </Svg>
  );
}

// 3 · Predict: does cheap storage settle it? The storage half slides out of the box to cheap storage; then the question.
export function PredictCostOnly({ t, answer }: StepCtx) {
  const s = easeInOut(seg(t, 0.4, 1.3));
  return (
    <Svg label="storage split out, far cheaper — does that settle it?" h={210}>
      <Row y={40} label="storage split out" value="far cheaper" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={160} h={26} label="compute" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={lerp(195, 375, s)} y={60} w={200} h={26} label="cheap storage" o={easeOut(seg(t, 0.1, 0.4))} stroke={s >= 1 ? C.second : C.mocha} />
      <AnswerRow y={140} label="settles it" answer={answer} value="no, it gives up some" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="transactions and governance stay behind" f={C.cherryText} />
    </Svg>
  );
}

// 4 · The second generation. Raw files land in a lake, open to read; a reader applies the schema only as it reads; a feed
// runs downstream into the warehouse, which still serves the reporting.
export function RevealSecondGenQuote({ t }: StepCtx) {
  const r = easeInOut(seg(t, 1.8, 2.4));
  const d = easeInOut(seg(t, 2.8, 3.5));
  return (
    <Svg label="raw data, open files, schema-on-read — a warehouse still does the important BI" h={250}>
      <Row y={40} label="second generation" value="raw data, open files" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="warehouse still" value="does key reporting" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect x={25} y={120} width={250} height={80} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={150} y={220} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        lake · open files
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <File key={i} x={45 + i * 37} y={lerp(100, 140, easeOutBack(seg(t, 0.6 + i * 0.12, 1.0 + i * 0.12)))} o={easeOut(seg(t, 0.6 + i * 0.12, 0.8 + i * 0.12))} />
      ))}
      <rect x={25 + 250 * r - 3} y={124} width={3} height={72} fill={C.focus} opacity={r > 0 && r < 1 ? 1 : 0} />
      <T x={150} y={186} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
        schema applied on read
      </T>
      <line x1={275} y1={160} x2={lerp(275, 375, d)} y2={160} stroke={C.focus} strokeWidth={2} />
      <Cell x={375} y={140} w={200} h={40} label="warehouse · reports" o={easeOut(seg(t, 3.0, 3.4))} stroke={C.focus} />
    </Svg>
  );
}

// 5 · The swamp. The lake's files, orderly at first, drift, tilt and turn red with nothing enforcing transactions or rules.
export function RevealSwampQuote({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.6, 3.2));
  const DRIFT = [
    [-14, 8, -18],
    [10, -10, 22],
    [-6, 14, -30],
    [18, 6, 14],
    [-20, -8, -12],
    [8, 16, 28],
  ];
  return (
    <Svg label="no transactions, no governance by default — most lakes became swamps" h={240}>
      <Row y={40} label="by default" value="no transactions, no rules" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="most lakes became" value="data swamps" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect
        x={25}
        y={120}
        width={340}
        height={90}
        rx={6}
        fill={C.cherryText}
        fillOpacity={0.12 * sw}
        stroke={sw > 0.5 ? C.cherryText : C.second}
        strokeWidth={1.5}
        opacity={easeOut(seg(t, 0.4, 0.8))}
      />
      {DRIFT.map(([dx, dy, r], i) => (
        <File key={i} x={50 + i * 50 + dx * sw} y={150 + dy * sw} r={r * sw} f={sw > 0.5 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.5, 0.9))} />
      ))}
      {['transactions', 'governance'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 1.0 + i * 0.4, 1.4 + i * 0.4))}>
          <T x={400} y={145 + i * 40} s={13} f={C.latte}>
            {l}
          </T>
          <path d={`M555 ${133 + i * 40} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} />
        </g>
      ))}
    </Svg>
  );
}

// 6 · Two tiers. On-premises file storage slides out and cloud object storage takes its place under the lake; a warehouse
// tier stacks on top; the whole stack is marked the dominant shape.
export function RevealTwoTierQuote({ t }: StepCtx) {
  const out = easeInOut(seg(t, 0.8, 1.5));
  const inn = easeOut(seg(t, 1.5, 2.1));
  const w = easeOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="cloud object storage takes over — lake plus warehouse, now the dominant shape" h={250}>
      <Row y={40} label="cloud object storage" value="took over" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="lake + warehouse" value="the dominant shape" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={120} w={300} h={30} label="warehouse" o={w} stroke={C.focus} />
      <Cell x={25} y={158} w={300} h={30} label="lake" o={easeOut(seg(t, 0.4, 0.8))} stroke={C.second} />
      <g opacity={1 - out} transform={`translate(${(out * 120).toFixed(1)} 0)`}>
        <Cell x={25} y={196} w={300} h={30} label="on-premises file system" o={easeOut(seg(t, 0.4, 0.8))} />
      </g>
      <g opacity={inn} transform={`translate(${((1 - inn) * -40).toFixed(1)} 0)`}>
        <Cell x={25} y={196} w={300} h={30} label="cloud object storage" stroke={C.second} />
      </g>
      <path d={`M345 120 h10 v106 h-10`} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.2, 3.6))} />
      <T x={370} y={177} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        the default, industry-wide
      </T>
    </Svg>
  );
}

/** A pipeline of stops: dots joined by a line drawn left to right by `k`, each stop labelled under it. */
function Pipe({ y, stops, k, f = C.crema }: { y: number; stops: string[]; k: number; f?: string }) {
  const xs = stops.map((_, i) => 60 + (i * 480) / (stops.length - 1));
  return (
    <g>
      <line x1={xs[0]} y1={y} x2={lerp(xs[0], xs[xs.length - 1], k)} y2={y} stroke={f} strokeWidth={2} />
      {stops.map((s, i) => {
        const on = k * (stops.length - 1) >= i - 0.001;
        return (
          <g key={s} opacity={on ? 1 : 0}>
            <circle cx={xs[i]} cy={y} r={7} fill={i === 0 ? C.cocoa : f} stroke={f} strokeWidth={2} />
            <T x={xs[i]} y={y + 22} s={11} f={C.latte} a="middle">
              {s}
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 7 · Predict: more steps or fewer? The direct load and the two-tier route, drawn one above the other; then the question.
export function PredictStepCount({ t, answer }: StepCtx) {
  return (
    <Svg label="direct load versus lake-then-warehouse — more steps, or fewer?" h={210}>
      <Row y={40} label="two-tier load" value="more stops, or fewer?" k={easeOut(seg(t, 0.1, 0.5))} />
      <circle cx={60} cy={70} r={5} fill={C.latte} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={60} y1={70} x2={lerp(60, 540, easeInOut(seg(t, 0.4, 1.4)))} y2={70} stroke={C.second} strokeWidth={2} />
      <circle cx={300} cy={70} r={5} fill={C.second} opacity={easeOut(seg(t, 0.8, 1.0))} />
      <circle cx={540} cy={70} r={5} fill={C.second} opacity={easeOut(seg(t, 1.3, 1.5))} />
      <AnswerRow y={140} label="steps" answer={answer} value="more, not fewer" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="the lake is an added stop" />
    </Svg>
  );
}

// 8 · The count. The direct load draws to the warehouse in one stop; the two-tier load draws through the lake and on, two stops.
export function RevealStepCount({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.4));
  const b = easeInOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="one step, direct load — two steps, lake then warehouse" h={250}>
      <Row y={40} label="direct load" value={`${a >= 1 ? 1 : 0} stop`} big k={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={85} label="lake, then warehouse" value={`${b >= 1 ? 2 : b >= 0.5 ? 1 : 0} stops`} valueColor={C.focus} big k={easeOut(seg(t, 1.8, 2.2))} />
      <Pipe y={130} stops={['source', 'warehouse']} k={a} />
      <Pipe y={190} stops={['source', 'lake', 'warehouse']} k={b} f={C.focus} />
    </Svg>
  );
}

// 9 · Predict: transactions without one owner? Open files; a thin layer lowers over them; then the question.
export function PredictTableFormat({ t, answer }: StepCtx) {
  const l = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="transactions, without handing the files back to one owning engine — possible?" h={210}>
      <Row y={40} label="transactions back" value="no single owner?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 8 }, (_, i) => (
        <File key={i} x={40 + i * 68} y={78} o={easeOut(seg(t, 0.2 + i * 0.05, 0.5 + i * 0.05))} />
      ))}
      <rect x={25} y={lerp(52, 66, l)} width={550} height={6} rx={2} fill={C.focus} opacity={l} />
      <AnswerRow y={140} label="still open" answer={answer} value="yes, many engines" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="a transaction layer over open files" />
    </Svg>
  );
}

// 10 · The lakehouse. The same open files; the table-format layer settles over them; three separate engines read through it.
export function RevealLakehouseQuote({ t }: StepCtx) {
  const l = easeOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="Delta Lake, Apache Iceberg — transactional views over the same open files" h={250}>
      <Row y={40} label="Delta, Iceberg" value="transactions, open files" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="storage stays" value="open to many engines" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      {Array.from({ length: 8 }, (_, i) => (
        <File key={i} x={40 + i * 68} y={200} o={easeOut(seg(t, 0.4 + i * 0.05, 0.7 + i * 0.05))} f={C.second} />
      ))}
      <Cell x={25} y={lerp(150, 164, l)} w={550} h={24} label="table format · transaction log" o={l} stroke={C.focus} f={C.focus} />
      {[0, 1, 2].map((i) => {
        const k = easeInOut(seg(t, 2.0 + i * 0.4, 2.5 + i * 0.4));
        const x = 110 + i * 190;
        return (
          <g key={i}>
            <Cell x={x - 55} y={112} w={110} h={24} label={`engine ${i + 1}`} o={k} />
            <line x1={x} y1={136} x2={x} y2={lerp(136, 164, k)} stroke={C.focus} strokeWidth={2} />
          </g>
        );
      })}
    </Svg>
  );
}

const STAGES: [string, boolean, string][] = [
  ['warehouse', true, 'one engine owns it'],
  ['lake', false, 'nothing enforces it'],
  ['lakehouse', true, 'a table-format log'],
];

// 11 · Three stages. One capability followed across the columns: there, gone, back, each with the mechanism behind it.
export function RevealThreeStages({ t }: StepCtx) {
  return (
    <Svg label="present, then absent, then present again — never the same mechanism twice" h={240}>
      <Row y={40} label="transactions" value="there, gone, back again" k={easeOut(seg(t, 0.3, 0.8))} />
      {STAGES.map(([s, has, how], i) => {
        const x = 25 + i * 190;
        const k = easeOut(seg(t, 0.8 + i * 0.9, 1.2 + i * 0.9));
        const m = easeOut(seg(t, 1.2 + i * 0.9, 1.6 + i * 0.9));
        return (
          <g key={s} opacity={k}>
            <Cell x={x} y={80} w={170} h={30} label={s} stroke={i === 1 ? C.second : C.mocha} />
            {has ? (
              <path d={`M${x + 70} 140 l8 8 l16 -18`} fill="none" stroke={C.focus} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - m)} />
            ) : (
              <path d={`M${x + 76} 128 l18 18 m0 -18 l-18 18`} stroke={C.cherryText} strokeWidth={3} opacity={m} />
            )}
            <T x={x + 85} y={184} s={12} f={has ? C.focus : C.cherryText} a="middle" o={m}>
              {how}
            </T>
          </g>
        );
      })}
      {[0, 1].map((i) => (
        <line key={i} x1={195 + i * 190} y1={95} x2={215 + i * 190} y2={95} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6 + i * 0.9, 1.9 + i * 0.9))} />
      ))}
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="coupled, cheap-and-ungoverned, transactional-again-and-open — the full arc" h={220}>
      <Row y={50} label="warehouse" value="transactions, peak cost" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="lake alone" value="cheap, drifts to swamp" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="lakehouse" value="transactions, many engines" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: one dashboard, no other engine. After the answer the three stages are weighed against the need and the
// verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="today's data, one dashboard, no multi-engine need — which stage fits?" h={230}>
      <Row y={40} label="one dashboard" value="no other engine, ever" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="which stage" answer={answer} value="whatever fits" k={easeOut(seg(t, 0.4, 0.9))} />
      {["today's data", 'one dashboard', 'one engine'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={115} w={170} h={26} label={l} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            simplicity over openness, here
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
