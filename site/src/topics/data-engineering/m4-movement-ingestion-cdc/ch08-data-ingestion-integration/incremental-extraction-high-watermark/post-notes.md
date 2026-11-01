<section data-section="outcomes">

## Outcomes

Reproduce the four ways an `updated_at` cursor misses a row and show the commit-order timeline
for each. Size a lookback window from the longest transaction and measure what it still misses.
Combine lookback with an idempotent merge and prove a re-run changes nothing. State precisely
when a cursor is the wrong tool.

</section>

<section data-section="internals">

## Internals: timestamps, sequences and MVCC, composed

This topic introduces no new storage mechanism of its own. `transaction_timestamp()`'s fixed-at-
start behaviour and `nextval()`'s non-reclamation are each PostgreSQL's own documented contract,
not independently derived; this topic's own contribution is running both to their logical,
reproducible conclusion against a real database (a transaction's own stamp sitting behind a
watermark it later commits past) rather than only describing it. The idempotent merge in step 6
is the same `INSERT ... ON CONFLICT DO UPDATE` pattern Chapter 2 topic 9 and Chapter 3 topic 13
already teach, used here as the fix, not re-taught. The isolation-anomaly vocabulary Chapter 5
topic 11 introduces is used by name in the outline's own concept ledger to describe why a cursor's
read and a transaction's commit can disagree, not repeated on screen.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a cursor's own clean run log.** The hook's reconciliation gap exists precisely because
every single cursor run that night reported success — nothing about a missed row shows up as an
error anywhere in that log. A team that only watches for failed runs, rather than reconciling row
counts against the source, can carry this exact gap for a long time before anyone notices it.

**Picking a lookback margin by feel instead of by measurement.** Step 7's own point is that a
margin shorter than the slowest transaction a source actually runs recreates the identical blind
spot it was meant to close, just with smaller numbers. A team that copies a round lookback value
from another pipeline, without measuring this source's own slow transactions, can ship a fix that
still misses exactly the case it was built to catch.

</section>

<section data-section="frontier">

## Frontier

None claimed. High-watermark cursors, lookback windows and idempotent merges are each
established, long-standing practice — this topic measures their real behaviour directly rather
than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A cursor only works at all when the source is a database that can be queried this way. Many
sources are not: a vendor's REST API, with its own pagination, limits and failures, is the next
shape of the same problem.

</section>
