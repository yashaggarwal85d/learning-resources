# Review — de.destination-side-interrogation

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 10's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 12's syllabus line (clickstream and
ad-click analytics).

1. **Flow.** The bridge answers topic 10's handoff verbatim, and the handoff to topic 12 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` draws from this chapter (topics 1, 4, 5, 10)
   and Chapter 3's grain topic, all confirmed live via a Node.js script that parses `registry.ts`
   and checks each entry's own `introduces` array. The four Chapter 13 access-control ids
   `CHAPTER.md` names for `uses` are confirmed NOT live via the same script — Chapter 13 is
   itself unplanned anywhere in `registry.ts` — so all four moved to `declared`, logged in
   `OUTLINE.md`'s "Changes from the chapter plan" section rather than silently dropped.
2. **Pre-notes.** 9 bullets (consumer, use case, dashboard, API, grain, concurrency, export,
   access control, retention — `CHAPTER.md`'s own "Pre-notes terms" list), each under the
   per-term format, no links.
3. **Gap hunt.** The syllabus line splits into eight clauses by `CHAPTER.md`'s own breakdown
   (consumers/use cases; freshness/query/scan/latency; grain/modeling; concurrency/scaling;
   retention/archival/reprocessing; monitoring/debugging; access control/sensitive-data/export;
   use-case-and-load evolution). Copied each clause byte-for-byte from the raw syllabus line
   (checked against `syllabus/data-engineering.md` directly — no non-ASCII punctuation in this
   line besides the standard em-dash prefix) and confirmed the eight clauses union-cover every
   word of the line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the several-consumers and
   freshness claims trace to the SRE book's and workbook's own quoted text, and that this topic
   doesn't stretch either source to cover the design method's own answers (topics 1-9) or the
   source-side interview (topic 10), both of which `CHAPTER.md` explicitly leaves to other
   topics.
5. **Engagement.** Hook (step 1, one vague sentence producing two equally faithful pipelines);
   predict within the first four steps (step 2); three takeaways (steps 4, 6, 8); recap
   (step 9); "Prove it" (step 10) extends the chapter's own reasoning to a second vague prompt
   rather than restating the hook's own two pipelines.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 3-26% description
   overlap on every step, longest line 34 words. Spot-checked step 6 (the bet-vs-fact reveal):
   the narrator argues for *why* a guess gets marked differently from a stated answer, not just
   naming the distinction.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. No build failures this time — the literal-digit lesson from topic 10 (every on-screen number
   must come from `examples.py`) was applied from the start: every reveal describes a kind of
   answer ("a bet," "a concrete bound," "several stores") rather than a specific invented
   figure. Every `scenes.tsx` row was written to 1-3 words per side from the start, with row
   gaps of 50-75px and `Svg` heights sized to the row count.
2. All ten step titles were written double-quoted from the start with no embedded apostrophes
   or nested quote marks, avoiding the coverage-checker title-escaping bug hit in topics 7-9.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-10's reviews.
