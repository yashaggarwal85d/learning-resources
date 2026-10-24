# Review — de.connection-pooling-database-clients

## Content review, self-review, 2026-10-24

Read cold, in order: topic 32's reel and Deep dive, then this topic's files in order (reel and
scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then the next syllabus line (resilient clients: timeouts,
retries, idempotency).

1. **Flow.** Clean. The hook names the exact handoff topic 32 left open (Arrow, pandas and
   Polars all stayed in-process; this is where a pipeline actually leaves it for a real
   connection) rather than a generic restatement. No concept is used before `introduces`/`uses`
   establishes it; this topic has no `uses` dependency on an earlier chapter concept, matching
   `CHAPTER.md`'s own "Uses: none from this chapter directly" note — its only real dependency is
   the Chapter 1 networking topic named by cross-reference, linked in the prerequisites panel
   rather than assumed silently.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links). Every
   term (connection pool, pooling mode, physical backend vs. logical client connection, prepared
   statement, server-side cursor) is genuinely assumed rather than taught by this reel; "physical
   backend vs. logical client connection" is the one load-bearing distinction the predict step's
   wrong answer trades on, so it's called out by name before the reel reaches it.
3. **Gap hunt.** Checked the syllabus line clause by clause against `coverage.json`'s mapped
   clauses: all five clauses present, each mapped to a real step, nothing left uncovered. Checked
   every `coverage.json` `at.step`/`at.deep` reference resolves against the real `reel.tsx` step
   titles and `post-notes.md` headings — caught two real mismatches before this review, both
   fixed (see Fixes below): a step title using an escaped-apostrophe literal that the build's
   title-matching regex couldn't resolve against the plain-text clause reference, and a `deep`
   reference to "Production failures" that didn't match the actual heading text ("Production
   failures this topic warns about"). No other gap found against the syllabus line, the sources,
   or the expert list.
4. **Expert reader.** The prepared-statement caveat (steps 4–6) was checked specifically for the
   trap of overclaiming the mechanism: the reveal states plainly that the physical backend, not
   the logical client connection, is what changes hands, and the reproduction's own assertion
   (`same_physical_backend_reused_throughout`) rules out the uninteresting alternative explanation
   (a genuinely different backend) before the step claims anything about shared-backend behavior.
   The bulk-load step (step 8) is scoped to the qualitative finding the measurement actually
   supports (far ahead of row-by-row, close to the bulk-copy path) rather than a specific ratio
   that would vary run to run — matching the looser assertion kept in `examples.py`
   (`adbc_much_faster_than_executemany`, not a fixed multiplier).
5. **Engagement.** Hook (step 1) poses the real open question left by topic 32. Predict at step
   4, within the first four. Five takeaways (steps 2, 3, 5, 7, 8), well over the minimum three.
   The prepared-statement reveal (step 5) functions as the "surprising number" beat — a
   deterministic, reproduced failure of a documented caveat is a concrete result, not an
   abstract warning. Recap (step 9) pulls every reveal into one line each. "Prove it" (step 10)
   is a genuine synthesis task: diagnosing an intermittent production failure from the
   prepared-statement reveal, not a restatement of any single step.
6. **Narration teaches.** `narration-teaches.mjs` reports 0 flags; highest description overlap
   35% (step 9, the recap, expected since a recap necessarily echoes earlier content), every
   other step well under; every line speaks in the professor's own voice — asking the open
   question before answering it (step 1), stating what the reproduction's own backend-PID check
   rules out before stating the conclusion (step 5) — rather than reading `reel.tsx`'s body text.
   No digits, symbols or code names appear in any narration line; "PgBouncer" is never named
   (spoken as "one pooling setting" / "the pool's own tracking"), "COPY" is spoken as "a
   dedicated bulk-loading path" / "the dedicated bulk path", and "ADBC" as "a library built
   around a shared columnar buffer format" / "a buffer-format loader".

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 20/20 quotes verified word for word.
- `python3 examples.py` — pass, "connection-pooling-database-clients examples: all numbers check
  out" (fresh-connect vs. reused-connection timing; Little's Law hold time measured against both
  a simulated workload and a trivial round trip; the transaction-pooling prepared-statement
  failure reproduced with the same physical backend process id confirmed throughout; the
  identical test surviving under session pooling; isolated-subprocess peak-RSS comparison,
  `fetchall()` vs. a named server-side cursor; `executemany` vs. `COPY` vs. ADBC bulk ingest,
  each path's own connection setup excluded from the measured region).
- `node scripts/narration-teaches.mjs .../connection-pooling-database-clients` — pass, 0 flags,
  highest overlap 35% (step 9, recap), longest line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  connection-pooling-database-clients` — pass (locked, docs, sources, build — the build's own
  coverage and topic-file checks both caught real problems during the build, both fixed, see
  Fixes below).
- `node scripts/check-all.mjs --only links,narration --topic
  connection-pooling-database-clients` — pass, 0 broken links; one pre-existing title-mismatch
  warning on this topic's own PgBouncer config link, fixed to match the page's real title.
- `node scripts/check-all.mjs --only reels --topic connection-pooling-database-clients` — result
  recorded in the Looks review below once it completes.

## Fixes made during this build

- **A reel step title using an escaped-apostrophe literal**, which the build's regex-based
  step-title extraction (`site/src/lib/coverage.ts`) reads as raw source text rather than the
  rendered character, breaking the `coverage.json` match to that step. Fixed by switching the
  title to a double-quoted string with a plain apostrophe instead of a single-quoted string with
  a `’` escape — a gotcha now also recorded in project memory for future topics.
- **A `coverage.json` `deep` reference that didn't match the real post-notes.md heading text**:
  written as "Production failures" where the actual heading is "Production failures this topic
  warns about". Fixed by matching the heading text exactly.
- **Three takeaways over the twenty-word limit** (Little's Law, server-side cursor, bulk-load),
  caught by the build's own topic-file check. Fixed by trimming each to its core claim without
  dropping the comparison it makes.

## Looks review, self-review

First `check-all.mjs --only reels --topic connection-pooling-database-clients` run genuinely
failed on phone: "swipe from the caption on step 2 went to 2" — a documented gotcha (project
memory, `learning-resources-scenes-reel-gotchas`): step 2's `takeaway` rendering mid-test
squeezes the phone Visual pane and shifts the caption, breaking the test's swipe target at the
first non-predict step. Fixed per the documented remedy: removed the `takeaway` from step 2 and
folded its sentence into the step's own `body` instead, leaving four takeaways on the reel
(steps 3, 5, 7, 8), still well over the minimum three. Re-ran `narration-teaches.mjs` (still 0
flags) and the reel test; the second run passed cleanly: "Reel smoke test passed: 1 live
reel(s) at desktop and phone sizes."

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-connection-pooling-database-clients-02.png` (step 2, connection setup cost, phone,
  post-fix) — renders cleanly, no caption shift, both rows legible with no crowding.
- `phone-connection-pooling-database-clients-09.png` (Recap, phone) — the four-row recap renders
  cleanly with no overlap.
- `desktop-connection-pooling-database-clients-05.png` (step 5, the prepared-statement caveat
  reveal, desktop) — the three-row reproduction (client prepares / another client resets it /
  client re-asks) renders cleanly, takeaway shown below it, sidebar step list and fig caption
  both legible.
- `desktop-connection-pooling-database-clients-04-q.png` (step 4, predict frame, desktop) — both
  answer-option cards render fully, no clipping.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: the prepared-statement reveal's
  middle row ("another client resets it — same shared backend") makes the shared-backend
  mechanism explicit in the words themselves, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including the step 2 fix above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (the shared-backend reset, the prepared-statement caveat in the recap, the
  predict-question's wrong-answer trap in the Prove-it scene) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the phone-caption collision already fixed above. `coverage.json` →
`gapReview`: date 2026-10-24, by "Claude (single session)", open: [] (recorded in the committed
file). All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
