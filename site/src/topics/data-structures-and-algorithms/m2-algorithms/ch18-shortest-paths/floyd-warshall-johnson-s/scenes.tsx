import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = an unfilled matrix cell; latte = secondary
// labels (a distance, a potential value); taupe = a cell already filled, no longer of
// interest this beat; caramel = the thing to look at this beat (the current waypoint column
// and row, the edge being reweighted); cherry/cherryText = the bad outcome (an edge that
// stayed negative after reweighting, which should never happen). This topic's own graph
// (examples.py, WEIGHTED_EDGES): 5 vertices, negative edges, no negative cycle.

const VERTS = [0, 1, 2, 3, 4];

function Matrix({ highlightK, filled }: { highlightK: number; filled: boolean[][] }) {
  const cell = 46;
  const x0 = 180, y0 = 40;
  return (
    <g>
      {VERTS.map((i) => (
        <T key={`ri${i}`} x={x0 - 24} y={y0 + i * cell + cell / 2 + 5} s={12} f={C.latte} a="middle">{String(i)}</T>
      ))}
      {VERTS.map((j) => (
        <T key={`cj${j}`} x={x0 + j * cell + cell / 2} y={y0 - 14} s={12} f={C.latte} a="middle">{String(j)}</T>
      ))}
      {VERTS.map((i) =>
        VERTS.map((j) => {
          const isK = i === highlightK || j === highlightK;
          const fill = filled[i][j] ? (isK ? C.caramel : C.taupe) : C.crema;
          return (
            <rect
              key={`${i}-${j}`}
              x={x0 + j * cell}
              y={y0 + i * cell}
              width={cell - 3}
              height={cell - 3}
              fill={C.band}
              stroke={fill}
              strokeWidth={2}
            />
          );
        }),
      )}
    </g>
  );
}

// 1 · Opening: an all-pairs question, two routes to the answer.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A network where every pair of cities wants its fastest route at once, not one pair at a time" h={260}>
      {VERTS.map((v, i) => {
        const angle = (i / VERTS.length) * Math.PI * 2 - Math.PI / 2;
        const x = 340 + Math.cos(angle) * 140;
        const y = 130 + Math.sin(angle) * 90;
        return (
          <g key={v}>
            {VERTS.filter((o) => o !== v).map((o) => {
              const oa = (o / VERTS.length) * Math.PI * 2 - Math.PI / 2;
              const ox = 340 + Math.cos(oa) * 140;
              const oy = 130 + Math.sin(oa) * 90;
              return <line key={o} x1={x} y1={y} x2={ox} y2={oy} stroke={C.line} strokeWidth={0.75} opacity={0.5} />;
            })}
            <circle cx={x} cy={y} r={14} fill={C.band} stroke={C.crema} strokeWidth={2.5} />
          </g>
        );
      })}
      <T x={340} y={240} s={13} f={C.latte} a="middle" o={a}>every pair's fastest route, answered together</T>
    </Svg>
  );
}

// 2 · PredictSparse.
export function PredictSparse({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A sparse graph (many vertices, comparatively few edges), asking which approach does less total work" h={300}>
      <T x={150} y={70} s={13} f={C.crema} a="middle" o={a}>fixed cost: ignores how</T>
      <T x={150} y={94} s={13} f={C.crema} a="middle" o={a}>sparse the graph is</T>
      <T x={450} y={70} s={13} f={C.focus} a="middle" o={a}>cost tied to edge count:</T>
      <T x={450} y={94} s={13} f={C.focus} a="middle" o={a}>rewards sparsity</T>
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>which does less total work on a sparse graph?</T>
      {answer !== null && (
        <>
          <T x={300} y={234} s={14} f={C.focus} a="middle">the edge-count-driven approach —</T>
          <T x={300} y={258} s={14} f={C.focus} a="middle">it has less work to do</T>
        </>
      )}
    </Svg>
  );
}

// 3 · DPMechanism: filling the distance matrix one waypoint at a time.
export function DPMechanism({ t }: StepCtx) {
  const k = Math.min(4, Math.floor(easeOut(seg(t, 0.3, 2.8)) * 5));
  const filled = VERTS.map(() => VERTS.map(() => true));
  return (
    <Svg label="The distance matrix filled one allowed waypoint at a time, column and row lit for the current one" h={340}>
      <Matrix highlightK={k} filled={filled} />
      <T x={340} y={300} s={13} f={C.latte} a="middle">waypoint column {k} — does routing through it</T>
      <T x={340} y={320} s={13} f={C.latte} a="middle">beat the best route so far?</T>
    </Svg>
  );
}

// 4 · PathReconstruction: a second matrix, the predecessor on the shortest route.
export function PathReconstruction({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A predecessor matrix, followed backward one step at a time to recover the actual shortest route" h={260}>
      <T x={150} y={80} s={13} f={C.latte} a="middle" o={a}>distance: a single number</T>
      <T x={450} y={80} s={13} f={C.focus} a="middle" o={a}>predecessor: one vertex per cell</T>
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>followed backward, step by step, to the actual path</T>
    </Svg>
  );
}

// 5 · TransitiveClosure: the same sweep, booleans instead of weights.
export function TransitiveClosure({ t }: StepCtx) {
  const k = Math.min(4, Math.floor(easeOut(seg(t, 0.3, 2.8)) * 5));
  const filled = VERTS.map(() => VERTS.map(() => true));
  return (
    <Svg label="The identical waypoint-by-waypoint sweep, with reachable-or-not in place of a distance" h={340}>
      <Matrix highlightK={k} filled={filled} />
      <T x={340} y={300} s={13} f={C.latte} a="middle">same sweep, same waypoints —</T>
      <T x={340} y={320} s={13} f={C.latte} a="middle">a yes-or-no flag instead of a number</T>
    </Svg>
  );
}

// 6 · JohnsonsMechanism: reweighting predict.
export function JohnsonsMechanism({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Every edge reweighted by a potential from an added source vertex, asked whether that ever changes the cheapest route" h={280}>
      <T x={300} y={70} s={13} f={C.latte} a="middle" o={a}>every edge now zero or positive —</T>
      <T x={300} y={94} s={13} f={C.latte} a="middle" o={a}>no negative weight survives</T>
      <T x={300} y={190} s={13} f={C.latte} a="middle" o={a}>does reweighting ever change which route is cheapest?</T>
      {answer !== null && <T x={300} y={222} s={14} f={C.focus} a="middle">no — every route shifts by the identical amount</T>}
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The all-pairs question fully answered two ways, handed off to a graph with no cycle at all" h={280}>
      <T x={340} y={120} s={13} f={C.latte} a="middle" o={a}>one dynamic program, or a composition of</T>
      <T x={340} y={144} s={13} f={C.latte} a="middle" o={a}>the two single-source algorithms already built</T>
      <T x={340} y={210} s={13} f={C.latte} a="middle" o={a}>neither needed a new primitive —</T>
      <T x={340} y={234} s={13} f={C.latte} a="middle" o={a}>only a new way to combine the old ones</T>
    </Svg>
  );
}
