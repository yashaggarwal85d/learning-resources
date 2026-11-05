import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Tarjan's single-pass low-link algorithm and Kosaraju's two-pass algorithm,
// confirmed to find the identical partition into SCCs; the condensation DAG, proved acyclic
// by direct construction and reuse of the directed-cycle test built earlier in the chapter; two-SAT solved entirely by an
// implication graph and its SCCs. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A graph where every vertex can reach every other looks, from a distance, indistinguishable from one where only small pockets can reach each other. Telling the two apart, for a graph with a billion edges, takes exactly one more depth-first search, carrying one extra number per vertex.',
      body: <>Small pockets, each reaching only itself and nothing outside it.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Contracting every strongly connected component of any directed graph down to a single vertex — is the result always a DAG, sometimes a DAG, or never a DAG?',
      body: <>A cycle among the contracted vertices would mean something about their original components.</>,
      duration: 2.5,
      fig: 'PredictCondensation',
      predict: {
        options: [
          { label: 'Always a DAG', correct: true },
          { label: 'Sometimes a DAG, depending on the graph' },
          { label: 'Never a DAG — contraction always creates a cycle' },
          { label: 'Only a DAG if the original graph had no cycles at all' },
        ],
        explain: (
          <>
            A cycle among the contracted vertices would mean their original components could reach each other in
            both directions — but then they would already have been mutually reachable, and maximality says they
            would have been one component to begin with. So contraction can never leave a cycle behind.
          </>
        ),
      },
      Visual: S.PredictCondensation,
    },
    {
      title: "Tarjan's algorithm runs a single depth-first search, maintaining a low-link value per vertex — the smallest discovery index reachable from it through tree and back edges — and pops a complete component the instant a vertex's low-link equals its own discovery index.",
      body: <>One DFS, one explicit stack, a pop whenever low-link catches up to a vertex's own index.</>,
      duration: 4.5,
      fig: 'TarjanMechanism',
      Visual: S.TarjanMechanism,
    },
    {
      title: "Kosaraju's algorithm runs DFS once to get a finish order, reverses every edge, and runs DFS again in decreasing finish order. Each new DFS tree in the second pass is exactly one strongly connected component — simpler to state, at the cost of a second full pass and an explicit transpose.",
      body: <>Two full depth-first searches and a graph reversal, against Tarjan's one.</>,
      duration: 4,
      fig: 'KosarajuMechanism',
      takeaway: 'Tarjan needs one DFS and a stack; Kosaraju needs two passes and a transposed graph.',
      Visual: S.KosarajuMechanism,
    },
    {
      title: 'Contracting every strongly connected component to a single vertex turns any directed graph into a DAG. A cycle among the condensed vertices would mean their original components were mutually reachable — contradicting that each was already a maximal such group.',
      body: <>Build the condensation directly on this graph and confirm it directly: no cycle, by the same test built for directed graphs earlier in the chapter.</>,
      duration: 4,
      fig: 'CondensationGraph',
      takeaway: 'The condensation of any directed graph is acyclic — maximality rules a cycle out.',
      Visual: S.CondensationGraph,
    },
    {
      title: "In a two-SAT instance's implication graph, if a variable's two literals (itself and its negation) land in the same strongly connected component, is the formula satisfiable, unsatisfiable, or does it depend on the rest of the formula?",
      body: <>The two literals would need the identical value in any satisfying assignment, since each can reach the other through a chain of implications.</>,
      duration: 2.5,
      fig: 'TwoSAT',
      predict: {
        options: [
          { label: 'Unsatisfiable, always', correct: true },
          { label: 'Satisfiable, always' },
          { label: 'Depends on which other clauses are present' },
          { label: 'Depends only on how many variables the formula has' },
        ],
        explain: (
          <>
            A variable sharing a component with its own negation means each implies the other, forcing them to carry
            the identical truth value in any satisfying assignment. But a variable and its negation can never
            legitimately share a value — one is true exactly when the other is false — so no assignment can satisfy
            the formula, regardless of what else it contains.
          </>
        ),
      },
      Visual: S.TwoSAT,
    },
    {
      title: "Finding one key, one boundary, one order statistic was the previous chapter's business. This chapter answered a different kind of question about a graph with no weights at all: which vertices are reachable, in what order, and which groups of vertices can all reach each other. Every answer cost exactly one traversal.",
      body: <>Every edge counted for one step and no more — the next question puts a cost on each one.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'Every structural fact this chapter found cost exactly one traversal — no edge counted for more than one step.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
