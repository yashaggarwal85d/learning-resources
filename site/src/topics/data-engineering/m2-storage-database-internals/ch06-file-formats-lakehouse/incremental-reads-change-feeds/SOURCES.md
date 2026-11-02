## Apache Iceberg, Table Spec (row lineage)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> In v3 and later, an Iceberg table must track row lineage fields for all newly created rows. Engines must maintain the next-row-id table field and the following row-level fields when writing data files:

> _row_id a unique long identifier for every row within the table. The value is assigned via inheritance when a row is first added to the table.

> _last_updated_sequence_number the sequence number of the commit that last updated a row. The value is inherited when a row is first added or modified.

> When null, a row's _row_id field is assigned to the first_row_id from its containing data file plus the row position in that data file (_pos).

> Writing a new append snapshot creates snapshot metadata with first-row-id assigned to the table's next-row-id:

> When a table is upgraded to v3, its next-row-id is initialized to 0 and existing snapshots are not modified (that is, first-row-id remains unset or null). For such snapshots without first-row-id, first_row_id values for data files and data manifests are null, and values for _row_id are read as null for all rows.

> Row lineage does not track lineage for rows updated via Equality Deletes, because engines using equality deletes avoid reading existing data before writing changes and can't provide the original row ID for the new rows. These updates are always treated as if the existing row was completely removed and a unique new row was added.

Contents: the full v3 row lineage mechanism — a table-level `next-row-id` counter and two
row-level fields, `_row_id` (stable identity, assigned once) and `_last_updated_sequence_number`
(the commit sequence number that last touched the row). Equality deletes break lineage entirely:
an equality-deleted-then-reinserted row gets a brand new `_row_id`, not the old one.

## Apache Iceberg, Queries (incremental read)

URL: https://iceberg.apache.org/docs/latest/spark-queries/
Version: latest (fetched 2026-11-02)

> start-snapshot-id Start snapshot ID used in incremental scans (exclusive).

> end-snapshot-id End snapshot ID used in incremental scans (inclusive). This is optional. Omitting it will default to the current snapshot.

> Currently gets only the data from append operation. Cannot support replace, overwrite, delete operations.

> Incremental read is not supported by Spark's SQL syntax.

Contents: Iceberg's plain incremental-scan API only understands append snapshots between two
snapshot IDs (start exclusive, end inclusive) — it has no way to represent a replace, overwrite,
or delete snapshot, which is exactly why the changelog-view procedure (next source) exists for
anything beyond pure appends.

## Apache Iceberg, Procedures (create_changelog_view)

URL: https://iceberg.apache.org/docs/latest/spark-procedures/
Version: latest (fetched 2026-11-02)

> Creates a view that contains the changes from a given table.

> _change_type: the type of change. It has one of the following values: INSERT, DELETE, UPDATE_BEFORE, or UPDATE_AFTER.

> The procedure removes the carry-over rows by default. Carry-over rows are the result of row-level operations(MERGE, UPDATE and DELETE)
when using copy-on-write. For example, given a file which contains row1 (id=1, name='Alice') and row2 (id=2, name='Bob').
A copy-on-write delete of row2 would require erasing this file and preserving row1 in a new file. The changelog table
reports this as the following pair of rows, despite it not being an actual change to the table.

Contents: `create_changelog_view` reads snapshots as row-level INSERT/DELETE/UPDATE_BEFORE/
UPDATE_AFTER events, and by default filters "carry-over rows" — rows that a copy-on-write
rewrite moved to a new file untouched, which would otherwise show up as a spurious DELETE+INSERT
pair even though nothing about the row actually changed. This is the concrete mechanism behind
"compaction complicates what changed."

## Databricks, Change Data Feed

URL: https://docs.databricks.com/aws/delta/delta-change-data-feed
Version: fetched 2026-11-02

> _change_typeStringContains: insert, update_preimage, update_postimage, delete.preimage is the value before the update, postimage is the value after the update.

> It only records changes that occur after change data feed was enabled.

> If you specify a version before change data feed was enabled, it raises an error.

> Some operations, such as insert-only or full-partition deletions, don't generate change data files. Databricks computes the change data feed directly from the transaction log.

> Change data files use the table's retention policy. The VACUUM command deletes change data files, and changes from the transaction log use checkpoint retention policy.

Contents: Delta's Change Data Feed, enabled with `delta.enableChangeDataFeed = true`, reads
changes from dedicated `_change_data` files between two versions, tagged `insert` /
`update_preimage` / `update_postimage` / `delete`. It is strictly forward-looking from the
moment it is enabled, and some operations (insert-only, full-partition deletes) skip writing
change files entirely, falling back to the transaction log itself.

## Apache Hudi, SQL Queries

URL: https://hudi.apache.org/docs/sql_queries
Version: fetched 2026-11-02

> Change Data Capture (CDC) queries are useful when you want to obtain all changes to a Hudi table within a given time window, along with before/after images and change operation of the changed records.

> -- Supported through the hudi_table_changes TVF

> Incremental queries offer even better query efficiency than even the CDC queries above, since they amortize the cost of compactions across your data lake.

> the interval is a closed one: both start commit and end commit are inclusive;

Contents: Hudi's `hudi_table_changes` table-valued function takes a `'cdc'` or `'latest_state'`
mode. `'cdc'` gives full before/after row images and operation type; `'latest_state'`
(incremental) gives only the current value of changed records, cheaper because it does not have
to re-materialize every intermediate version a compaction already folded together — the same
"latest state is efficient but CDC sees every step" trade-off Iceberg and Delta each make in
their own way.
