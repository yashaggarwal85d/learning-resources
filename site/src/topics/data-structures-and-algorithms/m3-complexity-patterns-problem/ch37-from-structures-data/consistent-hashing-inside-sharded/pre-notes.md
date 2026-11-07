# Pre-notes — Consistent hashing inside sharded stores

- **Shard (or partition):** one node's own slice of a dataset split across several machines.
- **Node:** one machine in a cluster, holding some shards.
- **Token:** a ring position a node is responsible for, in a token-ring scheme.
- **Hash slot:** one of a fixed number of labeled buckets a key hashes into, in a slot-table
  scheme, independent of any ring.
- **Replica:** a copy of a shard kept on another node for durability; not this topic's subject,
  only named where a source mentions it.
- **Hot key:** one key that receives far more traffic than an ordinary key, regardless of which
  node happens to own it.
- **Load (requests in flight):** how busy a node currently is, as distinct from how many keys
  it owns.
