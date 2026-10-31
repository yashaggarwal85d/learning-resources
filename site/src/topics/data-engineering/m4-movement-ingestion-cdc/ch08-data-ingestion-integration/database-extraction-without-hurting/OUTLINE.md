# OUTLINE: Database extraction without hurting production (`de.database-extraction-without-hurting`)

## Learning outcomes
1. Configure a parallel JDBC extract and predict, from the bounds and the key's distribution, how
   many partitions do the real work.
2. Export a multi-table snapshot that stays consistent across workers despite a concurrent commit.
3. Choose between the primary, a replica and `COPY` for an extract, and say what each costs the
   source.
4. Show the vacuum side effect of a long extract, measured, and say when it clears.

## Engagement arc
- Hook: step 1 (sixteen partitions configured, one still running at hour three, while the
  primary's disk fills with dead tuples).
- Predict: step 2, within the first four steps (which partition does the real work, from the key's
  own shape, not from `numPartitions`).
- Takeaways: step 4 (the bounds decide stride, not filter), step 6 (`COPY` measured faster than
  row-by-row `SELECT`), step 8 (a long extract's snapshot pins cleanup until it ends, measured).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a nightly extract with `numPartitions = 16` against `orders`' real, skewed id
  distribution; one partition is still running at hour three while the primary's dead-tuple count
  climbs behind it.
- **On screen:** sixteen lanes, fifteen finished, one still filling, with a vacuum gauge rising
  underneath.

### 2. Predict
- **fig:** the key is skewed (2,000 low ids, 48,000 clustered into one high range). With sixteen
  equal-width partitions over the full id range, which partition does the real work?
- **Options:** (a) each of the sixteen partitions gets roughly a 50,000/16 share, since
  `numPartitions` is how many pieces Spark cuts the job into [wrong — the bounds only set the
  stride, not a filter; every row still lands in whichever stride its id falls into]; (b) nearly
  all 48,000 clustered rows land in one partition, because the stride is a fixed width over the id
  range, not a fixed row count [correct].

### 3. Reveal — four positions, bounds as stride not filter
- **fig:** the `partitionColumn`/`lowerBound`/`upperBound`/`numPartitions` bounds drawn as sixteen
  equal-width slices over the full id range `[1, 1,050,000)`, with `orders`' real id histogram
  overlaid.
- **Moves:** the sixteen slices light up one at a time; the histogram bars are visibly empty under
  fifteen of them and one tall spike under the last.

### 4. Reveal — the measured skew
- **fig:** the real sixteen-partition count against `orders` (50,000 rows: 2,000 with low ids,
  48,000 clustered high): one partition gets 2,000 rows, fourteen get zero, one gets 48,000.
- **takeaway:** "The bounds decide the stride, not a row filter — every row is still partitioned and returned, so a clustered key sends nearly all of them into one slice."

### 5. Reveal — a consistent snapshot across workers
- **fig:** one transaction exports its snapshot with `pg_export_snapshot()`; a second worker
  imports it with `SET TRANSACTION SNAPSHOT`; a concurrent insert commits from a third connection
  in between and neither worker sees it — only a later, fresh connection does.
- **Narrator's line of thought:** she treats the export/import pair as what makes "one moment,
  many tables" literally true, not a looser guarantee.

### 6. Reveal — `COPY` against row-by-row `SELECT`, measured
- **fig:** the same 50,000 rows read two ways: a row-by-row `SELECT ... fetchall()` against a
  `COPY ... TO stdout`, best of several real trials each.
- **takeaway:** "COPY measured faster than a row-by-row SELECT over the same rows, every trial — the bulk path is the one to reach for first."

### 7. Reveal — a replica, and what `hot_standby_feedback` actually costs
- **fig:** the same extract run against a standby instead of the primary; without
  `hot_standby_feedback` a long query risks cancellation when `VACUUM` on the primary removes rows
  it still needs; with it, cancellation stops but the primary's own cleanup is now held back for
  the standby's benefit.
- **Narrator's line of thought:** she treats this as moving the cost, not removing it — the same
  bloat this topic measures on the primary directly in step 8 is what `hot_standby_feedback` can
  import from a replica's slow query instead.

### 8. Reveal — the vacuum side effect, measured directly
- **fig:** a long `REPEATABLE READ` extract left open while 10,000 rows are updated elsewhere;
  dead tuples climb to 10,000 and a real `VACUUM` run while the extract is still open reclaims
  none of them; only after the extract commits does the next `VACUUM` bring the count back to
  zero.
- **takeaway:** "A long extract's own open snapshot pins cleanup on the table it's reading, measured directly — not reclaimed until the extract ends, whatever VACUUM does in between."

### 9. Recap
- **fig:** the four moves side by side: bounds as stride not filter, a shared snapshot across
  workers, `COPY` ahead of row-by-row reads, and the vacuum cost a long extract leaves behind.

### 10. Prove it
- **fig:** the same extract, configured with `numPartitions = 64` instead of 16, over the same
  skewed key.
- **predict options:** (a) more partitions means more parallelism, so the slowest partition's
  share shrinks proportionally [wrong — the skew is in the data, not the partition count; a
  narrower stride over the same clustered range still puts most of the 48,000 rows in whichever
  few slices land on that range]; (b) the slowest partition is still dominated by however many of
  the clustered 48,000 rows fall inside its narrower stride, so more partitions helps far less than
  the count alone suggests [correct].

## Post-notes headings
- **Internals:** none claimed independently — PostgreSQL's MVCC and vacuum mechanism (Chapter 5
  topic 7) and snapshot isolation (Chapter 5 topic 12) are composed, not re-taught; the pgjdbc
  driver's own result-set-streaming behaviour under `fetchsize` and `autocommit` is named as a
  detail the builder measured directly because it is not in Spark's own docs.
- **Lab:** none of its own as a separate syllabus lab leg — this topic's parallel read, snapshot
  export and dead-tuple measurement feed the 8.1 chapter lab (topic 3) as the "full extract"
  baseline, per `CHAPTER.md`'s lab-hosting table.
- **Production:** the hook's own scenario (a skewed key defeating a partition count chosen without
  looking at the data) as the concrete shape "the bounds are a stride, not a filter" takes in
  practice.
- **Frontier:** none claimed — parallel JDBC reads, snapshot export and `COPY` are each
  established practice, not an emerging technique.
- **Where this goes next:** a full extract is safe but repeats all the work every run. The next
  topic asks the obvious question: read only what changed since last time, and the cursor that
  promises that has a famous bug.

## Concept ledger
- **Introduces:** `parallel-range-extraction`, `consistent-snapshot-export`.
- **Uses:** `connection-pool-sizing` (Chapter 4 topic 8), `vacuum-xid-wraparound` (Chapter 5 topic
  7), `snapshot-isolation` (Chapter 5 topic 12), `physical-vs-logical-replication` (Chapter 5
  topic 18), `ingestion-modes-ownership` (topic 1) — all confirmed live by parsing `registry.ts`'s
  `introduces` arrays into a set and checking each id.
- **Declared:** `sql-select` (per `CHAPTER.md`; basic familiarity assumed, not sourced).

## Changes from the chapter plan
None. All five named `uses` ids resolve live in `registry.ts` (verified by script), so none move
to `declared` beyond the one `CHAPTER.md` itself already names (`sql-select`). The chapter's own
lab-hosting table assigns this topic no lab leg of its own; its measurements (partition skew,
snapshot consistency, `COPY` throughput, vacuum effect) feed topic 3's lab as the full-extract
baseline, exactly as planned.

## Claims list (for fact-check)
1. Spark's JDBC `lowerBound`/`upperBound` set the partition stride, not a row filter — every row
   is still partitioned and returned. — SOURCES.md (Spark JDBC docs).
2. Spark's JDBC `fetchsize` option's description and default. — SOURCES.md (Spark JDBC docs).
3. PostgreSQL's `COPY` moves data between tables and files; measured here as the faster bulk-read
   path against row-by-row `SELECT`. — SOURCES.md (PostgreSQL `COPY` docs) + `examples.py`.
4. `pg_export_snapshot()` saves a transaction's snapshot as an importable identifier, letting a
   second transaction see the same data. — SOURCES.md (PostgreSQL admin functions docs) +
   `examples.py`.
5. `hot_standby_feedback` prevents `VACUUM` from removing recently-dead rows a standby query might
   need, at the cost of delaying cleanup on the primary — the same mechanism this topic measures
   directly for a long extract on the primary itself. — SOURCES.md (PostgreSQL hot-standby docs) +
   `examples.py`'s vacuum measurement.
