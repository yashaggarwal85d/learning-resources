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

/** A small lock, centred at (x, y). */
function Lock({ x, y, o = 1, f = C.focus }: { x: number; y: number; o?: number; f?: string }) {
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <path d="M-5 0 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke={f} strokeWidth={2} />
      <rect x={-7} y={0} width={14} height={10} rx={2} fill={f} />
    </g>
  );
}

/** Four thread lanes; `run(i)` gives how far each lane's work bar has grown (0 to 1), `hot(i)` marks the lane running now. */
function Lanes({
  y,
  run,
  hot = () => false,
  f = C.focus,
  o = 1,
  x = 110,
  w = 440,
  labels = true,
}: {
  y: number;
  run: (i: number) => number;
  hot?: (i: number) => boolean;
  f?: string;
  o?: number;
  x?: number;
  w?: number;
  labels?: boolean;
}) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {labels && (
            <T x={25} y={y + 10 + i * 20} s={11} f={C.latte}>
              {`thread ${i + 1}`}
            </T>
          )}
          <rect x={x} y={y + i * 20} width={w} height={12} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
          <rect x={x} y={y + i * 20} width={w * run(i)} height={12} rx={2} fill={f} opacity={hot(i) ? 0.85 : 0.5} />
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. Four cores. Elsewhere, four threads light all four at once; in plain Python, only one core lights at a time, the light
// hopping from core to core.
export function Hook({ t }: StepCtx) {
  const all = easeOut(seg(t, 0.8, 1.2));
  const hop = Math.floor((t * 2.5) % 4);
  const py = t > 2.2;
  return (
    <Svg label="four threads, four cores, in most languages — often just one core in plain Python" h={250}>
      <Row y={40} label="four threads" value="four cores, elsewhere" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="in plain Python" value="often just one" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.7))} />
      {['elsewhere', 'plain Python'].map((l, r) => (
        <g key={l} opacity={r === 0 ? easeOut(seg(t, 0.4, 0.8)) : easeOut(seg(t, 2.0, 2.4))}>
          <T x={25} y={146 + r * 55} s={12} f={C.latte}>
            {l}
          </T>
          {[0, 1, 2, 3].map((c) => {
            const on = r === 0 ? all > 0 : py && c === hop;
            return (
              <rect
                key={c}
                x={200 + c * 95}
                y={125 + r * 55}
                width={80}
                height={34}
                rx={4}
                fill={on ? (r === 0 ? C.focus : C.cherryText) : C.cocoa}
                fillOpacity={on ? 0.45 : 1}
                stroke={on ? (r === 0 ? C.focus : C.cherryText) : C.mocha}
                strokeWidth={1.5}
              />
            );
          })}
        </g>
      ))}
    </Svg>
  );
}

// 2 · The GIL. Four threads; a lock passes from one to the next; only the holder's bar grows while the others wait.
export function RevealGilQuote({ t }: StepCtx) {
  const p = clamp(seg(t, 0.8, 4.0));
  const cur = Math.min(3, Math.floor(p * 4));
  const run = (i: number) => (clamp(p * 4 - i) > 0 ? 0.25 * clamp(p * 4 - i) : 0);
  return (
    <Svg label="only one thread executes python bytecode at a time, by design" h={250}>
      <Row y={40} label="the GIL" value="one thread at a time" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="by design" value="keeps objects safe" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Lanes y={130} run={(i) => run(i)} hot={(i) => i === cur && p > 0 && p < 1} x={110} w={400} o={easeOut(seg(t, 0.4, 0.7))} />
      <Lock x={530} y={lerp(134, 194, cur / 3)} o={easeOut(seg(t, 0.6, 0.9))} />
    </Svg>
  );
}

// 3 · Predict: does the GIL block C too? One thread steps out of bytecode into a C function; then the question.
export function PredictGilRelease({ t, answer }: StepCtx) {
  const p = easeInOut(seg(t, 0.5, 1.2));
  return (
    <Svg label="a thread calling into C instead of python bytecode — still serialized the same way?" h={210}>
      <Row y={40} label="a thread calls C" value="still serialized?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={170} h={26} label="python bytecode" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={195} y1={73} x2={lerp(195, 385, p)} y2={73} stroke={C.second} strokeWidth={1.5} />
      <Cell x={385} y={60} w={190} h={26} label="a C hash function" o={easeOut(seg(t, 0.9, 1.2))} stroke={C.second} />
      <AnswerRow y={140} label="GIL blocks C too" answer={answer} value="no, C can release it" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="native code can step around the lock" />
    </Svg>
  );
}

// 4 · Measured. The same total hashing work on four threads: in C all four bars grow together; as a Python loop they grow one
// at a time. The asserted bounds land beside each.
export function RevealGilReleaseMeasured({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.8, 1.8));
  const pp = clamp(seg(t, 2.0, 4.0));
  return (
    <Svg label="the same total work, threaded — a C hash function parallelizes, a python loop does not" h={250}>
      <Row y={40} label="C hash, 4 threads" value="over 2× faster" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={85} label="Python loop, 4 threads" value="under 1.3×" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
      <Lanes y={114} run={() => c} hot={() => c > 0 && c < 1} x={110} w={200} o={easeOut(seg(t, 0.4, 0.7))} />
      <Lanes y={114} run={(i) => clamp(pp * 4 - i)} hot={(i) => clamp(pp * 4 - i) > 0 && clamp(pp * 4 - i) < 1} x={350} w={200} labels={false} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))} />
      <T x={210} y={210} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        C: all four at once
      </T>
      <T x={450} y={210} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        Python: one at a time
      </T>
    </Svg>
  );
}

// 5 · Fork vs spawn. The parent's memory; the fork child appears quickly as a full copy, globals and all; the spawn child
// appears later and empty, and a probe for the parent's globals comes back crossed.
export function RevealForkVsSpawnMeasured({ t }: StepCtx) {
  const f = easeOut(seg(t, 0.9, 1.4));
  const s = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="fork inherits the parent's memory; spawn starts fresh and never sees it at all" h={250}>
      <Row y={40} label="fork" value="inherits the parent" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={85} label="spawn" value="starts empty, and later" valueColor={C.second} k={easeOut(seg(t, 2.0, 2.5))} />
      <rect x={25} y={130} width={150} height={80} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={40} y={143 + i * 20} width={120} height={12} rx={2} fill={C.latte} opacity={0.6 * easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <T x={100} y={228} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        parent
      </T>
      <g opacity={f}>
        <rect x={225} y={130} width={150} height={80} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={240} y={143 + i * 20} width={120 * f} height={12} rx={2} fill={C.focus} opacity={0.5} />
        ))}
        <T x={300} y={228} s={11} f={C.focus} a="middle">
          fork child
        </T>
      </g>
      <g opacity={s}>
        <rect x={425} y={130} width={150} height={80} rx={5} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={500} y={228} s={11} f={C.second} a="middle">
          spawn child
        </T>
      </g>
      <Cross x={500} y={170} k={easeOut(seg(t, 2.8, 3.1))} />
    </Svg>
  );
}

// 6 · Pickling. A small structure is flattened into a byte stream, carried across the process boundary and rebuilt on the
// other side; a timer bar grows on each leg.
export function RevealPicklingMeasured({ t }: StepCtx) {
  const d = easeInOut(seg(t, 0.8, 1.8));
  const l = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="anything a fresh child needs must be serialized first — a real, measured cost of its own" h={250}>
      <Row y={40} label="crossing to a child" value="serialized first" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="both directions" value="real, measured time" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={130} w={120} h={40} label="a structure" o={easeOut(seg(t, 0.4, 0.7))} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={lerp(85, 160 + i * 18, d)} y={146} width={14} height={8} rx={1} fill={C.second} opacity={d > 0 ? 0.8 : 0} />
      ))}
      <line x1={300} y1={118} x2={300} y2={190} stroke={C.latte} strokeWidth={2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={300} y={208} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        process boundary
      </T>
      <Cell x={455} y={130} w={120} h={40} label="rebuilt" o={l} stroke={C.second} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={lerp(310 + i * 16, 470, l)} y={146} width={12} height={8} rx={1} fill={C.second} opacity={l > 0 && l < 1 ? 0.8 : 0} />
      ))}
      <rect x={25} y={225} width={200 * d} height={6} rx={2} fill={C.cherryText} opacity={0.7} />
      <rect x={375} y={225} width={200 * l} height={6} rx={2} fill={C.cherryText} opacity={0.7} />
    </Svg>
  );
}

// 7 · Predict: free parallelism? One thread's speed bar; the lock dissolves away; then the question.
export function PredictFreeThreadingCost({ t, answer }: StepCtx) {
  const g = easeOut(seg(t, 0.8, 1.3));
  return (
    <Svg label="remove the gil entirely — same single-thread speed, plus parallelism for free?" h={210}>
      <Row y={40} label="no GIL at all" value="same speed, plus more?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={380 * easeOut(seg(t, 0.2, 0.8))} height={14} rx={3} fill={C.crema} opacity={0.6} />
      <Lock x={450} y={66} o={1 - g} />
      <Cross x={450} y={70} k={g} />
      <AnswerRow y={140} label="same 1-thread speed" answer={answer} value="no, measurably slower" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="removing the lock has its own cost" f={C.cherryText} />
    </Svg>
  );
}

// 8 · The disclosed cost. Three costs stack in, one per beat: slower single-threaded code, more memory, and C extensions that
// need their own separate build.
export function RevealFreeThreadingCostQuote({ t }: StepCtx) {
  const COSTS = ['single-thread slowdown', 'extra memory', 'C extensions rebuilt'];
  return (
    <Svg label="a real single-thread penalty and real added memory — disclosed directly, not hidden" h={250}>
      <Row y={40} label="free-threading" value="costs, disclosed" k={easeOut(seg(t, 0.3, 0.8))} />
      {COSTS.map((c, i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.9, 1.4 + i * 0.9));
        return (
          <g key={c} opacity={k} transform={`translate(${((1 - k) * 24).toFixed(1)} 0)`}>
            <rect x={25} y={80 + i * 50} width={550} height={36} rx={5} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.5} />
            <T x={45} y={103 + i * 50} s={14} f={C.crema}>
              {c}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Subinterpreters, measured. Four interpreters, each holding its own lock, each lighting its own core at the same time; the
// asserted speedup lands.
export function RevealSubinterpreterMeasured({ t }: StepCtx) {
  const r = easeInOut(seg(t, 1.4, 2.8));
  return (
    <Svg label="a lower-level mechanism, run for real on this sandbox, genuinely scales across cores" h={250}>
      <Row y={40} label="4 interpreters" value="each with its own lock" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="measured speedup" value="over 2.5×" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.3))} />
      {[0, 1, 2, 3].map((i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.15, 0.8 + i * 0.15));
        return (
          <g key={i} opacity={k}>
            <rect x={25 + i * 140} y={125} width={130} height={80} rx={5} fill={C.cocoa} stroke={r > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
            <Lock x={45 + i * 140} y={140} />
            <T x={90 + i * 140} y={150} s={11} f={C.crema} a="middle">
              {`interp ${i + 1}`}
            </T>
            <rect x={35 + i * 140} y={180} width={110 * r} height={12} rx={2} fill={C.focus} opacity={0.6} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · The trade. Walls between the interpreters: a share attempt between two of them stops at the wall; none of them runs
// until a thread is handed to it.
export function RevealSubinterpreterTradeoffQuote({ t }: StepCtx) {
  const sh = easeInOut(seg(t, 0.9, 1.6));
  const th = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="isolated by default, no automatic threads, no shared gil — parallelism built on top" h={250}>
      <Row y={40} label="shared automatically" value="nothing" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={85} label="threads" value="never started for you" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3, 0.6))}>
          <rect x={25 + i * 190} y={130} width={170} height={60} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={110 + i * 190} y={165} s={12} f={C.crema} a="middle">
            {`interpreter ${i + 1}`}
          </T>
          {i > 0 && <rect x={i * 190 + 3} y={124} width={4} height={72} fill={C.latte} />}
        </g>
      ))}
      <circle cx={lerp(150, 190, sh)} cy={145} r={5} fill={C.cherryText} opacity={sh > 0 ? 1 - 0.5 * easeOut(seg(t, 1.6, 2.0)) : 0} />
      <Cross x={200} y={145} k={easeOut(seg(t, 1.6, 1.9))} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${110 + i * 190} 225 v-22`} stroke={C.focus} strokeWidth={2} opacity={th} />
      ))}
      <T x={300} y={240} s={11} f={C.focus} a="middle" o={th}>
        a thread, handed to each, on purpose
      </T>
    </Svg>
  );
}

// 11 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the gil, multiprocessing, free-threading, subinterpreters — each trade named plainly" h={240}>
      <Row y={40} label="the GIL" value="native code steps around" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="processes" value="no shared memory" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="no GIL" value="costs speed, memory" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="subinterpreters" value="separate, real cores" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 12 · Prove: interpreters alone? Four idle interpreters; after the answer threads attach and their bars start, and the verdict
// lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const r = answer !== null ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="four independent transforms, today, on a non-free-threaded python — subinterpreters alone enough?" h={230}>
      <Row y={40} label="4 interpreters, no threads" value="parallel already?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="parallel" answer={answer} value="no, add threads" k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))}>
          <rect x={25 + i * 140} y={115} width={130} height={36} rx={4} fill={C.cocoa} stroke={r > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          <rect x={35 + i * 140} y={137} width={110 * r} height={8} rx={2} fill={C.focus} opacity={0.6} />
        </g>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            threads still have to run them
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={168} k={tick} />
        </>
      )}
    </Svg>
  );
}
