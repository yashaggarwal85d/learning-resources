<section data-section="outcomes">

## Outcomes

Configure MySQL for row-based CDC and say why each of the three settings is needed. Explain why
GTIDs make failover survivable and file-and-offset positions not. Say what happens when binlog
retention expires under a stopped consumer and how it differs from PostgreSQL. Explain why a
schema-history topic exists. Place Oracle and SQL Server capture on the spectrum between reading
a log and polling a change table.

</section>

<section data-section="internals">

## Internals: modelled mechanics, not a live engine

This sandbox has no MySQL, Oracle or SQL Server server. Every measured claim in this topic is a
Python model of the documented mechanics — row image, GTID naming, retention expiry, DDL versus
schema history — built directly from Debezium's and Microsoft's own documentation, not a live
connector run. `CHAPTER.md` itself anticipates exactly this ("the sandbox may not have a second
MySQL"; "Lab: none of its own"). PostgreSQL's own slot model (topic 10) is used for contrast, not
re-taught; Debezium's connector structure, including how it actually wires up a schema-history
Kafka topic in production, is topic 19's own subject.

</section>

<section data-section="production">

## Production failures this topic warns about

**Failing a MySQL replica over without GTIDs enabled.** The hook's own scenario — a connector
silently reading from the wrong transaction after a promotion — is exactly what happens when a
CDC pipeline is configured by file-and-offset position instead of GTID. A team that only
discovers this after a real failover has already ingested changes from the wrong part of the
new primary's history, silently, with no error to flag it.

**Treating MySQL's binlog retention like PostgreSQL's slot.** Step 7's own contrast is the
production trap: a PostgreSQL slot pins WAL for a stalled consumer, filling disk but keeping the
position safe. MySQL's binlog retention does the opposite — it protects disk on a fixed clock and
lets a stalled consumer's own position simply expire, forcing a resnapshot nobody budgeted for.

</section>

<section data-section="frontier">

## Frontier

None claimed. Row-based binlog logging, GTIDs, LogMiner, XStream and SQL Server's change-table
capture are each established, long-documented mechanisms — this topic models their real
documented behaviour directly rather than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

PostgreSQL's slot is a convenience with a sharp edge: it never lets go of what its consumer has
not confirmed. When a consumer stalls, that edge is the production disk.

</section>
