<section data-section="outcomes">

## Outcomes

A record validator coerces what it safely can and raises a structured error naming exactly
which field failed when it can't — confirmed directly against a real `ValidationError` whose
first error identifies the bad field by name, not a generic failure. Its cost scales with
record count directly: doubling a batch's size roughly doubles the time, measured directly
rather than assumed, and that's a real, if indirect, trace of the sourced claim that its
underlying Rust core is what keeps it among the fastest Python validation libraries — made
direct in a one-time, disclosed cross-version benchmark recorded in `FACT-CHECK.md`, since the
pure-Python and Rust-core versions can't both be imported in one process. A single declared
DataFrame schema, differing only in which base class it inherits, validates a real pandas
DataFrame and a real Polars frame unchanged, and genuinely rejects a real out-of-range value by
column name rather than letting it quietly through. The identical check costs measurably more
run row by row in a Python loop than run once, vectorized, across the whole column — several
times more, confirmed directly. Great Expectations (GX Core) and Soda are both named and sourced
honestly as mechanisms for checking data once it's already landed, not run directly in this
sandbox since neither needs a production deployment to describe accurately what each checks and
how.

</section>

<section data-section="lab">

## Lab

Hosts the §4.2 chapter lab directly (per `CHAPTER.md`): a real ingestion client (topics 8–9's
pooling and resilience), proven idempotent under replay (topic 10), validated here with a
record schema and a DataFrame schema, then loaded into the sandbox's real PostgreSQL cluster
three ways (measured in topic 8) with real throughput compared. This topic's own `examples.py`
runs every measurement it claims: a real coercion and a real structured error; a real doubled-
input timing run; the identical pandera field declarations validating a real pandas DataFrame
and a real Polars `LazyFrame`; a real `SchemaError` raised on a genuine out-of-range value; and a
real row-level loop measured against a real vectorized check on the identical condition.

</section>

<section data-section="production">

## Production failures this topic warns about

**Validating a whole batch one record at a time, inside a per-row loop.** This topic's own
row-level-vs-batch-level measurement shows the identical check costing several times more run
this way than run once, vectorized, across the whole batch — a real, measured cost, not a
theoretical one.

**Treating a schema check and a governance scan as redundant insurance rather than two different
layers.** A schema checked at the boundary and a production-scale scan checking data that's
already landed answer different questions; running both at the same point in a pipeline doesn't
add safety, it just duplicates the boundary check downstream of where it already ran.

**Trusting a schema's declaration without a real run to confirm it actually rejects what it
claims to.** This topic's own DataFrame-schema reveal didn't just declare a range check — it ran
a real violation through it and confirmed the raised error named the right column, which is the
only way to know a schema's checks are wired correctly rather than merely present.

</section>

<section data-section="frontier">

## Frontier

Both Great Expectations and Soda support far more than what this topic names: GX's own
Validation Results and Data Docs generate human-readable reports of every run, and SodaCL
includes over 25 built-in metrics beyond the `row_count`/`missing_count`/`schema` checks shown
in its own worked examples. This topic names each framework's basic shape and workflow pattern,
sourced directly, without running either in a production deployment this sandbox doesn't have.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every production habit in this section — pooling, resilience, testing, validation — assumed
Python was still the one writing the code. The last section of this chapter is the honest answer
to how much of that code is actually Python at all: native extensions, built with Rust and PyO3.

</section>
