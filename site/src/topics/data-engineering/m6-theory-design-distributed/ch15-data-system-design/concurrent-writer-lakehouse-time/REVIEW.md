# Review — de.concurrent-writer-lakehouse-time

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 14's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 16's syllabus line (the resumable
multi-TB historical backfill).

1. **Flow.** The bridge answers topic 14's handoff verbatim, and the handoff to topic 16 matches
   `CHAPTER.md`'s own bridge text exactly. Checked each explicitly named `uses`/`declared` id via
   a Node.js script parsing `registry.ts` and checking each entry's own `introduces` array:
   Chapter 5's concurrency-theory ids and both of topic 14's own introduced ids
   (`cdc-lakehouse-design`, `merge-stall-to-slot-growth-interaction`) are confirmed live.
   Chapter 13 and Chapter 14 (data-engineering) are both confirmed entirely unplanned in
   `registry.ts`; their six named ids move to `declared`, reusing the exact placeholder ids
   topics 13 and 14 already introduced for the same gaps (`table-commit-as-cas`,
   `erasure-vs-time-travel-snapshot-expiry`, `delete-files-until-compaction`) and adding three
   new placeholders this topic needed for the first time (`zookeeper-etcd-guarantees`,
   `strict-serializability-definition`, `erasure-proof-retention-as-code`).
2. **Pre-notes.** 9 bullets (snapshot, commit, optimistic concurrency, conflict, retry, time
   travel, audit, compaction, orphan file — `CHAPTER.md`'s own "Pre-notes terms" list), each
   under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into four clauses by `CHAPTER.md`'s own breakdown
   (catalog-level atomic commits with conflict retry; schema evolution policy; snapshot
   expiration versus time-travel and audit; maintenance scheduling). Copied each clause
   byte-for-byte from the raw syllabus line, preserving its own "optimiztic" misspelling exactly
   as `CHAPTER.md` itself instructs, and confirmed the four clauses union-cover every word of
   the line including the `§6.3` parenthetical.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the atomic-swap, legal-hold-tag,
   and both Delta conflict-exception claims trace to SOURCES.md's own quoted Iceberg
   specification, Iceberg branching documentation, and Delta Lake documentation, and that none
   of the three sources is stretched to cover commit protocols, snapshot structures, catalog
   implementations, or maintenance procedures beyond what each source's own quote states.
5. **Engagement.** Hook (step 1, a recurring commit conflict between compaction and the CDC
   merge, plus a separately expired audit snapshot); predict within the first four steps (step
   2, the one decision that prevents both); three takeaways (steps 4, 6, 8); recap (step 9);
   "Prove it" (step 10) extends the disjoint-partitioning check to a brand-new writer joining
   the table rather than restating the hook's own two scenarios.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 3-31% description
   overlap on every step, longest line 40 words. No digit or VERBATIM issues — this topic's own
   technical vocabulary (atomic swap, legal-hold tag, disjoint partitions) was written out in
   full descriptive form in both the narration and the reel/scenes text from the start.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Astro's build-time check (QUALITY.md #35, #50, #54, #59) flagged two takeaways for exceeding
   the twenty-word limit (steps 4 and 6) on the first pass — the word-count tool counts an
   em-dash as its own token, so both were rewritten with a colon in place of the dash rather
   than trimmed further, which fixed the count without losing the sentence's structure.
2. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test; two rows (`RevealMaintenanceSchedule`'s "the window" row and `ProveIt`'s "the fix"
   row) were caught running to four words in the first draft and fixed in the same sweep.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All ten step titles were written double-quoted
from the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-14's reviews.
