<section data-section="outcomes">

## Outcomes

State what TPC-H, TPC-DS, ClickBench, the Join Order Benchmark and TPC-DI each specifically
stress, and what each deliberately does not; reproduce a small, disclosed-scale stand-in for one
suite's query shape (a join-order-sensitive query over a correlated schema, in the spirit of the
Join Order Benchmark) and say plainly that it is a shape, not the suite itself; name
benchmarketing and a DeWitt clause as the trap this chapter's method resists; publish the
chapter lab's harness, seeded dataset generator and a measured baseline together as one
committed, reproducible artifact.

</section>

<section data-section="internals">

## Internals

TPC-H's own specification states its database "consist[s] of eight separate and individual
tables," with "twenty-two decision support queries." TPC-DS's own specification states its own
schema "is a snowflake schema," with "a query stream consist[ing] of the 99 queries." ClickBench's
own README states its workload "consists of 43 queries" over "a single flat table," noting plainly
that "classical data warehouses may have an unfair disadvantage" in that specific test. Leis et
al. introduce "the Join Order Benchmark (JOB)... based on the IMDB data set," because "cardinality
estimates are usually computed based on simplifying assumptions like uniformity and independence."
TPC's own current specifications page lists TPC-DI under its own "Obsolete Workloads" table.
Wikipedia's account of the DeWitt Clause states it is "an end-user license agreement provision...
that prohibits researchers and scientists from explicitly using the names of their systems in
academic papers," tracing its origin to Oracle's response to David DeWitt's own 1982 benchmark.

</section>

<section data-section="lab">

## Lab

A real measurement against this sandbox's own Postgres. `examples.py` builds a small, disclosed
correlated schema (a transactions table and a five-times-larger items table) and compares joining
the two tables in full before a selective filter narrows them against filtering first and joining
only what survives, using a `MATERIALIZED` CTE fence to control the ordering directly. It then
closes the chapter lab by re-running the chapter's three other committed scripts — topic one's
steady-state detector, topic two's closed-loop/constant-rate generator, and topic three's seeded
Zipfian and correlated-column generator — end to end from this one script, confirming all three
exit clean.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a vendor's own published benchmark comparison at face value.** Every individual number
can be true and independently reproducible while the overall comparison still misleads, because
the suite itself was chosen to favor one engine's own strengths.

**Assuming a licence's silence means no one disputes a published result.** A DeWitt clause can
forbid a competitor from publishing a correction at all, so an uncontested comparison is not the
same thing as an uncontested one.

</section>

<section data-section="frontier">

## Frontier

A suite's own disclosed blind spot (ClickBench naming its own lack of joins) is not dishonest —
it is exactly the kind of trade-off this chapter's whole method is built to surface. What is
dishonest is a vendor cherry-picking only the one suite, or the one query subset, that flatters
their own product while staying silent about every suite or query that doesn't.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every topic in this chapter built one piece of an honest benchmark: a warmed-up target, a load
generator that doesn't lie about its own worst case, data shaped like real data, and the industry
suites that apply all three at scale. None of that method decides, by itself, when a capstone is
actually done, or who outside engineering has to agree the numbers mean what the team says they
mean. The next chapter is that half of the job.

</section>
