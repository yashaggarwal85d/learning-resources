import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Prim's algorithm. A full topic: the mechanism (grow one tree, cut (T, V∖T), lightest crossing
// edge next), lazy against eager implementations, Prim against Dijkstra in one line, the array
// version's Θ(n²) cost against the heap version's O(m log n), the crossover derived and then
// measured, and the implementation facts that decide a real choice. Every count is exact and
// asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A complete graph on twenty thousand points: nearly two hundred million candidate edges. Sorting them all for Kruskal is the slow part before a single decision is made. A heap-based Prim touches every edge and pays a heap operation only for the useful ones. A plain array with no heap at all, doing many scans of many entries, looks wasteful yet may be the one that wins. Which structure wins, and why?",
      body: <>Nearly two hundred million edges. Sort them all, or scan with no heap at all?</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "On a dense graph, where the edge count is close to the largest it can be, does the fancier structure, a heap, win over a plain array with no heap at all?",
      body: <>Dense graph, fancy heap against a plain array. Which wins?</>,
      duration: 3,
      fig: 'PredictArrayOrHeap',
      predict: {
        options: [
          { label: 'The heap always wins; a heap is strictly more powerful than an array' },
          { label: 'The plain array wins once the graph is dense enough', correct: true },
          { label: 'They are always exactly tied' },
          { label: 'Density has no effect on which one wins' },
        ],
        explain: (
          <>
            The array's own cost never depends on how many edges the graph has, only on how many
            vertices it has. Once the edge count is large enough, paying a fixed cost per vertex
            beats paying a heap operation for every single edge.
          </>
        ),
      },
      Visual: S.PredictArrayOrHeap,
    },
    {
      title: "Prim's algorithm grows one tree outward from a single starting vertex. The cut is always the tree built so far against everything still outside it, and the lightest edge crossing that cut is added next. Correctness follows in one line from the cut property already proved: that cut always respects every edge already in the tree.",
      body: <>Grow one tree. The cut is the tree against everything else. Add the lightest crossing edge.</>,
      duration: 4.5,
      fig: 'PrimMechanism',
      Visual: S.PrimMechanism,
    },
    {
      title: "The lazy implementation: push every edge leaving a newly added vertex onto a priority queue, pop the minimum, and discard it on the spot if both its ends already sit inside the tree. Run on this chapter's own graph from the same starting site Kruskal's own run never needed: the identical weight, the identical five edges.",
      body: <>Push every outgoing edge. Pop the minimum. Discard it if both ends are already in.</>,
      duration: 5,
      fig: 'LazyPrim',
      Visual: S.LazyPrim,
    },
    {
      title: "The eager implementation: every vertex still outside the tree holds only the cheapest edge into the tree seen so far, improved by a decrease-key, a sift-up on the identical binary heap, whenever a better edge turns up. Run on the identical graph: the identical tree, the identical order of vertices added, and never more entries pushed than the lazy version needed.",
      body: <>One best-known edge per outside vertex. Improve it with a decrease-key, never more.</>,
      duration: 5,
      fig: 'EagerPrim',
      Visual: S.EagerPrim,
    },
    {
      title: "Prim's own loop and Dijkstra's own loop are the identical loop with one line changed: Prim's key is an edge's own weight; Dijkstra's key is the total path length so far. Everything else, the cut, the priority queue, the decrease-key, stays exactly the same.",
      body: <>Prim and Dijkstra: the same loop, one line different. An edge weight, or a path length.</>,
      duration: 4,
      fig: 'PrimAndDijkstra',
      Visual: S.PrimAndDijkstra,
    },
    {
      title: "The array version keeps no heap at all: a plain array of keys, a linear scan for the minimum, as many scans as there are vertices. Run on this chapter's own graph: twenty-one comparisons in total, a number fixed the moment the vertex count is fixed, however many edges the graph actually has.",
      body: <>No heap. A linear scan for the minimum, once per vertex. Twenty-one comparisons here.</>,
      duration: 4.5,
      fig: 'ArrayVersion',
      Visual: S.ArrayVersion,
    },
    {
      title: "Hold the same six vertices fixed and add far more edges between them. Does the array version's own comparison count change at all?",
      body: <>Same vertices, far more edges. Does the array version's own cost change?</>,
      duration: 3,
      fig: 'PredictArrayCost',
      predict: {
        options: [
          { label: 'Yes, more edges always means more comparisons' },
          { label: 'No, the comparison count is fixed by the vertex count alone', correct: true },
          { label: 'Only if the new edges are lighter than the existing ones' },
          { label: 'Only on a disconnected graph' },
        ],
        explain: (
          <>
            Every scan still walks the identical list of vertices not yet in the tree. More edges
            change which keys get updated during a scan, never how many cells the scan visits.
          </>
        ),
      },
      Visual: S.PredictArrayCost,
    },
    {
      title: "The crossover, derived: the array version costs a number proportional to the vertex count squared; the heap version costs a number proportional to the edge count times the logarithm of the vertex count. The heap wins exactly while that second number stays below the first, which happens while the edge count stays below roughly the vertex count squared over the logarithm, base two, of the vertex count.",
      body: <>Array: vertex count squared. Heap: edge count times a logarithm. The heap wins below one ratio.</>,
      duration: 5,
      fig: 'CrossoverDerived',
      Visual: S.CrossoverDerived,
    },
    {
      title: "The crossover, measured directly: holding the vertex count fixed and sweeping the edge count upward on random graphs, the heap version's own cost first exceeds the array version's fixed cost at a point landing in the same broad range the derived ratio predicts. Big-O hides constant factors; this checks the order of magnitude, not an exact match.",
      body: <>Sweep the edge count. The heap's cost crosses the array's fixed cost near the predicted point.</>,
      duration: 4.5,
      fig: 'CrossoverMeasured',
      takeaway: "The derived crossover and the measured one land in the same broad range, which is what Big-O ever promises.",
      Visual: S.CrossoverMeasured,
    },
    {
      title: "Kruskal's own cost is keyed to how many edges the graph has, through its sort. Prim's array version is keyed only to how many vertices the graph has. On a dense graph, Prim's array version wins by the measured margin; on a sparse graph, or one whose edges already arrive sorted, Kruskal is competitive or better.",
      body: <>Kruskal scales with edges. Prim's array version scales with vertices alone.</>,
      duration: 4,
      fig: 'KruskalAgainstPrim',
      takeaway: "Kruskal's cost tracks the edge count; the array version of Prim tracks only the vertex count.",
      Visual: S.KruskalAgainstPrim,
    },
    {
      title: "The array version wants an adjacency matrix or list but touches memory in one straight line. The heap version wants an adjacency list, or the compressed layout from earlier in this milestone, and pays for every heap operation it performs. Dense graphs, and complete graphs built from a set of points where every pair is an edge, are the array version's natural home.",
      body: <>Straight-line memory for the array version; heap overhead for the other. Density decides.</>,
      duration: 4,
      fig: 'ImplementationFacts',
      takeaway: "A dense or complete graph is the array version's natural home; a sparse one favors the heap.",
      Visual: S.ImplementationFacts,
    },
    {
      title: "A minimum spanning tree was certified by one lemma about cuts: look at any cut, and the lightest edge crossing it is safe. The next chapter keeps the cuts and changes what the edges mean. Now an edge is a pipe with a capacity, a cut is a bottleneck whose capacity is what crosses it, and the question is how much can flow from a source to a sink. Max-flow min-cut, next.",
      body: <>The cuts stay. The edges become pipes with a capacity. Max-flow min-cut, next.</>,
      duration: 4,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
