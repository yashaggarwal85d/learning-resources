import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own addition to the shared one): crema = a pipe at
// its given capacity, unfilled; caramel = the thing to look at (the route being pushed, the
// residual arrow just used, the cut curve); cinnamon (rare) = the alternative being compared (a
// second, independently sourced network); cherry/cherryText = the stuck/blocked state (a full
// pipe with no route left); taupe = not-yet-considered. A pipe's own fill bar (caramel, inside
// the crema outline) shows flow against capacity; a thin dashed arrow drawn under a pipe, pointed
// the opposite way, is its backward residual; a closed curve around a set of vertices, with a
// number counting up beside it, is a cut.

type Pos = Record<string, [number, number]>;

const POS: Pos = {
  A: [70, 150],
  B: [220, 60],
  C: [220, 240],
  D: [380, 60],
  E: [380, 240],
  F: [530, 150],
};

type EKey = 'AB' | 'AC' | 'BC' | 'BD' | 'CD' | 'CE' | 'DE' | 'DF' | 'EF';

const EDGE_ENDS: Record<EKey, [string, string]> = {
  AB: ['A', 'B'],
  AC: ['A', 'C'],
  BC: ['B', 'C'],
  BD: ['B', 'D'],
  CD: ['C', 'D'],
  CE: ['C', 'E'],
  DE: ['D', 'E'],
  DF: ['D', 'F'],
  EF: ['E', 'F'],
};

const CAPACITY: Record<EKey, number> = {
  AB: 11, AC: 2, BC: 3, BD: 5, CD: 1, CE: 6, DE: 2, DF: 8, EF: 3,
};

const ALL_EDGES: EKey[] = ['AB', 'AC', 'BC', 'BD', 'CD', 'CE', 'DE', 'DF', 'EF'];

function vertex(id: string, colour: string = C.crema, opacity = 1) {
  const [x, y] = POS[id];
  return (
    <g key={id} opacity={opacity}>
      <circle cx={x} cy={y} r={14} fill="none" stroke={colour} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} a="middle" f={colour}>{id}</T>
    </g>
  );
}

function arrowHead(x: number, y: number, angle: number, colour: string) {
  const size = 7;
  const a1 = angle + 2.6;
  const a2 = angle - 2.6;
  const p1 = [x + size * Math.cos(a1), y + size * Math.sin(a1)];
  const p2 = [x + size * Math.cos(a2), y + size * Math.sin(a2)];
  return <path d={`M${x} ${y} L${p1[0]} ${p1[1]} M${x} ${y} L${p2[0]} ${p2[1]}`} stroke={colour} strokeWidth={1.6} fill="none" />;
}

function pipe(key: EKey, flow: number, colour: string = C.crema, opacity = 1, show = true) {
  const [u, v] = EDGE_ENDS[key];
  const [x1, y1] = POS[u];
  const [x2, y2] = POS[v];
  const cap = CAPACITY[key];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const ex1 = x1 + ux * 16;
  const ey1 = y1 + uy * 16;
  const ex2 = x2 - ux * 16;
  const ey2 = y2 - uy * 16;
  const frac = Math.min(1, flow / cap);
  const midx = ex1 + (ex2 - ex1) * frac;
  const midy = ey1 + (ey2 - ey1) * frac;
  const labelX = (ex1 + ex2) / 2;
  const labelY = (ey1 + ey2) / 2 - 8;
  const full = flow >= cap;
  return (
    <g key={`${key}-pipe`} opacity={show ? opacity : 0}>
      <path d={`M${ex1} ${ey1} L${ex2} ${ey2}`} stroke={C.taupe} strokeWidth={3.2} fill="none" />
      {flow > 0 && (
        <path d={`M${ex1} ${ey1} L${midx} ${midy}`} stroke={full ? C.cherry : colour} strokeWidth={3.2} fill="none" />
      )}
      {arrowHead(ex2, ey2, Math.atan2(dy, dx), full ? C.cherry : colour)}
      <T x={labelX} y={labelY} s={12} a="middle" f={C.latte}>{flow}/{cap}</T>
    </g>
  );
}

function backResidual(key: EKey, residual: number, colour: string = C.caramel, opacity = 1) {
  const [u, v] = EDGE_ENDS[key];
  const [x2, y2] = POS[u];
  const [x1, y1] = POS[v];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const offx = -uy * 20;
  const offy = ux * 20;
  const ex1 = x1 + ux * 20 + offx;
  const ey1 = y1 + uy * 20 + offy;
  const ex2 = x2 - ux * 20 + offx;
  const ey2 = y2 - uy * 20 + offy;
  if (residual <= 0) return null;
  return (
    <g key={`${key}-back`} opacity={opacity}>
      <path d={`M${ex1} ${ey1} L${ex2} ${ey2}`} stroke={colour} strokeWidth={1.2} strokeDasharray="4 3" fill="none" />
      {arrowHead(ex2, ey2, Math.atan2(ey2 - ey1, ex2 - ex1), colour)}
      <T x={(ex1 + ex2) / 2 + offx} y={(ey1 + ey2) / 2 + offy + 10} s={12} a="middle" f={colour}>{residual}</T>
    </g>
  );
}

function baseNetwork(flows: Partial<Record<EKey, number>> = {}, opacity = 1) {
  return (
    <g opacity={opacity}>
      {ALL_EDGES.map((k) => pipe(k, flows[k] ?? 0))}
      {Object.keys(POS).map((v) => vertex(v))}
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const b = easeOut(seg(t, 1.5, 2.4));
  const STUCK: Partial<Record<EKey, number>> = { AB: 5, BD: 5, DF: 5, AC: 2, CE: 2, EF: 2 };
  return (
    <Svg label="Six depots, nine units of room at the narrowest crossing, a dispatcher stuck at seven" h={310}>
      <g opacity={a}>{baseNetwork(STUCK)}</g>
      <T x={300} y={285} s={13} a="middle" f={C.cherryText} o={b}>stuck at seven &mdash; two more could still ship</T>
    </Svg>
  );
}

// 2 · Flow network
export function FlowNetwork({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  return (
    <Svg label="A directed graph, a source and a sink, a capacity on every pipe" h={300}>
      <g opacity={a}>{baseNetwork()}</g>
      <T x={300} y={280} s={13} a="middle" f={C.latte}>flow in equals flow out, except at the source and the sink</T>
    </Svg>
  );
}

// 3 · Predict rescue
export function PredictRescue({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Could another forward-only route ever beat the stuck count of seven" h={280}>
      <g opacity={a}>
        <T x={150} y={120} s={13} a="middle" f={C.caramel}>try another forward route?</T>
        <T x={450} y={120} s={13} a="middle" f={C.cinnamon}>pull some flow back?</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>which one reaches past seven?</T>
    </Svg>
  );
}

// 4 · Stuck run
export function StuckRun({ t }: StepCtx) {
  const STEPS: Array<Partial<Record<EKey, number>>> = [
    { AB: 2, BD: 2, DE: 2, EF: 2 },
    { AB: 2, BD: 2, DE: 2, EF: 3, AC: 1, CE: 1 },
    { AB: 2, BD: 2, DE: 2, EF: 3, AC: 2, CE: 1, CD: 1 },
    { AB: 5, BD: 5, DE: 2, EF: 3, AC: 2, CE: 1, CD: 1, DF: 3 },
  ];
  const n = Math.min(STEPS.length - 1, Math.floor(seg(t, 0.2, 2.6) * STEPS.length));
  return (
    <Svg label="Four routes in order; seven units shipped, every remaining route blocked" h={310}>
      {baseNetwork(STEPS[n])}
      <T x={300} y={285} s={13} a="middle" f={C.latte}>seven units shipped &mdash; no forward route left</T>
    </Svg>
  );
}

// 5 · Residual graph
export function ResidualGraph({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const STUCK: Partial<Record<EKey, number>> = { AB: 5, BD: 5, DF: 5, AC: 2, CE: 1, CD: 1, EF: 1, DE: 2 };
  return (
    <Svg label="Each loaded pipe keeps a backward undo number beside its forward one" h={320}>
      {baseNetwork(STUCK)}
      <g opacity={a}>
        {backResidual('BD', 5)}
        {backResidual('DF', 5)}
        {backResidual('DE', 2)}
      </g>
      <T x={300} y={295} s={13} a="middle" f={C.caramel}>dashed arrows: how much of each pipe's flow could be pulled back</T>
    </Svg>
  );
}

// 6 · Rescue
export function Rescue({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const AFTER: Partial<Record<EKey, number>> = { AB: 7, BC: 2, BD: 5, CE: 3, DE: 0, DF: 6, EF: 3, AC: 2, CD: 1 };
  return (
    <Svg label="A path crosses one pipe backward, undoing earlier flow, then reaches the sink" h={320}>
      {baseNetwork(AFTER)}
      <g opacity={a}>
        {backResidual('DE', 2, C.caramel)}
      </g>
      <T x={300} y={295} s={13} a="middle" f={C.caramel}>the rescue path crosses D&rarr;E backward &mdash; total now nine</T>
    </Svg>
  );
}

// 7 · Ford-Fulkerson loop
export function FordFulkersonLoop({ t }: StepCtx) {
  const totals = [2, 3, 4, 8, 9];
  const n = Math.min(totals.length - 1, Math.floor(seg(t, 0.2, 2.6) * totals.length));
  return (
    <Svg label="Find a route with room, push its limit, repeat until none remains" h={280}>
      <g>
        {totals.map((v, i) => (
          <T key={v} x={80 + i * 95} y={120} s={16} a="middle" f={i <= n ? C.caramel : C.taupe}>{v}</T>
        ))}
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>five routes, running total after each one</T>
    </Svg>
  );
}

// 8 · Cut certificate
export function CutCertificate({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const FINAL: Partial<Record<EKey, number>> = { AB: 7, BC: 2, BD: 5, CD: 1, CE: 3, DF: 6, EF: 3, AC: 2 };
  return (
    <Svg label="The reachable depots form a split; its crossing pipes are all full" h={320}>
      <g opacity={a}>
        <ellipse cx={210} cy={150} rx={190} ry={135} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="6 4" />
      </g>
      {baseNetwork(FINAL)}
      <T x={300} y={295} s={13} a="middle" f={C.latte}>crossing capacity totals nine, matching the flow</T>
    </Svg>
  );
}

// 9 · Max-flow min-cut theorem
export function MaxFlowMinCutTheorem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Max flow equals min cut, checked on two independent networks" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={14} a="middle" f={C.caramel}>this network: nine</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={14} a="middle" f={C.cinnamon}>another network: twenty-three</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>max flow equals min cut, every time</T>
    </Svg>
  );
}

// 10 · Integrality
export function Integrality({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Whole-number capacities give a whole-number flow everywhere" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.caramel}>whole-number capacities</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={13} a="middle" f={C.caramel}>a whole-number flow</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>capacity-one pipes: flow is nothing or one</T>
    </Svg>
  );
}

// 11 · Predict acyclic
export function PredictAcyclic({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Could a maximum flow ever need a closed loop of its own flow" h={280}>
      <g opacity={a}>
        <circle cx={300} cy={130} r={55} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        {arrowHead(300, 75, Math.PI / 2 + 0.6, C.cinnamon)}
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>needed, or always wasted?</T>
    </Svg>
  );
}

// 12 · Why slow and fixable
export function WhySlowAndFixable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const b = easeOut(seg(t, 1.5, 2.5));
  return (
    <Svg label="An arbitrary route choice can take millions of pushes; breadth-first finishes in two" h={290}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.cherryText}>arbitrary: millions</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={13} a="middle" f={C.caramel}>breadth-first: two</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>the choice of route decides the running time</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A flow and a cut prove each other; next, a pairing problem as a flow of capacity one" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>flow and cut</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={12} a="middle" f={C.latte}>pairing: capacity one</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>bipartite matching and Hopcroft&ndash;Karp, next</T>
    </Svg>
  );
}
