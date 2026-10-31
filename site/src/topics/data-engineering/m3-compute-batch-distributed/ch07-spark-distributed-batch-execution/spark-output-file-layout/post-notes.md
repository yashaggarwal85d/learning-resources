<section data-section="outcomes">

## Predicting file count before running the write

The rule needs only two numbers read off the plan before a write ever runs: the number of
tasks writing (the stage's own task count feeding the `DataFrameWriter`) and the number of
distinct partition-column values each of those tasks actually touches. Multiply them, and
that's the file count — no need to run the write and count files afterward to know what's
coming, as long as no per-file cap or rebalancing hint changes the picture.

</section>

<section data-section="Table-format write-distribution modes">

## Table-format write-distribution modes

Both levers this topic measures act on a single write, chosen by whoever wrote that query.
Table formats offer a third option that moves the decision out of query authors' hands
entirely: Iceberg's `write.distribution-mode` and Delta's `optimizeWrite` rebalance a table's
*every* write to it by default, without any hint needed per query. This is the general
treatment the syllabus clause itself defers to the lakehouse storage chapters (§6.1/§6.3) —
named here, not independently measured, since this topic's own `examples.py` writes plain
Parquet with no table format layered on top.

</section>

<section data-section="production failures">

## When this doesn't save you

A write with a high task count into a high-cardinality partition column multiplies both sides
of the rule at once — a thousand tasks each touching a thousand distinct partition values is
a million files, and neither lever fixes that on its own: `maxRecordsPerFile` only ever splits
a file that's already too big, and `REBALANCE` only ever changes task count, not partition
cardinality. The fix in that case is almost always to partition by a coarser column, not to
reach for either of this topic's two write-time levers. And a `REBALANCE` hint placed on a
query with AQE off does nothing at all — a config mismatch this topic's own measurements show
produces no error, no warning, just an unchanged file count.

</section>

<section data-section="frontier">

## Where this goes next

Every topic so far in this section was about what gets read, shuffled, or written on the way
through a job. The next section turns to a different question entirely: what happens inside
the machine running that job when it runs out of room — Spark's own memory model, starting
with how execution and storage memory share one pool.

</section>
