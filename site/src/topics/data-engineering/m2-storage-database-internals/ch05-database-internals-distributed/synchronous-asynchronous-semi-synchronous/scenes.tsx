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
/** One transaction's timeline: its name on the left and a thin line running right; events sit on it as cells. */
function Lane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={60} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
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

/** Client, primary and replica in one row at `y`, the chapter's replica lane; `rf` colours the replica's edge. */
function Trio({ y, o = 1, pf = C.focus, rf = C.mocha }: { y: number; o?: number; pf?: string; rf?: string }) {
  return (
    <g opacity={o}>
      <Cell x={25} y={y} w={130} label="client" />
      <Cell x={225} y={y} w={150} label="primary" stroke={pf} />
      <Cell x={445} y={y} w={130} label="replica" stroke={rf} />
    </g>
  );
}

/** A dot travelling along the lane from x `a` to x `b` as `p` runs 0 to 1. */
function Dot({ a, b, y, p, f = C.focus }: { a: number; b: number; y: number; p: number; f?: string }) {
  return <circle cx={lerp(a, b, p)} cy={y} r={5} fill={f} opacity={p > 0 && p < 1 ? 1 : 0} />;
}

// 1 · Hook. The primary acknowledges the commit to the client; the replica beside it is left with a question.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the primary says committed. Is anyone else told yet?" h={230}>
      <Trio y={60} o={easeOut(seg(t, 0.2, 0.5))} />
      <Dot a={220} b={160} y={74} p={clamp(seg(t, 0.6, 1.2))} />
      <T x={90} y={110} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        committed
      </T>
      <T x={510} y={110} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 1.9, 2.2))}>
        has it yet?
      </T>
      <Row y={195} label="it matters" value="once something fails" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 2 · Asynchronous. The ack races back to the client at once; the change drifts to the replica later, on a dashed line.
export function RevealAsynchronous({ t }: StepCtx) {
  const ship = easeInOut(seg(t, 2.2, 3.4));
  return (
    <Svg label="commit, tell the client, ship it later." h={230}>
      <Trio y={60} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={300} y={110} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        commits
      </T>
      <Dot a={220} b={160} y={74} p={clamp(seg(t, 0.8, 1.3))} />
      <MiniTick x={135} y={110} k={easeOut(seg(t, 1.3, 1.6))} />
      <line x1={380} y1={74} x2={380 + 60 * ship} y2={74} stroke={C.second} strokeWidth={2} strokeDasharray="4 3" />
      <T x={510} y={110} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        whenever
      </T>
      <Row y={185} label="the client waits for" value="nobody" valueColor={C.focus} k={easeOut(seg(t, 1.7, 2.2))} />
    </Svg>
  );
}

// 3 · Predict. Before the client hears back, a dot goes primary to replica and back; the answer: that round trip, every commit.
export function PredictSynchronousCost({ t, answer }: StepCtx) {
  const p = clamp(seg(t, 0.5, 2.0));
  return (
    <Svg label="remove the lost-commit risk. What do you pay?" h={200}>
      <Trio y={50} o={easeOut(seg(t, 0.1, 0.4))} />
      <Dot a={380} b={440} y={64} p={p < 0.5 ? p * 2 : 1} />
      <Dot a={440} b={380} y={64} p={p >= 0.5 ? (p - 0.5) * 2 : 0} f={C.second} />
      <path d="M380 92 Q410 110 440 92" fill="none" stroke={C.second} strokeWidth={1.5} opacity={answer !== null ? 1 : 0} />
      <AnswerRow y={140} label="the cost" answer={answer} value="a round trip, every commit" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="every commit waits on the replica" />
    </Svg>
  );
}

// 4 · Synchronous, measured. 200 commits each way: the waiting run's bar overshoots a 1.2× line.
export function RevealSynchronousMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.8));
  const b = easeOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="commit, then wait. Measured locally, against this cluster." h={240}>
      <Row y={40} label="200 commits, twice" value="the same work" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={80} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        synchronous_commit = off
      </T>
      <rect x={25} y={88} width={280 * a} height={18} rx={3} fill={C.latte} />
      <T x={25} y={136} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        synchronous_commit = on
      </T>
      <rect x={25} y={144} width={360 * b} height={18} rx={3} fill={C.second} />
      <line x1={361} y1={136} x2={361} y2={170} stroke={C.focus} strokeWidth={1.5} strokeDasharray="3 3" opacity={seg(b, 0.6, 1)} />
      <T x={395} y={158} s={12} f={C.second} o={seg(b, 0.8, 1)}>
        over 1.2× the time
      </T>
      <Row y={215} label="waiting costs" value="every single run" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 5 · What synchronous risks. T1 holds its lock through the whole replica wait; T2 and T3 queue behind it on dashed lines.
export function RevealWhatSynchronousRisks({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.6, 3.6));
  return (
    <Svg label="the wait holds locks too." h={240}>
      <Lane y={50} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={110} name="T2" o={easeOut(seg(t, 1.8, 2.1))} />
      <Lane y={160} name="T3" o={easeOut(seg(t, 2.2, 2.5))} />
      <Ev x={70} y={50} w={80} label="write" o={easeOut(seg(t, 0.3, 0.6))} />
      <Lock x={156} y={22} k={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={155} y={44} width={410 * h} height={12} rx={3} fill={C.second} opacity={h > 0 ? 0.85 : 0} />
      <T x={155} y={82} s={11} f={C.second} o={easeOut(seg(t, 0.9, 1.2))}>
        waiting on the replica, lock held
      </T>
      <line x1={70} y1={110} x2={70 + 495 * easeInOut(seg(t, 2.0, 3.6))} y2={110} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <line x1={70} y1={160} x2={70 + 495 * easeInOut(seg(t, 2.4, 3.6))} y2={160} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <Row y={215} label="one slow replica" value="backs up everyone" valueColor={C.cherryText} k={easeOut(seg(t, 3.8, 4.3))} />
    </Svg>
  );
}

// 6 · Semi-synchronous. One replica's ack is enough; then that replica goes quiet, the timer runs out, and the mode falls back.
export function RevealSemiSynchronous({ t }: StepCtx) {
  const send = clamp(seg(t, 0.4, 1.0));
  const ack = clamp(seg(t, 1.0, 1.6));
  const tm = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="wait for just one reply, with a timeout." h={240}>
      <Cell x={25} y={80} w={150} label="primary" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={400} y={44} w={175} label="replica A" stroke={ack >= 1 ? C.focus : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={400} y={116} w={175} label="replica B" o={easeOut(seg(t, 0.3, 0.6))} />
      <g stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={175} y1={94} x2={400} y2={58} />
        <line x1={175} y1={94} x2={400} y2={130} />
      </g>
      <circle cx={lerp(180, 395, send)} cy={lerp(94, 58, send)} r={5} fill={C.focus} opacity={send > 0 && send < 1 ? 1 : 0} />
      <circle cx={lerp(180, 395, send)} cy={lerp(94, 130, send)} r={5} fill={C.focus} opacity={send > 0 && send < 1 ? 1 : 0} />
      <circle cx={lerp(395, 180, ack)} cy={lerp(58, 94, ack)} r={5} fill={C.second} opacity={ack > 0 && ack < 1 ? 1 : 0} />
      <T x={100} y={130} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        one ack: enough
      </T>
      <T x={25} y={180} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        timeout
      </T>
      <rect x={95} y={170} width={300 * (1 - tm)} height={12} rx={3} fill={C.cherryText} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <T x={25} y={222} s={12} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.6))}>
        too quiet: falls back to async
      </T>
    </Svg>
  );
}

// 7 · Failover. The old primary is crossed; pg_ctl promote points at the replica, which becomes the new primary; the old one returns to no role.
export function RevealFailoverPromotion({ t }: StepCtx) {
  const gone = easeOut(seg(t, 0.4, 0.7));
  const back = easeOut(seg(t, 2.6, 2.9));
  const pr = easeOut(seg(t, 1.6, 1.9));
  return (
    <Svg label="the primary is gone. One command promotes." h={230}>
      <Cell x={25} y={66} w={170} label="old primary" o={easeOut(seg(t, 0.1, 0.3)) * (1 - 0.5 * gone + 0.4 * back)} />
      <Cross x={110} y={80} k={gone * (1 - back)} />
      <Cell x={405} y={66} w={170} label="replica" stroke={pr > 0.5 ? C.focus : C.mocha} o={easeOut(seg(t, 0.1, 0.3))} />
      <T x={490} y={52} s={12} f={C.focus} a="middle" o={pr}>
        the new primary
      </T>
      <Cell x={215} y={120} w={170} label="pg_ctl promote" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <path d={`M385 134 Q470 134 ${lerp(385, 480, easeOut(seg(t, 1.3, 1.6)))} 96`} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 1.3, 1.4))} />
      <T x={110} y={125} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        back: no role back
      </T>
      <Row y={200} label="promotion" value="a one-way door" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 8 · Recap. Three rows, one per mode and its trade.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lose a commit, stall a write, or bet with a timer." h={200}>
      <Row y={40} label="asynchronous" value="can lose a commit" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="synchronous" value="can stall a write" valueColor={C.second} k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={160} label="semi-synchronous" value="a bet with a timer" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
    </Svg>
  );
}
