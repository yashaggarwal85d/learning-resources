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

const REC: [string, string][] = [
  ['order-committed', 'ok'],
  ['order-aborted', 'aborted'],
  ['order-committed-2', 'ok'],
  ['order-still-open', 'open'],
];

// 0 · Hook. One input offset and three output partitions; a dashed all-or-nothing box closes around all four; lines
// from the input to each output draw together.
export function Hook({ t }: StepCtx) {
  const box = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="an input offset and several output partitions, all needing to succeed or fail as one unit" h={200}>
      <rect x={20} y={20} width={540} height={150} rx={8} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="6 4" opacity={box} />
      <T x={300} y={190} s={11} f={C.focus} a="middle" o={box}>
        all of them, or none of them
      </T>
      <Cell x={40} y={80} w={150} label="input offset" o={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.3, 0.8 + i * 0.3));
        return (
          <g key={i}>
            <line x1={190} y1={94} x2={lerp(190, 370, k)} y2={lerp(94, 49 + i * 45, k)} stroke={C.mocha} strokeWidth={1.5} />
            <Cell x={375} y={35 + i * 45} w={170} label={`output ${i + 1}`} o={k} />
          </g>
        );
      })}
    </Svg>
  );
}

// 1 · Setup. A producer with a stable id restarts; its id stays. A coordinator alongside keeps a state card for each
// transaction, ticking through ongoing, then committed.
export function Setup({ t }: StepCtx) {
  const restart = easeInOut(seg(t, 0.8, 1.4));
  const state = t < 2.6 ? 'txn: ongoing' : t < 3.4 ? 'txn: preparing' : 'txn: committed';
  return (
    <Svg label="a stable id across restarts, and a dedicated coordinator tracking every transaction's state" h={200}>
      <Cell x={25} y={40} w={220} label="producer" o={easeOut(seg(t, 0, 0.3)) * (1 - 0.6 * Math.sin(Math.PI * restart))} />
      <Cell x={25} y={80} w={220} label="id: payments-writer" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <T x={25} y={130} s={11} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        survives the restart
      </T>
      <Cell x={330} y={40} w={220} label="coordinator" o={easeOut(seg(t, 1.6, 1.9))} stroke={C.second} />
      <Cell x={330} y={80} w={220} label={state} o={easeOut(seg(t, 2.0, 2.3))} stroke={t >= 3.4 ? C.focus : C.mocha} />
      <T x={330} y={130} s={11} f={C.second} o={easeOut(seg(t, 2.3, 2.6))}>
        tracks every transaction
      </T>
    </Svg>
  );
}

// 2 · Predict. A new instance starts under the id while the old one is still sending. On answer the old write is
// struck before it lands.
export function PredictZombie({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a producer restarts under the same transactional id while an old instance is still writing" h={200}>
      <Cell x={25} y={30} w={180} label="new instance" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      <Cell x={25} y={90} w={180} label="old instance" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={400} y={60} w={150} label="partition" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={215} x2={lerp(215, 390, 0.75)} y={104} k={easeOut(seg(t, 0.5, 1.0))} label="still writing" />
      <Cross x={360} y={104} k={v} />
      {v > 0 && (
        <T x={400} y={140} s={11} f={C.cherryText} o={v}>
          fenced off
        </T>
      )}
      <AnswerRow y={180} label="the old writes" answer={answer} value="fenced off" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Epoch bump. The restart raises the epoch, epoch A to epoch B; B's write is accepted; a write still under A
// arrives and is struck.
export function RevealZombie({ t }: StepCtx) {
  const bump = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="the restart bumps the epoch — a write still under the old one is fenced off" h={200}>
      <Cell x={25} y={30} w={160} label="epoch A" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={lerp(225, 205, bump)} y={30} w={160} label="epoch B, higher" o={bump} stroke={C.focus} />
      <Req x1={215} x2={390} y={104} k={easeOut(seg(t, 1.2, 1.7))} label="epoch B write" f={C.focus} />
      <Cell x={400} y={90} w={150} label="accepted" o={easeOut(seg(t, 1.6, 1.9))} stroke={C.focus} />
      <Req x1={215} x2={lerp(215, 390, 0.75)} y={160} k={easeOut(seg(t, 2.4, 2.9))} label="epoch A write" f={C.cherryText} />
      <Cross x={360} y={160} k={easeOut(seg(t, 2.9, 3.2))} />
      <T x={400} y={165} s={12} f={C.cherryText} o={easeOut(seg(t, 3.1, 3.4))}>
        fenced, no merging
      </T>
    </Svg>
  );
}

// 4 · Predict. Four records in the log; the aborted one is still there. On answer two reader rows appear: one sees it,
// one doesn't.
export function PredictVisibility({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="an aborted transaction's records are still sitting right there in the log — does a reader see them?" h={200}>
      {REC.slice(0, 3).map(([r, st], i) => (
        <Cell key={r} x={25 + i * 180} y={40} w={170} label={r} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} stroke={st === 'aborted' ? C.cherryText : C.mocha} />
      ))}
      <T x={205} y={92} s={11} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))}>
        called off, still on disk
      </T>
      {v > 0 && (
        <T x={25} y={130} s={11} f={C.focus} o={v}>
          one mode shows it; the other screens it out
        </T>
      )}
      <AnswerRow y={180} label="a reader sees it?" answer={answer} value="depends on the mode" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Visibility. The four records; read_uncommitted lights all four; read_committed lights the two committed ones,
// stopping at the last stable offset, 3, a dashed line before the open record.
export function RevealVisibility({ t }: StepCtx) {
  return (
    <Svg label="read_uncommitted sees everything; read_committed filters by outcome, up to the last stable offset" h={200}>
      {REC.map(([r, st], i) => (
        <Cell
          key={r}
          x={25 + i * 135}
          y={30}
          w={127}
          label={r.replace('order-', '')}
          o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))}
          stroke={st === 'aborted' ? C.cherryText : st === 'open' ? C.second : C.mocha}
        />
      ))}
      <line x1={429} y1={22} x2={429} y2={170} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.6, 3.0))} />
      <T x={421} y={188} s={11} f={C.second} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        last stable offset: 3
      </T>
      {[0, 1].map((m) => {
        const y = 90 + m * 40;
        const k0 = 0.8 + m * 1.0;
        return (
          <g key={m}>
            {REC.map(([r, st], i) => {
              const show = m === 0 || st === 'ok';
              return show ? (
                <rect key={r} x={78 + i * 135} y={y} width={20} height={14} rx={2} fill={m === 0 ? C.latte : C.focus} opacity={easeOut(seg(t, k0 + i * 0.15, k0 + 0.3 + i * 0.15))} />
              ) : null;
            })}
          </g>
        );
      })}
      <T x={25} y={84} s={11} f={C.latte} o={easeOut(seg(t, 0.7, 1.0))}>
        read_uncommitted
      </T>
      <T x={25} y={124} s={11} f={C.focus} o={easeOut(seg(t, 1.7, 2.0))}>
        read_committed
      </T>
    </Svg>
  );
}

// 6 · Consume, transform, produce. The output writes and the input offset commit go into one transaction box together;
// the box commits, a lock closes on it.
export function RevealConsumeTransformProduce({ t }: StepCtx) {
  const lock = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="committing the input offset inside the same transaction as the output writes" h={200}>
      <rect x={180} y={30} width={370} height={120} rx={8} fill="none" stroke={lock > 0 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="6 4" opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={192} y={50} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        one transaction
      </T>
      <Cell x={25} y={75} w={130} label="read input" o={easeOut(seg(t, 0, 0.3))} />
      <Pip x1={160} y1={89} x2={200} y2={75} p={seg(t, 0.6, 1.0)} />
      <Cell x={200} y={60} w={160} label="output writes" o={easeOut(seg(t, 0.9, 1.2))} />
      <Pip x1={160} y1={89} x2={200} y2={112} p={seg(t, 1.4, 1.8)} f={C.second} />
      <Cell x={200} y={100} w={160} label="offset commit" o={easeOut(seg(t, 1.7, 2.0))} stroke={C.second} />
      <Lock x={520} y={50} k={lock} f={C.focus} />
      <T x={380} y={110} s={11} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        both land, or neither
      </T>
    </Svg>
  );
}

// 7 · Newer KIPs. A stuck transaction blocks the strict readers behind it until a server-side guard clears it; a
// dashed external system joins at the edge, named only.
export function RevealNewerKips({ t }: StepCtx) {
  const clear = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="a server-side defense against a stuck transaction, and a door opening to an external coordinator" h={200}>
      <Cell x={25} y={30} w={160} label="stuck transaction" o={easeOut(seg(t, 0, 0.3)) * (1 - 0.7 * clear)} stroke={C.cherryText} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={225 + i * 34} cy={44} r={9} fill={clear > 0 ? C.focus : C.mocha} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} />
      ))}
      <T x={210} y={78} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        strict readers, waiting
      </T>
      <Cross x={199} y={44} k={clear} />
      <T x={340} y={49} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        a server-side guard clears it
      </T>
      <Cell x={25} y={120} w={200} label="all-or-nothing step" o={easeOut(seg(t, 2.6, 2.9))} />
      <Hole x={350} y={120} w={200} o={easeOut(seg(t, 3.0, 3.3))} />
      <T x={450} y={139} s={11} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        an external system
      </T>
      <line x1={225} y1={134} x2={lerp(225, 345, easeOut(seg(t, 3.3, 3.8)))} y2={134} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" />
      <T x={25} y={185} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        named here, not run here
      </T>
    </Svg>
  );
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="zombie write" value="fenced off" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="read_committed" value="aborted hidden" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="read_uncommitted" value="aborted visible" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="last stable offset" value="3" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the offsets-in-the-write line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a transactional id survives a restart', 'read_committed filters by outcome', 'offsets ride inside the transaction'];
  return (
    <Svg label="a stable id, a coordinator, a visibility rule, and offsets committed inside the write itself" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
