import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the problem statement's own text, or a structure/graph as
// it is; latte = secondary labels (a count, a cost); caramel = the thing to look at (the
// structural fact, the condition being tested); cinnamon (rare) = the alternative being
// compared, same side of each pair; cherry/cherryText = the bad outcome (a near-miss).

// 1 · Hook: assign reviewers to papers, which reads like scheduling and is a flow
export function ReviewerHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="Reviewers assigned to papers under a rule, a story that is really a flow problem" h={250}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>assign reviewers to papers</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>each paper needs two reviews</T>
      </g>
      <T x={300} y={165} s={13} a="middle" f={C.caramel} o={b}>it is a flow problem</T>
    </Svg>
  );
}

// 2 · Predict: of three variants, which is NP-complete?
export function PredictPairingVariant({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Three variants of a pairing story, only one of them NP-complete" h={250}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>pair items across two groups</T>
        <T x={300} y={118} s={12} a="middle" f={C.crema}>pair items within one group</T>
        <T x={300} y={151} s={12} a="middle" f={C.crema}>choose true or false, three at a time</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>which one is NP-complete?</T>
    </Svg>
  );
}

// 3 · Flow and cut
export function FlowCutShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A flow network solving the review assignment, against a near-miss that needs whole-path routing" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>capacities, a source, a sink</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>eight reviews placed, verified two ways</T>
      </g>
      <T x={300} y={165} s={12} a="middle" f={C.cherryText} o={b}>near miss: routing whole units only</T>
    </Svg>
  );
}

// 4 · Matching
export function MatchingShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A bipartite matching where every edge crosses two sides, against a near-miss with an odd cycle inside one group" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>two sides, every edge crosses</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>two methods agree: three pairs</T>
      </g>
      <T x={300} y={165} s={12} a="middle" f={C.cherryText} o={b}>near miss: an odd cycle, one group</T>
    </Svg>
  );
}

// 5 · two-SAT
export function TwoSatShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="An implication graph solved by strongly connected components, against the near-miss of a third literal per clause" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>clauses of two choices each</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>solved by strongly connected components</T>
      </g>
      <T x={300} y={165} s={12} a="middle" f={C.cherryText} o={b}>near miss: three choices per clause</T>
    </Svg>
  );
}

// 6 · Interval scheduling
export function IntervalSchedulingShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Intervals on one resource solved by an earliest-finish greedy, against a near-miss with several resources" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>intervals, one resource</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>earliest-finish greedy: four intervals</T>
      </g>
      <T x={300} y={165} s={12} a="middle" f={C.cherryText} o={b}>near miss: several resources, setup time</T>
    </Svg>
  );
}

// 7 · DP on a DAG
export function DagDpShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A longest path found by relaxing in topological order, against a near-miss where the dependency graph has a cycle" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>stages that never repeat</T>
        <T x={300} y={115} s={12} a="middle" f={C.latte}>relaxed in topological order</T>
      </g>
      <T x={300} y={165} s={12} a="middle" f={C.cherryText} o={b}>near miss: a cycle in the stages</T>
    </Svg>
  );
}

// 8 · The pattern catalogue, one page
export function PatternCatalogue({ t }: StepCtx) {
  const names = ['fast and slow pointers', 'top-k via a heap', 'k-way merge', 'matrix traversal', 'binary search on the answer', 'monotonic stack'];
  return (
    <Svg label="A one-page catalogue of recurring patterns, each a technique the course already built" h={280}>
      {names.map((name, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.3, 0.6 + i * 0.3));
        return (
          <T key={name} x={300} y={65 + i * 32} s={12} a="middle" f={C.crema} o={a}>
            {name}
          </T>
        );
      })}
    </Svg>
  );
}

// 9 · Predict: setup times between jobs on one machine
export function PredictSchedulingSetup({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A scheduling story with setup time between jobs, asking whether it is still plain interval scheduling" h={250}>
      <g opacity={a}>
        <T x={300} y={90} s={12} a="middle" f={C.crema}>jobs need setup time between them</T>
      </g>
      <T x={300} y={180} s={12} a="middle" f={C.caramel}>still plain interval scheduling?</T>
    </Svg>
  );
}

// 10 · The recognition procedure, five steps
export function RecognitionProcedure({ t }: StepCtx) {
  const steps = ['first, the budget', 'second, the operation mix', 'third, state and move', 'fourth, the shape and its near miss', 'fifth, the key invariant'];
  return (
    <Svg label="A five-step recognition procedure, ending in one sentence that could prove the match wrong" h={290}>
      {steps.map((s, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.3, 0.6 + i * 0.3));
        return (
          <T key={s} x={300} y={65 + i * 32} s={12} a="middle" f={i === 4 ? C.caramel : C.crema} o={a}>
            {s}
          </T>
        );
      })}
    </Svg>
  );
}

// 11 · The Lab: thirty unseen problems, scored by recognition accuracy
export function LabProtocol({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Thirty unseen problems, each given five minutes for only the pattern, the complexity and the invariant" h={250}>
      <g opacity={a}>
        <T x={300} y={90} s={12} a="middle" f={C.crema}>thirty unseen problems</T>
        <T x={300} y={120} s={12} a="middle" f={C.latte}>five minutes, pattern and invariant only</T>
      </g>
      <T x={300} y={180} s={12} a="middle" f={C.caramel} o={b}>score the misses, not the solves</T>
    </Svg>
  );
}

// 12 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="The whole skill as a habit: size, operations, graph, shape, invariant, repeated on the next structure" h={250}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>size, operations, graph, shape, invariant</T>
        <T x={300} y={125} s={12} a="middle" f={C.caramel}>a habit, not a body of knowledge</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: the same structures inside real systems</T>
    </Svg>
  );
}
