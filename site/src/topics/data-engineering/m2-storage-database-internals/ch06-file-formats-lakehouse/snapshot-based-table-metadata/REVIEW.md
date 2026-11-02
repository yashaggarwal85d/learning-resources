# Review — de.snapshot-based-table-metadata

## Fixes made during build

- **SOURCES.md footnote-marker mismatch**: two Iceberg quotes ("...like HDFS." and "...check-and-put operation.") were initially copied without the trailing `[1]` footnote marker present in the fetched source text. `sources.mjs check` reported "not found word for word" for both. Fixed by re-copying the exact source text including the `[1]` markers.
- **SOURCES.md underscore mismatch**: a Delta PROTOCOL.md quote had its markdown italic underscores stripped around `_snapshot_`, `_transaction log_`, `_data files_`. Fixed by re-copying with underscores preserved.
- **GitHub blob URL fetch failure**: fetching Delta's PROTOCOL.md via the `github.com/.../blob/...` URL crashed `sources.mjs fetch` with an unhandled error. Switched to the raw URL (`raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md`), which fetched cleanly (197,612 chars). Verified no diagram-stripping occurred by checking line counts and context around every quoted line.
- **registry.ts concurrent edit**: the file had been modified on disk by a sibling thread between my read and my edit. The Edit tool applied cleanly; confirmed via `grep -c "id: 'de.snapshot-based-table-metadata'"` that exactly one entry exists, no duplication, file still parses as a valid array.

## Checks — all passed

- `node scripts/sources.mjs check` — 13/13 quotes found word for word, 0 problems.
- `python3 examples.py` — all assertions pass: pinned reader sees 2/2/3 files correctly (unaffected by concurrent commit); compare-and-swap race has exactly one winner via `O_EXCL`, loser gets `FileExistsError` and retry succeeds against the new base.
- `node scripts/narration-teaches.mjs` — clean on the **first draft**, no READS-THE-SCREEN or VERBATIM flags (0–11% overlap across all 10 steps). No rewrite needed this time.
- `node scripts/check-all.mjs --skip reels,links,narration --topic` — pass (locked 67.0s, docs 0.2s, sources 0.1s, build 47.9s).
- `node scripts/check-links.mjs` — 0 broken out of 1880 links checked.
- `node scripts/check-all.mjs --only reels --topic` — **passed on the first try**: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." No phone-overflow fix needed (unlike topics 10 and 11).

## Screenshot review

All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q` variants) manually reviewed. All render cleanly at both viewport sizes: no overlapping or cut-off text, predict states (step 2, step 5) and takeaway blocks (steps 4, 7, 9) all render correctly, Recap step renders cleanly.

## Disclosed local-stand-in pattern (per FACT-CHECK.md)

`examples.py` uses a local filesystem directory (`/tmp/snapshot_table_demo`) in place of a real catalog/object store, with `os.replace` and `os.open(O_EXCL)` standing in for a metastore atomic pointer swap / check-and-put. This is disclosed in the script's docstrings and in FACT-CHECK.md as demonstrating the same atomicity shape a real system provides, not a claim that local disk literally is a catalog. The compare-and-swap race is scripted (not truly concurrent processes), also disclosed as a red-team item.
