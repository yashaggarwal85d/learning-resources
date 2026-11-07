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

const L = ['A', 'B', 'C', 'D', 'E', 'F'];

/** One message: a small box with its letter. */
function Msg({ x, y, l, o = 1, stroke = C.mocha, dashed = false }: { x: number; y: number; l: string; o?: number; stroke?: string; dashed?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={30} height={22} rx={3} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? '4 3' : undefined} />
      {!dashed && (
        <T x={x + 15} y={y + 15.5} s={12} f={C.crema} a="middle">
          {l}
        </T>
      )}
    </g>
  );
}

/** A reader's place in a log: a small triangle under the boxes, at a fractional box index. */
function Marker({ y, at, o = 1, f = C.focus }: { y: number; at: number; o?: number; f?: string }) {
  const x = 25 + at * 40 + 15;
  return <path d={`M${x} ${y} l-7 11 h14 z`} fill={f} opacity={o} />;
}

// 1 · Hook. Queue lane: message A travels to the reader, is acknowledged, and vanishes. Log lane: the same messages; the
// marker steps past A, and A stays where it was.
export function Hook({ t }: StepCtx) {
  const go = easeInOut(seg(t, 0.6, 1.4));
  const gone = easeOut(seg(t, 1.9, 2.3));
  const step = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="the identical message, delivered two ways: a queue acknowledges and it's gone, a log advances a marker but keeps it" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        a queue
      </T>
      {L.slice(1, 4).map((l, i) => (
        <Msg key={l} x={65 + i * 40} y={55} l={l} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <Msg x={lerp(25, 400, go)} y={55} l="A" o={easeOut(seg(t, 0.2, 0.5)) * (1 - gone)} />
      <Cell x={445} y={52} w={130} label="reader" o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={432} y={44} k={easeOut(seg(t, 1.4, 1.8)) * (1 - gone)} />
      <T x={300} y={105} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        acknowledged, then gone
      </T>
      <T x={25} y={135} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        a log
      </T>
      {L.slice(0, 4).map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={145} l={l} o={easeOut(seg(t, 2.6, 2.9))} stroke={i === 0 && step > 0.5 ? C.focus : C.mocha} />
      ))}
      <Marker y={172} at={step} o={easeOut(seg(t, 2.6, 2.9))} />
      <T x={300} y={215} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        marker moved on, message kept
      </T>
    </Svg>
  );
}

// 2 · Predict. The first reader ticked, the message's slot now empty; a second reader asks; the answer: not from the queue.
export function PredictCanGetItBack({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="once a second reader needs a message the queue already delivered, can it get it back?" h={200}>
      <Msg x={25} y={62} l="A" dashed o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={90} y={59} w={200} label="first reader" o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={296} y={73} k={easeOut(seg(t, 0.5, 0.9))} />
      <Cell x={330} y={59} w={245} label="second reader" o={easeOut(seg(t, 0.8, 1.2))} />
      <Cross x={452} y={110} k={v} />
      <AnswerRow y={150} label="can it get it back" answer={answer} value="not from the queue" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="only the log still has it" />
    </Svg>
  );
}

// 3 · Queue deletes. A message reaches the reader; the ack path draws and the message is deleted. Then the nack path
// draws, ending in its three outcomes; the two paths are never both taken.
export function RevealQueueDeletes({ t }: StepCtx) {
  const go = easeInOut(seg(t, 0.3, 0.9));
  const ack = easeOut(seg(t, 1.1, 1.6));
  const del = easeOut(seg(t, 1.7, 2.1));
  const nack = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="a queue deletes on acknowledgement; a negative ack discards, dead-letters, or requeues it — never both" h={250}>
      <Msg x={lerp(25, 85, go)} y={109} l="A" o={1 - del} />
      <Cell x={125} y={106} w={110} label="reader" o={easeOut(seg(t, 0.1, 0.4))} />
      <path d={`M235 112 L290 ${lerp(112, 60, ack)}`} stroke={C.focus} strokeWidth={2} fill="none" opacity={ack} />
      <Cell x={290} y={46} w={110} label="ack" o={ack} stroke={C.focus} />
      <Cell x={420} y={46} w={155} label="deleted" o={del} stroke={C.cherryText} f={C.cherryText} />
      <path d={`M235 124 L290 ${lerp(124, 180, nack)}`} stroke={C.latte} strokeWidth={2} fill="none" opacity={nack} />
      <Cell x={290} y={166} w={110} label="nack" o={nack} />
      {['discard', 'dead-letter', 'requeue'].map((l, i) => (
        <T key={l} x={420} y={158 + i * 24} s={12} f={C.latte} o={easeOut(seg(t, 3.1 + i * 0.25, 3.4 + i * 0.25))}>
          {l}
        </T>
      ))}
      <T x={300} y={240} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.3, 4.7))}>
        one path per message, never both
      </T>
    </Svg>
  );
}

// 4 · Log offset. The reader's marker steps forward box by box; the boxes hold still; then the marker steps back to
// re-read.
export function RevealLogOffset({ t }: StepCtx) {
  const fwd = easeInOut(seg(t, 0.6, 2.4)) * 4;
  const back = easeInOut(seg(t, 3.8, 4.5)) * 3;
  const still = easeOut(seg(t, 2.8, 3.1)) * (1 - easeOut(seg(t, 3.4, 3.7)));
  return (
    <Svg label="a log tracks a position, not a deletion: the message's own offset never changes" h={230}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        the log
      </T>
      {L.map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={60} l={l} o={easeOut(seg(t, 0.2, 0.5))} stroke={still > 0 ? C.focus : C.mocha} />
      ))}
      <Marker y={90} at={fwd - back} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={300} y={60 + 16} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        the reader's place: one number
      </T>
      <T x={300} y={102} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        it only moves forward
      </T>
      <T x={25} y={160} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>
        the messages never move
      </T>
      <T x={25} y={195} s={13} f={C.focus} o={easeOut(seg(t, 4.5, 4.9))}>
        so the reader can step back and re-read
      </T>
    </Svg>
  );
}

// 5 · Replay line. Log lane: after the fix, the marker returns to the start and sweeps every box again. Queue lane: only
// dashed slots; nothing left.
export function RevealReplayLine({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 1.0, 2.6)) * 4;
  return (
    <Svg label="replay is the real dividing line: a log lets a fixed bug re-consume the past, a queue already deleted it" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        log, after the fix
      </T>
      {L.slice(0, 4).map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={52} l={l} stroke={t > 1.0 && sweep > i ? C.focus : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <Marker y={80} at={t < 1.0 ? 4 : Math.min(sweep, 3.6)} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={210} y={68} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        everything re-read
      </T>
      <T x={25} y={125} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        queue, after the fix
      </T>
      {L.slice(0, 4).map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={137} l={l} dashed o={easeOut(seg(t, 3.0, 3.3))} />
      ))}
      <T x={210} y={153} s={13} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        nothing left to re-read
      </T>
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        replay is the dividing line
      </T>
    </Svg>
  );
}

// 6 · Ordering and fan-out. One ordered log; three readers' markers travel it at three different paces, each over the
// whole stream; then the queue's one-destination rule is named.
export function RevealOrderingFanout({ t }: StepCtx) {
  const pace = [1.0, 0.7, 0.45];
  const cols = [C.focus, C.second, C.crema];
  const p = seg(t, 0.6, 3.6);
  return (
    <Svg label="a log's partitions give real ordering and let many independent readers each read the whole stream" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        one ordered log
      </T>
      {L.map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={52} l={l} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      {pace.map((v, j) => (
        <g key={j}>
          <line x1={25} y1={95 + j * 24} x2={265} y2={95 + j * 24} stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.4, 0.7))} />
          <circle cx={40 + clamp(p * v * 1.25) * 200} cy={95 + j * 24} r={6} fill={cols[j]} opacity={easeOut(seg(t, 0.4, 0.7))} />
        </g>
      ))}
      <T x={300} y={102} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        each reader, its own pace
      </T>
      <T x={300} y={126} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        each sees all of it, in order
      </T>
      <T x={25} y={200} s={13} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        a queue: each message to one destination
      </T>
    </Svg>
  );
}

// 7 · Share groups. Three readers share one log; records are handed out one at a time across them, each acknowledged on
// its own; no reader owns the log.
export function RevealShareGroups({ t }: StepCtx) {
  return (
    <Svg label="Kafka's own share groups, production-ready, layer per-record acknowledgement onto a log without owning a partition" h={240}>
      <T x={25} y={35} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        Kafka share groups, production-ready
      </T>
      {L.map((l, i) => (
        <Msg key={l} x={130 + i * 60} y={75} l={l} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      {[0, 1, 2].map((j) => (
        <Cell key={j} x={110 + j * 130} y={160} w={110} label="reader" o={easeOut(seg(t, 0.6, 0.9))} />
      ))}
      {L.map((l, i) => {
        const k = easeOut(seg(t, 1.2 + i * 0.35, 1.5 + i * 0.35));
        const cx = 165 + (i % 3) * 130;
        return (
          <g key={l}>
            <line x1={145 + i * 60} y1={97} x2={lerp(145 + i * 60, cx, k)} y2={lerp(97, 160, k)} stroke={C.focus} strokeWidth={1.5} opacity={k > 0 ? 0.8 : 0} />
            <MiniTick x={139 + i * 60} y={64} k={easeOut(seg(t, 1.5 + i * 0.35, 1.8 + i * 0.35))} />
          </g>
        );
      })}
      <T x={300} y={225} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        one record at a time, no reader owns it
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a queue deletes on ack, a log tracks a rewindable offset, replay and fan-out favor the log, share groups blur the line" h={250}>
      <Row y={50} label="a queue" value="deletes on ack" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={100} label="a log" value="moves a marker" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={150} label="replay, fan-out" value="favor the log" k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={200} label="share groups" value="blur the line" valueColor={C.focus} k={easeOut(seg(t, 4.4, 4.8))} />
    </Svg>
  );
}

// 9 · Prove. A log with three teams' markers and a queue of empty slots; after the answer the queue is crossed and the log
// lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="many independent teams, each at their own pace, one replaying last week after a bug fix — which system?" h={200}>
      {L.map((l, i) => (
        <Msg key={l} x={25 + i * 40} y={50} l={l} o={easeOut(seg(t, 0.2, 0.5))} stroke={v > 0 ? C.focus : C.mocha} />
      ))}
      {[0.4, 2.2, 4.6].map((a, j) => (
        <Marker key={j} y={78} at={a * easeOut(seg(t, 0.4, 1.2))} f={[C.focus, C.second, C.crema][j]} o={easeOut(seg(t, 0.4, 0.7))} />
      ))}
      {L.slice(0, 4).map((l, i) => (
        <Msg key={l} x={330 + i * 40} y={50} l={l} dashed o={easeOut(seg(t, 0.6, 0.9))} />
      ))}
      <Cross x={400} y={105} k={v} />
      <AnswerRow y={145} label="fits" answer={answer} value="the offset log" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={188} text="the queue already deleted it" />
    </Svg>
  );
}
