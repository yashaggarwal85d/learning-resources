# Review — de.choosing-data-flow-shape

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, the previous topic's handoff (`de.back-envelope-
capacity-estimation`), this topic's own files in order (reel and scenes, narration, post-notes,
pre-notes, prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then
the next topic's syllabus line (storage, layout and lifecycle decisions, §15.1 topic 4).

1. **Flow.** The bridge answers topic 2's handoff verbatim as required, and the handoff to topic
   4 matches `CHAPTER.md`'s own bridge text for that topic exactly. `uses` stays limited to what's
   actually live in `registry.ts` today — `ask-to-slo-translation`, `capacity-estimate-chain`
   (topics 1-2, this chapter), `lambda-architecture`, `kappa-architecture`, `medallion-bronze-
   silver-gold` (Chapter 3, confirmed live by grepping `registry.ts`), and `latency-percentiles`
   (Chapter 1). The chapter plan's Chapter 7/8/9/14 ids (micro-batch triggers, ingestion patterns,
   unified execution, idempotence/offset-commit mechanics) were moved to `declared` since those
   chapters aren't built yet, same pattern as topics 1-2, logged in `OUTLINE.md`.
2. **Pre-notes.** 6 bullets, under 400 words, no links. Every term (freshness SLO, latency floor,
   reprocessing, replay, push/pull, idempotence) is either used directly by the reel or named only
   in passing as a `declared` concept another chapter owns.
3. **Gap hunt.** Checked all three syllabus clauses against `coverage.json` word for word, matching
   the raw syllabus line (line 838 of `syllabus/data-engineering.md`) after `clean()`'s stripping —
   including the `(§3.3)` parenthetical, which the checker treats as ordinary text. The three
   clauses union to the entire scope line with nothing left over.
4. **Expert reader.** The red team's finding (see `FACT-CHECK.md`) was confirming the two predicts
   rest on either a cited source quote or the chapter's own established decision rule, not an
   unsourced claim — both checked explicitly and logged.
5. **Second source.** The initial `coverage.json` only mapped one primary source (Kreps); the
   build's coverage checker (`Rule #6`: at least two sources) caught this. Fixed by independently
   fetching and quoting the Dataflow Model paper (Akidau et al., VLDB 2015) rather than attributing
   it to Flink/Spark's own documentation without a fetch — now two real, independently verified
   sources.
6. **Engagement.** Hook (step 1, three competing proposals); predict within the first four steps
   (step 2); three takeaways (steps 4, 6, 8); recap (step 9); "Prove it" (step 10) tightens the
   SLO to a new scenario rather than restating the hook's own numbers.
7. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0% description
   overlap on every step, longest line 27 words. Spot-checked step 6 (the real-costs reveal): the
   narrator argues for *why* each architecture's cost is real, rather than just naming the two
   costs.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic after the `PREVIEW_HELD=1` reel
test run.

1. **Found:** steps 1, 2, 4, 5, 6, 8, 9 — several desktop/phone row pairs collided, mostly because
   `scenes.tsx` rows used 4-6-word values rather than the project's 1-3-word convention. **Fix:**
   shortened every label and value across the file to its essential words (e.g. "unless
   reprocessing says otherwise" → "unless reprocessing flips"), and grew both the row gap (60-65px
   → 70-75px) and each `Svg`'s height to match.
2. **Found:** step 8's predict row ("identical to a quiet day" / "only a freshness alert catches
   it") still collided on desktop even after a first shortening pass. **Fix:** shortened both
   sides further ("a quiet day" / "only alert catches it") and the reel's own takeaway text (which
   had grown to 21 words, failing the build's own 20-word limit) to fit the same idea in fewer
   words.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or surviving-shape highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox on its own hardcoded, unrelated topic (`de.b-trees-vs-lsm`) with "a save did not
open a new GitHub issue" — unrelated to anything this topic touches, same as noted in topics 1
and 2's reviews.
