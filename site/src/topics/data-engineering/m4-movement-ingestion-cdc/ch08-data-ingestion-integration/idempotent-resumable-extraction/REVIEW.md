# Review — de.idempotent-resumable-extraction

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 5's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line
(raw/bronze landing-layer design).

1. **Flow.** The bridge answers topic 5's handoff ("Every source so far needed its own trick to
   avoid losing or repeating rows... a run that can be repeated, or resumed, without changing the
   answer") and this topic's own handoff names what the next topic must keep untouched for a
   re-run to have something to replay. Checked all five named `uses` ids via the registry-
   parsing script: `high-watermark-cursor`, `lookback-idempotent-merge`,
   `landing-validation-promotion`, `object-store-commit-protocols` and
   `resilient-client-patterns` all resolve live.
2. **Pre-notes.** 7 bullets (checkpoint, atomic commit, deterministic batch id, idempotent write,
   at-least-once delivery, exactly-once effect, byte-for-byte diff — `CHAPTER.md`'s own syllabus
   terms for this topic), each under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.1) splits into the
   three clauses it actually contains: durable checkpoints committed with or after the output;
   deterministic batch ids so a re-run overwrites; at-least-once delivery plus idempotent writes
   as the exactly-once-effect recipe. `coverage.json`'s `syllabus` array matches this three-clause
   breakdown exactly, copied from the raw syllabus file rather than `CHAPTER.md`'s own paraphrase.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (the three crash orderings, the byte-for-byte diff),
   not invented reasoning. All six measured claims trace to a specific function in `examples.py`;
   the two source quotes are used only to name the framework-level and SQL-level instances of the
   identical recipe, never as a substitute for the direct measurement.
5. **Engagement.** Hook (step 1, a crash duplicating a full batch that passes every row-level
   test); predict within the first four steps (step 2, which crash ordering actually loses data);
   three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the shared
   property across all five topics so far; "Prove it" (step 10) applies the exactly-once-effect
   distinction to a case outside this topic's own extraction scenario, a message broker.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a measurement comes out the way it does (why checkpoint-first
   is the dangerous order, why a range-derived id is what decides overwrite-versus-append, why
   effect and delivery are different promises) rather than reading the figure's own on-screen
   labels back. No digits appear in `reel.tsx`, `scenes.tsx` or `narration.json`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was trimmed to 1-3 words after an initial draft ran
   long (confirmed by hand against topic 5's own convention and the phone-width failures that
   convention was built to avoid); `grep` for digits returns no matches.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: the first draft of two of four takeaways (18
   and 26 words) needed trimming down to 18 and 20; the other two (19, 15) needed no change.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") against a
   fully in-process mock warehouse before writing the reel, so every figure on screen matches a
   number that was actually measured, not estimated.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches.
