<section data-section="outcomes">

## Outcomes

Run a real MERGE against a table in this sandbox and show it finding touched files two ways: full
rewrite versus writing a deletion vector instead, with real measured cost for each. Explain
low-shuffle merge as the optimization that avoids rewriting unaffected columns. Reproduce a real
MERGE conflicting with a concurrent compaction job and show the resulting retry. Explain row
tracking as what gives a row a stable identity across rewrites. Name Change Data Feed as the
outbound CDC stream this MERGE activity can produce.

</section>

<section data-section="deep-dive">

## Deep-dive

The fresh-vs-stable Row ID split isn't an accident of this topic's implementation; it follows
directly from how each ID is defined. A fresh ID is nothing but `baseRowId + position` recomputed
on demand — cheap, but necessarily wrong the instant either the file or the position changes. A
materialized Row ID is a value physically stored and carried forward by the writer, so it survives
exactly as long as the writer chooses to carry it. There's no cleverness that could make a purely
computed value survive a rewrite that changes its own inputs; the two kinds of ID aren't a
spectrum, they're genuinely different mechanisms with different guarantees.

</section>

<section data-section="production">

## Production

Before committing, Delta checks whether the proposed changes conflict with anything committed
since the snapshot that was read — and if they do, the write fails with a concurrent modification
exception rather than silently corrupting the table the way a plain Parquet write would. That's
the real production consequence of the MERGE-vs-compaction conflict this topic reproduces: a
MERGE running against a busy table isn't guaranteed to succeed on the first try, and any production
pipeline running MERGE concurrently with OPTIMIZE needs to handle that retry itself, the same way
this topic's own retry does.

</section>

<section data-section="frontier">

## Frontier

Not built here, named only: low-shuffle merge, a real distributed query engine's own shuffle
planner avoiding a shuffle stage for unmodified rows — this sandbox has no such engine or shuffle
to measure. Also disclosed directly: no `deltalake`/`delta-rs` library is used anywhere in this
topic's script — the commit log, data files, and deletion vector are all written and read by hand,
reusing the exact mechanisms prior topics in this chapter already built and verified.

</section>

<section data-section="next">

## Where this goes next

Everything in the Delta arc so far is the current protocol as it stands today. The next topic is
the current release line that ships it, and the library (Delta Kernel) that lets engines other
than Spark use it correctly.

</section>
