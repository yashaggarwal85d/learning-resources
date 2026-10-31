# Fact-check — de.incremental-extraction-high-watermark

## Claims re-derived against the source

1. **`transaction_timestamp()`/`now()` return a transaction's own fixed start time.** SOURCES.md's
   quote supports this directly. `examples.py`'s `late_committing_transaction_miss` measures this
   exactly: the transaction's own `transaction_timestamp()` is captured once at its start and the
   row it later updates is stamped with that same value, confirmed less than the watermark the
   cursor advanced to during the run.
2. **`clock_timestamp()` is the contrasting function that does change within a transaction.** Not
   used in `examples.py` (this topic measures the fixed-timestamp behavior, not the contrast
   function directly), but named correctly in step 3's reveal as the alternative PostgreSQL
   itself documents, not an invented contrast.
3. **A `nextval()` value is never reclaimed on rollback.** SOURCES.md's quote supports this
   directly. Step 5's claim that sequence ids "need not reflect commit order" follows directly: a
   transaction that calls `nextval()` early but commits late holds a low id that a later-committing,
   earlier-calling transaction's higher id has already passed — this is a direct logical
   consequence of the quoted non-reclaiming behavior, not independently measured in `examples.py`
   (which focuses on the `updated_at` cursor family this chapter's lab actually builds).
4. **A hard delete leaves nothing for an `updated_at` cursor to find.** Not from an external
   source — this is `examples.py`'s own direct measurement (`hard_delete_is_invisible_to_a_cursor`):
   the source's row count drops by one, and a cursor query for that exact id after the deletion's
   own watermark returns nothing, confirming there is no signal at all.
5. **An idempotent merge is safe to repeat.** Not from an external source — `examples.py`'s own
   measurement (`idempotent_merge_is_safe_to_repeat`): the same `INSERT ... ON CONFLICT DO UPDATE`
   run three times in a row leaves the row count at exactly one, every time.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a row updating twice in one run") is a genuine first
  guess about what might confuse a cursor, but it's ruled out directly against claim 5: repeating
  a read of the same row through an idempotent merge is exactly the case this topic shows causing
  no harm at all. The correct option (a hard delete) follows from claim 4's own measured fact:
  there is categorically no timestamp signal for a cursor to query.
- **Predict 2 (step 10, "Prove it"):** checked against the plain mechanics of how `updated_at` is
  set — it is a column value written by whatever touches the row (typically an application
  trigger or an explicit assignment), never something the database updates automatically on any
  `UPDATE`. A bulk `UPDATE` that writes every column except `updated_at` leaves the old timestamp
  in place, which is mechanically identical to claim 4's hard-delete case: no timestamp signal,
  so no cursor can see the change. This is a direct consequence of how the column itself works,
  not an invented new mechanism.

## Illustrative numbers (figs for steps 1, 4, 7)

The hook's "off by a handful of rows," the specific one-second delay used to reproduce the
late-committing transaction in `examples.py`, and the "margin shorter than the slowest
transaction" framing in step 7 are the builder's own synthetic reproduction on this sandbox's real
PostgreSQL 16 cluster — not a cited real incident's numbers. The mechanism itself (a transaction's
timestamp fixed at start, a cursor's watermark advancing past it, lookback catching it,
idempotent merge absorbing the repeat) is measured directly and reproducibly, not illustrative.

## Outcome

No open findings. Every claim about what `transaction_timestamp()`/`now()` and `nextval()` do
traces to one of SOURCES.md's four verbatim quotes across two PostgreSQL documentation pages; the
hard-delete and idempotent-merge claims are `examples.py`'s own direct, reproducible measurements
against a real database; both predicts are checked against the topic's own cited mechanism and
measured facts, not invented reasoning.
