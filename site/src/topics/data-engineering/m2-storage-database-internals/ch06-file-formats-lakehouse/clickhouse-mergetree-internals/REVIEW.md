# Review — de.clickhouse-mergetree-internals

## Design decision: chdb, not Docker

No Docker daemon is available in this sandbox (confirmed via `docker ps`, same finding as
topic 34). Rather than hand-build a model of MergeTree's mechanics (topic 34's approach for
Trino), this topic uses `chdb` (pip-installable), which embeds a real ClickHouse 26.9 engine
directly in the Python process -- no server process, no Docker, but the literal real engine,
not a simulation. This is disclosed in `examples.py`'s docstring, `SOURCES.md`'s Red team
section, `coverage.json`'s expert notes, `references.md`, and `prerequisites.mdx`.

Verified real behaviors, all executed against live chdb: two INSERTs create two immutable
parts (confirmed via `system.parts`); `OPTIMIZE TABLE ... FINAL` merges them to one, row count
unchanged; a real `EXPLAIN indexes=1` trace shows the sparse primary index pruning granules
(1 of 24 for an hour-wide range over 200,000 rows); a real minmax skip index prunes granules
on a non-sorted column (4 of 37); a materialized view with an `AggregatingMergeTree` target
auto-updates on INSERT with no query run (sum 0 -> 60.0 after two inserts); ReplacingMergeTree
keeps both versions visible across two separate INSERTs until `OPTIMIZE TABLE FINAL` collapses
to the later one; a lightweight `DELETE` drops the row count immediately (1000 -> 900).

## Bugs fixed in examples.py

1. **EXPLAIN-output parsing**: naive string splitting on `"Granules: "` broke because chdb's
   CSV output quotes each line individually, leaving a stray `"` after the number
   (`ValueError: invalid literal for int() with base 10: '1"'`). Fixed with a `_last_fraction`
   regex helper (`re.findall(r"Granules: (\d+)/(\d+)", text)`, last match).
2. **Isolating the minmax index's own Granules fraction** from the PrimaryKey section's
   fraction in the same EXPLAIN output: fixed via `explain.rsplit('Skip"', 1)[1]`, which is
   robust to the leading whitespace inside the CSV-quoted `"           Skip"` line.
3. **`mv_before` assertion**: `sumMerge()` over zero accumulated rows returns the string
   `'0'`, not an empty/null marker -- fixed the assertion accordingly.

All three fixes verified deterministic across 3 full runs of `examples.py` (byte-identical
output each time).

## Checks run

- Stage 1 (`--skip reels,links,narration --topic
  data-engineering/m2-storage-database-internals/ch06-file-formats-lakehouse/clickhouse-mergetree-internals`):
  locked, docs, sources (25/25 quotes word-for-word), build -- all passed clean.
- Stage 2 (`--only links,narration`): narration 0% (0.2s), links 2186 checked, 0 broken --
  passed clean. (Pre-existing title-mismatch warnings on unrelated Rust topics are not from
  this work.)
- Stage 3 (`--only reels`): reel smoke test passed (1 live reel, desktop + phone). The bundled
  `test:editor` step failed with "a save did not open a new GitHub issue" -- this is the known,
  pre-existing cloud-sandbox-only failure documented from prior topics (reproduces on a clean,
  unmodified `main`), not a regression from this topic.

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, desktop/phone 02-q and 05-q) reviewed
individually. All clean: text readable, no overlap, predict/reveal/takeaway layouts correct,
Recap step's four-line stat block renders without overflow on phone (the shape that caused an
overflow bug in an earlier topic).

## Scope boundary

The §5.5/§9.3 serving-context cross-reference named in the syllabus clause is explicitly out
of scope per CHAPTER.md. Text/inverted indexes, projections, and TTL-based part expiry are
named in the syllabus but not independently demonstrated in `examples.py` -- sourced but not
executed, disclosed in `FACT-CHECK.md`'s scope boundary and `coverage.json`'s expert notes.
Replication, sharding, and distributed execution are out of scope (single-node chdb session).
