<section data-section="outcomes">

## Choosing the correct output mode for a stateful query

Append writes only new rows and demands that no written row ever change later -- the only mode
a stream-stream join is allowed to use, since a join's own rows are never revised once emitted.
Update writes only what changed since the last trigger, and complete rewrites the entire result
table every time, which only an aggregation query can afford. A query's own shape -- does it
revise past rows, can it afford to re-emit everything -- decides which modes are even legal to
request, before the data itself matters at all.

</section>

<section data-section="Why an unsupported combination is rejected">

## Why an unsupported combination is rejected

Measured directly: asking for complete mode on a stream-stream join is rejected before the
query starts, with a real analysis error naming both the mode and the join. The rejection isn't
about performance or resource limits -- it's that complete mode's own contract (rewrite
everything, every time, including rows already emitted) is logically incompatible with a join's
own contract (never revise a row once it's out).

</section>

<section data-section="production failures">

## When accepted doesn't mean safe

A stream-stream join with no watermark on either side is accepted and runs without complaint --
but its buffered state, measured directly, only ever grows. Spark rejects what it can prove is
logically impossible; it does not reject what merely has no bound. An unbounded-state query will
run for a long time before anything visibly breaks, and by then the fix (adding a watermark and
a time-range join condition) means losing data that's already been silently buffered.

</section>

<section data-section="frontier">

## Where this goes next

Operators and output modes describe what the query computes. The next topic is the guarantee
about what happens if the query, or the whole driver, dies partway through computing it.

</section>
