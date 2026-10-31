<section data-section="outcomes">

## Reading a stage's task-duration histogram as the diagnosis

The Spark UI's stage tab lists every task's duration and shuffle-read bytes directly; no need to
re-derive either from the data itself. Sort either column and compare the maximum to the median:
a ratio near 1 is a balanced stage, and a ratio in the double digits — like this topic's own 12.2x
on bytes — names a straggler before you've looked at a single row. One straggler task per stage is
the signature; several equally slow tasks usually means something else (an undersized cluster, a
genuinely large stage) rather than skew specifically.

</section>

<section data-section="Isolating hot keys without broadcasting the whole table">

## Isolating hot keys without broadcasting the whole table

Broadcasting needs the entire small side to fit in every executor's memory. When the small side
is itself large — too big to broadcast whole, but with only a handful of truly hot keys driving
the skew — the same no-shuffle idea still applies to just those keys. Filter the small side down
to the rows matching the hot keys (nearly always a tiny result, however large the full table is),
broadcast only that filtered slice, and shuffle-join everything else exactly as before. The union
of the two join results is the same answer a single shuffle join would have produced, but the
rows that caused the skew never touch a shuffle at all.

This composes with salting rather than replacing it: a real pipeline can isolate the handful of
truly extreme keys and salt only the keys with milder, residual skew, instead of choosing one
remedy for the whole table. It is also the one remedy on this topic's ladder this `examples.py`
does not independently re-measure past the plain broadcast case already shown — the mechanism is
identical to broadcasting (no shuffle on the isolated rows), just applied to a filtered subset
instead of a whole table that happens to be small.

</section>

<section data-section="production failures">

## When this doesn't save you

Salting's cost scales with its replication factor: multiply the small side's own size by however
many salt buckets you choose, and that's the extra shuffle bytes this remedy adds everywhere else
on the ladder didn't need to. A small dimension table makes this negligible; salting a genuinely
large "small" side multiplies a real cost by that same factor, which is exactly why this topic's
own measurement discloses the byte increase rather than treating salting as strictly better than
doing nothing. And reaching for AQE configuration at all when the skew is in an aggregation,
rather than a join, is itself a wrong diagnosis: `OptimizeSkewedJoin.scala`'s own pattern match
never fires on an aggregate node, so no amount of threshold-tuning touches it. The preserved side
of an outer join and a window function's own partition-and-sort step share the same blind spot,
for the same source-level reason — neither is a join operator either.

</section>

<section data-section="frontier">

## Where this goes next

Every remedy on this topic's ladder rearranges a shuffle that still has to happen somehow — AQE
splits it, broadcasting or isolating skips it for one side, salting spreads it differently. Dynamic
partition pruning, next, is the opposite kind of lever: it removes work before any shuffle starts
at all, using a dimension-side filter's own result to prune fact-table partitions a star join would
otherwise have had to read, shuffle, and discard.

</section>
