# Review — de.real-time-quality-anomaly

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 24's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then Chapter 16's own opening line (the next
chapter this topic hands off to).

1. **Flow.** The bridge answers topic 24's handoff verbatim, and the handoff closes both the
   chapter and the milestone, matching `CHAPTER.md`'s own bridge and handoff text exactly.
   Checked every named `uses` id via a Node.js script parsing `registry.ts`'s `introduces`
   arrays: fifteen named ids resolve live; two Chapter 5 ids (`hyperloglog-distinct-counting`,
   `quantile-sketches`) resolve to a chapter that remains unplanned and move to `declared`, the
   same two ids topics 21 and 22 already declared for the identical gap, confirmed by grep.
   `CHAPTER.md`'s own `Declared: nothing from Chapter 16` is unaffected, since neither id is from
   Chapter 16.
2. **Gap hunt.** The raw syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown
   (the dashboard-and-detector split; the three baseline families; per-series state at high
   cardinality; deduplication and suppression; backtesting with Chapter 16's own forward
   pointer). Copied each clause byte-for-byte from the raw line, including the inline "(Ch.16)"
   reference, and confirmed the five clauses union-cover every word of the line;
   `coverage.json`'s `syllabus` array matches this breakdown one clause to one step.
3. **Pre-notes.** 10 bullets (anomaly, baseline, moving average, control limit, seasonality,
   cold start, deduplication, suppression, backtest, false alarm — `CHAPTER.md`'s own
   "Pre-notes terms" list), each under the per-term format, no links.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the NIST EWMA and control-chart
   claims each trace to the handbook's own text, and that the topic doesn't overclaim the EWMA's
   own sensitivity to drift as a flaw in the statistic itself, rather than a failure mode that
   only bites when the drift is the fault.
5. **Engagement.** Hook (step 1, a false alarm ignored for a week, then a real drift that never
   fires); predict within the first four steps (step 2, what the design got wrong in both
   directions); four takeaways across the reveal steps; recap (step 9); "Prove it" (step 10)
   extends the design to ten times the series count, a case not in the hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description
   overlap stayed within the established band, no digit or VERBATIM issues — this topic's own
   numbers (the sigma threshold, the week of false alarms, the drift's own duration, the
   tenfold series-count growth) stayed in `examples.py`'s lab and `FACT-CHECK.md`'s
   illustrative-numbers disclosure, out of both the on-screen text and the narration.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. Three values ran to four words in the first draft ("the design was wrong," "on a
   later one," "each with its gap") and were caught and trimmed to "wrong both ways," "a later
   period," and "named failure modes" in the same pre-check sweep, rather than discovered
   afterward from a failed smoke test.
2. Two `reel.tsx` takeaways ran over the twenty-word limit in the first draft (21 and 22 words)
   once counted by hand against the word-count rule, and were trimmed to 18 and 20 words
   respectively before running the build-time word-count check. One narration line ran to
   fifty-one words and was split in two before the build check ran.
3. No "answer"-without-predict mistake occurred this time — the pattern caught on topics 20
   through 23 was checked proactively before writing a single narration line.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-24's reviews.
