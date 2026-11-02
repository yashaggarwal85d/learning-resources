# REVIEW — de.delta-transaction-log

## What this topic builds

A real `_delta_log` directory, written by hand to the Delta Lake transaction log protocol: five
newline-delimited JSON commits (`add`/`remove`/`metaData`/`protocol` actions); table state
reconstructed by hand from the raw log, checked against exact expected files and row counts; a
real classic Parquet checkpoint (via pyarrow, this repo's baseline dependency) verified against
an independent from-scratch replay; a real `_last_checkpoint` pointer; a real short-circuit from
that checkpoint matching a full replay; a real log compaction file matching its source commits; a
real version checksum computed from live state; and a real upgrade from numeric protocol versions
to named table features. Opens the Delta arc, closing the §6.3.1 Iceberg arc from topic 26.

Named from sourced documentation only, not built: multi-part checkpoints (deprecated per the spec
itself) and UUID-named V2 checkpoints with sidecar files.

## Fixes made during the build

- `reel.tsx`'s step 6 takeaway was 22 words against a 20-word limit; trimmed.
- `scenes.tsx`'s step 8 phone layout overflowed the drawing with "numFiles, tableSizeBytes --
  computed, not asserted" as the value text — the recurring phone-viewport text-overlap bug class
  (per project memory: shorten the label/value to 1-3 words). Fixed to "computed from real
  state".
- `SOURCES.md`'s initial quotes used `[...]` to splice together non-adjacent spec text and one
  quote relied on italic markdown (`_greater_`) the checker doesn't match against rendered text —
  both are invalid for the word-for-word source check. Replaced with genuinely contiguous quotes.
  Also had to use the `raw.githubusercontent.com` URL rather than the `github.com/.../blob/...`
  URL, since GitHub blocks the latter with HTTP 403 for both fetch and the source checker.

## Checks run

- `narration-teaches.mjs`: clean after trimming one over-length line in step 10 (48 words max,
  0-5% description-overlap across all steps).
- `check-all.mjs --skip reels,links,narration --topic delta-transaction-log`: locked, docs,
  sources, build all pass (after the takeaway word-count fix).
- `check-all.mjs --only links,narration --topic delta-transaction-log`: both pass (2143 links, 0
  broken; 92 pre-existing title mismatches across the whole site, unrelated to this topic).
- `check-all.mjs --only reels --topic .../delta-transaction-log`: failed once on the phone-layout
  overflow above; passed clean after the fix, at both desktop and phone sizes. `test:editor`
  fails with its known pre-existing sandbox limitation (confirmed by multiple prior topics; not a
  regression).

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, plus the four `-q` predict-wait variants:
desktop/phone × step02/step05) reviewed by hand. No overflow, no layout issues after the step-8
fix. Predict steps render correctly in both pre-answer and post-answer states.

## Sourcing

Two sources, 14 quotes verified word-for-word: the Delta Lake Transaction Log Protocol
(`_delta_log` structure, actions, checkpoints, log compaction, version checksum, Action
Reconciliation, Table Features) and Delta's own "How does Delta Lake manage feature
compatibility?" docs. No `deltalake`/`delta-rs` library is used anywhere — every file on disk is
built and read by this script's own code against the spec's documented rules, disclosed directly
in FACT-CHECK.md, matching this chapter's established house convention.

## Ships as

`status: 'held'`, §6.3.2 (opens the Delta arc). `registry.ts` and `renarration.json` entries
added. Next up: topic 28, `de.delta-commit-protocol-catalog` (Delta commit protocol and
catalog-managed tables).
