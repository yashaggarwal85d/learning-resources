import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure as it is; latte = secondary labels; caramel =
// the thing to look at (the shape recognised, the edge or item chosen); cinnamon (rare) = the
// second, independent check that agrees; cherry/cherryText = the near-miss (the variant that is
// hard, the test that fails).
//
// Every printed name and number is examples.py's: six reviewers r1 to r6 and their willing papers,
// two reviews a paper, at most two a reviewer, 8 placed by flow and by brute force (the placement
// drawn is one valid witness, checked against those limits); the matching a, b, c to x, y, z of
// size 3 both ways, the odd cycle p, q, r with a largest matching of 1; the 2-SAT clauses and
// their implication graphs; the eleven intervals and the greedy's (1,4), (5,7), (8,11), (12,16);
// the DAG's weights, relaxed values and best 11, and the back edge d to a; the catalogue's stream
// top four 42, 56, 61, 71 and next-greater 4, 2, 4, −1, −1, −1.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

const WILLING: [string, string[]][] = [
  ['r1', ['p1', 'p2']],
  ['r2', ['p1', 'p3']],
  ['r3', ['p2', 'p3']],
  ['r4', ['p2', 'p4']],
  ['r5', ['p3', 'p4']],
  ['r6', ['p1', 'p4']],
];
/** One placement of all eight reviews, found by examples.py's Edmonds-Karp loop and checked against the limits. */
const PLACED = new Set(['r1p1', 'r1p2', 'r2p1', 'r2p3', 'r3p2', 'r3p3', 'r4p4', 'r5p4']);

function Node({ x, y, lab, col = C.crema, r = 14 }: { x: number; y: number; lab: string; col?: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.band} stroke={col} strokeWidth={1.4} />
      <T x={x} y={y + 4} s={12} a="middle" f={col === C.cherry ? C.cherryText : col}>{lab}</T>
    </g>
  );
}

// 1 · Hook: reviewers and papers, a flow network underneath
export function ReviewerHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const st = easeOut(seg(t, 1.2, 1.8));
  const k = stepIdx(t, 2.0, 3.8, 8);
  const end = easeOut(seg(t, 4.0, 4.5));
  const ry = (i: number) => 36 + i * 38;
  const py = (j: number) => 60 + j * 50;
  const placed = [...PLACED];
  return (
    <Svg label="Six reviewers on the left, four papers on the right, a line wherever a reviewer is willing. A source feeds each reviewer at most two; each paper drains two to a sink. The flow places all eight reviews" h={290}>
      {WILLING.map(([r, ps], i) =>
        ps.map((p) => {
          const j = Number(p[1]) - 1;
          const idx = placed.indexOf(r + p);
          const on = idx >= 0 && idx <= k;
          return <line key={r + p} x1={194} y1={ry(i)} x2={396} y2={py(j)} stroke={on ? C.caramel : C.mocha} strokeWidth={on ? 2.2 : 1} opacity={a} />;
        }),
      )}
      {WILLING.map(([r], i) => (
        <g key={r} opacity={a}>
          <Node x={180} y={ry(i)} lab={r} />
        </g>
      ))}
      {[0, 1, 2, 3].map((j) => (
        <g key={j} opacity={a}>
          <Node x={410} y={py(j)} lab={`p${j + 1}`} />
        </g>
      ))}
      <g opacity={st}>
        <Node x={60} y={131} lab="S" col={C.latte} />
        {WILLING.map(([r], i) => (
          <line key={r} x1={74} y1={131} x2={166} y2={ry(i)} stroke={C.latte} strokeWidth={0.8} />
        ))}
        <T x={60} y={168} s={11} a="middle" f={C.latte}>≤ 2 each</T>
        <Node x={530} y={135} lab="T" col={C.latte} />
        {[0, 1, 2, 3].map((j) => (
          <line key={j} x1={424} y1={py(j)} x2={516} y2={135} stroke={C.latte} strokeWidth={0.8} />
        ))}
        <T x={530} y={172} s={11} a="middle" f={C.latte}>needs 2 each</T>
      </g>
      <T x={300} y={280} s={13} a="middle" f={C.caramel} o={end}>flow: all 8 reviews placed</T>
    </Svg>
  );
}

// 2 · Predict: which pairing story is the hard one?
export function PredictPairingVariant({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = stepIdx(t, 0.2, 2.2, 3);
  const ask = easeOut(seg(t, 2.6, 3.1));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const cards: [string, string, boolean][] = [
    ['across two groups', 'flow: fast', false],
    ['within one group', 'solvable, harder method', false],
    ['true/false, 3 per rule', 'NP-complete', true],
  ];
  return (
    <Svg label="Three pairing stories side by side: across two groups, within one group, and true-or-false choices with three variables per rule. After answering: the first two are solvable; the third is NP-complete" h={250}>
      {cards.map(([lab, verdict, hard], i) => {
        const x = 30 + i * 186;
        return (
          <g key={lab} opacity={i <= k ? 1 : 0}>
            <rect x={x} y={40} width={170} height={120} fill="none" stroke={rev > 0.5 ? (hard ? C.cherry : C.cinnamon) : C.latte} strokeWidth={1.4} />
            {i === 0 && [0, 1, 2].map((r) => <line key={r} x1={x + 50} y1={70 + r * 25} x2={x + 120} y2={70 + ((r + 1) % 3) * 25} stroke={C.crema} strokeWidth={1.2} />)}
            {i === 0 && [0, 1, 2].map((r) => <g key={`n${r}`}><circle cx={x + 50} cy={70 + r * 25} r={5} fill={C.crema} /><circle cx={x + 120} cy={70 + r * 25} r={5} fill={C.crema} /></g>)}
            {i === 1 && <path d={`M${x + 85} 66 L${x + 50} 126 L${x + 120} 126 Z`} fill="none" stroke={C.crema} strokeWidth={1.2} />}
            {i === 2 && <T x={x + 85} y={104} s={13} a="middle" f={C.crema}>(x ∨ y ∨ z)</T>}
            <T x={x + 85} y={182} s={11} a="middle" f={C.latte}>{lab}</T>
            <T x={x + 85} y={206} s={12} a="middle" f={hard ? C.cherryText : C.cinnamon} o={rev}>{verdict}</T>
          </g>
        );
      })}
      <T x={300} y={240} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>which one is genuinely hard?</T>
    </Svg>
  );
}

// 3 · Flow and cut: two independent checks, one number
export function FlowCutShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const f = easeOut(seg(t, 0.7, 1.4));
  const b = easeOut(seg(t, 1.6, 2.3));
  const eq = easeOut(seg(t, 2.6, 3.1));
  const nm = easeOut(seg(t, 3.6, 4.3));
  return (
    <Svg label="The reviewer network checked two ways: the flow algorithm gives 8, a from-scratch brute force over every valid assignment gives 8. They agree. The near-miss: flow that must travel as whole units along single paths is much harder" h={270}>
      <T x={30} y={30} s={12} f={C.latte} o={a}>shape: something moves through capacity-limited links</T>
      <g opacity={f}>
        <rect x={60} y={60} width={200} height={50} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={160} y={82} s={12} a="middle" f={C.caramel}>flow algorithm</T>
        <T x={160} y={102} s={14} a="middle" f={C.caramel}>8</T>
      </g>
      <g opacity={b}>
        <rect x={340} y={60} width={200} height={50} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={440} y={82} s={12} a="middle" f={C.cinnamon}>brute force, all</T>
        <T x={440} y={102} s={14} a="middle" f={C.cinnamon}>8</T>
      </g>
      <T x={300} y={92} s={16} a="middle" f={C.crema} o={eq}>=</T>
      <T x={300} y={150} s={12} a="middle" f={C.latte} o={eq}>if they ever disagreed, one would have a bug</T>
      <g opacity={nm}>
        <T x={30} y={210} s={12} f={C.cherryText}>near-miss: whole, indivisible units</T>
        <T x={30} y={234} s={12} f={C.cherryText}>along single paths: much harder</T>
      </g>
    </Svg>
  );
}

// 4 · Matching: the bipartite test is the giveaway
export function MatchingShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const m = stepIdx(t, 0.7, 1.9, 3);
  const agree = easeOut(seg(t, 2.0, 2.5));
  const odd = stepIdx(t, 2.8, 4.2, 3);
  const end = easeOut(seg(t, 4.4, 4.9));
  const L: Record<string, number> = { a: 60, b: 110, c: 160 };
  const R: Record<string, number> = { x: 60, y: 110, z: 160 };
  const edges = [['a', 'x'], ['a', 'y'], ['b', 'y'], ['c', 'z']];
  const match = ['ax', 'by', 'cz'];
  const tri: Record<string, [number, number]> = { p: [430, 60], q: [370, 160], r: [490, 160] };
  const triE: [string, string][] = [['p', 'q'], ['q', 'r'], ['r', 'p']];
  const colour = (v: string) => (v === 'p' ? C.caramel : v === 'q' ? C.cinnamon : C.cherry);
  return (
    <Svg label="Left: a, b, c and x, y, z with edges a-x, a-y, b-y, c-z; every edge crosses sides. The matching a-x, b-y, c-z has 3 pairs, found by Kuhn's method and by flow alike. Right: the odd cycle p, q, r; two-colouring it fails on the third edge, so it is not bipartite, and its largest matching is 1" h={270}>
      <g opacity={a}>
        {edges.map(([u, v]) => (
          <line key={u + v} x1={74} y1={L[u]} x2={186} y2={R[v]} stroke={match.indexOf(u + v) >= 0 && match.indexOf(u + v) <= m ? C.caramel : C.mocha} strokeWidth={match.indexOf(u + v) >= 0 && match.indexOf(u + v) <= m ? 2.2 : 1} />
        ))}
        {Object.entries(L).map(([k, y]) => <Node key={k} x={60} y={y} lab={k} />)}
        {Object.entries(R).map(([k, y]) => <Node key={k} x={200} y={y} lab={k} />)}
        <T x={30} y={30} s={11} f={C.latte}>every edge crosses sides</T>
      </g>
      <T x={30} y={212} s={12} f={C.caramel} o={agree}>Kuhn: 3, flow: 3</T>
      {triE.map(([u, v], i) => (
        <line key={u + v} x1={tri[u][0]} y1={tri[u][1]} x2={tri[v][0]} y2={tri[v][1]} stroke={i === 2 && odd >= 2 ? C.cherry : C.latte} strokeWidth={i === 2 && odd >= 2 ? 2.2 : 1.2} opacity={odd >= 0 ? 1 : 0} />
      ))}
      {Object.entries(tri).map(([k, [x, y]], i) => (
        <g key={k} opacity={odd >= 0 ? 1 : 0}>
          <Node x={x} y={y} lab={k} col={i <= odd ? colour(k) : C.crema} />
        </g>
      ))}
      <T x={430} y={30} s={11} a="middle" f={C.latte} o={odd >= 0 ? 1 : 0}>within one group: an odd cycle</T>
      <g opacity={end}>
        <T x={430} y={212} s={12} a="middle" f={C.cherryText}>two colours fail: not bipartite</T>
        <T x={430} y={236} s={12} a="middle" f={C.latte}>largest matching: 1</T>
      </g>
    </Svg>
  );
}

// 5 · Two-SAT: follow implications, look for a loop through x and ¬x
export function TwoSatShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const e = stepIdx(t, 0.7, 2.5, 6);
  const ok = easeOut(seg(t, 2.6, 3.1));
  const u = stepIdx(t, 3.3, 4.6, 4);
  const end = easeOut(seg(t, 4.8, 5.3));
  // SAT_CLAUSES (x0 ∨ x1), (¬x0 ∨ x2), (¬x1 ∨ ¬x2): each (p ∨ q) gives ¬p → q and ¬q → p.
  const P: Record<string, [number, number]> = { x0: [60, 70], x1: [160, 70], x2: [260, 70], nx0: [60, 170], nx1: [160, 170], nx2: [260, 170] };
  const lab: Record<string, string> = { x0: 'x0', x1: 'x1', x2: 'x2', nx0: '¬x0', nx1: '¬x1', nx2: '¬x2' };
  const imp: [string, string][] = [['nx0', 'x1'], ['nx1', 'x0'], ['x0', 'x2'], ['nx2', 'nx0'], ['x1', 'nx2'], ['x2', 'nx1']];
  // UNSAT_CLAUSES (x0 ∨ x0), (¬x0 ∨ x1), (¬x1 ∨ ¬x1): ¬x0 → x0, x0 → x1, x1 → ¬x1, ¬x1 → ¬x0: one loop holds x0 and ¬x0.
  const U: Record<string, [number, number]> = { nx0: [400, 80], x0: [520, 80], x1: [520, 170], nx1: [400, 170] };
  const loop: [string, string][] = [['nx0', 'x0'], ['x0', 'x1'], ['x1', 'nx1'], ['nx1', 'nx0']];
  const arrow = (x1: number, y1: number, x2: number, y2: number, col: string, key: string, sh = 16) => {
    const d = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / d;
    const uy = (y2 - y1) / d;
    const ex = x2 - ux * sh;
    const ey = y2 - uy * sh;
    return (
      <g key={key}>
        <line x1={x1 + ux * sh} y1={y1 + uy * sh} x2={ex} y2={ey} stroke={col} strokeWidth={1.4} />
        <path d={`M${ex} ${ey} l${-ux * 7 - uy * 4} ${-uy * 7 + ux * 4} M${ex} ${ey} l${-ux * 7 + uy * 4} ${-uy * 7 - ux * 4}`} stroke={col} strokeWidth={1.4} fill="none" />
      </g>
    );
  };
  return (
    <Svg label="An implication graph for (x0 or x1), (not x0 or x2), (not x1 or not x2): each clause adds two arrows. No variable shares a loop with its negation, so it is satisfiable, as brute force agrees. A second instance's arrows close one loop through x0 and not x0: unsatisfiable" h={290}>
      <T x={30} y={30} s={12} f={C.latte} o={a}>each two-choice rule: two arrows</T>
      {imp.map(([p, q], i) => (i <= e ? arrow(P[p][0], P[p][1], P[q][0], P[q][1], C.latte, p + q) : null))}
      {Object.entries(P).map(([k, [x, y]]) => (
        <g key={k} opacity={a}>
          <Node x={x} y={y} lab={lab[k]} r={16} col={k.startsWith('n') ? C.latte : C.crema} />
        </g>
      ))}
      <T x={30} y={222} s={12} f={C.cinnamon} o={ok}>no x with ¬x in one loop:</T>
      <T x={30} y={244} s={12} f={C.cinnamon} o={ok}>satisfiable, as brute force says</T>
      {loop.map(([p, q], i) => (i <= u ? arrow(U[p][0], U[p][1], U[q][0], U[q][1], C.cherry, `u${p}${q}`) : null))}
      {Object.entries(U).map(([k, [x, y]]) => (
        <g key={k} opacity={u >= 0 ? 1 : 0}>
          <Node x={x} y={y} lab={lab[k]} r={16} col={u >= 3 && (k === 'x0' || k === 'nx0') ? C.cherry : C.crema} />
        </g>
      ))}
      <T x={460} y={222} s={12} a="middle" f={C.cherryText} o={end}>x0 and ¬x0 in one loop:</T>
      <T x={460} y={244} s={12} a="middle" f={C.cherryText} o={end}>unsatisfiable</T>
      <T x={300} y={280} s={11} a="middle" f={C.latte} o={end}>no truth table searched; three per rule is NP-complete</T>
    </Svg>
  );
}

const INTERVALS: [number, number][] = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]];
const CHOSEN = ['1,4', '5,7', '8,11', '12,16'];

// 6 · Interval scheduling: earliest finish first
export function IntervalSchedulingShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const sorted = [...INTERVALS].sort((p, q) => p[1] - q[1]);
  const k = stepIdx(t, 0.7, 3.3, sorted.length);
  const res = easeOut(seg(t, 3.5, 4.0));
  const nm = easeOut(seg(t, 4.3, 4.8));
  const X = (v: number) => 40 + v * 32;
  let lastEnd = -Infinity;
  const decided = sorted.map(([s0, e0], i) => {
    if (i > k) return 'open';
    if (s0 >= lastEnd) {
      lastEnd = e0;
      return 'take';
    }
    return 'skip';
  });
  return (
    <Svg label="Eleven intervals on one resource, sorted by finish time. The greedy takes each one that starts after the last taken one ends: (1,4), (5,7), (8,11), (12,16), four in all, the same as an exhaustive search" h={290}>
      <g opacity={a}>
        <line x1={X(0)} y1={214} x2={X(16)} y2={214} stroke={C.mocha} strokeWidth={1} />
        {[0, 4, 8, 12, 16].map((v) => (
          <T key={v} x={X(v)} y={230} s={11} a="middle" f={C.latte}>{`${v}`}</T>
        ))}
      </g>
      {sorted.map(([s0, e0], i) => {
        const st = decided[i];
        const col = st === 'take' ? C.caramel : st === 'skip' ? C.mocha : C.latte;
        return <rect key={i} x={X(s0)} y={24 + i * 17} width={(e0 - s0) * 32} height={11} fill={col} opacity={a * (st === 'skip' ? 0.5 : 0.8)} />;
      })}
      <T x={30} y={256} s={12} f={C.caramel} o={res}>{`earliest finish first: ${CHOSEN.length}, as brute force finds`}</T>
      <T x={30} y={280} s={12} f={C.cherryText} o={nm}>a second resource or a setup time: no guarantee</T>
    </Svg>
  );
}

const DAG: Record<string, [string, number][]> = {
  start: [['a', 2], ['b', 3]],
  a: [['c', 4], ['d', 1]],
  b: [['d', 2], ['e', 5]],
  c: [['end', 3]],
  d: [['end', 6]],
  e: [['end', 1]],
};
const ORDER = ['start', 'a', 'b', 'c', 'd', 'e', 'end'];
const BEST: Record<string, number> = { start: 0, a: 2, b: 3, c: 6, d: 5, e: 8, end: 11 };
const POS: Record<string, [number, number]> = { start: [50, 120], a: [170, 60], b: [170, 180], c: [300, 40], d: [300, 120], e: [300, 200], end: [430, 120] };

// 7 · DP on a DAG: relax in topological order
export function DagDpShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const k = stepIdx(t, 0.7, 3.0, 7);
  const best = easeOut(seg(t, 3.2, 3.7));
  const cyc = easeOut(seg(t, 4.1, 4.7));
  const bestPath = ['startb', 'bd', 'dend'];
  return (
    <Svg label="A dependency graph from start to end with weighted edges. Relaxed in topological order, the longest distances come out 0, 2, 3, 6, 5, 8 and 11 at the end, through start, b, d, end, matching every path enumerated. An added edge from d back to a makes a cycle, and the relaxation no longer applies" h={280}>
      {Object.entries(DAG).map(([u, outs]) =>
        outs.map(([v, w]) => {
          const on = best > 0.5 && bestPath.includes(u + v);
          const [x1, y1] = POS[u];
          const [x2, y2] = POS[v];
          return (
            <g key={u + v} opacity={a}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? C.caramel : C.mocha} strokeWidth={on ? 2.2 : 1.2} />
              <T x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} s={11} a="middle" f={C.latte}>{`${w}`}</T>
            </g>
          );
        }),
      )}
      <path d="M300 106 Q 250 70 184 66" fill="none" stroke={C.cherry} strokeWidth={1.8} strokeDasharray="5 3" opacity={cyc} />
      {ORDER.map((n, i) => {
        const [x, y] = POS[n];
        return (
          <g key={n} opacity={a}>
            <circle cx={x} cy={y} r={n.length > 1 ? 24 : 18} fill={C.band} stroke={i <= k ? C.crema : C.latte} strokeWidth={1.4} />
            <T x={x} y={y + 4} s={n.length > 1 ? 10 : 12} a="middle" f={C.crema}>{n}</T>
            <T x={x} y={y + (n.length > 1 ? 40 : 34)} s={12} a="middle" f={C.caramel} o={i <= k ? 1 : 0}>{`${BEST[n]}`}</T>
          </g>
        );
      })}
      <T x={470} y={60} s={12} f={C.caramel} o={best}>best: 11</T>
      <T x={470} y={80} s={11} f={C.latte} o={best}>= every path</T>
      <T x={30} y={268} s={12} f={C.cherryText} o={cyc}>add d → a: a cycle, no order to relax in</T>
    </Svg>
  );
}

// 8 · The catalogue: question → technique
export function PatternCatalogue({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 3.8, 6);
  const end = easeOut(seg(t, 4.2, 4.8));
  const rows: [string, string, string][] = [
    ['a sequence that may cycle', 'fast and slow pointers', ''],
    ['the K best of a stream', 'a size-K heap', '42, 56, 61, 71'],
    ['several sorted sources', 'a k-way merge', ''],
    ['a grid to walk', 'breadth-first or DP', ''],
    ['a monotone predicate', 'binary search the answer', ''],
    ['the next larger value', 'a monotonic stack', '4, 2, 4, −1, −1, −1'],
  ];
  return (
    <Svg label="Six questions and their techniques: a sequence that may cycle, fast and slow pointers; the K best of a stream, a size-K heap, here 42, 56, 61, 71; several sorted sources, a k-way merge; a grid to walk, breadth-first search or DP; a monotone predicate, binary search on the answer; the next larger value, a monotonic stack, here 4, 2, 4, −1, −1, −1" h={290}>
      {rows.map(([q, tech, ex], i) => {
        const y = 32 + i * 38;
        return (
          <g key={q} opacity={i <= k ? 1 : 0}>
            <T x={30} y={y} s={12} f={C.latte}>{q}</T>
            <T x={30} y={y + 18} s={12} f={C.caramel}>{`→ ${tech}`}</T>
            {ex && <T x={570} y={y + 18} s={11} a="end" f={C.latte}>{ex}</T>}
          </g>
        );
      })}
      <T x={300} y={280} s={12} a="middle" f={C.latte} o={end}>nothing new: an index into the course</T>
    </Svg>
  );
}

// 9 · Predict: add setup time between jobs
export function PredictSchedulingSetup({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const ask = easeOut(seg(t, 1.8, 2.3));
  const gap = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const rev = answered ? easeOut(seg(s, 1.2, 1.8)) : 0;
  const jobs = [70, 50, 90, 60];
  let x = 40;
  const placed = jobs.map((w, i) => {
    const x0 = x;
    x += w + (i < jobs.length - 1 ? 30 * gap : 0) + 4;
    return [x0, w];
  });
  return (
    <Svg label="Jobs end to end on one machine. After answering, a setup gap opens between each pair of jobs, tying one job's finish to the next one's start: no longer plain interval scheduling, but the hard family of bin packing and makespan" h={250}>
      <T x={30} y={36} s={12} f={C.latte} o={a}>one machine</T>
      {placed.map(([x0, w], i) => (
        <g key={i} opacity={a}>
          <rect x={x0} y={60} width={w} height={30} fill={C.crema} opacity={0.5} />
          {i > 0 && <rect x={x0 - 30 * gap - 4} y={60} width={30 * gap} height={30} fill={C.cherry} opacity={0.7 * gap} />}
        </g>
      ))}
      <T x={300} y={150} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>add setup time: still the easy greedy?</T>
      <g opacity={rev}>
        <T x={30} y={140} s={12} f={C.cherryText}>setup ties each finish to the next start</T>
        <T x={30} y={170} s={12} f={C.cherryText}>the hard family: bin packing, makespan</T>
      </g>
    </Svg>
  );
}

// 10 · The recognition procedure, ending on a falsifier
export function RecognitionProcedure({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 4.0, 5);
  const steps = ['size and limit → a budget', 'operations → a structure', 'state, move, question → a graph?', 'a shape, and its near-miss', 'the sentence that would prove it wrong'];
  return (
    <Svg label="Five steps in under five minutes: size and limit to a budget; operations to a structure; state, move and question to a graph; match a shape and its near-miss; and last, write the sentence that would prove the match wrong" h={260}>
      <T x={30} y={30} s={12} f={C.latte}>under five minutes</T>
      {steps.map((s, i) => {
        const last = i === 4;
        return (
          <g key={s} opacity={i <= k ? 1 : 0}>
            <T x={30} y={64 + i * 38} s={12} f={C.latte}>{`${i + 1}.`}</T>
            <T x={60} y={64 + i * 38} s={13} f={last ? C.caramel : C.crema}>{s}</T>
            {last && <rect x={50} y={64 + i * 38 - 20} width={500} height={30} fill="none" stroke={C.caramel} strokeWidth={1.4} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Practice: score misses by the trigger missed
export function LabProtocol({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 2.4, 30);
  const sort = easeInOut(seg(t, 2.8, 3.8));
  const end = easeOut(seg(t, 4.0, 4.6));
  const misses = [3, 8, 11, 17, 22, 26];
  const trig = [0, 1, 0, 0, 1, 0];
  return (
    <Svg label="Thirty unseen problems, five minutes each, filled in one by one; six are misses. The misses gather by the trigger that was missed, and one trigger holds most of them" h={270}>
      <T x={30} y={30} s={12} f={C.latte}>30 unseen problems, 5 minutes each</T>
      {Array.from({ length: 30 }).map((_, i) => {
        const mi = misses.indexOf(i);
        const isMiss = mi >= 0;
        const gx = 30 + (i % 15) * 36;
        const gy = 50 + Math.floor(i / 15) * 36;
        const tx = trig[mi] === 0 ? 330 + mi * 32 : 330 + (mi - 3) * 32;
        const ty = trig[mi] === 0 ? 170 : 220;
        const x = isMiss ? gx + (tx - gx) * sort : gx;
        const y = isMiss ? gy + (ty - gy) * sort : gy;
        return <rect key={i} x={x} y={y} width={26} height={26} fill={i <= k ? (isMiss ? C.cherry : C.crema) : 'none'} fillOpacity={isMiss ? 0.75 : 0.3} stroke={C.mocha} strokeWidth={1} />;
      })}
      <g opacity={sort}>
        <T x={30} y={188} s={12} f={C.cherryText}>misses, one trigger</T>
        <T x={30} y={238} s={12} f={C.cherryText}>misses, another trigger</T>
      </g>
      <T x={300} y={264} s={12} a="middle" f={C.caramel} o={end}>fix the trigger once; a category of misses goes</T>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 2.8, 5);
  const end = easeOut(seg(t, 3.4, 4.0));
  const chain = ['size', 'operations', 'graph', 'shape', 'falsifier'];
  return (
    <Svg label="Read the size, the operations, the situation as a graph, the shape, and what would break the match. Next, hash tables inside hash joins" h={220}>
      {chain.map((c, i) => (
        <g key={c} opacity={i <= k ? 1 : 0}>
          <rect x={16 + i * 114} y={60} width={104} height={36} fill="none" stroke={i === 4 ? C.caramel : C.crema} strokeWidth={1.4} />
          <T x={68 + i * 114} y={83} s={11} a="middle" f={i === 4 ? C.caramel : C.crema}>{c}</T>
          {i > 0 && <line x1={6 + i * 114} y1={78} x2={14 + i * 114} y2={78} stroke={C.latte} strokeWidth={1.2} />}
        </g>
      ))}
      <T x={300} y={30} s={12} a="middle" f={C.latte} o={k >= 0 ? 1 : 0}>read the statement before any algorithm</T>
      <T x={300} y={160} s={13} a="middle" f={C.caramel} o={end}>next: hash tables inside hash joins</T>
    </Svg>
  );
}
