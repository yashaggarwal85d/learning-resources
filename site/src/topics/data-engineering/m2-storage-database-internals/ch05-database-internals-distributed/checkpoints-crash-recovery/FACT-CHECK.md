# Fact-check — de.checkpoints-crash-recovery

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A checkpoint guarantees every dirty page as of that point is flushed; crash recovery never needs to look further back than the latest checkpoint's redo record. | Confirmed | `sources/wal-configuration.txt`, quoted verbatim ("the crash recovery procedure looks at the latest checkpoint record to determine the point in the WAL... known as the redo record"). |
| 2 | Reducing `checkpoint_timeout`/`max_wal_size` → more frequent checkpoints → faster crash recovery, at the cost of more frequent page flushing and, with `full_page_writes` on, more full-page images per unit of wall time. | Confirmed | `sources/wal-configuration.txt`, quoted verbatim. |
| 3 | `full_page_writes` logs the entire page content on the first modification of a page after each checkpoint. | Confirmed | `sources/wal-configuration.txt`, same quote as claim 2. |
| 4 | Postgres describes its own crash recovery as a single roll-forward/REDO operation from the WAL; its documentation never describes a separate pass that physically undoes an uncommitted transaction's changes. | Confirmed | `sources/wal-intro.txt`, quoted verbatim ("roll-forward recovery, also known as REDO"); corroborated by `sources/transam-readme.txt` (grepped directly: the word "undo" does not appear anywhere in Postgres's own WAL-record internals README, across 700+ lines describing how REDO routines work). |
| 5 | ARIES defines three passes — analysis, redo, undo — where undo physically rolls back transactions still in progress ("losers") at crash time. | Confirmed, sourced-only (not independently reproduced) | Mohan et al. 1992 (`sources/aries-paper.txt`), named by full reference, not block-quoted — the OCR is positionally scrambled by the paper's two-column layout (confirmed: a legible fragment of the paper's own comparison table states "DB2 makes three passes (analysis, redo, and then undo)," which is internally consistent with the well-established, uncontested standard description of ARIES in the database-systems literature, but the running prose around it cannot be quoted word for word with confidence). |
| 6 | This topic's own measurement: checkpointing every round (10 rounds) vs. checkpointing once before 10 identical rounds, on a 2000-row table, produces far more full-page images in the frequent case and a far smaller live replay gap. | Confirmed, direct measurement | `examples.py`; real run: 1267 vs. 66 full-page images, ~1.42 MB vs. ~9.6 MB replay gap, repeated across 3 runs with the same shape each time. |
| 7 | Point-in-time recovery stops WAL replay before the end, producing a consistent snapshot at any time since the base backup. | Confirmed | `sources/continuous-archiving.txt`, quoted verbatim. |
| 8 | Physical replication ships the same WAL bytes to a standby, which continuously applies them (the same REDO path) against its own copy of the files. | Confirmed | `sources/warm-standby.txt`, quoted verbatim ("the server continuously applies WAL received from the primary server"). |
| 9 | Logical decoding reads the same WAL stream and decodes it into row-level changes rather than raw page bytes. | Confirmed | `sources/logicaldecoding.txt`, quoted verbatim ("logical decoding is implemented by decoding the contents of the write-ahead log... into an application-specific form such as a stream of tuples or SQL statements"). |
| 10 | `pg_control_checkpoint()`'s `redo_lsn` is exactly the point crash recovery would resume replay from if the server crashed right now; the gap to `pg_current_wal_lsn()` is a live, direct measurement of how much WAL a crash this instant would force a replay of. | Confirmed, direct measurement | `examples.py`; both functions directly query `pg_control_checkpoint()` and `pg_current_wal_lsn()` and subtract the two `pg_lsn` values as the replay-gap byte count — not an estimate, the same subtraction Postgres's own LSN arithmetic performs. |

## Red team

- **Does the "frequent vs. infrequent checkpoint" measurement actually isolate the checkpoint
  knob, or just measure "more checkpoints happened to run longer"?** Both runs touch the
  identical table shape (2000 rows, same payload size) and the identical number of update
  rounds (10); the only variable is whether a `CHECKPOINT` is issued after each round or once up
  front. The `fpi_total` and `replay_gap` are each measured as a delta (`after - before`) around
  exactly the 10-round window, not as a cumulative count from server start, so neither number can
  be inflated by unrelated background checkpointing activity.
- **Is the `>= N_ROUNDS * 0.5` scale assertion too loose to mean anything?** It's a deliberately
  conservative floor (an order-of-magnitude check, not a tight bound) chosen because the exact
  ratio depends on autovacuum being off and no concurrent load on the shared sandbox cluster —
  both controlled for (`autovacuum_enabled = off` on the table, single-threaded script) but not
  something this topic should claim perfect reproducibility for down to the exact byte. The real
  run's actual ratios (19x and ~7x) are comfortably inside the asserted floor, so the assertion
  is not doing the work of making the claim true — the real numbers already clear it by a wide
  margin.
- **Is claim 4 ("Postgres never undoes a page") actually falsified by anything in its own
  internals README?** Grepped `transam-readme.txt` specifically for "undo" — zero matches across
  the entire file, including its detailed discussion of what a REDO routine must and must not do.
  This is evidence by absence, which is weaker than a positive statement, but the positive
  statement from `wal-intro.txt` (crash recovery is described as *only* roll-forward/REDO) is the
  real evidence; the grep is corroboration, not the primary claim.
- **Predict question (step 4, torn page) wrong-answer trap.** The tempting wrong answer ("the WAL
  format doesn't support partial-page diffs") misattributes the defense to a format limitation
  rather than a physical one; the real reason (a disk write isn't atomic at the page level, only
  typically at the sector level) is what makes a *correct* delta-only log insufficient on its own
  — the delta would be internally consistent, but applying it to a torn page's mixed old/new
  state could still produce garbage, which is exactly why a full, known-good page image is
  needed as the before-state instead.
- **"Prove it" step 10 — is option C a fair wrong answer?** Option C ("it must be using an undo
  pass instead of redo") tests whether a learner confuses *which* pass count bounds replay
  distance. Undo vs. redo-only (claims 4–5) is a structural difference in recovery, but neither
  by itself caps *how far back* recovery looks — that's the checkpoint's job (claims 1–2). A
  learner who picks C has learned the redo/undo distinction from steps 7 but not connected it
  correctly to what actually bounds replay time; the explain text for this step makes the
  distinction explicit.
- **Are claims 8 and 9 overclaiming "the same mechanism" when replication and logical decoding
  are genuinely different features?** The claim is narrowly that both read/consume the *same WAL
  stream* this topic's checkpoint mechanism bounds — not that replication and logical decoding
  are identical to each other. `warm-standby.txt` confirms physical replication applies the raw
  WAL continuously; `logicaldecoding.txt` confirms logical decoding decodes the same WAL's
  contents into a different output shape. Both are accurate, narrow claims about the same
  underlying log, not a claim that the two features are interchangeable.

## Corrections applied to OUTLINE.md

- Claims 8 and 9 were originally drafted as "sourced-only, not independently quoted" placeholders
  before this fact-check stage fetched real Postgres documentation for both (`warm-standby.txt`,
  `logicaldecoding.txt`). OUTLINE.md's claims list and SOURCES.md were both updated to cite real,
  verbatim quotes instead of leaving them as unverified convention. No other claim required a
  correction or a drop — all ten survived the red team with their original wording.
