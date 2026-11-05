import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = an unvisited vertex; latte = secondary
// labels (discovery/finish times); taupe = a vertex already fully processed this beat;
// caramel = the thing to look at this beat (the current path, the edge being classified);
// cherry/cherryText = the bad outcome (a back edge/cycle, a stack overflow). This topic's
// own graph (examples.py, DIRECTED_ADJ): 0->1->2->0 (a cycle), 0->3 (tree), 4->1 (cross).

const POS: Record<number, readonly [number, number]> = {
  0: [160, 90],
  1: [320, 90],
  2: [320, 220],
  3: [160, 220],
  4: [460, 150],
};
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [0, 3], [4, 1]];

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

function Edge({ a, b, color = C.line, w = 1.5, curve = false }: { a: number; b: number; color?: string; w?: number; curve?: boolean }) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  const mx = (x1 + x2) / 2 + (curve ? 24 : 0);
  const my = (y1 + y2) / 2 + (curve ? -24 : 0);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ex = x2 - (dx / len) * 18, ey = y2 - (dy / len) * 18;
  return (
    <g>
      <path d={curve ? `M${x1} ${y1} Q${mx} ${my} ${ex} ${ey}` : `M${x1} ${y1} L${ex} ${ey}`} fill="none" stroke={color} strokeWidth={w} markerEnd="url(#arrow)" />
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

// 1 · Opening: a single path diving deep, backtracking, diving again.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const reveal = easeOut(seg(t, 0.4, 2.2));
  const steps = Math.floor(reveal * 5);
  const order = [0, 1, 2, 3, 4];
  return (
    <Svg label="A single path diving as deep as possible before backtracking, rather than a widening ring" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} color={C.line} />)}
      {order.map((v, i) => <Node key={v} i={v} fill={i < steps ? C.focus : C.crema} />)}
      <T x={300} y={275} s={13} f={C.latte} a="middle" o={a}>as deep as possible, before ever backing up</T>
    </Svg>
  );
}

// 2 · PredictBackEdge.
export function PredictBackEdge({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="An edge from a vertex back to one of its own ancestors in the DFS tree, with the question of which edge type it is" h={260}>
      <ArrowDefs />
      <Edge a={0} b={1} />
      <Edge a={1} b={2} />
      <Edge a={2} b={0} color={C.cherryText} w={2.5} curve />
      <Node i={0} fill={C.crema} />
      <Node i={1} fill={C.crema} />
      <Node i={2} fill={C.crema} />
      <T x={300} y={260} s={13} f={C.latte} a="middle" o={a}>tree, back, forward, or cross?</T>
      {answer !== null && <T x={300} y={280} s={14} f={C.caramel} a="middle">a back edge — and a cycle</T>}
    </Svg>
  );
}

// 3 · DFSMechanism: discovery/finish times and the parenthesis property.
export function DFSMechanism({ t }: StepCtx) {
  const disc: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 5, 4: 8 };
  const fin: Record<number, number> = { 0: 7, 1: 4, 2: 3, 3: 6, 4: 9 };
  const clock = Math.floor(easeOut(seg(t, 0.2, 2.6)) * 10);
  return (
    <Svg label="Each vertex labelled with its discovery and finish time, timestamps nesting or sitting fully apart, never overlapping" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} color={i === 2 ? C.cherryText : C.line} />)}
      {[0, 1, 2, 3, 4].map((v) => {
        const d = disc[v], f = fin[v];
        const shown = clock >= d;
        const finished = clock >= f;
        const label = shown ? `${d}${finished ? `,${f}` : ''}` : undefined;
        return <Node key={v} i={v} fill={finished ? C.taupe : shown ? C.focus : C.crema} label={label} />;
      })}
      <T x={300} y={275} s={13} f={C.latte} a="middle">discovery, finish — nested or disjoint, never partly overlapping</T>
    </Svg>
  );
}

// 4 · EdgeTypes: the four-way classification named against the same graph.
export function EdgeTypes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const rows: [string, string][] = [['tree', '0 → 1, 1 → 2, 0 → 3'], ['back', '2 → 0 (closes a cycle)'], ['forward', 'ancestor → descendant, non-tree'], ['cross', '4 → 1 (a different subtree)']];
  return (
    <Svg label="The four edge types named, each with its defining relation to discovery and finish times" h={260}>
      {rows.map(([name, desc], i) => (
        <g key={name}>
          <T x={60} y={60 + i * 44} s={15} f={i === 1 ? C.cherryText : C.focus} w={600}>{name}</T>
          <T x={180} y={60 + i * 44} s={13} f={C.latte} o={a}>{desc}</T>
        </g>
      ))}
    </Svg>
  );
}

// 5 · PredictUndirectedEdges.
export function PredictUndirectedEdges({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="An undirected triangle with the question of whether its DFS can ever produce a forward or a cross edge" h={240}>
      <ArrowDefs />
      <Edge a={0} b={1} />
      <Edge a={1} b={2} />
      <Edge a={2} b={0} />
      <Node i={0} fill={C.crema} />
      <Node i={1} fill={C.crema} />
      <Node i={2} fill={C.crema} />
      <T x={300} y={260} s={13} f={C.latte} a="middle" o={a}>forward or cross edges — possible here, or not?</T>
      {answer !== null && <T x={300} y={280} s={14} f={C.caramel} a="middle">no — only tree and back edges</T>}
    </Svg>
  );
}

// 6 · CycleDetection: three-colour (directed) vs. parent-check (undirected).
export function CycleDetection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A directed graph tested by three colours against an undirected graph tested by a parent check, side by side" h={280}>
      <T x={150} y={40} s={14} f={C.crema} a="middle" o={a}>directed: grey neighbour?</T>
      <Node i={0} fill={C.taupe} />
      <Node i={1} fill={C.focus} label="grey" />
      {(() => { const [x, y] = POS[2]; return <circle cx={x} cy={y} r={16} fill={C.band} stroke={C.cherryText} strokeWidth={2.5} />; })()}
      <ArrowDefs />
      <Edge a={0} b={1} />
      <Edge a={1} b={2} color={C.cherryText} w={2.5} />
      <T x={450} y={40} s={14} f={C.crema} a="middle" o={a}>undirected: visited, not the parent?</T>
      <T x={450} y={275} s={12} f={C.latte} a="middle" o={a}>no colours needed — a non-parent visited neighbour is already a cycle</T>
    </Svg>
  );
}

// 6 · IterativeDFS: the recursive version crashing, the explicit-stack version surviving.
export function IterativeDFS({ t }: StepCtx) {
  const crashAt = easeOut(seg(t, 0.4, 1.6));
  const surviveAt = easeOut(seg(t, 1.8, 3.2));
  const barMax = 240;
  return (
    <Svg label="A long chain overflowing a recursive call stack against an explicit stack completing the identical traversal" h={280}>
      <T x={60} y={50} s={13} f={C.crema}>recursive call stack</T>
      <rect x={60} y={65} width={24} height={Math.min(barMax, barMax * crashAt * 1.4)} fill={crashAt > 0.7 ? C.cherry : C.focus} />
      {crashAt > 0.75 && <T x={100} y={110} s={13} f={C.cherryText}>RecursionError</T>}
      <T x={320} y={50} s={13} f={C.crema}>explicit stack (vertex, iterator)</T>
      <rect x={320} y={65} width={24} height={Math.min(barMax, barMax * surviveAt * 0.3)} fill={C.focus} />
      {surviveAt > 0.8 && <T x={360} y={110} s={13} f={C.crema}>completes — fifty thousand vertices</T>}
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The directed graph once more, every edge now labelled with its type, handed off to the next topic's use of the same classification" h={300}>
      <ArrowDefs />
      {EDGES.map(([x, y], i) => <Edge key={i} a={x} b={y} color={i === 2 ? C.cherryText : C.line} />)}
      {[0, 1, 2, 3, 4].map((v) => <Node key={v} i={v} fill={C.crema} />)}
      <T x={300} y={275} s={13} f={C.latte} a="middle" o={a}>a DAG's reverse finish order is a dependency order — topological sort, next</T>
    </Svg>
  );
}
