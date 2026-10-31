import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Union-find: a parent-pointer forest, union by rank bounding its height, path compression
// collapsing a chain, the O(alpha(n)) amortized bound, and three real uses of the same structure.
// Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Ten million matches, one chain',
      body: (
        <>
          Ten million "do these two records describe the same entity" pairs arrive, and after
          every pair the system must say whether the two records already belong to one cluster.
          Relabelling a whole cluster costs O(n) per merge; a graph search per query is no
          better. With every record pointing at its cluster's representative, an adversarial
          merge order can build one chain of n records, so every lookup walks the whole chain.
        </>
      ),
      duration: 4.2,
      fig: 'one chain, n records deep',
      Visual: S.Hook,
    },
    {
      title: 'Three operations, one forest',
      body: (
        <>
          MakeSet, Find, Union — three operations over a parent-pointer forest. Every element
          points to its parent; a root points to itself. Find walks parent pointers up to the
          root. Union points one root at the other. No pointer ever points down to a child.
        </>
      ),
      duration: 4.4,
      fig: 'the parent array and its forest',
      Visual: S.Forest,
    },
    {
      title: 'How deep does the chain get?',
      body: (
        <>
          You choose the merge order; the structure has no rule to stop you. On sixteen
          elements, merged one new singleton at a time under the worst order, how deep does the
          tree get — and what does one Find on the deepest element cost?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'O(log n), structures are usually balanced' },
          { label: 'Depth fifteen, cost Θ(n)', correct: true },
          { label: 'Depth four, the same either way' },
          { label: 'It depends on which element you ask for' },
        ],
        explain: (
          <>
            Depth fifteen, cost Θ(n): with no rule at all, Union always has the freedom to
            attach the new singleton under the current deepest chain's own root, so a caller who
            wants a chain gets one, every time. "Structures are usually balanced" assumes a rule
            that isn't there yet — the caller picks the order, not the structure.
          </>
        ),
      },
      fig: 'depth fifteen on sixteen elements',
      Visual: S.AdversarialChain,
    },
    {
      title: 'Union by rank bounds the height',
      body: (
        <>
          Union by rank: always attach the shorter tree under the taller one's root, raising the
          rank only on a tie. A tree of rank r needs at least 2^r elements — doubling every time
          its rank rises — so no rank on n elements can exceed log₂ n. The worst case for this
          rule, repeatedly merging equal-rank trees, hits that bound exactly.
        </>
      ),
      duration: 4.6,
      fig: 'log base two of sixteen, tight',
      takeaway: 'Union by rank bounds every tree’s height at log₂ n, by a doubling argument: a rank only rises when a tree at least doubles.',
      Visual: S.RankBound,
    },
    {
      title: 'Path compression collapses it',
      body: (
        <>
          Rank alone still means a real Find can walk log₂ n pointers. Path compression layers
          on top: the same Find that walks up to the root relinks every node it passed straight
          to that root, in the same pass. The chain from the earlier predict collapses in one
          beat — and every later Find through those same nodes now costs almost nothing.
        </>
      ),
      duration: 4.4,
      fig: 'depth fifteen collapses to one, in one Find',
      takeaway: 'Path compression is layered on top of rank, not a replacement for it: one Find can still cost Θ(log n), but it pays off every later Find through the same nodes.',
      Visual: S.Compression,
    },
    {
      title: 'What does typical cost look like?',
      body: (
        <>
          Averaged over a long run of operations with rank and compression both on, is the
          typical cost per operation closer to O(log n), exactly O(1), or does it depend on the
          input order?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Exactly O(1), always' },
          { label: 'Depends on the input order, like the naive rule' },
          { label: 'Bounded by a number under five, for any n that occurs in practice', correct: true },
          { label: 'O(log n), the same as rank alone' },
        ],
        explain: (
          <>
            Bounded by a number under five: once rank bounds the height, no input order gets
            around it, so "depends on the order" is no longer true. "Exactly O(1)" overstates
            it — a single call can still cost Θ(log n) — the bound is on the average over many
            calls, not on any one of them.
          </>
        ),
      },
      fig: 'naive: thousands of reads per op; rank and compression: a handful',
      Visual: S.TypicalCost,
    },
    {
      title: 'The O(α(n)) amortized bound',
      body: (
        <>
          With rank and compression together, Find runs in O(α(n)) amortized time — α the
          inverse Ackermann function, a number that climbs so slowly it is under five for any n
          that could ever occur in practice. The bound is amortized, not worst-case: one call can
          still cost Θ(log n). A matching lower bound says no pointer-based structure beats this
          by more than a constant factor, for any disjoint-set structure at all.
        </>
      ),
      duration: 4.8,
      fig: 'α(n) under five',
      takeaway: 'O(α(n)) describes the average over a long run of operations, never a promise about any single call: a lone Find can still cost Θ(log n).',
      Visual: S.AlphaBound,
    },
    {
      title: 'Same structure, three uses',
      body: (
        <>
          The same ten edges, sorted by weight: accept an edge only when its endpoints are still
          in different sets — Kruskal's cycle test. Read as "which component is this vertex in,"
          the same calls track connected components as edges arrive. Read as "these two records
          match," the same calls cluster entities — with one limit: there is no Split, so a wrong
          merge can never be undone.
        </>
      ),
      duration: 5.2,
      fig: 'five merge, five already-together, both orders',
      takeaway: 'Union–find is the cheapest common building block for three different questions — Kruskal’s cycle test, incremental components, entity-resolution clustering — never the whole algorithm by itself.',
      Visual: S.ThreeUses,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three operations. One invariant, rank, that bounds height by a doubling argument.
          One trick, compression, that pays forward. One number, α(n), that makes "amortized"
          concrete instead of abstract — and one limit this structure never removes: no Split.
        </>
      ),
      duration: 3.6,
      fig: 'three operations, one bound, one limit',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The entity-resolution pipeline from the opening discovers one merge was a mistake: two
          records it clustered together are not actually the same entity. Can union–find undo
          it?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes, call Split on the two records' },
          { label: 'Yes, but only if path compression was off' },
          { label: 'No — there is no Split; the fix is a new structure built from the corrected pairs', correct: true },
          { label: 'No, the whole dataset must be discarded' },
        ],
        explain: (
          <>
            No Split operation exists on this structure, by construction: a parent pointer only
            ever points toward a root, never away from one. The real fix is to rebuild union–find
            from scratch on the corrected set of pairs — exactly the structural limit named two
            steps ago, now showing up as a real consequence.
          </>
        ),
      },
      fig: 'no Split, by construction',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
