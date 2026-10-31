# Review — de.multi-tenant-analytics-cost

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 18's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 20's syllabus line (GDPR erasure
across lakehouse and backups).

1. **Flow.** The bridge answers topic 18's handoff verbatim, and the handoff to topic 20
   matches `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js
   script parsing `registry.ts`'s `introduces` arrays: six ids resolve to Chapter 13, which
   remains entirely unplanned, so all six move to `declared` even though `CHAPTER.md` itself
   states `Declared: none` — five reuse exact placeholder ids already introduced by prior
   topics for the identical gap, and `dynamic-masking-at-query-time` is a new placeholder for a
   distinction no prior topic needed. Every other named `uses` id resolved live.
2. **Pre-notes.** 8 bullets (tenant, isolation, noisy neighbour, quota, metering, attribution,
   chargeback, row-level security — `CHAPTER.md`'s own "Pre-notes terms" list), each under the
   per-term format, no links.
3. **Gap hunt.** The syllabus line splits into four clauses by `CHAPTER.md`'s own breakdown
   (per-tenant isolation; noisy-neighbour control; per-tenant retention and erasure; metering
   usage into a cost-attribution model). Copied each clause byte-for-byte from the raw syllabus
   line and confirmed the four clauses union-cover every word of the line; `coverage.json`'s
   `syllabus` array matches this breakdown one clause to one or more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the Snowflake and BigQuery claims
   each trace to the cited documentation's own text, and that the topic does not overclaim a
   Snowflake-style idle-time exclusion for BigQuery's own, differently-structured metering model.
5. **Engagement.** Hook (step 1, one seller's query slowing every other seller's dashboard with
   no per-seller cost number); predict within the first four steps (step 2, the two controls
   that would have prevented it); three takeaways across the reveal steps; recap (step 9);
   "Prove it" (step 10) extends the design to ten times the tenant count, a case not in the
   hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description
   overlap stayed within the established band, no digit or VERBATIM issues — this topic's own
   numbers (tenant counts, load multipliers, credit amounts) stayed in `examples.py`'s lab and
   out of both the on-screen text and the narration, following the convention established after
   topic 10's literal-digit build failure.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test; six rows across `RevealForcedUp`, `RevealFairnessRules`, `Recap` and `ProveIt`
   were caught running to four words in the first draft and fixed in the same pre-check sweep,
   rather than discovered afterward from a failed smoke test.
2. Takeaways checked by hand for the em-dash-counts-as-a-word gotcha before running the
   build-time word-count check; all three landed under the twenty-word limit without needing a
   trim.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All step titles were written double-quoted from
the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check
again fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox
Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-18's reviews.
