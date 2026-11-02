# Review — de.data-quality-monitoring-platform

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 20's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 22's syllabus line (sub-100ms
fraud-scoring pipeline).

1. **Flow.** The bridge answers topic 20's handoff verbatim, and the handoff to topic 22 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: eleven named ids resolve to Chapter 13's
   quality/lineage/governance topics or Chapter 5's cardinality topics, none of which are live
   yet, so all eleven move to `declared` even though `CHAPTER.md` itself states `Declared: none`
   — every one reuses an exact placeholder id already introduced by a prior topic for the
   identical gap, confirmed by grep. Every other named `uses` id resolved live.
2. **Pre-notes.** 10 bullets (data quality, check, anomaly, threshold, blast radius, owner, alert
   fatigue, suppression, incident, runbook — `CHAPTER.md`'s own "Pre-notes terms" list), each
   under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into four clauses by `CHAPTER.md`'s own breakdown
   (check execution; lineage-aware blast radius and alert routing; suppression to fight alert
   fatigue; incident workflow). Copied each clause byte-for-byte from the raw syllabus line and
   confirmed the four clauses union-cover every word of the line; `coverage.json`'s `syllabus`
   array matches this breakdown one clause to one or more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the dbt and Google SRE book claims
   each trace to the cited documentation's own text, and that the topic doesn't overclaim
   `relationships` as part of this topic's own worked lab, since the hook's scenario only needs
   the three generic checks it actually uses.
5. **Engagement.** Hook (step 1, 1,900 alerts in week one, a muted channel, a real failure missed
   for a day); predict within the first four steps (step 2, what the design failed to treat as
   its own requirement); three takeaways across the reveal steps; recap (step 9); "Prove it"
   (step 10) extends the design to ten times the table count, a case not in the hook's own
   scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the check count, the alert count, the downstream-table count, the tenfold growth) stayed in
   `examples.py`'s lab and `FACT-CHECK.md`'s illustrative-numbers disclosure, out of both the
   on-screen text and the narration, following the convention established after topic 10's
   literal-digit build failure.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. One value ran to four words in the first draft (`Recap`'s "the platform's own
   SLO") and was caught and trimmed to "its own number" in the same pre-check sweep, rather than
   discovered afterward from a failed smoke test.
2. Three takeaways ran over the twenty-word limit in the first draft once the em-dash/semicolon-
   joined-clause counting rule was applied by hand (22, 28, and 21 words) and were trimmed to 18,
   20, and 19 words respectively before running the build-time word-count check. Two "answer"
   blocks on reveal steps with no predict question (a mistake caught and fixed on topic 20
   earlier this session) were merged into regular narration lines before the build check ran, so
   the same QUALITY.md #35 failure didn't recur here.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-20's reviews.
