# Review — de.raw-bronze-landing-layer

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 6's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (managed
ingestion tools and build-vs-buy).

1. **Flow.** The bridge answers topic 6's handoff ("A pipeline that can be re-run safely needs
   something to re-run from... What the first layer must keep is the next topic") and this
   topic's own handoff matches `CHAPTER.md`'s own handoff about build-versus-buy being the
   section's closing question. Checked all five named `uses` ids via the registry-parsing
   script: `medallion-bronze-silver-gold`, `medallion-failure-modes`,
   `exactly-once-effect-recipe`, `deterministic-batch-id` and `object-store-commit-protocols`
   all resolve live.
2. **Pre-notes.** 8 bullets (raw layer/bronze, append-only, replay, source offset, schema
   version, PII, retention, tokenization — `CHAPTER.md`'s own syllabus terms for this topic),
   each under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.1) splits into the
   three clauses it actually contains: immutable append-only capture with the three metadata
   fields; rebuildable by replay; retention and PII implications. `coverage.json`'s `syllabus`
   array matches this three-clause breakdown exactly, copied from the raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (the identical-raw-records replay, the tokenized
   vault's own checksum comparison), not invented reasoning. All four measured claims trace to a
   specific function in `examples.py`; the three source quotes (Databricks' bronze definition,
   GDPR Articles 17 and 5(1)(e)) name the real-world term and the real legal duty this topic's
   own design answers, never a substitute for the direct measurement.
5. **Engagement.** Hook (step 1, a year-old bug with the rebuild path already destroyed); predict
   within the first four steps (step 2, whether a replay alone can fix it); four takeaways
   across the reveal steps (steps 4, 6, 9, 10); recap (step 10) names what the whole topic's
   design is in service of; "Prove it" (step 11) applies the tokenization lesson to a case that
   reads almost identically to the wrong answer, testing whether the distinction actually landed.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a measurement comes out the way it does (why the bug's
   location decides whether re-extraction is needed, why three fields are what makes a replay
   trustworthy, why a vault is the one thing allowed to be mutable) rather than reading the
   figure's own on-screen labels back. No digits appear in `reel.tsx`, `scenes.tsx` or
   `narration.json`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft,
   learning from topic 6's own first-draft overshoot; `grep` for digits returns no matches.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: all four takeaways (19, 18, 20, 19 words)
   passed on the first draft, needing no trimming.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") against a
   fully in-process raw layer and silver table before writing the reel, so every figure on
   screen matches a number that was actually measured, not estimated.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches. The held-topic
reel smoke test (`PREVIEW_HELD=1 node tests/reels.mjs ... raw-bronze-landing-layer`) was run with
`REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two separate invocations rather than one
combined run: running both devices in a single invocation hung indefinitely in this sandbox for
every topic tested, including already-shipped topic 5, so this is a sandbox-level Playwright
flakiness under this session's resource constraints, not a defect in any topic's own reel.
