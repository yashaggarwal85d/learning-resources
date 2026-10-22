import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the surviving/current element; cinnamon = an eliminated
// or compared element; taupe/latte = axes, quiet labels; crema = records. At most two accents per
// step. Bars = a log's status codes, per the chapter's visual idea.

const BARS = [5, 3, 4, 2, 6];
const WIN = [1, 3, -1, -3, 5];

function bar(x: number, baseY: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${baseY}`} x={x} y={baseY - h} width={28} height={h} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

function arrow(x1: number, y1: number, x2: number, y2: number, colour: string, opacity = 1) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tx = -ux * 8 - uy * 5;
  const ty = -uy * 8 + ux * 5;
  const tx2 = -ux * 8 + uy * 5;
  const ty2 = -uy * 8 - ux * 5;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.6} />
      <line x1={x2} y1={y2} x2={x2 + tx} y2={y2 + ty} stroke={colour} strokeWidth={1.6} />
      <line x1={x2} y1={y2} x2={x2 + tx2} y2={y2 + ty2} stroke={colour} strokeWidth={1.6} />
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="A row of bars, used one at a time, with an invariant about to be imposed on them" h={260}>
      {BARS.map((v, i) => bar(30 + i * 40, 220, v * 20, C.crema))}
      <T x={30} y={250} s={13} f={C.latte} o={a}>one operation at a time &rarr; one invariant, kept always</T>
    </Svg>
  );
}

// 2 · The problem: next-greater-element, naive scan is O(n^2)
export function Problem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="For bar 2, scanning right to find a taller bar; a strictly decreasing run never finds one" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>next-greater-element: the next taller bar to the right</T>
      {[5, 4, 3, 2, 1].map((v, i) => bar(30 + i * 40, 240, v * 24, i === 0 ? C.caramel : C.crema))}
      <T x={30} y={100} s={12} f={C.cinnamon} o={a}>scan right from here &mdash; nothing is ever taller</T>
      <T x={30} y={260} s={13} f={C.latte}>strictly decreasing: &Theta;(n&sup2;) comparisons, naively</T>
    </Svg>
  );
}

// 3 · The invariant: keep the stack decreasing, pop before push
export function Invariant({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 0.2, 1.8) * 3) + 1);
  const stack = [5, 4, 2].slice(0, n);
  return (
    <Svg label="A stack kept monotonically decreasing, bottom to top; each new bar pops anything shorter first" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>keep the stack decreasing, bottom to top</T>
      {stack.map((v, i) => bar(30 + i * 40, 240, v * 24, i === stack.length - 1 ? C.caramel : C.crema))}
      <T x={30} y={260} s={13} f={C.latte}>pop everything shorter before each push</T>
    </Svg>
  );
}

// 4 · Predict: stack right before 6 is pushed
export function StackPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Scanning 5, 3, 4, 2, 6 left to right; the stack just before 6 arrives" h={280}>
      {!answered && (
        <>
          {BARS.slice(0, 4).map((v, i) => bar(30 + i * 40, 220, v * 20, C.crema))}
          <T x={30} y={250} s={18} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>stack, right before 6 is pushed?</T>
        </>
      )}
      {answered && (
        <>
          {[5, 4, 2].map((v, i) => bar(30 + i * 40, 220, v * 20, C.caramel))}
          <T x={190} y={200} s={13} f={C.cinnamon}>3 already popped &mdash; found its answer: 4</T>
          <T x={30} y={250} s={14} f={C.caramel}>5, 4, 2 still waiting, bottom to top</T>
        </>
      )}
    </Svg>
  );
}

// 5 · Why O(n): every bar pushed once, popped at most once
export function WhyLinear({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Each bar enters the stack once and leaves at most once; total work is linear in the number of bars" h={280}>
      <T x={30} y={28} s={13} f={C.caramel} serif>pushed once</T>
      <T x={250} y={28} s={13} f={C.cinnamon} serif>popped at most once</T>
      {BARS.map((v, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15))}>
          {bar(30 + i * 40, 220, v * 20, C.crema)}
        </g>
      ))}
      <T x={30} y={250} s={13} f={C.latte} o={a}>total push + pop work &le; 2n &mdash; O(n), not O(n&sup2;)</T>
    </Svg>
  );
}

// 6 · Sliding-window maximum, the problem
export function WindowProblem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A fixed-width window sliding over the bars, each new position rescanned from scratch under the naive method" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>width-3 window, sliding right, naively rescanned each time</T>
      {WIN.map((v, i) => bar(30 + i * 40, 220, (v + 5) * 14, i >= 1 && i <= 3 ? C.caramel : C.crema))}
      <T x={30} y={250} s={13} f={C.latte} o={a}>rescan each window: O(N&middot;k) &mdash; most of it repeats work</T>
    </Svg>
  );
}

// 7 · The monotonic deque
export function MonotonicDeque({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="A deque kept decreasing front to back; the front is dropped once its index ages out, the back once a taller bar arrives" h={280}>
      <T x={30} y={28} s={13} f={C.caramel}>front: drop once aged out of the window</T>
      <T x={30} y={46} s={13} f={C.cinnamon}>back: drop once smaller than the new bar</T>
      {[5, 3, 6].map((v, i) => bar(30 + i * 60, 240, (v + 5) * 16, i === 0 ? C.caramel : i === 2 ? C.cinnamon : C.crema, i === 1 ? 0.3 + 0.7 * (1 - a) : 1))}
      <T x={30} y={260} s={13} f={C.latte}>front is always the current window's maximum</T>
    </Svg>
  );
}

// 8 · Predict: deque once window reaches [-1, -3, 5]
export function DequePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Window width 3 over 1, 3, -1, -3, 5; what the deque holds once the window first covers -1, -3, 5" h={280}>
      {!answered && (
        <>
          {WIN.map((v, i) => bar(30 + i * 40, 220, (v + 5) * 16, i >= 2 ? C.caramel : C.crema))}
          <T x={30} y={250} s={16} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>deque, once the window covers [-1, -3, 5]?</T>
        </>
      )}
      {answered && (
        <>
          {bar(30 + 4 * 40, 220, 10 * 16, C.caramel)}
          <T x={30} y={250} s={14} f={C.caramel}>just 5 &mdash; it outranked -1, -3 and 3 the moment it arrived</T>
        </>
      )}
    </Svg>
  );
}

// 9 · The two idioms compared
export function Compared({ t }: StepCtx) {
  const rows = [
    { name: 'Chapter 1', note1: 'amortized over a resize schedule,', note2: 'fixed in advance', colour: C.cinnamon },
    { name: 'This chapter', note1: 'amortized over an invariant,', note2: 'enforced every operation', colour: C.caramel },
  ];
  return (
    <Svg label="Two amortization idioms: a resize schedule set in advance, versus an invariant enforced on every operation" h={300}>
      {rows.map((r, i) => (
        <g key={r.name} opacity={easeOut(seg(t, 0.2 + i * 0.4, 1 + i * 0.4))}>
          <T x={30} y={60 + i * 90} s={15} f={r.colour} serif>{r.name}</T>
          <T x={30} y={80 + i * 90} s={13} f={C.crema}>{r.note1}</T>
          <T x={30} y={98 + i * 90} s={13} f={C.crema}>{r.note2}</T>
        </g>
      ))}
      <T x={30} y={260} s={13} f={C.latte}>same aggregate method &mdash; a different thing being bounded</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Push and pop counts staying under 2n from a hundred to a hundred thousand elements" h={280}>
      <T x={30} y={40} s={14} f={C.caramel} serif>push + pop work</T>
      <T x={30} y={60} s={13} f={C.crema}>stays &le; 2n from n = 100 to n = 100,000</T>
      <rect x={30} y={70} width={60} height={24} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={140} s={14} f={C.cinnamon} serif>brute force, same inputs</T>
      <T x={30} y={160} s={13} f={C.crema}>comparisons scale with window width and n</T>
      <rect x={30} y={170} width={420} height={24} fill={C.cinnamon} opacity={0.3 * easeOut(seg(t, 0.6, 1.8))} />
      <T x={30} y={230} s={13} f={C.latte}>same answers as brute force, every time &mdash;</T>
      <T x={30} y={248} s={13} f={C.latte}>not just claimed, measured</T>
    </Svg>
  );
}
