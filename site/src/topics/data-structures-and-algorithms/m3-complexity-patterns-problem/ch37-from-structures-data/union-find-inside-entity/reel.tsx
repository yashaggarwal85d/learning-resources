import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's fifth topic: the structure the last two topics' ready queues and dependency
// graphs left untouched — a graph that nobody builds on purpose, arriving one scored pair at a
// time, with the only question being which records ended up in the same group. Every number is
// computed in examples.py; every system claim is a word-for-word quote in SOURCES.md.

const reel: Reel = {
  steps: [
    {
      title: "A customer table holds the same person many times, spelled differently, and a matcher scores every candidate pair. One pair with a middling score joins two large clusters into a single person. Predict: raise the threshold slightly past that pair's score — does the biggest cluster split into a few pieces or many, and does the cluster count change smoothly as the threshold rises?",
      body: <>One weak pair merges two clusters into one. Raise the threshold slightly: what happens?</>,
      duration: 6.5,
      fig: 'OverMergeHook',
      predict: {
        options: [
          { label: 'The cluster count rises smoothly as the threshold increases' },
          { label: 'Nothing changes until the threshold crosses that one pair\'s score, then it jumps', correct: true },
          { label: 'The biggest cluster splits into many small pieces all at once, at any threshold' },
        ],
        explain: (
          <>
            A record pair either counts as a match or it doesn't; there is no partial union. The
            cluster count stays flat until the threshold crosses one bridging pair's exact score,
            then jumps — a step function, not a slope, and not one record at a time either.
          </>
        ),
      },
      Visual: S.OverMergeHook,
    },
    {
      title: "Union-find, the textbook structure underneath this topic: find follows parent pointers up to a root, the entity id, compressing the path as it goes; union joins two roots by size. Nothing here is new; Chapter 11 built and proved this structure already.",
      body: <>find and union, path compression and union by size. Chapter 11's structure, reused.</>,
      duration: 5.5,
      fig: 'UnionFindRecap',
      Visual: S.UnionFindRecap,
    },
    {
      title: "The chapter's own match graph: twenty-four records in three groups of eight. Inside each group, strong-scoring pairs hold it together. Between groups, exactly two deliberately weak pairs are the only bridges — the entire setup for everything that follows.",
      body: <>Three groups of eight records, strong pairs inside, two weak pairs bridging between.</>,
      duration: 6,
      fig: 'MatchGraph',
      Visual: S.MatchGraph,
    },
    {
      title: "Splink's own documentation, read at research time: cluster_pairwise_predictions_at_threshold clusters the pairwise match predictions into groups of connected records using the connected components graph clustering algorithm. One union per matching pair; one find per entity id. Nothing more is needed.",
      body: <>Splink's own words: clustering matched pairs is connected components, exactly.</>,
      duration: 6,
      fig: 'SplinkQuote',
      Visual: S.SplinkQuote,
    },
    {
      title: "Trace one record's entity id as every scored pair lands, strongest first: it stays its own root through nearly the whole stream, because its own group is strong enough to need no outside help. Only the last two pairs, the weak bridges, finally pull it into the whole graph's single component.",
      body: <>One record's entity id barely moves — until the weak bridges land last and pull it in.</>,
      duration: 6,
      fig: 'RepresentativeTrace',
      Visual: S.RepresentativeTrace,
    },
    {
      title: "The sweep, measured: at or below the lower bridge's score, one cluster of twenty-four. Cross it, and the graph splits into sixteen and eight. Cross the second bridge, and it splits again into eight, eight and eight. Two jumps across six tested thresholds, exactly where the predict question asked about.",
      body: <>Twenty-four, then sixteen and eight, then eight, eight and eight. Two jumps, not a slope.</>,
      duration: 6.5,
      fig: 'ThresholdSweep',
      takeaway: 'Raising a match threshold does not shrink a cluster gradually; it jumps exactly where one bridging pair crosses it.',
      Visual: S.ThresholdSweep,
    },
    {
      title: 'Lower the threshold back below where it was, and the two groups merge again — but there is no operation that un-merges them at the higher threshold once they have joined. Union-find has no split operation: once two roots are joined, the only way back is rebuilding the whole clustering from the edge list at the new threshold.',
      body: <>No split exists. Once joined, the only way apart is rebuilding from scratch.</>,
      duration: 5.5,
      fig: 'NoSplit',
      takeaway: 'Union-find merges but cannot split a component; undoing an over-merge means rebuilding the clustering, not reversing one step.',
      Visual: S.NoSplit,
    },
    {
      title: "The same structure, a different graph: vertices are datasets and jobs, edges are feeds-into dependencies. A connected component here is a blast radius — everything that could be touched by a change to any one member. The chapter's own small lineage graph splits into one component of six and one of three.",
      body: <>Same structure, different graph: a connected component is a blast radius here.</>,
      duration: 6,
      fig: 'LineageComponents',
      Visual: S.LineageComponents,
    },
    {
      title: "On one machine, union-find needs one shared parent array. GraphFrames' own connectedComponents, read from source, is not that: an iterative algorithm, its own default now called two_phase, with a checkpoint interval, because no single machine holds the whole structure to update in place. Predict: on the chapter's own small match graph, does a round-based alternative with no shared structure take fewer rounds than union-find's one pass, the same number, or many more?",
      body: <>No shared parent array across machines. What does a round-based alternative cost?</>,
      duration: 6.5,
      fig: 'DistributedAlternative',
      predict: {
        options: [
          { label: 'Fewer rounds than union-find\'s one pass, since each round touches every edge at once' },
          { label: 'About the same number of rounds as union-find needs passes' },
          { label: "Many more rounds than union-find's one pass", correct: true },
        ],
        explain: (
          <>
            Measured directly on the chapter's own graph: label propagation, repeatedly adopting
            the smallest label among a node and its neighbors, takes ten rounds to converge to the
            exact clustering union-find found in a single pass over the edge list. Kiveris et al.
            2014 is the cited reference for this rounds-versus-communication trade-off at scale.
          </>
        ),
      },
      Visual: S.DistributedAlternative,
    },
    {
      title: 'Ten rounds against one pass, on the identical twenty-four-record graph, converging to the identical clustering either way. The cost is not correctness; both methods land on the same two clusters. The cost is communication: ten rounds of every node talking to its neighbors, against one machine walking an edge list once.',
      body: <>Ten rounds, one pass, same answer. The difference is all in communication cost.</>,
      duration: 6,
      fig: 'RoundsVersusPass',
      takeaway: 'A single machine with one shared parent array needs one pass; a distributed engine pays in rounds instead.',
      Visual: S.RoundsVersusPass,
    },
    {
      title: "Union-find groups records that were never in any particular order. The next structures are about keeping order itself, on disk, at the scale of a database: the index layer of a storage engine, where the search trees of the early chapters are the same B+-tree and LSM tree, with their keys, pages and filters changed to suit what a database must remember. Search trees inside storage engines, next.",
      body: <>Next: keeping order itself, on disk, inside a database's own index layer.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
