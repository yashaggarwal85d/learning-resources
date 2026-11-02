# Review — de.multi-region-analytical-platform

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 17's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 19's syllabus line (multi-tenant
analytics with cost attribution).

1. **Flow.** The bridge answers topic 17's handoff verbatim, and the handoff to topic 19 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: every id resolved live except
   `abac-tag-based-policy` and `pseudonymised-vs-anonymised-data` (Chapter 13 remains entirely
   unplanned), which move to `declared`; `abac-tag-based-policy` reuses the exact placeholder id
   already introduced by topic 11 for the identical gap, and `pseudonymised-vs-anonymised-data`
   is a new placeholder for a distinction no prior topic needed.
2. **Pre-notes.** 9 bullets (region, data residency, replication, federation, egress, failover,
   catalog, RPO, RTO — `CHAPTER.md`'s own "Pre-notes terms" list), each under the per-term
   format, no links.
3. **Gap hunt.** The syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown
   (residency-constrained placement; replication vs federation of queries; egress cost;
   regional failover of pipelines and catalogs; consistent global metrics). Copied each clause
   byte-for-byte from the raw syllabus line and confirmed the five clauses union-cover every
   word of the line; `coverage.json`'s `syllabus` array matches this breakdown one clause to one
   or more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms every GDPR-sourced claim traces
   to the cited article's own quoted text, with the transfer restriction (Article 44) framed
   correctly as conditional, not an absolute ban; the S3 Replication Time Control guarantee and
   the egress price each trace to AWS's own dated documentation, and the egress price is
   explicit about being one region's example rather than a universal figure.
5. **Engagement.** Hook (step 1, a weekend replication crossing a border nobody checked, plus a
   lost catalog); predict within the first four steps (step 2, the two decisions that would
   have prevented both); three takeaways across the reveal steps; recap (step 9); "Prove it"
   (step 10) extends the stalest-region framing to a new region mid-backfill, a case not in the
   hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description
   overlap stayed within the established band, no digit or VERBATIM issues — this topic's own
   numbers (the $0.09/GB rate, the egress volumes) stayed in `examples.py`'s lab and out of both
   the on-screen text and the narration, following the convention established after topic 10's
   literal-digit build failure. The one real dated number (AWS's $0.09/GB) lives only in
   `examples.py` and `SOURCES.md`, never in the reel's on-screen text or narration.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test; five rows across `Hook`, `Predict1`, `RevealPlacement`, `Recap` and `ProveIt`
   were caught running to four or five words in the first draft and fixed in the same pre-check
   sweep, rather than discovered afterward from a failed smoke test.
2. The "global figure carries the freshness of its stalest region" takeaway was first drafted
   at 25 words (over the 20-word build-time limit) — trimmed by dropping the trailing clause
   about what a strongly-consistent counter costs, kept as a separate sentence in the step's
   body text instead, rather than counted toward the takeaway.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All step titles were written double-quoted from
the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check
again fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox
Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-17's reviews.
