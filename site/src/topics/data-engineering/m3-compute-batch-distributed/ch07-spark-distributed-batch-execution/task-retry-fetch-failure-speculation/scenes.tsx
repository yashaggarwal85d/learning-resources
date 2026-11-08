import { useEffect, useState } from 'react';
import { Bar, C, Draw, Plot, Svg, T } from '../../../../../reels/kit';
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

const T4 = [0, 1, 2, 3];
const VALS = ['0', '10', '20', '30'];

/** The four tasks of one stage across the top; `bad` turns task 0's outline cherry; `done[i]` ticks task i. */
function Tasks4({ y, bad = 0, done, dim = 0 }: { y: number; bad?: number; done: number[]; dim?: number }) {
  return (
    <g opacity={1 - 0.6 * dim}>
      {T4.map((i) => (
        <g key={i}>
          <Cell x={25 + i * 138} y={y} w={120} h={32} label={`task ${i}`} stroke={i === 0 && bad > 0.5 ? C.cherryText : C.mocha} />
          <MiniTick x={124 + i * 138} y={y + 12} k={done[i] ?? 0} />
        </g>
      ))}
    </g>
  );
}

/** Task 0's attempt slots at (x, y): `n` empty squares; `marks[j]` (0..1) draws a cross or, for `win`, a tick into slot j. */
function Slots({ x, y, n, marks, win = -1 }: { x: number; y: number; n: number; marks: number[]; win?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, j) => (
        <g key={j}>
          <rect x={x + j * 34} y={y} width={26} height={26} rx={3} fill="none" stroke={C.latte} strokeWidth={1.3} />
          {j === win ? <MiniTick x={x + j * 34 + 7} y={y + 13} k={marks[j] ?? 0} /> : <Cross x={x + j * 34 + 13} y={y + 13} k={marks[j] ?? 0} />}
        </g>
      ))}
    </g>
  );
}

// 0 · Hook. Four tasks; task 0 turns cherry and its first two attempts are crossed out, a question on the third.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="one task keeps failing. Does the job die the first time, or get more tries?" h={220}>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <Tasks4 y={30} bad={seg(t, 0.6, 0.8)} done={[0, 0, 0, 0]} />
      </g>
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        task 0's attempts
      </T>
      <Slots x={25} y={112} n={2} marks={[easeOut(seg(t, 0.9, 1.2)), easeOut(seg(t, 1.6, 1.9))]} />
      <T x={110} y={131} s={15} f={C.focus} o={easeOut(seg(t, 2.3, 2.6))}>
        ?
      </T>
      <T x={25} y={196} s={13} f={C.focus} o={easeOut(seg(t, 2.9, 3.3))}>
        die now, or more chances?
      </T>
    </Svg>
  );
}

// 1 · Enough chances. Four slots; task 0's first two cross, the third ticks; the others tick; the results land
// under each task and the job finishes.
export function RevealBaselineRecovers({ t }: StepCtx) {
  const m = [easeOut(seg(t, 0.4, 0.7)), easeOut(seg(t, 0.9, 1.2)), easeOut(seg(t, 1.4, 1.7))];
  return (
    <Svg label="measured: given enough tries, the flaky task comes through, job finishes." h={230}>
      <Tasks4 y={30} bad={m[2] > 0.5 ? 0 : 1} done={[m[2], easeOut(seg(t, 0.4, 0.7)), easeOut(seg(t, 0.5, 0.8)), easeOut(seg(t, 0.6, 0.9))]} />
      <T x={25} y={100} s={11} f={C.latte}>
        limit: 4 tries
      </T>
      <Slots x={25} y={112} n={4} marks={m} win={2} />
      {T4.map((i) => (
        <T key={i} x={85 + i * 138} y={176} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 2.0 + i * 0.15, 2.3 + i * 0.15))}>
          {VALS[i]}
        </T>
      ))}
      <T x={25} y={214} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        the job finishes, as if nothing went wrong
      </T>
    </Svg>
  );
}

// 2 · Predict. Only two slots this time, both crossed; task 0 would need a third. Does the job still recover?
export function PredictLowerLimit({ t, answer }: StepCtx) {
  return (
    <Svg label="fewer tries than it needs. Does the job still recover?" h={230}>
      <Tasks4 y={30} bad={1} done={[0, 1, 1, 1]} />
      <T x={25} y={100} s={11} f={C.latte}>
        limit: 2 tries
      </T>
      <Slots x={25} y={112} n={2} marks={[easeOut(seg(t, 0.3, 0.6)), easeOut(seg(t, 0.8, 1.1))]} />
      <rect x={93} y={112} width={26} height={26} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={140} y={131} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        it needs a third
      </T>
      <Verdict answer={answer} y={200} text="it stops trying" />
    </Svg>
  );
}

// 3 · Gives up. The two slots cross; the whole stage dims and the scheduler's own abort line types in, in cherry.
export function RevealGivesUp({ t }: StepCtx) {
  const ab = easeOut(seg(t, 1.5, 2.0));
  return (
    <Svg label="measured: it gives up. Same task, same failures, job aborts this time." h={230}>
      <Tasks4 y={30} bad={1} done={[0, 1, 1, 1]} dim={ab} />
      <Slots x={25} y={100} n={2} marks={[easeOut(seg(t, 0.3, 0.6)), easeOut(seg(t, 0.8, 1.1))]} />
      <T x={25} y={170} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        failed 2 times; aborting job
      </T>
      <T x={25} y={212} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        same task, same failures, fewer chances
      </T>
    </Svg>
  );
}

// 4 · A fixed count. Two chance tokens, each spent and crossed; beside them a dashed ghost third attempt that would
// have ticked, never reached.
export function ElaborateFixedChances({ t }: StepCtx) {
  return (
    <Svg label="a retry limit is a fixed number of chances, not an unlimited one." h={220}>
      <T x={25} y={34} s={11} f={C.latte}>
        chances
      </T>
      {[0, 1].map((j) => {
        const sp = easeOut(seg(t, 0.5 + j * 0.8, 0.9 + j * 0.8));
        return (
          <g key={j}>
            <circle cx={50 + j * 50} cy={80} r={16} fill={sp > 0.5 ? 'none' : C.focus} stroke={C.focus} strokeWidth={1.6} />
            <Cross x={50 + j * 50} y={80} k={sp} />
          </g>
        );
      })}
      <circle cx={150} cy={80} r={16} fill="none" stroke={C.mocha} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.2, 2.6))} />
      <MiniTick x={143} y={80} k={easeOut(seg(t, 2.6, 3.0))} f={C.mocha} />
      <T x={185} y={84} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        might have worked, never tried
      </T>
      <T x={25} y={150} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        all spent: the job dies
      </T>
      <T x={25} y={196} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        a fixed number, not an unlimited one
      </T>
    </Svg>
  );
}

/** The shuffle DAG: four map tasks, an Exchange bar with each task's file, four reduce tasks. `lost` fades file 1
 * to a cherry dashed outline; `rerun` drives the map stage's second attempt; `fail` crosses reduce task 1. */
function Dag({ t0 = 1, lost = 0, rerun = 0, fail = 0, again = 0, whole = 0 }: { t0?: number; lost?: number; rerun?: number; fail?: number; again?: number; whole?: number }) {
  return (
    <g opacity={t0}>
      <T x={25} y={22} s={11} f={C.latte}>
        map stage
      </T>
      <rect x={25} y={30} width={130} height={150} rx={4} fill="none" stroke={whole > 0.5 ? C.second : C.mocha} strokeWidth={whole > 0.5 ? 2 : 1.4} />
      {T4.map((i) => (
        <g key={i}>
          <rect x={35} y={40 + i * 34} width={110} height={26} rx={3} fill={C.cocoa} stroke={rerun > 0 ? C.second : C.latte} strokeWidth={1.3} />
          {rerun > 0 && <rect x={39} y={60 + i * 34} width={102 * clamp(rerun * 1.3 - i * 0.1, 0, 1)} height={3} fill={C.second} />}
          <rect
            x={185}
            y={46 + i * 34}
            width={14}
            height={14}
            rx={2}
            fill={i === 1 && lost > 0.5 && rerun < 0.99 ? 'none' : C.latte}
            stroke={i === 1 && lost > 0.5 && rerun < 0.99 ? C.cherryText : C.latte}
            strokeDasharray={i === 1 && lost > 0.5 && rerun < 0.99 ? '3 2' : undefined}
            strokeWidth={1.3}
          />
          <rect x={320} y={40 + i * 34} width={110} height={26} rx={3} fill={C.cocoa} stroke={i === 1 && fail > 0.5 && again < 0.5 ? C.cherryText : C.latte} strokeWidth={1.3} />
          {again > 0 && <MiniTick x={440} y={53 + i * 34} k={again} />}
        </g>
      ))}
      <rect x={165} y={36} width={10} height={140} rx={2} fill={C.mocha} />
      {fail > 0 && again < 0.5 && <Cross x={447} y={87} k={fail} />}
      <T x={320} y={22} s={11} f={C.latte}>
        reduce stage
      </T>
      <path d="M205 112 h110" stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
    </g>
  );
}

// 5 · Predict. Four map tasks write four shuffle files; file 1 vanishes to a dashed cherry outline. Redo one piece, or more?
export function PredictLostPiece({ t, answer }: StepCtx) {
  return (
    <Svg label="a finished piece of work goes missing. Just that piece redone, or more?" h={250}>
      <Dag t0={easeOut(seg(t, 0.1, 0.4))} lost={seg(t, 0.7, 0.9)} />
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.2, 1.6)) : 0}>
        one piece redone, or more?
      </T>
      <Verdict answer={answer} y={230} text="far more: the whole earlier stage" />
    </Svg>
  );
}

// 6 · Far more. Reduce task 1 crosses (fetch failed); the whole map stage reruns, all four progress bars; file 1 returns;
// every reduce task ticks.
export function RevealFarMore({ t }: StepCtx) {
  const rr = easeInOut(seg(t, 1.0, 2.6));
  return (
    <Svg label="measured: far more. The entire earlier stage reruns, not just one piece." h={240}>
      <Dag lost={1} fail={easeOut(seg(t, 0.3, 0.6))} rerun={rr} whole={seg(t, 0.9, 1.0)} again={easeOut(seg(t, 2.9, 3.3))} />
      <T x={470} y={92} s={11} f={C.cherryText} o={easeOut(seg(t, 0.5, 0.8)) * (1 - seg(t, 2.8, 3.0))}>
        fetch failed
      </T>
      <T x={25} y={218} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        map stage, attempt 2: every task
      </T>
    </Svg>
  );
}

// 7 · No partial fix. The lost file's hole; a "patch just this" option is crossed out; "rerun what produced it" ticks
// and an arrow sweeps back over the whole map stage.
export function ElaborateNoPartialFix({ t }: StepCtx) {
  return (
    <Svg label="once that work is gone, there's no partial fix available." h={240}>
      <rect x={25} y={30} width={40} height={40} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" />
      <T x={80} y={56} s={12} f={C.cherryText}>
        the lost file
      </T>
      <Cell x={25} y={100} w={260} h={32} label="patch just that file" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cross x={305} y={116} k={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={25} y={160} w={260} h={32} label="rerun what produced it" stroke={C.second} o={easeOut(seg(t, 1.8, 2.1))} />
      <MiniTick x={298} y={176} k={easeOut(seg(t, 2.2, 2.5))} f={C.second} />
      {T4.map((i) => (
        <rect key={i} x={360 + i * 52} y={160} width={44} height={32} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.7 + i * 0.2, 3.0 + i * 0.2))} />
      ))}
      <T x={360} y={220} s={11} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        the whole map stage
      </T>
    </Svg>
  );
}

// 8 · Side by side. Left: task failure, bounded: two tokens spent, a stop. Right: a lost file drags all four map tasks back.
export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: both failures, side by side." h={250}>
      <T x={25} y={30} s={12} f={C.crema}>
        a failing task
      </T>
      {[0, 1].map((j) => (
        <g key={j}>
          <circle cx={45 + j * 44} cy={74} r={14} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.3, 0.6))} />
          <Cross x={45 + j * 44} y={74} k={easeOut(seg(t, 0.8 + j * 0.5, 1.1 + j * 0.5))} />
        </g>
      ))}
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        bounded by a count
      </T>
      <T x={330} y={30} s={12} f={C.crema}>
        a lost shuffle file
      </T>
      {T4.map((i) => (
        <rect key={i} x={330} y={48 + i * 30} width={120 * easeOut(seg(t, 2.4 + i * 0.15, 3.2 + i * 0.15))} height={20} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} />
      ))}
      <T x={330} y={186} s={11} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        a whole stage, back in motion
      </T>
      <T x={25} y={236} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        one is a count; one is a stage
      </T>
    </Svg>
  );
}

// 9 · Recap. Two lines with their pictures: a fixed row of chance tokens, spent one per failure until none are left;
// a lost file pulling a whole finished stage back, each task draining and running again.
export function Recap({ t }: StepCtx) {
  // the retry limit: four chance tokens land, then each failure spends one, until the row is empty
  const lost = easeOut(seg(t, 2.3, 2.6));
  return (
    <Svg label="a retry limit is bounded; a lost piece can cost far more than one task." h={250}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        a retry limit buys a fixed count
      </T>
      {[0, 1, 2, 3].map((j) => {
        const land = easeOutBack(seg(t, 0.4 + j * 0.15, 0.7 + j * 0.15));
        const spend = easeInOut(seg(t, 1.1 + j * 0.2, 1.4 + j * 0.2));
        return (
          <g key={j}>
            <circle cx={45 + j * 36} cy={80} r={12} fill="none" stroke={C.line} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.4, 0.7))} />
            {spend < 1 && <circle cx={45 + j * 36 + spend * 40} cy={80 - (1 - clamp(land, 0, 1.2)) * 20 + spend * 24} r={12 * (1 - spend * 0.6)} fill={C.focus} opacity={clamp(land) * (1 - spend)} />}
          </g>
        );
      })}
      <T x={200} y={86} s={13} f={C.quiet} o={easeOut(seg(t, 1.9, 2.2))}>
        then the job fails
      </T>
      <T x={25} y={146} s={13} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        losing finished work costs a stage
      </T>
      <rect x={25} y={164} width={30} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" opacity={lost} />
      {/* the one lost file pulls the whole finished stage back: each done task drains, then runs again */}
      <Draw pts={[[55, 179], [76, 179]]} t={t} from={2.6} to={2.8} stroke={C.cherryText} w={2} />
      {T4.map((i) => {
        const done = easeOut(seg(t, 0.2, 0.6));
        const drain = easeInOut(seg(t, 2.9 + i * 0.12, 3.3 + i * 0.12));
        const again = easeInOut(seg(t, 3.5 + i * 0.2, 4.1 + i * 0.2));
        const fillW = 36 * clamp(1 - drain + again);
        return (
          <g key={i} opacity={easeOut(seg(t, 2.3, 2.6))}>
            <rect x={80 + i * 50} y={164} width={42} height={30} rx={3} fill={C.cocoa} stroke={drain > 0 && again < 1 ? C.cherryText : C.second} strokeWidth={1.4} />
            <rect x={83 + i * 50} y={167} width={Math.max(0, fillW * done)} height={24} rx={2} fill={C.second} opacity={0.55} />
          </g>
        );
      })}
    </Svg>
  );
}
