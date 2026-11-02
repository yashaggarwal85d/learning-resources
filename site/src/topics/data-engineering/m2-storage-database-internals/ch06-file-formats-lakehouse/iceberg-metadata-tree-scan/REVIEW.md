# Review — de.iceberg-metadata-tree-scan

## What this topic does

Opens the "Iceberg arc" (§6.3.1-6.5): reads a real metadata tree (`metadata.json` → manifest
list → manifests → data files) from a real `pyiceberg`-built table in this sandbox, not a
simulation. Measures sequence numbers, per-manifest/per-file partition summaries, and real scan
planning (5 files unfiltered vs. 1 filtered to one partition). Reproduces manifest bloat from
small streaming-style commits and a real `rewrite_manifests`, built from pyiceberg's own
low-level manifest-writing and snapshot-commit primitives since pyiceberg 0.12.0 has no public
high-level action for it — verified end to end by reloading the table fresh and confirming all
20 original rows are still readable from 1 merged manifest instead of 5.

## New external dependency

Unlike topics 17-20 (pure stdlib), this topic installs `pyiceberg[pyarrow,sql-sqlite]` 0.12.0.
Precedent exists in the repo (chapter 5 DB-internals topics use `psycopg2` against a real local
Postgres). Disclosed in `examples.py`'s own docstring, FACT-CHECK.md's red-team section, and
coverage.json's expert items.

## Checks run

- `node scripts/sources.mjs check <folder>`: 14/14 quotes verified word-for-word.
- `python3 examples.py` run 3x: byte-identical output each time (counts/structure asserted, not
  literal paths/UUIDs, since those are real-system randomness — disclosed in the docstring).
- `node scripts/narration-teaches.mjs <folder>`: all 10 steps pass (longest line 49 words, well
  under the 50-word limit; low description-overlap throughout).
- `node scripts/check-all.mjs --skip reels,links,narration --topic iceberg-metadata-tree-scan`:
  failed once on coverage.json needing ≥10 expert items (had 8), fixed by adding 2 more; passed
  clean on retry (locked 72.8s, docs 0.2s, sources 0.0s, build 49.4s).
- `node scripts/check-all.mjs --only links,narration --topic iceberg-metadata-tree-scan`: passed
  (2132 links, 0 broken; only pre-existing unrelated Rust-topic title mismatches).
- `node scripts/check-all.mjs --only reels --topic data-engineering/.../iceberg-metadata-tree-scan`:
  "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" on the first try — no fix
  needed. Only the known pre-existing `test:editor` sandbox failure (unrelated to this topic, see
  `learning-resources-editor-test-sandbox-limitation` memory) showed.

## Manual screenshot review

All 10 desktop steps, all 10 phone steps, and both `-q` predict-wait variants (desktop and
phone) reviewed via the Read tool — all clean, no text overflow, no layout issues. Notably the
underscore-heavy `rewrite_manifests` token (which caused a phone-overflow failure on topic 20's
`update_preimage`) appears only in flowing body-text paragraphs here, never in a fixed-width
TallRow scene value, and caused no overflow.

## Design notes

- `scenes.tsx` kept every `TallRow` label/value to 1-3 words, following the established gotcha
  from topic 20's phone-overflow fix.
- `coverage.json`'s syllabus clause was copied verbatim from `syllabus/data-engineering.md:328`
  (confirmed identical to CHAPTER.md's own transcription this time — no drift, unlike topic 20).
- Bridge text answers topic 20's handoff verbatim per CHAPTER.md; handoff text sets up topic 22
  (hidden partitioning) per CHAPTER.md verbatim.
- Prerequisites panel lists all 11 topics of §6.3 (topics 10-20) per CHAPTER.md's "§6.3 in full"
  note.

## Git

Committed, rebased onto `origin/main`, pushed. `renarration.json` and `registry.ts` entries
re-verified present after rebase.
