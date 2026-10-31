<section data-section="internals">

## Internals: the same two checkers as topic 6, lifted to whole transactions

`find_serializable_order` in `examples.py` is topic 6's sequential-consistency search
(`find_sequential_order`), with one change: the unit being ordered is a whole `Txn`, and the legality
check (`is_legal_serial_history`) replays each transaction's reads against the serial order's
running state, rather than a single register's value. `find_strictly_serializable_order` adds
topic 5's `respects_real_time_order` check back, unchanged in spirit: for any two transactions where
one's `end` is at or before the other's `start`, the serial order must place them in that same
order. Running both checkers against the identical hook history
(`the_hook_is_serializable_but_not_strictly_so`) makes the relationship concrete: the serializable
checker finds an order (refresh before order), and the strict checker, searching the same
permutations with one extra rule, finds none. Nothing about the data changed between the two
calls — only which rule the search was required to satisfy.

</section>

<section data-section="lab">

## Lab: the hook's history, measured on a real PostgreSQL 16, not simulated

This sandbox's PostgreSQL 16.15 was started (`service postgresql start`) and a fresh database
created (`createdb lr_test`, `CREATE TABLE orders (id serial PRIMARY KEY, item text);`). Two
scenarios were run directly against it, not through `examples.py`'s pure-Python checker:

**Scenario 1 — a fresh transaction, opened after a sibling's commit finishes.** One `psql`
session ran `BEGIN; INSERT INTO orders(item) VALUES ('widget'); COMMIT;` to completion. A second,
separate `psql` session then ran `BEGIN ISOLATION LEVEL SERIALIZABLE; SELECT * FROM orders;
COMMIT;` and saw the row. Real-time order held here — not because `SERIALIZABLE` promises it
(Jepsen's quoted sentence says explicitly that it does not), but because PostgreSQL's MVCC takes
a transaction's snapshot at `BEGIN`, and any write already committed by then is, as a plain
consequence of that timing, already visible. This is the measured, not assumed, reason the hook's
exact anomaly could not be reproduced on this sandbox's single primary: a brand-new transaction,
started strictly after the "confirmed" response, will always see it here.

**Scenario 2 — a transaction already open when a sibling commits.** A `SERIALIZABLE` transaction
was opened and read `count(*) FROM orders`, getting 1. While it stayed open (via `pg_sleep(3)`), a
second, independent session ran its own `BEGIN; INSERT ...; COMMIT;` to completion. The first
transaction's second read, taken after that commit had fully finished, still returned 1 — the
final table in fact held 2 rows, confirmed by a fresh query afterward. This is the time-travel
clause, measured directly: a transaction's view, once its snapshot is taken, does not move
forward even when a sibling's commit lands squarely inside its own open window.

A streaming replica was not set up in this sandbox (it would need a second PostgreSQL instance
and `pg_basebackup`/replication configuration beyond this topic's scope), so the specific
client-refreshes-through-a-lagging-replica path named in CHAPTER.md's scope line stays
sourced-only, not measured — Scenario 2 demonstrates the same underlying "no real-time promise"
property without needing one.

</section>

<section data-section="production">

## Production: three systems, placed from their own documentation

`SYSTEM_CLAIMS` in `examples.py` records each placement with the exact sentence it comes from.
etcd's own API-guarantees page states plainly that it "ensures durability and strict
serializability for all KV api calls" — the strongest cell on the map. Spanner's OSDI paper
states that its serialization order "satisfies external consistency (or equivalently,
linearizability)" if one transaction commits before another starts — the same cell, under a
different name, because external consistency and strict serializability are the same property
stated by two different papers. PostgreSQL's own transaction-isolation documentation places
`SERIALIZABLE` one rung down from both: it is explicit, in Jepsen's quoted words and confirmed by
this topic's own measurement, that the definition "does not impose any real-time, or even
per-process constraints" — a deployment may happen to deliver one anyway (Scenario 1), but that is
an artifact of implementation, not a documented guarantee (Scenario 2 shows exactly where the
artifact runs out).

</section>

<section data-section="frontier">

## Frontier: why real-time order looks free and isn't

Scenario 1's result is worth being careful about, because it is easy to over-generalize into "a
single-node database always respects real time anyway, so the distinction is academic." It
doesn't, in general: Scenario 2 is the same single node, the same isolation level, and the same
kind of transaction, and it demonstrably does not respect real time once two transactions overlap.
What Scenario 1 actually shows is narrower: a transaction that begins after another has already
committed inherits that commit for free, because MVCC's snapshot-at-`BEGIN` semantics happen to
line up with real time in the specific case of non-overlapping transactions. The moment two
transactions' real-time intervals overlap at all — which concurrent load guarantees will happen
routinely — that alignment breaks, exactly as Scenario 2 shows. The honest statement is not
"PostgreSQL's SERIALIZABLE is secretly strict", it is "serializability's lack of a real-time
promise is invisible exactly when there was no concurrency to expose it, and visible the moment
there is."

</section>

<section data-section="where-next">

## Where this goes next

The map built in this topic shows a ladder of models, and the strongest rungs cost the most. The
next question is whether a system can simply have the top rung everywhere. It cannot, and the
result that says why — CAP — is usually quoted wrongly. The next topic states it precisely, with
PACELC, the latency trade CAP itself says nothing about.

</section>
