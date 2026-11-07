import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = textbook structure/in-memory data; latte =
// secondary labels; taupe = data on disk/spilled (unused here); caramel = the thing to look at;
// cinnamon (rare) = the system's modification vs the textbook; cherry/cherryText = bad outcome.

// 1 · Hook: a chain and a fan-out compete for free slots
export function OrchestratorHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="A chain of three and a fan-out of five tasks compete for free worker slots" h={240}>
      <g opacity={a}>
        <T x={300} y={70} s={13} a="middle" f={C.crema}>four thousand tasks, two hundred ready</T>
        <T x={300} y={97} s={12} a="middle" f={C.latte}>thirty-two free slots decide what runs</T>
      </g>
      <T x={170} y={155} s={12} a="middle" f={C.crema} o={b}>chain of three below</T>
      <T x={430} y={155} s={12} a="middle" f={C.crema} o={b}>fan-out of five below</T>
      <T x={300} y={195} s={12} a="middle" f={C.caramel} o={b}>which runs first, which finishes sooner?</T>
    </Svg>
  );
}

// 2 · Kahn's algorithm recap
export function KahnRecap({ t }: StepCtx) {
  const steps = ['in-degree = 0 → ready', 'pop ready task', 'decrement children', 'push new zeros'];
  const shown = Math.min(steps.length, Math.floor(seg(t, 0.2, 2.2) * steps.length) + 1);
  return (
    <Svg label="Kahn's algorithm: in-degree counters, a ready set, pop and decrement" h={240}>
      {steps.map((s, i) => (
        <T key={s} x={300} y={60 + i * 32} s={13} a="middle" f={i < shown ? C.caramel : C.mocha}>{s}</T>
      ))}
    </Svg>
  );
}

// 3 · The chapter's DAG drawn left to right by duration
export function ChapterDag({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const c = easeOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="A chain, a fan-out and a longer narrow chain, drawn by duration" h={260}>
      <T x={90} y={60} s={12} a="middle" f={C.crema} o={a}>A→B→C→D</T>
      <Bar x={40} y={75} w={160 * a} h={10} full={160} fill={C.caramel} />
      <T x={90} y={105} s={11} a="middle" f={C.latte} o={a}>chain of four</T>

      <T x={300} y={150} s={12} a="middle" f={C.crema} o={b}>W → five children</T>
      <Bar x={250} y={165} w={100 * b} h={10} full={100} fill={C.crema} />
      <T x={300} y={195} s={11} a="middle" f={C.latte} o={b}>wide fan-out</T>

      <T x={500} y={60} s={12} a="middle" f={C.crema} o={c}>N→N1→N2→N3</T>
      <Bar x={450} y={75} w={190 * c} h={10} full={190} fill={C.cinnamon} />
      <T x={500} y={105} s={11} a="middle" f={C.latte} o={c}>longest chain</T>
    </Svg>
  );
}

// 4 · Airflow's documentation on priority_weight and the downstream rule
export function AirflowWeightDocs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="priority_weight defaults to one; the default rule sums downstream descendants" h={230}>
      <T x={300} y={75} s={13} a="middle" f={C.crema} o={a}>priority_weight: default one, any integer</T>
      <T x={300} y={135} s={13} a="middle" f={C.caramel} o={b}>downstream: sum of all descendants' weight</T>
      <T x={300} y={165} s={11} a="middle" f={C.latte} o={b}>Airflow's default weighting method</T>
    </Svg>
  );
}

// 5 · The exact formula from priority_strategy.py and node.py
export function DownstreamFormula({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="own weight plus the weight of every id in get_flat_relative_ids, a set" h={240}>
      <T x={300} y={75} s={12} a="middle" f={C.crema} o={a} serif>weight(t) = own(t) + Σ own(d)</T>
      <T x={300} y={103} s={11} a="middle" f={C.latte} o={a} serif>for d in get_flat_relative_ids(t)</T>
      <T x={300} y={160} s={12} a="middle" f={C.caramel} o={b}>a set[str] — each descendant counted once</T>
      <T x={300} y={188} s={11} a="middle" f={C.latte} o={b}>never once per path reaching it</T>
    </Svg>
  );
}

// 6 · Prediction measured: fan-out runs first, chain finish time ties
export function PredictionMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Fan-out starts first by weight, but the chain's own finish time is identical" h={250}>
      <T x={150} y={55} s={12} a="middle" f={C.latte} o={a}>chain weight: four</T>
      <T x={450} y={55} s={12} a="middle" f={C.caramel} o={a}>fan-out weight: six</T>
      <T x={300} y={90} s={11} a="middle" f={C.crema} o={a}>fan-out starts first</T>
      <T x={300} y={150} s={13} a="middle" f={C.caramel} o={b}>chain's own last task finishes at step ten</T>
      <T x={300} y={178} s={11} a="middle" f={C.latte} o={b}>either order — same finish time</T>
    </Svg>
  );
}

// 7 · Weight set to duration flips the chain/fan-out ranking
export function DurationWeighted({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Priority_weight set to duration: the chain now outranks the fan-out" h={240}>
      <T x={150} y={60} s={12} a="middle" f={C.caramel} o={a}>chain weight: ten</T>
      <T x={450} y={60} s={12} a="middle" f={C.latte} o={a}>fan-out weight: six</T>
      <T x={300} y={100} s={11} a="middle" f={C.crema} o={a}>now the chain starts first</T>
      <T x={300} y={160} s={12} a="middle" f={C.cinnamon} o={b}>own weight → own duration, not one</T>
    </Svg>
  );
}

// 8 · Three-way divergence: duration-weighted rule finishes the chain later
export function ThreeWayDivergence({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  const c = easeOut(seg(t, 2.5, 3.5));
  return (
    <Svg label="Adding the third branch: default finishes the chain at ten, critical at eleven" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.crema} o={a}>chain, fan-out and longest chain, together</T>
      <T x={170} y={110} s={13} a="middle" f={C.caramel} o={b}>default rule: finishes at ten</T>
      <Bar x={60} y={125} w={100} h={10} full={110} fill={C.caramel} o={b} />
      <T x={430} y={110} s={13} a="middle" f={C.cherryText} o={c}>duration rule: finishes at eleven</T>
      <Bar x={320} y={125} w={110} h={10} full={110} fill={C.cherry} o={c} />
      <T x={300} y={175} s={12} a="middle" f={C.latte} o={c}>worse here, not a general claim</T>
    </Svg>
  );
}

// 9 · Unlimited workers: makespan is the true critical path
export function UnlimitedCriticalPath({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="With unlimited workers, the makespan is the longest chain by duration" h={240}>
      <T x={300} y={65} s={12} a="middle" f={C.crema} o={a}>no worker limit at all</T>
      <T x={300} y={120} s={13} a="middle" f={C.caramel} o={b}>makespan = longest chain by duration</T>
      <T x={300} y={150} s={11} a="middle" f={C.latte} o={b}>the narrow long chain, not the watched one</T>
    </Svg>
  );
}

// 10 · Graham's list-scheduling bound
export function GrahamBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Any list-scheduling order is within (2 - 1/m) times the true optimum" h={240}>
      <T x={300} y={75} s={13} a="middle" f={C.crema} o={a} serif>makespan ≤ (2 − 1/m) · optimal</T>
      <T x={300} y={135} s={12} a="middle" f={C.caramel} o={b}>both measured runs land inside the bound</T>
      <T x={300} y={163} s={11} a="middle" f={C.latte} o={b}>a guarantee for any ready-queue order</T>
    </Svg>
  );
}

// 11 · Cycle rejection: Kahn's leftover set vs DFS naming one edge
export function CycleRejection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  const c = easeOut(seg(t, 2.5, 3.5));
  return (
    <Svg label="Kahn leaves the whole stuck set; a three-colour DFS names the one faulty task" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.cherryText} o={a}>a planted edge closes a cycle</T>
      <T x={150} y={110} s={12} a="middle" f={C.crema} o={b}>Kahn: stuck set</T>
      <T x={150} y={135} s={11} a="middle" f={C.latte} o={b}>B, C, D — all of them</T>
      <T x={450} y={110} s={12} a="middle" f={C.caramel} o={c}>DFS: one faulty task</T>
      <T x={450} y={135} s={11} a="middle" f={C.cherryText} o={c}>C — names the closing edge</T>
      <T x={300} y={190} s={11} a="middle" f={C.latte} o={c}>check_cycle runs before any task starts</T>
    </Svg>
  );
}

// 12 · Recap / handoff to union-find
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="The scheduler's graph was acyclic by construction; the next one arrives edge by edge" h={220}>
      <T x={300} y={85} s={13} a="middle" f={C.crema} o={a}>a graph rejected if it ever had a cycle</T>
      <T x={300} y={125} s={13} a="middle" f={C.caramel} o={a}>next: a graph built one edge at a time</T>
      <T x={300} y={153} s={11} a="middle" f={C.latte} o={a}>union-find inside entity resolution</T>
    </Svg>
  );
}
