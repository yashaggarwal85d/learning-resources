# Review — de.gdpr-erasure-across-lakehouse

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 19's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 21's syllabus line (data-quality
monitoring platform).

1. **Flow.** The bridge answers topic 19's handoff verbatim, and the handoff to topic 21 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: nine named ids resolve to Chapter 13, which
   remains entirely unplanned, so all nine move to `declared` even though `CHAPTER.md` itself
   states `Declared: none` — six reuse exact placeholder ids already introduced by prior topics
   for the identical gap, and `kafka-tombstones-retention-erasure`, `lineage-coverage-gaps` and
   `owner-notification-deprecation-workflow` are new placeholders for distinctions no prior topic
   needed. Every other named `uses` id resolved live.
2. **Pre-notes.** 9 bullets (data subject, erasure request, deadline, snapshot expiry, backup,
   tombstone, crypto-shredding, proof of deletion, legal hold — `CHAPTER.md`'s own "Pre-notes
   terms" list), each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into six clauses by `CHAPTER.md`'s own breakdown
   (locate via lineage and indexes; row-level deletes; snapshot expiry and rewrite; backups and
   downstream copies; crypto-shredding; proof of deletion). Copied each clause byte-for-byte from
   the raw syllabus line and confirmed the six clauses union-cover every word of the line;
   `coverage.json`'s `syllabus` array matches this breakdown one clause to one or more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the GDPR Article 17 and NIST
   SP 800-88 claims each trace to the cited text's own quoted language, and that the topic does
   not overclaim which data a given legal-claims exception actually covers — it names the
   exception as a legal question rather than resolving it.
5. **Engagement.** Hook (step 1, a correct and complete lakehouse delete that still leaves the
   subject findable in four other places); predict within the first four steps (step 2, which
   parts of the design were missing and which have no technical answer at all); three takeaways
   across the reveal steps; recap (step 9); "Prove it" (step 10) extends the design to a subject
   replicated into a second region, a case not in the hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the illustrative eleven days, the crossover's request-rate and backup-length figures) stayed
   in `examples.py`'s lab and `FACT-CHECK.md`'s illustrative-numbers disclosure, out of both the
   on-screen text and the narration, following the convention established after topic 10's
   literal-digit build failure.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. Two values ran to four words in the first draft (`Predict1`'s "plus a legal call"
   and `ProveIt`'s "the register catches it") and were caught and trimmed in the same pre-check
   sweep, rather than discovered afterward from a failed smoke test.
2. Two takeaways ran over the twenty-word limit in the first draft once the em-dash-counts-as-a-
   word rule was applied by hand (the blind-spots takeaway at 22 words, the proof-of-deletion
   takeaway at 21 words) and were trimmed to 20 and 18 words respectively before running the
   build-time word-count check.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks — "the delete was correct, the name
wasn't gone" uses the straight apostrophe inside a double-quoted string, which is safe. The
unrelated `test:editor` check again fails in this sandbox with "a save did not open a new GitHub
issue" — a known sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-19's reviews.
