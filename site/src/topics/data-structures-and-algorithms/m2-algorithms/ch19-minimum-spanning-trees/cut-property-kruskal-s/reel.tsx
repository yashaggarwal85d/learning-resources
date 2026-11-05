import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Cut property and Kruskal's algorithm. A full topic: the generic MST algorithm, the cut
// property and cycle property each proved by an exchange argument, Kruskal's algorithm
// (sort plus union-find), the tie-trap, spanning-tree counts by brute force, the MST against
// the shortest-path tree, and why negative weights change nothing. Every count is exact and
// asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Six sites, ten candidate links, each with a price. The board wants every site reachable at the lowest total cost. Taking the cheapest link first looks obviously right, and the identical instinct is wrong for coin change, for knapsack, for the travelling salesman. Why is this greedy choice the right one?",
      body: <>Six sites, ten priced links. Cheapest-first looks right. Is it?</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Is the cheapest network that connects every site the same network as the cheapest routes from one head-office site to every other site?",
      body: <>Cheapest network, or cheapest routes from one site: are they the same tree?</>,
      duration: 3,
      fig: 'PredictSameTree',
      predict: {
        options: [
          { label: 'Yes, cheapest routes from one site always give the cheapest network' },
          { label: 'No, pricing a network and pricing routes from one site can differ', correct: true },
          { label: 'Only when every edge weight is distinct' },
          { label: 'Only on a graph with no cycles to begin with' },
        ],
        explain: (
          <>
            They answer different questions. One prices the cheapest set of links that keeps
            everyone connected to everyone; the other prices the cheapest route from one
            particular site. On this topic's own graph the two trees really do differ, and by
            a measurable amount.
          </>
        ),
      },
      Visual: S.PredictSameTree,
    },
    {
      title: "The generic algorithm behind every correct minimum-spanning-tree method: start with no edges picked, repeatedly add any edge that is safe, meaning still part of some minimum spanning tree, and stop once n minus one edges are picked. Every algorithm in this chapter is this generic algorithm with a different, fast rule for finding a safe edge.",
      body: <>Repeatedly add a safe edge. Every MST algorithm is this, with a faster rule.</>,
      duration: 4.5,
      fig: 'GenericAlgorithm',
      Visual: S.GenericAlgorithm,
    },
    {
      title: "The cut property: for any cut that respects the edges already picked, a lightest edge crossing that cut is safe. Demonstrated directly on this topic's own graph: cutting two vertices away from the rest, the lightest edge crossing that cut turns out to be exactly one of the five edges the minimum spanning tree keeps.",
      body: <>A lightest edge crossing any respecting cut is always safe to add.</>,
      duration: 5,
      fig: 'CutProperty',
      Visual: S.CutProperty,
    },
    {
      title: "The cycle property, the cut property's mirror: on any cycle, a strictly heaviest edge belongs to no minimum spanning tree. Demonstrated directly on a triangle inside this topic's own graph: its heaviest edge is confirmed absent from the computed minimum spanning tree.",
      body: <>On any cycle, a strictly heaviest edge belongs to no minimum spanning tree.</>,
      duration: 4.5,
      fig: 'CycleProperty',
      Visual: S.CycleProperty,
    },
    {
      title: "Two edges tie for lightest across some cut. Does the cut property still name one single safe edge?",
      body: <>Two edges tie for lightest across a cut. Does one single edge stay safe?</>,
      duration: 3,
      fig: 'PredictTie',
      predict: {
        options: [
          { label: 'Yes, ties are broken by the order edges are listed' },
          { label: 'No single edge is forced; each tied edge is safe for some minimum tree', correct: true },
          { label: 'A tie means the graph has no minimum spanning tree at all' },
          { label: 'A tie always means the graph is disconnected' },
        ],
        explain: (
          <>
            With a tie, the proof only needs a lightest edge, not the unique one, so every
            edge achieving the tied minimum weight is safe for some minimum spanning tree —
            which is exactly why a tie can produce more than one minimum spanning tree, all
            of the same total weight.
          </>
        ),
      },
      Visual: S.PredictTie,
    },
    {
      title: "Kruskal's algorithm: sort every edge by weight, scan them in that order, and let union-find answer one question per edge, does accepting it close a cycle. Accept if not, reject if so, stop once five edges are accepted. Measured directly: five edges accepted, five rejected, each rejected edge closing a cycle at the exact moment it is reached.",
      body: <>Sort by weight. Scan. Union-find vetoes the edges that would close a cycle.</>,
      duration: 5,
      fig: 'KruskalRun',
      Visual: S.KruskalRun,
    },
    {
      title: "Kruskal's own cost: sorting the edges, then a near-linear scan with union-find. The sort is the part that grows with the size of the edge list; the union-find part barely grows at all. A pre-sorted edge list, or integer weights fed through this chapter's own radix sort, changes which part of the cost actually matters.",
      body: <>The sort dominates Kruskal's cost. Union-find's own cost barely grows at all.</>,
      duration: 4,
      fig: 'WhySortDominates',
      Visual: S.WhySortDominates,
    },
    {
      title: "The tie-trap: a four-cycle where all four edges share the identical weight has four different minimum spanning trees, every one of the same total weight. Demonstrated directly: brute-force enumeration confirms all four trees exist and all four tie.",
      body: <>A four-cycle with all-equal weights has four different minimum spanning trees.</>,
      duration: 4,
      fig: 'TieTrap',
      takeaway: "A tie at the lightest weight never breaks the cut property; it just means more than one tree is minimum.",
      Visual: S.TieTrap,
    },
    {
      title: "Counting every spanning tree of this topic's own graph by brute force: eighty-nine in total, counting both of the two parallel edges between the same pair of sites; dropping the heavier of that pair drops the count to fifty-five. Exactly one of those eighty-nine trees achieves the minimum weight; the next cheapest tree costs one more.",
      body: <>Eighty-nine spanning trees in total; exactly one of them is minimum.</>,
      duration: 5,
      fig: 'SpanningTreeCounts',
      takeaway: "A graph can have dozens of spanning trees; the cut property is what singles out the minimum one.",
      Visual: S.SpanningTreeCounts,
    },
    {
      title: "The reveal: this topic's own minimum spanning tree weighs one less than the shortest-path tree from the same starting site, computed on the identical graph. The minimum spanning tree keeps an edge the shortest-path tree never would, because pricing a network is not the same question as pricing routes from one site.",
      body: <>The minimum spanning tree and the shortest-path tree differ by exactly one.</>,
      duration: 4.5,
      fig: 'MstVsShortestPath',
      Visual: S.MstVsShortestPath,
    },
    {
      title: "Shifting every single edge weight by the identical amount, even into negative numbers, changes no relative order between any two edges, so Kruskal's run, and the cut property's own argument, are completely untouched. Confirmed directly: the identical five edges are accepted after every weight is shifted negative.",
      body: <>Shift every weight by the same amount, even negative. The same tree wins.</>,
      duration: 4,
      fig: 'NegativeWeights',
      takeaway: "Negative weights cause no trouble here, unlike for shortest paths, since only the relative order between edges matters.",
      Visual: S.NegativeWeights,
    },
    {
      title: "Kruskal's algorithm sorts every edge and lets union-find veto the ones that close a cycle, so it needs the whole edge list before it starts. Nothing in the cut property demands that. The cut can just as well be the tree already built against everything else, with the cheapest edge leaving it taken next. Prim's algorithm, next.",
      body: <>The cut can be the tree you already have, against everything else. Prim, next.</>,
      duration: 4,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
