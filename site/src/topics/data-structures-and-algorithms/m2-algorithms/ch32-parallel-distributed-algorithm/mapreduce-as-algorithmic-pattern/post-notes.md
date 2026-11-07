---
id: dsa.mapreduce-as-algorithmic-pattern
title: MapReduce as an algorithmic pattern
---

<section data-section="outcomes">

## After this topic you can

- Write a word count, an aggregation and an equi-join as map, shuffle and reduce, and count the
  records that cross the shuffle with and without a combiner.
- Decide whether a reduce function may be used as a combiner, by testing associativity and
  commutativity, and repair one that fails (the mean) by changing what is combined.
- Say what a round is in the MPC model, what limits a round, and why the round count — not the
  framework — is what an algorithm analysis reports.

</section>

<section data-section="internals">

## Into the internals

### Why a combiner's algebra is derived, not a rule to memorize

A combiner is legal only because of what the framework explicitly does not promise: it does not
promise which map task's output lands next to which, and it does not promise an order among
partial results as they arrive. Anything combined early has to survive both of those freedoms —
combine into the same answer under any grouping and any order — and that requirement has a
name: associative and commutative. The mean fails exactly this test, and the fix is not a patch
on the mean but a change of representation: sum and count form a combinable pair precisely
because sum is associative and commutative and count is too, and dividing is deferred to a
single place where it can no longer be fooled by an uneven split.

### Why the round, not the framework, is the unit of cost

The Massively Parallel Communication model's two counted quantities — the number of rounds and
the largest per-server receive volume in any one round — say nothing about which engine runs the
job. That is deliberate: it lets a chain join's one-round, no-replication shape and a triangle
query's one-round, real-replication shape be compared as properties of the *query itself*, not
of Hadoop's or Spark's particular scheduler. A result proved in this model (transitive closure
needs more than a constant number of rounds) is a statement about what any framework building on
this model's rules can ever achieve, not about one implementation's current limits.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: a three-map-task word count over a
Zipf-skewed vocabulary, shuffled with and without a combiner, asserting both runs produce the
identical final counts while counting far fewer records with one; a concrete broken-mean
counter-example (three unequal-sized groups) showing the gap between the mean of means and the
true pooled mean, and the (sum, count) fix landing exactly on the true value; a tiny simulated
four-server cluster comparing a chain join's round and replication cost against a triangle
query's; and a doubling-rounds table showing why a growing dependency chain needs a growing
number of rounds under one natural scheme. Re-run the word count with a different random seed
and confirm the combiner always shrinks the record count without changing the final answer.
Re-run the broken-mean example with group sizes closer together and watch the gap shrink toward
zero as the groups approach equal size.

</section>

<section data-section="production">

## In production

**Google's own MapReduce paper** describes a production system built on exactly this shape:
backup tasks scheduled for the last few in-progress stragglers, done when either the original or
the backup finishes, at a stated typical overhead of only a few percent of total compute — the
engineering that makes a pattern this simple actually survive a cluster where some machine is
always slow. **Spark's `reduceByKey`** documents the same combiner contract in its own source
comment, word for word: a map-side merge before the exchange, "similarly to a 'combiner' in
MapReduce," while `groupByKey` deliberately skips that optimization because grouping does not
get to assume anything is combinable. **Hadoop's `Partitioner`** interface and its default
`HashPartitioner` are the shuffle's partition function, implemented and shipped exactly as this
topic's own `hash(key) mod R` describes it.

</section>

<section data-section="frontier">

## The frontier

Vertex-centric graph processing is named once as the place this same "rounds of local compute,
one exchange" shape goes next when the data is a graph kept in place and messages travel along
its edges: Pregel's bulk-synchronous supersteps are the model, read only as far as confirming
that shape at research time. The COST argument (McSherry et al., HotOS 2015) is named as the
honest warning that a cluster's measured speed-up is only meaningful against a good single-thread
baseline — a caution this topic states but does not build out. Both are *(skipped)* topics in
this chapter's own plan; Data Engineering §17.3 owns graph processing.

</section>

<section data-section="next">

## Where this goes next

MapReduce shows what many machines buy: a job that is a handful of rounds of independent work
finishes in a handful of rounds, however many machines you add. It also shows what they cannot
buy. A computation with a long chain of dependencies still needs that many rounds, and a problem
for which the best known algorithm takes exponential time stays exponential on ten thousand
machines, because dividing exponential work by a million leaves it exponential. This course has
already met such problems, in passing: a join order, a packing, a schedule. The next chapter
says exactly what makes a problem that kind, and how to recognise one before you spend a month on
it. P, NP and polynomial reductions, next.

</section>
