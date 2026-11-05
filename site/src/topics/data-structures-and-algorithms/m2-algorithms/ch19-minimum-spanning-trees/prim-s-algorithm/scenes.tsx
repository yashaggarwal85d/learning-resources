import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with topic 67): crema = a vertex/edge as given; latte =
// secondary labels; taupe = not-yet-considered or a rejected edge (thin, dashed); caramel = the
// thing to look at (the edge being considered, the cut line, the tree edge just added); cinnamon
// (rare) = the alternative being compared (array Prim against heap Prim); cherry/cherryText =
// the bad outcome (a heap that must hold far more entries than it needs).

type Pos = Record<string, [number, number]>;

const POS: Pos = {
  A: [90, 150],
  B: [230, 55],
  C: [230, 245],
  D: [390, 55],
  E: [390, 245],
  F: [530, 150],
};

type EKey = 'AB4' | 'AC2' | 'AB7' | 'BC3' | 'BD5' | 'CD1' | 'CE6' | 'DE2' | 'DF8' | 'EF3';

const EDGE_ENDS: Record<EKey, [string, string]> = {
  AB4: ['A', 'B'],
  AC2: ['A', 'C'],
  AB7: ['A', 'B'],
  BC3: ['B', 'C'],
  BD5: ['B', 'D'],
  CD1: ['C', 'D'],
  CE6: ['C', 'E'],
  DE2: ['D', 'E'],
  DF8: ['D', 'F'],
  EF3: ['E', 'F'],
};

const EDGE_WEIGHT: Record<EKey, string> = {
  AB4: '4', AC2: '2', AB7: '7', BC3: '3', BD5: '5',
  CD1: '1', CE6: '6', DE2: '2', DF8: '8', EF3: '3',
};

function vertex(id: string, colour: string = C.crema, opacity = 1) {
  const [x, y] = POS[id];
  return (
    <g key={id} opacity={opacity}>
      <circle cx={x} cy={y} r={14} fill="none" stroke={colour} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} a="middle" f={colour}>{id}</T>
    </g>
  );
}

function edgeLine(key: EKey, colour: string = C.taupe, dashed = false, thick = false, opacity = 1) {
  const [u, v] = EDGE_ENDS[key];
  const [x1, y1] = POS[u];
  const [x2, y2] = POS[v];
  const bend = key === 'AB7';
  const mx = (x1 + x2) / 2 + (bend ? -40 : 0);
  const my = (y1 + y2) / 2 + (bend ? -10 : 0);
  const d = bend ? `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
  const labelX = bend ? mx : (x1 + x2) / 2;
  const labelY = bend ? my - 8 : (y1 + y2) / 2 - 8;
  return (
    <g key={`${key}-line`} opacity={opacity}>
      <path d={d} stroke={colour} strokeWidth={thick ? 2.6 : 1.4} strokeDasharray={dashed ? '5 4' : undefined} fill="none" />
      <T x={labelX} y={labelY} s={11} a="middle" f={C.latte}>{EDGE_WEIGHT[key]}</T>
    </g>
  );
}

const ALL_EDGES: EKey[] = ['AB4', 'AC2', 'AB7', 'BC3', 'BD5', 'CD1', 'CE6', 'DE2', 'DF8', 'EF3'];
const MST_EDGES: EKey[] = ['CD1', 'AC2', 'DE2', 'BC3', 'EF3'];
const GROW_ORDER: EKey[] = ['AC2', 'CD1', 'DE2', 'BC3', 'EF3'];

function baseGraph(edgeColour: (k: EKey) => string = (k: EKey) => (MST_EDGES.includes(k) ? C.crema : C.taupe), opacity = 1) {
  return (
    <g opacity={opacity}>
      {ALL_EDGES.map((k) => edgeLine(k, edgeColour(k), !MST_EDGES.includes(k), MST_EDGES.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
    </g>
  );
}

function cell(x: number, y: number, w: number, h: number, label: string, colour: string = C.crema, labelColour: string = C.latte) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={12} a="middle" f={labelColour}>{label}</T>
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A dense complete graph against a sparse one, the sort against the scan" h={300}>
      <g opacity={a}>
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 60 + (i % 6) * 90;
          const y = 40 + Math.floor(i / 6) * 60;
          return <circle key={i} cx={x} cy={y} r={3} fill={C.taupe} />;
        })}
        <T x={300} y={30} s={12} a="middle" f={C.latte}>nearly two hundred million edges</T>
      </g>
      <T x={300} y={270} s={13} a="middle" f={C.caramel} o={b}>sort every edge, or scan with no heap at all?</T>
    </Svg>
  );
}

// 2 · Predict array or heap
export function PredictArrayOrHeap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A dense graph; does the heap or the plain array win" h={300}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.caramel}>heap</T>
        <T x={450} y={100} s={13} a="middle" f={C.cinnamon}>plain array</T>
      </g>
      <T x={300} y={260} s={13} a="middle" f={C.latte}>dense graph &mdash; which one wins?</T>
    </Svg>
  );
}

// 3 · Prim mechanism
export function PrimMechanism({ t }: StepCtx) {
  const n = Math.min(GROW_ORDER.length, Math.floor(seg(t, 0.2, 2.4) * GROW_ORDER.length) + 1);
  const added = GROW_ORDER.slice(0, n);
  return (
    <Svg label="One tree grown outward from A; the cut is the tree against everything else" h={320}>
      {ALL_EDGES.map((k) => edgeLine(k, added.includes(k) ? C.caramel : C.taupe, !added.includes(k), added.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
      <T x={300} y={300} s={13} a="middle" f={C.latte}>add the lightest edge crossing the cut</T>
    </Svg>
  );
}

// 4 · Lazy Prim
export function LazyPrim({ t }: StepCtx) {
  const n = Math.min(GROW_ORDER.length, Math.floor(seg(t, 0.2, 2.6) * GROW_ORDER.length) + 1);
  const added = GROW_ORDER.slice(0, n);
  const queue: EKey[] = ['AB4', 'AB7', 'BD5', 'CE6', 'DF8'];
  return (
    <Svg label="Every outgoing edge pushed; stale entries discarded on pop" h={330}>
      {ALL_EDGES.map((k) => edgeLine(k, added.includes(k) ? C.caramel : C.taupe, !added.includes(k), added.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
      {queue.map((k, i) => (
        <rect key={k} x={40 + i * 56} y={300} width={48} height={20} fill="none" stroke={C.taupe} strokeWidth={1.3} strokeDasharray="4 3" />
      ))}
      <T x={300} y={282} s={12} a="middle" f={C.latte}>stale entries sit here until popped and discarded</T>
    </Svg>
  );
}

// 5 · Eager Prim
export function EagerPrim({ t }: StepCtx) {
  const n = Math.min(GROW_ORDER.length, Math.floor(seg(t, 0.2, 2.6) * GROW_ORDER.length) + 1);
  const added = GROW_ORDER.slice(0, n);
  const inTree = new Set<string>(['A', ...added.flatMap((k) => EDGE_ENDS[k])]);
  const outside = Object.keys(POS).filter((v) => !inTree.has(v));
  return (
    <Svg label="One best-known edge per outside vertex, improved by a decrease-key" h={330}>
      {ALL_EDGES.map((k) => edgeLine(k, added.includes(k) ? C.caramel : C.taupe, !added.includes(k), added.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
      {outside.slice(0, 3).map((v, i) => cell(40 + i * 110, 300, 90, 24, `${v}: key`, C.crema))}
      <T x={300} y={282} s={12} a="middle" f={C.latte}>one cell per outside vertex, never more</T>
    </Svg>
  );
}

// 6 · Prim and Dijkstra
export function PrimAndDijkstra({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="The same loop; one uses an edge weight, the other a path length" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.caramel}>Prim: key = edge weight</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={13} a="middle" f={C.cinnamon}>Dijkstra: key = path length so far</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>everything else: the identical loop</T>
    </Svg>
  );
}

// 7 · Array version
export function ArrayVersion({ t }: StepCtx) {
  const scan = Math.min(6, Math.floor(seg(t, 0.2, 2.4) * 6) + 1);
  return (
    <Svg label="A linear scan over the keys, once per vertex added, no heap at all" h={300}>
      {Array.from({ length: 6 }).map((_, i) => cell(40 + i * 86, 60, 70, 36, `v${i + 1}`, i < scan ? C.caramel : C.taupe))}
      <T x={300} y={140} s={13} a="middle" f={C.latte}>one scan per vertex added</T>
      <T x={300} y={270} s={13} a="middle" f={C.caramel}>twenty-one comparisons here</T>
    </Svg>
  );
}

// 8 · Predict array cost
export function PredictArrayCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="The same six vertices, far more edges between them" h={280}>
      <g opacity={a}>
        {Object.keys(POS).map((v) => vertex(v, C.taupe))}
        <T x={300} y={30} s={12} a="middle" f={C.caramel}>many more edges added</T>
      </g>
      <T x={300} y={260} s={13} a="middle" f={C.latte}>does the scan's own cost change?</T>
    </Svg>
  );
}

// 9 · Crossover derived
export function CrossoverDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Array cost proportional to vertex count squared; heap cost proportional to edge count times a logarithm" h={280}>
      <g opacity={a}>
        <T x={150} y={90} s={13} a="middle" f={C.cinnamon}>array: vertex count squared</T>
        <T x={450} y={90} s={13} a="middle" f={C.caramel}>heap: edge count &times; a logarithm</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>heap wins below one ratio of the two</T>
    </Svg>
  );
}

// 10 · Crossover measured
export function CrossoverMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A fixed array cost against a rising heap cost, crossing near the predicted point" h={300}>
      <g opacity={a}>
        <line x1={60} y1={90} x2={540} y2={90} stroke={C.cinnamon} strokeWidth={1.6} />
        <path d="M60 240 Q 300 160 540 40" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <circle cx={300} cy={125} r={5} fill={C.caramel} />
      </g>
      <T x={300} y={270} s={13} a="middle" f={C.latte}>crossing point lands near the derived ratio</T>
    </Svg>
  );
}

// 11 · Kruskal against Prim
export function KruskalAgainstPrim({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Kruskal's cost tracks the edge count; Prim's array version tracks only the vertex count" h={280}>
      <g opacity={a}>
        <T x={150} y={90} s={13} a="middle" f={C.cinnamon}>Kruskal: scales with edges</T>
      </g>
      <g opacity={b}>
        <T x={450} y={90} s={13} a="middle" f={C.caramel}>Prim (array): scales with vertices alone</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>density decides which one wins</T>
    </Svg>
  );
}

// 12 · Implementation facts
export function ImplementationFacts({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Straight-line memory for the array version; heap overhead for the other" h={280}>
      <g opacity={a}>
        {Array.from({ length: 6 }).map((_, i) => cell(40 + i * 86, 60, 70, 30, '', C.caramel))}
        <T x={300} y={30} s={12} a="middle" f={C.caramel}>array: one straight line</T>
      </g>
      <g opacity={b}>
        <T x={300} y={150} s={12} a="middle" f={C.cinnamon}>heap: adjacency list, heap overhead</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>dense and complete graphs favor the array</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A cut stays the same idea; an edge becomes a pipe with a capacity" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>cuts: still the idea</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={12} a="middle" f={C.latte}>edges: now pipes with a capacity</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>max-flow min-cut, next</T>
    </Svg>
  );
}
