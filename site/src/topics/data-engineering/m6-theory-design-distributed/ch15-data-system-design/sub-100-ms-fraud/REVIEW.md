# Review — de.sub-100-ms-fraud

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 21's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 23's syllabus line (feature platform
with point-in-time correctness).

1. **Flow.** The bridge answers topic 21's handoff verbatim, and the handoff to topic 23 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: all fourteen named ids resolve live except
   `quantile-sketches`, which moves to `declared` even though `CHAPTER.md` itself states
   `Declared: none` — Chapter 5's quantile-sketch topic is not yet built, so the id is not yet
   introduced anywhere. `redis-valkey-internals` went live mid-session (a sibling thread shipped
   it while this topic was being written); re-ran the resolution script before writing the
   registry entry and confirmed it now resolves, so it moves to `uses`, not `declared`.
   "The Tail at Scale" (Dean and Barroso) was named as a candidate source but every fetchable URL
   returned either an abstract-only page or a dead link; substituted the Apache Flink and Redis
   documentation as the topic's two primary sources instead, consistent with the "pick two
   working sources even when `CHAPTER.md` names more candidates" convention used in prior topics.
2. **Pre-notes.** 10 bullets (latency budget, p99, feature, online store, model inference,
   timeout, fallback, false positive, chargeback, label — `CHAPTER.md`'s own "Pre-notes terms"
   list), each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown
   (the pipeline strip; latency budget per hop; state size; fallback decisions on timeout; label
   feedback and replay). Copied each clause byte-for-byte from the raw syllabus line and confirmed
   the five clauses union-cover every word of the line; `coverage.json`'s `syllabus` array matches
   this breakdown one clause to one or more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the Flink and Redis claims each
   trace to the cited documentation's own text, and that the topic doesn't overclaim the
   single-threaded Redis design as a design preference rather than the actual mechanism behind
   why one slow command delays every other request on the same store.
5. **Engagement.** Hook (step 1, a comfortable average, a budget-blowing p99, fraud concentrated
   in the fallback); predict within the first four steps (step 2, where the p99 actually went);
   three takeaways across the reveal steps; recap (step 9); "Prove it" (step 10) extends the
   design to ten times the payment rate, a case not in the hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the budget split, the payment-rate multiplier, the card count) stayed in `examples.py`'s lab
   and `FACT-CHECK.md`'s illustrative-numbers disclosure, out of both the on-screen text and the
   narration. A comment in `reel.tsx` naming "NIST SP 800-88" on an earlier topic this session had
   already tripped the literal-digit check once; this topic's own comments were written digit-free
   from the start.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. Three values ran to four words in the first draft ("plus a real choice", "too big
   for memory", "the log trains it") and were caught and trimmed in the same pre-check sweep,
   rather than discovered afterward from a failed smoke test.
2. Three `reel.tsx` takeaways ran over the twenty-word limit in the first draft and were trimmed
   before running the build-time word-count check. Three "answer" blocks on reveal steps with no
   predict question (the same QUALITY.md #35 mistake caught on topics 20 and 21 earlier this
   session) were caught and merged into regular narration lines proactively, before the build
   check ran at all, rather than discovered from a failed build.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-21's reviews.
