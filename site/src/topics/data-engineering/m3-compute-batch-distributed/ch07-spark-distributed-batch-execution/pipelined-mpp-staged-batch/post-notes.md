<section data-section="outcomes">

## Naming what each model gives up to get what it gets

Spark's own model, taught across this whole chapter, materialises every stage's output before
the next stage starts -- a real, measured write cost in exchange for a failed task only ever
costing a stage retry, not the whole query. A pipelined exchange like Trino's default mode keeps
data moving in memory the entire time: measured directly, the same per-row computation runs
meaningfully faster when it's done in large, vectorised batches rather than one row at a time,
and that speed is exactly what a pipelined engine's lack of a stage boundary trades away -- by
default, one failed task fails the whole query. Ray Data's operator-level streaming is a third
point on the same trade: measured directly, a pipeline that discards each row's result the
moment it's used keeps its memory essentially flat across a hundredfold increase in row count,
while one that materialises the whole intermediate result grows right along with it.

</section>

<section data-section="fault-tolerant execution as the convergence point">

## Fault-tolerant execution as the convergence point

Trino's own fault-tolerant execution, off by default, is not a different model from Spark's --
it's the same pipelined engine deliberately choosing to grow a stage boundary where it needs
one. Its `TASK` retry policy spools exchange data to storage on purpose, buying back exactly the
recoverability Spark pays for on every single stage, but only for the queries where that cost is
worth paying.

</section>

<section data-section="production failures">

## Picking the wrong model for the workload

The failure here isn't a crash in any one system; it's choosing a model that doesn't match the
workload it's asked to run. A long, large batch job run on a pipelined engine with
fault-tolerant execution left off risks the entire job's progress on one transient failure. A
short, interactive query run through Spark's own stage-at-a-time model pays a materialisation
cost on every single stage for recoverability that query will likely never need.

</section>

<section data-section="frontier">

## Where this goes next

This closes the chapter's own execution-model material, and the chapter itself. The execution
engines this milestone covered all assumed the data was already sitting in storage they could
read. The next milestone opens on how it got there from the systems that produced it in the
first place.

</section>
