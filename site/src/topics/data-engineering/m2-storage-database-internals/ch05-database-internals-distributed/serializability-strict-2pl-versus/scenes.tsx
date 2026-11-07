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

/** A doctor: a filled circle while on call, hollow once they've gone home. */
function Doc({ x, y, off, o = 1 }: { x: number; y: number; off: number; o?: number }) {
  return <circle cx={x} cy={y} r={18} fill={off > 0.5 ? C.cocoa : C.focus} stroke={off > 0.5 ? C.cherryText : C.focus} strokeWidth={2} opacity={o} />;
}

// 1 · Hook. The same two doctors, one level stricter: doctor 1's commit gets a tick, doctor 2's is crossed out.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same scenario, one isolation level stricter." h={230}>
      <Row y={40} label="the same doctors" value="one level stricter" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Doc x={200 + i * 200} y={105} off={0} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
          <T x={200 + i * 200} y={150} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
            {i === 0 ? 'doctor 1' : 'doctor 2'}
          </T>
        </g>
      ))}
      <MiniTick x={228} y={105} k={easeOut(seg(t, 1.8, 2.1))} />
      <Cross x={436} y={105} k={easeOut(seg(t, 2.8, 3.1))} />
      <Row y={205} label="commits that make it" value="one of two" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 2 · Strict 2PL. T1 locks and holds until commit; T2 waits on a dashed line, then runs. Below, two waiters form a cycle; one is crossed.
export function RevealStrict2PL({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.8, 1.8));
  const cyc = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="lock on touch, hold until commit, block the rest." h={230}>
      <Lane y={50} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={110} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={50} w={80} label="lock" o={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={155} y={44} width={265 * h} height={12} rx={3} fill={C.second} opacity={h > 0 ? 0.85 : 0} />
      <Ev x={425} y={50} w={90} label="commit" o={easeOut(seg(t, 1.8, 2.1))} />
      <Ev x={155} y={110} w={100} label="wants in" o={easeOut(seg(t, 0.9, 1.2))} />
      <line x1={260} y1={110} x2={260 + 165 * h} y2={110} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <Ev x={440} y={110} w={80} label="runs" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))} />
      <circle cx={170} cy={180} r={14} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={cyc} />
      <circle cx={290} cy={180} r={14} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={cyc} />
      <path d="M186 172 Q230 150 274 172 M274 188 Q230 210 186 188" fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="160" strokeDashoffset={160 * (1 - cyc)} />
      <Cross x={290} y={180} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={330} y={185} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 3.9))}>
        deadlock: one rolls back
      </T>
    </Svg>
  );
}

// 3 · SSI. Two transactions run freely; a watcher line sweeps across and lights each read-write conflict between them.
export function RevealSSIMechanism({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.8, 3.6));
  const xw = lerp(70, 560, sw);
  const edges: [number, number][] = [
    [180, 320],
    [360, 470],
  ];
  return (
    <Svg label="snapshot isolation, unchanged. One thing watched, concurrently." h={230}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={130} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      {[110, 300, 450].map((x, i) => (
        <Ev key={'a' + x} x={x} y={60} w={70} label={i === 1 ? 'write' : 'read'} o={easeOut(seg(t, 0.4 + i * 0.25, 0.7 + i * 0.25))} />
      ))}
      {[160, 330, 500].map((x, i) => (
        <Ev key={'b' + x} x={x} y={130} w={70} label={i === 0 ? 'read' : 'write'} o={easeOut(seg(t, 0.5 + i * 0.25, 0.8 + i * 0.25))} />
      ))}
      {edges.map(([a, b]) => (
        <line key={a} x1={a} y1={73} x2={b} y2={117} stroke={xw > b ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.4, 1.7))} />
      ))}
      <line x1={xw} y1={40} x2={xw} y2={150} stroke={C.second} strokeWidth={2} opacity={sw > 0 && sw < 1 ? 1 : 0} />
      <Row y={200} label="nothing blocks" value="a watcher checks" valueColor={C.second} k={easeOut(seg(t, 3.7, 4.2))} />
    </Svg>
  );
}

// 4 · Predict. Two routes, one guarantee; the answer: two different bills.
export function PredictSameCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="same guarantee, both routes. Same cost to get there?" h={200}>
      <Row y={40} label="both promise" value="full serializability" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={250} h={28} label="locking: wait up front" stroke={a > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={325} y={66} w={250} h={28} label="SSI: may redo the work" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="the same cost?" answer={answer} value="no, two bills" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="wait first, or redo later" />
    </Svg>
  );
}

// 5 · The dangerous structure. Two read-write arrows chain through a pivot transaction in the middle; the pivot turns red.
export function RevealDangerousStructure({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 1.6));
  const b = easeOut(seg(t, 1.8, 2.4));
  const p = easeOut(seg(t, 2.6, 2.9));
  const nodes: [number, string][] = [
    [110, 'T in'],
    [300, 'pivot'],
    [490, 'T out'],
  ];
  return (
    <Svg label="two rw-conflicts, chained through a pivot in the middle." h={240}>
      {nodes.map(([x, l], i) => (
        <g key={l}>
          <circle cx={x} cy={110} r={26} fill={C.cocoa} stroke={i === 1 && p > 0.5 ? C.cherryText : C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))} />
          <T x={x} y={115} s={12} f={i === 1 && p > 0.5 ? C.cherryText : C.crema} a="middle" o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))}>
            {l}
          </T>
        </g>
      ))}
      <line x1={140} y1={110} x2={140 + 130 * a} y2={110} stroke={C.second} strokeWidth={2} />
      <path d="M270 110 l-9 -5 v10 z" fill={C.second} opacity={a > 0.98 ? 1 : 0} />
      <T x={205} y={96} s={11} f={C.second} a="middle" o={a}>
        rw
      </T>
      <line x1={330} y1={110} x2={330 + 130 * b} y2={110} stroke={C.second} strokeWidth={2} />
      <path d="M460 110 l-9 -5 v10 z" fill={C.second} opacity={b > 0.98 ? 1 : 0} />
      <T x={395} y={96} s={11} f={C.second} a="middle" o={b}>
        rw
      </T>
      <Row y={200} label="this exact shape" value="write skew" valueColor={C.cherryText} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 6 · SERIALIZABLE catches the doctors. Doctor 1's commit ticks; doctor 2's is crossed with a serialization failure.
export function RevealCatchesDoctors({ t }: StepCtx) {
  const f = easeOut(seg(t, 2.4, 2.7));
  return (
    <Svg label="the exact rerun, measured, under SERIALIZABLE." h={240}>
      <Row y={40} label="isolation level" value="SERIALIZABLE" k={easeOut(seg(t, 0.2, 0.7))} />
      <Lane y={85} name="doc 1" o={easeOut(seg(t, 0.5, 0.8))} />
      <Lane y={140} name="doc 2" o={easeOut(seg(t, 0.5, 0.8))} />
      <Ev x={300} y={85} label="commit" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <MiniTick x={418} y={85} k={easeOut(seg(t, 1.5, 1.8))} />
      <Ev x={300} y={140} label="commit" stroke={f > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 1.9, 2.2))} />
      <Cross x={355} y={140} k={f} />
      <T x={355} y={176} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>
        serialization failure
      </T>
      <Row y={220} label="snapshot's survivor" value="caught" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 7 · The retry. The failed attempt, then a fresh snapshot, the real count, and a correct decision to stay.
export function RevealRetrySucceeds({ t }: StepCtx) {
  const ev: [number, number, string, number][] = [
    [70, 80, 'failed', 0.2],
    [165, 140, 'fresh snapshot', 1.0],
    [320, 130, 'the other left', 1.8],
    [465, 110, 'stays on call', 2.6],
  ];
  return (
    <Svg label="retry, fresh snapshot, the real count." h={240}>
      <Lane y={70} name="doc 2" o={easeOut(seg(t, 0.1, 0.4))} />
      {ev.map(([x, w, l, a], i) => (
        <Ev key={l} x={x} y={70} w={w} label={l} stroke={i === 0 ? C.cherryText : i === 3 ? C.focus : C.mocha} f={i === 3 ? C.focus : C.crema} o={easeOut(seg(t, a, a + 0.3))} />
      ))}
      <Cross x={110} y={70} k={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={150} label="retry attempts" value="1" k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={200} label="doctors on call" value="1" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 8 · The two bills. Left, locking: a wait grows and a cycle closes. Right, SSI: work flows, and one harmless transaction is crossed.
export function RevealThroughputFalsePositives({ t }: StepCtx) {
  const w = easeInOut(seg(t, 0.6, 1.8));
  const flow = clamp(seg(t, 2.0, 4.0));
  return (
    <Svg label="the real cost on each side." h={240}>
      <T x={25} y={45} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        strict locking
      </T>
      <line x1={25} y1={80} x2={275} y2={80} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={25} y1={120} x2={275} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={40} y={74} width={200 * w} height={12} rx={3} fill={C.second} />
      <line x1={70} y1={120} x2={70 + 170 * w} y2={120} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
      <T x={25} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 1.6, 1.9))}>
        waits; can deadlock
      </T>
      <T x={325} y={45} s={13} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        SSI
      </T>
      <line x1={325} y1={80} x2={575} y2={80} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <line x1={325} y1={120} x2={575} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      {[0, 1, 2].map((i) => {
        const q = clamp(flow * 2 - i * 0.4);
        return q > 0 ? <circle key={i} cx={lerp(330, 570, q)} cy={i === 1 ? 120 : 80} r={6} fill={C.focus} opacity={q < 1 ? 1 : 0} /> : null;
      })}
      <circle cx={450} cy={120} r={6} fill={C.cherryText} opacity={easeOut(seg(t, 3.0, 3.3))} />
      <Cross x={450} y={120} k={easeOut(seg(t, 3.2, 3.5))} />
      <T x={325} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))}>
        never waits; aborts a fine one
      </T>
      <Row y={215} label="the bill" value="wait, or redo" valueColor={C.focus} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 9 · Abort rate. Two sharing transactions: one of two pips turns red. Six: at least three of six turn red.
export function RevealAbortRateContention({ t }: StepCtx) {
  return (
    <Svg label="the same contention, scaled. A real, measured rise." h={240}>
      <Row y={45} label="two sharing one rule" value="1 of 2 aborted" k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1].map((i) => (
        <circle
          key={i}
          cx={40 + i * 34}
          cy={80}
          r={11}
          fill={i === 0 && t > 1.6 ? C.cherryText : C.cocoa}
          stroke={C.latte}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, 0.8 + i * 0.15, 1.1 + i * 0.15))}
        />
      ))}
      <Row y={135} label="six sharing it" value="at least 3 of 6" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.7))} />
      {Array.from({ length: 6 }, (_, i) => (
        <circle
          key={i}
          cx={40 + i * 34}
          cy={170}
          r={11}
          fill={i < 3 && t > 3.2 + i * 0.15 ? C.cherryText : C.cocoa}
          stroke={C.latte}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, 2.5 + i * 0.1, 2.8 + i * 0.1))}
        />
      ))}
      <T x={25} y={225} s={12} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        the rate climbs as the crowd grows
      </T>
    </Svg>
  );
}

// 10 · Recap. Three rows: one guarantee, then each route's bill.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one guarantee, two routes, two different bills." h={200}>
      <Row y={40} label="one guarantee" value="full serializability" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={100} label="strict locking pays" value="blocking, deadlocks" valueColor={C.second} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={160} label="SSI pays" value="false aborts, retries" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 11 · Prove. Hot rows; two route cells; after the answer locking lights and SSI is crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="heavy contention, a few hot rows. Which route?" h={220}>
      <Row y={40} label="contention" value="a few hot rows" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the better route" answer={answer} value="strict locking" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="strict locking" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={325} y={118} w={250} h={28} label="SSI" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 1.0, 1.3))} />
      <Cross x={555} y={132} k={a} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            predictable waits beat repeat aborts
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
