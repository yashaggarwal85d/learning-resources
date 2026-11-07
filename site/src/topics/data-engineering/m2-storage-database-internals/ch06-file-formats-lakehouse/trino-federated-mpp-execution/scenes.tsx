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

/** The ten 2,000-row splits of the events table as a strip of cells at y; `st(i)` says each one's state. */
type SplitState = 'idle' | 'done' | 'fail' | 'lost' | 'retry';
function Splits({ y, st, o = 1 }: { y: number; st: (i: number) => SplitState; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => {
        const s = st(i);
        const stroke = s === 'done' || s === 'retry' ? C.focus : s === 'fail' ? C.cherryText : C.mocha;
        return (
          <g key={i}>
            <rect x={25 + i * 54} y={y} width={46} height={26} rx={3} fill={C.cocoa} stroke={stroke} strokeWidth={s === 'idle' || s === 'lost' ? 1.2 : 2} opacity={s === 'lost' ? 0.4 : 1} />
            {(s === 'done' || s === 'retry') && <MiniTick x={42 + i * 54} y={y + 13} k={1} f={s === 'retry' ? C.second : C.focus} />}
            {s === 'fail' && <Cross x={48 + i * 54} y={y + 13} k={1} />}
          </g>
        );
      })}
    </g>
  );
}

/** A worker box. */
function Worker({ x, y, label = 'worker', k = 1, stroke = C.mocha, w = 100 }: { x: number; y: number; label?: string; k?: number; stroke?: string; w?: number }) {
  return <Cell x={x} y={y} w={w} h={28} label={label} stroke={stroke} o={k} />;
}

// 1 · Hook. The decided Iceberg table on the left; a query fans out to a fleet of machines on the right: who reads it back?
export function Hook({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="iceberg, over a rest catalog -- decided. now: who actually runs the query?" h={200}>
      <Cell x={25} y={80} w={150} h={32} label="Iceberg table" o={easeOut(seg(t, 0.1, 0.4))} />
      <MiniTick x={150} y={70} k={easeOut(seg(t, 0.4, 0.8))} />
      <T x={25} y={140} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        written: decided
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 340 + (i % 3) * 78;
        const y = 40 + Math.floor(i / 3) * 70;
        return (
          <g key={i}>
            <line x1={177} y1={96} x2={lerp(177, x, f)} y2={lerp(96, y + 14, f)} stroke={C.mocha} strokeWidth={1.2} />
            <rect x={x} y={y} width={64} height={28} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.2 + i * 0.1, 2.5 + i * 0.1))} />
          </g>
        );
      })}
      <T x={340} y={175} s={12} f={C.second} o={easeOut(seg(t, 3.0, 3.4))}>
        who reads it back?
      </T>
    </Svg>
  );
}

// 2 · Predict. Splits complete one by one; at split 4 a worker drops out.
export function PredictTaskFailure({ t, answer }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.3, 1.9) * 4));
  return (
    <Svg label="one worker fails mid-query, by default. does the whole query fail, or just that task?" h={200}>
      <Splits y={30} st={(i) => (i < n ? 'done' : i === 4 && t > 2.1 ? 'fail' : 'idle')} />
      <T x={241} y={84} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.1, 2.4))}>
        a worker drops out
      </T>
      <AnswerRow y={140} label="by default" answer={answer} value="the whole query fails" k={easeOut(seg(t, 2.6, 3.1))} />
      <Verdict answer={answer} y={184} text="resubmitted by hand, from the start" />
    </Svg>
  );
}

// 3 · Coordinator and workers. The query text stays at the coordinator; it deals ten split tasks to four workers, which pass results on.
export function RevealCoordinatorWorker({ t }: StepCtx) {
  const deal = seg(t, 1.0, 2.6);
  const ex = easeInOut(seg(t, 3.0, 3.8));
  return (
    <Svg label="the whole query fails, by default. coordinator plans and schedules; workers execute and exchange." h={230}>
      <Cell x={200} y={16} w={200} h={32} label="coordinator: the plan" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.5))} />
      <T x={420} y={37} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))}>
        SQL stays here
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const w = i % 4;
        const q = clamp((deal - i * 0.08) / 0.3);
        return <circle key={i} cx={lerp(300, 85 + w * 140, easeInOut(q))} cy={lerp(50, 108, easeInOut(q))} r={4} fill={C.second} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      {[0, 1, 2, 3].map((w) => (
        <Worker key={w} x={35 + w * 140} y={112} k={easeOut(seg(t, 0.6 + w * 0.1, 0.9 + w * 0.1))} />
      ))}
      {[0, 1, 2].map((w) => (
        <Req key={w} x1={137 + w * 140} x2={170 + w * 140} y={126} k={ex} f={C.focus} />
      ))}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        each runs its piece, never the request
      </T>
      <T x={25} y={210} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        results passed along, worker to worker
      </T>
    </Svg>
  );
}

// 4 · Dynamic filtering. users (2,000 rows) filtered to APAC gives 285 keys; the bundle flies to the events scan and every split's bar
// shrinks before it is read.
export function RevealDynamicFiltering({ t }: StepCtx) {
  const fly = easeInOut(seg(t, 1.4, 2.2));
  const pr = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="the join's build side makes a real filter, pruning the probe scan before it reads those rows." h={230}>
      <Cell x={25} y={20} w={150} h={30} label="users · 2,000" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={200} y={40} s={12} f={C.second} o={easeOut(seg(t, 0.6, 1.0))}>
        region = APAC → 285 keys
      </T>
      <rect x={lerp(200, 211, fly)} y={lerp(52, 90, fly)} width={60} height={12} rx={3} fill={C.second} opacity={fly > 0 && fly < 1 ? 1 : 0} />
      <T x={25} y={214} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        events scan · 10 splits · 20,000 rows
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.8 + i * 0.03, 2.1 + i * 0.03))}>
          <rect x={25 + i * 54} y={100} width={46} height={90} rx={3} fill="none" stroke={C.mocha} strokeWidth={1} />
          <rect x={27 + i * 54} y={102 + 86 * (1 - lerp(1, 1 / 7, pr))} width={42} height={86 * lerp(1, 1 / 7, pr)} fill={C.latte} opacity={0.6} />
        </g>
      ))}
      <T x={330} y={76} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        skipped, never read
      </T>
    </Svg>
  );
}

// 5 · Predict. Two bars from their row counts: users, short; events, ten times longer. Which builds the hash table?
export function PredictBuildSide({ t, answer }: StepCtx) {
  return (
    <Svg label="real row-count statistics exist for both tables. which one does trino build the join on?" h={200}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        users · 2,000 rows
      </T>
      <rect x={25} y={40} width={46 * easeOut(seg(t, 0.3, 0.9))} height={12} fill={C.latte} />
      <T x={25} y={80} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        events · 20,000 rows
      </T>
      <rect x={25} y={90} width={460 * easeOut(seg(t, 0.8, 1.8))} height={12} fill={C.latte} />
      <AnswerRow y={140} label="loaded into memory" answer={answer} value="the smaller table" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="the small side costs less to hold" />
    </Svg>
  );
}

// 6 · The cost-based choice. The users bar lifts into a memory box; events streams past it. Then the counts are struck out and the planner
// only rules out the cross join.
export function RevealCostBasedBuildSide({ t }: StepCtx) {
  const up = easeInOut(seg(t, 0.4, 1.2));
  const strm = seg(t, 1.2, 2.6);
  const st = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="the smaller table, by real row-count statistics. without stats, trino only eliminates cross joins." h={230}>
      <rect x={400} y={16} width={150} height={44} rx={4} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={410} y={78} s={11} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))}>
        hash table, in memory
      </T>
      <rect x={lerp(25, 450, up)} y={lerp(40, 32, up)} width={46} height={12} fill={C.second} />
      <T x={25} y={30} s={12} f={C.latte}>
        users · 2,000 rows
      </T>
      <line x1={25} y1={100} x2={380} y2={100} stroke={C.mocha} strokeWidth={1} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + ((strm * 360 + i * 45) % 355)} y={94} width={30} height={12} fill={C.latte} opacity={strm > 0 && strm < 1 ? 0.7 : 0} />
      ))}
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        events · 20,000, streamed past
      </T>
      <line x1={25} y1={125} x2={25 + 250 * st} y2={125} stroke={C.cherryText} strokeWidth={2} />
      <T x={25} y={176} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        no counts: no smart order, only
      </T>
      <T x={25} y={206} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        never a cross join
      </T>
    </Svg>
  );
}

// 7 · TASK retry. All ten splits spool their output; split 4 fails, then retries alone (second attempt) while the others keep their ticks.
export function RevealTaskRetry({ t }: StepCtx) {
  const n = Math.min(10, Math.floor(seg(t, 0.3, 2.3) * 10));
  const re = t > 3.0;
  return (
    <Svg label="task retry: a failed task retries alone, reusing other tasks' already-spooled output." h={230}>
      <Splits y={40} st={(i) => (i === 4 ? (re ? 'retry' : i < n ? 'fail' : 'idle') : i < n ? 'done' : 'idle')} />
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        each task's output spooled
      </T>
      <path d={`M241 70 v${30 * easeOut(seg(t, 2.4, 2.9))}`} stroke={C.second} strokeWidth={1.6} fill="none" />
      <T x={241} y={122} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        split 4 retried alone: attempt 2
      </T>
      <Row y={180} label="every other split" value="attempt 1, reused" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 8 · History. A two-stop timeline: 2019, the creators leave and start a foundation; December 2020, the trademark forces the name Trino.
export function RevealPrestoHistory({ t }: StepCtx) {
  const l = easeInOut(seg(t, 0.2, 3.0));
  return (
    <Svg label="trino wasn't always trino: a 2019 governance split, a 2020 rename after a trademark filing." h={230}>
      <line x1={60} y1={80} x2={lerp(60, 540, l)} y2={80} stroke={C.mocha} strokeWidth={2} />
      <Cell x={25} y={30} w={110} h={28} label="Presto" o={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={200} cy={80} r={7} fill={C.second} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={200} y={112} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        2019
      </T>
      <T x={200} y={140} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
        creators leave
      </T>
      <circle cx={430} cy={80} r={7} fill={C.focus} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={430} y={112} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        Dec 2020
      </T>
      <T x={430} y={140} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>
        trademark fight
      </T>
      <Cell x={380} y={170} w={100} h={30} label="Trino" stroke={C.focus} o={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 9 · Prestissimo. Presto's own Java coordinator stays on top; its Java workers flip one by one into C++ workers on Velox.
export function RevealPrestissimo({ t }: StepCtx) {
  return (
    <Svg label="presto's own alternative: prestissimo, a drop-in c++ worker on meta's velox -- same java coordinator." h={230}>
      <Cell x={175} y={20} w={250} h={32} label="Java coordinator, unchanged" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2].map((i) => {
        const f = easeInOut(seg(t, 1.6 + i * 0.5, 2.0 + i * 0.5));
        const x = 40 + i * 180;
        return (
          <g key={i}>
            <line x1={300} y1={54} x2={x + 70} y2={98} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.6, 1.0))} />
            <g transform={`translate(${x + 70} 0) scale(${Math.abs(1 - 2 * f).toFixed(3)} 1) translate(${-(x + 70)} 0)`}>
              {f < 0.5 ? <Worker x={x} y={100} w={140} label="Java worker" k={easeOut(seg(t, 0.8, 1.2))} /> : <Worker x={x} y={100} w={140} label="C++ worker" stroke={C.second} />}
            </g>
          </g>
        );
      })}
      <T x={300} y={170} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        Velox underneath: same brain, new hands
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real coordinator, a real filter, a real cost choice, a real retry -- on this chapter's table. next: clickhouse." h={250}>
      <Row y={40} label="a dead machine" value="only its task retried" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a dynamic filter" value="skips unneeded rows" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the join" value="smaller side built" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
