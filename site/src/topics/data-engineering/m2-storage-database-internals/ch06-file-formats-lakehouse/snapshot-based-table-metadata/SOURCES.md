# Sources — de.snapshot-based-table-metadata

## Apache Iceberg Table Spec: "Overview" and "Optimistic Concurrency"

URL: https://iceberg.apache.org/spec/
Version: Apache Iceberg table specification, fetched 2026-10-31

> This table format tracks individual data files in a table instead of directories. This allows writers to create data files in-place and only adds files to the table in an explicit commit.

> Table state is maintained in metadata files. All changes to table state create a new metadata file and replace the old metadata with an atomic swap. The table metadata file tracks the table schema, partitioning config, custom properties, and snapshots of the table contents. A snapshot represents the state of a table at some time and is used to access the complete set of data files in the table.

> An atomic swap of one table metadata file for another provides the basis for serializable isolation. Readers use the snapshot that was current when they load the table metadata and are not affected by changes until they refresh and pick up a new metadata location.

> Writers create table metadata files optimistically, assuming that the current version will not be changed before the writer's commit. Once a writer has created an update, it commits by swapping the table's metadata file pointer from the base version to the new version.

> Table metadata is stored as JSON. Each table metadata change creates a new table metadata file that is committed by an atomic operation. This operation is used to ensure that a new version of table metadata replaces the version on which it was based.

> The atomic operation used to commit metadata depends on how tables are tracked and is not standardized by this spec.

> An atomic swap can be implemented using atomic rename in file systems that support it, like HDFS [1].

> The atomic swap needed to commit new versions of table metadata can be implemented by storing a pointer in a metastore or database that is updated with a check-and-put operation [1].

## Delta Lake Protocol (PROTOCOL.md)

URL: https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
Version: Delta Lake protocol specification, fetched 2026-10-31

> Readers of the table ensure that they only see one consistent _snapshot_ of a table at time by using the _transaction log_ to selectively choose which _data files_ to process.

> Then, they _commit_, creating the latest _atomic version_ of the table by adding a new entry to the log.

> A table has a single serial history of atomic versions, which are named using contiguous, monotonically-increasing integers.

> The state of a table at a given version is called a _snapshot_ and is defined by the following properties:

> A ratified commit may or may not even be stored by the catalog at all - the catalog may have just atomically published it to the filesystem directly, relying on PUT-if-absent primitives to facilitate the ratification and publication all in one step.
