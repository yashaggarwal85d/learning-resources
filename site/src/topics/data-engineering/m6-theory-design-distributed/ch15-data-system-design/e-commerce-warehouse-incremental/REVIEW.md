# Review — de.e-commerce-warehouse-incremental

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 12's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 14's syllabus line (CDC into the
lakehouse).

1. **Flow.** The bridge answers topic 12's handoff verbatim, and the handoff to topic 14 matches
   `CHAPTER.md`'s own bridge text exactly. All 30 explicitly named `uses` ids are confirmed live
   via a Node.js script that parses `registry.ts` and checks each entry's own `introduces`
   array, matching `CHAPTER.md`'s own stated `Declared: none`. `CHAPTER.md` separately asks this
   topic to resolve ids from Chapter 6 §6.3 and Chapter 8 §8.2; confirmed both chapters (data
   engineering) have zero topics in `registry.ts`, so this topic reuses the exact placeholder
   ids topics 10 and 12 already introduced for the same two gaps, rather than inventing new,
   inconsistent names.
2. **Pre-notes.** 9 bullets (fact table, dimension, grain, slowly changing dimension, merge,
   incremental load, mart, semantic layer, high-water mark — `CHAPTER.md`'s own "Pre-notes
   terms" list), each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into four clauses by `CHAPTER.md`'s own breakdown
   (the dimensional model; incremental/merge loads with SCD handling; marts and the semantic
   layer; the full-versus-incremental crossover). Copied each clause byte-for-byte from the raw
   syllabus line and confirmed the four clauses union-cover every word of the line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the unique-key and `MERGE`
   claims trace to dbt's and PostgreSQL's own quoted documentation, and that neither source is
   stretched to cover dimensional-modelling mechanics, SCD implementations, merge syntax, or CDC
   itself, each of which `CHAPTER.md` explicitly leaves to other chapters or topic 14.
5. **Engagement.** Hook (step 1, a nine-hour rebuild gone incremental, then a silent order-count
   shortfall); predict within the first four steps (step 2, which risk the design didn't name);
   three takeaways (steps 4, 6, 8); recap (step 9); "Prove it" (step 10) extends the chapter's
   own crossover formula to a second, already-drifted table rather than restating the hook's
   own deleted-row cause.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 6-31% description
   overlap on every step, longest line 32 words. One real bug caught by this check: the first
   SCD-and-merge narration draft read "SCD Type 2" and "Type 1" verbatim from the digit-bearing
   terminology, which the script's own unspeakable-line check (digits) flagged — fixed by
   describing each policy by what it does (keeps history / overwrites in place) instead of its
   numbered name, in both narration.json and the matching reel.tsx body and scenes.tsx row.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. One `scenes.tsx` row word count was fixed during the pre-check sweep this session has since
   learned to run before the first `--only reels` call — several rows across the session's
   other topics ran to four or five words; applying the same 1-3-word audit to this topic's own
   file up front avoided a repeat of the phone-width overlap hit in topics 7-9.
2. The same digit issue the narration check caught (SCD Type 2 / Type 1) was also present in
   `reel.tsx`'s body text and one `scenes.tsx` row — fixed in all three places together rather
   than only where the automated check happened to look.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All ten step titles were written double-quoted
from the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-12's reviews.
