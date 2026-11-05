import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: approximation ratios, defined and proved, through two contrasting
// guarantees on the two NP-hard problems named here (declared, since the intractability
// chapter before this one is not live yet): greedy set cover (a ratio that grows like
// ln n, and a family that forces it to) and vertex cover from a maximal matching (a flat
// factor of two, attained exactly on K(m,m) and checked against a brute-force optimum on
// sixty random graphs). Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "An NP-hard problem has no exact polynomial algorithm waiting to be found, unless P equals NP. The job still ships. Set cover — pick the fewest sets from a collection that together cover every element — is one of these problems, and a cheap rule, always pick the set that covers the most elements still missing, cannot find the optimal answer. What it can do instead is come with a proof, in advance, of exactly how far from optimal it can ever land. Approximation ratios, next.",
      body: <>A locked door marked NP-hard. A cheap rule offers something almost as good: a proof of its own distance from the best answer.</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "An approximation algorithm's guarantee is a multiplicative bound against the optimum, proved for every instance — not measured on a few, not a rule of thumb. That is what sets it apart from a heuristic: a heuristic can work well in practice and still give no indication, in advance, of when it might fail badly.",
      body: <>A theorem, not a track record. The proof holds before the algorithm ever sees an input.</>,
      duration: 4,
      fig: 'RatioPromise',
      Visual: S.RatioPromise,
    },
    {
      title: "Greedy set cover's rule: at each step, pick the set that covers the most elements still uncovered. Nothing cleverer than that — and the proof behind it charges each newly covered element a cost of one over however many elements that step covered, so the charges telescope into a harmonic sum.",
      body: <>The largest remaining gain, every single step. The proof is in how those gains are charged.</>,
      duration: 4.5,
      fig: 'GreedyRule',
      Visual: S.GreedyRule,
    },
    {
      title: "On a family built from two row sets, each covering half the universe, plus k blocks that double in size, does greedy's ratio against the optimum of two stay bounded by some fixed constant as k grows, or does it keep growing with k?",
      body: <>Two sets would finish the job. Does a bigger k ever force greedy to need more and more sets anyway?</>,
      duration: 2.5,
      fig: 'PredictFamily',
      predict: {
        options: [
          { label: 'No — greedy always lands within a small constant factor of two' },
          { label: 'No — the two row sets always dominate, whatever k is' },
          { label: 'Yes — the ratio keeps growing as k grows, without any fixed ceiling', correct: true },
          { label: 'Yes, but only once k exceeds the size of the universe itself' },
        ],
        explain: (
          <>
            At k = 3, 5, 8, 12 greedy needs exactly 3, 5, 8, 12 sets against an optimum of 2 — ratios 1.5, 2.5,
            4.0, 6.0, rising every time. No fixed constant bounds this family; that's a fact about the problem,
            not a weakness in the algorithm.
          </>
        ),
      },
      Visual: S.PredictFamily,
    },
    {
      title: 'Measured directly at four scales: n = 28, 124, 1,020, 16,380 elements, greedy needs 3, 5, 8, 12 sets against an optimum of 2 every time — ratios 1.5, 2.5, 4.0, 6.0, climbing alongside ln(n) = 3.33, 4.82, 6.93, 9.70.',
      body: <>The ratio rides under ln(n) plus one at every scale, exactly as the harmonic-number bound promises — and it keeps climbing.</>,
      duration: 4.5,
      fig: 'FamilyMeasured',
      takeaway: "Greedy set cover's ratio isn't flat — it grows with ln n, and one family forces that growth every scale.",
      Visual: S.FamilyMeasured,
    },
    {
      title: "This isn't a weak proof waiting to be improved. Feige showed in 1998 that no polynomial-time algorithm beats (one minus epsilon) times the natural log of n, for any epsilon greater than zero, unless P equals NP. Greedy's own harmonic bound sits right at that ceiling.",
      body: <>A proven ceiling, not just a proven floor. Greedy's logarithmic bound is essentially the best any algorithm can promise.</>,
      duration: 4,
      fig: 'FeigeBound',
      takeaway: "Greedy's logarithmic bound isn't just a proof floor — it's essentially the best any algorithm can promise.",
      Visual: S.FeigeBound,
    },
    {
      title: 'A second NP-hard problem, a very different shape of guarantee: vertex cover asks for the fewest vertices that touch every edge of a graph. Also declared NP-hard, also with no exact polynomial algorithm unless P equals NP — and also with a simple algorithm that comes with a proof.',
      body: <>Different problem, same opening line: no exact answer in polynomial time, unless P equals NP.</>,
      duration: 3.5,
      fig: 'VertexCoverIntro',
      Visual: S.VertexCoverIntro,
    },
    {
      title: "Find any maximal matching — a greedy scan that takes an edge, removes both its endpoints, and repeats — and build the cover from every one of that matching's endpoints. Maximal only, never the harder maximum matching: maximality alone is what the proof needs. The construction covers every edge, because if it missed one, that edge could have joined the matching, contradicting maximality. And the optimal cover itself must contain at least one endpoint of every edge in the matching, since the matching's edges share no endpoints with each other — so the matching's size is itself a lower bound on the optimum, and the built cover, with exactly twice as many vertices as the matching has edges, is at most twice the optimum.",
      body: <>Two matched edges, four endpoints, and a short proof: the optimum can never do better than one vertex per matched edge.</>,
      duration: 6,
      fig: 'MatchingConstruction',
      Visual: S.MatchingConstruction,
    },
    {
      title: 'Is that factor-of-two bound ever actually reached by a real graph, or is it only a theoretical worst case that ordinary graphs avoid?',
      body: <>A worst-case proof is one thing. Does any real graph actually hit it?</>,
      duration: 2.5,
      fig: 'PredictTight',
      predict: {
        options: [
          { label: 'No — the ratio of 2 is a loose bound real graphs never approach' },
          { label: 'Yes, but only in the limit as the graph grows without end' },
          { label: 'Yes — attained exactly, measured directly on a real graph', correct: true },
          { label: "No — the bound only applies to graphs with an odd number of vertices" },
        ],
        explain: (
          <>
            On the complete bipartite graph with six vertices on each side, every maximal matching has exactly six
            edges, the constructed cover has all twelve endpoints, and the true optimum is six — every vertex of one
            side alone covers every edge. The ratio of 2.0 isn't approached, it's hit exactly, measured.
          </>
        ),
      },
      Visual: S.PredictTight,
    },
    {
      title: "And it's not only the tight example: measured directly on sixty random graphs of four to thirteen vertices, checked against the true optimum found by brute force, the built cover never exceeded twice the optimum — not once, on any of them. The worst ratio actually observed was exactly 2.0.",
      body: <>Not a special case rigged to hit the bound — the ceiling held on every ordinary graph checked against it too.</>,
      duration: 4.5,
      fig: 'RandomGraphCheck',
      takeaway: 'Every proof follows the same trick: find a computable lower bound on the optimum, then compare your answer to it.',
      Visual: S.RandomGraphCheck,
    },
    {
      title: "Set cover's ratio grows with the input, tracking the natural log of n upward without any ceiling. Vertex cover's ratio does not — a flat factor of two, on every graph, forever. Both are called approximation ratios, both are proved the identical way, and telling them apart by their shape, not just their number, is the real skill.",
      body: <>One climbs a staircase that never ends. One sits on a flat line. Same proof technique, two different promises.</>,
      duration: 4.5,
      fig: 'SideBySide',
      Visual: S.SideBySide,
    },
    {
      title: "Every proof in this chapter is the same trick, stated once: find a quantity you can compute in polynomial time that is itself a lower bound on the optimum you cannot compute, then bound your own answer against that computable quantity instead. Two more guarantees built the identical way come next, on two more problems the intractability chapter before this one named without an exact answer: first-fit-decreasing for packing files into bins, and longest-processing-time-first for scheduling jobs onto machines. Bin packing and makespan scheduling, next.",
      body: <>Compute a lower bound on OPT. Compare your own answer to it. That is the entire chapter, one proof at a time.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
