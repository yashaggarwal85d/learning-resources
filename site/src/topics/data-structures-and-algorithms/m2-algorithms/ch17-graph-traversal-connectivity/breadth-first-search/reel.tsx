import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: BFS's own shortest-path guarantee, proved from the frontier's own FIFO
// order; multi-source BFS and 0-1 BFS as direct extensions of the same frontier idea;
// bipartiteness by 2-colouring with a constructed odd-cycle witness; direction-optimizing
// BFS as the production fix for BFS's worst case on low-diameter, high-degree graphs.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A graph with a billion edges can still answer 'how many people separate you from this stranger' in a handful of steps, because the people worth checking next are never more than one step past the people already checked — a widening ring, never a wrong turn.",
      body: <>The frontier never backtracks, and it never skips ahead.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Starting breadth-first search from one vertex, is the first time a vertex is reached always its shortest distance from the source, or can a vertex be reached again later by a shorter path?',
      body: <>Every vertex one step further is enqueued only after every vertex the current step away.</>,
      duration: 2.5,
      fig: 'PredictShortestPath',
      predict: {
        options: [
          { label: 'Always shortest, the first time — a shorter path could never arrive later', correct: true },
          { label: "It can be reached again later by a shorter path" },
          { label: 'Only if the graph has no cycles' },
          { label: 'Only if every edge has the same weight — which is true here, so it depends' },
        ],
        explain: (
          <>
            A vertex at distance d is enqueued only once every vertex at distance d − 1 has already been dequeued,
            so nothing arrives at it from a longer path before the shortest one does. The frontier's own order is the proof.
          </>
        ),
      },
      Visual: S.PredictShortestPath,
    },
    {
      title: "A FIFO queue holds the current frontier: dequeue a vertex, enqueue every neighbour not yet seen. Every vertex at distance d is dequeued before any vertex at distance d+1 is ever enqueued, so the first time a vertex is reached, its distance is already final — the proof the chapter's opening question asked for.",
      body: <>Dequeue, enqueue its neighbours, repeat — never revisiting, never out of order.</>,
      duration: 4.5,
      fig: 'BFSMechanism',
      takeaway: "A FIFO frontier guarantees the shortest unweighted path the first time a vertex is reached — not usually, always.",
      Visual: S.BFSMechanism,
    },
    {
      title: "Seed the queue with several sources at once instead of one, and the result is, for every vertex, the distance to the nearest of them — one pass, not one pass per source. A grid with three spreading fires answers 'when does the fire reach this cell' in a single multi-source sweep.",
      body: <>Three seeds, one widening frontier, the minimum distance to any of them.</>,
      duration: 4,
      fig: 'MultiSource',
      takeaway: 'Multi-source BFS in one pass costs what one single-source pass costs — k separate passes cost k times as much.',
      Visual: S.MultiSource,
    },
    {
      title: "Edges weighted only 0 or 1 need no priority queue at all: push a 0-weight edge's endpoint to the front of a deque, a 1-weight edge's endpoint to the back. The deque's own order stays non-decreasing in distance, and the answer matches Dijkstra's algorithm on the identical graph.",
      body: <>A free move goes to the front of the line; a costly one waits its turn.</>,
      duration: 4,
      fig: 'ZeroOneBFS',
      Visual: S.ZeroOneBFS,
    },
    {
      title: 'Two-colour a five-cycle, alternating colour outward from one vertex — can it finish without ever giving two neighbours the same colour?',
      body: <>An odd number of vertices around the cycle, two colours to alternate between.</>,
      duration: 2.5,
      fig: 'PredictBipartite',
      predict: {
        options: [
          { label: 'No — an odd cycle always forces a clash', correct: true },
          { label: 'Yes, any cycle can be 2-coloured cleanly' },
          { label: 'Only if the cycle is directed' },
          { label: "It depends on which vertex the colouring starts from" },
        ],
        explain: (
          <>
            Walking around a cycle of odd length and alternating colour brings the last edge back to the same colour
            it started from — exactly the contradiction that makes an odd cycle the signature of a non-bipartite graph.
          </>
        ),
      },
      Visual: S.PredictBipartite,
    },
    {
      title: 'BFS 2-colours a graph by alternating colour at each frontier step; it is bipartite exactly when this never assigns the same colour to both endpoints of an edge. The first edge where it does, together with the BFS-tree paths back to their common ancestor, is itself an odd cycle — a witness, not just a verdict.',
      body: <>The clashing edge plus the two paths back to their shared ancestor form the odd cycle.</>,
      duration: 4.5,
      fig: 'Bipartiteness',
      takeaway: 'A bipartiteness test that fails hands back the odd cycle that caused it, not just a yes-or-no verdict.',
      Visual: S.Bipartiteness,
    },
    {
      title: "On a low-diameter, high-degree graph — a social network, not a road network — the frontier can become most of the graph in a single step, and scanning its own many outgoing edges gets expensive fast. Direction-optimizing BFS switches: once the frontier is large, unvisited vertices scan for a frontier neighbour instead, examining far fewer edges for the same step.",
      body: <>The frontier scanning outward, or the rest of the graph scanning inward — whichever examines fewer edges.</>,
      duration: 4.5,
      fig: 'DirectionOptimizing',
      takeaway: "Beamer, Asanović and Patterson's hybrid BFS reduces edges examined by switching direction, not by changing what BFS computes.",
      Visual: S.DirectionOptimizing,
    },
    {
      title: "A breadth-first frontier answers one question well: the fewest edges to reach a vertex. It says nothing about which vertex to visit next when the graph has structure a single widening ring can't see — a dependency that must come before another, a group of vertices that can all reach each other and nothing outside the group. Those answers come from visiting as deep as possible before backtracking, not level by level.",
      body: <>A widening ring answers reachability by distance. The next tool goes deep instead of wide.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'Breadth-first search answers distance; the chapter\'s remaining structural questions need a different traversal order entirely.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
