# Outline — Union-find inside entity resolution

## Outcomes (from CHAPTER.md)

1. Cluster a list of scored record pairs into entities with union-find, and show a record's
   entity id changing as unions land.
2. Explain, with a measured threshold sweep, how one weak edge over-merges two clusters and why
   union-find cannot split them again.
3. Say what a distributed engine does instead of a shared parent array, and what that costs in
   rounds.

## Storyboard (11 steps)

1. **Hook.** A customer table holds the same person many times, spelled differently; a matcher
   scores candidate pairs. Predict: raise the threshold slightly — does the biggest cluster
   split into a few pieces, or many, and is the change smooth?
2. **The textbook recap.** Union-find: `find` follows parent pointers to a root (the entity
   id), path-compressed on the way; `union` joins two roots by size. Chapter 11's own structure,
   reused, not re-derived.
3. **The match graph.** Twenty-four records in three groups of eight, strong pairs inside each
   group, two deliberately weak pairs bridging group to group.
4. **Splink, read from source.** `cluster_pairwise_predictions_at_threshold`: "clusters the
   pairwise match predictions into groups of connected records using the connected components
   graph clustering algorithm" — one union per matching pair, one find per entity id.
5. **A representative changing.** Record zero's entity id, traced pair by pair as unions land
   in score-descending order: it stays its own root until the weak bridges finally pull it into
   the whole graph's one component.
6. **The threshold sweep, measured.** At or below the lower bridge's score, one cluster of
   twenty-four. Cross it: sixteen and eight. Cross the second bridge: eight, eight, eight. Two
   jumps, not a slope — the predict's answer.
7. **Why it can't un-merge.** Union-find's components are transitive and one-directional: once
   two groups are joined, lowering the threshold again never used, but there is no operation
   that splits a component back apart short of rebuilding from the edge list at the new
   threshold.
8. **Lineage, one example.** The same structure over a dependency graph instead of a match
   graph: which datasets and jobs share a connected component, a blast-radius question,
   measured once on the chapter's own small lineage graph.
9. **What a distributed engine does instead.** GraphFrames' `connectedComponents`, read from
   source: an iterative algorithm with a `checkpointInterval`, not a single pass over a shared
   parent array. Kiveris et al. 2014 is the cited reference for the rounds-versus-communication
   trade-off, named, not read.
10. **One pass versus many rounds, measured.** Union-find over the chapter's match graph: one
    pass over the edge list. A label-propagation loop on the identical graph, with no shared
    structure: ten rounds to converge to the same clustering.
11. **Recap / handoff.** Union-find groups records that arrived in no particular order. The
    next structures keep order itself, on disk, at database scale. Search trees inside storage
    engines, next.

## Concept ledger

- **Introduces:** `entity-resolution-clustering`, `match-graph-components`,
  `transitive-over-merge`, `lineage-component`.
- **Uses:** `disjoint-set-union`, `union-by-rank-or-size`, `path-compression`,
  `inverse-ackermann-bound`, `edge-list`, `adjacency-list`.
- **Declared, not used:** `connected-components`, `minhash-lsh` — named once (the usual
  blocking step, and the generic connected-components concept), not built; checked against
  `registry.ts` and kept declared since no live DSA topic yet introduces either as its own
  concept id. `breadth-first-search` *is* live (`dsa.breadth-first-search`), so per CHAPTER.md's
  own instruction it moves from the chapter plan's provisional declared list into `uses`.

## Changes from the chapter plan

- CHAPTER.md names GraphFrames' default `connectedComponents` algorithm as `'graphframes'`,
  described as iterative with periodic checkpoints. Research-time reading of the current API
  docs found the library has since added `'two_phase'` and `'randomized_contraction'` as
  distinct algorithm choices, with `'graphframes'` now a deprecated alias for `'two_phase'`.
  The topic states the current names and the deprecation, rather than the plan's older,
  single-algorithm description, since the source itself has moved on. SOURCES.md's entry for
  this source notes the change.
- The DOI landing page `https://doi.org/10.1145/2670979.2670997` for Kiveris et al. 2014
  returned HTTP 403 through this project's fetch tool; the citation is instead verified against
  Crossref's own metadata API (`https://api.crossref.org/works/10.1145/2670979.2670997`), which
  is fetchable and gives the exact title, author list and DOI, checked word for word.
- The match graph (24 records, two weak bridges) and its threshold sweep are this topic's own
  construction, not copied from any source; CHAPTER.md asks for a 20–30-record graph with "one
  chain" that over-merges, and the two-bridge design was chosen and then verified by simulation
  (see `examples.py`) to produce a genuine two-step cliff rather than assumed to.
