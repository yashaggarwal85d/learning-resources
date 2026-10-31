<section data-section="outcomes">

## Outcomes

Generate a uniform baseline dataset and confirm it shows no hot-key effect; replace it with a
seeded Zipfian generator and reproduce a visible hot-key latency tail on the same query; reproduce
a cardinality-estimator misestimate from a correlated column pair and contrast it against the same
query shape over independent columns; state an explicit scale factor for a generated dataset;
commit a seeded generator function that reproduces byte-identical data from the same seed.

</section>

<section data-section="internals">

## Internals

PostgreSQL's own documentation states the planner's assumption directly: "the planner normally
assumes that multiple conditions are independent of each other, an assumption that does not hold
when column values are correlated," and that "regular statistics, because of their
per-individual-column nature, cannot capture any knowledge about cross-column correlation."
YCSB's own Workload A configuration file sets its request distribution to Zipfian, and the
project's own `ZipfianGenerator` describes itself as producing "a sequence of items, such that
some items are more popular than others, according to a zipfian distribution." TPC-H's own
Standard Specification defines its own convention directly: a table's cardinality is "factored by
SF, the Scale Factor," with scale factor one defined as "approximately 1GB."

</section>

<section data-section="lab">

## Lab

A real measurement against this sandbox's own Postgres. `examples.py` first builds a uniform
baseline dataset and confirms, directly, that order counts and lookup latency show no dramatic
hot-key effect. It then rebuilds the identical dataset with a seeded Zipfian key generator and
measures a hugely disproportionate order count and a measurably slower lookup for the single
busiest customer. A third experiment builds two small tables, one with a deterministic
country-to-currency mapping and one with an independently assigned pair, and compares each one's
`EXPLAIN`-estimated row count against its own actual count. A fourth check runs the Zipfian
generator twice from the same seed and confirms the two runs hash to byte-identical data.

</section>

<section data-section="production">

## Production failures this topic warns about

**Benchmarking with uniformly random keys and trusting the result.** A uniform key generator does
not hide a hot key by accident — it structurally cannot create one, so any benchmark built on it
says nothing about what happens once a real, skewed key distribution shows up in production.

**Trusting a query planner's cardinality estimate on untested, correlated production columns.** A
planner's own independence assumption is not a bug; it is the default, and it fails silently
exactly where real columns happen to be correlated, unless extended statistics or representative
test data catch it first.

</section>

<section data-section="frontier">

## Frontier

The hot-key effect and the cardinality-estimate error are two distinct failure modes, often
confused as one. A hot key is about request volume distribution across keys; a correlated-column
misestimate is about a planner's own assumption breaking on value relationships between columns.
A benchmark can reproduce one without the other, and this topic's own lab deliberately measures
both separately to keep the two causes apart.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A single query, on one table, measured honestly with a realistic key distribution, is still one
benchmark built by hand for one chapter. The next topic names the suites an entire industry built
the same way, at a scale this course's own harness cannot reach, and the trap the method gets
built to resist: a vendor choosing which true number to publish.

</section>
