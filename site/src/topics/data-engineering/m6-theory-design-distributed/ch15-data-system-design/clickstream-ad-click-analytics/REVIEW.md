# Review — de.clickstream-ad-click-analytics

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 11's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 13's syllabus line (e-commerce
warehouse with incremental loads).

1. **Flow.** The bridge answers topic 11's handoff verbatim, and the handoff to topic 13 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` draws from the design method (topics 1-9) and
   Chapter 2's gaps-and-islands/session-id concepts, all confirmed live via a Node.js script
   that parses `registry.ts` and checks each entry's own `introduces` array. Five ids
   `CHAPTER.md` names for `uses` (`at-least-once-plus-idempotence`, `atomic-offset-output-commit`,
   `kafka-isr-non-majority-quorum`, `queues-vs-logs`, `hyperloglog-distinct-counting`) are
   confirmed NOT live — Chapter 14 (data engineering) doesn't exist yet, and the two ids
   `CHAPTER.md` labels "Chapter 5" aren't introduced anywhere under that name — so all five
   moved to `declared`. `CHAPTER.md` separately asks this topic to resolve ids from Chapter 9
   §9.1-§9.3, Chapter 7 §7.4, and Chapter 6 §6.3; confirmed those three chapters (data
   engineering) have zero topics in `registry.ts` at all, so three placeholder ids stand in,
   logged in `OUTLINE.md`'s "Changes from the chapter plan" section rather than silently dropped.
2. **Pre-notes.** 8 bullets (clickstream, session, collector, event id, bot traffic, late event,
   reconciliation, billing-grade — `CHAPTER.md`'s own "Pre-notes terms" list), each under the
   per-term format, no links.
3. **Gap hunt.** The syllabus line splits into three clauses by `CHAPTER.md`'s own breakdown
   (the pipeline strip; sessionisation/bot filtering/late events; the streaming-plus-batch
   reconciliation decision). Copied each clause byte-for-byte from the raw syllabus line via
   Python's own `repr()` on the file (confirming the exact Unicode arrow character, `→`, used
   six times in the first clause) and confirmed the three clauses union-cover every word of the
   line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the session-window and
   allowed-lateness claims trace to Flink's own quoted documentation, and the dual-logic-drift
   claim traces to Kreps's own quoted conclusion; neither source is stretched to cover the named
   mechanisms this topic explicitly leaves as choices (Kafka, Flink internals, bot-detection
   models, table formats) or the Lambda-versus-Kappa debate, which `CHAPTER.md` reserves for
   topic 17.
5. **Engagement.** Hook (step 1, an ad partner's billing dispute between two correct pipelines);
   predict within the first four steps (step 2, which failure mode and which side is right);
   three takeaways (steps 4, 6, 7); recap (step 9); "Prove it" (step 10) extends the chapter's
   own reasoning to a second, differently-caused billing dispute rather than restating the
   hook's own late-event cause.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 2-28% description
   overlap on every step, longest line 39 words. Spot-checked step 6 (the stream-versus-batch
   reveal): the narrator argues for *why* the batch overrides the stream for billing (it's the
   number of record), not just naming which number is used.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Several row-width overruns were caught and fixed before the first `--only reels` run — this
   topic's `scenes.tsx` rows initially ran longer than the established 1-3-word guideline in
   several reveals (a session-gap row, a late-event row, a stream-versus-batch row, a drift
   row, a cost-lever row, and the recap's own pipeline and sessions rows). Fixed by shortening
   each to 2-3 words per side before running the smoke test at all, rather than discovering the
   overlap at phone width afterward.
2. No build-time digit failure this time — every on-screen claim describes a kind of answer
   ("fast, slightly low," "an inactivity gap," "flagged either way") rather than a specific
   invented figure, applying the lesson from topic 10 from the first draft.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All ten step titles were written double-quoted
from the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-11's reviews.
