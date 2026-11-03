import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: CSR's own two flat arrays, built from an edge list in two passes and checked
// against topic 36's adjacency list; CSC, the same idea transposed; and vertex reordering,
// measured as a real, exact drop in distinct cache lines a set of hub vertices depends on.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next.",
      body: <>An adjacency list's own cost was never wrong at six vertices. At a billion edges, it pays for a billion separate allocations.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'CSR replaces one allocation per edge with two flat arrays: offsets, length V + 1, and targets, length E.',
      body: <>No per-vertex structure at all — just two arrays, sized by vertex count and edge count directly.</>,
      duration: 4,
      fig: 'TwoArrays',
      Visual: S.TwoArrays,
    },
    {
      title: "Offsets[v] is a running total of every degree before v, not v's own degree — which is why it has to sweep left to right, only after every vertex's own out-degree is already counted.",
      body: <>Pass one: count every vertex's own out-degree, then turn those counts into offsets by a running prefix sum.</>,
      duration: 4.5,
      fig: 'PassOneCount',
      takeaway: "Offsets[v] is a running total of every degree before v, not v's own degree.",
      Visual: S.PassOneCount,
    },
    {
      title: 'Offsets just finished filling in. Pass two still has to place every edge into its own slot — and offsets itself has to survive that unchanged.',
      body: <>Can pass two just write into offsets directly, using it as its own moving cursor?</>,
      duration: 2,
      fig: 'PassTwoPredict',
      predict: {
        options: [
          { label: 'Yes — offsets already holds exactly the next free slot for each vertex' },
          { label: 'No — writing into offsets directly would corrupt it; pass two needs its own copy as a cursor', correct: true },
          { label: "It doesn't matter, since offsets is rebuilt from scratch afterward anyway" },
          { label: 'No — targets has to be built before offsets, not after' },
        ],
        explain: (
          <>
            Offsets[v] has to keep meaning "where v's own slice starts," forever after. Pass two needs a separate, mutable copy as its cursor,
            initialised from offsets but advanced on its own — reusing offsets directly would corrupt the very thing every later lookup depends on.
          </>
        ),
      },
      Visual: S.PassTwoPredictViz,
    },
    {
      title: "CSR's own slice for a vertex matches its adjacency list exactly — same neighbours, different layout. Nothing here is a new graph; it's the identical one, laid out differently.",
      body: <>A separate cursor scatters each edge into its own source's next free slot — then A's finished slice lines up against its own chain.</>,
      duration: 5,
      fig: 'PassTwoScatter',
      takeaway: "CSR's own slice for a vertex matches its adjacency list exactly — same neighbours, different layout.",
      Visual: S.PassTwoScatter,
    },
    {
      title: "CSR was built to answer one direction cheaply. The reverse direction — who points at v — needs a second, transposed structure, not a smarter query over the first one's own arrays.",
      body: <>Who points at F? Not one lookup in the array already on screen — it was built to answer the other direction.</>,
      duration: 2,
      fig: 'CSCPredict',
      predict: {
        options: [
          { label: "Scan all of targets for F's own index — CSR already supports this directly" },
          { label: 'Build a second pair of arrays, CSC, indexed by destination instead of source', correct: true },
          { label: 'F has no incoming edges, so the question has no answer' },
          { label: 'Rebuild the adjacency list and read it backwards' },
        ],
        explain: (
          <>
            CSR's own arrays are ordered by source; finding every source pointing at F this way means scanning the whole array. CSC is the
            identical two-pass idea, run with source and destination swapped, answering the reverse direction just as cheaply.
          </>
        ),
      },
      Visual: S.CSCPredictViz,
    },
    {
      title: 'CSC is CSR transposed: the same two-pass construction, indexed by destination instead of source.',
      body: <>Run the identical two passes with source and destination swapped: F's own slice now reads D, E — who sends it an edge.</>,
      duration: 4,
      fig: 'CSCReveal',
      takeaway: 'CSC is CSR transposed: the same two-pass construction, indexed by destination instead of source.',
      Visual: S.CSCReveal,
    },
    {
      title: "CSR never fixes which id a vertex gets — reordering is a free choice CSR leaves open. A vertex read constantly but sitting at a random, far-off id pays for that distance every single time.",
      body: <>Zoom out to a billion edges: a few vertices get read constantly, but their own ids landed wherever the graph happened to list them first.</>,
      duration: 4,
      fig: 'WhyReorderHook',
      Visual: S.WhyReorderHook,
    },
    {
      title: 'Degree sort, RCM and community order relabel by three different signals toward the identical goal: neighbours at nearby ids.',
      body: <>Sort by degree alone. Or by breadth-first visiting order from a low-degree start. Or by detected cluster membership.</>,
      duration: 4.5,
      fig: 'ThreeStrategies',
      takeaway: 'Degree sort, RCM and community order relabel by three different signals toward the identical goal: neighbours at nearby ids.',
      Visual: S.ThreeStrategies,
    },
    {
      title: 'A cache line is a fixed-size block of memory, not one value — relabelling the busiest vertices into the smallest ids changes what fills each one.',
      body: <>A cache fetches memory eight values at a time, not one at a time. What happens once the busiest vertices are packed into the smallest ids?</>,
      duration: 2,
      fig: 'DegreeSortPredict',
      predict: {
        options: [
          { label: 'Nothing changes — a cache line still only ever holds one vertex’s own value' },
          { label: 'Most cache lines in that range now hold several busy vertices at once, not just one', correct: true },
          { label: 'Degree sort removes the need for a value array entirely' },
          { label: 'Only the single highest-degree vertex benefits; the rest are unaffected' },
        ],
        explain: (
          <>
            A cache line is eight of these values, fetched together regardless of how many were asked for. Packing the busiest vertices into a
            tiny range of ids means fetching one of them for free brings several of the others along with it — not just the single busiest one.
          </>
        ),
      },
      Visual: S.DegreeSortPredictViz,
    },
    {
      title: 'Packing 2,000 hub vertices into contiguous ids cuts their own cache-line footprint from about 2,000 lines to 250 — an 8x drop, measured directly, not estimated.',
      body: <>Before: 1,995 distinct cache lines for 2,000 hubs, scattered. After degree-sort reordering: 250. Nothing about any hub's own value changed.</>,
      duration: 5,
      fig: 'MeasuredPayoff',
      takeaway: 'Packing 2,000 hub vertices into contiguous ids cuts their own cache-line footprint by 8x, measured directly.',
      Visual: S.MeasuredPayoff,
    },
    {
      title: 'Prove it',
      body: <>Measured, not assumed: examples.py builds CSR and CSC over the small graph and checks every slice against topic 36's own adjacency list, then measures the real cache-line drop on a 2,000,000-vertex synthetic graph.</>,
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
    {
      title: "Compressed sparse row answers how a graph's own edges are laid out in memory, and reordering answers how to lay that same memory out so the layout actually helps. The next chapter asks a different kind of structural question about graphs: not how fixed connections sit in memory, but how to track which vertices end up in the same component as a graph of edges is built up one at a time — the structure behind Kruskal's minimum spanning tree, connected components, and entity-resolution clustering. Union–find, next.",
      body: <>Three separate answers to one question: how a graph's own edges actually sit in memory, and what that layout costs.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
