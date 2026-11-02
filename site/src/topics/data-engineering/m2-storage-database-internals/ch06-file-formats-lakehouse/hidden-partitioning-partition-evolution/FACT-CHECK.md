# Fact-check — de.hidden-partitioning-partition-evolution

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Iceberg supports hidden partitioning, unlike other table formats such as Hive | Iceberg Partitioning docs | Verified |
| 2 | Iceberg produces partition values by taking a column value and optionally transforming it, and keeps track of the relationship | Iceberg Partitioning docs | Verified |
| 3 | Because Iceberg doesn't require user-maintained partition columns, it can hide partitioning; producers and consumers wouldn't even see the derived column | Iceberg Partitioning docs | Verified |
| 4 | Queries don't depend on a table's physical layout; Iceberg tables can evolve partition schemes over time without an expensive migration | Iceberg Partitioning docs | Verified |
| 5 | `identity` transform: source value, unmodified | Iceberg spec | Verified |
| 6 | `bucket[N]` transform: hash of value, mod N | Iceberg spec | Verified |
| 7 | `truncate[W]` transform: value truncated to width W | Iceberg spec | Verified |
| 8 | `hour` transform: extract a timestamp hour, as hours from 1970-01-01 00:00:00 | Iceberg spec | Verified |
| 9 | Partitioning can be evolved by adding, removing, renaming, or reordering partition spec fields | Iceberg spec | Verified |
| 10 | Changing a partition spec produces a new spec with its own ID, added to the table's list of partition specs | Iceberg spec | Verified |
| 11 | The table's current partition spec is used by writers to partition new data, but reads use the specs stored in manifest files, not the table's current default | Iceberg spec | Verified |
| 12 | A single-argument transform writes only `source-id`; a multi-argument transform writes `source-ids` instead | Iceberg spec | Verified |
| 13 | `source-ids` was added for v3 and must be written for multi-argument transforms | Iceberg spec | Verified |

## Red-team

- **Is this a real Iceberg table evolving its real partition spec, or a simulation?** Real.
  `examples.py` builds a table with the real `pyiceberg` library (0.12.0), calls the real
  `table.update_spec()` API (`remove_field`, `add_field`), and reads the result back through
  `table.specs()`, `table.inspect.data_files()`, `table.inspect.manifests()`, and
  `table.scan(...).plan_files()` — the same real interfaces topic 21 used, not a model of the
  evolution mechanism.
- **Does "old data not rewritten" actually hold, or is it merely not disproven?** Checked
  positively: after the spec evolves, `table.inspect.data_files()` is filtered by `spec_id`
  equal to the old spec's id, and the count of files still carrying that old spec id is asserted
  to be at least the number of old-era commits — i.e. those files still exist, under their
  original spec, rather than having disappeared or been silently rewritten.
- **Does the source-column query really prune via each manifest's own recorded spec, not the
  table's current default?** Measured directly, not inferred: a query filtering on `id` (never
  naming `ts_day`, `ts_hour`, or `id_bucket`) plans to exactly one file whether the matching row
  is in the old era (written under the now-non-default old spec) or the new era, and the two
  returned files' `spec_id` values are asserted to differ — proof planning consulted each file's
  own manifest-recorded spec rather than only the table's current default spec.
- **v3 multi-argument transforms are described, not built.** `examples.py` builds only
  single-argument transforms (`day`, `hour`, `bucket`) since pyiceberg 0.12.0's table version in
  this sandbox is v2 by default; the multi-argument mechanism is named from the spec's own v3
  writing rules (`source-ids` required for multi-argument transforms) as the current extension
  of the same idea, not executed.
- **Scope boundary.** This topic does not cover `truncate[W]` or `identity` executed end-to-end
  (only `day`, `hour`, and `bucket[N]` are built), nor does it cover partition spec evolution's
  v1-specific compatibility rules (no reordering, no dropping without `void`) — named from the
  spec but not exercised, since the table built here is v2.
