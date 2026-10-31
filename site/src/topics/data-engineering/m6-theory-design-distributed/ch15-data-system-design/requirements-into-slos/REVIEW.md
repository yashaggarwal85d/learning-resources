# Review — de.requirements-into-slos

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s own entry for this topic (the contract), then this topic's files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (capacity
estimation, §15.1 topic 2). This is the chapter's first topic, so there is no previous topic in
this milestone to read cold (Chapters 12–14 have no live topics yet); the bridge instead answers
Chapter 14's own quoted handoff, taken verbatim from `CHAPTER.md`.

1. **Flow.** Clean. The hook poses a real, concrete failure (two teams, two numbers, one
   sentence) rather than an abstract definition; every later step resolves a piece of that same
   scenario rather than introducing a new one, which keeps the whole topic anchored to one thread.
   No prerequisite used before it's available — `uses` is deliberately thin (just
   `latency-percentiles` from the live Chapter 1 material) because the chapter plan's own `uses`
   list names Chapter 11/13/14 concepts that aren't live anywhere yet; moved to `declared` per
   `make-topic/SKILL.md` §1 rather than guessed, logged in `OUTLINE.md`.
2. **Pre-notes.** Checked against `notes-rules.ts`: 9 bullets, well under 400 words, no links.
   Every term (SLI, SLO, SLA, percentile, freshness, completeness, correctness, retention,
   idempotent write) is assumed vocabulary the reel uses without re-deriving, not a mechanism the
   reel itself teaches — the one possible overlap, "idempotent write," is deliberately named only
   in passing (as the cost of one of the four definitions), never explained, so the pre-notes
   bullet stays a primer rather than pre-empting a reveal.
3. **Gap hunt.** Checked both syllabus clauses (`syllabus/data-engineering.md:836`) against
   `coverage.json`, copied word for word including the straight double quotes around "correct" —
   the build's own coverage check caught a first draft that used single quotes instead and
   rejected it outright, which is the exact failure mode `make-topic/SKILL.md` warns about; fixed
   by matching the syllabus text exactly. Every source item and expert item mapped to a real step
   title or a real post-notes heading, re-synced after the post-notes restructuring (see Looks
   review below) added an "Internals" section the first coverage draft didn't have a home for.
   No gap found against the syllabus line, the two sources, or the expert list (ten items).
4. **Expert reader.** The four-definitions-of-correct framework is this chapter's own synthesis,
   not a claim attributed to the SRE book — `FACT-CHECK.md`'s red team specifically checked that
   no line puts that framework in the SRE book's mouth. The "is an SLO" predict (step 8) is the
   one place a less careful draft could hand-wave; the explain text is explicit about which of
   the five parts (indicator, measurement point, target, window, consequence) are still missing
   rather than just asserting "it's not an SLO yet."
5. **Engagement.** Hook on step 1 (a real, concrete mismatch); two predicts (steps 2 and 8, the
   first within the first four steps); the surprising finding — the mismatch was never a speed
   problem — lands in the predict 1 explain text; three takeaways (steps 4, 6, 7), each checked
   against the build's own word-count limit; recap on step 9 pulls all four threads together;
   "Prove it" (step 10) applies the method to a genuinely new ask (access control) rather than
   restating the dashboard example.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing; spot-checked step 5
   and step 9 by ear (reading the lines as spoken) — the narrator argues for *why* five fixed
   questions and six fixed dimensions are used rather than reading the ledger back, matching the
   plan's MIT-professor persona.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic (desktop and phone, every step,
every question frame) after the first `tests/reels.mjs` run against a `PREVIEW_HELD=1` build.

1. **Found:** step 1 (Hook), desktop and phone — the "engineering's number vs. finance's number"
   label ran into its own value on the same row. **Fix:** shortened the label to "engineering vs.
   finance"; re-ran, clean on both sizes.
2. **Found:** step 3 (five questions), phone — the resolved-SLO row sat too close under the fifth
   chip and overlapped it at the phone text scale. **Fix:** moved the row down and grew the
   drawing's height to give it room; re-ran, clean.
3. **Found:** step 5 (four definitions), desktop and phone — three of the four rows' long
   label/value pairs collided, worst on the "eventual completeness" row (the longest label and a
   long value together). **Fix:** shortened every definition's label and cost to the minimum that
   still carries the point (dropped "by T+1" and "checked every apply"-style qualifiers already
   stated in the step's own narration/body), and grew the row spacing; re-ran three times, each
   time against the real failures `tests/reels.mjs` reported, until clean on both sizes.
4. **Found:** step 8 (predict 2), phone — the long label/value pair on the first row collided.
   **Fix:** shortened both sides to their essential words; re-ran, clean.

Re-ran the full reel test for this topic after each fix; final run: "Reel smoke test passed: 1
live reel(s) at desktop and phone sizes" (tested with `PREVIEW_HELD=1`, since this topic ships as
`status: 'held'`). Every step's final frame teaches on its own (no step rests only on the
narration); colour is used only for the one failure/contrast moment in the hook (the two-percent
figure) and the two "focus" highlights per step, matching `DESIGN.md`'s rule that colour is rare
and means something. The unrelated `test:editor` check (bundled into the `reels` category by
`check-all.mjs`) fails in this sandbox on an unrelated, hardcoded topic
(`de.b-trees-vs-lsm`) with "a save did not open a new GitHub issue" — this is the editor's own
GitHub-mock plumbing, not anything this topic touches, and is unaffected by any file this topic
added or changed.
