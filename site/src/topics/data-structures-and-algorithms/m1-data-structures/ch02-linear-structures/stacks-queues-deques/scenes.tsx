import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the structure/end this step is about; cinnamon = the
// compared alternative (the other implementation, or the other end); taupe/latte = axes, quiet
// labels; crema = records. At most two accents per step.

function cell(x: number, y: number, w: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={w} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

// 1 · Which end may you touch?
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="A row of records with a question mark over which ends may be touched" h={260}>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 34, 60, 28))}
      <T x={40} y={120} s={14} f={C.caramel} o={a}>&larr;</T>
      <T x={214} y={120} s={14} f={C.caramel} o={a}>&rarr;</T>
      <T x={300} y={180} s={16} f={C.caramel} a="middle">which end may you touch?</T>
    </Svg>
  );
}

// 2 · LIFO: last in, first out.
export function Stack({ t }: StepCtx) {
  const n = Math.min(5, Math.floor(seg(t, 0.2, 1.6) * 5) + 1);
  return (
    <Svg label="A vertical pile of records, growing and shrinking only from the top — an undo history" h={300}>
      <T x={30} y={28} s={13} f={C.taupe}>undo history: push/pop at the top only</T>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={60} y={240 - i * 32} width={160} height={26} rx={3} fill="none" stroke={i === n - 1 ? C.caramel : C.crema} strokeWidth={1.4} />
      ))}
      <T x={240} y={240 - (n - 1) * 32 + 18} s={13} f={C.caramel}>&larr; most recent</T>
      <T x={30} y={270} s={13} f={C.latte}>last in, first out</T>
    </Svg>
  );
}

// 3 · FIFO: first in, first out.
export function Queue({ t }: StepCtx) {
  const shift = easeOut(seg(t, 0.4, 1.8));
  return (
    <Svg label="Records entering one end of a row and leaving the other — a task queue" h={260}>
      <T x={30} y={28} s={13} f={C.taupe}>task queue: enqueue here</T>
      <T x={430} y={28} s={13} f={C.caramel}>dequeue here</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 34 + shift * 10, 60, 28, i === 0 ? C.caramel : C.crema))}
      <T x={30} y={130} s={13} f={C.latte}>first in, first out</T>
    </Svg>
  );
}

// 4 · Predict: does a deque need two separate structures?
export function DequePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A row with both ends highlighted, asking whether supporting both takes one structure or two" h={260}>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 34, 60, 28, i === 0 || i === 5 ? C.caramel : C.crema))}
      <T x={40} y={120} s={14} f={C.caramel}>push/pop</T>
      <T x={250} y={120} s={14} f={C.caramel}>push/pop</T>
      {!answered && <T x={300} y={190} s={20} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>one structure, or two?</T>}
      {answered && <T x={300} y={190} s={15} f={C.caramel} a="middle">one structure, O(1) at both ends</T>}
    </Svg>
  );
}

// 5 · The deque: both ends, O(1).
export function Deque({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A row with both ends lit at once, each supporting push and pop" h={260}>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 34, 60, 28, C.caramel, 0.4 + 0.6 * a))}
      <T x={30} y={130} s={13} f={C.caramel}>push/pop front</T>
      <T x={370} y={130} s={13} f={C.caramel}>push/pop back</T>
      <T x={30} y={190} s={13} f={C.latte}>both O(1), directly — not two structures composed</T>
    </Svg>
  );
}

// 6 · Two real designs, two trade-offs.
export function TwoDesigns({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="A ring buffer that resizes like a vector, beside a chunked deque that grows by adding a block" h={300}>
      <T x={30} y={30} s={14} f={C.caramel} serif>ring buffer (Rust's VecDeque)</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 30, 44, 24, C.caramel, a))}
      <T x={30} y={110} s={13} f={C.latte}>resizes by reallocating, like a vector</T>
      <T x={30} y={160} s={14} f={C.cinnamon} serif>chunked (std::deque)</T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={30 + i * 70} y={174} width={56} height={26} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={b} />
      ))}
      <rect x={30 + 3 * 70} y={174} width={56} height={26} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={Math.max(0, easeOut(seg(t, 1.3, 2)))} />
      <T x={30} y={240} s={13} f={C.latte}>grows by adding a block; nothing already there moves</T>
    </Svg>
  );
}

// 7 · Predict: does pushing onto a deque's front move anything?
export function InvalidatePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A deque with an iterator and a reference into it, before a push_front" h={260}>
      {Array.from({ length: 5 }, (_, i) => cell(60 + i * 30, 60, 24))}
      <T x={60} y={50} s={12} f={C.caramel}>iterator here</T>
      <T x={200} y={120} s={12} f={C.latte}>reference here</T>
      {!answered && <T x={300} y={190} s={20} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>push_front(): what survives?</T>}
      {answered && <T x={300} y={190} s={14} f={C.caramel} a="middle">iterator invalid, reference still good</T>}
    </Svg>
  );
}

// 8 · Back to the problem.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { name: 'Stack', note: 'one end, LIFO', colour: C.caramel },
    { name: 'Queue', note: 'two ends, one each, FIFO', colour: C.caramel },
    { name: 'Deque', note: 'both ends, either order, O(1)', colour: C.caramel },
  ];
  return (
    <Svg label="Stack, queue and deque as increasing access at the ends, with the two real deque designs' trade-off" h={280}>
      {rows.map((r, i) => (
        <g key={r.name} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3))}>
          <T x={30} y={40 + i * 46} s={15} f={r.colour} serif>{r.name}</T>
          <T x={140} y={40 + i * 46} s={13} f={C.crema}>{r.note}</T>
        </g>
      ))}
      <T x={30} y={220} s={13} f={C.latte}>ring buffer vs chunked blocks:</T>
      <T x={30} y={238} s={13} f={C.latte}>resize cost vs iterator stability</T>
    </Svg>
  );
}

// 9 · Prove it.
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A real deque's push/pop cost staying flat from ten to ten thousand elements, against a list's cost scaling with size" h={280}>
      <T x={30} y={40} s={14} f={C.caramel} serif>deque (ring buffer)</T>
      <T x={30} y={60} s={13} f={C.crema}>same cost at n = 10 and n = 10,000</T>
      <rect x={30} y={70} width={40} height={24} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={140} s={14} f={C.cinnamon} serif>plain list, pop(0)</T>
      <T x={30} y={160} s={13} f={C.crema}>9 shifts at n = 10; 9,999 at n = 10,000</T>
      <rect x={30} y={170} width={480} height={24} fill={C.cinnamon} opacity={0.3 * easeOut(seg(t, 0.6, 1.8))} />
      <T x={30} y={230} s={13} f={C.latte}>O(1) at both ends is a real, measured property,</T>
      <T x={30} y={248} s={13} f={C.latte}>not just a label</T>
    </Svg>
  );
}
