<section data-section="outcomes">

## Outcomes

Measure what polling and triggers miss and cost on a changing table. State what log-based
capture gives (complete, ordered, low overhead) and what it couples you to. Choose between them
for a given source by delete handling, intermediate-state need, source privileges and
operational tolerance.

</section>

<section data-section="internals">

## Internals: logical decoding at the level this topic needs, not further

This topic reads real decoded changes with `pg_logical_slot_get_changes` and the
`test_decoding` plugin, which is enough to measure completeness, ordering and cost. It does not
explain what a slot is made of, how `pgoutput` differs from `decoderbufs`, what
`REPLICA IDENTITY` controls, or how `restart_lsn` and `confirmed_flush_lsn` relate — all of that
is topic 10's own subject, built on Chapter 5's WAL and LSN topics (used here only as the
destination this chapter is heading toward, not re-taught). Debezium's, Airbyte's and
Meltano's own log-based replication implementations are named from their own documentation
without being independently re-measured, since none of them run inside this topic's own
in-process measurement without a broker or a managed service.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a poll to represent a row's full history.** The hook's own scenario — four states in
four seconds, one sampled — is what any cursor-based pipeline does to every row that changes
more than once between two runs. A team that reports on a row's "current status" from a poll
alone has no way to know how many states that status actually passed through, or whether one of
them mattered.

**Reaching for a trigger as a free fix for a poll's gaps.** Step 7's own measurement shows a
trigger doubling every write it captures, inside the same transaction as the write itself. A
team that adds a capture trigger to a hot, high-write table without budgeting for that doubled
write volume inherits a real throughput cost on the very table the trigger was meant to protect.

</section>

<section data-section="frontier">

## Frontier

None claimed. Polling, trigger-based capture and PostgreSQL's logical decoding are each
established, long-documented practice — this topic measures their real behaviour directly
rather than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Reading the database's own log is complete and cheap, and it is a bargain with the source. What
exactly the log contains, and how a consumer holds a place in it, depends on the engine. The
first to open is PostgreSQL's.

</section>
