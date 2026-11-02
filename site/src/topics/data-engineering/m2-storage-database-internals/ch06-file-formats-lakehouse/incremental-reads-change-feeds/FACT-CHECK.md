# Fact-check — de.incremental-reads-change-feeds

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Iceberg v3 tracks row lineage fields (`next-row-id` table field, `_row_id`, `_last_updated_sequence_number`) for all newly created rows | Iceberg spec | Verified |
| 2 | `_row_id` is a unique long identifier assigned via inheritance when a row is first added | Iceberg spec | Verified |
| 3 | `_last_updated_sequence_number` is the sequence number of the commit that last updated a row, inherited when first added or modified | Iceberg spec | Verified |
| 4 | A row's `_row_id` is assigned from its containing data file's `first_row_id` plus row position | Iceberg spec | Verified |
| 5 | A new append snapshot's `first-row-id` is set to the table's `next-row-id`, which is then updated | Iceberg spec | Verified |
| 6 | Upgrading a table to v3 initializes `next-row-id` to 0; existing snapshots' row-id fields read as null | Iceberg spec | Verified |
| 7 | Equality deletes break row lineage entirely — a reinserted row gets a brand-new `_row_id`, not the original | Iceberg spec | Verified |
| 8 | Iceberg's plain incremental scan takes `start-snapshot-id` (exclusive) and `end-snapshot-id` (inclusive) | Iceberg Queries docs | Verified |
| 9 | It only reads append operations; it cannot support replace, overwrite, or delete operations in range | Iceberg Queries docs | Verified |
| 10 | `create_changelog_view` reads a table's changes as `INSERT` / `DELETE` / `UPDATE_BEFORE` / `UPDATE_AFTER` row events | Iceberg Procedures docs | Verified |
| 11 | Carry-over rows are the result of copy-on-write row-level operations (MERGE/UPDATE/DELETE) rewriting a file that also holds untouched rows, which then appear as a spurious DELETE+INSERT pair | Iceberg Procedures docs | Verified |
| 12 | The procedure removes carry-over rows by default | Iceberg Procedures docs | Verified |
| 13 | Delta's Change Data Feed tags change records `insert` / `update_preimage` / `update_postimage` / `delete` | Databricks CDF docs | Verified |
| 14 | CDF only records changes after it was enabled; querying before that raises an error | Databricks CDF docs | Verified |
| 15 | Some operations (insert-only, full-partition deletes) don't generate change data files; CDF falls back to the transaction log | Databricks CDF docs | Verified |
| 16 | Change data files follow the table's retention policy; `VACUUM` deletes them | Databricks CDF docs | Verified |
| 17 | Hudi's CDC queries return full before/after images and the change operation within a time window | Hudi SQL Queries docs | Verified |
| 18 | Hudi's incremental ('latest_state') queries are cheaper than CDC because they amortize the cost of compactions | Hudi SQL Queries docs | Verified |
| 19 | Hudi's start/end commit range for batch incremental reads is a closed interval (both inclusive) — cited for the Flink reader specifically, not claimed as the Spark TVF's semantics | Hudi SQL Queries docs | Verified, scoped |

## Red-team

- **Is the row-lineage model "real Iceberg," or a from-scratch reimplementation?** It is a
  from-scratch Python model that implements the v3 spec's actual rules (next-row-id counter,
  first_row_id inheritance, when `_last_updated_sequence_number` resets vs. carries forward) —
  not a wrapper around a real Iceberg catalog or Spark session, which this sandbox cannot run.
  Every rule the model encodes is the literal rule quoted from the spec in SOURCES.md, and the
  three demos measure real emergent behavior of that model (10+10 spurious changes vs. 1 real
  one; 40 spurious vs. 0 real), not a scripted result.
- **Does the naive-vs-lineage scan distinction actually match `create_changelog_view`'s
  carry-over filtering?** Yes — the source's own example (file holding row1+row2, deleting row2
  forces row1 into a new file, changelog shows row1 as a spurious DELETE+INSERT pair) is the
  exact shape of this topic's demo, scaled up to 10 and 20 rows respectively.
- **Delta and Hudi are described, not modeled.** examples.py implements only Iceberg's own
  mechanism directly. Delta's CDF and Hudi's `hudi_table_changes` are introduced by name and by
  their own documented column/mode semantics (quoted in SOURCES.md), not re-implemented, because
  this sandbox has no real Delta or Hudi runtime and the topic's point is that all three rest on
  the same underlying idea — a stable row identity or a windowed diff — not that their code is
  identical.
- **`_last_updated_sequence_number` as the sole "did this row actually change" signal.** This
  mirrors the spec directly: the field is defined to reset only when a row is modified and to
  carry forward unchanged otherwise, so comparing it across two snapshots is exactly the
  mechanism the format itself provides — not a simplification invented for this topic.
- **Scope boundary.** This topic does not cover Iceberg's merge-on-read delete-file case for
  changelog scans (per the Palantir/Dremio secondary sources, changelog scans historically could
  not read snapshots containing delete files) — out of scope, not claimed here.
