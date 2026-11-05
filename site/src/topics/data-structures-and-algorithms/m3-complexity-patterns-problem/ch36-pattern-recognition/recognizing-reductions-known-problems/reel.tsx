import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the chapter's fourth and last reading skill, and the one that needs the other
// three. Six recurring shapes (flow, matching, two-SAT, interval scheduling, DP on a DAG, and the
// shortest path already met in the previous topic), each taught by its structural fact and its
// near-miss, plus a one-page catalogue of seven patterns and a five-step recognition procedure.
// Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Assign reviewers to papers: each paper needs two reviews, each reviewer is willing to review only some papers and is capped at two. It reads like a scheduling puzzle. It is a flow problem, and a flow algorithm solves it in a fraction of a second.',
      body: <>A scheduling-sounding story that is really a flow problem.</>,
      duration: 5,
      fig: 'ReviewerHook',
      Visual: S.ReviewerHook,
    },
    {
      title: 'Predict: of three variants of a pairing story, only one is NP-complete. Pairing items across two groups, pairing items within one group, or choosing true or false for variables where every rule constrains three of them at once?',
      body: <>Which of the three pairing variants is NP-complete?</>,
      duration: 4.5,
      fig: 'PredictPairingVariant',
      predict: {
        options: [
          { label: 'Pairing items across two groups' },
          { label: 'Pairing items within one group' },
          { label: 'Choosing true or false, three variables per rule', correct: true },
        ],
        explain: (
          <>
            Only the third. Pairing across two groups is a bipartite matching, solved by a flow
            algorithm. Pairing within one group is a general matching, still polynomial but needing
            a different algorithm. Constraining three variables at a time is three-SAT, NP-complete —
            the identical shape as two-SAT with one extra choice per clause.
          </>
        ),
      },
      Visual: S.PredictPairingVariant,
    },
    {
      title: 'Flow and cut: something moves from sources to sinks through capacity-limited links. The reviewer assignment, built as a flow network, places all eight reviews — confirmed by the flow algorithm and by an independent brute-force search over every valid assignment. The near-miss: a flow that must be routed as whole, indivisible units along single paths is a much harder problem.',
      body: <>Eight reviews placed, confirmed two independent ways.</>,
      duration: 5.5,
      fig: 'FlowCutShape',
      takeaway: 'Flow and cut: capacities, a source and a sink; the near-miss is routing in whole, indivisible units.',
      Visual: S.FlowCutShape,
    },
    {
      title: "Matching: pair items from two groups, each used at most once. The structural fact is that the graph is bipartite — every edge crosses from one side to the other. Two different algorithms, the Kuhn augmenting-path method and the flow-based one, agree on three pairs for the identical instance. The near-miss: pairing within a single group, with an odd cycle, is not bipartite at all, confirmed directly by checking for one.",
      body: <>Two algorithms agree; an odd cycle breaks the bipartite test outright.</>,
      duration: 5.5,
      fig: 'MatchingShape',
      Visual: S.MatchingShape,
    },
    {
      title: 'Two-SAT: a set of yes-or-no choices with constraints that each involve at most two of them. Built as an implication graph and solved by strongly connected components — satisfiable exactly when no variable and its negation land in the same component, confirmed against brute-force truth tables on both a satisfiable and an unsatisfiable instance. The near-miss is the sharpest in the chapter: the identical shape with three choices per constraint is three-SAT, NP-complete.',
      body: <>Solved by strongly connected components; one extra choice per clause breaks it.</>,
      duration: 5.5,
      fig: 'TwoSatShape',
      takeaway: 'Two-SAT is solved by strongly connected components in linear time; three choices per clause instead of two is NP-complete.',
      Visual: S.TwoSatShape,
    },
    {
      title: 'Interval scheduling: activities with start and end times competing for one resource. Sorting by finish time and greedily taking what still fits finds four non-overlapping intervals, matching an exhaustive brute-force search exactly. The near-miss: the identical story with several resource types, or with setup time between jobs, is general scheduling and typically NP-hard.',
      body: <>One resource, a greedy; several resources is a different, harder family.</>,
      duration: 5,
      fig: 'IntervalSchedulingShape',
      Visual: S.IntervalSchedulingShape,
    },
    {
      title: 'DP on a DAG: a decision sequence where each step depends only on earlier ones and nothing repeats. Relaxing a small dependency graph in topological order finds the longest path exactly, matching a full enumeration of every path through it. The near-miss: the identical relaxation breaks the moment the dependency graph has a cycle, and a longest path in a graph with cycles is the Hamiltonian-cycle family of problems, NP-hard.',
      body: <>Topological order finds the longest path; a cycle breaks the method entirely.</>,
      duration: 5.5,
      fig: 'DagDpShape',
      takeaway: 'DP on a DAG relaxes in topological order; adding one cycle makes the problem NP-hard, not just harder.',
      Visual: S.DagDpShape,
    },
    {
      title: 'A one-page catalogue of recurring patterns, each a technique the course already built, recognised by one question: a sequence that may cycle, the K best of a stream, several sorted sources to merge, a grid to walk, a monotone predicate over the answer, the next larger value. None of these six shapes needed a new mechanism — the catalogue is only the index from the question to where the technique lives.',
      body: <>A one-page index from the question asked to the technique that answers it.</>,
      duration: 5.5,
      fig: 'PatternCatalogue',
      Visual: S.PatternCatalogue,
    },
    {
      title: 'Predict: a scheduling story adds setup time between jobs run on one machine. Is it still the plain interval scheduling just shown?',
      body: <>Does setup time between jobs keep this plain interval scheduling?</>,
      duration: 4,
      fig: 'PredictSchedulingSetup',
      predict: {
        options: [
          { label: 'Yes, the same earliest-finish greedy still applies' },
          { label: 'No, setup time breaks the one-resource structural fact', correct: true },
        ],
        explain: (
          <>
            No. Interval scheduling's structural fact is that the objects are plain intervals on
            one resource, with no cost for switching between them. Setup time couples adjacent jobs
            together, which is a different, typically NP-hard scheduling family — the same family
            as bin packing and makespan scheduling.
          </>
        ),
      },
      Visual: S.PredictSchedulingSetup,
    },
    {
      title: 'The recognition procedure, done in under five minutes: read the size and the limit for a budget; name the operations and pick a structure; name the state, the move and the question to see if it is a graph; match the question against a shape and its near-miss; write the one sentence that would prove the match wrong.',
      body: <>Five steps, ending in the one sentence that could prove the match wrong.</>,
      duration: 5.5,
      fig: 'RecognitionProcedure',
      takeaway: 'A recognition is a claim with a falsifier: the one condition that, if false, kills the match.',
      Visual: S.RecognitionProcedure,
    },
    {
      title: 'The practice that makes this a habit: thirty unseen problems, five minutes each, writing down only the recognised pattern, the target complexity and the key invariant — then solving and scoring recognition accuracy, logging every miss by the trigger that was missed, not by the solution.',
      body: <>Thirty unseen problems, scored on recognition, not on the solve.</>,
      duration: 5,
      fig: 'LabProtocol',
      Visual: S.LabProtocol,
    },
    {
      title: 'That is the whole skill, and it is a habit more than a body of knowledge: read the size, read the operations, read the situation as a graph, match it to a shape, and check what would break the match. The same objects do their work somewhere with more at stake: inside a database engine or a data pipeline. Hash tables inside hash joins, next.',
      body: <>Next: the same structures, doing their work inside real data systems.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
