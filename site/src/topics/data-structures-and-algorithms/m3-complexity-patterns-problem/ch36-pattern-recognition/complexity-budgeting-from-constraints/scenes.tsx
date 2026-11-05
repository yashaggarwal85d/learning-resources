import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the problem statement's own text and a structure as it is;
// latte = secondary labels (n, a count, a cost); caramel = the thing to look at (the signal, the
// chosen growth rate); cinnamon (rare) = the alternative being compared (the budget line against
// the cost); cherry/cherryText = the bad outcome (a growth rate over budget, a method that misleads).

// 1 · Hook: the limit already answers before the problem is understood
export function DoubleLoopHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="A statement with n at a hundred thousand and a one second limit, and a double loop that costs ten billion steps" h={260}>
      <g opacity={a}>
        <rect x={120} y={60} width={360} height={50} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={300} y={90} s={11} a="middle" f={C.crema}>n at most a hundred thousand, limit one second</T>
      </g>
      <g opacity={b}>
        <T x={300} y={160} s={12} a="middle" f={C.caramel}>the obvious double loop: ten billion steps</T>
        <T x={300} y={225} s={12} a="middle" f={C.cherryText}>about a hundred seconds, before the problem is even read</T>
      </g>
    </Svg>
  );
}

// 2 · The rule of thumb
export function RuleOfThumb({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A machine doing on the order of a hundred million simple operations a second, turning a time limit into a budget" h={250}>
      <g opacity={a}>
        <rect x={160} y={85} width={280} height={60} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={300} y={120} s={11} a="middle" f={C.latte}>hundreds of millions of operations a second</T>
      </g>
      <T x={300} y={220} s={12} a="middle" f={C.caramel}>a time limit, multiplied by that rate, is a budget</T>
    </Svg>
  );
}

// 3 · Predict: does n squared or n log n fit at a hundred thousand?
export function PredictBudgetFit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two growth rates, n squared and n log n, with a question mark over which one the budget allows" h={250}>
      <g opacity={a}>
        <T x={180} y={110} s={13} a="middle" f={C.latte}>n squared</T>
        <T x={420} y={110} s={13} a="middle" f={C.latte}>n log n</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>at a hundred thousand and one second, which one fits?</T>
    </Svg>
  );
}

// 4 · The table, derived from the division
export function BudgetTableDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="n squared costing ten billion operations, far over the line, and n log n costing well under two million, well inside it" h={260}>
      <g opacity={a}>
        <rect x={100} y={70} width={400} height={16} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        <rect x={100} y={70} width={400} height={16} fill={C.cherry} opacity={0.5} />
        <T x={300} y={60} s={11} a="middle" f={C.cherryText}>n squared: ten billion operations</T>
      </g>
      <g opacity={b}>
        <rect x={100} y={110} width={6} height={16} fill={C.crema} />
        <rect x={100} y={110} width={400} height={16} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        <T x={300} y={145} s={11} a="middle" f={C.crema}>n log n: well under two million operations</T>
      </g>
      <T x={300} y={215} s={12} a="middle" f={C.caramel}>the table is a division, repeated for every growth rate</T>
    </Svg>
  );
}

// 5 · Meeting in the middle: a smaller n permits what a larger one forbids
export function MeetInTheMiddle({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Two to the forty, far over budget outright, against two halves of two to the twenty each, well inside it" h={260}>
      <g opacity={a}>
        <rect x={140} y={75} width={320} height={40} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={100} s={11} a="middle" f={C.cherryText}>two to the forty, taken all at once: far over budget</T>
      </g>
      <g opacity={b}>
        <rect x={150} y={150} width={140} height={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <rect x={310} y={150} width={140} height={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={300} y={210} s={11} a="middle" f={C.caramel}>two halves, each two to the twenty, then combined</T>
      </g>
    </Svg>
  );
}

// 6 · The cache-friendly correction, measured
export function CacheFriendlyMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="The same count of reads done in one sequential pass against the same count done at random, the random pass a long cherry bar" h={260}>
      <g opacity={a}>
        <rect x={150} y={80} width={70} height={22} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={185} y={115} s={10} a="middle" f={C.latte}>sequential pass</T>
      </g>
      <g opacity={b}>
        <rect x={340} y={80} width={220} height={22} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={450} y={115} s={10} a="middle" f={C.cherryText}>the same count, read at random</T>
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.caramel}>a hundred million operations a second assumed a hit, not a miss</T>
    </Svg>
  );
}

// 7 · Signal words, each a hint with a failure rate
export function SignalWords({ t }: StepCtx) {
  const words = ['sorted', 'k-th', 'all pairs', 'minimum maximum'];
  const techniques = ['binary search', 'a heap', 'is n squared affordable?', 'binary search on the answer'];
  return (
    <Svg label="Four signal words, each lighting up and resolving to the technique it points at" h={280}>
      {words.map((w, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        return (
          <g key={w} opacity={a}>
            <T x={150} y={70 + i * 50} s={13} a="start" f={C.caramel}>{w}</T>
            <T x={450} y={70 + i * 50} s={11} a="end" f={C.latte}>{techniques[i]}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Predict: what the budget cannot say
export function PredictBudgetExit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="An algorithm that still does not fit the budget even at a small n, with a question mark over what that signals" h={250}>
      <g opacity={a}>
        <rect x={180} y={85} width={240} height={55} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={118} s={11} a="middle" f={C.cherryText}>two to the n, and n is kept deliberately small</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>is a smaller limit ever a sign about the problem, not just its speed?</T>
    </Svg>
  );
}

// 9 · Necessary, never sufficient
export function NecessaryNotSufficient({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A budget ruling a growth rate out on one side, and staying silent about correctness on the other" h={250}>
      <g opacity={a}>
        <T x={180} y={110} s={12} a="middle" f={C.crema}>rules a growth rate out</T>
        <T x={420} y={110} s={12} a="middle" f={C.taupe}>says nothing about being right</T>
      </g>
    </Svg>
  );
}

// 10 · Recap: the three-question routine
export function Recap({ t }: StepCtx) {
  const questions = ['what is n, and what are the values?', 'what does the limit allow?', 'what do the signal words point at?'];
  return (
    <Svg label="A closing three-question routine, with the next topic's question of how to organise the data waiting" h={260}>
      {questions.map((q, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.5, 0.6 + i * 0.5));
        return (
          <T key={q} x={300} y={90 + i * 40} s={12} a="middle" f={C.caramel} o={a}>{q}</T>
        );
      })}
      <T x={300} y={235} s={12} a="middle" f={C.crema}>next: how to organise the data for that much work</T>
    </Svg>
  );
}
