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

/** A node's timeline: its name on the left and a line from x 110 rightwards; events sit on it as cells. */
function NLane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={110} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
}

// 1 · Hook. The client writes to the primary and reads it straight back; then the read is rerouted to a standby, with a question.
export function Hook({ t }: StepCtx) {
  const w = clamp(seg(t, 0.4, 1.0));
  const r = clamp(seg(t, 2.2, 2.8));
  return (
    <Svg label="write an order, read it back. What if the read hits another node?" h={230}>
      <Cell x={25} y={76} w={130} label="client" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={405} y={40} w={170} label="primary" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={405} y={112} w={170} label="standby" o={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={lerp(160, 400, w)} cy={lerp(86, 54, w)} r={5} fill={C.focus} opacity={w > 0 && w < 1 ? 1 : 0} />
      <MiniTick x={170} y={66} k={easeOut(seg(t, 1.3, 1.6))} />
      <T x={205} y={58} s={11} f={C.focus} o={easeOut(seg(t, 1.3, 1.6))}>
        same node: sees it
      </T>
      <circle cx={lerp(160, 400, r)} cy={lerp(96, 126, r)} r={5} fill={C.second} opacity={r > 0 && r < 1 ? 1 : 0} />
      <T x={280} y={140} s={13} f={C.second} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
        ?
      </T>
      <Row y={205} label="the read lands on" value="a different node" valueColor={C.second} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Predict. The standby has received the order but its replay marker sits behind it; the answer: not visible.
export function PredictOwnWriteOnLaggingStandby({ t, answer }: StepCtx) {
  return (
    <Svg label="the standby hasn't applied it yet. Does the read see it?" h={200}>
      <Cell x={25} y={60} w={140} label="standby" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={185} y={66} width={390} height={16} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={185} y={66} width={300 * easeOut(seg(t, 0.4, 1.0))} height={16} rx={3} fill={C.second} opacity={0.5} />
      <circle cx={440} cy={74} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={440} y={58} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        the order
      </T>
      <line x1={330} y1={58} x2={330} y2={90} stroke={C.cherryText} strokeWidth={2.5} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={330} y={104} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        replayed to here
      </T>
      <AnswerRow y={140} label="sees its own order?" answer={answer} value="no" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="only the replay position decides" />
    </Svg>
  );
}

// 3 · Read-your-writes. P's later read is tied to P's own write by an arrow; Q's read gets no promise.
export function RevealReadYourWritesDefined({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="a process's own write, visible to its own later read." h={220}>
      <NLane y={60} name="process P" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={135} name="process Q" o={easeOut(seg(t, 2.4, 2.7))} />
      <Ev x={130} y={60} label="write x" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Ev x={400} y={60} label="read x" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <path d={`M240 44 Q320 ${44 - 22 * a} ${lerp(240, 400, a)} 44`} fill="none" stroke={C.focus} strokeWidth={2} opacity={a > 0 ? 1 : 0} />
      <T x={320} y={90} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        must see it
      </T>
      <Ev x={400} y={135} label="read x" o={0.7 * easeOut(seg(t, 2.6, 2.9))} />
      <T x={455} y={170} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        no promise at all
      </T>
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        nothing about anyone else's read
      </T>
    </Svg>
  );
}

// 4 · Broken, measured. The standby's replay is paused; the primary commits; the read on the standby comes back empty.
export function RevealBrokenMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real write, a real read. The row: missing." h={240}>
      <NLane y={55} name="primary" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={125} name="standby" o={easeOut(seg(t, 0.1, 0.4))} />
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <rect x={130} y={115} width={6} height={20} fill={C.cherryText} />
        <rect x={142} y={115} width={6} height={20} fill={C.cherryText} />
      </g>
      <T x={160} y={160} s={11} f={C.cherryText} o={easeOut(seg(t, 0.5, 0.8))}>
        replay paused
      </T>
      <Ev x={240} y={55} w={140} label="commit the order" stroke={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <Ev x={420} y={125} w={130} label="read: 0 rows" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.5))} />
      <Row y={210} label="the client's own row" value="missing" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 5 · The LSN token. The commit's position is captured as a token, dropped as a line; the standby's replay creeps up to it, polled.
export function RevealLsnTokenBuilt({ t }: StepCtx) {
  const rp = easeInOut(seg(t, 1.8, 3.4));
  const x = lerp(115, 400, rp);
  return (
    <Svg label="the commit position, as a token. Polled, not guessed." h={240}>
      <NLane y={55} name="primary" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={135} name="standby" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={180} y={55} w={100} label="commit" stroke={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={300} y={42} w={150} h={26} label="token: its LSN" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.9, 1.2))} />
      <line x1={330} y1={72} x2={330} y2={160} stroke={C.second} strokeWidth={2} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.3, 1.6))} />
      <rect x={115} y={130} width={x - 115} height={10} rx={3} fill={x > 330 ? C.focus : C.latte} opacity={rp > 0 ? 1 : 0} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={150 + i * 60} cy={160} r={3} fill={C.latte} opacity={easeOut(seg(t, 2.0 + i * 0.3, 2.2 + i * 0.3))} />
      ))}
      <T x={150} y={182} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        polled
      </T>
      <MiniTick x={410} y={135} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        wait for a position, not a guessed sleep
      </T>
    </Svg>
  );
}

// 6 · Fixed, measured. The replay bar reaches the token line and, at that exact moment, the read returns the row.
export function RevealFixedMeasured({ t }: StepCtx) {
  const rp = easeInOut(seg(t, 0.8, 2.4));
  const x = lerp(115, 330, rp);
  return (
    <Svg label="same write, same read. Visible once replay passes the token." h={230}>
      <NLane y={55} name="primary" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={125} name="standby" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={180} y={55} w={100} label="commit" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={330} y1={42} x2={330} y2={150} stroke={C.second} strokeWidth={2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={336} y={38} s={11} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        the token
      </T>
      <rect x={115} y={120} width={x - 115} height={10} rx={3} fill={C.latte} opacity={rp > 0 ? 1 : 0} />
      <Ev x={350} y={125} w={130} label="read: 1 row" stroke={C.focus} f={C.focus} o={rp >= 1 ? easeOut(seg(t, 2.4, 2.7)) : 0} />
      <Row y={200} label="the client's own row" value="visible, exactly then" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 7 · Predict #2. One standby with one forward stream; after the answer a second, independently lagging replica appears.
export function PredictMonotonicViolationNeeds({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="reads never go backward here. What would it take?" h={200}>
      <Cell x={25} y={40} w={250} h={28} label="one standby" o={easeOut(seg(t, 0.1, 0.4))} />
      <path d={`M25 88 H${25 + 240 * easeOut(seg(t, 0.4, 1.2))}`} stroke={C.focus} strokeWidth={2} />
      <path d="M265 82 l10 6 l-10 6" fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.1, 1.3))} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        one ordered stream, forward only
      </T>
      <Cell x={325} y={40} w={250} h={28} label="a second replica" stroke={C.cherryText} o={a} />
      <AnswerRow y={140} label="what it takes" answer={answer} value="two replicas, varying lag" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="one ordered stream only moves forward" />
    </Svg>
  );
}

// 8 · The other two guarantees. Successive reads step only rightward on one axis; "placed" always lands before "shipped".
export function RevealOtherTwoGuarantees({ t }: StepCtx) {
  return (
    <Svg label="reads never go back; effect never precedes cause." h={250}>
      <Row y={40} label="monotonic reads" value="holds" valueColor={C.focus} k={easeOut(seg(t, 0.4, 0.9))} />
      <line x1={25} y1={75} x2={575} y2={75} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      {[100, 230, 360].map((x, i) => (
        <circle key={x} cx={x} cy={75} r={7} fill={C.focus} opacity={easeOut(seg(t, 1.1 + i * 0.4, 1.4 + i * 0.4))} />
      ))}
      <Row y={125} label="consistent prefix" value="holds" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Cell x={25} y={142} w={120} label="placed" o={easeOut(seg(t, 2.8, 3.1))} />
      <path d="M150 156 h40" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.1, 3.3))} />
      <Cell x={195} y={142} w={120} label="shipped" o={easeOut(seg(t, 3.3, 3.6))} />
      <Row y={220} label="a violation needs" value="a second replica" valueColor={C.second} k={easeOut(seg(t, 4.2, 4.7))} />
    </Svg>
  );
}

// 9 · Lag under load. 2,000 writes push the primary's head forward; written, flushed and replayed markers trail behind it, in order.
export function RevealLagUnderLoadMeasured({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.8, 2.6));
  const marks: [number, string][] = [
    [470, 'write_lag'],
    [395, 'flush_lag'],
    [320, 'replay_lag'],
  ];
  return (
    <Svg label="2,000 writes. write_lag, flush_lag, replay_lag: measured." h={240}>
      <Row y={40} label="2,000 writes" value="as fast as possible" k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <circle cx={lerp(100, 545, g)} cy={100} r={8} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={lerp(100, 545, g)} y={80} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        primary
      </T>
      {marks.map(([x, l], i) => (
        <g key={l}>
          <line x1={lerp(100, x, g)} y1={92} x2={lerp(100, x, g)} y2={108} stroke={C.second} strokeWidth={2.5} opacity={easeOut(seg(t, 1.2 + i * 0.3, 1.5 + i * 0.3))} />
          <T x={x} y={136 + i * 25} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3))}>
            {l}
          </T>
        </g>
      ))}
      <T x={25} y={224} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        the server's own measured intervals
      </T>
    </Svg>
  );
}

// 10 · Recap. Three rows, one per guarantee.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three guarantees, one fix: a token naming the position." h={200}>
      <Row y={40} label="read-your-writes" value="the LSN token" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={100} label="monotonic reads" value="one replica: holds" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={160} label="consistent prefix" value="one replica: holds" k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 11 · Prove. Every dashboard read vs the one support lookup; after the answer the dashboard cell is crossed and the lookup lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a lagging replica, mid-sale. What does the fix cost?" h={220}>
      <Row y={40} label="the dashboard" value="a lagging replica" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the token wait goes on" answer={answer} value="one support lookup" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="every dashboard read" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={262} y={132} k={a} />
      <Cell x={325} y={118} w={250} h={28} label="the support lookup" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            the dashboard shouldn't pay for it
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
