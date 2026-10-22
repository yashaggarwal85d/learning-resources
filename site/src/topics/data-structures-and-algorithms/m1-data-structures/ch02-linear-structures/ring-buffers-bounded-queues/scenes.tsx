import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = head/tail markers, the mechanism in focus; cinnamon = the
// compared alternative; cherry = the one overrun/failure frame; taupe/latte = axes, quiet labels.

const CX = 220;
const CY = 150;
const R = 100;
const SLOTS = 16;

function slotPos(i: number) {
  const angle = (i / SLOTS) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
}

function ring(filled: Set<number>, headIdx: number, tailIdx: number, opacity = 1) {
  const slots = Array.from({ length: SLOTS }, (_, i) => {
    const { x, y } = slotPos(i);
    return <circle key={i} cx={x} cy={y} r={11} fill="none" stroke={filled.has(i) ? C.crema : C.taupe} strokeWidth={1.4} opacity={opacity} />;
  });
  const head = slotPos(headIdx);
  const tail = slotPos(tailIdx);
  return (
    <g opacity={opacity}>
      {slots}
      <circle cx={head.x} cy={head.y} r={15} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      <circle cx={tail.x} cy={tail.y} r={15} fill="none" stroke={C.cinnamon} strokeWidth={1.8} />
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="A circle of fixed slots that never grows, unlike a dynamic array" h={320}>
      {ring(new Set([0, 1, 2]), 0, 3)}
      <T x={30} y={290} s={13} f={C.latte} o={a}>fixed capacity &mdash; it never grows, by design</T>
    </Svg>
  );
}

// 2 · The mechanism
export function Mechanism({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Head and tail markers advancing around the fixed ring as pushes and pops happen" h={320}>
      {ring(new Set([0, 1, 2, 3, 4]), 0, 5, 0.5 + 0.5 * a)}
      <T x={30} y={28} s={13} f={C.caramel}>head: next read</T>
      <T x={330} y={28} s={13} f={C.cinnamon}>tail: next write</T>
      <T x={30} y={290} s={13} f={C.latte}>both wrap around the same fixed array</T>
    </Svg>
  );
}

// 3 · The real cost of wrap-around
export function RealCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Modulo by a non-power-of-two capacity is a division; a power-of-two capacity turns the same wrap into one bitwise AND" h={280}>
      <T x={30} y={40} s={14} f={C.cinnamon} serif>index modulo capacity</T>
      <T x={30} y={60} s={13} f={C.crema}>a division &mdash; dozens of cycles</T>
      <rect x={30} y={70} width={340} height={24} fill={C.cinnamon} opacity={0.3 * a} />
      <T x={30} y={140} s={14} f={C.caramel} serif>index AND (capacity minus one)</T>
      <T x={30} y={160} s={13} f={C.crema}>one bitwise op &mdash; about one cycle</T>
      <rect x={30} y={170} width={40} height={24} fill={C.caramel} opacity={0.3 * easeOut(seg(t, 0.6, 1.8))} />
      <T x={30} y={230} s={13} f={C.latte}>only works when capacity is a power of two</T>
    </Svg>
  );
}

// 4 · Predict: next index
export function IndexPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Capacity sixteen, tail at index eleven, five pushes land; the tail wraps back to zero" h={320}>
      {!answered && (
        <>
          {ring(new Set(Array.from({ length: 11 }, (_, i) => i)), 0, 11)}
          <T x={30} y={290} s={16} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>five more pushes &mdash; new tail index?</T>
        </>
      )}
      {answered && (
        <>
          {ring(new Set(Array.from({ length: 16 }, (_, i) => i)), 0, 0)}
          <T x={30} y={290} s={14} f={C.caramel}>sixteen AND fifteen = zero &mdash; one bitwise op</T>
        </>
      )}
    </Svg>
  );
}

// 5 · The ambiguity
export function Ambiguity({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Head and tail at the same slot — this could mean the ring is empty, or that it is completely full" h={340}>
      {ring(new Set(Array.from({ length: 8 }, (_, i) => i)), 4, 4, 0.5 + 0.5 * a)}
      <T x={30} y={290} s={13} f={C.caramel}>head == tail: empty, or full?</T>
      <T x={30} y={312} s={13} f={C.caramel}>masked indices alone can't say</T>
    </Svg>
  );
}

// 6 · The fix this topic builds
export function TheFix({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Unmasked in/out counters keep climbing forever; masking happens only when they index into the array" h={320}>
      <T x={30} y={30} s={13} f={C.caramel}>in, out: unmasked, always increasing</T>
      <T x={30} y={48} s={13} f={C.cinnamon}>in &amp; mask, out &amp; mask: only at array access</T>
      <rect x={30} y={70} width={400} height={20} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <rect x={30} y={100} width={90} height={20} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={a} />
      <T x={30} y={150} s={13} f={C.latte}>length = in minus out</T>
      <T x={30} y={168} s={13} f={C.latte}>empty = in == out; full = length &gt; mask</T>
      <T x={30} y={198} s={13} f={C.crema}>alternatives: sacrifice one slot,</T>
      <T x={30} y={216} s={13} f={C.crema}>or keep an explicit count</T>
    </Svg>
  );
}

// 7 · What happens when it's full
export function FullPolicy({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="A full ring facing one more push: overwrite the oldest entry, or block until a slot opens" h={320}>
      <T x={30} y={40} s={14} f={C.caramel} serif>overwrite</T>
      <T x={30} y={60} s={13} f={C.crema}>drop the oldest, keep going</T>
      <rect x={30} y={70} width={200} height={20} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={130} s={14} f={C.cinnamon} serif>block</T>
      <T x={30} y={150} s={13} f={C.crema}>wait for a slot to open</T>
      <rect x={30} y={160} width={200} height={20} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={a} />
      <T x={30} y={250} s={13} f={C.latte}>orthogonal to the full/empty mechanism underneath</T>
    </Svg>
  );
}

// 8 · Predict: overwrite or block
export function PolicyPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A metrics ring at capacity facing one more push, under overwrite vs block" h={300}>
      {!answered && (
        <>
          {ring(new Set(Array.from({ length: 16 }, (_, i) => i)), 0, 0)}
          <T x={30} y={290} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>one more push arrives &mdash; overwrite, or block?</T>
        </>
      )}
      {answered && (
        <>
          {ring(new Set(Array.from({ length: 16 }, (_, i) => i)), 1, 1)}
          <T x={30} y={290} s={13} f={C.caramel}>overwrite: oldest dropped, tail moves on</T>
        </>
      )}
    </Svg>
  );
}

// 9 · Boundedness as backpressure
export function Backpressure({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A full bounded channel makes the producer wait, instead of growing without limit the way an unbounded array would" h={280}>
      <T x={30} y={40} s={14} f={C.caramel} serif>bounded, block policy</T>
      <T x={30} y={60} s={13} f={C.crema}>producer waits for the consumer</T>
      <rect x={30} y={70} width={120} height={20} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={30} y={140} s={14} f={C.cinnamon} serif>unbounded array</T>
      <T x={30} y={160} s={13} f={C.crema}>just keeps growing, never slows the producer</T>
      <rect x={30} y={170} width={420} height={20} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={easeOut(seg(t, 0.6, 1.8))} />
      <T x={30} y={230} s={13} f={C.latte}>boundedness is what makes backpressure possible at all</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A real C microbenchmark showing modulo costing measurably more than masking, at several capacities" h={280}>
      <T x={30} y={40} s={14} f={C.caramel} serif>masking</T>
      <T x={30} y={60} s={13} f={C.crema}>capacity passed in at run time</T>
      <rect x={30} y={70} width={70} height={24} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={140} s={14} f={C.cinnamon} serif>modulo</T>
      <T x={30} y={160} s={13} f={C.crema}>same capacities, same values</T>
      <rect x={30} y={170} width={110} height={24} fill={C.cinnamon} opacity={0.3 * easeOut(seg(t, 0.6, 1.8))} />
      <T x={30} y={230} s={13} f={C.latte}>modulo measurably costs more, every capacity tried</T>
    </Svg>
  );
}
