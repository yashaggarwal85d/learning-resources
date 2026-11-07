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

/** The unified pool as one bar at (x, y), width w: cached data grows from the left (pale-blue outline), a task's
 * execution memory from the right (white outline); `floor` draws storageFraction's protected minimum, dashed. */
function Pool({ x, y, w, cache, exec, floor = 0, k = 1, execFill = C.mocha }: { x: number; y: number; w: number; cache: number; exec: number; floor?: number; k?: number; execFill?: string }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={w} height={36} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      {cache > 0.002 && <rect x={x + 2} y={y + 4} width={(w - 4) * cache} height={28} fill={C.mocha} stroke={C.second} strokeWidth={1.6} />}
      {exec > 0.002 && <rect x={x + w - 2 - (w - 4) * exec} y={y + 4} width={(w - 4) * exec} height={28} fill={execFill} stroke={C.focus} strokeWidth={1.6} />}
      {floor > 0 && <line x1={x + w * 0.3} y1={y - 8} x2={x + w * 0.3} y2={lerp(y - 8, y + 44, floor)} stroke={C.second} strokeWidth={1.8} strokeDasharray="4 3" />}
    </g>
  );
}

// 0 · Hook. One pool draws in; cached data fills from the left; a new task's block drops in from above at the right.
// Both reach into the same bar.
export function Hook({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.6, 1.6));
  const d = easeInOut(seg(t, 1.9, 2.7));
  return (
    <Svg label="an executor holds cached data; a later task needs real working room. Same pool." h={210}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one executor's pool
      </T>
      <Pool x={25} y={80} w={540} cache={0.6 * c} exec={0} k={easeOut(seg(t, 0.1, 0.5))} />
      <T x={25} y={140} s={11} f={C.second} o={easeOut(seg(t, 1.0, 1.4))}>
        cached data
      </T>
      {d > 0 && <rect x={445} y={lerp(30, 84, d)} width={116} height={28} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.6} />}
      <T x={565} y={140} s={11} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.9))}>
        a new task's needs
      </T>
      <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        both reach into the same pot
      </T>
    </Svg>
  );
}

// 1 · The shape. The heap bar splits into reserved, the pool and the rest; the pool's slice opens out into its own
// full-width bar, and one line is drawn inside it, then nudged: storage on one side, execution on the other.
export function RevealPoolSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const z = easeInOut(seg(t, 1.9, 2.8));
  const ln = easeOut(seg(t, 2.8, 3.2));
  const lx = 295 + 40 * Math.sin(Math.PI * 2 * seg(t, 3.4, 4.4));
  return (
    <Svg label="measured: one pool, split by two settings, not two separate pots." h={220}>
      <T x={25} y={24} s={11} f={C.latte} o={a}>
        heap: 768 MB
      </T>
      <rect x={25} y={34} width={211} height={22} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={a} />
      <rect x={236} y={34} width={207} height={22} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.8, 1.2))} />
      <rect x={443} y={34} width={122} height={22} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={a} />
      {z < 0.3 && (
        <T x={25} y={76} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9)) * (1 - z / 0.3)}>
          reserved: 300 MB
        </T>
      )}
      {z < 0.3 && (
        <T x={250} y={76} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.4)) * (1 - z / 0.3)}>
          pool: ~294 MB
        </T>
      )}
      {z > 0 && <rect x={lerp(236, 25, z)} y={lerp(34, 110, z)} width={lerp(207, 540, z)} height={lerp(22, 36, z)} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} />}
      {ln > 0 && <line x1={lx} y1={104} x2={lx} y2={lerp(104, 152, ln)} stroke={C.focus} strokeWidth={2.4} />}
      <T x={25} y={180} s={11} f={C.second} o={easeOut(seg(t, 3.0, 3.4))}>
        storage
      </T>
      <T x={565} y={180} s={11} f={C.crema} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        execution
      </T>
      <T x={300} y={208} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        one shared space, one movable line
      </T>
    </Svg>
  );
}

// 2 · Predict. The floor is drawn at 30%; the cache grows well past it; a task's block presses in from the right.
export function PredictEvictionUnderPressure({ t, answer }: StepCtx) {
  const c = easeOut(seg(t, 0.4, 1.2));
  const p = easeOut(seg(t, 1.3, 1.9));
  return (
    <Svg label="a cache well past the floor, under real pressure. Does it hold its ground?" h={230}>
      <T x={25} y={28} s={11} f={C.second}>
        floor: 30% of the pool
      </T>
      <Pool x={25} y={60} w={540} cache={0.7 * c} exec={0.12 * p} floor={1} />
      <T x={25} y={122} s={11} f={C.second} o={c}>
        cached, well past the floor
      </T>
      <T x={565} y={122} s={11} f={C.focus} a="end" o={p}>
        a task
      </T>
      <T x={300} y={168} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.9, 2.3)) : 0}>
        does the cache hold?
      </T>
      <Verdict answer={answer} y={212} text="no: borrowed space goes first" />
    </Svg>
  );
}

// 3 · Measured. The task's region sweeps left and the cache shrinks to nothing, floor and all; the cache's two
// partition pips go out. Even then, a cherry overflow block leaves the bar's end and drops into disk.
export function RevealEvictedAndSpilled({ t }: StepCtx) {
  const e = easeInOut(seg(t, 0.4, 1.6));
  const sp = easeOut(seg(t, 2.0, 2.5));
  const dr = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="measured: no. Fully evicted, and the task still has to spill anyway." h={240}>
      <Pool x={25} y={40} w={440} cache={0.7 * (1 - e)} exec={lerp(0.12, 1, e)} floor={1} />
      {[0, 1].map((i) => (
        <rect key={i} x={40 + i * 22} y={98} width={14} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.6} opacity={1 - e} />
      ))}
      {sp > 0 && <rect x={lerp(465, 470, sp)} y={lerp(44, 136, dr)} width={60 * sp} height={28} fill={C.bad} stroke={C.cherryText} strokeWidth={1.4} />}
      <rect x={455} y={130} width={110} height={40} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={easeOut(seg(t, 2.2, 2.6))} />
      <T x={455} y={190} s={11} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
        spilled to disk
      </T>
      <Row y={225} label="cache after" value={e > 0.99 ? '0 bytes, 0 parts' : '...'} valueColor={e > 0.99 ? C.cherryText : C.crema} k={easeOut(seg(t, 1.2, 1.6))} />
    </Svg>
  );
}

// 4 · The floor holds. A smaller cache sits under the dashed floor; the same task region sweeps in and stops dead at
// the floor line. The cache's two pips stay lit and a tick lands.
export function ElaborateProtectedMinimum({ t }: StepCtx) {
  const e = easeInOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="the same pressure, a smaller cache under the floor: completely untouched." h={220}>
      <Pool x={25} y={40} w={540} cache={0.2} exec={lerp(0.12, 0.7, e)} floor={1} />
      {[0, 1].map((i) => (
        <rect key={i} x={40 + i * 22} y={98} width={14} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.6} />
      ))}
      <T x={110} y={110} s={11} f={C.second} o={easeOut(seg(t, 0.2, 0.5))}>
        under the floor
      </T>
      <T x={565} y={110} s={11} f={C.focus} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        same pressure
      </T>
      <Row y={170} label="cache after" value={e > 0.99 ? 'untouched' : '...'} valueColor={e > 0.99 ? C.second : C.crema} k={easeOut(seg(t, 2.0, 2.4))} />
      <MiniTick x={400} y={162} k={easeOut(seg(t, 2.6, 3.0))} f={C.second} />
      <T x={25} y={210} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        not one byte moved, start to finish
      </T>
    </Svg>
  );
}

// 5 · Predict. Left: a heap with an error flaring inside it. Right: a process inside a container whose wall closes in
// from outside. Same from inside?
export function PredictOomVsKill({ t, answer }: StepCtx) {
  const f = easeOut(seg(t, 0.6, 1.0));
  const w = easeInOut(seg(t, 0.9, 1.6));
  return (
    <Svg label="a heap error and a container kill. Do they look the same from the app's side?" h={230}>
      <rect x={25} y={30} width={240} height={90} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      <T x={40} y={52} s={11} f={C.latte}>
        heap
      </T>
      <path d="M145 62 l8 14 l12 -4 l-6 12 l12 8 l-14 2 l2 14 l-10 -10 l-10 10 l2 -14 l-14 -2 l12 -8 l-6 -12 l12 4 z" fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} opacity={f} />
      <T x={25} y={146} s={11} f={C.cherryText} o={f}>
        thrown from inside
      </T>
      <rect x={lerp(315, 340, w)} y={lerp(30, 40, w)} width={lerp(260, 210, w)} height={lerp(90, 70, w)} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="6 4" />
      <rect x={370} y={55} width={150} height={40} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      <T x={445} y={80} s={11} f={C.latte} a="middle">
        process
      </T>
      <T x={315} y={146} s={11} f={C.cherryText} o={w}>
        stopped from outside
      </T>
      <T x={300} y={186} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.8, 2.2)) : 0}>
        same from inside?
      </T>
      <Verdict answer={answer} y={214} text="no: one trace, one silence" />
    </Svg>
  );
}

const TRACE = ['java.lang.OutOfMemoryError:', 'Java heap space', '  at ...', '  at ...', '  at ...'];

// 6 · Measured. Left: the heap error's trace types in line by line. Right: the process box fades to a dashed ghost
// and its log stays empty.
export function RevealOneTraceOneNothing({ t }: StepCtx) {
  const g = easeOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="measured: no. One leaves a real exception; the other leaves nothing at all." h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        heap error
      </T>
      {TRACE.map((l, i) => (
        <T key={i} x={25} y={52 + i * 24} s={11} f={i < 2 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3))}>
          {l}
        </T>
      ))}
      <T x={330} y={24} s={11} f={C.latte}>
        container kill
      </T>
      <rect x={330} y={40} width={200} height={40} rx={4} fill={g > 0.5 ? 'none' : C.cocoa} stroke={C.latte} strokeWidth={1.4} strokeDasharray={g > 0.5 ? '5 4' : undefined} opacity={1 - 0.6 * g} />
      {g < 0.99 && (
        <T x={430} y={65} s={11} f={C.latte} a="middle" o={1 - g}>
          process
        </T>
      )}
      <rect x={330} y={96} width={200} height={70} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 2.6, 3.0))} />
      <T x={340} y={190} s={11} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.6))}>
        no exception, no trail
      </T>
      <T x={25} y={218} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        one catchable failure; one process, gone
      </T>
    </Svg>
  );
}

// 7 · Two watchers. The container's limit wraps both the heap and the overhead; the JVM's view brackets the heap
// alone. The overhead grows, turns cherry and crosses the container's wall, outside the JVM's view.
export function ElaborateWhyDifferentFixes({ t }: StepCtx) {
  const v = easeOut(seg(t, 1.2, 1.8));
  const g = easeInOut(seg(t, 2.4, 3.6));
  const ow = lerp(100, 195, g);
  const over = 370 + ow > 540;
  return (
    <Svg label="one watcher only sees its own heap; the other's walls are invisible to it." h={230}>
      <T x={25} y={26} s={11} f={C.second} o={easeOut(seg(t, 0.1, 0.4))}>
        container limit: memory + memoryOverhead
      </T>
      <rect x={25} y={40} width={515} height={110} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="6 4" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={40} y={70} w={310} h={50} label="heap" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={370} y={70} width={ow} height={50} rx={4} fill={over ? C.bad : C.cocoa} stroke={over ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={380} y={100} s={11} f={C.crema} o={easeOut(seg(t, 0.6, 0.9))}>
        overhead
      </T>
      <path d={`M40 ${170} v8 h${310 * v} v-8`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={v > 0 ? 1 : 0} />
      <T x={40} y={198} s={11} f={C.focus} o={v}>
        all the JVM can see
      </T>
      <T x={380} y={198} s={11} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        past the wall
      </T>
    </Svg>
  );
}

// 8 · Side by side. One cause, "out of room", splits into two arrows: a trace on the left, silence and a dashed
// ghost of a process on the right.
export function RevealSideBySide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="measured: both failures, same root cause, side by side." h={250}>
      <Cell x={210} y={20} w={180} label="out of room" stroke={C.cherryText} o={easeOut(seg(t, 0.1, 0.5))} />
      <line x1={260} y1={48} x2={lerp(260, 150, a)} y2={lerp(48, 88, a)} stroke={C.latte} strokeWidth={1.6} opacity={a > 0 ? 1 : 0} />
      <line x1={340} y1={48} x2={lerp(340, 450, a)} y2={lerp(48, 88, a)} stroke={C.latte} strokeWidth={1.6} opacity={a > 0 ? 1 : 0} />
      <T x={25} y={110} s={12} f={C.crema} o={easeOut(seg(t, 1.2, 1.6))}>
        heap error
      </T>
      {TRACE.slice(0, 3).map((l, i) => (
        <T key={i} x={25} y={140 + i * 24} s={11} f={i < 2 ? C.cherryText : C.latte} o={easeOut(seg(t, 1.6 + i * 0.3, 1.9 + i * 0.3))}>
          {l}
        </T>
      ))}
      <T x={350} y={110} s={12} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        container kill
      </T>
      <rect x={350} y={126} width={200} height={40} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} strokeDasharray="5 4" opacity={easeOut(seg(t, 3.0, 3.4)) * 0.6} />
      <T x={350} y={196} s={11} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        silence
      </T>
      <T x={25} y={236} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        an exact account, or nothing left to ask
      </T>
    </Svg>
  );
}

// 9 · Recap. The pool with its movable line and dashed floor; under it, two ways to run out of room, each its own fix.
export function Recap({ t }: StepCtx) {
  const lx = 295 + 50 * Math.sin(Math.PI * 2 * seg(t, 0.8, 2.0));
  return (
    <Svg label="one pool, one floor, two different kinds of running out of room." h={250}>
      <Pool x={25} y={40} w={540} cache={0} exec={0} floor={easeOut(seg(t, 1.6, 2.0))} k={easeOut(seg(t, 0.1, 0.5))} />
      <line x1={lx} y1={34} x2={lx} y2={82} stroke={C.focus} strokeWidth={2.4} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        one pool, a movable line, a floor
      </T>
      <Cell x={25} y={150} w={260} label="heap error: a trace" stroke={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={315} y={150} w={260} label="container kill: nothing" stroke={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))} />
      <T x={300} y={220} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        two kinds of evidence, two fixes
      </T>
    </Svg>
  );
}
