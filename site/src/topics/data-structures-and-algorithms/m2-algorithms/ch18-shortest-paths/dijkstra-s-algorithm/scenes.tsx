import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = an unsettled vertex; latte = secondary
// labels (a distance estimate); taupe = a vertex already settled; caramel = the thing to
// look at this beat (the vertex just settled, the edge being relaxed, the queue itself);
// cherry/cherryText = the bad outcome (a negative edge breaking the guarantee). This
// topic's own graph (examples.py, WEIGHTED_ADJ): 0->1(4), 0->2(1), 1->3(1), 2->1(2),
// 2->3(5), 3->4(3).

const POS: Record<number, readonly [number, number]> = {
  0: [90, 130],
  1: [250, 50],
  2: [250, 210],
  3: [410, 130],
  4: [560, 130],
};
const EDGES: [number, number, number][] = [[0, 1, 4], [0, 2, 1], [1, 3, 1], [2, 1, 2], [2, 3, 5], [3, 4, 3]];

function Node({ i, fill, label, o = 1 }: { i: number; fill: string; label?: string; o?: number }) {
  const [x, y] = POS[i];
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={16} fill={C.band} stroke={fill} strokeWidth={2.5} />
      <T x={x} y={y + 5} s={13} f={fill} a="middle">{String(i)}</T>
      {label && <T x={x} y={y - 24} s={11} f={C.latte} a="middle">{label}</T>}
    </g>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill={C.quiet} />
      </marker>
    </defs>
  );
}

function Edge({ a, b, w, color = C.line }: { a: number; b: number; w: string; color?: string }) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ex = x2 - (dx / len) * 18, ey = y2 - (dy / len) * 18;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <T x={mx} y={my - 8} s={11} f={C.latte} a="middle">{w}</T>
    </g>
  );
}

// 1 · Opening: a weighted graph, distances unknown.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A weighted graph with more than one path between some pairs of vertices" h={280}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} w="" />)}
      {[0, 1, 2, 3, 4].map((v) => <Node key={v} i={v} fill={C.crema} />)}
      <T x={320} y={260} s={13} f={C.latte} a="middle" o={a}>never reconsider a vertex once its fastest time is known</T>
    </Svg>
  );
}

// 2 · PredictNegative.
export function PredictNegative({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A graph with one negative-weight edge, asking whether the algorithm still finds the correct shortest distances" h={240}>
      <ArrowDefs />
      <Edge a={0} b={1} w="" />
      <Edge a={0} b={2} w="" />
      <Edge a={2} b={1} w="" color={C.cherryText} />
      <Node i={0} fill={C.crema} />
      <Node i={1} fill={C.crema} />
      <Node i={2} fill={C.crema} />
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>still correct, or broken by the one negative edge?</T>
      {answer !== null && <T x={300} y={220} s={14} f={C.cherryText} a="middle">broken — a vertex gets finalized too early</T>}
    </Svg>
  );
}

// 3 · DijkstraMechanism: settling vertices one at a time, distances updating live.
export function DijkstraMechanism({ t }: StepCtx) {
  const step = Math.min(5, Math.floor(easeOut(seg(t, 0.3, 2.8)) * 5.3));
  const settleOrder = [0, 2, 1, 3, 4];
  const distances = [0, 3, 1, 4, 7];
  const settled = new Set(settleOrder.slice(0, step));
  return (
    <Svg label="The priority queue popping the next-closest vertex each round, settling it, and relaxing its outgoing edges" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y, w], i) => <Edge key={i} a={x} b={y} w="" />)}
      {[0, 1, 2, 3, 4].map((v) => {
        const isSettled = settled.has(v);
        const justNow = settleOrder[step - 1] === v;
        return <Node key={v} i={v} fill={isSettled ? (justNow ? C.caramel : C.taupe) : C.crema} label={isSettled ? `dist=${distances[v]}` : undefined} />;
      })}
      <T x={320} y={275} s={13} f={C.latte} a="middle">pop the closest unsettled vertex, relax its edges, repeat</T>
    </Svg>
  );
}

// 4 · NegativeFailure: the exact counterexample, a vertex settled wrong.
export function NegativeFailure({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The exact counterexample graph where a negative edge makes the greedy choice wrong" h={260}>
      <ArrowDefs />
      <Edge a={0} b={1} w="" />
      <Edge a={0} b={2} w="" />
      <Edge a={2} b={1} w="" color={C.cherryText} />
      <Node i={0} fill={C.crema} />
      <Node i={1} fill={C.cherryText} label="settled wrong" />
      <Node i={2} fill={C.crema} />
      <T x={300} y={220} s={13} f={C.latte} a="middle" o={a}>the shorter path through the negative edge arrives too late</T>
    </Svg>
  );
}

// 5 · LazyVsDecreaseKey.
export function LazyVsDecreaseKey({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Lazy deletion's own duplicate queue entries against decrease-key's single entry per vertex, on the same graph" h={260}>
      <T x={150} y={70} s={13} f={C.crema} a="middle" o={a}>lazy deletion: push again, skip stale pops later</T>
      <T x={450} y={70} s={13} f={C.focus} a="middle" o={a}>decrease-key: one entry per vertex, updated in place</T>
      <T x={300} y={210} s={13} f={C.latte} a="middle" o={a}>same final distances, different amount of queue bookkeeping</T>
    </Svg>
  );
}

// 6 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The same weighted graph, every distance now settled, handed off to the question of a negative edge" h={280}>
      <ArrowDefs />
      {EDGES.map(([x, y, w], i) => <Edge key={i} a={x} b={y} w="" />)}
      {[0, 1, 2, 3, 4].map((v) => <Node key={v} i={v} fill={C.taupe} />)}
      <T x={320} y={260} s={13} f={C.latte} a="middle" o={a}>safe only because no edge can ever shorten a path by being added</T>
    </Svg>
  );
}
