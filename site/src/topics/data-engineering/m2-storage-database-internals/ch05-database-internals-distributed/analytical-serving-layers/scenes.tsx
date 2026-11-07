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

// 1 · Hook. A scan sweeps forty pips of raw rows end to end; partway through, a table of eight totals lights at once and
// ticks; the scan ticks only when it finally reaches the end.
export function Hook({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.5, 4.8));
  const b = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="the same query, measured for real: scanning raw rows from scratch versus a table that already holds the answer" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        scan all 40,000,000 raw rows
      </T>
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={25 + i * 12.5} y={52} width={9} height={14} rx={2} fill={sweep * 40 > i ? C.crema : C.mocha} opacity={easeOut(seg(t, 0.2, 0.5)) * (sweep * 40 > i ? 0.8 : 1)} />
      ))}
      <MiniTick x={533} y={92} k={easeOut(seg(t, 4.8, 5.1))} />
      <T x={25} y={125} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        read a table already holding 8 totals
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 26} y={137} width={20} height={14} rx={2} fill={C.cocoa} stroke={b > 0 ? C.focus : C.mocha} strokeWidth={1.5 + b} opacity={easeOut(seg(t, 2.4, 2.7))} />
      ))}
      <MiniTick x={240} y={146} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 5.1, 5.5))}>
        same question, one far faster
      </T>
    </Svg>
  );
}

// 2 · Predict. One engine underneath both; a big question beside a small one; the answer: the smaller question.
export function PredictWhyFaster({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const lit = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="is the fast query fast because it's a different kind of database, or a smaller question?" h={200}>
      <Cell x={25} y={56} w={550} label="the same engine underneath" o={easeOut(seg(t, 0.2, 0.6))} />
      <Cell x={25} y={92} w={360} label="every raw row" o={easeOut(seg(t, 0.6, 1.0))} />
      <Cell x={395} y={92} w={180} label="a few totals" o={easeOut(seg(t, 0.9, 1.3))} stroke={lit > 0 ? C.focus : C.mocha} />
      <AnswerRow y={150} label="fast because" answer={answer} value="a smaller question" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="the hard work already happened" />
    </Svg>
  );
}

/** One lane of reads along a timeline: a block of work at each pip that `work(i)` says pays it. */
function Lane({ y, label, o, work }: { y: number; label: string; o: number; work: (i: number) => number }) {
  return (
    <g>
      <T x={25} y={y - 30} s={12} f={C.latte} o={o}>
        {label}
      </T>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} opacity={o} />
      {Array.from({ length: 5 }, (_, i) => {
        const x = 140 + i * 95;
        const w = work(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill={C.crema} opacity={o} />
            <rect x={x - 14} y={y - 18 * w - 4} width={28} height={18 * w} rx={2} fill={C.cherryText} opacity={0.7 * clamp(w * 3)} />
          </g>
        );
      })}
    </g>
  );
}

// 3 · Cost shift. Top lane: five reads, each paying its own block of work in turn. Bottom lane: one big block at the write,
// then the same five reads arrive as bare ticks.
export function RevealCostShift({ t }: StepCtx) {
  const w0 = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="pre-aggregation is a cost shift, not a cost cut: the real work still happens, just once, at write time" h={240}>
      <Lane y={90} label="pay on every read" o={easeOut(seg(t, 0.2, 0.5))} work={(i) => easeOut(seg(t, 0.6 + i * 0.35, 0.9 + i * 0.35))} />
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <T x={25} y={140} s={12} f={C.latte}>
          pay once, at write
        </T>
        <line x1={25} y1={170} x2={575} y2={170} stroke={C.mocha} strokeWidth={1.5} />
        <circle cx={60} cy={170} r={5} fill={C.focus} />
        <rect x={46} y={170 - 40 * w0 - 4} width={28} height={40 * w0} rx={2} fill={C.focus} opacity={0.7} />
      </g>
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={140 + i * 95} cy={170} r={4} fill={C.crema} opacity={easeOut(seg(t, 3.4 + i * 0.2, 3.6 + i * 0.2))} />
      ))}
      <T x={300} y={225} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.6, 5.0))}>
        the same work, paid earlier
      </T>
    </Svg>
  );
}

// 4 · Materialized speedup. The raw scan's time bar grows long; the precomputed table's barely starts; the gap reads over
// twenty times; a tick confirms the answers match.
export function RevealMaterializedSpeedup({ t }: StepCtx) {
  const raw = easeInOut(seg(t, 0.5, 2.6));
  const mat = easeOut(seg(t, 0.5, 0.7));
  return (
    <Svg label="a real precomputed table, measured, answers the same question many times faster" h={220}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        raw table, scanned
      </T>
      <rect x={25} y={50} width={525 * raw} height={16} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={95} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        precomputed table
      </T>
      <rect x={25} y={105} width={20 * mat} height={16} rx={2} fill={C.focus} />
      <Row y={160} label="precomputed" value="over 20× faster" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={205} label="the answer" value="identical" k={easeOut(seg(t, 3.8, 4.2))} />
      <MiniTick x={470} y={200} k={easeOut(seg(t, 4.2, 4.6))} />
    </Svg>
  );
}

/** A table box with existing rows drawn as bars, and one slot at the bottom for the new row. */
function Table({ x, label, o, add, stroke = C.mocha }: { x: number; label: string; o: number; add: number; stroke?: string }) {
  return (
    <g opacity={o}>
      <T x={x + 125} y={45} s={13} f={C.latte} a="middle">
        {label}
      </T>
      <rect x={x} y={55} width={250} height={90} rx={5} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 15} y={67 + i * 18} width={220} height={10} rx={2} fill={C.mocha} />
      ))}
      <rect x={x + 15} y={121} width={220} height={12} rx={2} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
      <rect x={x + 15} y={lerp(95, 121, add)} width={220} height={12} rx={2} fill={C.focus} opacity={clamp(add * 2)} />
    </g>
  );
}

// 5 · Freshness gap. A new row drops into the raw table at once; the materialized table's slot stays empty and is marked
// absent; a rebuild sweep crosses it, and the row appears there too.
export function RevealFreshnessGap({ t }: StepCtx) {
  const rebuild = easeInOut(seg(t, 3.4, 4.1));
  return (
    <Svg label="a real write, measured invisible in the materialized table until it's refreshed" h={240}>
      <Table x={25} label="raw table" o={easeOut(seg(t, 0.2, 0.5))} add={easeOut(seg(t, 0.6, 1.1))} />
      <Table x={325} label="materialized table" o={easeOut(seg(t, 0.2, 0.5))} add={easeOut(seg(t, 4.0, 4.4))} stroke={rebuild > 0 && rebuild < 1 ? C.focus : C.mocha} />
      {rebuild > 0 && rebuild < 1 && <line x1={325 + 250 * rebuild} y1={57} x2={325 + 250 * rebuild} y2={143} stroke={C.focus} strokeWidth={2} />}
      <T x={150} y={175} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
        visible at once
      </T>
      <T x={450} y={175} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        absent
      </T>
      <T x={450} y={205} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        present after refresh
      </T>
    </Svg>
  );
}

const LATTICE: [string, number, number][][] = [
  [['store · day · item', 200, 200]],
  [
    ['store · day', 25, 175],
    ['store · item', 212, 175],
    ['day · item', 400, 175],
  ],
  [
    ['store', 25, 175],
    ['day', 212, 175],
    ['item', 400, 175],
  ],
  [['grand total', 200, 200]],
];

// 6 · Cubes. One cell lights alone: one table, one question. Then the rest of the lattice cascades in, every combination of
// three dimensions, and the storage cost is named.
export function RevealCubes({ t }: StepCtx) {
  let n = 0;
  return (
    <Svg label="a cube precomputes every combination of a fixed set of dimensions, not just one question" h={250}>
      {LATTICE.map((row, r) =>
        row.map(([l, x, w]) => {
          const one = l === 'store · day';
          const k = one ? easeOut(seg(t, 0.3, 0.7)) : easeOut(seg(t, 1.6 + n * 0.25, 1.9 + n++ * 0.25));
          return <Cell key={l} x={x} y={30 + r * 40} w={w} label={l} o={k} stroke={one ? C.focus : C.mocha} />;
        }),
      )}
      <T x={25} y={210} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        one table: one question
      </T>
      <T x={25} y={238} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        a cube: every combination, more storage
      </T>
    </Svg>
  );
}

// 7 · Real-time OLAP. Events stream in as dots and are rolled up the instant they pass the ingest gate, growing three
// totals; a query for one original event is refused.
export function RevealRealTimeOlap({ t }: StepCtx) {
  const N = 12;
  return (
    <Svg label="a real-time OLAP store pre-aggregates at ingestion itself, losing per-event queries to stay fresh" h={240}>
      <T x={25} y={40} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        Druid, Pinot, ClickHouse
      </T>
      <rect x={290} y={70} width={14} height={70} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={297} y={160} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        ingest
      </T>
      {Array.from({ length: N }, (_, i) => {
        const p = seg(t, 0.6 + i * 0.2, 1.1 + i * 0.2);
        return p > 0 && p < 1 ? <circle key={i} cx={lerp(25, 290, p)} cy={80 + (i % 3) * 25} r={4} fill={C.crema} /> : null;
      })}
      {[0, 1, 2].map((j) => {
        const got = Array.from({ length: N }, (_, i) => i).filter((i) => i % 3 === j && t > 1.1 + i * 0.2).length;
        return <rect key={j} x={340 + j * 70} y={140 - got * 14} width={40} height={got * 14} rx={2} fill={C.focus} opacity={0.7} />;
      })}
      <T x={25} y={195} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        ask for one original event
      </T>
      <Cross x={300} y={190} k={easeOut(seg(t, 4.3, 4.6))} />
      <T x={25} y={225} s={13} f={C.cherryText} o={easeOut(seg(t, 4.6, 5.0))}>
        rolled up: no longer there to ask
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="pre-aggregation shifts cost to write time, a materialized table is measurably faster but can go stale, cubes generalize it, real-time OLAP does it at ingestion" h={250}>
      <Row y={50} label="the work" value="moved to write time" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={100} label="pre-built table" value="faster, can go stale" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={150} label="a cube" value="many answers at once" k={easeOut(seg(t, 3.2, 3.6))} />
      <Row y={200} label="real-time OLAP" value="rolls up on arrival" valueColor={C.focus} k={easeOut(seg(t, 4.4, 4.8))} />
    </Svg>
  );
}

const OPTS = ['scan raw rows', 'periodic view', 'real-time OLAP'];

// 9 · Prove. Three options; after the answer the first two are crossed and real-time OLAP lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="a number that must be correct to the second and cheap at huge query volume — which option?" h={200}>
      {OPTS.map((l, i) => (
        <g key={l}>
          <Cell x={25 + i * 187} y={56} w={175} label={l} o={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))} stroke={i === 2 && v > 0 ? C.focus : C.mocha} />
          {i < 2 && <Cross x={112 + i * 187} y={104} k={v} />}
        </g>
      ))}
      <AnswerRow y={145} label="fits" answer={answer} value="real-time OLAP" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={188} text="the cost: running one more system" />
    </Svg>
  );
}
