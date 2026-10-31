# Outline: Auto Loader incremental file ingestion

**Syllabus line (syllabus/data-engineering.md):** "directory-listing vs file-notification discovery, the checkpointed (RocksDB) set of seen files that yields exactly-once file ingestion, schema inference and evolution modes, the rescued-data column, vs idempotent `COPY INTO` batch loads (§8.1)."

## Claims to fact-check

1. Auto Loader uses directory-listing mode by default; file-notification mode subscribes to cloud storage event/queue services and is Databricks' own recommended mode for most workloads (Databricks: Compare Auto Loader file detection modes).
2. Auto Loader's cost in directory-listing mode scales with files ingested, not directories scanned — the opposite framing from a naive LIST-every-prefix approach (Databricks: What is Auto Loader?).
3. Auto Loader persists discovered-file metadata in a RocksDB-backed key-value store at the checkpoint location, giving exactly-once processing and resumability after failure (Databricks: What is Auto Loader?).
4. Auto Loader does not guarantee discovery or processing order in either mode (Databricks: Compare Auto Loader file detection modes).
5. Auto Loader's documented schema-evolution modes behave differently on a new column: `addNewColumns` (default) fails the stream once and resumes with the new schema on restart; `rescue` never fails and never evolves, routing new columns into the rescue column instead; `failOnNewColumns` fails and does not restart until the schema or file is fixed (Databricks: Configure schema inference and evolution in Auto Loader).
6. The rescued-data column captures unexpected or mismatched data as a JSON blob with the source file path, rather than silently dropping it (Databricks: Configure schema inference and evolution in Auto Loader).
7. `COPY INTO` is a retryable, idempotent batch load: files already loaded are skipped even if modified since, unless `force` is explicitly set to disable that idempotency (Databricks: COPY INTO).

## Changes from the chapter plan

CHAPTER.md's scope line drops a `(§8.1)` cross-reference that the real syllabus line carries after "vs idempotent `COPY INTO` batch loads." That's a forward pointer to another chapter's own idempotent-write content, not a claim this topic has to teach itself; it's disclosed here rather than silently omitted, the same way earlier chapter-10 topics flagged CHAPTER.md's paraphrase dropping a detail the real syllabus line keeps.

A second note on scope: this topic cannot run a real Databricks Auto Loader stream in this sandbox. Every claim about discovery modes, the RocksDB checkpoint, schema evolution behavior and the rescued-data column is sourced directly from Databricks' own current documentation. The worked reproduction (`examples.py`) builds a local analogue of the checkpointed-seen-file-set mechanism and the schema-evolution/rescue-column behavior using plain Python and JSON files — a disclosed structural simulation of the documented mechanism, not a live Auto Loader run.

## Engagement arc

Hook: a partner's feed adds a new column overnight; a naive ingestion job either crashes at 3 a.m. or silently drops the new field forever, while an Auto Loader stream configured to evolve its schema simply picks the column up on the next micro-batch, with every previously-malformed row still recoverable from the rescue column instead of discarded. Early prediction: before naming the mechanism, ask what a stream needs to guarantee to avoid re-ingesting a file after a restart. Teaching: the two discovery modes and their real cost shapes; the RocksDB-backed seen-file checkpoint; the four schema-evolution modes side by side; the rescue column reproduced against a local malformed row; `COPY INTO` as the lighter-weight idempotent alternative. Recap + takeaways. Second predict step: choosing Auto Loader vs `COPY INTO` for a stated ingestion shape.

## Concept ledger

**Introduces:** `auto-loader-discovery-checkpoint`, `rescued-data-column`.
**Uses:** `object-store-consistency-guarantee` (topic 2), `databricks-compute-sku-model` (topic 11), `prefix-throttling-hot-key` (named, not confirmed live — see leaves-out note below).
**Declared:** none beyond topic 11.

## Bridge / handoff

**Bridge:** "Compute is only useful once data actually arrives on it, and Databricks' own answer to 'files keep landing in object storage' is this topic: how it discovers new files, how it guarantees each one is ingested exactly once, and what happens to a row that doesn't match the schema it expected."

**Handoff:** "Discovering and ingesting files is only useful if the result is governed the moment it lands — and Databricks' governance layer, which this chapter's catalog-and-vending pattern takes a concrete, fully-worked shape in, is next."
