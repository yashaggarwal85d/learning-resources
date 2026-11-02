# OUTLINE: Initial snapshot to stream handoff (`de.initial-snapshot-stream-handoff`)

## Learning outcomes
1. Export a consistent snapshot at a slot's own starting position and import it in a second
   session via `SET TRANSACTION SNAPSHOT`.
2. Prove no gap and no overlap, both by construction and by a real measured experiment.
3. Name the snapshot modes and what each does on a connector restart.
4. Explain why a mid-snapshot crash restarts the whole snapshot, and what that costs on a huge
   table.

## Engagement arc
- Hook: step 1 (a connector killed most of the way through snapshotting a huge table restarts
  from zero, while the slot behind it keeps pinning WAL the entire time).
- Predict: step 2, within the first four steps (whether a mostly-complete snapshot resumes or
  restarts entirely).
- Takeaways: step 4 (the exported snapshot is pinned to the slot's own starting point), step 6
  (a row the snapshot misses, the stream catches exactly once), step 8 (discarding a killed
  attempt and starting clean still ends in an exact match).
- Recap: step 9. Prove it: step 10 (choosing a snapshot mode for a connector that only ever
  needs rows still in the log).

## Steps (storyboard)

### 1. Hook
- **fig:** a connector is killed most of the way through snapshotting a huge table; on restart
  the progress bar snaps back to empty while the retained-WAL bar from topic 12 keeps climbing.
- **On screen:** a progress bar collapsing to zero beside a WAL-retention bar that never stops
  climbing.

### 2. Predict
- **fig:** on restart, does the snapshot pick up close to where it was killed, or does it begin
  again from the very first row?
- **Options:** (a) it resumes close to where it was killed, since most of the work was already
  done [wrong — nothing before the very last step is ever recorded, so there is nothing to
  resume from]; (b) it begins again from the very first row, because nothing short of the last
  step ever marked it complete [correct].

### 3. Reveal — completion is recorded only at the end
- **fig:** a snapshot's own workflow reads the log position, scans every row, and only then
  marks itself done; a kill at any earlier point leaves nothing recorded at all.
- **Moves:** a workflow sequence with its final step lit, every earlier step shown as leaving no
  trace.

### 4. Reveal — the exported snapshot, measured
- **fig:** the real run: a slot's own exported snapshot read in a second session, checked
  against a row written right after the slot existed.
- **takeaway:** "The exported snapshot shows exactly the database's state at the slot's own start — nothing written after it."

### 5. Reveal — no gap and no overlap, by construction
- **fig:** the snapshot position and the stream's own start position are the same point in the
  log, by construction, not by coincidence.
- **Narrator's line of thought:** she draws the seam once, as one point, to show the two halves
  of the handover were never two separate claims needing two separate guarantees.

### 6. Reveal — no gap and no overlap, measured
- **fig:** the real run: a row written during the snapshot, missing from the snapshot's own
  dump, present in the decoded stream exactly once.
- **takeaway:** "A row the snapshot misses, the stream catches once — not zero times, and never twice."

### 7. Reveal — the kill-mid-snapshot lab
- **fig:** a hand-written loop copies a source table into a target row by row and is killed on
  purpose partway through, leaving a target table that is real and only partly filled.
- **Narrator's line of thought:** she treats the kill as a genuine event, not a simulated flag,
  since the whole point of the lab is that nothing about the failure is staged.

### 8. Reveal — the restart, measured
- **fig:** the real run: the killed attempt's partial rows discarded, a fresh attempt starting
  at row one, the final target diffed row for row against the source.
- **takeaway:** "Throwing away a killed attempt and starting clean still ends in an exact match — no gap, no overlap."

### 9. Recap
- **fig:** a crash before the last step restarts the whole snapshot; the exported snapshot and
  the stream share one seam; several modes decide what a restart does.

### 10. Prove it
- **fig:** a brand-new connector, one just restarted, and one recovering from a gap each want a
  different snapshot mode. Which fits a connector that only ever needs fresh rows, never the old
  ones?
- **predict options:** (a) `initial_only`, since it snapshots once and then deliberately stops
  [wrong — it still performs a full snapshot before stopping]; (b) `no_data`, since it skips the
  snapshot entirely and streams straight from the slot's own creation point [correct].

## Post-notes headings
- **Internals:** the exported-snapshot mechanism, the no-gap-no-overlap proof, and the
  kill-mid-snapshot restart are all measured directly on this sandbox's own PostgreSQL cluster;
  the MySQL lock alternative and chunk-based parallel snapshotting are named only.
- **Production:** the hook's own scenario (a restarted connector redoing a huge snapshot from
  zero) and the `pg_export_snapshot()` versus slot-export distinction, as the two concrete
  failure shapes this topic exists to prevent.
- **Frontier:** chunk-based parallel snapshotting (`snapshot.max.threads`), incubating in
  Debezium 3.7, named only, since the actual chunking algorithm is topic 14's own subject.
- **Where this goes next:** the snapshot's weakness (a crash throws it away and a table added
  later needs the whole ceremony) sets up Netflix's DBLog fix: chunked snapshots interleaved
  with the live log.

## Concept ledger
- **Introduces:** `snapshot-stream-handoff`, `snapshot-modes`.
- **Uses:** `logical-decoding-slot`, `consistent-snapshot-export`, `snapshot-isolation`,
  `slot-wal-retention-incident` — all confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 12.

## Changes from the chapter plan
This sandbox has no MySQL, Oracle or SQL Server server (confirmed absent in topic 11) and no
JVM/Kafka to run Debezium itself, so the MySQL global-read-lock sequence and the specific
behaviour of each snapshot mode under a real connector are named from Debezium's own
documentation rather than independently reproduced — disclosed in `SOURCES.md` and
`FACT-CHECK.md`. Everything else CHAPTER.md's own scope line names (the exported-snapshot
mechanism, the no-gap-and-no-overlap proof, and the kill-mid-snapshot restart rule) is measured
directly against this sandbox's real PostgreSQL 16 cluster using a real replication-protocol
connection, confirmed working by direct experiment before any topic content was written (a
plain `pg_create_logical_replication_slot()` SQL call does not behave like the replication
protocol's own `CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT`).

## Claims list (for fact-check)
1. "...a snapshot is exported..., which will show exactly the state of the database after which
   all changes will be included in the change stream." — SOURCES.md (PostgreSQL docs); measured
   directly in `examples.py`.
2. `pg_export_snapshot()`'s own scope (a session's snapshot, not a slot's) — SOURCES.md
   (PostgreSQL docs); named for contrast, not used in any measurement.
3. The exported snapshot's own lifetime rule (valid until a new command or a closed connection)
   — SOURCES.md (PostgreSQL docs); confirmed by direct experiment before writing any content.
4. "If the connector fails,... upon restart the connector begins a new snapshot." — SOURCES.md
   (Debezium docs); reproduced by construction with a genuinely killed hand-written loop.
5. `initial_only`, `no_data`, `when_needed` mode descriptions — SOURCES.md (Debezium docs);
   named in the reel's own predict question, not independently reproduced (no JVM/Kafka here).
6. The MySQL global-read-lock versus table-level-lock contrast — SOURCES.md (Debezium docs);
   named only, no MySQL server in this sandbox.
