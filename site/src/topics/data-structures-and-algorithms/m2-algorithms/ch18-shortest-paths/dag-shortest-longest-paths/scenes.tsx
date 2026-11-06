import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = an unsettled or unrelaxed vertex; latte =
// secondary labels (a distance, a duration); taupe = a vertex no longer of interest this
// beat; caramel = the thing to look at this beat (the current vertex in topological order,
// the edge being relaxed); cherry/cherryText = the bad outcome (a distance made wrong by
// relaxing out of order). This topic's own graph (examples.py, ADJ): 6 vertices, 0 is the
// source, already in topological order by index.

const POS: [number, number][] = [
  [80, 150],
  [230, 70],
  [230, 230],
  [390, 70],
  [390, 230],
  [540, 150],
];
const EDGES: [number, number, number][] = [
  [0, 1, 3],
  [0, 2, 2],
  [1, 3, 4],
  [2, 3, 1],
  [2, 4, 5],
  [3, 5, 2],
  [4, 5, 6],
];

function Graph({ litVertex, litEdge, labels }: { litVertex: number; litEdge: number; labels: (string | null)[] }) {
  return (
    <g>
      {EDGES.map(([u, v, w], i) => {
        const [x1, y1] = POS[u];
        const [x2, y2] = POS[v];
        const on = i === litEdge;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? C.caramel : C.line} strokeWidth={on ? 2.5 : 1.25} />
            <T x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} s={11} f={on ? C.caramel : C.latte} a="middle">{String(w)}</T>
          </g>
        );
      })}
      {POS.map(([x, y], v) => {
        const fill = v === litVertex ? C.caramel : v < litVertex ? C.taupe : C.crema;
        return (
          <g key={v}>
            <circle cx={x} cy={y} r={16} fill={C.band} stroke={fill} strokeWidth={2.5} />
            <T x={x} y={y + 4} s={12} f={fill} a="middle">{String(v)}</T>
            {labels[v] !== null && (
              <T x={x} y={y - 24} s={12} f={C.latte} a="middle">{labels[v]}</T>
            )}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Opening: a schedule, one number, a graph already built earlier this chapter.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const labels = [null, null, null, null, null, null];
  return (
    <Svg label="A project schedule where some tasks wait on several others finishing first" h={300}>
      <Graph litVertex={-1} litEdge={-1} labels={labels} />
      <T x={310} y={280} s={13} f={C.latte} a="middle" o={a}>one number decides how fast the whole project can finish</T>
    </Svg>
  );
}

// 2 · PredictCycleRequired.
export function PredictCycleRequired({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The identical single pass, asked whether it still works if the graph has even one cycle" h={240}>
      <T x={300} y={90} s={13} f={C.latte} a="middle" o={a}>a vertex relaxed before one of its own predecessors is final</T>
      <T x={300} y={180} s={13} f={C.latte} a="middle" o={a}>does the single pass still give correct distances?</T>
      {answer !== null && <T x={300} y={202} s={14} f={C.cherryText} a="middle">no — and it fails with no warning at all</T>}
    </Svg>
  );
}

// 3 · TopoRelaxation: the mechanism, vertex by vertex in topological order.
export function TopoRelaxation({ t }: StepCtx) {
  const step = Math.min(5, Math.floor(easeOut(seg(t, 0.3, 3)) * 6));
  const dist = [0, 3, 2, 3, 7, 5];
  const labels = POS.map((_, v) => (v <= step ? String(dist[v]) : null));
  const litEdge = step < 5 ? EDGES.findIndex(([u]) => u === step) : -1;
  return (
    <Svg label="Every vertex, strictly in topological order, relaxing its own outgoing edges exactly once" h={320}>
      <Graph litVertex={step} litEdge={litEdge} labels={labels} />
      <T x={310} y={280} s={13} f={C.latte} a="middle">one pass, left to right in the topological order —</T>
      <T x={310} y={302} s={13} f={C.latte} a="middle">no repeats, no priority queue</T>
    </Svg>
  );
}

// 4 · WhyOrderMatters: the same graph, a bad order, a silently wrong distance.
export function WhyOrderMatters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The identical graph, relaxed in a non-topological order, settling vertex five too early" h={300}>
      <Graph litVertex={5} litEdge={-1} labels={[null, null, null, null, null, 'nine']} />
      <T x={310} y={270} s={13} f={C.cherryText} a="middle" o={a}>vertex five locked in at nine, before vertex</T>
      <T x={310} y={292} s={13} f={C.cherryText} a="middle" o={a}>two's better route even arrives</T>
    </Svg>
  );
}

// 5 · PredictLongestPathGeneral.
export function PredictLongestPathGeneral({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Negate every weight, run the identical pass — asked whether that finds the longest path on any graph" h={260}>
      <T x={300} y={78} s={13} f={C.latte} a="middle" o={a}>negative weights, and on any graph with a cycle,</T>
      <T x={300} y={100} s={13} f={C.latte} a="middle" o={a}>a negative cycle too</T>
      <T x={300} y={185} s={13} f={C.latte} a="middle" o={a}>does negation find the longest path</T>
      <T x={300} y={207} s={13} f={C.latte} a="middle" o={a}>everywhere, or only here?</T>
      {answer !== null && <T x={300} y={234} s={14} f={C.focus} a="middle">only on a graph with no cycle at all</T>}
    </Svg>
  );
}

// 6 · CriticalPath: the task-dependency DAG, longest path read off directly.
export function CriticalPath({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const names = ['start', 'design', 'frame', 'wiring', 'paint', 'inspect', 'ship'];
  const critical = [0, 1, 2, 4, 6];
  return (
    <Svg label="A seven-task schedule, its critical path the longest chain from start to ship" h={280}>
      {names.map((n, i) => (
        <T
          key={n}
          x={70 + i * 80}
          y={i % 2 === 0 ? 120 : 145}
          s={11}
          f={critical.includes(i) ? C.caramel : C.latte}
          a="middle"
          o={a}
        >
          {n}
        </T>
      ))}
      <T x={310} y={235} s={13} f={C.latte} a="middle" o={a}>the longest chain of dependent tasks sets</T>
      <T x={310} y={257} s={13} f={C.latte} a="middle" o={a}>the whole project's minimum length</T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The cheapest algorithm in the chapter, carrying the strongest precondition of all four" h={280}>
      <T x={310} y={120} s={13} f={C.latte} a="middle" o={a}>no priority queue, no repeated rounds,</T>
      <T x={310} y={142} s={13} f={C.latte} a="middle" o={a}>no cycle to ever worry about</T>
      <T x={310} y={205} s={13} f={C.latte} a="middle" o={a}>exactly because the graph is</T>
      <T x={310} y={227} s={13} f={C.latte} a="middle" o={a}>guaranteed to have none</T>
    </Svg>
  );
}
