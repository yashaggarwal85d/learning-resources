# Fact-check — de.schema-evolution-column-ids

## Claims table

| # | Claim (as stated in the reel) | Source | Verified |
|---|---|---|---|
| 1 | Iceberg columns are selected by field ID; the schema's column names and order may change after a data file is written, and projection must be done using field ids | Iceberg spec | Yes — direct quote |
| 2 | Renaming an existing field must change the name but not the field ID; adding a new field assigns a new ID | Iceberg spec | Yes — direct quote |
| 3 | Iceberg's own worked example: a file written as `1: a, 2: b, 3: c` read under projection `3: measurement, 2: name, 4: a` selects `c` (renamed), `b` (renamed), and a new null column `a` | Iceberg spec | Yes — direct quote |
| 4 | A required field added to a schema must have both an initial-default and a write-default set; the write-default may later change, the initial-default cannot | Iceberg spec | Yes — direct quote |
| 5 | Delta's column mapping lets Delta table columns and the underlying Parquet file columns use different names, enabling RENAME COLUMN and DROP COLUMNS without rewriting the underlying Parquet files | docs.delta.io | Yes — direct quote |
| 6 | Column mapping is enabled by setting `delta.columnMapping.mode` to `name` | docs.delta.io | Yes — direct quote |
| 7 | Delta's column mapping protocol has two modes, `name` and `id`; Delta Lake 2.1 and below do not support `id` mode | docs.delta.io | Yes — direct quote |
| 8 | Reproduced for real: position-based projection of a renamed-and-reordered table silently assigns a shifted column's real value to the wrong logical column | examples.py Part 1 | Yes — reproduced for real on local disk |
| 9 | Reproduced for real: field-ID projection of the identical renamed-and-reordered table resolves every column correctly, with the genuinely new column reading back missing | examples.py Part 1 | Yes — reproduced for real on local disk |
| 10 | Reproduced for real: without a stable physical-name mapping, renaming a column really does rewrite the data file's bytes | examples.py Part 2 | Yes — reproduced for real on local disk, verified by byte comparison |
| 11 | Reproduced for real: with a stable physical-name mapping, renaming a column leaves the data file's bytes byte-for-byte identical | examples.py Part 2 | Yes — reproduced for real on local disk, verified by byte comparison |

## Currency note

Both sources fetched 2026-10-31. Iceberg spec's current Schema Evolution and Column Projection
sections. Delta's column-mapping doc notes the feature is "currently experimental with known
limitations" as of Delta Lake 1.2.0+ — this topic treats it as Delta's real, documented mechanism
today, not a claim it is stable-forever or default-on. The doc also notes enabling column mapping
is an irreversible protocol upgrade, which this topic does not demonstrate (out of scope).

## Red-team

1. **The "table" in `examples.py` is plain CSV text, not Parquet/Iceberg/Delta's real binary
   formats.** Disclosed in the script's own module docstring. What transfers is the real,
   general mechanism — Iceberg's field-ID projection and Delta's logical-to-physical name
   mapping — not a claim of reproducing either format's actual file layout or protocol-level
   metadata structures.
2. **Part 1's "Iceberg-style" file stores field IDs in a plain CSV header row**, not Iceberg's
   real Parquet-embedded field-ID column metadata or its manifest-tracked schema IDs. The
   projection logic (match by ID, fall back to null for a column absent from the file) is the
   real mechanism Iceberg's own Column Projection section describes; the storage format is a
   simplification.
3. **Part 2's "without column mapping" demo assumes the physical column name always equals the
   logical name**, which is Delta's actual default behavior before column mapping is enabled —
   this is a real, sourced distinction (the mapping doc's own "allows Delta table columns and the
   underlying Parquet file columns to use different names," implying they are the same name
   without it), not an invented contrast.
4. **This topic does not demonstrate type widening or nested-struct evolution with real code** —
   only rename/reorder/add are reproduced for real on disk. Type widening and defaults are
   covered via Iceberg's own sourced default-value rules (step 9) as a stated consequence of the
   same stable-ID mechanism, consistent with this chapter's established pattern of citing a
   claim directly from a source rather than fabricating a demo for every sub-claim within a
   10-step budget.
5. **Enabling column mapping is an irreversible, protocol-upgrading operation per Delta's own
   docs** — this topic's demo treats "with column mapping" and "without column mapping" as two
   separately constructed tables, not a live migration of one table, since demonstrating the
   actual migration step is out of this topic's 15-minute budget.
6. **This topic does not cover snapshot lifecycle or time travel** — that is explicitly the next
   topic's subject, and this topic's own handoff names that boundary.

## Problem-solving notes

No flaky or intermittent failures were hit building this topic's `examples.py` — all operations
are pure in-memory logic plus small, deterministic local file reads/writes with no timing
assertions, verified by running the full script 3 times consecutively with identical output each
time.
