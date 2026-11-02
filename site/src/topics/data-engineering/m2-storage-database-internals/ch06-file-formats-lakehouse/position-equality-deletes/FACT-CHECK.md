# Fact-check — de.position-equality-deletes

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Position deletes mark a row deleted by data file path and row position; encoded in a position delete file (v2) or a deletion vector (v3+) | Iceberg spec | Verified |
| 2 | Equality deletes mark a row deleted by one or more column values (e.g. `id = 5`); encoded in an equality delete file, creatable only in v2 and v3 tables | Iceberg spec | Verified |
| 3 | Row-level deletes were added by v2 and aren't supported in v1; deletion vectors were added in v3; position delete files must not be added to v3 tables (existing ones stay valid); equality delete files must not be added to v4 tables (existing ones stay valid) | Iceberg spec | Verified |
| 4 | Deletion vectors identify deleted rows within one data file by position in a bitmap, and are more efficient at execution time than position delete files | Iceberg spec | Verified |
| 5 | A data row is deleted if there's an entry in a position delete file for that row's file and position, starting at 0 | Iceberg spec | Verified |
| 6 | Equality delete files store any subset of a table's columns, using the table's field ids; the matching columns are named by id in the file's own `equality_ids` metadata | Iceberg spec | Verified |
| 7 | A data row is deleted if its values equal all delete columns for any row in an applicable equality delete file | Iceberg spec | Verified |
| 8 | Position deletes (vectors and files) must be applied to data files from the same commit when the data and delete file's data sequence numbers are equal, so a commit can delete rows it just added | Iceberg spec | Verified |
| 9 | Iceberg supports UPSERT based on a primary key when writing into a v2 table, enabled at the table level or per write | Flink Iceberg connector docs | Verified |
| 10 | OVERWRITE and UPSERT modes are mutually exclusive; in UPSERT mode on a partitioned table, the partition's source columns must be included in the equality fields | Flink Iceberg connector docs | Verified |
| 11 | `convertEqualityDeletes()` converts a table's existing equality deletes to deletion vectors, and requires table format version 3 or above | Flink Iceberg connector docs | Verified |
| 12 | Equality delete files must not be added to v4 tables at all; equality deletes can't be added as an entry to a v4 manifest, though v2/v3-written equality delete files still referenced by delete manifests must still be applied | Iceberg spec | Verified |

## Red-team

- **Are these real Iceberg delete files against a real table, or a simulation?** Real for both
  kinds. `examples.py` builds a real `pyiceberg` (0.12.0) table, writes a real position-delete
  Parquet file and a real equality-delete Parquet file using the library's own
  `POSITIONAL_DELETE_SCHEMA`/`DataFile`/`ManifestEntry` primitives, and commits each as a real new
  snapshot via `table.transaction()._apply(...)` — the exact same low-level construction topic 21
  used for `rewrite_manifests` and topic 22 used nowhere (it didn't need to), since pyiceberg
  0.12.0 exposes no public writer for either delete kind.
- **Does the position delete actually get read back correctly?** Yes, and through pyiceberg's own
  public read path, no workaround: `catalog.load_table(...).scan().to_arrow()` on the reloaded
  table returns exactly the 8 remaining rows after dropping positions 3 and 7 from a 10-row file —
  verified by direct assertion against the expected id set, not just "it ran with no error."
- **Can the equality delete be read back the same way?** No — this is the one significant gap in
  this topic, disclosed plainly: committing the equality-delete file succeeds with no error (the
  low-level write primitives accept it fine), but calling `table.scan()` or `plan_files()` on the
  reloaded table raises a hard-coded `ValueError: PyIceberg does not yet support equality deletes`,
  from inside pyiceberg's own `Table.plan_files()`/`_plan_files_local()` code, citing
  https://github.com/apache/iceberg/issues/6568. This is not a mistake in how the delete file or
  manifest was constructed — the construction is structurally identical to the working
  position-delete path — it is a genuine, currently-open gap in this specific library's read
  support. `examples.py` works around it by reading the data file and the equality-delete file
  directly with `pyarrow` and performing the same column-value join a conformant v2 reader would,
  rather than going through `table.scan()`. This is disclosed in-script and here, not hidden.
- **Is the measured read-side cost comparison real, or a timing number that could vary across
  runs?** Real mechanics, but deliberately not wall-clock: `examples.py` counts column values read
  and compared (every row's `id` value, for the equality join) against direct offset lookups
  (zero column values touched, for the position delete) rather than measuring elapsed time, so the
  comparison stays exact and byte-identical across the determinism check's 3 runs, while still
  reflecting the real mechanical difference the spec itself names — a lookup versus a predicate
  join over every row.
- **Scope boundary.** This topic builds exactly one equality-delete file matching on a single
  column (`id`); it does not build a multi-column equality delete (`AND` of several columns, per
  the spec's `id = 4 AND category IS NULL` example) or a delete file that also stores the deleted
  row's other column values (the optional `row`/extra-columns feature) — both named from the spec
  but not executed. `convertEqualityDeletes()`'s actual migration to deletion vectors (Flink's
  side, requiring a v3 table) is named from its own documentation, not run, since the table built
  here is v2 throughout.
