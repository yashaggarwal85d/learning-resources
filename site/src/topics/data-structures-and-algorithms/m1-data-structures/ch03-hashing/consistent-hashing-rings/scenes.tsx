import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the ring, the joining machine);
// cinnamon = the compared alternative (virtual nodes, the bounded-loads extension); cherry = the
// one failure/cost frame (imbalance, the full resize). At most two accents per step.

function dot(cx: number, cy: number, r: number, colour = C.caramel, opacity = 1) {
  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

function ring(cx: number, cy: number, r: number, colour = C.latte) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={colour} strokeWidth={1.4} opacity={0.6} />;
}

// 1 · Opening: one machine's resize dissolving into a ring of machines
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A single machine's table resize, every key moving, dissolving into a ring of several machines" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: one table, one resize</T>
      {Array.from({ length: 6 }, (_, i) => fill(30 + i * 36, 50, 28, 22, C.cherry, 0.6 * (1 - a)))}
      <T x={30} y={230} s={13} f={C.caramel} o={a}>now: the same question, one level up</T>
      {ring(150, 250, 40, C.caramel)}
      {[0, 1, 2, 3].map((i) => dot(150 + 40 * Math.cos((i * Math.PI) / 2), 250 + 40 * Math.sin((i * Math.PI) / 2), 5, C.caramel, a))}
    </Svg>
  );
}

// 2 · Ring placement: keys and machines on the same ring, clockwise ownership
export function RingPlacement({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Both keys and machines hashed onto the same circular range, a key's dot connecting to the first machine found walking clockwise" h={320}>
      {ring(170, 150, 90, C.latte)}
      {[0, 1, 2, 3, 4].map((i) => dot(170 + 90 * Math.cos((i * 2 * Math.PI) / 5), 150 + 90 * Math.sin((i * 2 * Math.PI) / 5), 6, C.caramel))}
      {dot(170 + 90 * Math.cos(0.5), 150 + 90 * Math.sin(0.5), 4, C.cinnamon, a)}
      <T x={30} y={270} s={13} f={C.latte} o={a}>a key finds its machine, walking clockwise</T>
    </Svg>
  );
}

// 3 · Predict: how many keys move when a machine joins?
export function JoinPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A new machine's dot landing on the ring between two existing machines, asking how many keys actually move" h={320}>
      {ring(170, 140, 90, C.latte)}
      {[0, 1, 2, 3, 4].map((i) => dot(170 + 90 * Math.cos((i * 2 * Math.PI) / 5), 140 + 90 * Math.sin((i * 2 * Math.PI) / 5), 6, C.caramel))}
      {dot(170 + 90 * Math.cos(0.6), 140 + 90 * Math.sin(0.6), 7, C.cherry, 0.7 + 0.3 * Math.sin(t * 3))}
      {!answered && <T x={30} y={280} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={250} s={13} f={C.caramel}>only the arc to its clockwise neighbor</T>
          <T x={30} y={272} s={13} f={C.latte}>every other key stays exactly put</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Minimal remapping: only the short arc redrawn
export function MinimalRemapping({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The ring redrawn with only the short arc between the new machine and its clockwise neighbor highlighted as moved" h={320}>
      {ring(170, 140, 90, C.latte)}
      {[0, 1, 2, 3, 4].map((i) => dot(170 + 90 * Math.cos((i * 2 * Math.PI) / 5), 140 + 90 * Math.sin((i * 2 * Math.PI) / 5), 6, C.crema, 0.5))}
      {dot(170 + 90 * Math.cos(0.6), 140 + 90 * Math.sin(0.6), 7, C.caramel, 1)}
      <path d="M 220 100 A 90 90 0 0 1 170 50" fill="none" stroke={C.cherry} strokeWidth={3} opacity={a} />
      <T x={30} y={260} s={13} f={C.cherry} o={a}>only this short arc's keys move</T>
      <T x={30} y={282} s={13} f={C.latte} o={a}>every other machine, untouched</T>
    </Svg>
  );
}

// 5 · Imbalance problem: one point per machine, uneven shares
export function ImbalanceProblem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="A ring with machines each hashed to one point, a bar chart beneath showing wildly uneven key counts" h={320}>
      {ring(170, 110, 70, C.latte)}
      {[0.1, 1.2, 2.0, 3.5, 5.0].map((ang, i) => dot(170 + 70 * Math.cos(ang), 110 + 70 * Math.sin(ang), 6, C.caramel))}
      <T x={30} y={210} s={13} f={C.latte}>per-machine key count, one point each</T>
      {[0.9, 0.3, 0.6, 0.15, 0.4].map((h2, i) => fill(30 + i * 44, 310 - h2 * 80 * a, 32, h2 * 80 * a, C.cherry, Math.max(0.3, a)))}
    </Svg>
  );
}

// 6 · Predict: what fixes the imbalance?
export function VirtualNodesPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The same lopsided ring, asking what actually fixes one machine's unpredictable share" h={320}>
      {ring(170, 110, 70, C.latte)}
      {[0.1, 1.2, 2.0, 3.5, 5.0].map((ang, i) => dot(170 + 70 * Math.cos(ang), 110 + 70 * Math.sin(ang), i === 0 ? 9 : 6, i === 0 ? C.cherry : C.caramel, i === 0 ? 0.7 + 0.3 * Math.sin(t * 3) : 1))}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>hash it to many points instead of one</T>
          <T x={30} y={262} s={13} f={C.latte}>many small shares average out evenly</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Virtual nodes reveal: many points per machine, more even bars
export function VirtualNodesReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The same machines, each hashed to many points now, the bar chart beneath visibly more even, with a real cited count labeled" h={320}>
      {ring(170, 100, 60, C.latte)}
      {Array.from({ length: 20 }, (_, i) => dot(170 + 60 * Math.cos((i * 2 * Math.PI) / 20), 100 + 60 * Math.sin((i * 2 * Math.PI) / 20), 3, C.cinnamon, 0.8))}
      <T x={30} y={190} s={13} f={C.latte}>a real system's own count: many points per node</T>
      {[0.55, 0.5, 0.52, 0.48, 0.5].map((h2, i) => fill(30 + i * 44, 300 - h2 * 70 * a, 32, h2 * 70 * a, C.caramel, Math.max(0.3, a)))}
    </Svg>
  );
}

// 8 · Bounded loads: capping the worst machine, redirecting excess
export function BoundedLoads({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A ring under an adversarial key distribution, one machine's load capped and the excess redirected to its clockwise neighbor" h={320}>
      {ring(170, 110, 70, C.latte)}
      {[0.1, 1.2, 2.0, 3.5, 5.0].map((ang, i) => dot(170 + 70 * Math.cos(ang), 110 + 70 * Math.sin(ang), i === 0 ? 8 : 6, i === 0 ? C.cherry : C.caramel))}
      <path d="M 237 123 A 70 70 0 0 1 207 36" fill="none" stroke={C.cinnamon} strokeWidth={3} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={240} s={13} f={C.cinnamon} o={a}>excess redirected to the next machine</T>
      <T x={30} y={262} s={13} f={C.latte} o={a}>a guaranteed cap, even adversarially</T>
    </Svg>
  );
}

// 9 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Two measured bar pairs: the fraction of keys moved on a ring join vs. a full resize, and virtual nodes' evenness improvement" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>a ring join moves a small slice; a resize moves all</T>
      {fill(30, 36, 20 * a, 16, C.caramel, Math.max(0.3, a))}
      {fill(30, 56, 220, 16, C.cherry, 0.6)}
      <T x={30} y={120} s={13} f={C.crema}>one point per machine vs. many virtual points</T>
      {fill(30, 132, 150 * b, 16, C.cherry, Math.max(0.3, b))}
      {fill(30, 152, 95 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.latte}>both measured, on the same ring</T>
    </Svg>
  );
}
