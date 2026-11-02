## Apache Iceberg, Table Spec (row-level delete formats)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Position deletes -- Mark a row deleted by data file path and the row position in the data file. Position deletes are encoded in a position delete file (V2) or deletion vector (V3 or above).

> Equality deletes -- Mark a row deleted by one or more column values, like id = 5. Equality deletes are encoded in equality delete file (may be created in v2 and v3 tables only).

> Row-level deletes are added by v2 and are not supported in v1. Deletion vectors are added in v3 and are not supported in v2 or earlier. Position delete files must not be added to v3 tables, but existing position delete files are valid. Equality delete files must not be added to v4 tables, but existing equality delete files are valid.

> Deletion vectors (DVs) identify deleted rows within a single referenced data file by position in a bitmap

> Deletion vectors are a binary representation of deletes for a single data file that is more efficient at execution time than position delete files.

> Position-based delete files identify deleted rows by file and position in one or more data files, and may optionally contain the deleted row.

> A data row is deleted if there is an entry in a position delete file for the row's file and position in the data file, starting at 0.

> Equality delete files identify deleted rows in a collection of data files by one or more column values, and may optionally contain additional columns of the deleted row.

> Equality delete files must not be added to v4 tables. Equality deletes cannot be added as an entry to a v4 manifest. Equality delete files referenced by v2 or v3 delete manifests must still be applied in a v4 table.

> Equality delete files store any subset of a table's columns and use the table's field ids. The delete columns are the columns of the delete file used to match data rows. Delete columns are identified by id in the delete file metadata column equality_ids.

> A data row is deleted if its values are equal to all delete columns for any row in an equality delete file that applies to the row's data file (see Scan Planning).

> Position deletes (vectors and files) must be applied to data files from the same commit, when the data and delete file data sequence numbers are equal. This allows deleting rows that were added in the same commit.

Contents: the two v2 row-level delete mechanisms this topic builds for real (position deletes by
file+ordinal, equality deletes by column value), the spec's own statement that v3 deprecates
position delete files in favor of deletion vectors (topic 15), and the v4 prohibition on adding
any new equality delete file at all.

## Apache Flink, Iceberg connector docs (Flink Writes — upsert and equality deletes)

URL: https://iceberg.apache.org/docs/latest/flink-writes/
Version: latest (fetched 2026-11-02)

> Iceberg supports UPSERT based on the primary key when writing data into v2 table format. There are two ways to enable upsert.

> OVERWRITE and UPSERT modes are mutually exclusive and cannot be enabled at the same time. When using UPSERT mode with a partitioned table, source columns of corresponding partition fields must be included in the equality fields. For example, if the partition field is days(ts), then ts must be part of the equality fields.

> convertEqualityDeletes() converts equality deletes to deletion vectors (requires equality fields
 and table format version >= 3)

Contents: why a streaming upsert writer like Flink produces equality deletes instead of position
deletes (it doesn't know the row's position in a data file it isn't rewriting), and Iceberg's own
migration path once a table is on v3: converting existing equality deletes into deletion vectors.
