<section data-section="outcomes">

## Outcomes

Explain a deletion vector as a per-data-file bitmap of deleted row positions, built and inspected
directly on a real local data file: an array container under a real fixed threshold, a fixed-size
bitset once past it. Contrast Delta's deletion vectors, Iceberg v3's (stored as a Puffin blob, at
most one per data file) and Hudi's different, non-bitmap mechanism. State the real merge-on-read
read cost a deletion vector leaves behind at query time, measured directly, and show that purging
it via compaction pays that cost back, also measured directly.

</section>

<section data-section="one-rule-two-formats">

## One bitmap, one holdout

Delta and Iceberg v3 don't just arrive at the same idea independently — the Puffin spec's own
deletion-vector-v1 blob definition states its big-endian framing was chosen specifically "for
compatibility with existing deletion vectors in Delta tables." The two formats share the same
bitmap on disk. Hudi takes a genuinely different path: instead of a positional bitmap, it writes
a record-level delete marker straight into the same merge-on-read log file this chapter's
previous topic already built — the identical question, answered with a different data structure
entirely.

</section>

<section data-section="production">

## Production

**The array/bitset threshold is a real operational lever, not just an implementation detail.** A
table with many files, each carrying a small, sparse scatter of deletes, stays efficient under
the array representation. A table with a smaller number of heavily-deleted files crosses into
bitset territory, where the deletion vector's size per file is fixed regardless of how much worse
the deletes get — which is exactly why left unchecked, that fixed per-file cost still accumulates
across every file in the table, and still needs compacting away.

**Reading a deletion vector adds real, measurable latency to every scan until it's purged.** A
query engine has to open the Puffin blob (or Delta's deletion-vector file), decode the bitmap, and
test it against every candidate row position — real work, on every single read, that a compacted
table never has to do at all.

</section>

<section data-section="frontier">

## Frontier

The data file in `examples.py` is plain CSV text, not Parquet, and `DeletionVectorContainer` is a
simplified reimplementation of the Roaring format: it reuses the real format's own 4,096-element
array/bitset threshold and 65,536-bit single-container bitset size, but does not implement
run-length containers, multi-container key layout, or the real on-disk serialization (cookie
header, descriptive header, offset header) byte for byte. The read-cost demo's "compaction" is a
plain purge-and-rewrite of the CSV file, not a real columnar rewrite. Delta's deletion-vectors
feature is documented as "in experimental support mode" as of Delta Lake 2.3.0+ — this topic
treats it as Delta's real, current mechanism, not a claim it is stable-forever or on by default.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A deletion vector works because a row's identity survives a rename just fine inside one data
file. The next question is what happens when the whole column, not just a row, needs to survive a
rename: schema evolution with column IDs.

</section>
