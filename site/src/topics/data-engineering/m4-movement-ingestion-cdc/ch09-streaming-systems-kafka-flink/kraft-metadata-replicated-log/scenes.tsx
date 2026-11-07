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

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 6} y={lerp(y1, y2, p) - 6} width={12} height={12} rx={2} fill={f} />;
}

// 0 · Hook. The broker's link to the controller is cut; its link to the old system holds. Clients keep asking and the
// broker keeps answering, while its view has stopped updating.
export function Hook({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.9, 1.2));
  const traffic = seg(t, 1.4, 3.8);
  return (
    <Svg label="a broker cut off from the controller but not from the old coordination system, still answering with a stale view" h={200}>
      <Cell x={25} y={30} w={150} label="controller" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={140} w={150} label="old system" o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={175} y1={44} x2={225} y2={95} stroke={cut > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} strokeDasharray={cut > 0 ? '4 3' : undefined} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={175} y1={154} x2={225} y2={103} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Cross x={200} y={70} k={cut} />
      <Cell x={225} y={85} w={150} label="broker" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={430} y={85} w={120} label="clients" o={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1, 2, 3].map((i) => (
        <Pip key={i} x1={i % 2 ? 385 : 420} y1={i % 2 ? 125 : 75} x2={i % 2 ? 420 : 385} y2={i % 2 ? 125 : 75} p={clamp(traffic * 4 - i, 0, 1)} f={i % 2 ? C.latte : C.crema} />
      ))}
      <T x={300} y={146} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        its view stopped updating
      </T>
      <T x={430} y={178} s={11} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        still answering
      </T>
    </Svg>
  );
}

// 1 · Setup. Two replication stories, data and coordination; the second is struck and both fold into one kind of log.
export function Setup({ t }: StepCtx) {
  const fold = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="two separate systems collapsing into the one kind of log this chapter keeps reusing" h={200}>
      <g opacity={1 - 0.6 * fold}>
        <Cell x={25} y={40} w={240} label="data: replicated log" o={easeOut(seg(t, 0.1, 0.4))} />
        <Cell x={25} y={100} w={240} label="coordination: second system" o={easeOut(seg(t, 0.4, 0.7))} />
      </g>
      <Cross x={250} y={114} k={easeOut(seg(t, 1.2, 1.5))} />
      <line x1={265} y1={54} x2={lerp(265, 305, fold)} y2={lerp(54, 84, fold)} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={265} y1={114} x2={lerp(265, 305, fold)} y2={lerp(114, 84, fold)} stroke={C.mocha} strokeWidth={1.5} />
      <Cell x={310} y={70} w={240} label="one kind of log" o={easeOut(seg(t, 2.1, 2.5))} stroke={C.focus} />
      <T x={300} y={180} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>
        one story to reason about, not two
      </T>
    </Svg>
  );
}

// 2 · Predict. The metadata log on top, three brokers below. On answer each broker sends a fetch up its own line and
// pulls the update back down.
export function PredictPullPush({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const up = answer !== null ? seg(s, 0.1, 0.6) : 0;
  const dn = answer !== null ? seg(s, 0.6, 1.1) : 0;
  const xs = [100, 290, 480];
  return (
    <Svg label="every broker needs the current metadata — pushed out by the controller, or pulled in by each broker?" h={200}>
      <Cell x={200} y={30} w={200} label="metadata log" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={100} x2={300} y2={58} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
          <Cell x={x - 75} y={100} w={150} label="broker" o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
          <Pip x1={x} y1={96} x2={300} y2={64} p={up} f={C.second} />
          <Pip x1={300} y1={64} x2={x} y2={96} p={dn} f={C.focus} />
        </g>
      ))}
      <AnswerRow y={182} label="metadata is" answer={answer} value="pulled by each broker" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Fetch. Twelve entries of metadata log; a broker's position mark sits mid-way; it fetches forward and the mark
// walks to the end, lighting each entry it pulls.
export function RevealFetch({ t }: StepCtx) {
  const pos = 6 + Math.floor(easeInOut(seg(t, 1.6, 3.4)) * 6.99);
  return (
    <Svg label="a broker's own tracked position in the metadata log, fetching forward from it" h={200}>
      <T x={25} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        metadata log
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 44}
          y={44}
          width={36}
          height={22}
          rx={3}
          fill={C.cocoa}
          stroke={i < 6 ? C.latte : i < pos ? C.focus : C.mocha}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, 0.05 + i * 0.04, 0.3 + i * 0.04))}
        />
      ))}
      <path d={`M${25 + Math.min(pos, 12) * 44 - 10} 86 l6 -10 l6 10 z`} fill={C.focus} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={25} y={112} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.2))}>
        the broker's own position, tracked by the broker
      </T>
      <Req x1={25} x2={250} y={140} k={easeOut(seg(t, 1.4, 1.9))} label="fetch everything past it" f={C.second} />
      <T x={25} y={185} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.1))}>
        the same pull this chapter already built
      </T>
    </Svg>
  );
}

// 4 · Fencing. Two brokers' time since their last fetch grows toward a dashed threshold: one stops inside it, one runs
// well past and is fenced, in cherry.
export function RevealFencing({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.6));
  const b = easeInOut(seg(t, 1.8, 3.4));
  const over = 150 + 370 * b > 400;
  return (
    <Svg label="a broker's time since its last fetch against the fencing threshold, twice — once under it, once well past it" h={200}>
      <T x={25} y={58} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        broker A
      </T>
      <rect x={150} y={44} width={180 * a} height={18} rx={3} fill={C.latte} opacity={0.6} />
      <T x={25} y={118} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        broker B
      </T>
      <rect x={150} y={104} width={370 * b} height={18} rx={3} fill={over ? C.cherryText : C.latte} opacity={0.6} />
      <line x1={400} y1={30} x2={400} y2={136} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={400} y={154} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        fencing threshold
      </T>
      <MiniTick x={345} y={48} k={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        broker B: fenced, though still reachable
      </T>
    </Svg>
  );
}

// 5 · Predict. A candidate that can't win sends a vote request to the leader. On answer the epoch counter ticks up in
// cherry and the leader is shaken.
export function PredictDisruption({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a candidate that can never win, still disrupting the leader every time it reconnects — why?" h={200}>
      <Cell x={25} y={40} w={160} label="hopeless candidate" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={195} x2={370} y={54} k={easeOut(seg(t, 0.4, 0.9))} label="vote request" />
      <Cell x={380} y={40} w={170} label="leader" o={easeOut(seg(t, 0.2, 0.5))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <Cell x={380} y={100} w={170} label={v > 0 ? 'epoch: bumped' : 'epoch'} o={easeOut(seg(t, 0.6, 0.9))} stroke={v > 0 ? C.cherryText : C.mocha} f={v > 0 ? C.cherryText : C.crema} />
      <AnswerRow y={178} label="the cause" answer={answer} value="the epoch bump" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 6 · Pre-vote. A dozen reconnect rounds, twice. Standard vote: each round lights cherry and the epoch bar climbs a
// step. Pre-vote: each round only asks first; the epoch bar never moves.
export function RevealPreVote({ t }: StepCtx) {
  const r1 = Math.floor(easeInOut(seg(t, 0.4, 2.0)) * 12.99);
  const r2 = Math.floor(easeInOut(seg(t, 2.4, 3.8)) * 12.99);
  return (
    <Svg label="the same rounds of reconnection, twice — epoch bumps and disruptions under a standard vote, against pre-vote" h={200}>
      {[0, 1].map((row) => {
        const y = 40 + row * 80;
        const n = row === 0 ? r1 : r2;
        return (
          <g key={row}>
            <T x={25} y={y + 12} s={12} f={C.crema} o={easeOut(seg(t, row * 2.2, 0.3 + row * 2.2))}>
              {row === 0 ? 'standard vote' : 'pre-vote'}
            </T>
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={160 + i * 32}
                y={y}
                width={22}
                height={14}
                rx={2}
                fill={i < n ? (row === 0 ? C.cherryText : C.latte) : C.cocoa}
                stroke={i < n ? (row === 0 ? C.cherryText : C.latte) : C.mocha}
                strokeWidth={1}
                opacity={easeOut(seg(t, row * 2.2, 0.3 + row * 2.2))}
              />
            ))}
            <rect x={160} y={y + 22} width={row === 0 ? (n / 12) * 374 : 2} height={6} rx={2} fill={row === 0 ? C.cherryText : C.focus} opacity={easeOut(seg(t, row * 2.2 + 0.2, 0.5 + row * 2.2))} />
            <T x={160} y={y + 48} s={11} f={row === 0 ? C.cherryText : C.focus} o={easeOut(seg(t, row === 0 ? 2.0 : 3.8, row === 0 ? 2.3 : 4.1))}>
              {row === 0 ? 'epoch climbs, leader disrupted every round' : 'epoch never moves, never disrupted'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Dynamic quorum. A fourth controller slides into the voter set, pending, then lands with a tick. A second request
// arrives while the first is pending and is turned away, in cherry.
export function RevealDynamicQuorum({ t }: StepCtx) {
  const join = easeInOut(seg(t, 0.6, 1.4));
  const done = t >= 3.2;
  const second = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="adding and removing controllers without a restart, and a second request rejected while one is still pending" h={200}>
      <rect x={120} y={40} width={330} height={60} rx={8} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={130} y={32} s={11} f={C.second} o={easeOut(seg(t, 0, 0.3))}>
        voters
      </T>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={170 + i * 70} cy={70} r={14} fill={C.latte} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <circle cx={lerp(540, 380, join)} cy={70} r={14} fill={done ? C.latte : 'none'} stroke={C.focus} strokeWidth={2} strokeDasharray={done ? undefined : '4 3'} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <T x={380} y={122} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        {done ? 'added' : 'pending'}
      </T>
      <circle cx={lerp(560, 500, second)} cy={160} r={12} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 1.8, 2.0))} />
      <Cross x={500} y={160} k={easeOut(seg(t, 2.5, 2.8))} />
      <T x={480} y={165} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        second change, while pending: rejected
      </T>
      <T x={25} y={195} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        no restart; one member at a time
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="fencing" value="past threshold" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="standard vote" value="disrupts every round" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="pre-vote" value="never disrupts" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="voter change" value="one at a time" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Four lines, one by one; the quorum line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['metadata: one log, pulled by brokers', 'the fetch doubles as a heartbeat', 'pre-vote: canvass before disrupting', 'the quorum changes one member at a time'];
  return (
    <Svg label="one log, a fencing heartbeat, a canvassing vote, and a quorum that changes one member at a time" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.6 + i * 0.9));
        return <Cell key={i} x={25} y={lerp(22, 30, k) + i * 50} w={530} label={r} o={k} stroke={i === 3 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
