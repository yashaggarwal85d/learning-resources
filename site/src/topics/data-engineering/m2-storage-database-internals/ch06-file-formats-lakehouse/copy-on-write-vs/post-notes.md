<section data-section="outcomes">

## Outcomes

Perform a real 1%-row update under copy-on-write (every touched file rewritten) and under
merge-on-read (a small log file written, merged at read time) on the same table, and measure the
real write latency and real read latency each mode produces. State the general choice rule
(update rate, update spread, read SLA) with those two measurements as the concrete evidence. Show
compaction converting merge-on-read's accumulated read cost back down toward copy-on-write's,
measured before and after.

</section>

<section data-section="one-primitive-two-formats">

## One rule, two formats

Hudi names the two whole strategies directly: copy-on-write and merge-on-read. Delta names the
same fork at the row level instead of the table level: a default delete rewrites the whole
Parquet file, or a deletion vector marks rows removed without rewriting it. Iceberg's position
delete files and deletion vectors are the identical pair again, under its own vocabulary. All
three formats face the same choice this topic measured for real: pay the cost at write time, or
defer it to read time until compaction clears the debt.

</section>

<section data-section="production">

## Production

**Compaction scheduling is the real cost of choosing merge-on-read.** The write savings
merge-on-read offers are not free — they are a loan against future reads, and the loan accrues
interest with every additional unreconciled log file. A table left uncompacted under a steady
stream of small updates will have its read latency climb round after round, exactly as this
topic's demo measured, until a deliberate compaction pass is run.

**The choice is per-table and per-operation, not global.** A table dominated by scattered,
frequent small updates against a tight read-latency SLA favors merge-on-read with aggressive
compaction. A table updated rarely, or where reads vastly outnumber writes and must stay fast
without exception, favors copy-on-write's upfront cost. Several real systems let this be set per
table, or even per write operation, rather than fixed for the whole lakehouse.

</section>

<section data-section="frontier">

## Frontier

The demo's "data files" are plain CSV text, not Parquet, and its "merge" is a Python dict lookup,
not Iceberg's real position/equality delete matching or a RoaringBitmap scan over a deletion
vector. What transfers is the cost *shape* — a full-file rewrite being expensive to write versus a
small log append being nearly free, and a read cost that grows with unmerged log count and resets
after compaction — not a claim of reproducing Parquet's binary layout or a real query engine's
merge operator. Delta's deletion vectors are documented as "in experimental support mode" as of
Delta Lake 2.3.0+, and MERGE support for them arrived only in 3.1.0; this topic treats them as
Delta's real, current MOR-equivalent mechanism, not as a claim they were always available or
stable-forever.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Merge-on-read's own delete files are themselves a mechanism worth a topic on their own: how a
deletion is actually recorded without rewriting the file it touches.

</section>
