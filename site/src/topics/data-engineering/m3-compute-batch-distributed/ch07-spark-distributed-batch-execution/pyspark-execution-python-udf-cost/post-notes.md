<section data-section="outcomes">

## Outcomes

Measure and explain the three-way timing gap between a built-in expression, an Arrow UDF and a
pickled Python UDF on the identical computation, naming the structural reason (per-batch versus
per-row boundary crossing) rather than just the numbers. Decide, for a given job, which of the
three to reach for first.

</section>

<section data-section="internals">

## mapInArrow and @arrow_udf, the siblings not measured here

`pandas_udf` is one of several Arrow-based entry points this syllabus clause names together:
`mapInArrow` applies a function to a whole partition's worth of Arrow batches directly, and
`@arrow_udf` (Spark 4.1) is a newer scalar-UDF decorator built on the same transfer mechanism.
Both share the batch-at-a-time crossing this topic measures via `pandas_udf` specifically; neither
is independently timed here, since the same mechanism applies to all three.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reaching for a Python UDF because "it's just one column."** This topic's own measurement shows
a pickled UDF taking several times longer than a built-in expression on a plainly simple
computation — doubling a number. The cost isn't about complexity; it's about crossing a process
boundary at all, on every single row.

**Assuming an Arrow UDF is "basically free" because it's not pickled.** Arrow is dramatically
cheaper than pickling, not free — this topic's own measurement still shows it several times slower
than a built-in expression. A built-in expression stays the first choice whenever one exists.

</section>

<section data-section="frontier">

## Frontier

Arrow-optimised Python UDFs became default-on starting in Spark 4.2 — a plain, ordinary
`@udf`-decorated function can itself switch to Arrow transfer on a recent enough Spark version,
without being rewritten as a `pandas_udf` at all. This topic's own `examples.py` targets Spark
4.0.1 specifically, so its pickled measurement reflects the pre-4.2 default path on purpose, named
here rather than left as an unstated version assumption.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything measured so far assumed one job running once, on evenly sized data. The next section
turns to the same shuffle and the same operators under a harder constraint: a partition that isn't
evenly sized, which is where most real jobs actually get slow.

</section>
