<section data-section="outcomes">

## What this topic leaves you able to do

Compare, on the same simulation, how many keys move when a node joins under a token ring, a
fixed-slot table and modulo hashing; explain why Redis Cluster and Kafka are not
consistent-hashing rings, and what stable mapping each provides instead; show a hot key's
effect on a ring and what bounded-load placement does to the maximum load, with HAProxy's own
factor as the real knob.

</section>

<section data-section="internals">

## Into the internals

### Why CRC16, and why hash tags

Redis Cluster picks `CRC16` for its slot hash rather than a cryptographic or general-purpose
hash; the specification's own stated goal is a fast, fixed, well-distributed sixteen-bit
value, cheap enough to compute on every command. Hash tags (`{...}` inside a key) let an
application force several related keys into the same slot deliberately, so multi-key
operations that must touch all of them in one place still work under a scheme that otherwise
spreads keys across slots by hash alone — a feature this topic names without building, since
it is an application-level override, not part of the placement algorithm itself.

### The migrating/importing handshake, one slot at a time

A Redis Cluster resharding operation sets the slot `MIGRATING` on its source node and
`IMPORTING` on its destination before any data moves, so a client that asks either node about a
key in that slot gets a consistent answer throughout the move, not a window where neither node
believes it owns the key. This topic's own rebalance model moves whole slots in one step,
deliberately simplifying past this two-state handshake, which is named here rather than built.

</section>

<section data-section="lab">

## The lab

`examples.py`'s three-way growth comparison and its hot-key measurements are the thing to
change by hand: swap in a different hot-key share, a different balance factor, or a different
node count, and recompute. The virtual-node experiment is worth running with several different
hot-key strings in a row — the direction and size of the small change a higher virtual-node
count causes varies from key to key, which is itself the point: there is no systematic
improvement to find, in either direction.

</section>

<section data-section="production">

## In production

Kafka's producer also ships a *sticky* partitioner for records with no key at all, batching
unkeyed records onto one partition at a time before rotating — a separate mechanism, solving a
separate problem (batching efficiency for unkeyed traffic), explicitly out of this topic's
scope, which is about keyed placement. A slot migration that is interrupted mid-flight (a node
crashing while a slot is `MIGRATING`) leaves that slot in a state an operator or an automated
tool must detect and resolve; Redis Cluster's own tooling handles this, named here as a real
operational concern this topic does not build.

</section>

<section data-section="frontier">

## At the frontier

Cassandra's current default `num_tokens` for a newly created cluster is left **unresolved**
here. The production configuration guide read at research time gives example values (one, four,
eight, sixteen) with guidance on when each is appropriate, but does not itself state, in a
sentence safe to quote without risking it being stale, which value new clusters ship with by
default at the current release. CHAPTER.md itself flagged this as "to verify at research
time"; the honest outcome is an open question, not a guess. A reader who wants the exact current
default should read Cassandra's own shipped `cassandra.yaml` template.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Data Engineering's live "Partitioning schemes: range, hash, consistent hashing" and "Shard
keys, hot shards and resharding" own the system-level view: routing layers, shard-key choice in
practice, and the operational cost of resharding at scale. This topic's own next step stays
inside the chapter: once a key's node is settled, each node answers aggregate questions about
only its own share of the data, and the system must combine those partial answers into one —
possible only when the structure holding the answer can actually be merged. Sketches inside
approximate aggregation, next.

</section>
