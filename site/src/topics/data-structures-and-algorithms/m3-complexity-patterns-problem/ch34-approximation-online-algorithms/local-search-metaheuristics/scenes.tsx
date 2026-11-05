import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the algorithm's own solution (the tour, the
// population); latte = secondary labels; taupe = not yet decided; caramel = the thing to
// look at (the move being tried, the quantity that matters); cinnamon (rare) = the
// benchmark (the true optimum); cherry/cherryText = the bad outcome (a crossing tour, a
// local optimum the search is stuck in).

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Guarantees proved so far, now set aside on purpose for the things that have none" h={260}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" serif f={C.crema}>every bound so far was proved</T>
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.caramel}>now: the things with no guarantee at all</T>
      </g>
    </Svg>
  );
}

// 2 · The hook: twelve tables, the join-order count
export function JoinOrderCount({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Twelve tables joined, the count of left-deep join orders towering over the machines that could check them" h={260}>
      <g opacity={a}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={70 + i * 36} y={170} width={24} height={30} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        ))}
        <T x={300} y={70} s={12} a="middle" f={C.latte}>left-deep join orders:</T>
        <T x={300} y={100} s={16} a="middle" f={C.caramel}>twelve factorial</T>
      </g>
      <T x={300} y={230} s={11} a="middle" f={C.latte}>bushy trees: far more still</T>
    </Svg>
  );
}

// 3 · Local search and the 2-opt move
export function TwoOptMove({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A crossing tour uncrossing itself as two edges are removed and the segment between them reversed" h={260}>
      <g opacity={a}>
        <path d="M150 90 L380 190 M380 90 L150 190" stroke={C.cherry} strokeWidth={1.8} />
        <circle cx={150} cy={90} r={4} fill={C.crema} />
        <circle cx={380} cy={90} r={4} fill={C.crema} />
        <circle cx={150} cy={190} r={4} fill={C.crema} />
        <circle cx={380} cy={190} r={4} fill={C.crema} />
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.caramel}>remove two edges, reconnect the other way</T>
    </Svg>
  );
}

// 4 · 2-opt's own limit, measured
export function TwoOptMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Over a hundred random starting tours, 2-opt reaching the true optimum less than half the time" h={260}>
      <g opacity={a}>
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={80 + i * 36} y={190 - (i < 4 ? 30 : i < 5 ? 40 : 55)} width={24} height={i < 4 ? 30 : i < 5 ? 40 : 55} fill="none" stroke={i < 4 ? C.cinnamon : C.cherry} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.cherryText}>true optimum reached well under half the time</T>
    </Svg>
  );
}

// 5 · Predict: does accepting a worse move help?
export function PredictAnnealing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A search stuck at a local optimum, with a question over whether occasionally accepting a worse move could free it" h={250}>
      <g opacity={a}>
        <path d="M100 180 Q180 60 260 150 T 420 120" fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <circle cx={260} cy={150} r={5} fill={C.cherry} />
        <T x={260} y={175} s={11} a="middle" f={C.cherryText}>stuck here</T>
      </g>
      <T x={300} y={225} s={13} a="middle" f={C.caramel}>would accepting a worse move ever help?</T>
    </Svg>
  );
}

// 6 · Simulated annealing's measured result
export function AnnealingMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A falling temperature gauge beside the search escaping its local optimum far more often than before" h={260}>
      <g opacity={a}>
        <rect x={140} y={60} width={24} height={120} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <rect x={142} y={110} width={20} height={68} fill={C.caramel} opacity={0.5} />
        <T x={152} y={50} s={10} a="middle" f={C.latte}>temperature</T>
        <path d="M220 180 Q300 60 380 150 T 460 110" fill="none" stroke={C.cinnamon} strokeWidth={1.8} />
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.cinnamon}>true optimum reached far more often, measured</T>
    </Svg>
  );
}

// 7 · Genetic search and the surprise
export function GeneticSurprise({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A population of eight tours, two parents crossing into a child, with the measured result landing worse than plain local search" h={260}>
      <g opacity={a}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={70 + i * 46} y={70} width={30} height={20} fill="none" stroke={C.taupe} strokeWidth={1.3} />
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.latte}>selection, crossover, mutation</T>
        <T x={300} y={230} s={12} a="middle" f={C.cherryText}>measured here: worse than plain local search</T>
      </g>
    </Svg>
  );
}

// 8 · PostgreSQL's GEQO, read from its own documentation
export function GeqoDocumented({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A join tree encoded as an integer string, a real planner's own documented genetic query optimiser" h={260}>
      <g opacity={a}>
        <rect x={120} y={60} width={360} height={30} fill="none" stroke={C.mocha} strokeWidth={1} />
        <T x={300} y={80} s={12} a="middle" f={C.latte} serif italic>the join tree as a string</T>
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.crema}>a steady-state search, mutation deprecated outright</T>
        <T x={300} y={225} s={12} a="middle" f={C.caramel}>below the threshold: exhaustive. at or above: this.</T>
      </g>
    </Svg>
  );
}

// 9 · Predict: which query should use it?
export function PredictGeqoThreshold({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two queries, one run once and one run constantly, with a question over which one should risk a weaker plan" h={250}>
      <g opacity={a}>
        <T x={160} y={110} s={12} a="middle" f={C.latte}>runs once an hour</T>
        <T x={440} y={110} s={12} a="middle" f={C.latte}>runs constantly</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.caramel}>which one should risk the genetic planner's weaker plan?</T>
    </Svg>
  );
}

// 10 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Three searches named beside the one thing none of them promises, with the next topic's cache waiting" h={240}>
      <g opacity={a}>
        <T x={160} y={90} s={13} a="start" f={C.crema}>local search, annealing, genetic</T>
        <T x={440} y={90} s={12} a="end" f={C.cherryText}>none says where it stops</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: a decision made before the future is known</T>
    </Svg>
  );
}
