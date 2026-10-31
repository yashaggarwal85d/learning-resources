# Review — de.managed-ingestion-tools-build

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 7's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the 8.2 section's opening topic's syllabus
line (query-based vs log-based CDC).

1. **Flow.** The bridge answers topic 7's handoff ("Everything in this section can be built by
   hand... whether to build it at all... is the last question of the section") and this topic's
   own handoff matches `CHAPTER.md`'s own handoff into 8.2 (the failure a cursor can't fix:
   deletes and intermediate states). Checked all seven named `uses` ids via the registry-parsing
   script: `high-watermark-cursor`, `keyset-pagination-consistency`,
   `rate-limit-backoff-ingestion`, `object-store-commit-protocols`, `exactly-once-effect-recipe`,
   `raw-layer-replay-metadata` and `data-contract-specification` all resolve live.
2. **Pre-notes.** 7 bullets (connector, managed service, Monthly Active Rows, schema drift,
   schema contract, Singer/state, long tail — `CHAPTER.md`'s own syllabus terms for this topic),
   each under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.1) splits into the
   five clauses it actually contains: the five named tools; connector maintenance as the real
   cost; row/MAR-based pricing; schema-drift handling; when to own a connector. `coverage.json`'s
   `syllabus` array matches this five-clause breakdown exactly, copied verbatim from the raw
   syllabus file (including the "(merging with dbt Labs, announced Oct 2025)" parenthetical,
   kept as-is since the checker needs an exact substring, while the topic's own content corrects
   the staleness in prose).
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (the MAR billing rule, the decision rule's own
   sovereignty-first structure), not invented reasoning. Every measured claim traces to a
   specific function in `examples.py`; the three source quotes (Fivetran's MAR definition and
   merger completion, dlt's four contract modes) are used only to name the real-world rules this
   topic's own measurements reproduce, never as a substitute for direct measurement. The
   twelve-failure-mode count is disclosed as this topic's own tally against earlier topics, not
   an external citation.
5. **Engagement.** Hook (step 1, a tripled bill with a flat row count); predict within the first
   four steps (step 2, which table costs more under MAR pricing); four takeaways across the
   reveal steps (steps 4, 6, 8, 9); recap (step 9) names the three inputs to the final decision;
   "Prove it" (step 10) applies the decision rule to a case designed to tempt the wrong
   reasoning (low volume looking like a reason to buy) despite the correct answer turning on a
   different factor entirely.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a measurement comes out the way it does (why touched, not
   total size, decides a bill; why sovereignty is checked first in the decision rule; why a
   dozen solved problems are what a tool's price actually buys) rather than reading the figure's
   own on-screen labels back. No digits appear in `reel.tsx`, `scenes.tsx` or `narration.json`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft;
   `grep` for digits returns no matches.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: two of four takeaways (28 and 25 words) needed
   trimming down to 20 each; the other two (20, 19) needed no change. A narration line in the
   Recap step also needed splitting after the build caught a 55-word line against the 50-word
   per-line limit.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") against
   fully in-process synthetic data before writing the reel, so every figure on screen matches a
   number that was actually measured, not estimated.

Final build: `cd site && npm run build` completed clean after the narration-length fix. The
unrelated `npm run test:editor` check is a known pre-existing sandbox limitation (see team
memory `learning-resources-recurring-bugs`), unrelated to anything this topic touches. The
held-topic reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two
separate invocations, per the sandbox-level Playwright flakiness noted in topic 7's own review.
