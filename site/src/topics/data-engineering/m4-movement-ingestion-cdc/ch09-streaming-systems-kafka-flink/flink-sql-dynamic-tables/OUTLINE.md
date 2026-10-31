# Outline — Flink SQL and dynamic tables (`de.flink-sql-dynamic-tables`)

12 steps. Predicts at steps 3 and 7 (predicts[0] = step 3, 0-indexed position 2, within ≤3).
Takeaways at steps 5, 9, 11 — none immediately after a predict step (3→4 clear, 7→8 clear).

1. **Hook** — a stream is secretly a table the whole time; what if SQL just saw it that way?
2. **Setup** — recap: Flink's operators and state so far, all underneath any particular API.
3. **Predict** — a stream of inserts and updates read as a table — what three ways could it encode a change?
4. **Reveal: three changelog modes** — append (insert-only), upsert (keyed, replace), retract
   (explicit retract-then-insert pair).
5. **Reveal: upsert vs retract cost** — same final table, but retract needs twice the messages for
   an update; upsert needs a unique key to work at all. [Takeaway 1]
6. **Reveal: regular joins keep everything forever** — any future row on either side could still
   match, so state never shrinks.
7. **Predict** — if a join only needs to match rows close in time, what happens to its state?
8. **Reveal: interval and temporal joins bound state** — interval bounds by a time window; temporal
   joins against a row's valid version at the other side's event time, no window at all.
9. **Reveal: lookup joins and delta joins trade state for a lookup** — lookup joins reach an
   external table instead of keeping one side in state; delta joins reuse source-table data instead
   of materializing both sides. [Takeaway 2]
10. **Reveal: materialised tables and process table functions** — freshness drives CONTINUOUS vs
    FULL refresh; PTFs are the escape hatch with full access to state and the changelog.
11. **ProveIt** — toy model: changelog-mode message counts, regular-vs-interval join state size
    over time, freshness-driven refresh-mode choice. [Takeaway 3]
12. **Recap** — append/upsert/retract encode the same table differently; every join type is a
    different answer to how much state it needs to keep; materialised tables and PTFs sit on top.

Takeaways:
5. Upsert and retract modes agree on the final table but cost different numbers of messages per change.
9. Every join type — regular, interval, temporal, lookup, delta — is really a different answer to how much state it keeps.
11. The toy model's own numbers: message counts per changelog mode, and a bounded interval-join state size next to an unbounded regular-join one.
