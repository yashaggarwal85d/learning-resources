<section data-section="outcomes">

## Outcomes

Describe the Hive-style directory-as-partition layout and reproduce, directly in this sandbox, a
reader seeing a partial write because table state is just "whatever files a listing currently
returns." Explain why a multi-partition write can't be atomic under this design. State the real
metastore/listing bottleneck as file and partition counts grow, with a measured listing-latency
curve. Name the general shape every modern table format exists to fix: a mutable table on top of
an immutable, list-based object store.

</section>

<section data-section="one-choice-four-symptoms">

## One choice, four symptoms

Every failure this topic reproduces traces back to a single design decision: using a directory
listing as the table's own state. No validation, because the writer's partition-column value is
never checked against the row. A metastore that silently drifts, because nothing tells it when
files change on disk. No atomic commit across partitions, because atomicity (before transactions)
stopped at a single partition's boundary. And listing that gets slower as files accumulate,
because a listing call — real or metastore-mediated — does genuine work proportional to what it's
listing. None of these are separate bugs. They're the same root cause, observed four different
ways.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a Hive table as a stable thing to query while a batch job is still writing it.** This
topic's own demonstration shows a real directory listing, taken mid-write, seeing one partition
complete and the next one half-finished. A downstream job that reads "the table" at the wrong
moment doesn't get an error — it gets a silently incomplete answer, with no signal that anything
was wrong.

**Running `MSCK REPAIR TABLE` on a schedule without accounting for its cost scaling with partition
count.** Cloudera's own documentation states this directly: the sync time is proportional to the
number of partitions involved, and a full repair takes longer as the table grows. A job that
worked fine at a thousand partitions can start timing out, or start locking the table for
unacceptably long, once the same table reaches ten times that.

</section>

<section data-section="frontier">

## Frontier

This topic's partial-write reproduction is a deliberately paused, single-process sequential
write on real local disk — not two genuinely concurrent writer processes racing each other. It's
disclosed as a reproduction of the failure's shape (a listing taken at an arbitrary point during
an unprotected multi-file write can see a subset of it), not a claim about exact multi-process
timing. Likewise, the listing-latency curve is measured against this sandbox's own local disk,
not against real object storage — it demonstrates that listing cost is not flat, not a specific
number comparable to S3's own documented LIST latency (already covered, with real AWS figures, in
the previous topic).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Fixing "no atomic multi-partition commit" means replacing file listing with an explicit,
versioned table state. That's the snapshot.

</section>
