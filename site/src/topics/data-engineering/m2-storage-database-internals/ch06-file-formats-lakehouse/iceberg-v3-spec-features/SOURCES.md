## Apache Iceberg, Table Spec (v3 feature additions)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Deletion vectors are added in v3, stored using the Puffin deletion-vector-v1 blob type

> Writers are not allowed to add new position delete files to v3 tables

> In v3 and later, an Iceberg table must track row lineage fields for all newly created rows.

> A variant is a value that stores semi-structured data. The structure and data types in a variant are not necessarily consistent across rows in a table or data file. The variant type and binary encoding are defined in the Parquet project, with support currently available for V1. Support for Variant is added in Iceberg v3.

> Geospatial features from OGC – Simple feature access. Edge-interpolation is always linear/planar. See Appendix G. Parameterized by CRS C. If not specified, C is OGC:CRS84.

> Geospatial features from OGC – Simple feature access. See Appendix G. Parameterized by CRS C and edge-interpolation algorithm A. If not specified, C is OGC:CRS84 and A is spherical.

> Primitive types added after v1 have an "added by" version that is the first spec version in which the type is allowed. For example, nanosecond-precision timestamps are part of the v3 spec; using v3 types in v1 or v2 tables can break forward compatibility.

> Types variant, geometry, geography, unknown, timestamp_ns, and timestamptz_ns are added in v3.

> All readers are required to read tables with unknown partition transforms, ignoring the unsupported partition fields when filtering.

> Default values are added to struct fields in v3.

> Tables with initial-default will be read correctly by older readers if initial-default is always null for optional fields. Otherwise, old readers will default optional columns with null. Old readers will fail to read required fields which are populated by initial-default because that default is not supported.

> source-ids was added and must be written in the case of a multi-argument transform.

> Keys used for table encryption can be tracked in table metadata as a list named encryption-keys. The schema of each key is a struct with the following fields:

> Encryption keys are tracked by table metadata encryption-keys

Contents: every v3 feature this topic names (deletion vectors, row lineage, variant,
geometry/geography, nanosecond timestamps, the unknown type, default values, multi-argument
transforms, table encryption keys), and the spec's own statement of what an older reader actually
does when it meets one it doesn't understand: ignore (unknown partition transforms), silently
default to null (an optional field's initial-default), or fail outright (a required field's
initial-default).

## Databricks, "The next era of the open lakehouse: Apache Iceberg v3 in Public Preview on Databricks"

URL: https://www.databricks.com/blog/next-era-open-lakehouse-apache-icebergtm-v3-public-preview-databricks
Version: published 2026 (fetched 2026-11-02)

> Unity Catalog Managed Iceberg v3 tables support Row Lineage, Deletion Vectors, and VARIANT, unlocking new use cases and significant performance benefits.

> Deletion vectors allow Iceberg to track which rows have been logically deleted without immediately rewriting the underlying data files.

> Databricks engineers are actively driving several core Iceberg v4 proposals in the Apache community to make metadata simpler, faster and more scalable. These include the adaptive metadata tree, which simplifies the metadata structure so that most operations require writing only a single file instead of several.

Contents: a real, dated, named engine's own account of which v3 features it supports today
(deletion vectors, row lineage, VARIANT) and which it doesn't name as supported (geometry/
geography, nanosecond timestamps, the unknown type, multi-argument transforms, table encryption
keys are absent from this list) — concrete evidence for engine support lag as the real adoption
constraint, plus a forward pointer to v4 work already underway at one vendor.
