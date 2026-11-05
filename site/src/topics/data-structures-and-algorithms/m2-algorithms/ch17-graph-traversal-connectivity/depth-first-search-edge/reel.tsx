import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: discovery/finish times and the parenthesis property; the four-way edge
// classification (tree, back, forward, cross) purely from those timestamps; the two
// different cycle tests directed and undirected graphs need, and why; an iterative,
// explicit-stack DFS that survives the recursion-depth failure the recursive version
// hits on a long chain. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A breadth-first frontier answers one question well: the fewest edges to reach a vertex. It says nothing about which vertex to visit next when the graph has structure a single widening ring can't see. Depth-first search goes the other way entirely: as deep as possible before ever backing up.",
      body: <>One path, pushed as far as it goes, before trying anything else.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'An edge from a vertex to one of its own ancestors in the DFS tree — is that a tree edge, a back edge, a forward edge, or a cross edge?',
      body: <>The edge points from a vertex still on the current path back into that same path.</>,
      duration: 2.5,
      fig: 'PredictBackEdge',
      predict: {
        options: [
          { label: 'A back edge — and it also means a directed cycle', correct: true },
          { label: 'A tree edge, since every edge in a traversal is a tree edge' },
          { label: 'A forward edge, since it points to a vertex already seen' },
          { label: 'A cross edge, since it connects two different parts of the graph' },
        ],
        explain: (
          <>
            An edge to an ancestor is a back edge by definition, and a back edge always completes a cycle — the
            ancestor can already reach the current vertex by the tree path, and the back edge closes the loop.
          </>
        ),
      },
      Visual: S.PredictBackEdge,
    },
    {
      title: 'Every vertex gets a discovery time when first visited and a finish time when its subtree is fully explored. For any two vertices, their discovery/finish intervals are either entirely disjoint or one nests completely inside the other — never partially overlapping. A vertex is a proper descendant of another exactly when its interval nests inside it.',
      body: <>Two numbers per vertex, and the whole tree structure falls out of comparing them.</>,
      duration: 5,
      fig: 'DFSMechanism',
      takeaway: "Discovery and finish intervals nest or sit apart, never partly overlapping — the parenthesis property, not a coincidence.",
      Visual: S.DFSMechanism,
    },
    {
      title: 'Tree edges are part of the DFS tree itself. Back edges point to an ancestor, closing a cycle. Forward edges point to an already-finished descendant. Cross edges point to neither — a different subtree, or a different DFS tree entirely. All four are defined purely from discovery and finish times and tree membership, nothing else.',
      body: <>Four names, each one a fact about two timestamps and a tree, not a new mechanism.</>,
      duration: 4.5,
      fig: 'EdgeTypes',
      takeaway: "An undirected graph's DFS has only tree and back edges — forward and cross edges are impossible there.",
      Visual: S.EdgeTypes,
    },
    {
      title: "Can an undirected graph's DFS ever produce a forward edge or a cross edge, the way a directed graph's can?",
      body: <>Every edge gets traversed from both of its endpoints eventually — does that rule anything out?</>,
      duration: 2.5,
      fig: 'PredictUndirectedEdges',
      predict: {
        options: [
          { label: 'No — only tree and back edges are possible', correct: true },
          { label: 'Yes, forward edges are possible, cross edges are not' },
          { label: 'Yes, cross edges are possible, forward edges are not' },
          { label: 'Yes, both are possible, just rarer than in a directed graph' },
        ],
        explain: (
          <>
            A forward edge would need an already-finished descendant reachable by a non-tree edge — but that
            same edge was already available from the descendant's own side, forcing it to be a back edge instead.
            A cross edge would need two unrelated subtrees, which an undirected graph's shared edge list rules out.
          </>
        ),
      },
      Visual: S.PredictUndirectedEdges,
    },
    {
      title: 'A directed graph has a cycle exactly when its DFS finds a back edge — an edge to a vertex still grey, still on the current path. An undirected graph needs no colouring at all: a visited neighbour that is not the immediate parent is already a cycle, because an undirected DFS never has the cross edges that could confuse the test.',
      body: <>Grey means still being explored; a visited non-parent neighbour means a cycle, immediately.</>,
      duration: 4.5,
      fig: 'CycleDetection',
      takeaway: 'Directed cycle detection needs three colours; undirected detection needs only a parent check.',
      Visual: S.CycleDetection,
    },
    {
      title: "A recursive DFS on a long dependency chain — a few hundred thousand vertices deep — overflows the call stack before the algorithm's own logic is ever wrong. Converting to an explicit stack of (vertex, iterator) pairs, instead of the language's own call stack, gives the identical traversal order and finishes without crashing.",
      body: <>The same traversal, the same order — just not paid for on the language's own call stack.</>,
      duration: 4.5,
      fig: 'IterativeDFS',
      takeaway: "A traversal crashing on a deep chain is a call-stack limit, not an algorithm bug.",
      Visual: S.IterativeDFS,
    },
    {
      title: "A directed graph with no back edges — no cycle anywhere — has a DFS finish order that is itself a valid answer to a question BFS was never asked: in what order can every vertex be processed so that nothing is processed before the things it depends on. That order falls out of the traversal just built, almost for free.",
      body: <>No cycle, and a finish order that already respects every dependency.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'A DFS with no back edges hands back a dependency order for free — reversed finish order, nothing extra computed.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
