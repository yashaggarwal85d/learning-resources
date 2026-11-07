import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Bipartite matching and Hopcroft-Karp. A full topic: matching as a unit-capacity flow, the
// greedy scan against the true maximum, the alternating-path zig-zag reroute, Berge's lemma,
// one-augmentation-at-a-time against Hopcroft-Karp's own phases, and Konig's theorem certifying
// a matching with a vertex cover, including the Hall-obstruction graph. Every count is exact
// and asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Four tasks, four machines, each task allowed on only some of them. A scan that assigns tasks in the order they arrive leaves one task with no machine at all, even though every task could in fact be placed. Which single change to the existing assignment lets that last task in, and how is it found without trying every possible arrangement?",
      body: <>A greedy scan strands one task. One change fixes it. How is that change found?</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Orient every task-machine edge from the tasks toward the machines, add a source feeding every task and a sink drained by every machine, and give every edge a capacity of one. A matching is now exactly a flow of that same value, and last topic's own integrality turns any whole-number maximum flow straight into a maximum matching.",
      body: <>Tasks and machines become a unit-capacity network. A matching is a flow of equal value.</>,
      duration: 5,
      fig: 'MatchingAsFlow',
      Visual: S.MatchingAsFlow,
    },
    {
      title: "Scanning the tasks in order and taking each one's first free machine matches three of the four tasks, leaving one machine idle. That assignment cannot be extended by adding a single new pair; it is already as large as a one-step-at-a-time scan can make it, yet a matching of all four tasks still exists.",
      body: <>A greedy scan matches three of four. No single new pair can extend it, yet four is possible.</>,
      duration: 4.5,
      fig: 'GreedyMatching',
      Visual: S.GreedyMatching,
    },
    {
      title: "Before naming the mechanism: does reaching the true maximum from here need one small adjustment to the existing three pairs, or does it need starting over from an empty matching entirely?",
      body: <>Does reaching the maximum need a small adjustment, or a fresh start from nothing?</>,
      duration: 3,
      fig: 'PredictReroute',
      predict: {
        options: [
          { label: 'Starting over from an empty matching is required' },
          { label: 'One chain of small adjustments to the existing pairs is enough', correct: true },
          { label: 'The greedy matching is already the true maximum' },
          { label: 'No fix exists without adding a fifth machine' },
        ],
        explain: (
          <>
            The free task's own augmenting path in the unit network reads back as a chain of
            existing pairs, each handing its machine to the task before it. Flipping that one
            chain reaches the maximum without ever touching an empty matching.
          </>
        ),
      },
      Visual: S.PredictReroute,
    },
    {
      title: "The free task's augmenting path reads back in the original graph as a chain: the free task takes a machine already given to another task, which takes over a second machine already given to a third task, and so on until a genuinely idle machine is reached. Flipping every edge on that chain reaches a matching of all four tasks in one move.",
      body: <>One chain: a free task takes over a machine, whose task takes another, down to idle.</>,
      duration: 5,
      fig: 'ZigZagReroute',
      Visual: S.ZigZagReroute,
    },
    {
      title: "A matching is maximum exactly when no such chain, from a free vertex on one side to a free vertex on the other, exists anywhere in the graph. The direction that matters for the algorithm, no chain left implies the matching is already maximum, follows in one line from the flow theorem already proved rather than needing its own separate proof.",
      body: <>A matching is maximum exactly when no free-to-free chain exists anywhere at all.</>,
      duration: 4.5,
      fig: 'BergeLemma',
      takeaway: "No free-to-free chain anywhere means maximum, a one-line consequence of the flow theorem already proved.",
      Visual: S.BergeLemma,
    },
    {
      title: "Trying to extend the matching from each free task in turn, one search at a time, costs as much as the edge count per search, and there are never more searches than there are tasks. That gives a running time scaling with the task count times the edge count: the baseline every faster method has to beat.",
      body: <>One search per free task, each costing the edge count. Tasks times edges, total.</>,
      duration: 4,
      fig: 'OneAtATime',
      Visual: S.OneAtATime,
    },
    {
      title: "A single phase instead starts a search from every free task at once, building outward one layer at a time until some layer reaches a free machine. A second search then pulls out as many chains of that identical, shortest length as can be found without two chains ever sharing a single vertex, and flips every one of them together.",
      body: <>One phase: search outward from every free task at once, flip many disjoint shortest chains together.</>,
      duration: 5,
      fig: 'HopcroftKarpPhase',
      Visual: S.HopcroftKarpPhase,
    },
    {
      title: "Before naming the bound: should the number of phases this needs scale with how many tasks there are, how many edges there are, or something smaller than either count alone?",
      body: <>Does the phase count scale with the task count, the edge count, or something smaller?</>,
      duration: 3,
      fig: 'PredictPhaseCount',
      predict: {
        options: [
          { label: 'It scales with the edge count, the same as one search' },
          { label: 'It scales with the task count directly' },
          { label: 'It scales with something far smaller than either count alone', correct: true },
          { label: 'It is always a fixed constant, regardless of the graph' },
        ],
        explain: (
          <>
            Each phase's own shortest chain is strictly longer than the one before it, and a
            chain cannot grow past the vertex count. That forces the whole count of phases down
            to the order of the square root of the vertex count, far below either count alone.
          </>
        ),
      },
      Visual: S.PredictPhaseCount,
    },
    {
      title: "On a graph of one thousand tasks and one thousand machines, each phase's own strictly-growing shortest chain forces every further phase smaller than the last. A handful of phases reaches the identical matching that the one-search-at-a-time baseline needed hundreds of separate searches to reach.",
      body: <>On a thousand-plus-thousand graph, a handful of phases replaces hundreds of searches.</>,
      duration: 4.5,
      fig: 'MeasuredGap',
      takeaway: "A handful of phases reaches the same matching hundreds of one-at-a-time searches needed.",
      Visual: S.MeasuredGap,
    },
    {
      title: "In a two-sided graph, the largest possible matching's own size always equals the smallest possible set of vertices touching every single edge. That cover is built directly from the very last search already run, no further search needed: it is every task that search could not reach, together with every machine that search could reach.",
      body: <>Largest matching equals smallest covering set, read straight off the last search.</>,
      duration: 4.5,
      fig: 'KonigTheorem',
      takeaway: "Largest matching size equals smallest covering set size, read off the search with no extra work.",
      Visual: S.KonigTheorem,
    },
    {
      title: "Two tasks that can each only reach one single shared machine give a matching of two and a cover of exactly that one shared machine together with one further task: a cover that points straight at the competing pair, unlike the earlier graph's own cover of every task, which said nothing at all.",
      body: <>Two tasks sharing one machine: a matching of two, a cover pointing straight at the clash.</>,
      duration: 4,
      fig: 'HallObstruction',
      Visual: S.HallObstruction,
    },
    {
      title: "Hopcroft and Karp beat the general method by noticing what a unit-capacity network allows: many augmenting paths of the same length can be found and flipped together, and a count of phases replaces a count of paths. That habit, looking at the structure of a problem and taking a different route from the general one, is what the next chapter is about. It steps back from graphs to the two paradigms behind most algorithms in this course. One splits a problem, solves the pieces and combines them, and reads its cost off a recurrence. The other makes the locally best choice and proves it safe, the way a cut did for spanning trees and failed to for flows. Divide-and-conquer design, next.",
      body: <>Many equal-length chains flip together; a phase count replaces a chain count. Next: divide-and-conquer.</>,
      duration: 5,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
