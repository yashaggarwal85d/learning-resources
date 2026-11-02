# Review — de.position-equality-deletes

## What this topic does

Builds two real v2 row-level delete files against a real `pyiceberg` table: a position delete
(file path + row ordinal) and an equality delete (matching column values, as a streaming upsert
writer like Flink would produce). The position delete is written and read back entirely through
pyiceberg's own public `table.scan()`. The equality delete is written the same real way, but
pyiceberg 0.12.0's own `table.scan()` refuses to read any table carrying one — a genuine, disclosed
limitation (open upstream issue, not a construction mistake) — so its merge is demonstrated by
hand: reading the data file and the delete file directly and performing the same column-value join
a conformant v2 reader performs. The read-side cost gap between the two (zero column values read
for a position delete vs. every row's value compared for an equality delete) is measured directly
and is the real reason v3 deprecates position delete files in favor of deletion vectors and v4
drafts forbid new equality deletes outright.

## Resolving the equality-delete read-back blocker

The original approach (write + read back purely through `table.scan()`, the same pattern topic 21
used for `rewrite_manifests` and this topic used successfully for the position delete) hit a hard
limitation: pyiceberg 0.12.0's own `plan_files()` raises `ValueError: PyIceberg does not yet
support equality deletes`, citing the real open upstream issue
https://github.com/apache/iceberg/issues/6568. Confirmed this is a deliberate library guard, not a
bug in the delete file's construction, by comparing the equality-delete `DataFile`/`ManifestEntry`
construction against the structurally identical, working position-delete construction. Resolved by
reading both files directly with `pyarrow` and performing the join by hand — the same operation a
conformant reader performs internally — disclosed in `examples.py`'s own docstring, FACT-CHECK.md's
red-team section, and the reel itself (step 7).

## Checks run

- `node scripts/sources.mjs check <folder>`: 15/15 quotes verified word-for-word, no fixes needed.
- `python3 examples.py` run 3x: byte-identical output each time. The read-side cost comparison
  deliberately counts column values read/compared rather than wall-clock time, specifically so
  output stays deterministic across runs.
- `node scripts/narration-teaches.mjs <folder>`: passed clean, no fixes needed (longest line 43w).
- `node scripts/check-all.mjs --skip reels,links,narration --topic ...`: failed once — reel.tsx
  named "topic 15" as a literal number not computed/asserted by examples.py (digit-provenance
  check), fixed by removing the topic-number reference; passed clean on retry (locked 70.7s, docs
  0.2s, sources 0.1s, build 43.6s).
- `node scripts/check-all.mjs --only links,narration --topic ...`: passed (2134 links, 0 broken;
  the title-mismatch warnings shown are all pre-existing, unrelated to this topic).
- `node scripts/check-all.mjs --only reels --topic ...`: passed clean on the first try ("Reel smoke
  test passed: 1 live reel(s) at desktop and phone sizes"). Only the known pre-existing
  `test:editor` sandbox failure showed.

## Manual screenshot review

All 10 desktop steps, all 10 phone steps, and both `-q` predict-wait variants (steps 2 and 5,
phone + desktop) reviewed via the Read tool — all clean, no overflow, no layout issues.

## Git

Committed, rebased onto `origin/main`, pushed. `renarration.json` and `registry.ts` entries
re-verified present after rebase.
