# Fact-check — de.iceberg-v3-spec-features

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Deletion vectors are added in v3, stored using the Puffin deletion-vector-v1 blob type | Iceberg spec | Verified |
| 2 | Writers are not allowed to add new position delete files to v3 tables | Iceberg spec | Verified |
| 3 | In v3 and later, an Iceberg table must track row lineage fields for all newly created rows | Iceberg spec | Verified |
| 4 | Support for the Variant semi-structured type is added in Iceberg v3 | Iceberg spec | Verified |
| 5 | Geometry and geography types are geospatial features from OGC Simple feature access, parameterized by a CRS (and, for geography, an edge-interpolation algorithm) | Iceberg spec | Verified |
| 6 | Nanosecond-precision timestamps are part of the v3 spec; using v3 types in v1 or v2 tables can break forward compatibility | Iceberg spec | Verified |
| 7 | The types variant, geometry, geography, unknown, timestamp_ns, and timestamptz_ns are all added in v3 | Iceberg spec | Verified |
| 8 | All readers are required to read tables with unknown partition transforms, ignoring the unsupported partition fields when filtering | Iceberg spec | Verified |
| 9 | Default values are added to struct fields in v3 | Iceberg spec | Verified |
| 10 | An optional field's initial-default reads correctly on older readers if the default is always null; otherwise old readers default optional columns with null; old readers fail to read a required field populated by initial-default | Iceberg spec | Verified |
| 11 | A multi-argument transform must write source-ids in its spec field, added in v3 | Iceberg spec | Verified |
| 12 | Table encryption keys can be tracked in table metadata as a list named encryption-keys, with each key as a struct | Iceberg spec | Verified |
| 13 | Databricks's Unity Catalog Managed Iceberg v3 tables support Row Lineage, Deletion Vectors, and VARIANT as of its public preview announcement | Databricks blog | Verified |
| 14 | Deletion vectors let Iceberg track logically deleted rows without immediately rewriting the underlying data files | Databricks blog | Verified |
| 15 | Databricks engineers are driving v4 proposals including an adaptive metadata tree that simplifies metadata so most operations write only a single file | Databricks blog | Verified |

## Red-team

- **Is "pyiceberg can't write v3 tables" verified directly, or assumed from general knowledge?**
  Measured directly: `examples.py` calls `catalog.create_table(..., properties={"format-version":
  "3"})` against the real, installed `pyiceberg` (0.12.0) and catches the real exception it
  raises — `NotImplementedError: Writing V3 is not yet supported, see:
  https://github.com/apache/iceberg-python/issues/1551` — a real, open, named upstream issue, not
  a description from documentation or memory.
- **Is the default-value read-fallback demo really exercising a v3-only feature, or is this
  something v2 already supported?** The spec states plainly "Default values are added to struct
  fields in v3" — this script adds a default value to a column on an ordinary v2-format table
  (`format_version == 2`, asserted directly) and confirms both halves of the fallback: existing
  rows read the default value correctly, and a newly appended row keeps its own explicit value.
  This is disclosed as a genuine instance of a widely used v2 implementation running ahead of (or
  around) the version boundary the spec itself draws — worth naming plainly rather than treating
  as settled v2/v3 separation.
- **Is the "three features supported today" claim about Databricks cherry-picked, or is it the
  vendor's own complete list?** The quoted sentence is the blog's own summary line naming exactly
  which v3 features its managed tables support (Row Lineage, Deletion Vectors, VARIANT); the other
  five v3 features named in this topic (geometry/geography, nanosecond timestamps, the unknown
  type, column default values, multi-argument transforms, table encryption keys) are absent from
  that list and from the rest of the fetched article — their absence is reported as an absence,
  not confirmed as "unsupported forever," since a vendor's own blog is a point-in-time snapshot
  (published and fetched 2026).
- **Scope boundary.** No v3 table is actually built anywhere in this topic or this sandbox — the
  only real demonstrations are a blocked write attempt and a v3-spec behavior (default values)
  exercised on a v2 table. Geometry/geography, nanosecond timestamps, the unknown type,
  multi-argument transforms, and table encryption keys are named from the spec's own text, not
  built or exercised in any form here.
