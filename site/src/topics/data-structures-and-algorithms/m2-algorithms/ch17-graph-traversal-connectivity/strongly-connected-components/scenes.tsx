import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = an unvisited vertex; latte = secondary
// labels (a low-link value, a discovery time); taupe = a vertex already fully processed;
// caramel = the thing to look at this beat (the vertex just popped, the current low-link
// being updated); cherry/cherryText = the bad outcome (an unsatisfiable two-SAT merge). This
// topic's own graph (examples.py, SCC_ADJ): a 3-cycle {0,1,2}, a 2-cycle {3,4}, a singleton
// {5}, chained 0-1-2 -> 3-4 -> 5.

const POS: Record<number, readonly [number, number]> = {
  0: [100, 70],
  1: [220, 40],
  2: [220, 140],
  3: [380, 70],
  4: [380, 170],
  5: [520, 120],
};
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3], [4, 5]];

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

function Edge({ a, b, color = C.line }: { a: number; b: number; color?: string }) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ex = x2 - (dx / len) * 18, ey = y2 - (dy / len) * 18;
  return <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={1.5} markerEnd="url(#arrow)" />;
}

const GROUPS: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 };
const GROUP_COLOR = [C.crema, C.focus, C.taupe];

// 1 · Opening: a graph with visibly clustered groups, each mutually reaching only itself.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A graph where small pockets of vertices can each reach every other member of the pocket and nothing outside it" h={260}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4, 5].map((v) => <Node key={v} i={v} fill={GROUP_COLOR[GROUPS[v]]} />)}
      <T x={310} y={220} s={13} f={C.latte} a="middle" o={a}>from a distance, every vertex</T>
      <T x={310} y={238} s={13} f={C.latte} a="middle" o={a}>looks reachable from every other</T>
    </Svg>
  );
}

// 2 · PredictCondensation.
export function PredictCondensation({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Contracting every strongly connected component of a graph down to a single vertex" h={240}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4, 5].map((v) => <Node key={v} i={v} fill={GROUP_COLOR[GROUPS[v]]} />)}
      <T x={310} y={220} s={13} f={C.latte} a="middle" o={a}>always a DAG, sometimes a DAG, or never a DAG?</T>
      {answer !== null && <T x={310} y={200} s={14} f={C.caramel} a="middle">always — a cycle among components would merge them</T>}
    </Svg>
  );
}

// 3 · TarjanMechanism: a single DFS, low-link updating live, a pop on low-link == index.
export function TarjanMechanism({ t }: StepCtx) {
  const step = Math.min(6, Math.floor(easeOut(seg(t, 0.3, 2.8)) * 6.3));
  const order = [0, 1, 2, 3, 4, 5];
  const popped = new Set(step >= 3 ? [0, 1, 2] : step >= 1 ? [] : []);
  return (
    <Svg label="A single depth-first search maintaining a low-link value per vertex, popping a complete strongly connected component the instant a vertex's low-link equals its own discovery index" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {order.map((v, i) => {
        const visited = i <= step;
        const isPopped = popped.has(v);
        return <Node key={v} i={v} fill={!visited ? C.crema : isPopped ? C.taupe : C.caramel} label={visited ? `low=${Math.min(0, v)}` : undefined} />;
      })}
      <T x={310} y={273} s={13} f={C.latte} a="middle">one stack, one DFS — a pop happens</T>
      <T x={310} y={298} s={13} f={C.latte} a="middle">the moment low-link catches up to index</T>
    </Svg>
  );
}

// 4 · KosarajuMechanism: finish order, transpose, second DFS.
export function KosarajuMechanism({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Kosaraju's algorithm: one depth-first search for a finish order, the edges reversed, a second depth-first search in that order" h={320}>
      <T x={150} y={48} s={13} f={C.crema} a="middle" o={a}>pass 1: finish order</T>
      <T x={150} y={73} s={13} f={C.crema} a="middle" o={a}>on the original graph</T>
      <T x={450} y={48} s={13} f={C.focus} a="middle" o={a}>pass 2: DFS on the transpose,</T>
      <T x={450} y={73} s={13} f={C.focus} a="middle" o={a}>in reverse finish order</T>
      <T x={300} y={233} s={13} f={C.latte} a="middle" o={a}>each new DFS tree in pass 2 is exactly</T>
      <T x={300} y={258} s={13} f={C.latte} a="middle" o={a}>one strongly connected component</T>
    </Svg>
  );
}

// 5 · CondensationGraph: original graph beside its condensation, confirmed acyclic.
export function CondensationGraph({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The original graph beside its condensation graph, visibly acyclic" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4, 5].map((v) => <Node key={v} i={v} fill={GROUP_COLOR[GROUPS[v]]} />)}
      <T x={310} y={218} s={13} f={C.latte} a="middle" o={a}>contract each group to one vertex —</T>
      <T x={310} y={243} s={13} f={C.latte} a="middle" o={a}>the result has no cycle, confirmed directly</T>
    </Svg>
  );
}

// 6 · TwoSAT: implication graph, two SCCs for one variable merging means unsatisfiable.
export function TwoSAT({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A small two-SAT implication graph: a satisfiable instance keeping a variable's two literals in separate components, against an unsatisfiable one merging them" h={320}>
      <T x={160} y={48} s={13} f={C.crema} a="middle" o={a}>satisfiable: x and not-x</T>
      <T x={160} y={73} s={13} f={C.crema} a="middle" o={a}>stay in different components</T>
      <T x={450} y={48} s={13} f={C.cherryText} a="middle" o={a}>unsatisfiable: x and not-x</T>
      <T x={450} y={73} s={13} f={C.cherryText} a="middle" o={a}>merge into one component</T>
      <T x={300} y={233} s={13} f={C.latte} a="middle" o={a}>a hard-looking logic problem, reduced</T>
      <T x={300} y={258} s={13} f={C.latte} a="middle" o={a}>entirely to a traversal already built</T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Every vertex visited, ranked and grouped by what it can reach, handed off to a graph with weighted edges and a cheapest path to find" h={280}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4, 5].map((v) => <Node key={v} i={v} fill={GROUP_COLOR[GROUPS[v]]} />)}
      <T x={310} y={220} s={13} f={C.latte} a="middle" o={a}>every edge cost one step —</T>
      <T x={310} y={238} s={13} f={C.latte} a="middle" o={a}>the next question puts a cost on each one</T>
    </Svg>
  );
}
