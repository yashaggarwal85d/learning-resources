import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own, shared with topic 69): crema = a vertex, and
// an edge drawn as a pipe at its capacity; latte = secondary labels; taupe = an edge carrying no
// flow, not on the current path; caramel = the thing to look at (the augmenting/alternating path
// being pushed or flipped, the cover vertices); cinnamon (rare) = the alternative being compared
// (one-at-a-time against Hopcroft-Karp's phases); cherry/cherryText = the bad outcome (a free
// vertex no matching reaches, the Hall obstruction). A matched edge is drawn thick; an unmatched
// one thin.

type LPos = Record<string, [number, number]>;

const TASKS: LPos = { t1: [120, 50], t2: [120, 120], t3: [120, 190], t4: [120, 260] };
const MACHINES: LPos = { m1: [480, 50], m2: [480, 120], m3: [480, 190], m4: [480, 260] };

const TASK_MACHINE: Record<string, string[]> = {
  t1: ['m1', 'm2'],
  t2: ['m1'],
  t3: ['m2', 'm3'],
  t4: ['m3', 'm4'],
};

function dot(id: string, pos: [number, number], colour: string = C.crema, filled = false) {
  const [x, y] = pos;
  return (
    <g key={id}>
      <circle cx={x} cy={y} r={14} fill={filled ? colour : 'none'} stroke={colour} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} a="middle" f={filled ? C.taupe : colour}>{id}</T>
    </g>
  );
}

function tmEdge(u: string, v: string, colour: string = C.taupe, thick = false) {
  const [x1, y1] = TASKS[u];
  const [x2, y2] = MACHINES[v];
  return <path key={`${u}-${v}`} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={colour} strokeWidth={thick ? 2.8 : 1.2} fill="none" />;
}

function taskMachineGraph(matching: Record<string, string>, freeTask?: string, freeMachine?: string) {
  const matchedSet = new Set(Object.entries(matching).map(([u, v]) => `${u}-${v}`));
  return (
    <g>
      {Object.entries(TASK_MACHINE).flatMap(([u, vs]) =>
        vs.map((v) => tmEdge(u, v, matchedSet.has(`${u}-${v}`) ? C.caramel : C.taupe, matchedSet.has(`${u}-${v}`)))
      )}
      {Object.keys(TASKS).map((u) => dot(u, TASKS[u], u === freeTask ? C.cherryText : C.crema))}
      {Object.keys(MACHINES).map((v) => dot(v, MACHINES[v], v === freeMachine ? C.cherryText : C.crema))}
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const GREEDY = { t1: 'm1', t3: 'm2', t4: 'm3' };
  return (
    <Svg label="Four tasks, four machines, a greedy scan leaves one task stranded" h={330}>
      <g opacity={a}>{taskMachineGraph(GREEDY, 't2')}</g>
      <T x={300} y={315} s={13} a="middle" f={C.cherryText}>t2 is stranded, though a full match exists</T>
    </Svg>
  );
}

// 2 · Matching as flow
export function MatchingAsFlow({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A source into every task, a sink out of every machine, every edge capacity one" h={330}>
      <g opacity={a}>
        <T x={40} y={180} s={13} a="middle" f={C.latte}>s</T>
        <T x={560} y={180} s={13} a="middle" f={C.latte}>t</T>
      </g>
      {taskMachineGraph({})}
      <T x={300} y={315} s={13} a="middle" f={C.latte}>a matching is a flow of the identical value</T>
    </Svg>
  );
}

// 3 · Greedy matching
export function GreedyMatching({ t }: StepCtx) {
  const GREEDY = { t1: 'm1', t3: 'm2', t4: 'm3' };
  return (
    <Svg label="The greedy scan matches three of four tasks; m4 sits idle" h={330}>
      {taskMachineGraph(GREEDY, 't2', 'm4')}
      <T x={300} y={315} s={13} a="middle" f={C.latte}>three matched, one task and one machine both free</T>
    </Svg>
  );
}

// 4 · Predict reroute
export function PredictReroute({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Does reaching the maximum need one chain of adjustments, or a restart" h={280}>
      <g opacity={a}>
        <T x={150} y={120} s={13} a="middle" f={C.caramel}>one chain of adjustments</T>
        <T x={450} y={120} s={13} a="middle" f={C.cinnamon}>restart from nothing</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>which one reaches four?</T>
    </Svg>
  );
}

// 5 · Zig-zag reroute
export function ZigZagReroute({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 0.2, 2.6) * 4));
  const STAGES: Array<Record<string, string>> = [
    { t1: 'm1', t3: 'm2', t4: 'm3' },
    { t2: 'm1', t3: 'm2', t4: 'm3' },
    { t2: 'm1', t1: 'm2', t4: 'm3' },
    { t2: 'm1', t1: 'm2', t3: 'm3', t4: 'm4' },
  ];
  return (
    <Svg label="One chain flips four edges in turn, reaching every task matched" h={330}>
      {taskMachineGraph(STAGES[n])}
      <T x={300} y={315} s={13} a="middle" f={C.caramel}>t2 takes m1, t1 takes m2, t3 takes m3, t4 takes m4</T>
    </Svg>
  );
}

// 6 · Berge's lemma
export function BergeLemma({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="No free-to-free chain anywhere means the matching is already maximum" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.caramel}>no chain left</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={13} a="middle" f={C.latte}>matching is maximum</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>one line from the flow theorem already proved</T>
    </Svg>
  );
}

// 7 · One at a time
export function OneAtATime({ t }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.2, 2.4) * 4) + 1);
  return (
    <Svg label="One search per free task, each costing the edge count" h={280}>
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x={100 + i * 100} y={80} width={70} height={30} fill="none" stroke={i < n ? C.caramel : C.taupe} strokeWidth={1.6} />
      ))}
      <T x={300} y={200} s={13} a="middle" f={C.latte}>as many searches as tasks, each an edge-count search</T>
    </Svg>
  );
}

// 8 · Hopcroft-Karp phase
export function HopcroftKarpPhase({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  return (
    <Svg label="Layers built from every free task at once; disjoint shortest chains flip together" h={300}>
      <g opacity={a}>
        {[0, 1, 2].map((layer) => (
          <line key={layer} x1={100 + layer * 150} y1={30} x2={100 + layer * 150} y2={270} stroke={C.taupe} strokeWidth={1} strokeDasharray="3 4" />
        ))}
        {[60, 140, 220].map((y, i) => (
          <circle key={i} cx={100} cy={y} r={10} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={290} s={13} a="middle" f={C.latte}>every disjoint shortest chain flips in the same beat</T>
    </Svg>
  );
}

// 9 · Predict phase count
export function PredictPhaseCount({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Does the phase count scale with tasks, edges, or something smaller" h={280}>
      <g opacity={a}>
        <T x={120} y={110} s={12} a="middle" f={C.cinnamon}>tasks</T>
        <T x={300} y={110} s={12} a="middle" f={C.cinnamon}>edges</T>
        <T x={480} y={110} s={12} a="middle" f={C.caramel}>something smaller</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>which one bounds the phase count?</T>
    </Svg>
  );
}

// 10 · Measured gap
export function MeasuredGap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A handful of phases against hundreds of one-at-a-time searches" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={13} a="middle" f={C.cinnamon}>one-at-a-time: hundreds</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={13} a="middle" f={C.caramel}>Hopcroft-Karp: a handful</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>a thousand-plus-thousand graph, measured directly</T>
    </Svg>
  );
}

// 11 · König's theorem
export function KonigTheorem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const FULL = { t1: 'm2', t2: 'm1', t3: 'm3', t4: 'm4' };
  return (
    <Svg label="The cover is read straight off the last search, no extra work" h={330}>
      {taskMachineGraph(FULL)}
      <g opacity={a}>
        {Object.keys(TASKS).map((u) => (
          <circle key={`cov-${u}`} cx={TASKS[u][0]} cy={TASKS[u][1]} r={19} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" />
        ))}
      </g>
      <T x={300} y={315} s={13} a="middle" f={C.latte}>matching size four, cover size four, read off together</T>
    </Svg>
  );
}

// 12 · Hall obstruction
export function HallObstruction({ t }: StepCtx) {
  const HTASKS: LPos = { t1: [120, 90], t2: [120, 170], t3: [120, 250] };
  const HMACHINES: LPos = { m1: [480, 90], m2: [480, 170], m3: [480, 250] };
  const edges: Array<[string, string]> = [['t1', 'm1'], ['t2', 'm1'], ['t3', 'm2'], ['t3', 'm3']];
  const matched = new Set(['t1-m1', 't3-m2']);
  const a = easeOut(seg(t, 0.1, 1.6));
  return (
    <Svg label="Two tasks sharing one machine: a matching of two, a cover pointing at the clash" h={330}>
      {edges.map(([u, v]) => {
        const [x1, y1] = HTASKS[u];
        const [x2, y2] = HMACHINES[v];
        const key = `${u}-${v}`;
        return <path key={key} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={matched.has(key) ? C.caramel : C.taupe} strokeWidth={matched.has(key) ? 2.8 : 1.2} fill="none" />;
      })}
      {Object.keys(HTASKS).map((u) => dot(u, HTASKS[u], u === 't2' ? C.cherryText : C.crema))}
      {Object.keys(HMACHINES).map((v) => dot(v, HMACHINES[v], C.crema))}
      <g opacity={a}>
        <circle cx={HMACHINES.m1[0]} cy={HMACHINES.m1[1]} r={19} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" />
        <circle cx={HTASKS.t3[0]} cy={HTASKS.t3[1]} r={19} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" />
      </g>
      <T x={300} y={305} s={13} a="middle" f={C.latte}>cover: m1 and t3, size two, matching two</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Many equal-length chains flip together; next, divide-and-conquer design" h={280}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>phases replace a chain count</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={12} a="middle" f={C.latte}>next: a problem's own structure</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>divide-and-conquer design, next</T>
    </Svg>
  );
}
