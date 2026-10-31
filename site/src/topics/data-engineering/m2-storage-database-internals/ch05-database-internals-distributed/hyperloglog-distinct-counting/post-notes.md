<section data-section="outcomes">

## Outcomes

A real HyperLogLog sketch is built from leading-zero estimation, registers and a harmonic mean,
then measured for real error against an exact count on a real Zipf-skewed stream across several
register counts. HLL++'s own bias correction and sparse mode are named directly from Google's own
engineering paper. Real sketches are merged across simulated partitions and confirmed to match a
single-pass sketch over the same combined data, exactly. `APPROX_COUNT_DISTINCT` is contrasted
against exact `COUNT(DISTINCT)` from a real warehouse's own documentation, and Theta/KMV sketches
are named as the tool needed once a query needs set intersection or difference, not just a count.
This topic's own lab also builds a real Count-Min Sketch as a worked comparison.

</section>

<section data-section="internals">

## Internals

Each register stores the longest run of leading zeros seen among every hashed key that landed in
it, chosen by part of that key's own hash. The structure's own evaluation function averages across
every register with a harmonic mean rather than a plain arithmetic one, since a harmonic mean is
far less sensitive to the one register that happened to see an unusually long run. Mergeability
falls directly out of this design: combining two sketches by taking the register-wise maximum
across both produces an estimate identical, not merely close, to a single sketch built over the
same combined data, since the maximum operation itself is exact.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a HyperLogLog estimate as free of any real memory-vs-accuracy trade.** A real sketch's
measured error against an exact count shrinks substantially as register count grows; choosing too
few registers for a given accuracy need is a real, measurable mistake, not just a theoretical one.

**Reaching for HyperLogLog, or `APPROX_COUNT_DISTINCT`, to answer a set-level question.** Both
only ever answer "how many." A question shaped like "how many are in both groups" or "how many
are in one group but not the other" needs a Theta or KMV sketch, built specifically for real set
operations, not a cardinality estimator asked to do something it was never built for.

</section>

<section data-section="frontier">

## Frontier

Count-Min Sketch, a *(skipped)* syllabus entry with no topic of its own, is built directly in this
topic's own lab as a worked comparison: a one-sided-error frequency estimator (never undercounts)
answering a completely different question than HyperLogLog's own cardinality estimate.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Counting distinct values is one single number a sketch can approximate. The next, closing topic
is a sketch for an entire distribution at once: a quantile.

</section>
