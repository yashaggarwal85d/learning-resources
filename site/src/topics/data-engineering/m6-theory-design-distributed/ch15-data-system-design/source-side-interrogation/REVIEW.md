# Review — de.source-side-interrogation

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 9's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 11's syllabus line (destination-side
interrogation).

1. **Flow.** The bridge answers topic 9's handoff verbatim, and the handoff to topic 11 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` draws from this chapter (topics 1, 3, 6),
   Chapter 3's `data-contract-specification` and `open-data-contract-standard`, and Chapter 4's
   `resilient-client-patterns`, all confirmed live via a Node.js script that parses `registry.ts`
   and checks each entry's own `introduces` array. `sensitivity-tier-and-category` and
   `openlineage-run-job-dataset-events` (Chapter 13) confirmed NOT live via the same script, so
   both moved to `declared`; Chapter 8 §8.1/§8.2 and Chapter 10 §10.5, which `CHAPTER.md` also
   names for `uses`, are themselves unplanned (no `CHAPTER.md`, no topics built anywhere in
   `registry.ts`), so placeholder ids for that material were added to `declared` too, logged in
   `OUTLINE.md`'s "Changes from the chapter plan" section rather than silently dropped.
2. **Pre-notes.** 8 bullets (source system, schema, rate limit, quota, connector, burst,
   seasonality, residency — `CHAPTER.md`'s own "Pre-notes terms" list), each under the per-term
   format, no links.
3. **Gap hunt.** The syllabus line splits into seven clauses by `CHAPTER.md`'s own breakdown
   (origin/format/schema; volume/rate/burst/seasonality; delivery reliability; pull vs
   push/connector growth; protocol/auth/quotas; encryption/residency/compliance; per-delivery
   metadata/audit/lineage). Copied each clause byte-for-byte from the raw syllabus line (checked
   against `syllabus/data-engineering.md` directly — no non-ASCII punctuation in this line to
   mismatch, unlike topic 9's en-dash case) and confirmed the seven clauses union-cover every
   word of the line, including the full parenthetical on delivery reliability.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the schema-ownership and
   delivery-reliability claims trace to the two ODCS pages and Stripe's own quoted text, and that
   this topic doesn't stretch any of the three sources to cover the design method's own answers
   (topics 1-9) or the destination-side interview (topic 11), both of which `CHAPTER.md`
   explicitly leaves to other topics.
5. **Engagement.** Hook (step 1, a payments partner's "real time" promise cracking three ways);
   predict within the first four steps (step 2); three takeaways (steps 4, 6, 8); recap (step 9);
   "Prove it" (step 10) extends the chapter's own reasoning to a second partner's interview rather
   than restating the hook's own three cracks.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-13% description
   overlap on every step, longest line 40 words. Spot-checked step 6 (the dedup-key reveal): the
   narrator argues for *why* an id beats a timestamp (two events can share one), not just naming
   the rule.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. One build failure was caught and fixed before the first `--only reels` run: step 4's reveal
   originally put a literal "40 seconds" on screen (fig text and a scene row), which
   `examples.py` doesn't compute or assert — the build-time check (QUALITY.md #35, #50, #54, #59)
   catches any on-screen number the lab code doesn't produce. Fixed by rewording both the
   narration and the scene row to "a measured number" / "a stated delay," describing the kind of
   claim without inventing a specific figure. Every other `scenes.tsx` row was written to 1-3
   words per side from the start, with row gaps of 55-75px and `Svg` heights sized to the row
   count.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-constraint highlight per step, matching
`DESIGN.md`'s rule that colour is rare and means something. All ten step titles were written
double-quoted from the start with no embedded apostrophes or nested quote marks, avoiding the
coverage-checker title-escaping bug hit three times in topics 7-9. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-9's reviews.
