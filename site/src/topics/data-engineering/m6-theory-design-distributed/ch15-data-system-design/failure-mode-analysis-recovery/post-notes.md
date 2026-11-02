<section data-section="outcomes">

## Outcomes

A pipeline that meets its SLOs and survives replay can still simply be down. A failure table
names, for one failure at a time, what failed, its blast radius, how it's detected, how it
recovers, what data is lost, and how long recovery takes — and an empty recovery cell is itself
the finding, not a detail to fill in on faith. Blast radius is scoped to what actually shares a
failure domain, not to what shares a dashboard: an averaged metric can bury a real, narrower
failure inside a healthy-looking system-wide number. RPO (how much data a class can lose) and RTO
(how long a class can stay down) are two different numbers, each priced separately, set per data
class rather than once for a whole system — tightening one doesn't tighten the other for free. A
degraded mode (a dead-letter queue, a freshness flag) is a designed trade that names, up front,
exactly what it gives up. Disaster-recovery mechanics and game days are a separate, later subject.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Disaster-recovery mechanics and game days, replication and
consensus mechanics that actually set an achievable RPO, and incident response each belong to
Chapters 5, 11, 13 and 14, `uses`/`declared` here, not re-derived. This topic teaches only the
*design response* — the failure table, the RPO/RTO budget, the degraded mode — not the mechanics
underneath it.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab. `failure_table_without_dead_letter_queue()`
and `failure_table_with_dead_letter_queue()` show the same failure's recovery cell empty, then
filled in, against `rows_with_empty_recovery()`'s own gap-finding check. `price_data_class()`
shows an audit log's tighter RPO and RTO costing more than a clickstream's looser one, under the
same pipeline.

</section>

<section data-section="production">

## Production failures this topic warns about

**An averaged dashboard hiding a real failure.** The hook is this failure exactly: one partition
crash-loops on a poison record while every other partition keeps going, and a system-wide average
reports the whole thing as healthy. The fix isn't a smarter dashboard — it's a per-partition
metric scoped to the actual failure domain, plus a dead-letter path so the recovery cell isn't
empty in the first place.

**Pricing recovery once for an entire system instead of per data class.** A single "zero data
loss, instant recovery" target applied everywhere pays the audit log's price for the clickstream
too. Setting RPO and RTO per data class gets the same real protection for the data that needs it,
without overpaying for the data that doesn't.

</section>

<section data-section="frontier">

## Frontier

None claimed. Failure-mode enumeration via a failure table, RPO/RTO budgeting per data class, and
designed degraded modes are established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A design now meets its SLOs, survives replay, and has a recovery plan for every failure. It also
has a price, and almost always one line of it dominates. The next topic is finding that line: the
cost model, and the single lever that moves it.

</section>
