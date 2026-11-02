## Apache Iceberg, Partitioning (hidden partitioning)

URL: https://iceberg.apache.org/docs/latest/partitioning/
Version: latest (fetched 2026-11-02)

> Other tables formats like Hive support partitioning, but Iceberg supports hidden partitioning.

> Iceberg produces partition values by taking a column value and optionally transforming it. Iceberg is responsible for converting event_time into event_date, and keeps track of the relationship.

> Because Iceberg doesn't require user-maintained partition columns, it can hide partitioning. Partition values are produced correctly every time and always used to speed up queries, when possible. Producers and consumers wouldn't even see event_date.

> Most importantly, queries no longer depend on a table's physical layout. With a separation between physical and logical, Iceberg tables can evolve partition schemes over time as data volume changes. Misconfigured tables can be fixed without an expensive migration.

Contents: why hidden partitioning exists and what it buys a reader — the table derives
partition values from a real column by a transform it tracks itself, so a query filters the
source column directly and still gets pruned, and the partitioning scheme can change later
without breaking any query written against it.

## Apache Iceberg, Table Spec (partition transforms and evolution)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Source value, unmodified

> Hash of value, mod N (see below)

> Value truncated to width W (see below)

> Extract a timestamp hour, as hours from 1970-01-01 00:00:00

> Table partitioning can be evolved by adding, removing, renaming, or reordering partition spec fields.

> Changing a partition spec produces a new spec identified by a unique spec ID that is added to the table's list of partition specs and may be set as the table's default spec.

> The table’s current partition spec, stored as only fields. Note that this is used by writers to partition data, but is not used when reading because reads use the specs stored in manifest files.

> For partition fields with a transform with a single argument, only source-id is written. In case of a multi-argument transform, only source-ids is written.

> source-ids was added and must be written in the case of a multi-argument transform.

Contents: the named transforms this topic builds with (identity, bucket[N], truncate[W],
day/hour), the mechanics of partition evolution (a new spec gets its own ID, added to the
table's list of specs), and the fact every reader needs: each manifest records which spec wrote
it, and reads always plan against that manifest's own recorded spec, not the table's current
default — which is exactly what lets old and new data both prune correctly after an evolution.
Multi-argument (v3) transforms are named as the current extension to this mechanism, not built.
