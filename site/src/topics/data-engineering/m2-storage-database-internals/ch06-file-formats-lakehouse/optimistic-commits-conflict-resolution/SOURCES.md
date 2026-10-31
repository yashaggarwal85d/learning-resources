# Sources — de.optimistic-commits-conflict-resolution

## Apache Iceberg Table Specification

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-10-31

> Serializable isolation -- Reads will be isolated from concurrent writes and always use a committed snapshot of a table's data. Writes will support removing and adding files in a single operation and are never partially visible. Readers will not acquire locks.

> Writers create table metadata files optimistically, assuming that the current version will not be changed before the writer's commit. Once a writer has created an update, it commits by swapping the table's metadata file pointer from the base version to the new version.

> If the snapshot on which an update is based is no longer current, the writer must retry the update based on the new current version. Some operations support retry by re-applying metadata changes and committing, under well-defined conditions. For example, a change that rewrites files can be applied to a new table snapshot if all of the rewritten files are still in the table.

> The conditions required by a write to successfully commit determines the isolation level. Writers can select what to validate and can make different isolation guarantees.

> When two commits happen at the same time and are based on the same version, only one commit will succeed. In most cases, the failed commit can be applied to the new current version of table metadata and retried. Updates verify the conditions under which they can be applied to a new version and retry if those conditions are met.

> Append operations have no requirements and can always be applied, other than the constraint requirements below.

> Replace operations must verify that the files that will be deleted are still in the table. Examples of replace operations include format changes (replace an Avro file with a Parquet file) and compactions (several files are replaced with a single file that contains the same rows).

> Delete operations must verify that specific files to delete are still in the table. Delete operations based on expressions can always be applied (e.g., where timestamp < X).

> Table schema updates and partition spec changes must validate that the schema has not changed between the base version and the current version.

## Delta Lake — Concurrency control (docs.delta.io)

URL: https://docs.delta.io/concurrency-control/
Version: fetched 2026-10-31

> Delta Lake uses optimistic concurrency control to provide transactional guarantees between writes. Under this mechanism, writes operate in three stages:

> Read: Reads (if needed) the latest available version of the table to identify which files need to be modified (that is, rewritten).

> Write: Stages all the changes by writing new data files.

> Validate and commit: Before committing the changes, checks whether the proposed changes conflict with any other changes that may have been concurrently committed since the snapshot that was read. If there are no conflicts, all the staged changes are committed as a new versioned snapshot, and the write operation succeeds. However, if there are conflicts, the write operation fails with a concurrent modification exception rather than corrupting the table as would happen with the write operation on a Parquet table.

> This exception occurs when a concurrent operation adds files in the same partition (or anywhere in an unpartitioned table) that your operation reads. The file additions can be caused by INSERT, DELETE, UPDATE, or MERGE operations.

> This exception occurs when a concurrent operation deleted a file that your operation read. Common causes are a DELETE, UPDATE, or MERGE operation that rewrites files.

> This exception occurs when a concurrent operation deleted a file that your operation also deletes. This could be caused by two concurrent compaction operations rewriting the same files.

> This exception occurs when a concurrent transaction updates the metadata of a Delta table. Common causes are ALTER TABLE operations or writes to your Delta table that update the schema of the table.
