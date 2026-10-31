# Sources — de.copy-on-write-vs

## Apache Iceberg Table Specification

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-10-31

> Deletion vectors (DVs) identify deleted rows within a single referenced data file by position in a bitmap

> Position delete files identify deleted rows by file location and row position (prohibited in v3)

> Deletion vectors are a binary representation of deletes for a single data file that is more efficient at execution time than position delete files.

## Apache Hudi — Table & Query Types

URL: https://hudi.apache.org/docs/table_types/
Version: fetched 2026-10-31

> The Copy-on-Write (CoW) table type is optimized for read-heavy workloads. In this mode, record updates or deletes
trigger the creation of new base files in a file group and there are no log files written.

> This ensures that each query reads only the base files,
offering high read performance with no need to merge log files dynamically.

> The Merge-on-Read (MoR) table type balances the write and read performance by combining
lightweight log files with the base file using periodic compaction.

> Data updates and deletes are written to log files (in row based formats like Avro or
columnar/base file formats) and these changes in log files are then merged dynamically with base files during query execution.

> A periodic compaction process reconciles these changes from the delta log and produces a new version of base file, just like what happened at 10:05 in the example.

## Delta Lake — What are deletion vectors?

URL: https://docs.delta.io/delta-deletion-vectors/
Version: fetched 2026-10-31

> By default, when a single row in a data file is deleted, the entire Parquet file containing the record must be rewritten.

> With deletion vectors enabled for the table, some Delta operations use deletion vectors to mark existing rows as removed without rewriting the Parquet file.

> Subsequent reads on the table resolve current table state by applying the deletions noted by deletion vectors to the most recent table version.

> An OPTIMIZE command is run on the table.

> REORG TABLE ... APPLY (PURGE) rewrites all data files containing records with modifications recorded using deletion vectors.
