import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the identical graph, the identical question — does an edge exist, from one
// vertex to another — asked against three representations with three different costs.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next.",
      body: <>Does an edge exist from this vertex to that one? Ask three different representations of the identical graph, and get three different costs for the identical answer.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "An adjacency list stores one short chain of neighbours per vertex. Reading off a vertex's own neighbours costs time proportional to its degree — but checking one specific edge means searching that chain.",
      body: <>Space proportional to V + E. Cheap to list a vertex's own neighbours; not free to test one specific pair.</>,
      duration: 4,
      fig: 'ListReveal',
      Visual: S.ListReveal,
    },
    {
      title: "An adjacency matrix stores one cell per ordered pair of vertices. Does the graph's own real multi-edge survive into the matrix the same way it survived into the list?",
      body: <>This graph has one real multi-edge. Think about what one grid cell can actually hold.</>,
      duration: 2,
      fig: 'MatrixPredict',
      predict: {
        options: [
          { label: 'Yes — the matrix stores both parallel edges, each with its own weight' },
          { label: 'It stores that there are two edges, but not each one’s own separate weight', correct: true },
          { label: 'No — the matrix can only represent one edge between any pair, full stop' },
          { label: 'It depends on whether the graph is directed' },
        ],
        explain: (
          <>
            A cell holds one scalar. A count of two survives; two distinct weights do not &mdash; the second edge's weight is the one left in the
            cell. That limit has nothing to do with direction: the same ordered pair shares one cell either way.
          </>
        ),
      },
      Visual: S.MatrixPredictViz,
    },
    {
      title: 'A cell holds one value. Two parallel edges can share that one cell as a count — but not as two different weights; one of them is always overwritten.',
      body: <>Space proportional to V². Testing one specific edge is now a single lookup; reading a vertex's own neighbours means scanning a whole row.</>,
      duration: 4,
      fig: 'MatrixReveal',
      takeaway: "A matrix cell holds one value, so two parallel edges share a count, not two separate weights.",
      Visual: S.MatrixReveal,
    },
    {
      title: 'An edge list is neither a list of neighbours nor a grid of pairs — it is simply every edge, once, as its own entry. Space proportional to E alone, with no cost at all for a vertex that has none.',
      body: <>The one representation with no per-vertex structure — which is exactly why it is the natural starting format, not the natural structure to query.</>,
      duration: 4,
      fig: 'EdgeListReveal',
      takeaway: 'An edge list costs space proportional to the edges alone, with nothing paid for a vertex that has none.',
      Visual: S.EdgeListReveal,
    },
    {
      title: "A directed graph with no directed cycle is a DAG — and a directed graph is a DAG exactly when its vertices admit a single consistent ordering that every edge agrees with.",
      body: <>Any of the three representations above can hold a DAG; being a DAG is a property of the edges, not a fourth way to store them.</>,
      duration: 3.5,
      fig: 'DAGReveal',
      Visual: S.DAGReveal,
    },
    {
      title: "Breadth-first and depth-first search want a vertex's own neighbours, cheaply and repeatedly — the adjacency list's own strength. An algorithm that keeps asking whether one specific pair is connected wants the matrix's O(1) lookup instead. The edge list is what you start with, before any of the other two exists.",
      body: <>Three different costs, three different jobs — no single representation is simply "the right one."</>,
      duration: 4.5,
      fig: 'WhichRepReveal',
      takeaway: 'No representation is free: pick the one whose cheap operation is the operation the algorithm actually repeats.',
      Visual: S.WhichRepReveal,
    },
    {
      title: 'Prove it',
      body: <>Measured, not assumed: this topic's own examples.py counts the real cells and entries each representation holds for the identical graph, and for a larger one scaled up from it.</>,
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
