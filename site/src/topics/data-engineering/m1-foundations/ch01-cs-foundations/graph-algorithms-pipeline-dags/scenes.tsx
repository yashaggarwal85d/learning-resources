import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the task/path under discussion, cherry/cherryText = a cycle or a bad
// outcome, taupe = quiet/waiting, latte = labels, crema = data, cinnamon = the alternative/off-path.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// Shop pipeline layout, shared by several scenes.
const NODES = {
  ingest_events: { x: 60, y: 60, label: 'ingest' },
  load_customers: { x: 60, y: 220, label: 'load_cust' },
  clean: { x: 200, y: 60, label: 'clean' },
  load_orders: { x: 340, y: 30, label: 'load_orders' },
  events_metrics: { x: 340, y: 150, label: 'metrics' },
  daily_revenue: { x: 460, y: 90, label: 'revenue' },
  publish: { x: 560, y: 140, label: 'publish' },
};
type NodeKey = keyof typeof NODES;
const EDGES: [NodeKey, NodeKey][] = [
  ['ingest_events', 'clean'],
  ['clean', 'load_orders'],
  ['clean', 'events_metrics'],
  ['load_orders', 'daily_revenue'],
  ['load_customers', 'daily_revenue'],
  ['daily_revenue', 'publish'],
  ['events_metrics', 'publish'],
];

function Dag({ lit, edgeLit, o = 1 }: { lit?: (k: NodeKey) => string | null; edgeLit?: (a: NodeKey, b: NodeKey) => boolean; o?: number }) {
  return (
    <g opacity={o}>
      {EDGES.map(([a, b], i) => {
        const pa = NODES[a], pb = NODES[b];
        const on = edgeLit?.(a, b) ?? false;
        return <line key={i} x1={pa.x + 22} y1={pa.y} x2={pb.x - 22} y2={pb.y} stroke={on ? C.caramel : C.mocha} strokeWidth={on ? 3 : 1.5} />;
      })}
      {(Object.keys(NODES) as NodeKey[]).map((k) => {
        const n = NODES[k];
        const fill = lit?.(k) ?? C.cocoa;
        return (
          <g key={k}>
            <rect x={n.x - 24} y={n.y - 14} width={48} height={28} rx={6} fill={fill} stroke={C.taupe} strokeWidth={1} />
            <T x={n.x} y={n.y + 4} s={12} f={fill === C.caramel ? C.espresso : C.crema} a="middle">{n.label}</T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · The pipeline is a graph.
export function Problem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="The shop pipeline drawn as a graph: seven tasks and seven dependencies, from ingest through to publish" h={300}>
      <Dag o={a} />
      <T x={300} y={270} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>7 tasks, 7 dependencies</T>
    </Svg>
  );
}

// 2 · Directed and acyclic: a DAG.
export function DagDefinition({ t }: StepCtx) {
  const dir = easeOut(seg(t, 0.3, 1.2));
  const loop = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Edges point one way, and no path loops back on itself: a directed acyclic graph" h={280}>
      <line x1={60} y1={80} x2={260} y2={80} stroke={C.caramel} strokeWidth={3} opacity={dir} />
      <path d="M260 80 l-14 -7 v14 Z" fill={C.caramel} opacity={dir} />
      <T x={160} y={60} s={14} f={C.crema} a="middle" o={dir}>directed: one way</T>

      <path d="M400 140 A 60 60 0 1 1 460 200" stroke={C.cherry} strokeWidth={3} fill="none" opacity={loop} />
      <path d="M460 200 l 4 -16 l 14 8 Z" fill={C.cherry} opacity={loop} />
      <T x={430} y={240} s={14} f={C.cherryText} a="middle" o={loop}>not allowed: a loop</T>
    </Svg>
  );
}

// 3 · Predict: what reruns after clean changes?
export function DownstreamPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const DOWN: NodeKey[] = ['load_orders', 'events_metrics', 'daily_revenue', 'publish'];
  return (
    <Svg label="Clean changes; everything reachable forward from it must rerun, and the two roots above it stay untouched" h={300}>
      <Dag o={1} lit={(k) => (k === 'clean' ? C.cherry : answered && DOWN.includes(k) ? C.caramel : C.cocoa)} edgeLit={(a, b) => answered && (a === 'clean' || DOWN.includes(a)) && DOWN.includes(b) || (answered && a === 'clean' && DOWN.includes(b))} />
      {!answered && <T x={300} y={270} s={16} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={270} s={14} f={C.caramel} a="middle">downstream of clean: reruns</T>}
    </Svg>
  );
}

// 4 · Forward or backward, one traversal each.
export function ReachabilityTraversal({ t }: StepCtx) {
  const fwd = easeOut(seg(t, 0.3, 1.6));
  const bwd = easeOut(seg(t, 1.9, 3.2));
  const DOWN: NodeKey[] = ['load_orders', 'events_metrics', 'daily_revenue', 'publish'];
  const UP: NodeKey[] = ['ingest_events', 'clean', 'load_orders', 'load_customers'];
  return (
    <Svg label="Walking edges forward finds descendants; walking them backward from a task finds its ancestors" h={300}>
      <T x={25} y={34} s={13} f={C.latte} o={fwd}>forward from clean</T>
      <Dag o={fwd} lit={(k) => (DOWN.includes(k) ? C.caramel : k === 'clean' ? C.cherry : C.cocoa)} />
      <T x={25} y={270} s={13} f={C.latte} o={bwd}>backward from daily_revenue: ancestors</T>
    </Svg>
  );
}

// 5 · Kahn's algorithm: zero in-degree runs first.
export function KahnAlgorithm({ t }: StepCtx) {
  const indeg: Record<NodeKey, number> = {
    ingest_events: 0, load_customers: 0, clean: 1, load_orders: 1, events_metrics: 1, daily_revenue: 2, publish: 2,
  };
  const a = easeOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="Every task's in-degree, its unmet dependencies; the roots at zero start first, and finishing a task drops its successors' counts" h={300}>
      <Dag o={1} lit={(k) => (indeg[k] === 0 ? C.caramel : C.cocoa)} />
      {(Object.keys(NODES) as NodeKey[]).map((k) => {
        const n = NODES[k];
        return <T key={k} x={n.x} y={n.y - 24} s={11} f={C.taupe} a="middle" o={a}>{indeg[k]}</T>;
      })}
      <T x={300} y={270} s={13} f={C.crema} a="middle" o={a}>in-degree 0 → ready now</T>
    </Svg>
  );
}

// 6 · Predict: how many waves to run them all?
export function WavesPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const WAVES: NodeKey[][] = [
    ['ingest_events', 'load_customers'],
    ['clean'],
    ['load_orders', 'events_metrics'],
    ['daily_revenue'],
    ['publish'],
  ];
  return (
    <Svg label="Five waves of ready tasks: the two roots, then clean, then the two branches together, then revenue, then publish" h={300}>
      {!answered && <T x={300} y={120} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered &&
        WAVES.map((wave, i) => {
          const a = easeOutBack(seg(t, i * 0.3, i * 0.3 + 0.6));
          return (
            <g key={i} opacity={clamp(a)}>
              <T x={30 + i * 108} y={60} s={13} f={C.latte} a="middle">wave {i + 1}</T>
              {wave.map((k, j) => (
                <rect key={k} x={30 + i * 108 - 36} y={80 + j * 36} width={72} height={28} rx={6} fill={C.caramel} />
              ))}
            </g>
          );
        })}
    </Svg>
  );
}

// 7 · A cycle means no order exists.
export function CycleDetection({ t }: StepCtx) {
  const stuck = easeOut(seg(t, 0.3, 1.6));
  const flag = easeOutBack(seg(t, 1.8, 2.6));
  return (
    <Svg label="A back edge into a task already on the current path closes a loop; an orchestrator checks for this before anything runs" h={300}>
      <Dag o={1} lit={() => C.cocoa} edgeLit={() => false} />
      <path d="M560 140 Q 300 -30 60 60" stroke={C.cherry} strokeWidth={2.5} fill="none" strokeDasharray="6 6" opacity={stuck} />
      <g transform={`translate(300 260) scale(${flag})`} opacity={clamp(flag)}>
        <rect x={-110} y={-24} width={220} height={48} rx={24} fill={C.roast} stroke={C.cherry} strokeWidth={2} />
        <T x={0} y={6} s={15} f={C.cherryText} a="middle" w={600}>cycle detected</T>
      </g>
    </Svg>
  );
}

// 8 · The critical path, not the task sum.
export function CriticalPathIntro({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Not the sum of every task, and not the longest chain of tasks: the longest path weighted by duration is the critical path" h={300}>
      <T x={25} y={44} s={15} f={C.taupe} o={a} w={600}>sum of all tasks</T>
      <T x={25} y={74} s={15} f={C.taupe} o={a} w={600}>longest chain of tasks</T>
      <T x={25} y={130} s={18} f={C.caramel} o={b} w={700}>longest path, weighted by duration</T>
      <T x={25} y={166} s={14} f={C.crema} o={b}>the critical path</T>
      <T x={300} y={240} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>a DAG turns a hard problem into one linear sweep</T>
    </Svg>
  );
}

// 9 · Predict: speed up a task off the path.
export function SlackPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The revenue branch finishes at fifty five minutes, under the metrics branch's sixty two; speeding up a task on the shorter branch changes nothing" h={300}>
      <T x={160} y={60} s={14} f={C.latte} a="middle">revenue branch</T>
      <rect x={60} y={74} width={200} height={28} rx={6} fill={C.cinnamon} />
      <T x={160} y={94} s={13} f={C.espresso} a="middle" w={600}>55 min</T>

      <T x={440} y={60} s={14} f={C.latte} a="middle">metrics branch</T>
      <rect x={340} y={74} width={226} height={28} rx={6} fill={C.caramel} />
      <T x={453} y={94} s={13} f={C.espresso} a="middle" w={600}>62 min</T>

      {!answered && <T x={300} y={190} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={190} s={18} f={C.cherryText} a="middle" w={600}>not one minute sooner: it has slack</T>}
    </Svg>
  );
}

// 10 · Back to the shop: order, cycle, clock, split.
export function Verdict({ t }: StepCtx) {
  const rows = ['order the tasks', 'catch the cycle', 'trace what reruns', 'find the clock', 'split independent work'];
  return (
    <Svg label="Five linear-time questions a graph answers for a pipeline: order, cycle, downstream, critical path and components" h={300}>
      {rows.map((r, i) => {
        const o = easeOut(seg(t, 0.2 + i * 0.3, 0.7 + i * 0.3));
        return <T key={r} x={25} y={50 + i * 40} s={16} f={C.crema} o={o}>{r}</T>;
      })}
    </Svg>
  );
}
