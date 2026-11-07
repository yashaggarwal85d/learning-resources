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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A small square token at (x, y). */
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

/** The machine doing the work: a labelled outline. */
function Machine({ x, y, w, h, o = 1, f = C.latte }: { x: number; y: number; w: number; h: number; o?: number; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={f} strokeWidth={1.6} />
      <T x={x + 12} y={y + 18} s={11} f={f}>
        the machine
      </T>
    </g>
  );
}

/** Remote storage: a labelled outline. */
function Remote({ x, y, w, h, o = 1 }: { x: number; y: number; w: number; h: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="6 4" />
      <T x={x + 12} y={y + 18} s={11} f={C.second}>
        remote storage
      </T>
    </g>
  );
}

// 0 · Hook. Inside the machine, the work and its one true copy sit side by side: "always here, so far". Then, on
// purpose, the copy slides out to remote storage, and a dashed cache is left behind in its place.
export function Hook({ t }: StepCtx) {
  const out = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="every backend so far kept its primary copy right next to the processing" h={200}>
      <Machine x={25} y={20} w={290} h={110} o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={40} y={60} w={110} label="the work" o={easeOut(seg(t, 0.2, 0.5))} />
      {out > 0.5 && <Hole x={165} y={60} w={130} stroke={C.latte} />}
      {out > 0.5 && (
        <T x={230} y={110} s={11} f={C.latte} a="middle">
          a cache, now
        </T>
      )}
      <Cell x={lerp(165, 405, out)} y={lerp(60, 74, out)} w={130} label="true copy" o={easeOut(seg(t, 0.4, 0.7))} stroke={C.focus} f={C.focus} />
      <Remote x={385} y={40} w={170} h={80} o={easeOut(seg(t, 1.6, 2.0))} />
      <T x={25} y={156} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1)) * (1 - out)}>
        so far: always right here, by choice
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        now the opposite, on purpose
      </T>
    </Svg>
  );
}

// 1 · Setup. Two earlier ways side by side, each inside its own machine: memory, then the machine's own disk, a little
// slower. Both boundaries light: the true copy never left.
export function Setup({ t }: StepCtx) {
  const lit = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="heap and rocksdb both keep their primary copy on local disk" h={200}>
      <Machine x={25} y={20} w={250} h={110} o={easeOut(seg(t, 0, 0.3))} f={lit > 0 ? C.focus : C.latte} />
      <Cell x={45} y={60} w={210} label="in memory" o={easeOut(seg(t, 0.2, 0.5))} />
      <Machine x={305} y={20} w={250} h={110} o={easeOut(seg(t, 1.0, 1.3))} f={lit > 0 ? C.focus : C.latte} />
      <Cell x={325} y={60} w={210} label="on its own disk" o={easeOut(seg(t, 1.2, 1.5))} />
      <T x={430} y={112} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        a bit slower
      </T>
      <T x={25} y={176} s={12} f={C.focus} o={lit}>
        either way, the true copy never left the machine
      </T>
    </Svg>
  );
}

// 2 · Predict. The true copy sits out in remote storage; a checkpoint is called for. On answer: almost nothing moves,
// just a thin slip of bookkeeping.
export function PredictCheckpointCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  return (
    <Svg label="the primary copy moves off the machine — what happens to a checkpoint?" h={200}>
      <Machine x={25} y={20} w={200} h={100} o={easeOut(seg(t, 0, 0.3))} />
      <Remote x={300} y={20} w={255} h={100} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={320} y={56} w={130} label="true copy" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={142} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        take a fresh picture: what moves?
      </T>
      {v > 0 && <rect x={lerp(130, 470, v)} y={92} width={14} height={14} rx={2} fill={C.second} />}
      <AnswerRow y={176} label="checkpoint cost" answer={answer} value="barely changes" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · ForSt. An LSM tree's levels build up, one bar per level, inside remote storage. The machine keeps only a dashed
// cache: a copy for speed, never the true one.
export function RevealForSt({ t }: StepCtx) {
  return (
    <Svg label="forst is an lsm-tree store whose files live on remote storage" h={200}>
      <Remote x={25} y={20} w={330} h={130} o={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2, 3].map((l) => (
        <rect key={l} x={45} y={46 + l * 24} width={(70 + l * 70) * easeOut(seg(t, 0.4 + l * 0.4, 0.8 + l * 0.4))} height={16} rx={3} fill={C.second} opacity={0.6} />
      ))}
      <T x={45} y={142} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        the store's own files, out here
      </T>
      <Machine x={380} y={20} w={175} h={130} o={easeOut(seg(t, 2.2, 2.5))} />
      <Hole x={395} y={60} w={145} stroke={C.latte} o={easeOut(seg(t, 2.6, 2.9))} />
      <T x={467} y={79} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        cache
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        what's local is for speed, never the true copy
      </T>
    </Svg>
  );
}

// 4 · Near-free checkpoints. Two state sizes, 50 and 50,000. With the true copy local, a checkpoint's bar grows with
// the state, the large one running long. With it remote, both checkpoints are the same thin sliver: 2, bookkeeping.
export function RevealCheckpointsNearFree({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.5));
  const b = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="the primary copy is already durable, so a checkpoint barely has to move" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        true copy local: the checkpoint copies it all
      </T>
      <T x={25} y={48} s={11} f={C.crema}>
        state 50
      </T>
      <rect x={140} y={38} width={12 * a} height={14} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={76} s={11} f={C.crema}>
        state 50,000
      </T>
      <rect x={140} y={66} width={410 * a} height={14} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={118} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        true copy remote: note what's already there
      </T>
      <T x={25} y={144} s={11} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        state 50
      </T>
      <rect x={140} y={134} width={6 * b} height={14} rx={3} fill={C.focus} opacity={0.8} />
      <T x={25} y={172} s={11} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        state 50,000
      </T>
      <rect x={140} y={162} width={6 * b} height={14} rx={3} fill={C.focus} opacity={0.8} />
      <T x={160} y={158} s={11} f={C.focus} o={easeOut(seg(t, 2.9, 3.2))}>
        cost 2 either way: flat
      </T>
    </Svg>
  );
}

// 5 · Speedups. Three rows, recovery, scale-out and scale-in, each with a long bar; one cause arrow sweeps down
// through them and all three bars shrink together.
export function RevealSpeedups({ t }: StepCtx) {
  const shrink = easeInOut(seg(t, 2.0, 3.0));
  const rows = ['coming back', 'growing', 'shrinking'];
  return (
    <Svg label="faster recovery, faster scale-in, faster scale-out, all from the same cause" h={200}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.6 + i * 0.5));
        return (
          <g key={r} opacity={k}>
            <T x={25} y={44 + i * 44} s={12} f={C.crema}>
              {r}
            </T>
            <rect x={150} y={33 + i * 44} width={lerp(380, 110, shrink)} height={14} rx={3} fill={shrink > 0.5 ? C.focus : C.latte} opacity={0.6} />
          </g>
        );
      })}
      <path d="M548 20 V150" stroke={C.focus} strokeWidth={1.6} strokeDasharray="200" strokeDashoffset={200 * (1 - easeInOut(seg(t, 1.6, 2.2)))} />
      <T x={25} y={186} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        all three from one change: the copy is already out
      </T>
    </Svg>
  );
}

// 6 · Predict. The worker asks across the distance and waits, the request travelling out and back; records pile up
// behind it. On answer the verdict: throughput collapses unless asking stops blocking.
export function PredictAsyncAccess({ t, answer }: StepCtx) {
  const trip = (t * 0.7) % 1;
  const q = Math.floor(easeInOut(seg(t, 0.4, 2.4)) * 9);
  return (
    <Svg label="state access can now cross the network — what has to change?" h={200}>
      <Cell x={150} y={40} w={110} label="worker" o={easeOut(seg(t, 0, 0.3))} />
      <Remote x={385} y={20} w={170} h={70} o={easeOut(seg(t, 0, 0.3))} />
      <Pip x={trip < 0.5 ? lerp(270, 375, trip * 2) : lerp(375, 270, (trip - 0.5) * 2)} y={54} f={C.focus} />
      {Array.from({ length: q }, (_, i) => (
        <Pip key={i} x={135 - i * 13} y={54} f={C.latte} />
      ))}
      <T x={25} y={110} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))}>
        waiting on every round trip
      </T>
      <AnswerRow y={170} label="if each touch waits" answer={answer} value="throughput collapses" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Async API. Twenty-four requests of 5 ticks each: asked one at a time, their trips line up end to end in one long
// row. Asked without waiting, 8 at once, the trips stack in parallel lanes and finish far sooner.
export function RevealAsyncStateApi({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 2.0));
  const b = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="a non-blocking state future lets other keys' round trips overlap" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        24 requests, 5 ticks each
      </T>
      <T x={25} y={52} s={11} f={C.cherryText}>
        waits each time
      </T>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={140 + i * 17} y={42} width={15} height={14} rx={2} fill={C.cherryText} opacity={0.55 * (a * 24 > i ? 1 : 0)} />
      ))}
      <T x={25} y={92} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        8 at once
      </T>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={140 + Math.floor(i / 8) * 17} y={80 + (i % 8) * 11} width={15} height={9} rx={2} fill={C.focus} opacity={0.55 * (b * 3 > Math.floor(i / 8) ? 1 : 0)} />
      ))}
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        one round trip overlaps another
      </T>
    </Svg>
  );
}

// 8 · Per-key order. Requests for key-a and key-b go out in turn; completions land in one stream below, a and b
// interleaving freely, while each key's own arrows run strictly left to right.
export function RevealPerKeyOrder({ t }: StepCtx) {
  const order: [string, number][] = [
    ['a', 0],
    ['b', 0],
    ['a', 1],
    ['b', 1],
    ['a', 2],
    ['b', 2],
    ['a', 3],
    ['b', 3],
    ['a', 4],
    ['b', 4],
  ];
  return (
    <Svg label="same key stays strictly ordered; different keys are free to interleave" h={200}>
      <T x={25} y={34} s={11} f={C.second} o={easeOut(seg(t, 0, 0.3))}>
        key-a
      </T>
      <T x={25} y={74} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        key-b
      </T>
      {[0, 1, 2, 3, 4].map((s) => (
        <g key={s}>
          <Pip x={110 + s * 40} y={30} f={C.second} o={easeOut(seg(t, 0.1 + s * 0.1, 0.3 + s * 0.1))} />
          <Pip x={110 + s * 40} y={70} f={C.focus} o={easeOut(seg(t, 0.15 + s * 0.1, 0.35 + s * 0.1))} />
        </g>
      ))}
      <T x={25} y={128} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        finished
      </T>
      {order.map(([k, s], i) => {
        const at = 1.2 + i * 0.25;
        const v = easeInOut(seg(t, at, at + 0.35));
        const fx = 110 + s * 40;
        const fy = k === 'a' ? 30 : 70;
        const tx = 110 + i * 44;
        return v > 0 ? <Pip key={i} x={lerp(fx, tx, v)} y={lerp(fy, 124, v)} f={k === 'a' ? C.second : C.focus} s={12} /> : null;
      })}
      <T x={25} y={164} s={11} f={C.crema} o={easeOut(seg(t, 3.8, 4.1))}>
        each key: in the order asked
      </T>
      <T x={25} y={190} s={11} f={C.crema} o={easeOut(seg(t, 4.1, 4.4))}>
        two different keys: free to interleave
      </T>
    </Svg>
  );
}

// 9 · Cache. Two latency bars: a cache that holds almost nothing, with most touches crossing to remote storage at 20,
// runs long; a warm cache, most touches local at 1, stays short, and the cold bar measures over 5 times as long.
export function RevealCacheTradeoff({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.6));
  const b = easeInOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="no cache costs real throughput; even a modest cache earns it back" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        a touch: 1 if local, 20 if remote
      </T>
      <T x={25} y={58} s={11} f={C.cherryText}>
        cache hit 0.10
      </T>
      <rect x={140} y={47} width={400 * a} height={16} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={98} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        cache hit 0.95
      </T>
      <rect x={140} y={87} width={40 * b} height={16} rx={3} fill={C.focus} opacity={0.7} />
      <T x={200} y={100} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        the cold one: over 5 times slower
      </T>
      <T x={25} y={150} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        a modest cache earns almost all of it back
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        and beats the older all-local way
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="local, 50 to 50,000" value="cost grows with it" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="remote, either size" value="flat at 2" valueColor={C.focus} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={110} label="key-a, key-b" value="each in order" k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={150} label="across the two keys" value="interleaved" k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={190} label="24 requests, 8 at once" value="finish far sooner" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={230} label="cold vs warm cache" value="over 5 times slower" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the cold-cache line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['the true copy moved off the machine', 'checkpoints became nearly free', 'async hides the distance; a cold cache is the price'];
  return (
    <Svg label="the primary copy moved; checkpoints paid that back; async hid the rest" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.cherryText : C.mocha} />;
      })}
    </Svg>
  );
}
