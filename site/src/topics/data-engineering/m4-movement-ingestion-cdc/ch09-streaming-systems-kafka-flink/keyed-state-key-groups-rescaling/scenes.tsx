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

/** A recovery-time bar from x, drawn to width w by `k`. */
function RecBar({ x, y, w, k, f = C.second }: { x: number; y: number; w: number; k: number; f?: string }) {
  return <rect x={x} y={y} width={w * k} height={14} rx={3} fill={f} opacity={0.6} />;
}

// 0 · Hook. A worker holding a stack of state is struck. Its recovery bar fills to a length set by that stack. Then the
// job around it swaps from a short chain of steps to a long one, and the bar comes out the same length again.
export function Hook({ t }: StepCtx) {
  const bolt = easeOut(seg(t, 0.5, 0.8));
  const r1 = easeInOut(seg(t, 0.9, 2.0));
  const swap = easeOut(seg(t, 2.3, 2.7));
  const r2 = easeInOut(seg(t, 2.8, 3.9));
  return (
    <Svg label="one worker dies; recovery time tracks the state it held, not the job's shape" h={200}>
      <Cell x={25} y={30} w={110} label="worker" o={easeOut(seg(t, 0, 0.3))} stroke={bolt > 0 ? C.cherryText : C.mocha} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 17} y={66} width={14} height={14} rx={2} fill={C.second} opacity={easeOut(seg(t, 0.1, 0.4))} />
      ))}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        state it held
      </T>
      <Bolt x={150} y={44} k={bolt} />
      <T x={180} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        time to come back
      </T>
      <RecBar x={180} y={36} w={240} k={r1} />
      <T x={180} y={124} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        a far bigger job around it
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={180 + i * 26} y={134} width={20} height={14} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={swap} />
      ))}
      <RecBar x={180} y={160} w={240} k={r2} />
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        same state, same time; the job's size never mattered
      </T>
    </Svg>
  );
}

// 1 · Setup. A dashed snapshot frame draws, holding a question mark. It opens into rows of keys and their state, and an
// arrow points on from it: this is what makes resizing possible.
export function Setup({ t }: StepCtx) {
  const open = easeOut(seg(t, 1.4, 1.9));
  const keys = ['key A', 'key B', 'key C'];
  return (
    <Svg label="a snapshot was taken — but what is it actually a snapshot of?" h={200}>
      <Hole x={25} y={20} w={280} h={120} stroke={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <T x={37} y={38} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.4))}>
        a snapshot
      </T>
      {open < 1 && (
        <T x={165} y={90} s={20} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7)) * (1 - open)}>
          ?
        </T>
      )}
      {keys.map((k, i) => (
        <g key={k} opacity={easeOut(seg(t, 1.6 + i * 0.3, 1.9 + i * 0.3))}>
          <Cell x={40} y={48 + i * 30} w={110} h={24} label={k} />
          <rect x={160} y={52 + i * 30} width={60 + i * 25} height={16} rx={3} fill={C.second} opacity={0.6} />
        </g>
      ))}
      <Req x1={310} x2={400} y={80} k={easeOut(seg(t, 3.0, 3.5))} f={C.focus} />
      <Cell x={410} y={66} w={145} label="resizing" o={easeOut(seg(t, 3.4, 3.8))} stroke={C.focus} />
      <T x={25} y={176} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        state, piece by piece, by key
      </T>
    </Svg>
  );
}

/** Where key group g sits with n workers: worker g % n, row g / n. Columns span the drawing. */
function groupPos(g: number, n: number) {
  const cw = 530 / n;
  const w = g % n;
  const r = Math.floor(g / n);
  return { x: 25 + w * cw + 8, y: 58 + r * 24, w: cw - 16 };
}
const GROUPS = Array.from({ length: 12 }, (_, g) => g);

/** Worker columns for n workers. */
function Workers({ n, o = 1 }: { n: number; o?: number }) {
  const cw = 530 / n;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, w) => (
        <g key={w}>
          <rect x={25 + w * cw + 2} y={30} width={cw - 4} height={110} rx={6} fill="none" stroke={C.latte} strokeWidth={1.3} />
          <T x={25 + w * cw + cw / 2} y={48} s={11} f={C.latte} a="middle">
            worker
          </T>
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. Four workers holding blocks of keys; a resize arrow appears. On answer the verdict: whole groups move.
export function PredictRescaleUnit({ t, answer }: StepCtx) {
  return (
    <Svg label="a job rescales — what actually moves?" h={200}>
      <Workers n={4} o={easeOut(seg(t, 0, 0.3))} />
      {GROUPS.map((g) => {
        const p = groupPos(g, 4);
        return <rect key={g} x={p.x} y={p.y} width={p.w} height={18} rx={3} fill={C.second} opacity={0.6 * easeOut(seg(t, 0.2 + g * 0.04, 0.5 + g * 0.04))} />;
      })}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        resize: 4 workers to 6
      </T>
      <AnswerRow y={182} label="what moves" answer={answer} value="whole groups" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Key groups. Keys fall into a row of fixed group slots, each landing in exactly one. Then the slots are handed out
// to four workers, the groups, not the keys, going to each.
export function RevealKeyGroups({ t }: StepCtx) {
  const hand = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="every key hashes into a fixed key group, set once, independent of parallelism" h={200}>
      <Workers n={4} o={easeOut(seg(t, 3.3, 3.6))} />
      {GROUPS.map((g) => {
        const p = groupPos(g, 4);
        const sx = 25 + g * 44;
        const keysIn = easeOut(seg(t, 0.6 + g * 0.08, 0.9 + g * 0.08));
        return (
          <g key={g}>
            <rect x={lerp(sx, p.x, hand)} y={lerp(30, p.y, hand)} width={lerp(38, p.w, hand)} height={18} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0, 0.3))} />
            {hand === 0 && keysIn < 1 && <Pip x={sx + 19} y={lerp(4, 39, keysIn)} s={8} o={keysIn > 0 ? 1 : 0} f={C.second} />}
            <rect x={lerp(sx, p.x, hand) + 3} y={lerp(30, p.y, hand) + 3} width={(lerp(38, p.w, hand) - 6) * keysIn} height={12} rx={2} fill={C.second} opacity={0.6} />
          </g>
        );
      })}
      <T x={25} y={76} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9)) * (1 - hand)}>
        128 fixed groups, decided once
      </T>
      <T x={25} y={164} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
        groups are handed out, never single keys
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        the count of groups ignores how many workers exist
      </T>
    </Svg>
  );
}

// 4 · Rescale. Four worker columns become six. Every group block slides whole to its new worker; one block, holding its
// keys, is outlined as it travels. No block is ever cut in two. A tick: every key checks out.
export function RevealRescaleBlocks({ t }: StepCtx) {
  const cols = easeOut(seg(t, 0.4, 0.8));
  const mv = easeInOut(seg(t, 0.9, 2.6));
  return (
    <Svg label="rescaling slides whole key groups between instances, never splitting one" h={200}>
      <Workers n={4} o={1 - cols} />
      <Workers n={6} o={cols} />
      {GROUPS.map((g) => {
        const a = groupPos(g, 4);
        const b = groupPos(g, 6);
        return (
          <rect key={g} x={lerp(a.x, b.x, mv)} y={lerp(a.y, b.y, mv)} width={lerp(a.w, b.w, mv)} height={18} rx={3} fill={C.second} opacity={0.6} stroke={g === 5 ? C.focus : 'none'} strokeWidth={2} />
        );
      })}
      <T x={25} y={164} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        whole groups moved; none split in two
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        every key checked afterward: unchanged
      </T>
      <MiniTick x={376} y={184} k={easeOut(seg(t, 4.0, 4.3))} />
    </Svg>
  );
}

// 5 · Backends. Heap: a short access bar, cost 1 each, and a small memory box. RocksDB: an access bar six times as
// long, cost 6 each, and a far larger disk box. Quick and limited, or roomier and slower.
export function RevealBackends({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const b = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="heap state is fast and memory-bound; rocksdb is slower and disk-bound" h={200}>
      <T x={25} y={34} s={12} f={C.crema} o={a}>
        heap
      </T>
      <rect x={110} y={24} width={40 * easeInOut(seg(t, 0.4, 0.8))} height={14} rx={3} fill={C.focus} opacity={0.6} />
      <T x={160} y={36} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        cost 1 per access
      </T>
      <rect x={380} y={20} width={50} height={36} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={440} y={42} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        memory
      </T>
      <T x={25} y={104} s={12} f={C.crema} o={b}>
        rocksdb
      </T>
      <rect x={110} y={94} width={240 * easeInOut(seg(t, 1.8, 2.6))} height={14} rx={3} fill={C.second} opacity={0.6} />
      <T x={110} y={128} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        cost 6 per access
      </T>
      <rect x={380} y={78} width={170} height={70} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.8, 3.2))} />
      <T x={392} y={98} s={11} f={C.second} o={easeOut(seg(t, 2.8, 3.2))}>
        disk
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        quick and limited, or roomier and slower
      </T>
    </Svg>
  );
}

/** A job drawn as a chain of n small step boxes from x at y. */
function Chain({ x, y, n, o = 1 }: { x: number; y: number; n: number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 22} y={y} width={16} height={14} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} />
      ))}
    </g>
  );
}

// 6 · Predict. A simple job and a far busier one, each losing the same worker to a bolt. On answer both recovery bars
// fill to the same length.
export function PredictRecoveryDriver({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  return (
    <Svg label="does a more complex job take longer to recover?" h={200}>
      <T x={25} y={36} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        simple
      </T>
      <Chain x={110} y={26} n={1} o={easeOut(seg(t, 0, 0.3))} />
      <T x={25} y={86} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        elaborate
      </T>
      <Chain x={110} y={76} n={14} o={easeOut(seg(t, 0.3, 0.6))} />
      <Bolt x={150} y={33} k={easeOut(seg(t, 0.8, 1.1))} />
      <Bolt x={430} y={83} k={easeOut(seg(t, 0.8, 1.1))} />
      <RecBar x={110} y={44} w={200} k={v} />
      <RecBar x={110} y={94} w={200} k={v} />
      <AnswerRow y={170} label="the busier job" answer={answer} value="no slower" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Recovery. One operator and 40 operators: the same worker lost, and the two recovery bars run to the same mark,
// the line between them dead level. A lighter worker below recovers sooner.
export function RevealRecoveryDriver({ t }: StepCtx) {
  const k = easeInOut(seg(t, 0.6, 2.0));
  const l = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="recovery time tracks the failed instance's state, nothing about the job itself" h={200}>
      <T x={25} y={40} s={11} f={C.latte}>
        1 operator
      </T>
      <RecBar x={150} y={30} w={300} k={k} />
      <T x={25} y={80} s={11} f={C.latte}>
        40 operators
      </T>
      <RecBar x={150} y={70} w={300} k={k} />
      <line x1={450} y1={22} x2={450} y2={92} stroke={C.focus} strokeWidth={1.6} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.0, 2.3))} />
      <T x={460} y={62} s={11} f={C.focus} o={easeOut(seg(t, 2.1, 2.4))}>
        identical
      </T>
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        a lighter worker
      </T>
      <RecBar x={150} y={120} w={170} k={l} f={C.focus} />
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        only the state held decides it
      </T>
    </Svg>
  );
}

// 8 · TTL and schema. Three state entries, each with an idle clock; two are touched and reset, one sits untouched until
// its clock runs out and it clears away on its own. Below, a shape change: adding a field passes, changing a type does
// not.
export function RevealTtlSchema({ t }: StepCtx) {
  const names = ['key A', 'key B', 'key C'];
  const exp = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="idle state expires on its own; a changed schema follows real, narrow rules" h={200}>
      {names.map((n, i) => {
        const touched = i !== 1;
        const clock = touched ? ((t * 0.7 + i * 0.3) % 1) * 0.6 : easeInOut(seg(t, 0.2, 2.0));
        const o = i === 1 ? 1 - exp : 1;
        return (
          <g key={n} opacity={o * easeOut(seg(t, 0, 0.3))}>
            <Cell x={25} y={16 + i * 32} w={100} h={24} label={n} stroke={i === 1 && clock > 0.9 ? C.cherryText : C.mocha} />
            <rect x={140} y={22 + i * 32} width={160} height={12} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.1} />
            <rect x={141} y={23 + i * 32} width={158 * clock} height={10} rx={2} fill={i === 1 ? C.cherryText : C.latte} opacity={0.6} />
          </g>
        );
      })}
      {exp > 0 && (
        <T x={320} y={64} s={11} f={C.cherryText} o={exp}>
          idle too long: cleared
        </T>
      )}
      <T x={320} y={84} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        on its own, best effort
      </T>
      <Cell x={25} y={130} w={220} label="add a field" o={easeOut(seg(t, 3.0, 3.3))} stroke={C.focus} />
      <MiniTick x={256} y={144} k={easeOut(seg(t, 3.3, 3.6))} />
      <Cell x={300} y={130} w={220} label="change a field's type" o={easeOut(seg(t, 3.6, 3.9))} stroke={C.cherryText} />
      <Cross x={538} y={144} k={easeOut(seg(t, 3.9, 4.2))} />
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 4.1, 4.4))}>
        a narrow, spelled-out set of moves
      </T>
    </Svg>
  );
}

// 9 · Version break. An old savepoint heads for a newer version. The official list of supported carry-overs draws in
// row by row; the newest jump's row is a dashed slot, missing. Underneath: the reason, a serializer rewrite.
export function RevealVersionBreak({ t }: StepCtx) {
  const rows = ['an older jump', 'another older jump', 'the newest jump'];
  return (
    <Svg label="flink's own docs don't cover restoring a two-oh job from an old savepoint" h={200}>
      <Cell x={25} y={20} w={150} label="old savepoint" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={180} x2={330} y={34} k={easeOut(seg(t, 0.3, 1.0))} />
      <Cell x={340} y={20} w={150} label="newest version" o={easeOut(seg(t, 0.8, 1.1))} stroke={C.focus} />
      <T x={25} y={80} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        officially supported:
      </T>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 1.5 + i * 0.4, 1.8 + i * 0.4));
        return i < 2 ? (
          <g key={r}>
            <Cell x={200} y={66 + i * 32} w={220} h={24} label={r} o={k} />
            <MiniTick x={430} y={78 + i * 32} k={k} />
          </g>
        ) : (
          <g key={r}>
            <Hole x={200} y={130} w={220} h={24} o={k} stroke={C.cherryText} />
            <T x={310} y={146} s={11} f={C.cherryText} a="middle" o={k}>
              {r}: not listed
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        the reason: a rewrite of how state is encoded
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="128 groups, 4 to 6" value="whole groups moved" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="groups split" value="none" k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="1 vs 40 operators" value="same recovery" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="lighter worker" value="back sooner" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="cost per access" value="heap 1, rocksdb 6" k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="capacity" value="disk beats memory" k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the fixed-groups line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a fixed number of groups, decided once', 'resizing slides whole groups, never splits one', 'speed or room; a big jump breaks old state'];
  return (
    <Svg label="a fixed group, a block that moves, a backend trade, a version that breaks" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 0 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
