<section data-section="outcomes">

## Outcomes

This topic is sourced entirely from Snowflake's own current documentation, with no account
reachable from this sandbox: immutable micro-partitions and their size, per-column metadata and
precise pruning, clustering depth and Automatic Clustering's background reclustering, the search
optimization service as a distinct point-lookup mechanism, Time Travel's retention model,
Fail-safe's non-configurable last-resort window, zero-copy cloning's shared-storage mechanism,
and Secure Data Sharing's no-copy model -- each one traced back to the same underlying guarantee:
a micro-partition, once written, is never rewritten in place.

</section>

<section data-section="deep-dive">

## Deep-dive

Topic 7's page-level statistics and topic 17's own snapshot-lifecycle mechanism are both doing,
inside an open file format, what Snowflake's micro-partition metadata and Time Travel do inside
a proprietary one: keep enough metadata to skip what a query doesn't need, and keep enough old
state around to answer "what did this look like before." The mechanism is proprietary; the shape
of the problem it solves is the same one this chapter has solved in the open the whole way
through.

</section>

<section data-section="production">

## Production

Snowflake's own documentation is explicit that reclustering, once a clustering key is defined,
consumes real credits in the background -- a production table's clustering key is a cost
decision, not just a performance one, and Automatic Clustering can be suspended per table when
write volume makes that cost unwelcome. The search optimization service carries its own separate
storage and compute cost, layered on top of whatever clustering a table already has.

</section>

<section data-section="frontier">

## Frontier

Fail-safe's seven-day window is deliberately not a feature a customer can reach directly --
Snowflake's own docs describe it as a best-effort, last-resort service reachable only by opening
a support case, a sharp contrast with Time Travel's self-service retention window that sits in
front of it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Snowflake's immutability is one proprietary storage design, built on infrastructure this sandbox
can only read about. The next topic is a second, built on genuinely different infrastructure:
BigQuery's Dremel execution over Colossus.

</section>
