<section data-section="outcomes">

## Outcomes

Choose a shard key from real access patterns and cardinality, not just "what's unique"; explain a
celebrity key and the salting/splitting fix for it; contrast local and global secondary indexes
across shards; explain online resharding and range splits (naming Vitess, CockroachDB, DynamoDB's
own documented mechanisms) and the real cost of moving data under load.

</section>

<section data-section="internals">

## Internals

"High cardinality" and "even load" are two different claims that get conflated constantly. A shard
key has high cardinality the moment it has many distinct values — a user ID, an order ID, a UUID.
None of that says anything about how much traffic any one of those values actually drives. The
celebrity-key failure is exactly this gap: the key space is uniformly hashed (every user id has an
equal chance of landing on any shard), but the *traffic* distribution across those keys is almost
never uniform in a real system — a handful of accounts, products, or tenants routinely account for
a disproportionate share of all requests. Salting fixes this surgically: splitting one specific hot
key into several salted sub-keys (`key#0` through `key#N`) spreads only that key's own load, without
touching the shard assignment of any other key in the system — a scheme-wide rehash isn't needed to
fix a single outlier.

Local and global secondary indexes trade the identical cost in different places. A local secondary
index lives inside its own base-table partition, so a query that already knows the partition key
gets a cheap, single-shard lookup — but a query on a non-partition-key attribute, with no partition
key in hand, still has to ask every shard's own copy of that local index, which is no better than
scanning without an index. A global secondary index re-partitions by its own key entirely,
independent of the base table's own shard assignment, so the identical query only has to reach the
global index's own, usually much smaller, set of partitions.

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing a shard key for uniqueness alone.** A key with enormous cardinality (a UUID, an
auto-increment ID) spreads evenly in the abstract, but says nothing about the actual traffic shape
of a real workload — the celebrity-key failure happens under exactly this kind of key, not despite
it.

**Resharding or splitting a range without a pause window.** This topic's own `examples.py` measures
this directly: skipping the brief window where every writer agrees on the new boundary leaves a
real, measurable fraction of in-flight writes routed by the stale boundary, landing on the wrong one
of the two new shards — "online" resharding still pays this cost; it just keeps it brief.

</section>

<section data-section="frontier">

## Frontier

Vitess's own VReplication-based resharding generalizes well beyond a simple two-way split — merging
shards, re-sharding by a different key entirely, and resharding with a custom `--defer-secondary-keys`
strategy are all documented workflows this topic doesn't build out. DynamoDB's adaptive capacity is
fully automatic and has its own documented limits (it won't split an item collection across
partitions when a local secondary index is present on the table) that this topic names but doesn't
exhaust. The deeper algorithmic question — how a ring or HRW hashing scheme itself decides which
node owns which key after a split — was already built in `de.partitioning-schemes-range-hash`
(topic 21) and `dsa.consistent-hashing-rings`, and isn't re-derived here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this section so far assumed replicas and shards stay in sync and agree on
membership changes without a formal protocol for it. The next topic is that protocol: consensus.

</section>
