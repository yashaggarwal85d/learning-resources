import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = an unprocessed vertex; latte =
// secondary labels (an in-degree, a finish time); taupe = a vertex already removed/
// finished; caramel = the thing to look at this beat (the vertex just drained, the
// queue/heap itself); cherry/cherryText = the bad outcome (a graph stuck with
// positive in-degree, a cycle). This topic's own graph (examples.py, DAG_ADJ):
// 0->2, 0->3, 1->3, 2->4, 3->4.

const POS: Record<number, readonly [number, number]> = {
  0: [120, 90],
  1: [120, 220],
  2: [300, 60],
  3: [300, 200],
  4: [480, 130],
};
const EDGES: [number, number][] = [[0, 2], [0, 3], [1, 3], [2, 4], [3, 4]];

function Node({ i, fill, label, o = 1 }: { i: number; fill: string; label?: string; o?: number }) {
  const [x, y] = POS[i];
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={16} fill={C.band} stroke={fill} strokeWidth={2.5} />
      <T x={x} y={y + 5} s={13} f={fill} a="middle">{String(i)}</T>
      {label && <T x={x} y={y - 24} s={13} f={C.latte} a="middle">{label}</T>}
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

function Edge({ a, b, color = C.line }: { a: number; b: number; color?: string }) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ex = x2 - (dx / len) * 18, ey = y2 - (dy / len) * 18;
  return <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={1.5} markerEnd="url(#arrow)" />;
}

// In-degree per vertex, for the Kahn's-algorithm animation.
const INIT_INDEGREE: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 2 };
const KAHN_ORDER = [0, 1, 2, 3, 4];

// 1 · Opening: a dependency graph, each vertex labelled with its in-degree.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A small dependency graph with each vertex labelled by its in-degree" h={280}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4].map((v) => <Node key={v} i={v} fill={C.crema} label={`in=${INIT_INDEGREE[v]}`} />)}
      <T x={300} y={260} s={13} f={C.latte} a="middle" o={a}>nothing processed before what it depends on</T>
    </Svg>
  );
}

// 2 · PredictCycle.
export function PredictCycle({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A directed cycle with the question of whether any valid topological order could exist for it" h={300}>
      <ArrowDefs />
      <Edge a={0} b={1} />
      <Edge a={1} b={2} />
      {(() => { const [x1, y1] = POS[2]; const [x2, y2] = POS[0]; return <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 + 60} ${x2} ${y2 + 18}`} fill="none" stroke={C.cherryText} strokeWidth={2.5} markerEnd="url(#arrow)" />; })()}
      <Node i={0} fill={C.crema} />
      <Node i={1} fill={C.crema} />
      <Node i={2} fill={C.crema} />
      <T x={300} y={260} s={13} f={C.latte} a="middle" o={a}>a cycle — any valid order at all?</T>
      {answer !== null && <T x={300} y={285} s={14} f={C.caramel} a="middle">no — none can exist</T>}
    </Svg>
  );
}

// 3 · KahnMechanism: the in-degree queue draining.
export function KahnMechanism({ t }: StepCtx) {
  const step = Math.min(KAHN_ORDER.length, Math.floor(easeOut(seg(t, 0.3, 2.6)) * (KAHN_ORDER.length + 0.3)));
  const removed = new Set(KAHN_ORDER.slice(0, step));
  return (
    <Svg label="The in-degree queue draining one vertex at a time, each removal decrementing its neighbours' own in-degree live" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} color={removed.has(x) ? C.line : C.line} />)}
      {[0, 1, 2, 3, 4].map((v) => {
        const isRemoved = removed.has(v);
        const justNow = KAHN_ORDER[step - 1] === v;
        return <Node key={v} i={v} fill={isRemoved ? (justNow ? C.focus : C.taupe) : C.crema} />;
      })}
      <T x={300} y={275} s={13} f={C.latte} a="middle">remove a zero in-degree vertex, decrement its neighbours, repeat</T>
    </Svg>
  );
}

// 4 · ReverseDFS: finish order read off and reversed.
export function ReverseDFS({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const finishOrder = [4, 2, 3, 0, 1];
  const reveal = easeOut(seg(t, 0.3, 2.2));
  const shown = Math.floor(reveal * (finishOrder.length + 0.3));
  return (
    <Svg label="DFS finish order read off and then reversed into a second, independently valid topological order" h={280}>
      <T x={300} y={40} s={13} f={C.latte} a="middle" o={a}>finish order (left to right): {finishOrder.slice(0, Math.min(finishOrder.length, shown)).join(', ')}</T>
      {finishOrder.map((v, i) => (
        <g key={v} opacity={i < shown ? 1 : 0.25}>
          <circle cx={90 + i * 90} cy={140} r={16} fill={C.band} stroke={C.crema} strokeWidth={2} />
          <T x={90 + i * 90} y={145} s={13} f={C.crema} a="middle">{String(v)}</T>
        </g>
      ))}
      <T x={300} y={220} s={13} f={C.latte} a="middle" o={a}>reversed, this is a second valid topological order —</T>
      <T x={300} y={238} s={13} f={C.latte} a="middle" o={a}>not identical to Kahn's, equally correct</T>
    </Svg>
  );
}

// 5 · StuckGraph: Kahn's algorithm stalling on a cyclic graph.
export function StuckGraph({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A cyclic graph where Kahn's algorithm stalls with every remaining vertex stuck at positive in-degree" h={300}>
      <ArrowDefs />
      <Edge a={0} b={1} color={C.cherryText} />
      <Edge a={1} b={2} color={C.cherryText} />
      {(() => { const [x1, y1] = POS[2]; const [x2, y2] = POS[0]; return <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 + 60} ${x2} ${y2 + 18}`} fill="none" stroke={C.cherryText} strokeWidth={2.5} markerEnd="url(#arrow)" />; })()}
      <Node i={0} fill={C.cherryText} label="in=1" />
      <Node i={1} fill={C.cherryText} label="in=1" />
      <Node i={2} fill={C.cherryText} label="in=1" />
      <T x={300} y={258} s={13} f={C.latte} a="middle" o={a}>the queue runs dry — every remaining</T>
      <T x={300} y={283} s={13} f={C.latte} a="middle" o={a}>vertex still has positive in-degree</T>
    </Svg>
  );
}

// 6 · LexicographicHeap: a min-heap picking the smallest available label each round.
export function LexicographicHeap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A plain FIFO queue's order against a min-heap's lexicographically smallest order on the same small graph" h={280}>
      <T x={150} y={60} s={14} f={C.crema} a="middle" o={a}>plain queue: 0, 2, 1</T>
      <T x={450} y={60} s={14} f={C.focus} a="middle" o={a}>min-heap: 0, 1, 2</T>
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>vertex 2 is available immediately, but the</T>
      <T x={300} y={218} s={13} f={C.latte} a="middle" o={a}>heap holds it back for the smaller label 1</T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The dependency graph once more, fully ordered, handed off to the question of mutual reachability" h={280}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4].map((v) => <Node key={v} i={v} fill={C.crema} />)}
      <T x={300} y={260} s={13} f={C.latte} a="middle" o={a}>no order exists without acyclicity —</T>
      <T x={300} y={278} s={13} f={C.latte} a="middle" o={a}>strongly connected components, next</T>
    </Svg>
  );
}
