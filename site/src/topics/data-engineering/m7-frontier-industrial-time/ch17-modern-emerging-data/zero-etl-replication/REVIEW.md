# Review — de.zero-etl-replication

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): managed CDC from operational databases
  into analytics engines, named by source (Reveal: managed CDC into an analytics engine; Reveal:
  DynamoDB's own documented cadence); what "zero" hides — it is still log-based CDC (Reveal: what
  "zero" actually hides); schema-change, filtering and cost constraints no longer controlled
  (Reveal: the three costs of giving up pipeline control).
- Sourcing: all three vendor sources fetched cleanly, with one URL-slug correction (AWS's DynamoDB
  zero-ETL page's actual slug differs from CHAPTER.md's generic phrasing) — documented in
  FACT-CHECK.md's Problem Solving section. No content substitution was needed.
- This topic's lab is a real reproduction, not a simulation dressed up as one: `examples.py`
  checks a `wal_level = logical` prerequisite (Postgres's analog to point-in-time recovery),
  creates a genuine logical replication slot, runs an initial full export, and drains the slot on
  a fixed cycle using `pg_logical_slot_get_changes` against a real running Postgres instance in
  this sandbox. A fraud-flagged order inserted between cycles is asserted invisible in the mirror
  until the next drain — the actual mechanism producing the actual gap the hook describes, not an
  assertion about a number computed some other way. CHAPTER.md's own instruction (model "the shape
  of this," not the managed service itself) is followed and stated explicitly throughout
  post-notes.md, FACT-CHECK.md, and the reel's own step 6.
- The closing arithmetic (a twenty-minute requirement against a documented fifteen-to-thirty-
  minute window) is asserted directly in examples.py as a plain boolean comparison, not left as an
  unverified claim in the reel alone.
- The reel's engagement arc holds: two predicts (step 2, and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step, "Reveal: managed CDC into an analytics engine"),
  takeaways on steps 4, 5, 6, 7.
- Narration (verified via `narration-teaches.mjs`): one line (step 9's answer) was initially 53
  words, over the 50-word floor; split into two lines, re-verified clean (longest line now 44
  words).
- Takeaways: all four checked and kept under the 20-word limit on first draft, counting the em
  dash in step 5's takeaway as its own word.
- Bridge answers topic 10's handoff verbatim per CHAPTER.md; handoff closes the chapter and leads
  into Chapter 18 (benchmarking) exactly as planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run failed on phone with two overflow issues, both on step 6's "reproducing the shape"
  scene: the "continuous WAL retention, like point-in-time recovery" caption and the "a write
  inside the window stays invisible until the next pulse" caption each ran past the drawing's
  right edge at phone's larger text scale as single `<T>` lines.
- Fixed by splitting both into two `<T>` lines each, shifting the scene's remaining elements down
  accordingly, and increasing the scene's `Svg h` from 220 to 280 to fit the now five-line-group
  block — the same split-caption-then-reflow pattern used on earlier topics' overflow bugs.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic zero-etl-replication` run: `test:reels`
passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes"). `test:editor` still
fails with "a save did not open a new GitHub issue" — the same known, pre-existing,
topic-independent Playwright/Chromium sandbox limitation documented on every prior topic's
REVIEW.md in this chapter, not caused by this topic and not a shipping blocker.
