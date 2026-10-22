# Fact-check — de.late-arriving-facts-dimensions

Re-derived from the fetched source texts, re-verified word for word (`node scripts/sources.mjs check`, 0 problems, 5 quotes).

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | An unresolved late-arriving fact's dimension row is a placeholder with unresolved natural key and generic unknown values, resolved later by a Type 1 overwrite | Confirmed, quoted directly | Kimball "Late Arriving Dimension" |
| 2 | A retroactive Type 2 change is also late-arriving dimension data: a new row, plus fact restatement | Confirmed, quoted directly | Kimball "Late Arriving Dimension" |
| 3 | A late-arriving fact needs the relevant dimension(s) searched for the keys effective when the event occurred, not the current keys | Confirmed, quoted directly | Kimball "Late Arriving Fact" |
| 4 | Allowed lateness is a named, bounded horizon past which a late streaming element is handled differently | Confirmed, quoted directly, used as a cross-domain illustration (streaming, not warehouse-specific) | Apache Beam Programming Guide |
| 5 | The inferred-member insert/resolve and the as-of join numbers | Confirmed, this topic's own real, executed demonstration (`python3 examples.py`) | `examples.py`, measured on this sandbox |

## Red team

- **Predict 1 (step 4).** Tried the counter-argument that resolving a placeholder should add a new row, the way a real attribute change would under Type 2 — broken by the distinction the claims rest on: the placeholder was never a genuine prior "version" of the customer, it was a stand-in for missing data, so there is nothing for a second row to preserve. Kimball's own quote says "updated... with type 1 overwrites," not "a new row."
- **Predict 2 (step 7).** Tried the counter-argument that a dimension only ever has one row worth joining to — "the" current one — which is exactly the wrong intuition the Kimball "Late Arriving Fact" quote corrects: it says explicitly to search for the keys effective *when the event occurred*, which requires more than one candidate row to exist (SCD2 history).
- **Predict 3 (step 10).** Tried the counter-argument that correctness should always win over cost, so a pipeline should search all of history for every late fact regardless of age — broken by the Beam analogy: even a system built for exactly this problem (late, out-of-order event-time data) still picks a bounded horizon, because unbounded lateness means unbounded resource retention, not just unbounded correctness.
- **Currency check:** all three Kimball pages and the Beam programming guide are current as of 2026-10-22; no superseding material found.
- No corrections were needed to the claims as drafted in `OUTLINE.md`.
