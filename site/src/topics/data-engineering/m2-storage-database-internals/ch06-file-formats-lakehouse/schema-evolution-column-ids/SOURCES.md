# Sources — de.schema-evolution-column-ids

## Apache Iceberg table specification

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-10-31

> Columns in Iceberg data files are selected by field id. The table schema's column names and order may change after a data file is written, and projection must be done using field ids.

> Any struct, including a top-level schema, can evolve through deleting fields, adding new fields, renaming existing fields, reordering existing fields, or promoting a primitive using the valid type promotions. Adding a new field assigns a new ID for that field and for any nested fields. Renaming an existing field must change the name, but not the field ID.

> For example, a file may be written with schema 1: a int, 2: b string, 3: c double and read using projection schema 3: measurement, 2: name, 4: a. This must select file columns c (renamed to measurement), b (now called name), and a column of null values called a; in that order.

> The initial-default must be set when a field is added and cannot change

> The write-default must be set when a field is added and may change

## Delta Lake, Delta column mapping

URL: https://docs.delta.io/delta-column-mapping/
Version: fetched 2026-10-31

> Column mapping feature allows Delta table columns and the underlying Parquet file columns to use different names. This enables Delta schema evolution operations such as RENAME COLUMN and DROP COLUMNS on a Delta table without the need to rewrite the underlying Parquet files.

> For a Delta table with the required protocol versions, you can enable column mapping by setting delta.columnMapping.mode to name.

> The Delta table protocol specifies two modes of column mapping, by name and by id. Delta Lake 2.1 and below do not support id mode.
