# Fact-check — de.incremental-snapshots-watermark-windows

## Claims against sources

1. **"Log events continue progress without stalling while processing selects... DBLog executes
   selects in chunks and tracks progress, allowing them to pause and resume. The watermark
   approach does not use locks and has minimum impact on the source."**
   Source: DBLog paper, Netflix (SOURCES.md quote 1). Direct match. Measured directly: the
   algorithm's only writes to the table being copied are the two watermark updates per chunk,
   confirmed by inspection; `the_full_chunked_run_matches_the_source_under_heavy_concurrent_load`
   runs a complete chunked copy under real concurrent writes with no table lock taken anywhere.

2. **Algorithm 1's own steps: a low watermark opens the window, the chunk is selected, a high
   watermark closes it, and rows colliding with log events inside the window are removed before
   the surviving rows are emitted.**
   Source: DBLog paper, Netflix (SOURCES.md quote 2). Direct match. Reproduced by construction,
   not merely quoted: `_run_one_chunk` implements exactly this sequence against a real
   logical-decoding slot, and `a_streamed_update_during_the_window_supersedes_the_stale_chunk_row`
   confirms a real update inside the window overrides the chunk's own stale copy.

3. **The default chunk size for incremental snapshots is 1,024 rows.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 3). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own `examples.py` uses smaller chunk sizes
   (20-40 rows) to keep each measured run fast, disclosed as a deliberate choice, not a claim
   about Debezium's own default.

4. **"If the progress of an incremental snapshot is interrupted, you can resume it without
   losing any data. After the process resumes, the snapshot begins at the point where it
   stopped, rather than recapturing the table from the beginning."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 4). Direct match. Measured
   directly: `pausing_after_a_chunk_and_resuming_loses_no_progress` stops a run after its second
   chunk, resumes from only that chunk's own stored end position, and confirms the combined
   result matches an uninterrupted run over identical starting data.

5. **Debezium's own buffered collision-resolution: a streamed event matching a buffered READ
   event's primary key discards the READ event, because the streamed event supersedes it.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 5). Direct match. This topic's
   own hand-written algorithm reproduces the identical rule (not Debezium's own buffering
   implementation) and measures it directly, including the delete case Debezium's own quote
   does not single out separately but which the same rule covers.

6. **The PostgreSQL connector does not support schema changes while an incremental snapshot is
   running.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 6). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own `examples.py` never changes the
   scratch table's schema during a run, so this limitation is disclosed, not exercised.

7. **`data-collections`/`additional-conditions` select a snapshot signal's scope; `stop-snapshot`
   can omit tables from a running snapshot.**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 7-8). Direct match. Named in
   the reel's own final predict question and explain text, not independently reproduced (no
   JVM/Kafka here to run a real signal-triggered snapshot).

8. **PostgreSQL's read-only incremental snapshot uses the current in-progress transaction as
   high and low watermarks, comparing WAL event or heartbeat transaction IDs against them;
   MySQL's uses the executed GTID set instead.**
   Source: Debezium docs, PostgreSQL and MySQL connectors (SOURCES.md quote 9, 11). Direct
   match. Named only, for contrast with the signal-table variant this topic's own `examples.py`
   models by hand — this sandbox has no MySQL server (confirmed absent in topic 11).

## Predict questions red-teamed

- **Step 2** ("resurrected or gone"): the wrong option claims the deleted order comes back,
  since the chunk already read it first. Checked against both the DBLog paper's own algorithm
  and the measured delete-not-resurrected proof directly: a chunk's read is provisional by
  design, and anything touching the same key before the window closes outranks it.

- **Step 10** ("what triggers a late table's own snapshot"): the wrong option claims restarting
  the whole connector is the way to pick up a newly added table. Checked against Debezium's own
  documented signal mechanism directly: a signal named for exactly that table exists precisely
  to avoid the cost and disruption of restarting a connector that is already streaming
  everything else correctly.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic splits at its own semicolons into three clauses: chunked
snapshots interleaved with the log (watermarks, superseded rows dropped), signal tables versus
Kafka signalling versus read-only variants, and re-snapshotting one table without stopping CDC.
All three are covered — the first by direct measurement against this sandbox's own PostgreSQL
cluster (the watermark algorithm, the supersede proof, the full chunked run, and pause/resume),
the second and third by a combination of the reel's own final predict question and documented
naming, since exercising a real signal channel needs a running Debezium connector this sandbox
cannot host. No claim here depends on topic 15's ordering and transaction-boundary guarantees,
topic 19's full signalling reference, topic 21's Flink CDC parallel-snapshot framework, or the
DBLog paper's wider multi-source design, all named in "Leaves out."
