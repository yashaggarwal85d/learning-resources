# Fact-check: Auto Loader incremental file ingestion

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Directory listing is the default mode; file notification subscribes to cloud storage event/queue services and is Databricks' own recommended mode for most workloads | Databricks: Compare Auto Loader file detection modes | Confirmed, verbatim quotes |
| 2 | Directory-listing cost scales with files ingested, not directories scanned | Databricks: What is Auto Loader? | Confirmed, verbatim quote |
| 3 | A RocksDB-backed checkpoint persists discovered-file metadata, giving exactly-once processing and resumability after failure | Databricks: What is Auto Loader? | Confirmed, verbatim quotes |
| 4 | Neither mode guarantees discovery/processing order | Databricks: Compare Auto Loader file detection modes | Confirmed, verbatim quote |
| 5 | `addNewColumns` fails once then resumes with the wider schema; `rescue` never fails and never evolves, routing new columns to the rescue column; `failOnNewColumns` fails and stays failed until fixed | Databricks: Configure schema inference and evolution in Auto Loader | Confirmed, verbatim quotes |
| 6 | The rescued-data column stores a JSON blob with the rescued columns and the source file path, rather than dropping unexpected data | Databricks: Configure schema inference and evolution in Auto Loader | Confirmed, verbatim quotes |
| 7 | `COPY INTO` is retryable and idempotent: already-loaded files are skipped even if modified since, unless `force` disables that idempotency | Databricks: COPY INTO | Confirmed, verbatim quotes |
| 8 | The checkpointed seen-file set and the three schema-evolution modes behave exactly as documented when run against a synthetic file feed and record (examples.py) | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Is the exactly-once reproduction trivial (a Python `set`), or does it actually prove the documented guarantee?** It proves the structural guarantee the documentation describes: a file key, once marked seen, is never re-ingested, regardless of how many times it reappears in a later listing/notification batch — exactly the property Auto Loader's RocksDB checkpoint is documented to provide, modeled with a plain-Python set standing in for the real key-value store.
- **Does the schema-evolution simulation match Databricks' own documented table, or an invented simplification?** Each of the three modeled modes' behaviour (`addNewColumns` fails once then widens; `rescue` never fails, never evolves, routes to rescue; `failOnNewColumns` fails and stays failed) is a direct, verbatim-sourced transcription of SOURCES.md's quoted mode table, not a simplification invented for the demo.
- **Is `COPY INTO`'s idempotency actually comparable to Auto Loader's checkpoint, or a false equivalence?** No — the topic states the real distinction plainly: `COPY INTO` tracks already-loaded files at the file level for periodic batch loads, while Auto Loader's checkpoint underlies an always-on streaming discovery process; both are idempotent at the file level, but at different operational cadences, which is the actual decision rule this topic teaches rather than treating them as interchangeable.

## Outcome

17 quotes across 4 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, asserting both the restart/replay exactly-once behaviour and all three schema-evolution modes' documented outcomes.
