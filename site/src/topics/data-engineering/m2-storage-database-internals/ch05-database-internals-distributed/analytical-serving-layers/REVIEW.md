# Review — de.analytical-serving-layers

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.redis-valkey-internals`) own handoff, then this
topic's own files in order (reel and scenes, narration, post-notes, pre-notes, prerequisites,
registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus
line (Message queues vs event logs).

1. **Flow.** Clean. The hook/bridge directly answers topic 27's own handoff ("the next topic is a
   different one this chapter hasn't yet connected to Chapter 3's own warehouse material"),
   posing a real, measured comparison rather than a generic restatement. `uses:
   ['cache-patterns-eviction', 'partitioning-schemes']` matches `CHAPTER.md`'s own plan.
2. **Pre-notes.** 6 bullets, no links. Warehouse query (Chapter 3) and cache-aside (last two
   topics) are genuinely carried forward, not retaught; materialized view, cube, rollup and
   freshness are primers for what this reel actually teaches.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:277`) clause by clause.
   Three clauses: pre-aggregation/materialized tables/cubes, when to move to a real-time OLAP
   store (including its own cross-reference to §6.4/§9.3, mapped to `de.real-time-olap-ingestion`
   by content), and freshness vs concurrency vs cost. All mapped to real steps; no gap against the
   syllabus line, the two source groups, or the expert list (ten items).
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming the fast
   query must be a different kind of database: the wrong answer is tempting because speed
   differences often do come from different engines in practice, and the explain text names the
   real reason (a smaller question, same engine) instead of just asserting it. The "Prove it" step
   was checked against the trap of picking a materialized view "refreshed often enough" — that
   option is never actually correct to the second, no matter how often it refreshes, which the
   explain text names directly.
5. **Engagement.** Hook (step 1) poses a real, sandbox-measured comparison. Predict at step 2,
   within the first two. Three takeaways (steps 4, 5, 7), none on step 3 (the cost-shift reveal,
   this reel's own "from" reference step, deliberately left without one). Recap (step 8) pulls
   every layer into one line each. "Prove it" (step 9) is a genuine synthesis task (a new
   requirement — correct to the second, cheap at huge volume — reasoned about using all three of
   this topic's own named options) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 15% (step 2), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: "materialized table" is spoken as "a table that already holds
   the answer" or "a pre-built answer," "cube" as "a broader structure," "rollup" as "combining the
   instant each record first arrives," "Druid/Pinot/ClickHouse" as "a handful of real, named
   systems."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../analytical-serving-layers` — 4/4 quotes
  verified word for word on the first attempt; no gated-host or footnote-marker issues.
- `python3 examples.py` — pass. A real, in-process DuckDB engine measures a forty-million-row
  aggregate query against a precomputed eight-row materialized table versus the raw table it was
  built from: a 41x-64x speedup across repeated runs (the script's own assertion threshold is set
  well below the observed range, at 20x, so it doesn't flake on a slower run), with the identical
  answer either way. A real insert into the raw table is measured visible there immediately but
  absent from the materialized table until the materialized table is explicitly rebuilt.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../analytical-serving-layers` — pass (locked, docs, sources, build — 238 pages
  built).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../analytical-serving-layers` — pass, 0 broken links out of 1826 checked; the
  77 reported title mismatches are all pre-existing, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic data-engineering/.../analytical-serving-layers`
  — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" on the first run (every
  `scenes.tsx` `Row` label/value kept to 1-3 words from the start). The combined check reports
  `FAIL` only because of the known, topic-independent `test:editor` sandbox limitation.

## Fixes made during this build

- **The first raw-table size (2,000,000 rows) measured only an 8x speedup** against the
  materialized table — real, but thin enough to flake against a stricter threshold on a slower
  run. Increased to 40,000,000 rows, which measures 41x-64x consistently across repeated runs, and
  set the assertion threshold (20x) well below that range rather than near the headline number.
- No `SOURCES.md` quoting issues this time: both sources (a ClickHouse index page's own one-line
  descriptions, a single continuous Druid documentation paragraph) fetched and quoted cleanly on
  the first attempt.
- The real-time-OLAP cross-reference clause's own quote was first written as "real-time OLAP,"
  which isn't a literal substring of `de.real-time-olap-ingestion`'s own syllabus line (only its
  bolded title uses that exact casing/wording); fixed by quoting the syllabus line's own body text
  ("streaming ingestion into Druid, Pinot and ClickHouse") instead.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../analytical-serving-layers` passed on the
first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "raw table" / "measured slower", "materialized table" / "measured much faster") makes the claim
  explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the fast pre-built answer, the write-time cost, the measured speedup, the
  measured staleness, cubes answering many questions, rollup's own lost per-event queries, every
  "Prove it" conclusion) — never decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date 2026-10-31,
by "Claude (single session)", open: [] (recorded in the committed file). All reviews in this file
are self-review by the same session that wrote the content; no independent reviewer ran. Expert
sign-off: pending.
