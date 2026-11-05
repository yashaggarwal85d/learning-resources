import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the third of the chapter's four reading skills. Some problems hand over no data
// at all, only a situation — a state, a move between states, a question. Writing those three
// things down turns a word ladder, a sliding puzzle, a lock or a route with a count limit into
// a graph question, whatever the surface story. Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A chain of real words: head, heal, teal, tell, tall, tail. Each step swaps exactly one letter and lands on a word that already exists, nothing invented along the way.',
      body: <>Head becomes tail, one letter at a time.</>,
      duration: 4.5,
      fig: 'WordLadderHook',
      Visual: S.WordLadderHook,
    },
    {
      title: 'Predict: the fifteen-puzzle has about ten trillion arrangements, each one a state, each slide of a tile a move. Before any search starts, can that many states ever be stored, and can a full search ever finish?',
      body: <>Can the graph be stored, and can a full search ever finish?</>,
      duration: 4,
      fig: 'PredictFifteenPuzzle',
      predict: {
        options: [
          { label: 'Yes to both, given enough memory and enough time' },
          { label: 'The graph can be stored, but a full search cannot finish' },
          { label: 'Neither: the graph is too large to store, so search must generate it on the fly', correct: true },
        ],
        explain: (
          <>
            Neither. Ten trillion states is too many to hold in memory at once, and a full search over all of
            them would never finish. The only way through is to generate each state's neighbours the moment they
            are needed, and never write down the graph itself.
          </>
        ),
      },
      Visual: S.PredictFifteenPuzzle,
    },
    {
      title: 'The eight-puzzle has a hundred eighty-one thousand four hundred forty reachable states, deepest one thirty-one moves away — both found by a real breadth-first search. The fifteen puzzle has ten trillion four hundred sixty-one billion three hundred ninety-four million nine hundred forty-four thousand states, a count reached by arithmetic, never by listing a single one.',
      body: <>One puzzle counted by search, the other counted without ever searching it.</>,
      duration: 5,
      fig: 'ImplicitGraphRevealed',
      takeaway: 'An implicit graph is generated one neighbour at a time; a search pays for every state it visits.',
      Visual: S.ImplicitGraphRevealed,
    },
    {
      title: 'Blank one letter of a word at a time and drop it into a bucket keyed by the blanked pattern. Two words sharing a bucket differ by exactly that one letter, so every edge of the word-ladder graph appears without ever comparing one word against another.',
      body: <>Every edge found by a shared bucket, never by comparing two words.</>,
      duration: 4.5,
      fig: 'WildcardBuckets',
      Visual: S.WildcardBuckets,
    },
    {
      title: 'A combination lock with four wheels: if the state remembers only the current combination, two different paths that reach that same combination look identical, even when one of them already passed through a forbidden code the other avoided.',
      body: <>Too small a state merges two situations that are not the same.</>,
      duration: 4.5,
      fig: 'StateSizeLock',
      takeaway: "Too small a state merges situations that must stay distinct; too large wastes space on distinctions that don't matter.",
      Visual: S.StateSizeLock,
    },
    {
      title: 'Every combination is a vertex, every single-wheel turn is an edge, and every forbidden code is removed as a vertex before the search starts: ten thousand states, eighty thousand edges. The shortest path avoiding every forbidden code is nine moves, found by ordinary breadth-first search.',
      body: <>Ten thousand states, eighty thousand edges, one shortest path.</>,
      duration: 5,
      fig: 'LockShortestPath',
      takeaway: 'Whatever the story, once the state, the move and the question are written down, the question is a graph question.',
      Visual: S.LockShortestPath,
    },
    {
      title: "A road network has a handful of discounted edges, usable at most k times. The state can no longer be just the vertex: it has to be the vertex together with how many discounts have been spent so far — four stacked copies of the same map, one per discount count, with discounted edges crossing up into the next layer.",
      body: <>A count limit becomes part of the state itself.</>,
      duration: 5,
      fig: 'LayeredGraphIntroduced',
      Visual: S.LayeredGraphIntroduced,
    },
    {
      title: 'A direct route costs thirty and never needs a discount. A four-edge discounted detour costs thirty with no discounts allowed, falls to twenty-five past three, and twenty past four — the detour only wins once enough discounts are allowed. At a hundred thousand vertices, three hundred thousand edges and k equal to three, the layered graph has four hundred thousand vertices and two million one hundred thousand edges.',
      body: <>The detour only wins once enough discounts are allowed.</>,
      duration: 5.5,
      fig: 'LayeredGraphMeasured',
      takeaway: 'A count constraint multiplies the graph by k plus one layers, one full copy of the state space each.',
      Visual: S.LayeredGraphMeasured,
    },
    {
      title: 'Predict: an Euler circuit, using every edge exactly once, is easy and runs in linear time. Does visiting every vertex exactly once stay just as easy a question?',
      body: <>Does visiting every vertex exactly once stay just as easy?</>,
      duration: 4,
      fig: 'PredictHamiltonian',
      predict: {
        options: [
          { label: 'Yes, the same linear-time idea still applies' },
          { label: 'No, visiting every vertex once is a much harder question', correct: true },
          { label: 'The two questions are actually identical' },
        ],
        explain: (
          <>
            No. A Hamiltonian cycle, visiting every vertex exactly once, is NP-hard, even though an Euler
            circuit, visiting every edge exactly once, is easy to find and build in linear time. Swapping
            "edge" for "vertex" in the statement swaps an easy problem for a hard one.
          </>
        ),
      },
      Visual: S.PredictHamiltonian,
    },
    {
      title: 'An Euler circuit uses every edge exactly once and is easy, built in linear time with depth-first search. A Hamiltonian cycle visits every vertex exactly once and is NP-hard. Two problems that differ by one word in the statement, and sit on opposite sides of easy and NP-hard.',
      body: <>Two problems that differ in one word.</>,
      duration: 4.5,
      fig: 'HamiltonianNearMiss',
      takeaway: 'Two problems differing by one word, edge versus vertex, sit on opposite sides of easy and NP-hard.',
      Visual: S.HamiltonianNearMiss,
    },
    {
      title: "A word ladder, a sliding puzzle, a lock with forbidden codes, a route with a limited number of discounts: none of them hand over a graph. Writing down the state, the move between states, and the question being asked turns each one into a graph question. Once it is a graph, the next skill is recognizing which graph problem it actually is. Recognizing reductions to known problems, next.",
      body: <>Next: once it is a graph, which known graph problem is it?</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
