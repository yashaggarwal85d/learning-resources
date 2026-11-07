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

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

// 0 · Hook. Left: a dedicated cluster, its machines wired to each other, coordinating. Right: an ordinary app with the
// same ideas folded inside it as a library. The cluster's wiring fades: none of that is needed.
export function Hook({ t }: StepCtx) {
  const fade = easeOut(seg(t, 2.6, 3.2));
  const ms = [
    [60, 50],
    [150, 50],
    [60, 110],
    [150, 110],
  ];
  return (
    <Svg label="a library, not a cluster — what changes with no separate cluster at all?" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        its own cluster, coordinating
      </T>
      {ms.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={60} height={34} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (1 - 0.6 * fade)} />
      ))}
      <path d="M120 67 H150 M90 84 V110 M180 84 V110 M120 127 H150" stroke={C.latte} strokeWidth={1.3} opacity={easeOut(seg(t, 0.6, 1.0)) * (1 - fade)} />
      <rect x={330} y={40} width={225} height={110} rx={8} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 1.4, 1.8))} />
      <T x={342} y={60} s={11} f={C.focus} o={easeOut(seg(t, 1.4, 1.8))}>
        your app
      </T>
      <Cell x={350} y={84} w={185} label="the same ideas, a library" o={easeOut(seg(t, 1.9, 2.3))} />
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        no dedicated machinery at all
      </T>
    </Svg>
  );
}

// 1 · Setup. On top, the earlier route: a flow folded into a table, with a cluster box beneath it. Below, the same
// flow-to-table arrow again, this time inside a plain app box, nothing underneath.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="sql formalised streams as tables, run by a separate cluster" h={200}>
      <Cell x={25} y={20} w={110} label="a flow" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={140} x2={230} y={34} k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={240} y={20} w={110} label="a table" o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={25} y={56} w={325} h={24} label="run by its own cluster" o={easeOut(seg(t, 1.0, 1.3))} />
      <rect x={20} y={104} width={340} height={70} rx={8} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 2.0, 2.4))} />
      <Cell x={25} y={124} w={110} label="a flow" o={easeOut(seg(t, 2.4, 2.7))} />
      <Req x1={140} x2={230} y={138} k={easeOut(seg(t, 2.7, 3.2))} f={C.focus} />
      <Cell x={240} y={124} w={110} label="a table" o={easeOut(seg(t, 3.0, 3.3))} />
      <T x={380} y={143} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        a plain library
      </T>
      <T x={380} y={162} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        nothing underneath
      </T>
    </Svg>
  );
}

/** Five partition lanes at the left, each labelled by a small square. */
function Partitions({ o = 1 }: { o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={22} s={11} f={C.latte}>
        5 partitions
      </T>
      {[0, 1, 2, 3, 4].map((p) => (
        <g key={p}>
          <rect x={25} y={32 + p * 26} width={120} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
          <Pip x={36} y={41 + p * 26} f={C.second} />
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. Five partitions on the left; app copies on the right with nothing yet handing out work. On answer the
// verdict: the partition count decides it.
export function PredictParallelism({ t, answer }: StepCtx) {
  return (
    <Svg label="no cluster of its own — what decides its parallelism, then?" h={200}>
      <Partitions o={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={300} y={32 + i * 40} w={150} label="an app copy" o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))} />
      ))}
      <T x={465} y={92} s={20} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        ?
      </T>
      <AnswerRow y={182} label="what caps it" answer={answer} value="the partition count" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Tasks per partition. Each partition grows a task; the five tasks slide across, then settle into three app copies,
// two, two and one, and lock there: the assignment never reshuffles.
export function RevealTasksPerPartition({ t }: StepCtx) {
  const home = [0, 0, 1, 1, 2];
  const slot = [0, 1, 0, 1, 0];
  return (
    <Svg label="one task per partition, fixed forever — bounded by partition count" h={200}>
      <Partitions />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={300} y={28 + i * 52} width={255} height={44} rx={6} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      {[0, 1, 2, 3, 4].map((p) => {
        const g = easeOut(seg(t, 0.6 + p * 0.2, 0.9 + p * 0.2));
        const mh = easeInOut(seg(t, 1.8, 2.4));
        const mv = easeInOut(seg(t, 2.4, 2.9));
        const x = lerp(155, 310 + slot[p] * 115, mh);
        const y = lerp(32 + p * 26, 36 + home[p] * 52, mv);
        return <Cell key={p} x={x} y={y} w={105} h={20} label="task" o={g} stroke={C.focus} />;
      })}
      {[0, 1, 2].map((i) => (
        <Lock key={i} x={535} y={42 + i * 52} k={easeOut(seg(t, 3.0, 3.4))} f={C.focus} />
      ))}
      <T x={25} y={192} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        one task per partition, never reshuffled
      </T>
    </Svg>
  );
}

// 4 · Idle instances. Eight app copies for five partitions: five take a task, three sit dashed and idle. A bolt takes
// down a busy one; an idle copy lights and its task jumps straight over to it.
export function RevealIdleInstances({ t }: StepCtx) {
  const bolt = easeOut(seg(t, 2.4, 2.7));
  const move = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="more instances than partitions just wait, ready to take over" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        8 app copies, 5 partitions
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const busy = i < 5;
        const x = 25 + (i % 4) * 135;
        const y = 36 + Math.floor(i / 4) * 64;
        const k = easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1));
        const dead = i === 1 && bolt > 0;
        const takes = i === 5 && move >= 1;
        return busy || takes ? (
          <g key={i}>
            <rect x={x} y={y} width={120} height={44} rx={6} fill="none" stroke={dead ? C.cherryText : takes ? C.focus : C.latte} strokeWidth={1.5} opacity={k * (dead ? 0.5 : 1)} />
            {!dead && <rect x={x + 12} y={y + 14} width={96} height={16} rx={3} fill={C.focus} opacity={0.5 * k} />}
          </g>
        ) : (
          <Hole key={i} x={x} y={y} w={120} h={44} o={k} />
        );
      })}
      <Bolt x={220} y={58} k={bolt * (1 - move)} />
      {move > 0 && move < 1 && <rect x={172} y={lerp(50, 114, move)} width={96} height={16} rx={3} fill={C.focus} opacity={0.5} />}
      <T x={25} y={186} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        3 copies wait, doing nothing, ready
      </T>
    </Svg>
  );
}

// 5 · Changelog. A local store sits inside its task. Every write lands in it and, at the same moment, a copy travels
// out to a compacted changelog topic. Then the store empties and is rebuilt by replaying that changelog back in.
export function RevealChangelogBacked({ t }: StepCtx) {
  const writes = Math.floor(easeInOut(seg(t, 0.4, 2.0)) * 4);
  const wipe = easeOut(seg(t, 2.4, 2.7));
  const rebuild = Math.floor(easeInOut(seg(t, 2.9, 4.0)) * 4);
  const inStore = wipe > 0 ? rebuild : writes;
  return (
    <Svg label="a compacted topic durably backs every local store, same mechanism" h={200}>
      <rect x={25} y={30} width={200} height={100} rx={8} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={37} y={50} s={11} f={C.latte}>
        a task, and its local store
      </T>
      {Array.from({ length: inStore }, (_, i) => (
        <rect key={i} x={45 + i * 42} y={74} width={34} height={22} rx={3} fill={C.second} opacity={0.7} />
      ))}
      <rect x={330} y={30} width={225} height={100} rx={8} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={342} y={50} s={11} f={C.focus}>
        changelog topic, durable
      </T>
      {Array.from({ length: writes }, (_, i) => (
        <rect key={i} x={350 + i * 46} y={74} width={34} height={22} rx={3} fill={C.focus} opacity={0.6} />
      ))}
      <Req x1={230} x2={320} y={85} k={easeOut(seg(t, 0.4, 0.8)) * (1 - wipe)} />
      {wipe > 0 && (
        <g>
          <line x1={322} y1={112} x2={lerp(322, 232, easeInOut(seg(t, 2.9, 3.3)))} y2={112} stroke={C.focus} strokeWidth={1.8} />
          <path d={`M${lerp(322, 232, easeInOut(seg(t, 2.9, 3.3)))} 112 l8 -5 v10 z`} fill={C.focus} />
        </g>
      )}
      <T x={25} y={160} s={11} f={C.cherryText} o={wipe * (1 - easeOut(seg(t, 2.9, 3.2)))}>
        store lost
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        replayed back: the exact same store
      </T>
    </Svg>
  );
}

// 6 · Predict. A task on one machine and a warm standby copy on another, already caught up. A bolt strikes the
// original. On answer the verdict: almost all of the recovery is saved.
export function PredictStandbyValue({ t, answer }: StepCtx) {
  return (
    <Svg label="what does a standby replica actually buy on failover?" h={200}>
      <Cell x={25} y={40} w={200} label="the task" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={330} y={40} w={225} label="a warm standby, caught up" o={easeOut(seg(t, 0.3, 0.6))} stroke={C.second} />
      <Bolt x={240} y={54} k={easeOut(seg(t, 0.9, 1.2))} />
      <AnswerRow y={170} label="the standby saves" answer={answer} value="nearly all recovery" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Standby recovery. Without a standby, the whole 100,000 of state replays at 500 a tick: a long bar crawls across.
// With one, only the gap of 200 replays: a sliver, done at once, over 100 times sooner.
export function RevealStandbyRecovery({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 3.0));
  const b = easeOut(seg(t, 1.0, 1.2));
  return (
    <Svg label="a warm standby means no full replay from scratch" h={200}>
      <T x={25} y={30} s={11} f={C.cherryText}>
        no standby: replay all 100,000, at 500 a tick
      </T>
      <rect x={25} y={40} width={520 * a} height={16} rx={3} fill={C.cherryText} opacity={0.55} />
      <T x={25} y={96} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        a warm standby: replay only the gap of 200
      </T>
      <rect x={25} y={106} width={4 * b} height={16} rx={2} fill={C.focus} />
      <MiniTick x={40} y={114} k={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        coming back: over 100 times sooner
      </T>
    </Svg>
  );
}

// 8 · Duality. Six clicks arrive: user-a, user-b, user-a, user-c, user-a, user-b. Each one updates a count table in
// place: a 3, b 2, c 1. The table's rows then read back out as a flow, and the table rebuilt from it matches.
export function RevealDuality({ t }: StepCtx) {
  const clicks = ['user-a', 'user-b', 'user-a', 'user-c', 'user-a', 'user-b'];
  const n = Math.floor(easeInOut(seg(t, 0.2, 2.0)) * 6);
  const count = (u: string) => clicks.slice(0, n).filter((c) => c === u).length;
  const back = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a stream becomes a table; a table reads back out as a stream" h={200}>
      <T x={25} y={20} s={11} f={C.latte}>
        a flow of clicks
      </T>
      {clicks.map((c, i) => (
        <Cell key={i} x={25 + i * 88} y={28} w={80} h={24} label={c} o={i < n ? 0.4 : 1} />
      ))}
      <T x={25} y={82} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        folded into a table
      </T>
      {['user-a', 'user-b', 'user-c'].map((u, i) => (
        <Cell key={u} x={25 + i * 120} y={90} w={110} h={24} label={count(u) > 0 ? `${u}: ${count(u)}` : u} o={count(u) > 0 ? 1 : 0.3} stroke={C.focus} />
      ))}
      <T x={25} y={142} s={11} f={C.second} o={back}>
        read back out as a flow
      </T>
      {[
        ['user-a', 3],
        ['user-b', 2],
        ['user-c', 1],
      ].map(([u, c], i) => (
        <Cell key={i} x={25 + i * 120} y={150} w={110} h={24} label={`${u}, ${c}`} o={easeOut(seg(t, 2.8 + i * 0.2, 3.1 + i * 0.2))} stroke={C.second} />
      ))}
      <T x={400} y={167} s={11} f={C.focus} o={easeOut(seg(t, 3.7, 4.0))}>
        rebuilt: identical
      </T>
      <MiniTick x={518} y={160} k={easeOut(seg(t, 4.0, 4.3))} />
    </Svg>
  );
}

// 9 · Exactly-once and the rebalance protocol. The first version of exactly-once draws a long overhead bar; the second
// version's bar is shorter. Then the newer rebalance protocol: a tick for "the default on new setups", and two dashed
// slots for pieces stated as not built yet.
export function RevealExactlyOnceRebalance({ t }: StepCtx) {
  return (
    <Svg label="v two is more efficient; the newer rebalance protocol still has real gaps" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        exactly-once, overhead
      </T>
      <T x={25} y={46} s={11} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        first version
      </T>
      <rect x={140} y={36} width={360 * easeInOut(seg(t, 0.3, 1.0))} height={14} rx={3} fill={C.latte} opacity={0.6} />
      <T x={25} y={72} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        second version
      </T>
      <rect x={140} y={62} width={150 * easeInOut(seg(t, 1.1, 1.6))} height={14} rx={3} fill={C.focus} opacity={0.6} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        the newer rebalance protocol
      </T>
      <Cell x={25} y={120} w={240} h={26} label="default on new setups" o={easeOut(seg(t, 2.4, 2.7))} stroke={C.focus} />
      <MiniTick x={276} y={133} k={easeOut(seg(t, 2.7, 3.0))} />
      <Hole x={310} y={120} w={120} h={26} stroke={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))} />
      <Hole x={440} y={120} w={115} h={26} stroke={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))} />
      <T x={310} y={168} s={11} f={C.cherryText} o={easeOut(seg(t, 3.7, 4.0))}>
        pieces stated as not built yet
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="5 partitions, 3 copies" value="5 tasks, none idle" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="5 partitions, 8 copies" value="3 sit idle" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={110} label="clicks to a table" value="a 3, b 2, c 1" k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={150} label="table back to a flow" value="rebuilt, identical" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={190} label="no standby, 100,000" value="full replay" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={230} label="standby gap 200" value="over 100 times sooner" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the duality line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a plain library, no cluster underneath', 'one task per partition, never reshuffled', 'a flow and a table: one thing, read both ways'];
  return (
    <Svg label="no cluster, a task per partition, state on a changelog, duality at the center" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
