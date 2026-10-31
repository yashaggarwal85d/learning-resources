<section data-section="outcomes">

## Outcomes

One of the lakehouse's writers is about to be the biggest the table has seen: a reprocessing of
years of history. This topic designs for that without breaking production: the history is cut
into independent chunks, each made idempotent so a rerun overwrites its own slot rather than
duplicating, with a durable checkpoint that resumes at the first incomplete chunk, never the
start. A throttle caps concurrency and source-read rate to leave production headroom, and reacts
continuously to production's own live latency rather than running against a fixed number chosen
once. The backfill's output lands on a shadow table, invisible to live readers, and is promoted
by a single atomic swap — a failed run is discarded, never repaired in place. Before that swap,
a data diff compares the shadow against the live table and an independent recomputation, and
must show only the change this backfill was actually meant to make.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The orchestrator's backfill mechanics, partition backfills and
catch-up (Chapter 11 §11.1), write-audit-publish and data-diff internals (Chapter 11 §11.4), and
the table-format branch-and-swap mechanics (Chapter 6 §6.3) are each named only as a choice
pointing to its home chapter — this topic doesn't re-derive their mechanics. Idempotent writes
belong to topic 6 and Chapter 14 topic 13; concurrent-writer conflicts with live ingest belong
to topic 15.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The crash-and-resume simulation, the throttle
simulation against a production-latency signal, and the duration-and-cost estimate are this
topic's executable evidence. `examples.py`'s own lab: `chunk_plan()` and
`simulate_crash_and_resume()` show a checkpoint resuming with no duplicate output;
`throttled_concurrency()` shows the latency-driven back-off and recovery; `backfill_cost()`
prices the shadow's storage overhead; `diff_is_intended_only()` gates the swap on the diff.

</section>

<section data-section="production">

## Production failures this topic warns about

**A single undifferentiated backfill job.** One job that reprocesses everything at once has no
resume point on a crash and no isolation from production load — a failure late in the run loses
all of its progress.

**A throttle treated as a one-time check.** A throttle disabled "to go faster" or never
re-checked against live latency stops protecting production the moment it's turned off, even if
the backfill that disabled it is already well underway.

</section>

<section data-section="frontier">

## Frontier

None claimed. Chunked idempotent backfills and shadow-then-swap validation are established
practice — Dagster and Iceberg both ship the mechanisms — not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The backfill replays history through today's logic. A related question is whether you needed
two pieces of logic in the first place: one for the stream and one for the batch correction. The
next design builds the same pipeline both ways, as a streaming-only Kappa design and a Lambda
design with a batch layer, and argues which earns its complexity.

</section>
