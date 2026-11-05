# Storyboard — dsa.mapreduce-as-algorithmic-pattern

**Learning outcomes** (from CHAPTER.md):
1. Write a word count, an aggregation and an equi-join as map, shuffle and reduce, and count
   the records that cross the shuffle with and without a combiner.
2. Decide whether a reduce function may be used as a combiner, by testing associativity and
   commutativity, and repair one that fails (the mean) by changing what is combined.
3. Say what a round is in the MPC model, what limits a round, and why the round count — not the
   framework — is what an algorithm analysis reports.

**Running data** (all computed/asserted in `examples.py`):
- A word count over three map tasks and a Zipf-skewed vocabulary: ninety total word
  occurrences, ten distinct words, shuffled as ninety records without a combiner and twenty-two
  with one — fewer records, and the two runs produce the identical final counts.
- The mean is not associative: combining three groups' own means gives a different number from
  the mean of every value pooled together, by more than a rounding error; combining (sum,
  count) pairs instead and dividing once at the end exactly matches the pooled mean.
- A tiny simulated four-server cluster: a two-relation chain join needs no replication (one
  round, replication factor one) while a three-relation triangle query needs real replication
  to finish in one round — the one-round bound's own replication requirement differs by query
  shape, not by framework choice.
- An idealized doubling scheme for transitive closure needs a number of rounds that grows with
  the chain length, never a constant — the structural reason a chain cannot finish in a fixed
  number of rounds, however large the cluster.

**Engagement arc:** 15 steps, full topic, ~15 min. Two predicts (steps 2 and 9; the first
within the first four). Three takeaways (steps 5, 8, 14; none on step 4).

## Per-step storyboard

1. **Opening/hook.** A word count over a gigabyte of text ships one record per word across the
   network — hundreds of thousands of records just for the word "the" — though the answer only
   needs the distinct words. A one-line change collapses that; a different one-line change
   makes the answer wrong.
2. **Predict.** The same early-combining trick is applied to a sum rewritten as an average. Does
   the answer come out too high, too low, or still exactly right? Options: still right; too
   high, always; too low, always; wrong, in an unpredictable direction. (Correct: wrong, in an
   unpredictable direction — the mean of means is not the mean.)
3. **Reveal — map, shuffle, reduce as an algorithm.** Map applies a function to each input
   record independently, emitting key-value pairs. The shuffle moves every pair to the reduce
   task that owns its key, using a partition function — hash of the key, mod the number of
   reduce tasks, by default. Reduce is called once per key with every value that landed there.
4. **The word count, walked through.** The map function emits each word plus a count of one;
   the reduce function sums every count that arrives for the same word. Map and reduce are each
   embarrassingly parallel — the exchange in between is the one step where every map task talks
   to every reduce task. (No takeaway — right after step 3's reveal.)
5. **Why the shuffle is the cost.** Each phase, on its own, has a span of one task — the lesson
   the work-span model already gave. The shuffle is different: it is the one step that forces
   every map task's output toward every reduce task that might own a piece of it, and that
   all-to-all exchange, not the computation on either side, is what a MapReduce job actually
   pays for. Takeaway here.
6. **The combiner.** When a reduce function is commutative and associative, it may run early —
   on one map task's own output, before the exchange — merging duplicate keys into one record
   per map task instead of one record per occurrence. Word frequencies following a Zipf
   distribution make this collapse dramatic for a common word.
7. **The combiner, measured.** The same word count, shuffled with and without a combiner: far
   fewer records cross the network with one, and both runs land on the identical final answer —
   a combiner changes how much moves, never what the answer is, when the algebra holds.
8. **The algebra a combiner actually needs.** A combiner's output must be able to combine
   further, in any grouping and in any order, because the framework chooses neither how work is
   split among map tasks nor what order partial results arrive in — that is exactly
   associativity and commutativity, not a convenience, a requirement. Takeaway here.
9. **Predict.** A reduce function that computes the mean of its values is asked to double as a
   combiner. Combining three groups' own means and then averaging those three numbers — is that
   the same as the mean of every value pooled together? Options: always the same; always
   different, by a small fixed amount; different, by an amount that depends on how the groups
   happen to split; same only when the groups are equal size. (Correct: different, by an amount
   that depends on how the groups split — the mean of means is simply not the mean.)
10. **Reveal — the broken mean and its fix.** A concrete failing example settles it: three
    groups' own means, averaged, land far from the true pooled mean. The fix combines (sum,
    count) pairs instead of means, and divides only once, in the final reduce — a combinable
    representation exists even when the obvious one does not. (No takeaway — right after step
    9's reveal.)
11. **Rounds, as the resource.** A round is one local computation phase followed by one
    all-to-all exchange. The Massively Parallel Communication model counts exactly two things:
    how many rounds a computation takes, and the most data any one server receives in any
    round — nothing about an actual framework's engineering enters the cost at all.
12. **Rounds, measured on two join shapes.** A two-relation chain join finishes in one round
    with no replication, by partitioning on the shared join column — but a three-relation
    triangle query needs real replication to finish in that same one round, because its shape,
    not its size, is what the bound depends on.
13. **What a fixed round count cannot buy.** A chain of dependent steps — transitive closure —
    needs a number of rounds that grows with the chain's own length, in any scheme that only
    doubles its reach each round; no fixed round count, however many servers help, changes that.
14. **Mapping back to a join.** A reduce-side equi-join is map-with-a-tag, shuffle on the join
    key, reduce emitting the matching pairs for each key — the same partitioning idea Grace
    hash joins used on one machine's memory, now applied across a network instead. A skewed key
    that sends most of its records to one reducer is the same hot-partition problem, just paid
    for in network time instead of disk time. Takeaway here.
15. **Recap and handoff.** A few rounds of independent work finish in a few rounds, however
    many machines join in — and a problem whose best algorithm takes exponential time stays
    exponential no matter how many machines divide it. Handoff to Chapter 33.

**Post-notes headings:** outcomes; internals (why associativity and commutativity are the exact
and only algebraic requirement a combiner needs, derived rather than recited; why a round, not a
framework feature, is the unit an MPC-model analysis actually counts); lab (none built — see
"Changes from the chapter plan" for why); production (Google's own MapReduce paper, Spark's
documented `reduceByKey` contract, Hadoop's independent implementation of the same pattern);
frontier (Pregel and the COST argument, named only); next (Chapter 33, P, NP and polynomial
reductions).

**Bridge:** word for word, topic 105's handoff, from `registry.ts`: "Work and span say what any
number of cores on one machine can do, and work stealing is the scheduler that gets there
without a central queue. But the machine this reel assumed has one memory that every core can
read for free. When the data does not fit on one machine, or the cores are in different ones,
moving a record costs more than computing with it, and the question changes from 'how long is
the longest chain' to 'how many times must everyone exchange data'. MapReduce is the pattern
built around that question."

**Handoff** (word for word, from CHAPTER.md): "MapReduce shows what many machines buy: a job
that is a handful of rounds of independent work finishes in a handful of rounds, however many
machines you add. It also shows what they cannot buy. A computation with a long chain of
dependencies still needs that many rounds, and a problem for which the best known algorithm
takes exponential time stays exponential on ten thousand machines, because dividing exponential
work by a million leaves it exponential. This course has already met such problems, in passing:
a join order, a packing, a schedule. The next chapter says exactly what makes a problem that
kind, and how to recognise one before you spend a month on it. P, NP and polynomial reductions,
next."

**Concept ledger:** introduces `map-shuffle-reduce`, `shuffle-partition-function`,
`combiner-function`, `associative-commutative-reduce`, `mpc-model`, `round-complexity`,
`reduce-side-join`. Uses topic 105's `computation-dag`, `work-t1`, `span-t-infinity`,
`parallelism-ratio`; Chapter 3's `separate-chaining`, `bucket`, `hash-function`; Chapter 1's
`latency-percentiles`, `big-o-theta-omega`; Chapter 6's `loser-tree`, `k-way-merge-bound`.
Declares `associativity`, `commutativity`.

**Changes from the chapter plan:**
- Karloff, Suri and Vassilvitskii's SODA 2010 paper was not readable at research time (its
  homepage URL returned nothing reachable), exactly as CHAPTER.md anticipated. Its model is
  named in one sentence via the Beame-Koutris-Suciu paper's own summary of it (quoted in
  `SOURCES.md`), and no definition of its specific parameters is stated on screen beyond that
  summary.
- CHAPTER.md's Chapter 32 Lab bullet (Blelloch scan, parallel radix sort, a Pregel-style
  connected-components comparison) rests on topics marked *(skipped)* in this chapter's plan
  and was already deferred by topic 105's own "Notes for the release run." This topic's own lab
  content is limited to what `examples.py` already computes (the word-count shuffle counts, the
  broken-mean counter-example, and the tiny simulated MPC-model cluster), with no additional
  separate lab section built.
