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

const EIGHT = [0, 1, 2, 3, 4, 5, 6, 7];

/** Eight tasks of one stage as vertical bars on a baseline at `base`: the last one `hot` tall, the rest `h` tall. */
function Stage8({ x, base, h, hot, k = 1, hotF = C.bad, hotS = C.cherryText }: { x: number; base: number; h: number; hot: number; k?: number; hotF?: string; hotS?: string }) {
  return (
    <g>
      {EIGHT.map((i) => {
        const hh = (i === 7 ? hot : h) * k;
        return <rect key={i} x={x + i * 26} y={base - hh} width={18} height={Math.max(hh, 1)} fill={i === 7 ? hotF : C.mocha} stroke={i === 7 ? hotS : C.latte} strokeWidth={1.2} />;
      })}
      <line x1={x - 4} y1={base} x2={x + 208} y2={base} stroke={C.mocha} strokeWidth={1.4} />
    </g>
  );
}

// 0 · Hook. Five job bars draw in to the same slow length; each gets a question mark for its cause.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="five jobs are slow. Same symptom from a distance, five different causes." h={240}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={25} y={20 + i * 36} width={400 * easeOut(seg(t, 0.2 + i * 0.15, 1.0 + i * 0.15))} height={18} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
          <T x={460} y={34 + i * 36} s={13} f={C.focus} o={easeOut(seg(t, 1.8 + i * 0.15, 2.1 + i * 0.15))}>
            cause?
          </T>
        </g>
      ))}
      <T x={25} y={226} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        one dashboard, five different problems?
      </T>
    </Svg>
  );
}

// 1 · Skew, measured. Eight tasks of one stage rise: seven stay low, one climbs far above them in cherry.
export function RevealSkew({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="measured: one task in an eight-task stage runs hundreds of times longer than the rest." h={230}>
      <T x={25} y={22} s={11} f={C.latte}>
        one stage: 8 tasks, duration
      </T>
      <Stage8 x={40} base={190} h={2} hot={150} k={g} />
      <T x={290} y={70} s={12} f={C.cherryText} o={easeOut(seg(t, 1.9, 2.3))}>
        hundreds of times longer
      </T>
      <T x={290} y={130} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        one key, almost all the data
      </T>
    </Svg>
  );
}

/** The stage's task-table summary: min, median, max as three bars; `show` reveals the values, `k` grows them. */
function Summary({ y, show, k }: { y: number; show: boolean; k: number }) {
  const rows: [string, number, string][] = [
    ['min', 6, C.latte],
    ['median', 8, C.latte],
    ['max', 400, C.cherryText],
  ];
  return (
    <g>
      {rows.map(([l, w, f], i) => (
        <g key={l}>
          <T x={25} y={y + i * 44 + 14} s={12} f={C.latte}>
            {l}
          </T>
          {show ? (
            <rect x={120} y={y + i * 44} width={w * k} height={18} fill={i === 2 ? C.bad : C.latte} stroke={f} strokeWidth={1.2} />
          ) : (
            <rect x={120} y={y + i * 44} width={60} height={18} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
          )}
          {!show && (
            <T x={200} y={y + i * 44 + 14} s={13} f={C.focus}>
              ?
            </T>
          )}
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. The task table's min, median and max rows, each value still a dashed blank.
export function PredictTaskTable({ t, answer }: StepCtx) {
  return (
    <Svg label="what will the stage's own task-duration table show for this?" h={230}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the stage's task table, duration
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <Summary y={44} show={false} k={0} />
      </g>
      <Verdict answer={answer} y={210} text="it announces itself" />
    </Svg>
  );
}

// 3 · Measured. The three rows fill in: min and median short and level, max running nearly the full width in cherry.
export function RevealTableConfirms({ t }: StepCtx) {
  return (
    <Svg label="measured: one bar towers over the rest. Min, median and max tell it apart." h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        the stage's task table, duration
      </T>
      <Summary y={44} show k={easeOut(seg(t, 0.4, 1.8))} />
      <path d="M140 62 v20" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 2.0, 2.4))} />
      <T x={160} y={80} s={11} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))}>
        min and median agree
      </T>
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        no formula: just three numbers
      </T>
    </Svg>
  );
}

// 4 · Within a stage. Stage A: one bar towers over its neighbours, ticked. Stage B: every task uniformly long.
// Comparing A's tall bar against stage B's is crossed out.
export function ElaborateSkewSignature({ t }: StepCtx) {
  return (
    <Svg label="skew's signature: uneven durations in the SAME stage, not across stages." h={240}>
      <T x={25} y={22} s={11} f={C.latte}>
        stage A
      </T>
      <Stage8 x={40} base={170} h={14} hot={120} k={easeOut(seg(t, 0.2, 1.0))} />
      <T x={330} y={22} s={11} f={C.latte}>
        stage B
      </T>
      <Stage8 x={345} base={170} h={70} hot={70} k={easeOut(seg(t, 0.6, 1.4))} hotF={C.mocha} hotS={C.latte} />
      <path d={`M40 ${186} v6 h${208 * easeOut(seg(t, 1.6, 2.2))} v-6`} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={t > 1.6 ? 1 : 0} />
      <T x={40} y={212} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        against its neighbours
      </T>
      <MiniTick x={230} y={208} k={easeOut(seg(t, 2.6, 2.9))} />
      <line x1={262} y1={60} x2={lerp(262, 330, easeOut(seg(t, 3.0, 3.5)))} y2={60} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 3" opacity={t > 3.0 ? 1 : 0} />
      <Cross x={296} y={44} k={easeOut(seg(t, 3.6, 3.9))} />
      <T x={345} y={212} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        not another stage
      </T>
    </Svg>
  );
}

// 5 · Predict. A second job's stage with the same lopsided shape. Same cause, or not settled by shape alone?
export function PredictSpillShape({ t, answer }: StepCtx) {
  return (
    <Svg label="a second job: real spill bytes on one task only, zero on the rest. What is it?" h={230}>
      <T x={25} y={22} s={11} f={C.latte}>
        another job, same shape
      </T>
      <Stage8 x={40} base={170} h={14} hot={120} k={easeOut(seg(t, 0.2, 1.0))} />
      <T x={420} y={100} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.2, 1.6)) : 0}>
        same cause?
      </T>
      <Verdict answer={answer} y={212} text="the shape alone doesn't settle it" />
    </Svg>
  );
}

// 6 · Measured. The outlier task's spill columns fill (memory, then disk) while the other tasks read zero; then two
// twin jobs' GC time: a real bar for the RDD job, zero for the DataFrame job.
export function RevealSpillAndGC({ t }: StepCtx) {
  return (
    <Svg label="measured: spill (memory/disk) on one task; GC time nonzero only in the RDD job." h={250}>
      <T x={230} y={22} s={11} f={C.latte}>
        spill: memory
      </T>
      <T x={400} y={22} s={11} f={C.latte}>
        spill: disk
      </T>
      <T x={25} y={52} s={12} f={C.cherryText}>
        the outlier task
      </T>
      <rect x={230} y={40} width={130 * easeOut(seg(t, 0.4, 1.2))} height={16} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <rect x={400} y={40} width={95 * easeOut(seg(t, 1.0, 1.8))} height={16} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <T x={25} y={92} s={12} f={C.latte}>
        every other task
      </T>
      <T x={230} y={92} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        0
      </T>
      <T x={400} y={92} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        0
      </T>
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        RDD job: GC time
      </T>
      <rect x={260} y={138} width={110 * easeOut(seg(t, 2.7, 3.4))} height={16} fill={C.focus} />
      <T x={25} y={196} s={12} f={C.second} o={easeOut(seg(t, 3.2, 3.5))}>
        DataFrame twin: GC time
      </T>
      <T x={260} y={196} s={13} f={C.second} o={easeOut(seg(t, 3.6, 3.9))}>
        0
      </T>
      <T x={25} y={238} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        the per-task columns decide, not the shape
      </T>
    </Svg>
  );
}

// 7 · Two more. Top: a field of tiny tasks and one zoomed: its scheduling slice longer than its work slice. Bottom: two
// jobs on a timeline with a gap between where every executor lane sits idle.
export function RevealSmallFilesAndDriver({ t }: StepCtx) {
  const g = easeOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="measured: 2,000 tiny tasks where overhead beats the work; a gap with every executor idle." h={250}>
      <T x={25} y={20} s={11} f={C.latte}>
        2,000 tiny tasks
      </T>
      {Array.from({ length: 120 }, (_, i) => (
        <rect key={i} x={25 + (i % 30) * 8} y={30 + Math.floor(i / 30) * 8} width={5} height={5} fill={C.latte} opacity={clamp(easeOut(seg(t, 0.2, 1.0)) * 120 - i, 0, 1)} />
      ))}
      <T x={300} y={36} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        scheduling
      </T>
      <rect x={300} y={44} width={150 * easeOut(seg(t, 1.2, 1.8))} height={14} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <rect x={450} y={44} width={40 * easeOut(seg(t, 1.8, 2.2))} height={14} fill={C.focus} />
      <T x={455} y={78} s={11} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        work
      </T>
      {[0, 1, 2].map((l) => (
        <g key={l}>
          <rect x={25} y={130 + l * 26} width={150} height={16} fill={C.mocha} stroke={C.latte} strokeWidth={1.1} opacity={easeOut(seg(t, 2.4, 2.7))} />
          <line x1={185} y1={138 + l * 26} x2={185 + 200 * g} y2={138 + l * 26} stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 4" />
          <rect x={395} y={130 + l * 26} width={150} height={16} fill={C.mocha} stroke={C.latte} strokeWidth={1.1} opacity={easeOut(seg(t, 3.6, 3.9))} />
        </g>
      ))}
      <T x={290} y={122} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        every executor idle
      </T>
      <T x={25} y={232} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        work happening outside any stage
      </T>
    </Svg>
  );
}

// 8 · The order. Four cells left to right, each lighting in turn: task spread, spill and GC, task count, idle gaps.
export function ElaborateTriageOrder({ t }: StepCtx) {
  const steps = ['task spread', 'spill, GC', 'task count', 'idle gaps'];
  return (
    <Svg label="a fixed order: task-duration spread, then spill/GC columns, then task count, then idle gaps." h={200}>
      {steps.map((s, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.9, 0.8 + i * 0.9));
        return (
          <g key={s}>
            <Cell x={25 + i * 140} y={70} w={124} h={36} label={s} stroke={k > 0.5 ? C.focus : C.mocha} o={0.4 + 0.6 * k} />
            {i < 3 && <Req x1={149 + i * 140} x2={163 + i * 140} y={88} k={easeOut(seg(t, 0.8 + i * 0.9, 1.1 + i * 0.9))} f={C.latte} />}
          </g>
        );
      })}
      <T x={25} y={160} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        one method instead of five hunts
      </T>
    </Svg>
  );
}

// 9 · Recap. Five causes on the left, each joined by a line to the one place its trace sits.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['skew', 'task spread'],
    ['spill', 'spill columns'],
    ['GC', 'GC time'],
    ['tiny tasks', 'task count'],
    ['driver work', 'idle gaps'],
  ];
  return (
    <Svg label="one triage order, five causes: duration spread, spill/GC columns, task count, idle gaps." h={250}>
      {rows.map(([a, b], i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.6, 0.8 + i * 0.6));
        return (
          <g key={a}>
            <T x={25} y={34 + i * 44} s={12} f={C.crema} o={k}>
              {a}
            </T>
            <line x1={150} y1={30 + i * 44} x2={lerp(150, 320, k)} y2={30 + i * 44} stroke={C.latte} strokeWidth={1.2} opacity={k > 0 ? 1 : 0} />
            <T x={330} y={34 + i * 44} s={12} f={C.second} o={easeOut(seg(t, 0.7 + i * 0.6, 1.0 + i * 0.6))}>
              {b}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}
