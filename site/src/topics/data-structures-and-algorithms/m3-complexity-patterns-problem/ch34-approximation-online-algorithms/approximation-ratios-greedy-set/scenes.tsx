import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the algorithm's own solution (sets picked, cover
// vertices); latte = secondary labels; taupe = the part not yet decided; caramel = the
// thing to look at (the bounding quantity: the matching, the optimum, the ratio);
// cinnamon (rare) = the benchmark being compared against (the optimum / OPT, always the
// same side of each pair); cherry/cherryText = the bad outcome (greedy's worst case,
// a ratio that keeps growing).

const FAMILY = [
  { k: 3, n: 28, picks: 3, ratio: 1.5, lnN: 3.33 },
  { k: 5, n: 124, picks: 5, ratio: 2.5, lnN: 4.82 },
  { k: 8, n: 1020, picks: 8, ratio: 4.0, lnN: 6.93 },
  { k: 12, n: 16380, picks: 12, ratio: 6.0, lnN: 9.7 },
];

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A locked door marked NP-hard, with a cheap rule offering a proof of how close it can get instead" h={280}>
      <g opacity={a}>
        <rect x={230} y={50} width={140} height={100} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={105} s={13} a="middle" f={C.cherryText}>NP-hard</T>
        <T x={300} y={168} s={12} a="middle" f={C.latte}>no exact answer in polynomial time</T>
      </g>
      <g opacity={b}>
        <T x={300} y={222} s={13} a="middle" f={C.caramel}>a cheap rule, with a proof of its own distance</T>
        <T x={300} y={244} s={12} a="middle" f={C.latte}>an approximation ratio, next</T>
      </g>
    </Svg>
  );
}

// 2 · What an approximation ratio promises
export function RatioPromise({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A theorem icon on one side, a heuristic's shrug on the other" h={270}>
      <g opacity={a}>
        <rect x={90} y={70} width={180} height={110} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={180} y={110} s={12} a="middle" f={C.crema}>proved,</T>
        <T x={180} y={128} s={12} a="middle" f={C.crema}>every instance</T>
        <T x={180} y={198} s={12} a="middle" f={C.caramel}>approximation algorithm</T>
      </g>
      <g opacity={b}>
        <rect x={330} y={70} width={180} height={110} fill="none" stroke={C.taupe} strokeWidth={1.6} strokeDasharray="4 4" />
        <T x={420} y={110} s={12} a="middle" f={C.latte}>works well,</T>
        <T x={420} y={128} s={12} a="middle" f={C.latte}>no guarantee when</T>
        <T x={420} y={198} s={12} a="middle" f={C.latte}>a heuristic</T>
      </g>
    </Svg>
  );
}

// 3 · Greedy set cover's rule
export function GreedyRule({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const sets = [
    { label: 'set A', covers: 3 },
    { label: 'set B', covers: 7 },
    { label: 'set C', covers: 4 },
  ];
  return (
    <Svg label="Three candidate sets with different counts of still-uncovered elements, the largest one highlighted" h={260}>
      <g opacity={a}>
        {sets.map((s, i) => (
          <g key={s.label}>
            <rect x={140 + i * 120} y={190 - s.covers * 14} width={50} height={s.covers * 14} fill="none" stroke={s.covers === 7 ? C.caramel : C.taupe} strokeWidth={1.6} />
            <T x={165 + i * 120} y={206} s={11} a="middle" f={C.latte}>{s.label}</T>
          </g>
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={235} s={12} a="middle" f={C.caramel}>pick the largest gain, every step</T>
      </g>
    </Svg>
  );
}

// 4 · Predict: does the ratio stay flat as k grows?
export function PredictFamily({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two rows and k growing blocks, with a question mark over whether greedy's picks stay close to the optimum of two" h={260}>
      <g opacity={a}>
        <rect x={60} y={150} width={200} height={20} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={160} y={186} s={11} a="middle" f={C.latte}>2 row sets = OPT</T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={320 + i * 36} y={150 - i * 22} width={30} height={20 + i * 22} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        ))}
        <T x={400} y={76} s={11} a="middle" f={C.latte}>k growing blocks</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>flat ratio, or does it grow with k?</T>
    </Svg>
  );
}

// 5 · The family measured: ratio tracking ln(n)
export function FamilyMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.5));
  return (
    <Svg label="Four pairs of bars, greedy's ratio and ln(n), both climbing together as the family scales" h={280}>
      <g opacity={a}>
        {FAMILY.map((f, i) => (
          <g key={f.k}>
            <rect x={90 + i * 120} y={210 - f.ratio * 16} width={30} height={f.ratio * 16} fill="none" stroke={C.cherry} strokeWidth={1.6} />
            <rect x={125 + i * 120} y={210 - f.lnN * 16} width={30} height={f.lnN * 16} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
            <T x={120 + i * 120} y={226} s={11} a="middle" f={C.latte}>k={f.k}</T>
          </g>
        ))}
      </g>
      <T x={150} y={56} s={12} a="middle" f={C.cherryText}>ratio</T>
      <T x={210} y={56} s={12} a="middle" f={C.cinnamon}>ln(n)</T>
      <T x={300} y={258} s={12} a="middle" f={C.latte}>1.5 → 2.5 → 4.0 → 6.0, climbing with ln(n)</T>
    </Svg>
  );
}

// 6 · Feige's bound: essentially tight
export function FeigeBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="A ceiling line labelled ln n, with greedy's own bound sitting directly beneath it" h={250}>
      <g opacity={a}>
        <path d="M100 80 L500 80" stroke={C.cherry} strokeWidth={1.6} fill="none" />
        <T x={300} y={66} s={12} a="middle" f={C.cherryText}>(1 − ε) ln n — no polynomial algorithm beats this</T>
      </g>
      <g opacity={b}>
        <path d="M100 110 L500 110" stroke={C.caramel} strokeWidth={1.6} fill="none" strokeDasharray="4 4" />
        <T x={300} y={140} s={12} a="middle" f={C.caramel}>greedy's own H(n) sits right at the ceiling</T>
      </g>
    </Svg>
  );
}

// 7 · Switch problems: vertex cover
export function VertexCoverIntro({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const pts: Array<[number, number]> = [[200, 80], [400, 80], [200, 180], [400, 180]];
  const edges: Array<[number, number]> = [[0, 1], [0, 2], [1, 3], [2, 3]];
  return (
    <Svg label="A small graph with every edge needing at least one endpoint chosen" h={260}>
      <g opacity={a}>
        {edges.map(([p, q], i) => (
          <path key={i} d={`M${pts[p][0]} ${pts[p][1]} L${pts[q][0]} ${pts[q][1]}`} stroke={C.taupe} strokeWidth={1.4} fill="none" />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={14} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>fewest vertices touching every edge — also NP-hard</T>
    </Svg>
  );
}

// 8 · The maximal-matching construction
export function MatchingConstruction({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const pts: Array<[number, number]> = [[160, 80], [280, 80], [160, 180], [280, 180], [420, 130]];
  const matchEdges: Array<[number, number]> = [[0, 1], [2, 3]];
  const otherEdges: Array<[number, number]> = [[1, 4], [3, 4]];
  return (
    <Svg label="Two matched edges in bold, their four endpoints becoming the cover, two more edges still waiting" h={270}>
      <g opacity={a}>
        {otherEdges.map(([p, q], i) => (
          <path key={`o${i}`} d={`M${pts[p][0]} ${pts[p][1]} L${pts[q][0]} ${pts[q][1]}`} stroke={C.taupe} strokeWidth={1.3} fill="none" />
        ))}
        {matchEdges.map(([p, q], i) => (
          <path key={`m${i}`} d={`M${pts[p][0]} ${pts[p][1]} L${pts[q][0]} ${pts[q][1]}`} stroke={C.caramel} strokeWidth={2.4} fill="none" />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={14} fill="none" stroke={i < 4 ? C.caramel : C.taupe} strokeWidth={1.8} />
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={230} s={12} a="middle" f={C.crema}>M's edges share no endpoints: OPT needs one per edge of M</T>
      </g>
    </Svg>
  );
}

// 9 · Predict: is the factor-2 bound actually attained?
export function PredictTight({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="K sub 6,6, every vertex connected across, with a question mark over whether the ratio of 2 is ever really hit" h={260}>
      <g opacity={a}>
        {[0, 1, 2].map((i) => (
          <circle key={`a${i}`} cx={180} cy={70 + i * 50} r={10} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={`b${i}`} cx={420} cy={70 + i * 50} r={10} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        ))}
        <path d="M180 70 L420 170 M180 120 L420 120 M180 170 L420 70" stroke={C.taupe} strokeWidth={1} fill="none" />
        <T x={300} y={40} s={11} a="middle" f={C.latte}>K(6,6), 6 vertices shown each side</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>attained exactly, or only approached?</T>
    </Svg>
  );
}

// 10 · Checked against a brute-force optimum
export function RandomGraphCheck({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Sixty small bars, each one's cover against twice its brute-force optimum, none ever crossing the line" h={260}>
      <g opacity={a}>
        <path d="M60 80 L540 80" stroke={C.cinnamon} strokeWidth={1.4} fill="none" strokeDasharray="4 4" />
        <T x={300} y={66} s={12} a="middle" f={C.cinnamon}>2 × OPT, the ceiling</T>
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={60 + i * 20} y={80} width={10} height={40 + ((i * 7) % 60) * 0.6} fill="none" stroke={C.caramel} strokeWidth={1.1} />
        ))}
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.crema}>60 graphs, 4–13 vertices: never crossed, worst ratio 2.0</T>
    </Svg>
  );
}

// 11 · The two guarantees, side by side
export function SideBySide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Set cover's ratio climbing a staircase against vertex cover's flat line" h={270}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={100 + i * 40} y={190 - (i + 1) * 22} width={28} height={(i + 1) * 22} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        ))}
        <T x={200} y={210} s={11} a="middle" f={C.cherryText}>set cover: grows with ln n</T>
        <path d="M340 130 L540 130" stroke={C.caramel} strokeWidth={1.8} fill="none" />
        <T x={440} y={210} s={11} a="middle" f={C.caramel}>vertex cover: flat at 2</T>
      </g>
      <T x={300} y={244} s={12} a="middle" f={C.latte}>same proof style, two different shapes of promise</T>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="The shared trick named once: a computable lower bound on OPT, compared against your own answer" h={250}>
      <g opacity={a}>
        <T x={300} y={110} s={14} a="middle" serif f={C.caramel}>compute a lower bound on OPT</T>
        <T x={300} y={140} s={14} a="middle" serif f={C.crema}>compare your own answer to it</T>
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.latte}>bin packing and makespan scheduling, next</T>
    </Svg>
  );
}
