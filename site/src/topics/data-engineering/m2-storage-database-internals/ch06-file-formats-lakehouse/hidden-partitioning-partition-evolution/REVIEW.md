# Review — de.hidden-partitioning-partition-evolution

## What this topic does

Builds a real Iceberg table with `pyiceberg` whose partition spec starts as `day(ts)` and is
evolved mid-life, with the real `update_spec()` API, to `hour(ts)` plus `bucket(4, id)` —
without rewriting a single file from the old era. Measures: both specs coexist on the table;
old-era files stay tagged with the old spec id; a source-column query (`id`, never naming any
transform) prunes to exactly one file whether the match is in the old era or the new one; and a
full scan reads all 20 rows correctly across both eras. v3 multi-argument transforms are named
as the current extension, not built, since this sandbox's table defaults to format version 2.

## Checks run

- `node scripts/sources.mjs check <folder>`: 13/13 quotes verified word-for-word (one fix needed
  — table-cell description quotes had to be isolated per-cell rather than reassembled with
  em-dashes, since the raw fetched text doesn't join them that way).
- `python3 examples.py` run 3x: byte-identical output each time. Required installing
  `pyiceberg[pyiceberg-core]` for the `DayTransform`/`HourTransform`/`BucketTransform` pyarrow
  implementations (separate from the base `pyiceberg[pyarrow,sql-sqlite]` topic 21 installed).
- `node scripts/narration-teaches.mjs <folder>`: failed once (step 3's second line at 52 words),
  fixed by trimming; passed clean on retry.
- `node scripts/check-all.mjs --skip reels,links,narration --topic ...`: failed once on
  pre-notes.md needing 4-14 term bullets (had 1), fixed by expanding to 6; passed clean on retry
  (locked 75.2s, docs 0.2s, sources 0.0s, build 49.6s).
- `node scripts/check-all.mjs --only links,narration --topic ...`: passed (2133 links, 0 broken).
- `node scripts/check-all.mjs --only reels --topic ...`: failed once on phone overflow (steps 4
  and 7, both `TallRow` values too long/underscore-dense), fixed by shortening both; passed clean
  on retry ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes"). Only the known
  pre-existing `test:editor` sandbox failure showed.

## Manual screenshot review

All 10 desktop steps, all 10 phone steps, and both `-q` predict-wait variants reviewed via the
Read tool — all clean after the two fixes above.

## New external dependency detail

`pyiceberg-core` extra needed for pyarrow-backed time/bucket transforms
(`transform.pyarrow_transform`) — not required by topic 21's simpler append-only writes.
Installed alongside the existing `pyiceberg[pyarrow,sql-sqlite]`.

## Git

Committed, rebased onto `origin/main`, pushed. `renarration.json` and `registry.ts` entries
re-verified present after rebase.
