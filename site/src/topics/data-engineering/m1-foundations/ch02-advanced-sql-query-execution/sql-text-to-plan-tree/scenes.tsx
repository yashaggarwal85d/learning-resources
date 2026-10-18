import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (chapter convention): plan trees are drawn root at the top, leaves at the bottom; caramel marks the stage or
// operator under discussion, cherryText a failure, crema data, latte labels, taupe structure.

const STAGES = ['parse', 'bind', 'rewrite', 'plan', 'execute'];

function Pipeline({ lit = -1, bad = -1, show = 5 }: { lit?: number; bad?: number; show?: number }) {
  return (
    <g>
      {STAGES.map((s, i) => (
        <g key={s} opacity={i < show ? 1 : 0.15}>
          <rect x={20 + i * 112} y={60} width={100} height={46} rx={8} fill={C.cocoa} stroke={i === bad ? C.cherryText : i === lit ? C.caramel : C.mocha} strokeWidth={i === lit || i === bad ? 3 : 1} />
          <T x={70 + i * 112} y={89} s={14} f={C.crema} a="middle">{s}</T>
          {i < 4 && <T x={126 + i * 112} y={89} s={14} f={C.taupe} a="middle">→</T>}
        </g>
      ))}
    </g>
  );
}

// 1 · Route.
export function Route({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="SQL text goes in, rows come out, with a pipeline between" h={220}>
      <T x={20} y={36} s={14} f={C.latte} o={a}>SELECT … FROM orders WHERE …</T>
      <g opacity={b}><Pipeline /></g>
      <T x={20} y={150} s={14} f={C.caramel} o={easeOut(seg(t, 2.6, 3.2))}>rows</T>
    </Svg>
  );
}

// 2 · Five stages.
export function FiveStages({ t }: StepCtx) {
  const notes = ['grammar', 'catalog', 'views', 'cheapest', 'run'];
  return (
    <Svg label="Parse, bind, rewrite, plan, execute" h={260}>
      <Pipeline lit={Math.min(4, Math.floor(t / 0.8))} />
      {notes.map((n, i) => <T key={n} x={70 + i * 112} y={140} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 0.3 + i * 0.7, 0.8 + i * 0.7))}>{n}</T>)}
    </Svg>
  );
}

// 3 · Fail predict.
export function FailPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A grammatically valid query on a missing table fails at one stage" h={260}>
      <Pipeline bad={answered ? 1 : -1} show={answered ? 2 : 5} />
      <T x={20} y={34} s={14} f={C.crema}>SELECT * FROM no_such_table WHERE x = 1</T>
      {!answered ? <T x={300} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={170} s={16} f={C.cherryText} a="middle" w={700}>relation "no_such_table" does not exist</T>}
    </Svg>
  );
}

// 4 · Bind.
export function Bind({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A call named count becomes an aggregate node after the catalog lookup" h={260}>
      <rect x={25} y={50} width={170} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={110} y={78} s={14} f={C.crema} a="middle">FuncCall: count</T>
      <line x1={195} y1={72} x2={290} y2={72} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <rect x={290} y={50} width={130} height={44} rx={8} fill={C.roast} stroke={C.caramel} opacity={a} />
      <T x={355} y={78} s={13} f={C.latte} a="middle" o={a}>catalog</T>
      <line x1={420} y1={72} x2={470} y2={72} stroke={C.caramel} strokeWidth={2} opacity={b} />
      <rect x={470} y={50} width={110} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={b} />
      <T x={525} y={78} s={14} f={C.caramel} a="middle" w={700} o={b}>Aggref</T>
      <T x={300} y={170} s={14} f={C.latte} a="middle" o={b}>same name, now it has a meaning</T>
    </Svg>
  );
}

// 5 · View erased.
export function ViewErased({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="A query over a view is rewritten into a query over the base table" h={280}>
      <rect x={30} y={50} width={200} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} opacity={1 - 0.6 * a} />
      <T x={130} y={78} s={14} f={C.crema} a="middle" o={1 - 0.6 * a}>SELECT … FROM paid_orders</T>
      <rect x={30} y={130} width={200} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={130} y={158} s={14} f={C.crema} a="middle">view: orders WHERE paid</T>
      <line x1={230} y1={110} x2={330} y2={110} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <rect x={330} y={88} width={240} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={450} y={116} s={13} f={C.crema} a="middle" o={a}>FROM orders WHERE paid …</T>
      <T x={300} y={230} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>the planner never sees the view</T>
    </Svg>
  );
}

function Tree({ nodes, edges, lit = '' }: { nodes: Record<string, [number, number, string]>; edges: [string, string][]; lit?: string }) {
  return (
    <g>
      {edges.map(([a, b]) => <line key={a + b} x1={nodes[a][0]} y1={nodes[a][1] + 18} x2={nodes[b][0]} y2={nodes[b][1] - 18} stroke={C.taupe} strokeWidth={2} />)}
      {Object.entries(nodes).map(([k, [x, y, l]]) => (
        <g key={k}>
          <rect x={x - 62} y={y - 18} width={124} height={36} rx={8} fill={C.cocoa} stroke={lit === k ? C.caramel : C.mocha} strokeWidth={lit === k ? 3 : 1} />
          <T x={x} y={y + 5} s={13} f={C.crema} a="middle">{l}</T>
        </g>
      ))}
    </g>
  );
}

// 6 · Logical vs physical.
export function LogicalPhysical({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.4, 2.6));
  return (
    <Svg label="A logical algebra tree and the physical algorithms chosen for each operator" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>logical: what</T>
      <Tree nodes={{ p: [120, 70, 'π'], s: [120, 130, 'σ status'], o: [120, 190, 'orders']}} edges={[['p', 's'], ['s', 'o']]} />
      <g opacity={a}>
        <T x={340} y={32} s={13} f={C.caramel}>physical: how</T>
        <Tree nodes={{ p: [440, 70, 'Project'], s: [440, 130, 'Filter'], o: [440, 190, 'Index Scan']}} edges={[['p', 's'], ['s', 'o']]} lit="o" />
      </g>
    </Svg>
  );
}

// 7 · Paths.
export function Paths({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A scan has at least two paths and a join at least three; the cheapest is chosen" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>scan of orders</T>
      <rect x={25} y={48} width={150} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} opacity={a} />
      <T x={100} y={70} s={13} f={C.crema} a="middle" o={a}>sequential</T>
      <rect x={190} y={48} width={150} height={34} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={265} y={70} s={13} f={C.crema} a="middle" o={a}>via an index</T>
      <T x={25} y={136} s={14} f={C.latte}>join</T>
      {['nested loop', 'merge', 'hash'].map((j, i) => (
        <g key={j} opacity={b}><rect x={25 + i * 165} y={148} width={150} height={34} rx={8} fill={C.cocoa} stroke={i === 2 ? C.caramel : C.mocha} strokeWidth={i === 2 ? 2 : 1} /><T x={100 + i * 165} y={170} s={13} f={C.crema} a="middle">{j}</T></g>
      ))}
      <T x={300} y={240} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>each path is costed; the cheapest wins</T>
    </Svg>
  );
}

// 8 · Properties.
export function Properties({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="An index scan provides an order; ORDER BY requires one; a match deletes the sort" h={300}>
      <Tree nodes={{ o: [150, 70, 'ORDER BY event_time'], s: [150, 170, 'Index Scan event_time']}} edges={[['o', 's']]} lit="s" />
      <T x={330} y={74} s={14} f={C.cinnamon} o={a}>requires: event_time order</T>
      <T x={330} y={174} s={14} f={C.caramel} o={a}>provides: event_time order</T>
      <rect x={150 - 62} y={110} width={124} height={34} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={1 - b} />
      <T x={150} y={132} s={13} f={C.cherryText} a="middle" o={1 - b}>Sort</T>
      <T x={330} y={232} s={15} f={C.caramel} o={b}>a match:</T>
      <T x={330} y={254} s={15} f={C.caramel} o={b}>no Sort node needed</T>
    </Svg>
  );
}

// 9 · Predict sort.
export function SortPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="With an index on event_time, ORDER BY needs no separate Sort" h={280}>
      <Tree nodes={{ l: [150, 60, 'Limit'], s: [150, 140, 'Index Scan']}} edges={[['l', 's']]} lit="s" />
      {answered ? <T x={350} y={140} s={16} f={C.caramel} w={700}>no Sort node</T> : <T x={400} y={150} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}

// 10 · Read the tree.
export function ReadTree({ t }: StepCtx) {
  const k = Math.min(3, Math.floor(t / 0.9));
  const nodes: Record<string, [number, number, string]> = { r: [300, 50, 'Aggregate'], j: [300, 120, 'Hash Join'], a: [170, 200, 'Scan orders'], b: [430, 200, 'Scan customers'] };
  const order = ['a', 'b', 'j', 'r'];
  return (
    <Svg label="Read the plan from the leaves up" h={300}>
      <Tree nodes={nodes} edges={[['r', 'j'], ['j', 'a'], ['j', 'b']]} lit={order[k]} />
      <T x={300} y={270} s={13} f={C.latte} a="middle">leaves first, root last</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['meaning is fixed', 'by the end of rewrite'], ['choices are made', 'in the planner'], ['read plans', 'from the leaves up']];
  return (
    <Svg label="Three things to remember about the pipeline" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveRewrite({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The stage that expands views" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>view → base tables:</T>
      {answered ? <T x={40} y={140} s={24} f={C.caramel} w={700}>rewrite</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProvePath({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The planner's name for a candidate" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>a candidate implementation →</T>
      {answered ? <T x={40} y={140} s={24} f={C.caramel} w={700}>a path</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
