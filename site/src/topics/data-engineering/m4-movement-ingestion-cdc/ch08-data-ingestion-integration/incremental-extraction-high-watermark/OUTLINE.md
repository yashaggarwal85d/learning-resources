# OUTLINE: Incremental extraction with high-watermark cursors (`de.incremental-extraction-high-watermark`)

## Learning outcomes
1. Reproduce the four ways an `updated_at` cursor misses a row and show the commit-order timeline
   for each.
2. Size a lookback window from the longest transaction and measure what it still misses.
3. Combine lookback with an idempotent merge and prove a re-run changes nothing.
4. State precisely when a cursor is the wrong tool.

## Engagement arc
- Hook: step 1 (a row-count reconciliation is off, and nothing in the cursor's own log explains
  why).
- Predict: step 2, within the first four steps (what kind of thing can an `updated_at` cursor
  never see, no matter how it's tuned).
- Takeaways: step 4 (commit order is not timestamp order, reproduced for real), step 6 (lookback
  plus idempotent merge is the fix, also reproduced for real), step 8 (a hard delete is the one
  miss no lookback repairs).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a nightly row-count reconciliation between the source and the warehouse is off by a
  handful of rows, and nothing in the cursor's own run log explains why — every run reported
  success.
- **On screen:** two counts side by side, a small gap between them, and a question mark where an
  error would be.

### 2. Predict
- **fig:** an `updated_at` cursor only ever asks for rows newer than its watermark. Which kind of
  change can it never detect, no matter how the watermark is tuned?
- **Options:** (a) a row that updates twice in one run — the cursor just re-reads it twice, which
  is harmless [wrong — a repeat read of an unchanged-since-watermark row is exactly what an
  idempotent merge is built to absorb]; (b) a row deleted outright, since there's no `updated_at`
  left on a row that no longer exists [correct].

### 3. Reveal — the mechanism, live
- **fig:** `transaction_timestamp()` is fixed at a transaction's own start and never advances
  while it runs; a slow transaction that starts before a cursor run and commits after it stamps
  its row with a time already behind the new watermark.
- **Moves:** a transaction bar starts before the watermark line, stays open through the cursor's
  run, and only commits after — its own timestamp sits to the left of the line it should be past.

### 4. Reveal — reproduced for real, on this sandbox
- **fig:** the real run: a cursor run finds nothing while the slow transaction is still open,
  advances its watermark to the run's own clock time anyway, and the transaction's row — stamped
  with its own earlier start time — is missed by every later strict run.
- **takeaway:** "Commit order is not timestamp order — a transaction stamps its row at its own start, which a cursor's watermark can already be past by the time it commits."

### 5. Reveal — sequence ids are not commit order either
- **fig:** a `nextval()` value, once handed out, is never given back even if its own transaction
  rolls back — gaps and out-of-order commits are both possible with a sequence cursor too.
- **Narrator's line of thought:** she treats this as the same family of bug as step 4's, not a
  separate one — whatever hands out the cursor's own ordering can disagree with commit order.

### 6. Reveal — lookback plus idempotent merge, reproduced
- **fig:** the same missed row, caught by re-reading a short margin behind the watermark; an
  idempotent merge (`INSERT ... ON CONFLICT DO UPDATE`, keyed on the primary key) run three times
  on the same re-read leaves the row count and its own data completely unchanged.
- **takeaway:** "A lookback window catches a late commit on the next run, and an idempotent merge makes repeating that re-read completely harmless."

### 7. Reveal — sizing the lookback
- **fig:** the lookback margin has to be at least as long as the slowest transaction this source
  ever runs; a margin shorter than that still misses exactly the slow commits it was sized for.
- **Narrator's line of thought:** she treats the lookback size as a measured property of the
  source's own transactions, not a round number picked by feel.

### 8. Reveal — the one miss lookback cannot fix
- **fig:** a row deleted outright leaves no `updated_at` behind at all; the source's own row count
  drops by one and the cursor's next run reports nothing, because there is nothing left with a
  timestamp to find.
- **takeaway:** "A hard delete is invisible to any updated_at cursor, lookback or not — only a full reconciliation against the source catches it."

### 9. Recap
- **fig:** the four miss modes side by side (commit order, sequence gaps, clock skew, hard
  deletes), the lookback-plus-merge fix, and the one miss it cannot touch.

### 10. Prove it
- **fig:** a bulk `UPDATE` run directly against the database (bypassing the application and its
  trigger) that never touches `updated_at` at all.
- **predict options:** (a) the cursor still catches it next run, because any `UPDATE` bumps a
  row's own last-modified time automatically [wrong — `updated_at` is only ever set by whatever
  wrote it, usually an application-level trigger or explicit column write; a bulk `UPDATE` that
  skips that column leaves the old timestamp in place]; (b) the cursor misses it exactly like a
  hard delete — there is no timestamp signal that anything changed at all [correct].

## Post-notes headings
- **Internals:** none claimed independently — the full-extract baseline (topic 2) and Chapter 5
  topic 11's own isolation-anomalies topic are composed, not re-taught; `MERGE`'s own atomicity
  (Chapter 2 topic 9) is used exactly as documented.
- **Lab:** hosts the Postgres half of the 8.1 chapter lab per `CHAPTER.md`'s lab-hosting table —
  the late-committing transaction, the lookback-and-merge fix and the hard-delete miss are this
  topic's own executable evidence; the REST half is topic 4's.
- **Production:** the hook's own scenario (a passing cursor run that silently misses rows) as the
  concrete shape "commit order is not timestamp order" takes in practice.
- **Frontier:** none claimed — cursor-based incremental extraction, lookback windows and
  idempotent merges are each established practice.
- **Where this goes next:** a cursor works only when the source is a database that can be queried
  this way. Many sources are not: a vendor's REST API, with its own pagination, limits and
  failures, is the next shape of the same problem.

## Concept ledger
- **Introduces:** `high-watermark-cursor`, `cursor-miss-modes`, `lookback-idempotent-merge`.
- **Uses:** `merge-statement`, `upsert-atomicity` (Chapter 2 topic 9), `idempotent-merge-load`
  (Chapter 3 topic 13), `parallel-range-extraction` (topic 2), `isolation-anomalies` (Chapter 5
  topic 11) — all confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 2.

## Changes from the chapter plan
None. All five named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. `transaction_timestamp()` and `now()` return a transaction's own start time, fixed for the
   whole transaction. — SOURCES.md (PostgreSQL date/time functions).
2. `clock_timestamp()` returns the actual current time and changes even within one statement,
   unlike `transaction_timestamp()`/`now()`. — SOURCES.md (PostgreSQL date/time functions).
3. A `nextval()` value is never reclaimed even if its transaction aborts, so sequence ids can gap
   and need not reflect commit order. — SOURCES.md (PostgreSQL sequence functions).
4. A hard delete leaves no `updated_at` behind for a cursor to find, measured directly in
   `examples.py`. — `examples.py`'s own run.
5. An idempotent merge (`INSERT ... ON CONFLICT DO UPDATE`) is safe to repeat any number of
   times, measured directly in `examples.py`. — `examples.py`'s own run.
