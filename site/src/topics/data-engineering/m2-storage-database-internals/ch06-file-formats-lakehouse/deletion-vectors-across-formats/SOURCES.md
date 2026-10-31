# Sources — de.deletion-vectors-across-formats

## Apache Iceberg table specification

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-10-31

> Deletion vectors are a binary representation of deletes for a single data file that is more efficient at execution time than position delete files. Unlike equality or position delete files, there can be at most one deletion vector for a given data file in a snapshot.

> Deletion vectors identify deleted rows of a file by encoding deleted positions in a bitmap. A set bit at position P indicates that the row at position P is deleted.

> These vectors are stored using the deletion-vector-v1 blob definition from the Puffin spec.

> Deletion vectors support positive 64-bit positions, but are optimized for cases where most positions fit in 32 bits by using a collection of 32-bit Roaring bitmaps.

## Apache Iceberg Puffin specification

URL: https://iceberg.apache.org/puffin-spec/
Version: fetched 2026-10-31

> A serialized delete vector (bitmap) that represents the positions of rows in a file that are deleted. A set bit at position P indicates that the row at position P is deleted.

> Note that the length and CRC fields are stored using big-endian, but the Roaring bitmap format uses little-endian values. Big endian values were chosen for compatibility with existing deletion vectors in Delta tables.

> Include cardinality, the number of deleted rows (set positions) in the delete vector

## Delta Lake, What are deletion vectors?

URL: https://docs.delta.io/delta-deletion-vectors/
Version: fetched 2026-10-31

> This feature is available in Delta Lake 2.3.0 and above. This feature is in experimental support mode.

> By default, when a single row in a data file is deleted, the entire Parquet file containing the record must be rewritten. With deletion vectors enabled for the table, some Delta operations use deletion vectors to mark existing rows as removed without rewriting the Parquet file.

> Subsequent reads on the table resolve current table state by applying the deletions noted by deletion vectors to the most recent table version.

> An OPTIMIZE command is run on the table.

> REORG TABLE ... APPLY (PURGE) rewrites all data files containing records with modifications recorded using deletion vectors.

## Apache Hudi, Table and Query Types

URL: https://hudi.apache.org/docs/table_types/
Version: fetched 2026-10-31, docs version 1.2.1

> Data updates and deletes are written to log files (in row based formats like Avro or columnar/base file formats) and these changes in log files are then merged dynamically with base files during query execution.

## RoaringFormatSpec

URL: https://raw.githubusercontent.com/RoaringBitmap/RoaringFormatSpec/master/README.md
Version: fetched 2026-10-31

> Roaring bitmaps are designed to store sets of 32-bit (unsigned) integers. Thus a Roaring bitmap can contain up to 4294967296 integers. They are made of three types of 16-bit containers: array, bitset and run containers.

> a cardinality of up and including 4096 indicates an array container whereas a cardinality above 4096 indicates a bitset container.
