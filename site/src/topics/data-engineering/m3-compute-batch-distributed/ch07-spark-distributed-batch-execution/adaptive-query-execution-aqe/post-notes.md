<section data-section="outcomes">

## Reading a plan's own AQE section

`AdaptiveSparkPlan isFinalPlan=true` marks a plan that AQE has finished rewriting; its text splits
into `== Final Plan ==` and `== Initial Plan ==`, printed in that order. Diffing the two sections
directly shows exactly what AQE changed and nothing else — any operator unchanged between them
ran, or will run, exactly as the static planner decided.

</section>

<section data-section="why a reoptimization needs a shuffle boundary, the sourced-only half">

## Why a reoptimization needs a shuffle boundary

Spark operators are normally pipelined: one task's output feeds the next without ever landing
anywhere a different process could read it. A shuffle or broadcast exchange is the one place that
breaks the pipeline on purpose, materializing a real, countable result. AQE's own re-optimization
only ever fires right there, because that's the only moment a real number exists to re-optimize
with — before it, every size is still an estimate; during the pipelined run in between, nothing new
is known yet either.

</section>

<section data-section="production failures">

## When this doesn't save you

AQE's reoptimization is itself bounded by `spark.sql.adaptive.autoBroadcastJoinThreshold`
(defaulting to the same 10 MB as the static threshold) — a side has to be genuinely small after
its own shuffle, not merely smaller than expected, to get broadcast. A `groupBy` that doesn't
reduce its input much, or a join where both sides stay large after their own shuffles, gets no
demotion at all: the sort-merge join simply runs as planned, AQE or not. And every leaf scan,
filter, and projection that ran before the first shuffle is already finished the moment a
reoptimization happens — a slow scan, an unnecessarily wide read, or a filter pushed down
incorrectly stays exactly as costly as it was, because AQE never touches a stage that already
materialized.

</section>

<section data-section="frontier">

## Where this goes next

Partition coalescing and join demotion both assume the skew, if any, is mild enough that merging
or broadcasting fixes it cleanly. A genuinely skewed partition, where one key's rows dwarf every
other partition's, needs a different AQE feature entirely — splitting that one partition into
several smaller, roughly even pieces — which is the next topic's own subject, along with the
remedies for the skew AQE's join handling cannot reach at all: aggregations, the preserved side of
an outer join, and window functions.

</section>
