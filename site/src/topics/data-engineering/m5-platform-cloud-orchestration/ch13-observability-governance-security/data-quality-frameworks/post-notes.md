<section data-section="outcomes">

## Outcomes

Place a given check in a gate or a post-hoc scan and estimate its cost as a share of
pipeline compute; write the same not-null and uniqueness rule as a dbt test, a GX
expectation and a Deequ check and say what each one computes; say what a dbt unit test
catches that a dbt data test cannot; compute a metric incrementally across partitions and
show it equals the full recomputation; state the GX stewardship facts exactly, with the
source and date.

</section>

<section data-section="measuring-the-cost-of-a-check">

## Measuring the cost of a check

`examples.py` runs a dbt-style not-null data test against a small batch of built data and a
dbt-style unit test against a transformation's own mocked inputs, showing each one catches a
different kind of bug -- a bad row the data test flags, and a planted logic bug only the unit
test's mocked cases reveal. It then computes the same not-null count two ways: a full rescan
of every partition, and an incremental metric that merges each new partition's contribution
into a running total -- the two land on the identical number. Finally it plants exactly one
bad row among a hundred good ones and shows a full scan always finds it while an evenly-spaced
sample misses it, because the bad row simply falls between the sampled positions.

</section>

<section data-section="production">

## Production failures this topic warns about

**Running every check as a gate.** The Hook's own scenario -- a dozen checks added, the
pipeline's runtime doubling -- is exactly what happens when every check, including the ones
that need a clock outside the run or a historical baseline, gets forced into the gate instead
of being split off to run post-hoc on its own schedule.

**Trusting a sample's silence.** `examples.py`'s own measurement shows a sample can miss a
real bad row entirely, not approximately -- a sample that finds nothing wrong is evidence of
nothing wrong only up to the rate it was taken at, never a guarantee.

</section>

<section data-section="frontier">

## Frontier

A dbt test's severity can be set to warn instead of error, letting a check run and report
without ever failing the build -- a third outcome sitting between a hard gate and a pure
post-hoc scan that this topic's own two-way split doesn't build, but that a real dbt project
uses constantly to phase in a new, not-yet-trusted check.

</section>
