# Review — de.runtime-schema-validation

## Content review, self-review, 2026-10-24

Read cold, in order: topic 35's reel and handoff, then this topic's files in order (reel and
scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then the next syllabus line (native extensions with Rust and
PyO3).

1. **Flow.** Clean. The hook names the exact handoff topic 35 left open (tests prove a client
   correct on the inputs they thought to generate; this topic is the boundary check for every
   input nobody thought to generate) rather than a generic restatement. Both `uses` dependencies
   (`data-code-testing-layers`, `arrow-columnar-format`) are assumed, never re-taught, matching
   `CHAPTER.md`'s framing of this topic as the last line of defense after the testing layer.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links). Every
   term (record validator, DataFrame schema, row-level vs. batch-level cost, production-scale
   scan, governance tooling) is genuinely assumed rather than taught by this reel.
3. **Gap hunt.** Checked the syllabus line clause by clause against `coverage.json`'s mapped
   clauses, this time copying every clause verbatim from `syllabus/data-engineering.md:201` from
   the start (including the "→ §13.3" suffix on the last clause), having learned that gotcha on
   the previous topic rather than discovering it reactively. All five clauses present, each
   mapped to real steps. Every `at.step`/`at.deep` reference checked against the real `reel.tsx`
   step titles and the real, standardized `post-notes.md` headings from the start. No gap found
   against the syllabus line, the sources, or the expert list (ten items).
4. **Expert reader.** The predict step (step 4) was checked for the trap of assuming two
   DataFrame libraries need two schemas: the wrong answer is a genuinely tempting one, since
   pandas and Polars really are different libraries with different engines underneath, and the
   reveal (step 5) demonstrates the shared schema syntax directly rather than just asserting it.
   The named-not-run step (step 8) was checked for honesty: the claim (both frameworks are real,
   sourced, production mechanisms) is kept separate from the claim disclosed as unavailable
   (neither runs in a deployment this sandbox doesn't have), matching the pattern already
   established by the previous topic's Testcontainers disclosure.
5. **Engagement.** Hook (step 1) poses the real open question left by topic 35. Predict at step
   4, within the first four. Four takeaways (steps 3, 5, 6, 7), at the minimum but genuine — no
   takeaway on step 2, deliberately, to avoid the documented phone-caption-collision gotcha at the
   first non-predict step. Recap (step 9) pulls every layer into one line each. "Prove it" (step
   10) is a genuine synthesis task: diagnosing two independent misplacements (a per-record loop
   that should be a batch check, a governance re-check duplicating the boundary) in one scenario.
6. **Narration teaches.** `narration-teaches.mjs` flagged step 1 on the first draft
   ("READS THE SCREEN," 58% overlap) — the narration restated the body's own sentence almost
   verbatim. Fixed by rewriting the line around a different angle on the same point (a human
   deciding which inputs to check ahead of time, vs. something judging a live input sight unseen)
   rather than paraphrasing the body more lightly. Re-ran: 0 flags, highest overlap 32% (step 9),
   well under the threshold. No digits, symbols or code names appear in any narration line:
   "Pydantic" is spoken as "a record check," "Pandera" as "a whole-table check," "pandas"/"Polars"
   as "one kind of table"/"a second, differently built one," "Great Expectations"/"Soda" as "one
   real, sourced framework"/"a second real, sourced framework," and "Checkpoint" as "a production
   run step."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 19/19 quotes verified word for word.
- `python3 examples.py` — pass, "runtime-schema-validation examples: all checks pass," run
  repeatedly for stability (a real Pydantic v2 coercion and a real structured `ValidationError`
  naming the bad field; a real doubled-input timing run landing consistently near a 2x ratio; the
  identical pandera schema fields validating a real pandas DataFrame and a real Polars
  `LazyFrame`, and a real `SchemaError` naming the `price` column on a genuine violation; a real
  row-level loop measured against pandas' own vectorized `Series.between()`, consistently 2–6x
  slower across repeated runs).
- One-time, disclosed cross-venv benchmark (not part of `examples.py`, recorded in
  `FACT-CHECK.md`): Pydantic v1 (`1.10.26`, freshly `pip install`ed into a scratch venv, cleaned
  up afterward) against this sandbox's installed Pydantic v2 (`2.13.5`) on the identical 20,000-
  record validation task — v2 landed at roughly 0.012–0.024s versus v1's roughly 0.045–0.053s
  across three repeated runs each, a consistent 2–4x difference in the direction the sourced
  Rust-core speed claim predicts.
- `node scripts/narration-teaches.mjs .../runtime-schema-validation` — pass after the step-1
  rewrite; 0 flags, highest overlap 32%, longest line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic runtime-schema-validation` —
  pass on the first run (locked, docs, sources, build), with no coverage-clause or expert-list
  issues this time, having applied both of the previous topic's build gotchas proactively.
- `node scripts/check-all.mjs --only links,narration --topic runtime-schema-validation` — pass, 0
  broken links; no new blocked or title-mismatch warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic runtime-schema-validation` — pass on the
  second run (see Looks review below), "Reel smoke test passed: 1 live reel(s) at desktop and
  phone sizes."

## Fixes made during this build

- **Two `fig` strings written as single-quoted JS literals containing a plain apostrophe**
  (steps 2 and 10), caught proactively before the first build run rather than discovered by a
  parser failure, having hit the identical bug reactively on the previous topic. Fixed by
  double-quoting both.
- **An attempted "Rust core speed difference" demonstration using a hand-rolled pure-Python
  validator as the baseline came back the wrong way** (the hand-rolled function measured
  *faster* than Pydantic, since Pydantic's own object-construction overhead dominates at this
  scale and isn't a fair stand-in for "no Rust core"). Caught before writing it into the reel;
  rebuilt as a real Pydantic v1-vs-v2 cross-venv benchmark instead (see Problem Solving in
  `FACT-CHECK.md`), with `examples.py` itself rewritten to demonstrate something reproducible in
  any single environment (linear cost scaling) rather than a misleading in-process comparison.
- **Narration step 1 flagged `READS THE SCREEN`** (58% overlap on the first draft, restating the
  body's own sentence almost verbatim). Fixed by rewriting around a different angle on the same
  point rather than lightly rephrasing.
- One row in the Hook scene ("every test, last topic" / "checked, generated inputs") ran into its
  own value text on phone during the first reels check — the same plain text-overlap class as the
  previous topic's fix, not the takeaway-caption gotcha. Fixed by shortening the label to "every
  test."

## Looks review, self-review

First `check-all.mjs --only reels --topic runtime-schema-validation` run failed on phone only:
"text 'every test, last topic' runs into 'checked, generated inputs'" on the Hook step — plain
label/value text too long for the row width at phone size, the same class of fix applied on the
previous topic (not the takeaway-caption-collision gotcha, since this step has no takeaway).
Fixed by shortening the label. Re-ran; the second run passed cleanly on both desktop and phone.

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-runtime-schema-validation-01.png` (Hook, phone, post-fix) — renders cleanly, no overlap.
- `desktop-runtime-schema-validation-05.png` (step 5, the two-backend reveal, desktop) — the
  two-row contrast renders cleanly, takeaway shown below it, sidebar and fig caption both legible.
- `desktop-runtime-schema-validation-04-q.png` (step 4, predict frame, desktop) — both
  answer-option cards render fully, no clipping.
- `phone-runtime-schema-validation-09.png` (Recap, phone) — the four-row recap renders cleanly
  with no overlap.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "every value in range" / "passes" vs. "one out of range" / "rejected, column named") makes the
  mechanism explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including the Hook fix above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (the twice-as-many-records time, the rejected out-of-range row, the measurably
  slower row-level loop, the fix in "Prove it") — never decorative.
- Captions match the picture at every checked step.

No findings beyond the text-overlap fix already made above. `coverage.json` → `gapReview`: date
2026-10-24, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent reviewer
ran. Expert sign-off: pending.
