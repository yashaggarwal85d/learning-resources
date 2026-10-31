# Fact-check — de.database-extraction-without-hurting

## Claims re-derived against the source

1. **Spark's `lowerBound`/`upperBound` set the partition stride, not a row filter.** SOURCES.md's
   quote supports this directly: "lowerBound and upperBound are just used to decide the partition
   stride, not for filtering the rows in table." Checked that step 3's figure and step 4's
   takeaway both state this as "every row is still partitioned and returned," matching the quote's
   own wording, and that the predict in step 2 is ruled out exactly because of this — a
   `numPartitions`-sized equal share is only true if the bounds filtered, which they don't.
2. **`fetchsize` is described as the setting that helps a driver whose own default round-trip
   size is small.** SOURCES.md's quote supports this directly ("helps performance on JDBC drivers
   which default to low fetch size"). This topic names it on screen as a setting, never claims a
   specific pgjdbc default beyond what `examples.py` measures directly (this topic does not tune
   `fetchsize` itself — the measured `COPY`-vs-`SELECT` comparison in step 6 uses `psycopg`'s own
   defaults, disclosed as such, not a claim about pgjdbc specifically).
3. **`COPY` moves data between tables and files.** SOURCES.md's quote supports this directly. The
   topic's own claim — that `COPY TO` measured faster than row-by-row `SELECT` over the same
   50,000 rows — is not from the source at all; it is `examples.py`'s own direct measurement
   (`copy_vs_select_throughput`), re-run and reproduced: every trial this session showed `SELECT`
   taking longer, by a factor that varied with OS page-cache state but never dropped below the
   checked threshold.
4. **`pg_export_snapshot()` saves a snapshot that a second transaction can import and see the
   same data from.** SOURCES.md's quote supports this directly. Checked step 5's own run
   (`consistent_snapshot_export`) against the quote's claim precisely: the exporting transaction
   saw 50,000 rows, the importing transaction saw the identical 50,000 despite a real concurrent
   insert committing in between, and only a later, fresh connection (no snapshot) saw 50,001 —
   exactly the behavior the quote describes.
5. **`hot_standby_feedback` trades standby query cancellations for delayed primary cleanup.**
   SOURCES.md's quote supports this directly ("prevents VACUUM from removing recently-dead rows
   ... this will delay cleanup of dead rows on the primary"). Step 7's framing ("moving the cost,
   not removing it") does not claim `hot_standby_feedback` was itself run in this topic's lab (it
   requires a second node); it instead treats the vacuum-pinning mechanism step 8 measures
   directly on the primary — a long transaction holding back cleanup — as the *same* mechanism the
   quote names for a standby's feedback, which is accurate: both pin the vacuum horizon to a
   transaction (or replica) that still needs the old row versions.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("each partition gets roughly an equal share") is a
  genuine, common first assumption about what `numPartitions` controls — but it's ruled out
  directly against claim 1's own quote: the bounds are a stride over the id range, not a filter
  that could enforce an equal row share. The correct option follows from the same quote.
- **Predict 2 (step 10, "Prove it"):** checked that "more partitions proportionally shrinks the
  slowest partition's share" is ruled out against the measured fact itself (`examples.py`'s
  `parallel_range_extraction` run with different partition counts): the skew lives in the data's
  distribution, not in how many pieces the id range is cut into, so a few of the narrower strides
  near the top of the range still absorb most of the 48,000 clustered rows. This is a direct
  consequence of the already-verified claim 1, not a new, unsourced claim.

## Illustrative numbers (figs for steps 1, 4, 6, 8, 10)

The specific id counts (2,000 low ids, 48,000 clustered high ids, fifty thousand total rows), the
sixteen- and sixty-four-partition configurations, the "hour three" framing in the hook, and the
10,000-row update batch in step 8 are the builder's own synthetic `orders` table on this sandbox's
real PostgreSQL 16 cluster, run and measured directly in `examples.py` — not a cited industry
incident or a real company's numbers. The `COPY`-vs-`SELECT` timing ratio varies run to run with
OS page-cache state; the topic discloses it as "measured, this run" rather than a fixed constant,
consistent with the checked assertion's lower-bound threshold rather than an exact figure.

## Outcome

No open findings. Every claim about what Spark's JDBC bounds and `fetchsize` option do, what
`COPY` is, what `pg_export_snapshot()` guarantees, and what `hot_standby_feedback` trades away
traces to one of SOURCES.md's five verbatim quotes across two sources (Spark's own current docs,
PostgreSQL's own current docs); every measured number (the partition skew, the snapshot
consistency, the `COPY` speedup, the vacuum-pinning effect) is `examples.py`'s own direct
measurement against a real PostgreSQL 16 cluster, reproduced in this session; both predicts are
checked against the topic's own cited mechanism and its own measured data, not invented reasoning.
