---
id: dsa.choosing-structure-operation-mix
title: Choosing the structure for the operation mix
---

<section data-section="outcomes">

## After this topic you can

- Given a workload described as operation frequencies, estimate each candidate structure's total cost and pick one, saying what would change the choice.
- For each of the seven rows of the dispatch table, state the one operation the structure cannot do.
- Recognise when no single structure fits and the answer is two structures, or a different problem.

</section>

<section data-section="internals">

## Into the internals

### Why a hash table's range query is so much worse than a tree's

A hash function deliberately scatters keys across buckets so that no two nearby keys end up near each other in memory or in iteration order — that scattering is precisely what makes lookup fast (every key's bucket is computable directly from the key, with no search) and precisely what makes range queries slow (there is no notion of "between" two keys once they're scattered). A tree's whole purpose is the opposite trade: keep keys in order at some extra cost per insert, so that "everything between these two bounds" is a short walk rather than a full scan. Neither structure is better in general; each is built around a different question.

### Why maximum has no Fenwick-style trick but sum does

A Fenwick tree's prefix-sum trick works because addition has an exact inverse: subtracting one prefix sum from a later one recovers exactly the sum of the elements between them, with nothing left over and nothing missing. Maximum has no such inverse — there is no operation that, given the maximum of the first r elements and the maximum of the first l minus one elements, recovers the maximum of only the elements between them, because information about which element achieved the maximum (and whether it falls inside or outside the target range) is simply not preserved by taking a maximum. A segment tree sidesteps this entirely by never trying to subtract anything: it combines pre-aggregated chunks directly, which only requires the combining rule to be associative, not invertible.

</section>

<section data-section="lab">

## In the lab

Take the range-share crossover measurement in `examples.py` and change the range width from fifty elements to five, then to five hundred. Does the crossover share move, and in which direction — does a narrower range (cheaper for the tree, since it returns fewer results) need an even smaller share to flip the winner, or a larger one? Separately, build a "membership at scale" workload where a wrong "yes" from a Bloom filter actually costs something concrete (a wasted disk read, say) and a wrong "no" would be catastrophic, and price the Bloom filter's false-positive rate against that concrete cost at a few different bits-per-key settings.

</section>

<section data-section="production">

## In production

Real storage engines rarely pick exactly one row of this dispatch table and stop: an LSM tree (Chapter 5) layers sorted runs on disk with a Bloom filter in front of each one, so that a point lookup that would otherwise touch every run on disk instead skips most of them outright — one structure (the sorted run) for range scans and compaction, another (the filter) bolted on specifically to make the common case of "is this key even in here" cheap. Redis's sorted sets are a cleaner, smaller example of the identical idea: a hash table for O(1) lookup of a member's score, and a skip list for the ordered and range operations the hash table cannot do, over the identical data, kept in sync on every write. The lesson generalizes: when a workload's mix genuinely needs two incompatible things cheaply, the honest answer is sometimes "two structures," not "which one row wins."

</section>

<section data-section="frontier">

## The frontier

Spatial and high-dimensional structures — k-d trees, R-trees, and nearest-neighbour search more generally — answer a question this topic's table has no row for at all: "what is near this point in space," where "near" means a geometric distance rather than an exact match, a key comparison, or a string prefix. Chapter 9's space-filling curves are one answer already named in this chapter's own material; k-d trees, R-trees and true nearest-neighbour search are *(skipped)* in this syllabus and are named here only as the honest answer to "where does 'nearby in space' go," with no claim beyond the pointer.

</section>

<section data-section="questions">

## More questions

- The range-share crossover measured in this topic is specific to a fifty-element range width and a particular machine. What is the actual relationship between range width, total key count, and the crossover share — is it truly as sharp (well under one percent) across a wide range of these parameters, or does it soften substantially for very narrow ranges?
- Union-find's missing "split" operation is not merely unimplemented — some theoretical results say efficient splitting fundamentally conflicts with union-find's near-constant amortised merge cost. What is the actual cost of a disjoint-set structure that does support splitting, and what does it give up to get it?

</section>

<section data-section="next">

## Where this goes next

A structure holds the data and answers questions about it. Some problems do not hand you data at all. They hand you a situation: a position, a set of legal moves, a goal. A word that can change into another by one letter, a puzzle board that can be turned into another by one slide, a lock whose wheels turn one notch at a time. There is no table to put in a structure, because the thing you are searching over is the set of situations, and it is usually too large to write down. Modelling problems as graphs, next.

</section>
