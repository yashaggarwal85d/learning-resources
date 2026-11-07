import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Floyd-Warshall's dynamic program over intermediate vertices, confirmed
// against Bellman-Ford run from every vertex; path reconstruction via a predecessor matrix;
// the identical sweep computing transitive closure with booleans; Johnson's algorithm
// (reweighting plus Dijkstra from every vertex), confirmed to match Floyd-Warshall exactly.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A network of a few hundred cities where every pair's fastest route is wanted at once, not one pair at a time — answered either by one dynamic program over every possible waypoint, or by running the single-source algorithm already built from every city, once a one-time trick removes every negative road.",
      body: <>The all-pairs question, two different ways to arrive at the identical answer.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'For a graph with many vertices but comparatively few edges, does running the single-source algorithm from every vertex do less total work than the fixed dynamic program whose own cost never depends on how many edges the graph has — or more?',
      body: <>One approach's cost is set by the vertex count alone; the other's scales with how many edges actually exist.</>,
      duration: 3,
      fig: 'PredictSparse',
      predict: {
        options: [
          { label: "Less — the edge-count-driven approach rewards a sparse graph", correct: true },
          { label: "More — running the single-source algorithm many times always costs more" },
          { label: "Exactly the same, since both eventually visit every vertex and edge" },
          { label: "It depends only on the vertex count, not the edge count" },
        ],
        explain: (
          <>
            The dynamic program's own cost is fixed by the vertex count alone, no matter how many edges the graph
            actually has — it does the identical amount of work on a dense graph and a sparse one. Running the
            single-source algorithm from every vertex instead costs an amount tied to the edge count, so on a
            graph with relatively few edges, that total comes out strictly lower.
          </>
        ),
      },
      Visual: S.PredictSparse,
    },
    {
      title: 'The dynamic program fills an entire distance matrix one allowed waypoint at a time — for every pair of vertices, it checks whether routing through the current waypoint beats the best route found using only the waypoints already considered.',
      body: <>Every pair, every waypoint, one update rule repeated until the matrix is full.</>,
      duration: 4,
      fig: 'DPMechanism',
      takeaway: "Allowing one more waypoint at a time is the entire mechanism — nothing else changes between rounds.",
      Visual: S.DPMechanism,
    },
    {
      title: 'Alongside every shortest distance, a second matrix records the vertex visited just before the destination on that shortest route — enough, followed backward one step at a time, to recover the actual path, not merely how long it is.',
      body: <>A single number says how far; a chain of predecessors says exactly which way.</>,
      duration: 3.5,
      fig: 'PathReconstruction',
      takeaway: "A distance alone never says which route achieves it — the predecessor matrix is what actually does.",
      Visual: S.PathReconstruction,
    },
    {
      title: 'Replace every distance with a plain yes-or-no reachability flag, replace adding weights with requiring both legs to already be reachable, and replace keeping the smaller distance with allowing either leg to supply that reachability — the identical waypoint-by-waypoint sweep now answers which vertex can reach which.',
      body: <>The same recurrence, the same loops, a different kind of value flowing through them.</>,
      duration: 4,
      fig: 'TransitiveClosure',
      Visual: S.TransitiveClosure,
    },
    {
      title: 'Reweighting every edge by the difference between the shortest distances of its two endpoints from an added source vertex removes every negative weight from the graph entirely. Does that reweighting ever change which route between two vertices is the cheapest one?',
      body: <>A constant added to every route between the same two endpoints cannot change which one is shortest.</>,
      duration: 3.5,
      fig: 'JohnsonsMechanism',
      predict: {
        options: [
          { label: "No — every route between the same two vertices shifts by the identical amount", correct: true },
          { label: "Yes — reweighting can flip which route is cheapest" },
          { label: "Only when the graph has a negative edge somewhere" },
          { label: "Only when the two vertices are directly connected" },
        ],
        explain: (
          <>
            Every route between a fixed pair of vertices passes through the same number of edges from the source
            vertex's own potential values, so reweighting shifts every one of that pair's routes by the identical
            constant. Shifting every option in a comparison by the same amount can never change which option was
            smallest to begin with — which is exactly why Dijkstra's answer on the reweighted graph, adjusted back
            by that same constant, matches the original weights' own shortest distance exactly.
          </>
        ),
      },
      Visual: S.JohnsonsMechanism,
    },
    {
      title: 'Every algorithm so far has answered a question between two vertices, or from one vertex to every other. A directed graph with no cycle at all makes the question easier than any of them needed to be.',
      body: <>Neither of this topic's two algorithms needed a new primitive — only a new way of combining relaxation and ordering.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: "The all-pairs question needed no new primitive — only a new way to combine the single-source algorithms already built.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
