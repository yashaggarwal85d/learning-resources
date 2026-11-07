import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = textbook structure/in-memory data; latte =
// secondary labels; taupe = data on disk (unused here); caramel = the thing to look at;
// cinnamon (rare) = the system's modification vs the textbook; cherry/cherryText = bad outcome.

// 1 · Hook: one weak pair over-merges two clusters
export function OverMergeHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="One middling-score pair joins two large clusters into one person" h={240}>
      <T x={300} y={65} s={12} a="middle" f={C.crema} o={a}>two clusters, one weak scored pair between</T>
      <T x={300} y={120} s={13} a="middle" f={C.caramel} o={b}>raise the threshold slightly past that score</T>
      <T x={300} y={150} s={12} a="middle" f={C.latte} o={b}>does the cluster split smoothly, or jump?</T>
    </Svg>
  );
}

// 2 · Union-find recap
export function UnionFindRecap({ t }: StepCtx) {
  const steps = ['find: follow parent to root', 'path compression on the way', 'union: join roots by size'];
  const shown = Math.min(steps.length, Math.floor(seg(t, 0.2, 2.0) * steps.length) + 1);
  return (
    <Svg label="find, path compression, union by size — Chapter 11's structure, reused" h={220}>
      {steps.map((s, i) => (
        <T key={s} x={300} y={65 + i * 32} s={13} a="middle" f={i < shown ? C.caramel : C.mocha}>{s}</T>
      ))}
    </Svg>
  );
}

// 3 · The chapter's match graph: three groups, two weak bridges
export function MatchGraph({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Three groups of eight records, strong pairs inside, two weak bridges between" h={240}>
      <T x={120} y={70} s={12} a="middle" f={C.crema} o={a}>group 0 (8)</T>
      <T x={300} y={70} s={12} a="middle" f={C.crema} o={a}>group 1 (8)</T>
      <T x={480} y={70} s={12} a="middle" f={C.crema} o={a}>group 2 (8)</T>
      <T x={210} y={110} s={11} a="middle" f={C.cherryText} o={b}>weak: 0.58</T>
      <T x={390} y={110} s={11} a="middle" f={C.cherryText} o={b}>weak: 0.62</T>
      <T x={300} y={160} s={11} a="middle" f={C.latte} o={b}>everything else scores 0.90 or higher</T>
    </Svg>
  );
}

// 4 · Splink's own quote
export function SplinkQuote({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Splink: clustering matched pairs is connected components over the match graph" h={230}>
      <T x={300} y={80} s={12} a="middle" f={C.crema} o={a}>cluster_pairwise_predictions_at_threshold</T>
      <T x={300} y={140} s={12} a="middle" f={C.caramel} o={b}>connected components graph clustering</T>
      <T x={300} y={168} s={11} a="middle" f={C.latte} o={b}>one union per matching pair</T>
    </Svg>
  );
}

// 5 · One record's entity id barely moves, until the weak bridges land
export function RepresentativeTrace({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.5));
  const b = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Record zero's entity id stays itself through strong pairs, then changes on the weak bridges" h={240}>
      <T x={300} y={70} s={12} a="middle" f={C.crema} o={a}>record 0's entity id, pair by pair</T>
      <Bar x={60} y={90} w={420 * a} h={10} full={420} fill={C.crema} />
      <T x={300} y={140} s={12} a="middle" f={C.caramel} o={b}>last two pairs (the bridges) finally change it</T>
    </Svg>
  );
}

// 6 · The threshold sweep, measured: two jumps
export function ThresholdSweep({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const c = easeOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="Largest cluster size: 24, then 16, then 8 — two jumps across the threshold sweep" h={250}>
      <T x={120} y={60} s={12} a="middle" f={C.crema} o={a}>below 0.58: one cluster of 24</T>
      <Bar x={60} y={75} w={160} h={10} full={160} fill={C.crema} o={a} />
      <T x={300} y={115} s={12} a="middle" f={C.caramel} o={b}>0.59 to 0.61: sixteen and eight</T>
      <Bar x={240} y={130} w={107} h={10} full={160} fill={C.caramel} o={b} />
      <T x={445} y={170} s={12} a="middle" f={C.cherryText} o={c}>0.63+: eight, eight, eight</T>
      <Bar x={420} y={185} w={53} h={10} full={160} fill={C.cherry} o={c} />
    </Svg>
  );
}

// 7 · No split operation exists
export function NoSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Union-find merges but has no operation to split a component back apart" h={220}>
      <T x={300} y={75} s={13} a="middle" f={C.crema} o={a}>union merges two roots — there is no inverse</T>
      <T x={300} y={135} s={12} a="middle" f={C.cherryText} o={b}>undoing an over-merge means rebuilding from the edge list</T>
    </Svg>
  );
}

// 8 · Lineage: same structure, a blast-radius question
export function LineageComponents({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A lineage graph's connected components are a blast radius: six nodes, then three" h={230}>
      <T x={300} y={65} s={12} a="middle" f={C.crema} o={a}>orders, customers, revenue: 6 nodes</T>
      <T x={300} y={95} s={12} a="middle" f={C.crema} o={a}>inventory, alerts: 3 nodes</T>
      <T x={300} y={140} s={12} a="middle" f={C.caramel} o={b}>a component is everything a change could reach</T>
    </Svg>
  );
}

// 9 · No shared parent array across machines; predict the round-based cost
export function DistributedAlternative({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="GraphFrames' connectedComponents is iterative, with a checkpoint interval, not one pass" h={230}>
      <T x={300} y={75} s={13} a="middle" f={C.crema} o={a}>no single shared parent array across machines</T>
      <T x={300} y={135} s={12} a="middle" f={C.caramel} o={b}>connectedComponents: iterative, checkpointed</T>
      <T x={300} y={163} s={11} a="middle" f={C.latte} o={b}>how many rounds, on this one small graph?</T>
    </Svg>
  );
}

// 10 · Ten rounds versus one pass, same answer
export function RoundsVersusPass({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="Union-find: one pass. Label propagation: ten rounds. Same final clustering." h={240}>
      <T x={150} y={70} s={13} a="middle" f={C.caramel} o={a}>union-find: one pass</T>
      <Bar x={60} y={85} w={30} h={10} full={160} fill={C.caramel} o={a} />
      <T x={450} y={70} s={13} a="middle" f={C.cinnamon} o={b}>label propagation: ten rounds</T>
      <Bar x={340} y={85} w={160} h={10} full={160} fill={C.cinnamon} o={b} />
      <T x={300} y={150} s={12} a="middle" f={C.latte} o={b}>identical clusters either way</T>
    </Svg>
  );
}

// 11 · Recap / handoff to search trees inside storage engines
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Union-find groups records in no order; the next topic keeps order itself, on disk" h={210}>
      <T x={300} y={85} s={13} a="middle" f={C.crema} o={a}>records grouped with no order among the pairs</T>
      <T x={300} y={125} s={13} a="middle" f={C.caramel} o={a}>next: keeping order itself, inside a database</T>
      <T x={300} y={153} s={11} a="middle" f={C.latte} o={a}>search trees inside storage engines</T>
    </Svg>
  );
}
