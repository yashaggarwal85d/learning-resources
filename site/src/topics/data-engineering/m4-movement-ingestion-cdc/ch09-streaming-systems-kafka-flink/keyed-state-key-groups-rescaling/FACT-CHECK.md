# Fact-check — Keyed state, key groups and rescaling

| Claim | Source | Status |
|---|---|---|
| The HashMapStateBackend holds data internally as objects on the Java heap | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Unlike EmbeddedRocksDBStateBackend, the HashMapStateBackend stores data as objects on the heap so it is unsafe to reuse objects | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| The EmbeddedRocksDBStateBackend holds in-flight data in a RocksDB database stored in TaskManager local data directories by default | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| EmbeddedRocksDBStateBackend is currently the only backend that offers incremental checkpoints | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| HashMapStateBackend is fast but memory-limited; RocksDB scales with disk space and is the only backend supporting incremental snapshots | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Max parallelism specifies an upper bound because Flink internally partitions state into key-groups | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Setting max parallelism very large can hurt performance because some state backends keep internal data structures scaling with key-group count; key groups are the internal implementation mechanism for rescalable state | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Changing max parallelism explicitly when recovering from the original job leads to state incompatibility | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A TTL can be assigned to keyed state of any type; an expired value is cleaned up on a best-effort basis | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Expired values are explicitly removed on read and periodically garbage collected in the background if the state backend supports it | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Flink supports evolving the schema of POJO types: fields can be removed; new fields can be added with default values; declared field types cannot change | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Schema evolution of keys is not supported | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Flink's savepoint compatibility table lists "Resumed with" columns only for its own recent minor releases | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| Flink 2.0 introduces more efficient built-in collection serializers and upgrades Kryo to version 5.6 | Flink 2.0 release notes | Confirmed, quoted verbatim |
| Rescaling a toy job from four to six instances moves whole key groups between instances; no key group is ever split, and every key's state checksums unchanged | Modeled and measured directly in `examples.py` (`rescale`) | Confirmed by the toy model's own real run |
| Recovery time for a failed instance is identical regardless of operator count and depends only on the state its key groups held | Modeled and measured directly in `examples.py` (`recovery_time`) | Confirmed by the toy model's own real run |
| RocksDB access costs measurably more than heap access per the same number of accesses; RocksDB's disk-bound capacity exceeds heap's memory-bound capacity | Modeled and measured directly in `examples.py` (`access_cost`, `max_capacity`) | Confirmed by the toy model's own real run |

## Red-team

- **Does Flink's own documentation explicitly say "1.x state is incompatible with 2.x" in those
  words?** Not as a single sentence. Two separate, sourced facts support the claim instead: (1)
  the 2.0 "Upgrading Applications and Flink Versions" page's own Savepoint Compatibility Table
  lists only 1.17.x through 1.20.x as valid "Resumed with" targets — it does not include 2.0.x at
  all; (2) the 2.0 release notes state Kryo was upgraded to a new major version (5.6) with new
  built-in collection serializers, the documented technical cause of a binary-format change for
  any Kryo-serialized state. This topic presents the claim as "Flink's own current documentation
  doesn't cover restoring an old savepoint into the newest major version" rather than overstating
  a single explicit sentence that doesn't exist, per CHAPTER.md's instruction to re-verify this
  currency fact rather than assume it.
- **Does the toy rescale model actually need a real Flink cluster to be convincing?** No — it
  directly implements the sourced mechanism (hash a key into a key group, assign key groups to
  instances) and measures the one property the topic claims: no key group is ever split. Disclosed
  as a toy standalone simulation, not a port of Flink's internal `KeyGroupRange` implementation.
- **Is the recovery-time model's "operator count makes no difference" finding realistic?** It's a
  deliberately simplified cost model (recovery time as a pure function of state size) chosen to
  make the sourced, qualitative claim ("recovery scales with state, not job complexity")
  measurable; it does not model real deserialization, network, or scheduling overhead a live
  Flink cluster would also pay.
- **Is the measured 6x RocksDB-vs-heap access cost multiplier a cited Flink benchmark?** No — it's
  an arbitrary toy per-access cost constant chosen to make the qualitative, sourced trade-off
  (RocksDB pays real de/serialization cost on every access) visible and measurable; the reel and
  references.md both frame it as this run's own number.

## Corrections

None. All claims trace to this topic's own six primary sources (five Apache Flink 1.20/2.0 docs
pages and the 2.0 release notes) or to this topic's own toy model, measured directly.
