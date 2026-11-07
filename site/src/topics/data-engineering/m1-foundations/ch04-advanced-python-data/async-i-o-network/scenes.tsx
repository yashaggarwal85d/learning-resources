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

// 1 · Hook. A field of open connections, all grey and waiting; one thread's pointer darts among them, touching each briefly.
export function Hook({ t }: StepCtx) {
  const n = 40;
  const at = Math.floor((t * 7) % n);
  return (
    <Svg label="thousands of waiting connections, one thread — how does it serve all of them at once?" h={250}>
      <Row y={40} label="thousands open" value="almost all waiting" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one thread" value="keeps all of it moving" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {Array.from({ length: n }, (_, i) => {
        const x = 45 + (i % 10) * 56;
        const y = 125 + Math.floor(i / 10) * 28;
        const on = t > 1.6 && i === at;
        return <circle key={i} cx={x} cy={y} r={on ? 7 : 5} fill={on ? C.focus : C.latte} opacity={(on ? 1 : 0.45) * easeOut(seg(t, 0.4 + (i % 10) * 0.05, 0.8 + (i % 10) * 0.05))} />;
      })}
    </Svg>
  );
}

// 2 · The event loop. A ring with tasks, callbacks and network I/O placed round it; one pointer sweeps round and round, the
// only thread there is.
export function RevealEventLoopQuote({ t }: StepCtx) {
  const ITEMS = ['tasks', 'callbacks', 'network I/O'];
  const a = t * 2.2;
  const k = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="the core of every asyncio app: tasks, callbacks, network i/o, all on one thread" h={250}>
      <Row y={40} label="one thread runs" value="tasks, callbacks, I/O" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="nothing" value="secretly multi-threaded" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <circle cx={150} cy={175} r={50} fill="none" stroke={C.mocha} strokeWidth={3} opacity={k} />
      <line x1={150} y1={175} x2={150 + 44 * Math.cos(a)} y2={175 + 44 * Math.sin(a)} stroke={C.focus} strokeWidth={3} opacity={k} />
      <circle cx={150} cy={175} r={4} fill={C.focus} opacity={k} />
      {ITEMS.map((it, i) => (
        <g key={it} opacity={easeOut(seg(t, 1.0 + i * 0.5, 1.4 + i * 0.5))}>
          <line x1={205} y1={175} x2={325} y2={135 + i * 40} stroke={C.latte} strokeWidth={1.2} />
          <Cell x={325} y={122 + i * 40} w={180} h={26} label={it} />
        </g>
      ))}
      <T x={150} y={243} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        one loop, one thread
      </T>
    </Svg>
  );
}

// 3 · Predict: does it add up? Twenty short waits stacked end to end as if serial; then the question.
export function PredictInterleaving({ t, answer }: StepCtx) {
  return (
    <Svg label="many separate waits, one thread — does the total time add up, or stay close to one wait?" h={210}>
      <Row y={40} label="20 waits, one thread" value="does it add up?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={25 + i * 27.5} y={64} width={25} height={16} rx={2} fill={C.latte} opacity={0.5 * easeOut(seg(t, 0.3 + i * 0.05, 0.5 + i * 0.05))} />
      ))}
      <AnswerRow y={140} label="it adds up" answer={answer} value="no, about one wait" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="the loop interleaves every wait" />
    </Svg>
  );
}

// 4 · Interleaving, measured. Twenty 50 ms waits start together and overlap in one short column; the serial total they would
// take, one second, is drawn dashed beside them; the measured wall clock lands under 0.4 s.
export function RevealInterleavingMeasured({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.8, 1.6));
  const sc = 520;
  return (
    <Svg label="many real waits, run concurrently — the measured total stays close to just one" h={250}>
      <Row y={40} label="20 waits of 50 ms" value="fired at once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="wall clock" value="under 0.4 s" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.3))} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={25} y={116 + i * 4.5} width={sc * 0.05 * g} height={3} rx={1} fill={C.focus} opacity={0.8} />
      ))}
      <rect x={25} y={212} width={sc * easeInOut(seg(t, 1.8, 2.6))} height={10} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="5 4" />
      <T x={545} y={240} s={11} f={C.latte} a="end" o={easeOut(seg(t, 2.4, 2.8))}>
        1 s, if the 20 ran one after another
      </T>
      <line x1={25 + sc * 0.4} y1={110} x2={25 + sc * 0.4} y2={208} stroke={C.focus} strokeWidth={1.5} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={25 + sc * 0.4 + 8} y={150} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        0.4 s
      </T>
    </Svg>
  );
}

// 5 · TaskGroup. Three tasks start inside one group; one fails early and is crossed; the others' bars stop where they are and
// grey out as cancelled; the group exits.
export function RevealTaskGroupMeasured({ t }: StepCtx) {
  const run = clamp(seg(t, 0.6, 2.0));
  const fail = 0.5;
  const stop = Math.min(run, fail);
  const x = easeOut(seg(t, 1.3, 1.6));
  const c = easeOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="a real sibling failure cancels the rest of the group — measured, not assumed" h={250}>
      <Row y={40} label="one task fails" value="the group cancels the rest" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={85} label="the group exits" value="under 1 s" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.3))} />
      <rect x={20} y={112} width={560} height={110} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.3, 0.6))} />
      {['long task', 'failing task', 'long task'].map((l, i) => (
        <g key={i}>
          <T x={35} y={138 + i * 30} s={11} f={i === 1 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
            {l}
          </T>
          <rect
            x={140}
            y={128 + i * 30}
            width={420 * (i === 1 ? stop : run < fail ? run : fail)}
            height={12}
            rx={2}
            fill={i === 1 ? C.cherryText : c > 0 ? C.latte : C.focus}
            opacity={i === 1 ? 0.8 : 0.7 - 0.4 * c}
          />
          {i !== 1 && (
            <T x={150 + 420 * fail} y={138 + i * 30} s={11} f={C.latte} o={c}>
              cancelled
            </T>
          )}
        </g>
      ))}
      <Cross x={150 + 420 * fail} y={164} k={x} />
    </Svg>
  );
}

// 6 · The semaphore. Thirty requests queue; a gate with five slots lets them through; the busiest moment's counter never passes 5.
export function RevealSemaphoreMeasured({ t }: StepCtx) {
  const p = clamp(seg(t, 0.8, 3.6));
  const done = Math.floor(p * 30);
  const inside = p > 0 && p < 1 ? 5 : 0;
  return (
    <Svg label="a real measured cap on concurrent requests — never past the semaphore's own limit" h={250}>
      <Row y={40} label="30 requests" value="a semaphore of 5" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="peak at once" value="never past 5" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {Array.from({ length: 30 }, (_, i) => {
        const queued = i >= done + inside;
        const isIn = i >= done && i < done + inside;
        const qi = i - done - inside;
        const x = isIn ? 290 + (i - done) * 0 : queued ? 255 - qi * 9 : 450 + (i % 10) * 12;
        const y = isIn ? 128 + (i - done) * 18 : queued ? 165 : 140 + Math.floor(i / 10) * 18;
        if (queued && qi > 24) return null;
        return <circle key={i} cx={x} cy={y} r={4} fill={isIn ? C.focus : queued ? C.latte : C.second} opacity={easeOut(seg(t, 0.4, 0.8)) * (queued ? 0.6 : 1)} />;
      })}
      <rect x={275} y={118} width={30} height={96} rx={4} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={290} y={234} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        5 slots
      </T>
      <T x={515} y={210} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        done
      </T>
    </Svg>
  );
}

// 7 · Predict: who pays for a blocking call? Five siblings and one coroutine that blocks outright; then the question.
export function PredictBlockingCost({ t, answer }: StepCtx) {
  return (
    <Svg label="one coroutine blocks for real — does the cost stay with it, or reach every other one?" h={210}>
      <Row y={40} label="one coroutine blocks" value="who pays?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={58} width={300 * easeOut(seg(t, 0.3, 1.0))} height={10} rx={2} fill={C.cherryText} opacity={0.7} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={345 + i * 46} y={58} width={40} height={10} rx={2} fill={C.focus} opacity={0.6 * easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))} />
      ))}
      <AnswerRow y={140} label="only that one pays" answer={answer} value="no, the whole loop" f={C.cherryText} k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="every coroutine on the loop stalls" f={C.cherryText} />
    </Svg>
  );
}

// 8 · The stall, then the fix. Top: a 0.3 s blocking call runs, and five 50 ms siblings can only start after it. Bottom: the same
// call moved to a background thread, and the five siblings finish on their own short schedule.
export function RevealBlockingMeasured({ t }: StepCtx) {
  const sc = 1000;
  const a = easeInOut(seg(t, 0.6, 1.8));
  const b = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="a real blocking call delays every sibling by its own full duration — then measurably fixed" h={250}>
      <Row y={40} label="blocking, in the loop" value="siblings: over 0.25 s" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={85} label="moved to a thread" value="siblings: under 0.15 s" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect x={25} y={112} width={sc * 0.3 * clamp(a * 1.2)} height={10} rx={2} fill={C.cherryText} opacity={0.75} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={25 + sc * 0.3} y={126 + i * 7} width={sc * 0.05 * clamp((a - 0.8) * 5)} height={5} rx={1} fill={C.latte} opacity={0.8} />
      ))}
      <rect x={25} y={180} width={sc * 0.3 * b} height={10} rx={2} fill={C.second} opacity={0.6} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={25} y={194 + i * 7} width={sc * 0.05 * clamp(b * 6)} height={5} rx={1} fill={C.focus} opacity={0.8} />
      ))}
      <T x={575} y={121} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 0.8, 1.1))}>
        0.3 s block
      </T>
      <T x={575} y={189} s={11} f={C.second} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        in a background thread
      </T>
    </Svg>
  );
}

// 9 · The deadline. A 2 s task's bar would run far past the frame (dashed); a 0.2 s deadline line drops; the bar stops at it,
// crossed, and the error is caught.
export function RevealTimeoutMeasured({ t }: StepCtx) {
  const sc = 250;
  const r = clamp(seg(t, 0.8, 1.8));
  const d = easeOut(seg(t, 0.5, 0.8));
  return (
    <Svg label="a slow task, wrapped in a deadline — cancelled near the deadline, measured for real" h={250}>
      <Row y={40} label="a 2 s task" value="a 0.2 s deadline" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="cancelled" value="under 1 s, error caught" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <rect x={25} y={150} width={550} height={16} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={575} y={190} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        2 s would run off the edge
      </T>
      <rect x={25} y={150} width={sc * 0.2 * r} height={16} rx={3} fill={C.second} opacity={0.75} />
      <line x1={25 + sc * 0.2} y1={lerp(118, 136, d)} x2={25 + sc * 0.2} y2={182} stroke={C.focus} strokeWidth={2.5} opacity={d} />
      <T x={25 + sc * 0.2} y={lerp(110, 128, d)} s={11} f={C.focus} a="middle" o={d}>
        0.2 s
      </T>
      <Cross x={25 + sc * 0.2 + 18} y={158} k={easeOut(seg(t, 1.8, 2.1))} />
      <Cell x={25} y={205} w={190} h={26} label="TimeoutError, caught" o={easeOut(seg(t, 2.2, 2.6))} stroke={C.focus} />
    </Svg>
  );
}

// 10 · Async vs threads. Forty requests both ways: the two latency bars end close together; the memory bars do not, threads
// running past ten times the tasks.
export function RevealAsyncVsThreadsMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const m = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="same fan-out, both ways — latency close; memory held per unit of concurrency is not" h={250}>
      <Row y={40} label="40 requests, both ways" value="latency close" k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={85} label="memory held" value="threads: over 10×" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        latency
      </T>
      <rect x={110} y={115} width={200 * a} height={10} rx={2} fill={C.focus} opacity={0.7} />
      <rect x={110} y={129} width={190 * a} height={10} rx={2} fill={C.second} opacity={0.7} />
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        memory
      </T>
      <rect x={110} y={170} width={42 * m} height={10} rx={2} fill={C.focus} opacity={0.7} />
      <rect x={110} y={184} width={460 * m} height={10} rx={2} fill={C.cherryText} opacity={0.7} />
      <T x={25} y={224} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        tasks
      </T>
      <T x={90} y={224} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        threads
      </T>
    </Svg>
  );
}

// 11 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one loop, many waits, a real cap, a real stall, a real deadline, a real memory gap" h={240}>
      <Row y={40} label="one loop" value="interleaves the waits" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="group, semaphore" value="cancel, cap" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="a blocking call" value="stalls the whole loop" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="vs threads" value="same time, less memory" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 12 · Prove: a flaky, slow service. Calls go out; one fails; after the answer a group fences the failure and a gate caps the
// rate, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="fan out to a flaky service, without one failure taking the batch down — which mechanisms combine?" h={230}>
      <Row y={40} label="flaky, slow service" value="one tool enough?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="one tool" answer={answer} value="no, two together" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={115} w={265} h={28} label="TaskGroup: failures fenced" o={g} stroke={C.focus} />
      <Cell x={310} y={115} w={265} h={28} label="semaphore: rate capped" o={g} stroke={C.focus} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            a group plus a semaphore
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
