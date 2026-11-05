import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the textbook structure / the algorithm's own
// solution (the bins, the machine loads); latte = secondary labels; taupe = data not yet
// placed; caramel = the thing to look at (the bound, the bin or machine that matters);
// cinnamon (rare) = the benchmark being compared against (OPT, always the same side);
// cherry/cherryText = the bad outcome (a wasted bin, an overloaded machine).

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="The same lower-bound trick returning, on two more NP-hard problems, with a different shape of guarantee" h={260}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" serif f={C.crema}>compute a lower bound on OPT</T>
        <T x={300} y={116} s={13} a="middle" serif f={C.crema}>compare your answer to it</T>
      </g>
      <g opacity={b}>
        <T x={300} y={170} s={12} a="middle" f={C.caramel}>same trick, a new shape: a ratio plus a constant</T>
      </g>
    </Svg>
  );
}

// 2 · First-Fit Decreasing
export function FirstFitDecreasing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const bins = [0.9, 0.85, 0.7];
  return (
    <Svg label="Items sorted large to small, dropped into the first bin that still has room" h={260}>
      <g opacity={a}>
        {bins.map((fill, i) => (
          <g key={i}>
            <rect x={140 + i * 110} y={60} width={70} height={140} fill="none" stroke={C.taupe} strokeWidth={1.6} />
            <rect x={140 + i * 110} y={60 + 140 * (1 - fill)} width={70} height={140 * fill} fill="none" stroke={C.crema} strokeWidth={1.6} />
          </g>
        ))}
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.caramel}>largest first, first bin that still fits</T>
    </Svg>
  );
}

// 3 · The tight family, reproduced
export function TightFamily({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Eleven bins used by the rule against a volume lower bound of nine" h={260}>
      <g opacity={a}>
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={40 + i * 44} y={120} width={32} height={70} fill="none" stroke={i < 9 ? C.cinnamon : C.cherry} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={70} s={12} a="middle" f={C.cherryText}>eleven used</T>
      <T x={300} y={230} s={12} a="middle" f={C.cinnamon}>nine is the volume floor, not a proof of the optimum</T>
    </Svg>
  );
}

// 3b · Predict: is the small instance already optimal?
export function PredictSmallInstance({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Four bins used on a small instance, with a question mark over whether that is already the best possible" h={250}>
      <g opacity={a}>
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={`q${i}`} x={80 + i * 70} y={70} width={50} height={70} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        ))}
        <T x={300} y={50} s={11} a="middle" f={C.latte}>the rule's answer: four bins</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>already optimal, or can checking everything do better?</T>
    </Svg>
  );
}

// 4 · A smaller instance, proved
export function SmallInstanceProved({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Four bins used, three proved optimal by brute force on a small instance" h={250}>
      <g opacity={a}>
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={`f${i}`} x={80 + i * 70} y={60} width={50} height={80} fill="none" stroke={i < 3 ? C.cinnamon : C.cherry} strokeWidth={1.6} />
        ))}
        <T x={300} y={40} s={11} a="middle" f={C.latte}>the rule's answer: four bins</T>
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.cinnamon}>brute force proves three is enough</T>
    </Svg>
  );
}

// 5 · Switch problems: makespan scheduling
export function MakespanIntro({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const machines = [0.9, 0.6, 0.75];
  return (
    <Svg label="Jobs piling onto three machines, the tallest stack deciding when the whole thing finishes" h={260}>
      <g opacity={a}>
        {machines.map((h, i) => (
          <rect key={i} x={160 + i * 110} y={190 - h * 130} width={50} height={h * 130} fill="none" stroke={i === 0 ? C.caramel : C.taupe} strokeWidth={1.6} />
        ))}
        <path d="M150 60 L150 190" stroke={C.caramel} strokeWidth={1} strokeDasharray="3 3" />
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.caramel}>the slowest machine decides the finish time</T>
    </Svg>
  );
}

// 6 · Predict: does sorting change the guarantee?
export function PredictOrderMatters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="The same jobs, one pile sorted first and one left in arrival order, with a question mark over whether it matters" h={250}>
      <g opacity={a}>
        <T x={180} y={100} s={12} a="middle" f={C.latte}>sorted first</T>
        <T x={420} y={100} s={12} a="middle" f={C.latte}>arrival order</T>
        <path d="M180 120 L180 180" stroke={C.cinnamon} strokeWidth={2} />
        <path d="M420 120 L420 180" stroke={C.taupe} strokeWidth={2} />
      </g>
      <T x={300} y={225} s={13} a="middle" f={C.caramel}>same worst case, or does order change it?</T>
    </Svg>
  );
}

// 7 · Graham's family, verified
export function GrahamFamily({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.5));
  const rows = [
    { m: 2, ratio: 1.1667 },
    { m: 3, ratio: 1.2222 },
    { m: 4, ratio: 1.25 },
    { m: 5, ratio: 1.2667 },
  ];
  return (
    <Svg label="Four bars climbing gently, LPT's own ratio against the optimum at four machine counts" h={260}>
      <g opacity={a}>
        {rows.map((r, i) => (
          <g key={r.m}>
            <rect x={110 + i * 100} y={190 - (r.ratio - 1) * 400} width={40} height={(r.ratio - 1) * 400} fill="none" stroke={C.caramel} strokeWidth={1.6} />
            <T x={130 + i * 100} y={210} s={11} a="middle" f={C.latte}>m={r.m}</T>
          </g>
        ))}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.crema}>exactly 4/3 minus 1 over 3m, every time</T>
    </Svg>
  );
}

// 8 · The classic list-scheduling worst case
export function ListSchedWorstCase({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Two identical machines filling with small jobs, then a big job tipping one of them over" h={260}>
      <g opacity={a}>
        <rect x={140} y={80} width={60} height={100} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <rect x={260} y={80} width={60} height={100} fill="none" stroke={C.taupe} strokeWidth={1.6} />
      </g>
      <g opacity={b}>
        <rect x={140} y={40} width={60} height={40} fill="none" stroke={C.cherry} strokeWidth={1.8} />
        <T x={300} y={230} s={12} a="middle" f={C.cherryText}>the big job lands last, on an already-full machine</T>
      </g>
    </Svg>
  );
}

// 9 · Spark's own algorithm
export function SparkAlgorithm({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A code comment naming Next Fit Decreasing, with only the single most recent partition checked for room" h={260}>
      <g opacity={a}>
        <rect x={100} y={70} width={400} height={30} fill="none" stroke={C.mocha} strokeWidth={1} />
        <T x={300} y={90} s={12} a="middle" f={C.latte} serif italic>&quot;Next Fit Decreasing&quot;</T>
      </g>
      <g opacity={b}>
        <rect x={360} y={130} width={70} height={50} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={395} y={200} s={11} a="middle" f={C.caramel}>only this one checked</T>
        <rect x={180} y={130} width={70} height={50} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="3 3" />
        <T x={215} y={120} s={11} a="middle" f={C.taupe}>earlier ones ignored</T>
      </g>
    </Svg>
  );
}

// 10 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Two more guarantees named beside their shape, with a heuristic's shrug waiting next" h={240}>
      <g opacity={a}>
        <T x={160} y={90} s={13} a="start" f={C.crema}>bin packing</T>
        <T x={440} y={90} s={12} a="end" f={C.latte}>ratio + constant</T>
        <T x={160} y={130} s={13} a="start" f={C.crema}>scheduling</T>
        <T x={440} y={130} s={12} a="end" f={C.latte}>flat ratio</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: giving up the proof, on purpose</T>
    </Svg>
  );
}
