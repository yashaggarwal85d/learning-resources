import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the |V| minus one relaxation-round bound, confirmed tight on a chain built to
// need every one of those rounds; negative-cycle detection and extraction on a currency-
// arbitrage-shaped graph (this topic's own worked example); the queue-based SPFA variant,
// measured favorably on one graph and against its own constructed worst case on another.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A loop of three currency conversions — dollars to euros, euros to pounds, pounds back to dollars — that, followed all the way around, leaves more money at the end than the trip started with.',
      body: <>A real possibility for a few seconds on a real exchange, and exactly what a negative cycle in a weighted graph means.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'If Bellman-Ford runs one more full round of relaxation beyond what the vertex count already guarantees is enough, and nothing anywhere improves, does that prove the graph has no negative cycle at all?',
      body: <>A negative cycle would keep finding an improving edge forever, no matter how many rounds already ran.</>,
      duration: 2.5,
      fig: 'PredictNegativeCycle',
      predict: {
        options: [
          { label: 'Yes — a negative cycle would always find one more improving edge', correct: true },
          { label: 'No — it only proves the graph has no simple path left to improve' },
          { label: 'It depends on which edge is relaxed last in that round' },
          { label: 'Only if the graph is also connected from the source to every vertex' },
        ],
        explain: (
          <>
            Every simple path has already stabilized by the time the guaranteed number of rounds is spent, since
            a simple path cannot have more edges than that. If one more full round still finds an improvement
            anywhere, the only remaining explanation is a cycle — and only a negative-weight one keeps paying
            off forever, which is exactly why it still shows up this late.
          </>
        ),
      },
      Visual: S.PredictNegativeCycle,
    },
    {
      title: "Bellman-Ford relaxes every edge in the graph on every round, not just the edges leaving one vertex, and repeats that full pass a number of times tied to how many vertices the graph has, minus one, before every distance is guaranteed correct.",
      body: <>No priority queue, no closest-first order — every edge, every round, until the count runs out.</>,
      duration: 4,
      fig: 'RelaxationMechanism',
      takeaway: 'Relaxing every edge, repeatedly, replaces the priority queue Dijkstra needed for the same guarantee.',
      Visual: S.RelaxationMechanism,
    },
    {
      title: 'On a chain built so each edge only helps the round after its neighbor already improved, the correct distances only finish settling on the very last permitted round — confirming the bound is tight, not merely a safe overestimate.',
      body: <>The same chain, relaxed in a kinder order, would have finished in a single round instead.</>,
      duration: 3.5,
      fig: 'WorstOrderTightness',
      takeaway: 'The relaxation-round bound is exactly as many rounds as some graph actually needs, not a loose upper bound.',
      Visual: S.WorstOrderTightness,
    },
    {
      title: 'A loop of currency conversions, each edge weighted by the negative logarithm of its exchange rate, where trading all the way around leaves more money than the trip started with — turned into a negative cycle, detected, and traced back edge by edge to the currencies that make it up.',
      body: <>The one piece of arithmetic that turns a multiplying profit into an adding-up weight a shortest-path algorithm can read.</>,
      duration: 4.5,
      fig: 'ArbitrageDetection',
      takeaway: 'Taking the negative logarithm of a rate is what turns a multiplicative arbitrage profit into an additive negative cycle.',
      Visual: S.ArbitrageDetection,
    },
    {
      title: "A queue-driven variant only re-relaxes a vertex's outgoing edges when that vertex's own distance has just improved. In the worst case over every possible graph, does this ever cost strictly less than plain Bellman-Ford's fixed sweeps, or exactly the same amount?",
      body: <>A graph built so every correction arrives just late enough to force rework erases the usual saving entirely.</>,
      duration: 3,
      fig: 'SPFAPredict',
      predict: {
        options: [
          { label: "No — its worst case is the identical bound as plain Bellman-Ford's", correct: true },
          { label: "Yes — the queue always does strictly less total work in the worst case" },
          { label: 'It depends only on how many vertices the graph has' },
          { label: 'The worst case is undefined, since the queue can grow without bound' },
        ],
        explain: (
          <>
            On most graphs this variant skips relaxing a vertex whose distance has not changed, which is a real
            saving in practice. But a graph can be built where a vertex is corrected only after its own children
            have already been relaxed with a wrong value, forcing a second round of relaxation through every one
            of them. That rework compounds down a chain of such corrections until the variant relaxes strictly
            more edges in total than plain Bellman-Ford's fixed sweeps ever would on the identical graph.
          </>
        ),
      },
      Visual: S.SPFAPredict,
    },
    {
      title: "Bellman-Ford answers the single-source question for any graph with a well-defined answer at all, negative edges included — the one restriction Dijkstra needed is gone, at the cost of relaxing every edge instead of only the closest vertex's.",
      body: <>The next question asks for every vertex's distance to every other, all at once.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'Relaxation is the one mechanism both algorithms share; only the order and the stopping rule differ.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
