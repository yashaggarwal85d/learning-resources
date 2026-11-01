# OUTLINE: Incremental snapshots with watermark windows (`de.incremental-snapshots-watermark-windows`)

## Learning outcomes
1. Run the watermark-window algorithm by hand against a real table under concurrent writes and
   show a superseded chunk row correctly dropped.
2. Explain why the algorithm needs no table lock and why it can pause and resume at any chunk
   boundary.
3. Choose between a signal table, a Kafka signal and a read-only watermark.
4. Trigger a one-table re-snapshot on a connector that keeps streaming everything else.

## Engagement arc
- Hook: step 1 (a chunk's own row is read at the same instant a transaction deletes that order;
  without a marker, the snapshot resurrects it).
- Predict: step 2, within the first four steps (whether the deleted order comes back or stays
  gone).
- Takeaways: step 4 (a delete between the markers is an extreme update, never the last word for
  the stale copy), step 6 (a table under heavy concurrent writes still ends in an exact match),
  step 8 (a stopped run and an uninterrupted run end in the identical final state).
- Recap: step 9. Prove it: step 10 (what triggers one table's own snapshot without restarting
  the connector).

## Steps (storyboard)

### 1. Hook
- **fig:** a chunk's own row is read at the same instant a transaction deletes that order;
  without any marker in the log, the snapshot brings the deleted order back.
- **On screen:** a chunk's row entering a buffer at the same moment a streamed delete for the
  same key lands beside it.

### 2. Predict
- **fig:** does the deleted order come back in this chunk's own output, or does it stay gone?
- **Options:** (a) it comes back, since the chunk already read it before the delete happened
  [wrong — a chunk's own read is provisional, not final]; (b) it stays gone, because a marker
  around the chunk lets the delete outrank the stale copy [correct].

### 3. Reveal — the watermark window
- **fig:** a chunk opens with one marker, reads its rows, and closes with a second marker;
  anything touched between the two markers outranks the chunk's own copy.
- **Moves:** two ticks bracketing one chunk's range on the log strip, a buffer filling between
  them.

### 4. Reveal — superseded, measured
- **fig:** the real run: an update inside the window replaces the chunk's own stale copy; a
  delete inside the window removes the row outright, with no resurrection.
- **takeaway:** "A delete between the two markers is an extreme update — the stale chunk copy never gets the last word."

### 5. Reveal — no lock, and the log never waits
- **fig:** the only writes this algorithm makes are the two marker updates; the log keeps
  flowing the entire time, chunk after chunk, with no table lock anywhere.
- **Narrator's line of thought:** she names exactly what the algorithm writes, to make the
  no-lock claim checkable rather than asserted.

### 6. Reveal — the full run, measured
- **fig:** the real run: a whole table copied chunk by chunk, with real updates, deletes and
  inserts fired between every single chunk, diffed against the source at the end.
- **takeaway:** "A table under constant, heavy concurrent writes still comes out an exact match, with no lock at any point."

### 7. Reveal — pausing costs nothing
- **fig:** only the last finished chunk's own position is ever stored; stopping partway through
  and picking up from that position costs nothing extra.
- **Narrator's line of thought:** she contrasts this directly against topic 13's own
  restart-from-zero rule, since the two topics answer the identical question differently.

### 8. Reveal — pause and resume, measured
- **fig:** the real run: one run finishes its chunks without stopping; a second run is stopped
  after its second chunk and later resumes from that exact point; both finish identical.
- **takeaway:** "A run stopped partway through and a run that never stopped end up in the same final state."

### 9. Recap
- **fig:** a window of two markers lets any chunk be superseded by the log, needs no lock, and
  can pause and resume at any chunk boundary.

### 10. Prove it
- **fig:** a table gets added to a running connector after the fact, and nobody wants to stop
  the stream to pick it up. What actually triggers that one table's own snapshot?
- **predict options:** (a) restarting the whole connector, since that is the only way to pick up
  a newly added table [wrong — it would resnapshot everything, not just the missing table]; (b)
  a signal naming that one table, sent to a signalling table or a Kafka signalling topic
  [correct].

## Post-notes headings
- **Internals:** the watermark algorithm, the supersede proof, the full chunked run, and
  pause/resume are all measured directly on this sandbox's own PostgreSQL cluster; Debezium's
  own buffered-window implementation, chunk size, and signal/read-only variants are named only.
- **Production:** the hook's own resurrection scenario and the mistaken assumption that an
  incremental snapshot restarts from zero like an initial one, as the two concrete failure
  shapes this topic exists to prevent.
- **Frontier:** Flink CDC's own parallel chunked-reader framework, named only, since Flink CDC's
  architecture is topic 21's own subject.
- **Where this goes next:** snapshot rows and streamed changes now share one stream, setting up
  the next topic's subject: what order that shared stream actually preserves.

## Concept ledger
- **Introduces:** `watermark-window-incremental-snapshot`.
- **Uses:** `snapshot-stream-handoff`, `snapshot-modes`, `logical-decoding-slot`,
  `parallel-range-extraction` — all confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 13.

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so a real Debezium connector cannot be run to exercise its own
buffered-window implementation, its signal table, its Kafka signalling topic, or its read-only
watermark variants directly — all are named from Debezium's own documentation rather than
reproduced, disclosed in `SOURCES.md` and `FACT-CHECK.md`. The watermark algorithm itself
(DBLog's own Algorithm 1), the supersede-on-collision rule, the no-lock claim, and the
pause-and-resume guarantee are all measured directly against this sandbox's real PostgreSQL 16
cluster with a hand-written implementation, exactly as CHAPTER.md's own "Lab" line asks for.

## Claims list (for fact-check)
1. "Log events continue progress without stalling... The watermark approach does not use
   locks..." — SOURCES.md (DBLog paper); measured directly in `examples.py`.
2. Algorithm 1's own low-watermark/chunk/high-watermark/collision-removal sequence — SOURCES.md
   (DBLog paper); reproduced by construction in `_run_one_chunk`.
3. The default chunk size of 1,024 rows — SOURCES.md (Debezium docs); named only, this topic's
   own chunk sizes are smaller by deliberate choice.
4. "...the snapshot begins at the point where it stopped, rather than recapturing the table
   from the beginning." — SOURCES.md (Debezium docs); measured directly in `examples.py`.
5. Debezium's own buffered collision-resolution rule — SOURCES.md (Debezium docs); the identical
   rule reproduced by hand, not Debezium's own implementation.
6. The PostgreSQL schema-change limitation during an incremental snapshot — SOURCES.md
   (Debezium docs); named only, not exercised.
7. `data-collections`/`additional-conditions`/`stop-snapshot` signal fields — SOURCES.md
   (Debezium docs); named in the reel's own predict question.
8. The PostgreSQL and MySQL read-only watermark sources (transaction ID vs. GTID) — SOURCES.md
   (Debezium docs); named only, no MySQL server in this sandbox.
