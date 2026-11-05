import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a state as it is (a word, a board, four digits); latte =
// secondary labels (a count, a cost); caramel = the thing to look at (the move, the condition
// being tested); cinnamon (rare) = the alternative being compared (a near-miss, a second route);
// cherry/cherryText = the bad outcome (a graph too large to store, a near-miss that is NP-hard).

// 1 · Hook: a word ladder, one letter at a time
export function WordLadderHook({ t }: StepCtx) {
  const words = ['head', 'heal', 'teal', 'tell', 'tall', 'tail'];
  return (
    <Svg label="A chain of words, each differing from the last by exactly one letter, head changing into tail" h={260}>
      {words.map((w, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.4, 0.7 + i * 0.4));
        return (
          <T key={w} x={300} y={60 + i * 32} s={14} a="middle" f={i === 0 || i === words.length - 1 ? C.caramel : C.crema} o={a}>
            {w}
          </T>
        );
      })}
    </Svg>
  );
}

// 2 · Predict: can the 15-puzzle's graph be stored, and can breadth-first search finish?
export function PredictFifteenPuzzle({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A sixteen-tile puzzle with a question mark over whether its graph can be stored or fully searched" h={250}>
      <g opacity={a}>
        <rect x={180} y={80} width={240} height={60} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={300} y={115} s={11} a="middle" f={C.latte}>about ten trillion states</T>
      </g>
      <T x={300} y={220} s={12} a="middle" f={C.caramel}>can the graph be stored? can a full search ever finish?</T>
    </Svg>
  );
}

// 3 · The implicit graph: never stored, generated on demand
export function ImplicitGraphRevealed({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="The eight-puzzle's state count and search depth counted exactly, against the fifteen-puzzle's count, far too large to store" h={260}>
      <g opacity={a}>
        <T x={300} y={90} s={12} a="middle" f={C.crema}>eight-puzzle: states counted</T>
        <T x={300} y={118} s={11} a="middle" f={C.latte}>deepest: thirty-one moves</T>
      </g>
      <g opacity={b}>
        <T x={300} y={165} s={11} a="middle" f={C.cherryText}>fifteen-puzzle: too many to store</T>
      </g>
    </Svg>
  );
}

// 4 · The wildcard-bucket trick
export function WildcardBuckets({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A wildcard slot collecting every word that shares it, finding edges without ever comparing one word to another" h={250}>
      <g opacity={a}>
        <rect x={200} y={80} width={200} height={40} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={300} y={105} s={13} a="middle" f={C.crema}>h _ l l o</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={b}>edges found without ever being compared</T>
    </Svg>
  );
}

// 5 · State too small or too large: the lock example
export function StateSizeLock({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Four wheels of a lock, with a forbidden code crossed out, raising the question of what the state must remember" h={250}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={170 + i * 70} y={80} width={50} height={50} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.cherryText} o={b}>too small a state, and the answer merges two different situations</T>
    </Svg>
  );
}

// 6 · The lock's size, and a shortest path avoiding forbidden codes
export function LockShortestPath({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Ten thousand states and eighty thousand edges, with a shortest path found that avoids every forbidden code" h={250}>
      <g opacity={a}>
        <T x={300} y={100} s={12} a="middle" f={C.crema}>ten thousand states, eighty thousand edges</T>
        <T x={300} y={135} s={11} a="middle" f={C.latte}>a shortest path, forbidden codes removed as vertices</T>
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.caramel}>the question is a graph question, whatever the story</T>
    </Svg>
  );
}

// 7 · The layered graph: a constraint becomes part of the state
export function LayeredGraphIntroduced({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Four stacked copies of one road graph, a discounted edge crossing from one layer up into the next" h={260}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={160} y={60 + i * 35} width={280} height={24} fill="none" stroke={C.taupe} strokeWidth={1.2} />
        ))}
      </g>
      <T x={300} y={225} s={12} a="middle" f={C.caramel} o={b}>the count of discounts used becomes part of the state</T>
    </Svg>
  );
}

// 8 · The layered graph, sized and measured
export function LayeredGraphMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  const c = easeOut(seg(t, 2.3, 3.0));
  return (
    <Svg label="A direct route and a discounted detour, the detour only winning once enough discounts are allowed" h={260}>
      <g opacity={a}>
        <T x={300} y={80} s={12} a="middle" f={C.crema}>direct route: cost thirty</T>
      </g>
      <g opacity={b}>
        <T x={300} y={115} s={12} a="middle" f={C.cinnamon}>detour: wins past three discounts</T>
      </g>
      <g opacity={c}>
        <T x={300} y={165} s={11} a="middle" f={C.latte}>four hundred thousand vertices</T>
        <T x={300} y={190} s={11} a="middle" f={C.latte}>two million one hundred thousand edges</T>
      </g>
    </Svg>
  );
}

// 9 · Predict: does "visit every vertex once" stay easy?
export function PredictHamiltonian({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A graph with every vertex lit, and a question mark over whether visiting each one exactly once is still an easy question" h={250}>
      <g opacity={a}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={200 + i * 50} cy={100} r={14} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.caramel}>visit every vertex exactly once: still an easy question?</T>
    </Svg>
  );
}

// 10 · The near-miss: Hamiltonian is NP-hard, Euler circuits are easy
export function HamiltonianNearMiss({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A circuit using every edge once, easy and linear time, beside a cycle visiting every vertex once, NP-hard" h={260}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>every edge once: easy</T>
      </g>
      <g opacity={b}>
        <T x={300} y={120} s={12} a="middle" f={C.cherryText}>every vertex once: NP-hard</T>
      </g>
      <T x={300} y={180} s={11} a="middle" f={C.caramel}>two problems, one word apart</T>
    </Svg>
  );
}

// 11 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A picture of states and moves, with the next question of which known graph problem it actually is" h={250}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>state, move, question</T>
        <T x={300} y={125} s={12} a="middle" f={C.caramel}>any situation becomes a graph</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: which graph problem is it?</T>
    </Svg>
  );
}
