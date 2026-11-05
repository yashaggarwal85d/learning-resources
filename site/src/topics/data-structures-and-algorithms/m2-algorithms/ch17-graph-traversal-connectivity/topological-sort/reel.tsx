import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Kahn's in-degree queue and reverse-DFS-finish-order run side by side on
// the same DAG, each independently valid; cycle detection as each algorithm's natural
// failure mode, not a bolted-on check; a heap-based Kahn's variant giving the
// lexicographically smallest valid order. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A build system with ten thousand targets, each depending on a handful of others, has to run every target after everything it needs. That order is not found by trial and error — it falls out of the same two traversals already built this chapter, pointed at in-degrees instead of distances.',
      body: <>A dependency graph, each vertex labelled by how many things still have to run before it.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Can a directed graph with a cycle have any valid topological order at all?',
      body: <>Any order would need some vertex in the cycle to come both before and after another vertex in that same cycle.</>,
      duration: 2.5,
      fig: 'PredictCycle',
      predict: {
        options: [
          { label: 'No — a cycle rules out every possible order', correct: true },
          { label: 'Yes, as long as the cycle is short enough' },
          { label: 'Yes, but only for cycles of length two' },
          { label: 'It depends on how many vertices are outside the cycle' },
        ],
        explain: (
          <>
            Any proposed order would force some vertex in the cycle to sit both before and after another vertex in
            that same cycle, since every vertex in a cycle can reach every other vertex in it. No order can satisfy
            that, so a cycle rules out a topological order entirely, regardless of its length or the rest of the graph.
          </>
        ),
      },
      Visual: S.PredictCycle,
    },
    {
      title: "Kahn's algorithm repeatedly removes a vertex with in-degree zero and decrements its neighbours' in-degrees, using a plain queue — the same queue mechanics already built for breadth-first search, pointed at in-degrees instead of distances.",
      body: <>Drain the queue one zero-in-degree vertex at a time, decrementing every neighbour live.</>,
      duration: 4,
      fig: 'KahnMechanism',
      Visual: S.KahnMechanism,
    },
    {
      title: "Reverse DFS finish order runs the same depth-first search already built, then reads off vertices in decreasing finish time. It gives a second, independently valid topological order — not required to match Kahn's vertex-for-vertex, only to respect every edge.",
      body: <>The identical DAG, finished by depth-first search instead of a queue, then reversed.</>,
      duration: 4,
      fig: 'ReverseDFS',
      takeaway: "Kahn's queue and reverse DFS finish order need not agree — each only has to be independently valid.",
      Visual: S.ReverseDFS,
    },
    {
      title: "Kahn's algorithm cannot be run to completion — vertices remain stuck with positive in-degree, none ever reaching zero — exactly when the graph has a cycle. Reverse DFS already has its own back-edge test built in. Neither algorithm needs a separate cycle check bolted on.",
      body: <>The queue runs dry on a cyclic graph, with every remaining vertex still owed an edge.</>,
      duration: 4,
      fig: 'StuckGraph',
      takeaway: "A cycle shows up as each algorithm's own natural failure, not a check added on top.",
      Visual: S.StuckGraph,
    },
    {
      title: 'Among all valid topological orders, which one does a min-heap keyed on vertex label produce, compared to a plain FIFO queue on the same graph: always the identical order, always a different order, or could either happen depending on the graph?',
      body: <>A heap always pops the smallest label currently available — not merely the next one enqueued.</>,
      duration: 2.5,
      fig: 'LexicographicHeap',
      predict: {
        options: [
          { label: 'Either, depending on the graph — and when they differ the heap gives the smallest', correct: true },
          { label: 'Always identical, since both only ever remove in-degree-zero vertices' },
          { label: 'Always different, since a heap and a queue never agree on order' },
          { label: 'The heap is always faster but never changes which order comes out' },
        ],
        explain: (
          <>
            When the vertices available at every step already happen to be in label order, a plain queue and a heap
            agree. But a plain queue only tracks arrival order: a smaller-labelled vertex that becomes available one
            round later still has to wait behind whatever arrived first. A heap breaks that tie by label every time,
            so whenever more than one valid order exists, it produces the lexicographically smallest one.
          </>
        ),
      },
      Visual: S.LexicographicHeap,
    },
    {
      title: 'A topological order says which vertices can come before which. It says nothing about which vertices can reach each other at all, in a graph with cycles where whole groups of vertices can each reach every other member of the group and nothing outside it.',
      body: <>No order exists without acyclicity — finding the groups that make it impossible, next.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'No valid topological order can exist unless the graph is acyclic — a cycle is the only obstruction.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
