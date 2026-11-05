import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: relaxing every edge once in topological order answers shortest paths on a
// DAG in a single linear pass, confirmed against Bellman-Ford; the identical order, run on
// negated weights, answers the longest path, valid only because the graph has no cycle; a
// task-dependency DAG's critical path is read off directly as that longest path.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A project schedule where some tasks can run in any order but others must wait on several finishing first — and the single number that decides how fast the whole project can possibly finish is just the longest path through a graph already built earlier this chapter.",
      body: <>One graph, one number, found by the cheapest algorithm in the entire chapter.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Relaxing every outgoing edge of each vertex exactly once, strictly in the order a topological sort already produces, needs no priority queue and no repeated rounds at all. Does that single pass still give correct distances on a graph that has even one cycle in it?',
      body: <>No ordering can be topological on a graph where some vertex depends on itself through a cycle.</>,
      duration: 3,
      fig: 'PredictCycleRequired',
      predict: {
        options: [
          { label: "No — without a topological order, a vertex can be relaxed too early", correct: true },
          { label: "Yes — relaxing every edge once always finds the correct distances" },
          { label: "Only if every cycle in the graph happens to have positive weight" },
          { label: "Only if the graph has fewer edges than vertices" },
        ],
        explain: (
          <>
            A topological order exists only because the graph has no cycle — it is defined as an order in which
            every edge points forward. Without one, a vertex could be relaxed, and its distance locked in as
            final, before one of its own predecessors has even been visited — and nothing in a single forward
            pass ever revisits a vertex to notice the mistake.
          </>
        ),
      },
      Visual: S.PredictCycleRequired,
    },
    {
      title: 'Visit every vertex in topological order. At each one, relax its outgoing edges exactly once — the moment a vertex is reached, every edge into it has already been relaxed by every predecessor that could possibly improve it.',
      body: <>One linear pass settles every distance, confirmed against Bellman-Ford's own slower, more general answer on the identical graph.</>,
      duration: 4,
      fig: 'TopoRelaxation',
      takeaway: "Relaxing in topological order settles every vertex's distance in one linear pass — no priority queue, no repeated rounds.",
      Visual: S.TopoRelaxation,
    },
    {
      title: 'Relax the identical edges on the identical graph, but visit the vertices in some other order instead — and one vertex ends up with a distance that is simply wrong, with no error, no crash, and no warning that anything went amiss.',
      body: <>The topological order is not a speed optimization — it is the entire reason the single pass is correct.</>,
      duration: 3.5,
      fig: 'WhyOrderMatters',
      takeaway: "The order relaxation happens in is not an optimization — on a DAG, it is the whole correctness argument.",
      Visual: S.WhyOrderMatters,
    },
    {
      title: 'Negating every edge weight and running the identical single pass turns the shortest-path answer into the longest-path answer. Does that same substitution correctly find the longest path on any graph at all, or only on this kind?',
      body: <>A cycle of positive weights becomes a cycle of negative weights the moment every weight is negated.</>,
      duration: 3.5,
      fig: 'PredictLongestPathGeneral',
      predict: {
        options: [
          { label: "Only on an acyclic graph — elsewhere, negation creates a negative cycle", correct: true },
          { label: "Yes — negation always turns shortest paths into longest paths" },
          { label: "Only on a graph with non-negative weights to begin with" },
          { label: "Only when every vertex has exactly one outgoing edge" },
        ],
        explain: (
          <>
            Negating a cycle of positive total weight produces a cycle of negative total weight — and a shortest
            path through a negative cycle is undefined, since looping around it keeps making the answer cheaper
            forever. A directed acyclic graph has no cycle to begin with, positive or negative, so negation is
            always safe there; on any graph with a cycle, the trick breaks exactly where the cycle does. The
            longest path problem itself is NP-hard on a general graph — this substitution is the one case where
            an acyclic graph makes an otherwise-hard problem free.
          </>
        ),
      },
      Visual: S.PredictLongestPathGeneral,
    },
    {
      title: "A schedule's own milestone-and-task graph has no cycle by its very nature — a task cannot depend on its own completion — so its critical path is exactly the longest path from the project's start to its end, read directly off the identical single pass.",
      body: <>The longest chain of dependent tasks sets the whole project's minimum possible length, with every other task free to float around it.</>,
      duration: 4,
      fig: 'CriticalPath',
      takeaway: "A project's critical path is just the longest path through its own task-dependency DAG.",
      Visual: S.CriticalPath,
    },
    {
      title: 'Every algorithm in this chapter answered a question between two vertices, or from one vertex to every other, on a graph that could have any shape at all. A graph with no cycle made the same question strictly easier than any of them needed to allow for.',
      body: <>The single cheapest algorithm in the whole chapter is also the one with the strongest precondition of all four.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: "The cheapest algorithm in the chapter also carries the strongest precondition of all four.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
