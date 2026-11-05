# Outline: Choosing the structure for the operation mix (`dsa.choosing-structure-operation-mix`)

Full topic, chapter 36 §36.1, ~14 minutes.

## Storyboard (10 steps)

1. **Hook.** Ten million keys, one table, three mixes. At ninety-five lookups in a hundred a hash table wins by a wide margin; shift the mix toward range scans and it loses to a tree it just beat.
2. **lookup → hash, and its breaking condition.** A hash table answers equality lookup in O(1) and nothing about order; a "next larger key" or range query has no order to consult, so it must scan everything. (Predict step — within the first 4: the range-share crossover.)
3. **ordered/range → a balanced tree.** A tree keeps O(log n) lookup, predecessor, successor and range, at the cost of more work per insert; measured directly, even a vanishingly small share of range queries is enough to flip the winner from hash to tree, because the hash's range query costs a full scan.
4. **top-k → heap or quickselect, and the measured crossover.** A size-k heap beats sorting everything for small k; past some share of n, sorting the whole array wins instead, because the heap's own bookkeeping grows with k.
5. **membership at scale → a Bloom filter.** Priced against an exact set at the same key count: a wrong "yes" is cheap, a wrong "no" is impossible, and the space saving is large — using Chapter 12's own bits-per-key arithmetic, not re-deriving it.
6. **grouping → union-find, and its breaking condition.** Incremental equivalence in near-constant amortised time; it cannot split a group once merged, and "grouping" as group-by aggregation is a different problem entirely, answered by a hash table.
7. **prefixes → a trie, and its breaking condition.** Prefix queries and ordered iteration over strings, bounded by key length; a substring query (not a prefix one) is a different problem the trie's own search cannot answer.
8. **range aggregates → Fenwick or segment tree, and the breaking condition that separates them.** A Fenwick tree needs an invertible operation (sum); a segment tree needs only an associative one (so it handles max, which a Fenwick-style prefix trick gets provably wrong). (Predict step — the breaking condition itself: does the Fenwick trick work for maximum?)
9. **The thesis: a weighted sum, and the winner changes with the mix.** Three mixes over the same data, the same three structures, three different winners — and the explicit warning about what the model leaves out (constant factors, memory footprint, concurrency, persistence, build-once-versus-query-many), plus the "two structures kept in sync" answer when the mix needs two things (Redis's sorted sets, a hash table and a skip list over the same data).
10. **Recap and handoff.** A structure is chosen by the mix, not by the biggest single operation; what to do when the input isn't data at all, but a situation.

## Outcomes

- Given a workload described as operation frequencies, estimate each candidate structure's total cost and pick one, saying what would change the choice.
- For each of the seven rows of the dispatch table, state the one operation the structure cannot do.
- Recognise when no single structure fits and the answer is two structures, or a different problem.

## Concept ledger

- **Introduces:** `operation-mix`, `structure-dispatch-table`, `breaking-condition`, `mix-weighted-cost`, `two-structures-in-sync`.
- **Uses:** `constraint-budget`, `operation-count-budget` (topic 113); the structures themselves are named by their owning chapter (3, 4, 5, 6, 7, 8, 11, 12) rather than by concept id, since several of those chapters' own concept ids are not yet confirmed live at build time; the registry's `uses` array lists only the ids this topic's build could confirm.
- **Declared:** none new beyond its own.

## Bridge / handoff

Bridge (word for word, topic 113's handoff): "The budget tells you how much work you may do, and it narrows the field: n squared is out, n log n is in. It says nothing about how to organise the data so that the work is that cheap. That depends on what you will do with the data, and how often: look one thing up, ask for a range, take the smallest, test membership, group. Each of those has a structure that is best at it, and the same data can need a different structure under a different mix of operations. Choosing the structure for the operation mix, next."

Handoff: "A structure holds the data and answers questions about it. Some problems do not hand you data at all. They hand you a situation: a position, a set of legal moves, a goal. A word that can change into another by one letter, a puzzle board that can be turned into another by one slide, a lock whose wheels turn one notch at a time. There is no table to put in a structure, because the thing you are searching over is the set of situations, and it is usually too large to write down. Modelling problems as graphs, next."

## Changes from the chapter plan

- **The three-mix "winner changes" table uses an explicit analytic cost model (operation counts via O(1), O(log n), O(n) formulas at a fixed n and k), not wall-clock timing**, for the final weighted-sum comparison across hash, tree and heap. This is deliberate: Python's built-in list has an unusually fast C-level memmove for shifting elements on insert, which makes a plain Python list *not* a faithful stand-in for a real balanced tree's O(log n) insert cost at any n small enough to benchmark quickly, and wall-clock measurement of that one operation gave misleading, run-to-run-inconsistent results in early drafts. The chapter's own framing of the cost model ("total cost ≈ Σ over operations of (frequency × per-operation cost)") supports a model computed from stated growth rates, not only a literal timed benchmark; this topic is explicit on screen that the table is a model, in the same spirit as topic 113's own budget arithmetic. The hash-versus-tree range-share crossover (step 3) and the heap-versus-sort top-k crossover (step 4) are both still real, measured wall-clock experiments, since those operations' real Python costs behave as expected (a hash table's O(n) range fallback and a size-k heap's O(n log k) selection are both realistically slow in this interpreter).
- **The third mix is redefined as a streaming leaderboard (fifty percent inserts, fifty percent "what are the current top ten" queries) rather than the plan's placeholder "ten percent top-k."** This keeps the heap's actual advantage (cheap incremental maintenance of a small top-k window) isolated from lookup and range operations it has no good answer for, which is necessary for it to win any mix cleanly against both a hash table and a tree; a mix that mixes in lookups or ranges alongside a small top-k share did not produce a heap win in any instance tried, since those other operations dominate the weighted sum long before top-k's own frequency does.
- **The hook's own predicted crossover values (five, thirty or seventy percent) are replaced by the topic's own measured finding: well under one percent.** The planning placeholder guessed a crossover somewhere in a "reasonable-sounding" range; the actual measurement (this topic's own `examples.py`) shows the crossover is far smaller than any of those three guesses, because a hash table's range-query fallback costs a full scan of every key, not a partial one — a result worth keeping precisely because it contradicts the intuitive guess.
- Chapter 11's and Chapter 12's own concept ids (`disjoint-set-union`, `path-compression`, `bloom-filter`, `bloom-false-positive-rate`, and so on) are named in prose by their owning chapter and topic rather than listed in this topic's `uses` array, since this topic's own build could not confirm every one of those ids is live in the registry at build time; the registry's `uses` array for this topic lists only what could be confirmed.
- Mehlhorn and Sanders, *Algorithms and Data Structures: The Basic Toolbox*, named by the chapter plan as a reference, was not opened; cited for framing only in `references.md`.
