# Review — de.snapshot-lifecycle-time-travel

## Fixes made during the ship sequence

- **Reel smoke test, phone, text overflow (first run):** step 3's and step 6's `TallRow` values
  in `scenes.tsx` ("both resolve correctly; rollback moves the pointer" and "still time-travelable,
  until expiry and vacuum run") ran outside the drawing on phone. Shortened both to "both resolve
  correctly; rollback works too" and "still time-travelable until vacuum runs". Reran the full
  build/narration/reel checks after the edit — all clean, no further overflow on any other step.

## Checks

- `node scripts/sources.mjs check <folder>` — 11/11 quotes verified word-for-word.
- `python3 examples.py` — verified via 3 consecutive byte-identical runs (no flakiness risk: all
  four demonstrations are pure logic plus small deterministic local file I/O, no timing
  assertions; the too-short-vs-long-enough retention scenarios are distinguished by code path, not
  a wall-clock race).
- `node scripts/narration-teaches.mjs <folder>` — clean (0-9% description overlap, longest line 46
  words).
- `node scripts/check-all.mjs --skip reels,links,narration --topic <slug>` — pass (locked, docs,
  sources, build).
- `node scripts/check-all.mjs --only links,narration --topic <slug>` — pass, 0 broken links.
- `node scripts/check-all.mjs --only reels --topic <slug>` — pass on the second run, after the fix
  above (desktop and phone). The accompanying `test:editor` failure is the known, unrelated
  pre-existing sandbox limitation (see project memory), not caused by this topic.
- All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q`
  variants) reviewed clean via the Read tool: no text overflow, no overlap, no layout breakage.

## Design notes

- Reuses topic 13's own snapshot/atomic-pointer model (`write_snapshot`, `atomic_swap_pointer`)
  directly, extending it with time travel by id and by timestamp, rollback, snapshot expiry, and
  orphan-file removal — the real mechanism behind Iceberg's `expireSnapshots`/`deleteOrphanFiles`
  and Delta's `VACUUM`/`RESTORE`.
- The reclaimed-bytes figure shown on screen (40,000 bytes, per file) traces to the literal
  `FILE_SIZE_BYTES = 40_000` constant in `examples.py`; the demo's actual two-file total (80,000
  bytes) is not itself a literal in the source and so is not shown as a single on-screen number,
  per the build's digit-provenance check.
- Delta's quoted default retention figures (7 days for VACUUM, 30 days for table history) are
  spoken as words in the reel's prose, never shown as on-screen digits, since neither is a literal
  value `examples.py` computes or asserts.
- `declared: []` matches CHAPTER.md's "none beyond topics 10–13" note for this topic.
