## Delta Lake, Transaction Log Protocol

URL: https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
Version: latest (fetched 2026-11-02)

> that manages the table becomes the
> source of truth for whether a given commit attempt succeeded.

> **NOTE**: Filesystem-based access to catalog-managed tables is not supported. Delta clients are
> expected to discover and access catalog-managed tables through the managing catalog, not by direct
> listing in the filesystem.

> Option 3: Catalog implementations that use PUT-if-absent (client- or server-side) can ratify and
> publish all-in-one by atomically writing a

> Note that this commit will be considered to have succeeded as soon
> as the file becomes visible in the filesystem, regardless of when or whether the catalog is made
> aware of the successful publish. The catalog does not need to store these files.

> A ratified commit may or may not even be stored by the catalog at all - the catalog may
> have just atomically published it to the filesystem directly, relying on PUT-if-absent
> primitives to facilitate the ratification and publication all in one step.

> A catalog must not ratify version `v` until it has ratified version `v - 1`, and it must ratify
> version `v` at most once.

## Databricks, Isolation levels (WriteSerializable and Serializable)

URL: https://docs.databricks.com/aws/en/optimizations/isolation/isolation-levels
Version: latest (fetched 2026-11-02)

> The strongest isolation level. Ensures that committed write operations and all reads are
> Serializable.

> A weaker isolation level than Serializable. Ensures that only write operations (not reads) are
> serializable. This is still stronger than Snapshot isolation.

> Serializable: deleteTxn is not allowed to commit, and a conflict occurs

> WriteSerializable: deleteTxn is allowed to commit because the transactions can be ordered. The
> resulting table state is as if insertTxn occurred after deleteTxn, so the inserted rows are part
> of the table. However, the Delta history shows the physical commit order (insertTxn at v1 before
> deleteTxn at v2).

> Serializable: A reader always sees only tables that conform to the history

> WriteSerializable: A reader can see a table state that does not exist in the Delta log

## Delta Lake, Delta Lake 4.0

URL: https://delta.io/blog/2025-09-25-delta-lake-40/
Version: latest (fetched 2026-11-02)

> Delta Lake 4.0 introduces catalog-managed tables as a preview feature—a major shift that enables
> seamless integration with catalogs. While Delta Lake continues to support its popular
> "filesystem-managed" tables, catalog-managed tables are the foundation for a whole new set of
> possibilities.

## Delta Lake, Strengthening Catalog-Managed Delta Tables with the Unity Catalog Delta APIs

URL: https://delta.io/blog/2026-06-22-delta-4-3-release
Version: latest (fetched 2026-11-02)

> Delta 4.2 makes commits catalog-coordinated while Delta 4.3 brings the rest of the operation
> surface under unified APIs.

> Every operation on a catalog-managed table now flows through the Unity Catalog Delta APIs: table
> loads, CREATE and CTAS, REPLACE, CREATE OR REPLACE, and RTAS, and metadata-changing writes such
> as DML schema evolution.

> Server-side commit validation rejects malformed or conflicting commits before they corrupt table
> state, and server-advertised table features let an engine know what features a new table should
> support, as defined by the catalog.

### Red team

- No `deltalake`/`delta-rs` library is used anywhere in `examples.py`, matching this chapter's
  established convention (confirmed again for topic 28, as for topics 10-27): the demo is a real
  moto S3 server plus raw `boto3` calls, the same primitive topic 10 built — not even `pyarrow` is
  needed here.
- CHAPTER.md's own topic-28 scope line says the catalog-managed-tables preview landed "in 4.0
  (June 2025)." The primary source dated by its own URL (`2025-09-25-delta-lake-40`) puts the 4.0
  GA release, and the "Catalog-Managed Tables (Preview)" feature announcement, in September 2025,
  not June. (June 2024 is instead the date of Delta Lake 4.0's original *preview* release, whose
  own preview feature list named "Coordinated Commits" — an earlier name for the same direction,
  not yet called catalog-managed tables.) This topic's content uses the verified September 2025
  date rather than repeating CHAPTER.md's unverified one.
- The isolation-level demo (`delete_can_commit`) is a direct reproduction of Databricks' own
  documented decision rule for WriteSerializable vs. Serializable — it is not Delta Lake's actual
  Scala conflict-detection implementation, which also reasons about read/write sets of files and
  partitions, not just a single named target path. Disclosed in FACT-CHECK.md.
- The put-if-absent commit demo reuses topic 10's exact `IfNoneMatch="*"` primitive against a
  `_delta_log/{v:020d}.json` key, standing in for a real catalog's commit path — there is no real
  Unity Catalog or DynamoDB Commit Coordinator here, matching the local-disk/local-S3 stand-in
  disclosure topics 10-27 already established.
