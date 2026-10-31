# Review — de.feature-platform-point-time

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 22's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 24's syllabus line (global
manufacturing telemetry platform).

1. **Flow.** The bridge answers topic 22's handoff verbatim, and the handoff to topic 24 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: all eighteen named ids resolve live, matching
   `CHAPTER.md`'s own `Declared: none`. Uber's Michelangelo write-up was named as a candidate
   source but every URL tried (eng.uber.com and its regional mirrors) returned either a 404 or an
   HTTP 406 bot block; substituted two pages of Feast's own documentation ("Point-in-time joins"
   and "Online store") as the topic's two primary sources instead, consistent with the "pick two
   working sources even when `CHAPTER.md` names more candidates" convention used in prior topics.
2. **Pre-notes.** 9 bullets (feature, feature store, training set, label, online store, offline
   store, train/serve skew, point-in-time join, leakage — `CHAPTER.md`'s own "Pre-notes terms"
   list), each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown
   (one definition feeding two stores; streaming and batch features; point-in-time joins;
   online/offline parity; backfilling new features). Copied each clause byte-for-byte from the
   raw syllabus line, including the inline "(§17.1)" reference, and confirmed the five clauses
   union-cover every word of the line; `coverage.json`'s `syllabus` array matches this breakdown
   one clause to one step.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the Feast claims each trace to the
   cited documentation's own text, and that the topic doesn't overclaim Feast's TTL-bounded
   backward scan as an unbounded history read.
5. **Engagement.** Hook (step 1, a strong offline score, a flat online lift, traced to one
   feature joined on "now"); predict within the first four steps (step 2, the single join rule
   that prevents it); three takeaways across the reveal steps; recap (step 9); "Prove it"
   (step 10) extends the design to ten times the feature count, a case not in the hook's own
   scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the leakage window, the measured bias margin, the tenfold feature-count growth) stayed in
   `examples.py`'s lab and `FACT-CHECK.md`'s illustrative-numbers disclosure, out of both the
   on-screen text and the narration.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. Two values ran to four words in the first draft ("join as of then" in `Predict1`
   and "as of the event" in `Recap`) and were caught and trimmed to "join as-of" and "as of
   event" in the same pre-check sweep, rather than discovered afterward from a failed smoke test.
2. Two `reel.tsx` takeaways ran over the twenty-word limit in the first draft once counted by
   hand against the word-count rule (23 and 21 words) and were trimmed to 20 words each before
   running the build-time word-count check.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-22's reviews.
