Sources fetched and quoted for `de.keyed-state-key-groups-rescaling`.

## State Backends (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/state_backends/

> The HashMapStateBackend holds data internally as objects on the Java heap.

> Unlike EmbeddedRocksDBStateBackend, the HashMapStateBackend stores data as objects on the heap so that it is unsafe to reuse objects.

> The EmbeddedRocksDBStateBackend holds in-flight data in a RocksDB database that is (per default) stored in the TaskManager local data directories.

> EmbeddedRocksDBStateBackend is currently the only backend that offers incremental checkpoints

> When deciding between HashMapStateBackend and RocksDB, it is a choice between performance and scalability.
> HashMapStateBackend is very fast as each state access and update operates on objects on the Java heap; however, state size is limited by available memory within the cluster.
> On the other hand, RocksDB can scale based on available disk space and is the only state backend to support incremental snapshots.

## Parallel Execution (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/execution/parallel/

> When restoring from a savepoint you can change the parallelism of specific operators or the whole program and this setting specifies an upper bound on the parallelism. This is required because Flink internally partitions state into key-groups

> Setting the maximum parallelism to a very large value can be detrimental to performance because some state backends have to keep internal data structures that scale with the number of key-groups (which are the internal implementation mechanism for rescalable state).

> Changing the maximum parallelism explicitly when recovery from original job will lead to state incompatibility.

## Working with State (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/state/

> A time-to-live (TTL) can be assigned to the keyed state of any type. If a TTL is configured and a state value has expired, the stored value will be cleaned up on a best effort basis

> By default, expired values are explicitly removed on read, such as ValueState#value, and periodically garbage collected in the background if supported by the configured state backend.

## State Schema Evolution (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/serialization/schema_evolution/

> Flink supports evolving schema of POJO types,

> Fields can be removed. Once removed, the previous value for the removed field will be dropped in future checkpoints and savepoints.

> New fields can be added. The new field will be initialized to the default value for its type

> Declared fields types cannot change.

> Schema evolution of keys is not supported.

## Upgrading Applications and Flink Versions (Apache Flink, 2.0 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/ops/upgrading/

> Savepoints are compatible across Flink versions as indicated by the table below:

## Flink 2.0 release notes (Apache Flink docs repository)

URL: https://apache.googlesource.com/flink/+show/master/docs/content/release-notes/flink-2.0.md

> Flink 2.0 introduces much more efficient built-in serializers for collection types (i.e., Map / List / Set), which are enabled by default.

> We have also upgraded Kryo to version 5.6, which is faster, more memory efficient, and has better supports for newer Java versions.

Notes on this topic's research: all seven documents fetched clean on the first attempt. The 2.0
"Upgrading Applications and Flink Versions" page's own Savepoint Compatibility Table lists only
1.17.x through 1.20.x as "Resumed with" columns — it does not list 2.0.x as a target at all,
structurally confirming that an ordinary 1.x-to-2.x savepoint restore isn't covered by Flink's own
documented compatibility guarantee. The concrete technical cause disclosed by the release notes is
the Kryo major-version upgrade (2.x to 5.6) and the new built-in collection serializers, both of
which change the binary format of any state that was Kryo-serialized under 1.x (a currency fact,
re-verified directly against the current 2.0 release notes and upgrading guide rather than assumed
from memory, per CHAPTER.md's instruction). No source URL substitutions were needed this topic.
