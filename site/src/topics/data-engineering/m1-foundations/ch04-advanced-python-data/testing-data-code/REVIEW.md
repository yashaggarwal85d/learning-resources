# Review — de.testing-data-code

## Content review, self-review, 2026-10-24

Read cold, in order: topic 34's reel and handoff, then this topic's files in order (reel and
scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then the next syllabus line (runtime schema validation).

1. **Flow.** Clean. The hook names the exact handoff topic 34 left open (a resilient client
   that's correct on the happy path, but unproven) rather than a generic restatement. The only
   `uses` dependency (`resilient-client-patterns`) is assumed, never re-taught, matching
   `CHAPTER.md`'s framing of this topic as the layered test set that proves that same client.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links). Every
   term (unit test, property-based test, producer/consumer contract test, ephemeral dependency,
   golden-output test) is genuinely assumed rather than taught by this reel.
3. **Gap hunt.** Checked the syllabus line clause by clause against `coverage.json`'s mapped
   clauses: the build's own coverage checker (`PROJECT_PLAN.md` Rule #6) initially rejected the
   golden-output clause for not matching the syllabus line word for word (it had dropped the
   "→ §11.4" suffix) — fixed by copying the clause verbatim from `syllabus/data-engineering.md`,
   including the arrow and section reference. All five clauses now present, each mapped to real
   steps. Checked every `coverage.json` `at.step`/`at.deep` reference resolves against the real
   `reel.tsx` step titles and `post-notes.md`'s real section headings (`Outcomes`,
   `Production failures this topic warns about`) — an earlier draft of `OUTLINE.md` invented
   topic-specific heading names that don't exist in the actual standardized post-notes section
   structure; fixed by rewriting `at.deep` references to the real headings before the first build
   run. No other gap found against the syllabus line, the sources, or the expert list.
4. **Expert reader.** The predict step (step 4) was checked specifically for the trap of
   overstating what a handwritten test already covers: the wrong answer ("three hand-picked
   retries already cover the dedup logic") is a genuinely tempting misreading, since a handwritten
   test with repeated retries does exercise *some* dedup behavior — it just never explores beyond
   the one sequence someone typed, which the reveal (step 5) and the final "Prove it" scenario
   both make concrete with a real, not hypothetical, missed bug. The integration-test step (step 6)
   was checked for honesty: the claim demonstrated (a real dependency that can genuinely disagree)
   is kept separate from the claim disclosed as unavailable (Testcontainers' own disposable-
   container mechanism), rather than blurring the two into "integration tests work here."
5. **Engagement.** Hook (step 1) poses the real open question left by topic 34. Predict at step
   4, within the first four. Four takeaways (steps 3, 5, 6, 7), at the minimum but genuine — no
   takeaway on step 2, deliberately, to avoid the documented phone-caption-collision gotcha at
   the first non-predict step. Recap (step 9) pulls every layer into one line each. "Prove it"
   (step 10) is a genuine synthesis task: diagnosing why an all-green unit-test suite still shipped
   a real dedup bug, not a restatement of any single step.
6. **Narration teaches.** `narration-teaches.mjs` reports 0 flags; highest description overlap
   37% (step 6, the integration-test step), under the flagged threshold; every line speaks in the
   professor's own voice rather than reading `reel.tsx`'s body text verbatim. No digits, symbols
   or code names appear in any narration line: "Hypothesis" is spoken as "a test aimed at
   generating its own inputs" / "a generated test," "Pact" as "an agreement check," "Testcontainers"
   as "the tool built to spin up a disposable copy," "Docker" as "a container system," and
   "PostgreSQL" as "a real, already-running database."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 20/20 quotes verified word for word.
- `python3 examples.py` — pass, "testing-data-code examples: all five layers check out," run
  repeatedly for stability (a unit test on one minimal fixture; a Hypothesis property test across
  a hundred generated sequences, 0 failures; a real `pact-python` consumer contract test whose
  mock provider served a real response to a real client call; an integration test against this
  sandbox's own live PostgreSQL cluster, confirmed reachable beforehand via a direct `psql`
  connection; a golden-output test run twice in the same process, confirming the recorded master
  actually pins the output).
- `node scripts/narration-teaches.mjs .../testing-data-code` — pass, 0 flags, highest overlap
  37%, longest line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic testing-data-code` — pass
  (locked, docs, sources, build — the build's own coverage checker caught the golden-output
  clause-wording mismatch and the under-sized expert list during the build, both fixed, see
  Fixes below).
- `node scripts/check-all.mjs --only links,narration --topic testing-data-code` — pass, 0 broken
  links; no new blocked or title-mismatch warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic testing-data-code` — pass on the second run
  (see Looks review below), "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes."

## Fixes made during this build

- **Two `fig` strings written as single-quoted JS literals containing a plain apostrophe**
  (steps 1 and 5), which broke the build's parser outright (`Expected ',' or '}' but found
  Identifier`) rather than silently mismatching, since the apostrophe terminated the string early.
  Fixed by switching both to double-quoted strings with a plain character, the same fix applied to
  an escaped-title bug on an earlier topic.
- **The golden-output syllabus clause didn't match the syllabus line word for word**: it had
  dropped the "→ §11.4" suffix the real syllabus line ends with. Fixed by copying the clause
  verbatim from `syllabus/data-engineering.md:200`, including the arrow and section reference.
- **The expert list in `coverage.json` had only nine items**, one short of the build's required
  minimum of ten. Fixed by adding a tenth, genuine item about generated inputs being drawn from a
  strategy rather than hand-picked.
- **`coverage.json`'s `at.deep` references pointed at headings invented in `OUTLINE.md`** ("Five
  test layers, and the question each one answers," "What Testcontainers actually buys...") that
  don't exist in the real, standardized `post-notes.md` section structure used across every topic
  (`Outcomes`, `Lab`, `Production failures this topic warns about`, `Frontier`, `Where this goes
  next`). Fixed by rewriting both `OUTLINE.md`'s planned headings and `coverage.json`'s `at.deep`
  references to the real section names before the first build run, rather than discovering the
  mismatch reactively.
- **`prerequisites.mdx` referenced the previous topic by a title that doesn't match its real
  registry title** ("Resilient clients: timeouts and retries" vs. the real "Resilient clients:
  timeouts, retries, idempotency"), which failed the reels build outright ("is not a topic in
  syllabus/data-engineering.md"). Fixed by copying the exact title string from `registry.ts`.

## Looks review, self-review

First `check-all.mjs --only reels --topic testing-data-code` run genuinely failed on both
desktop and phone with real text-overlap errors, not the documented takeaway-caption-collision
gotcha this time: step 3's two rows ("a hundred generated cases" / "one rule, checked each time")
overlapped on phone, and step 5's two rows ("the interaction, defined once" / "a real mock
server, built from it" and "the consumer's real call" / "checked against that same server")
overlapped on both sizes — the label and value text were simply too long for the row width at
smaller viewports. Fixed by shortening both rows' label and value text on each affected step
(e.g. "the interaction, defined once" → "one interaction"; "a real mock server, built from it" →
"builds a real mock server") without changing the claim each row makes. Re-ran the reels check;
the second run passed cleanly on both desktop and phone.

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-testing-data-code-03.png` (step 3, the property-test reveal, phone, post-fix) — renders
  cleanly, no overlap, both rows legible.
- `desktop-testing-data-code-05.png` (step 5, the contract-test reveal, desktop, post-fix) — the
  two-row contrast renders cleanly, takeaway shown below it, sidebar step list and fig caption
  both legible.
- `desktop-testing-data-code-04-q.png` (step 4, predict frame, desktop) — both answer-option
  cards render fully, no clipping.
- `phone-testing-data-code-08.png` (Recap, phone) — the four-row recap renders cleanly with no
  overlap.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "a stub" / "always agrees with itself" vs. "a real cluster" / "the thing that can disagree")
  makes the mechanism explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including the step 3 and step 5 fixes above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (a generated input finding what a handwritten one misses, a real dependency
  that can disagree, the fix in "Prove it") — never decorative.
- Captions match the picture at every checked step.

No findings beyond the two text-overlap fixes already made above. `coverage.json` →
`gapReview`: date 2026-10-24, by "Claude (single session)", open: [] (recorded in the committed
file). All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
