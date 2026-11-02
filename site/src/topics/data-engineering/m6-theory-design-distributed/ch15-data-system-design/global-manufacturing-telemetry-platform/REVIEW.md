# Review — de.global-manufacturing-telemetry-platform

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 23's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 25's syllabus line (real-time quality
and anomaly monitoring).

1. **Flow.** The bridge answers topic 23's handoff verbatim, and the handoff to topic 25 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts`'s `introduces` arrays: fifteen named ids resolve live; two Chapter 5 ids
   (`queues-vs-logs`, `hyperloglog-distinct-counting`) resolve to a chapter that remains
   unplanned on this site and move to `declared`, each reusing an exact placeholder id already
   used by prior topics for the identical gap, confirmed by grep. `CHAPTER.md`'s own
   `Declared: nothing from Chapter 16` is unaffected, since Chapter 16's own mechanisms stay
   forward pointers throughout, never declared concepts.
2. **Gap hunt — a missed clause caught before shipping.** The raw syllabus line splits into
   seven clauses by `CHAPTER.md`'s own breakdown. The first draft's ten-step storyboard only
   gave a dedicated reveal to five of the seven — the asset-hierarchy-context-join clause and
   the per-site residency clause had no step of their own. Caught this during the gap hunt by
   copying each clause byte-for-byte from the raw line and checking the union against the
   storyboard before writing `coverage.json`, not after a build failure. Fixed by folding the
   asset-context join into the hot-store reveal (now titled "two stores, a cardinality limit,
   and where the asset joins in," with its own takeaway) and residency into the plant-autonomy
   reveal (now titled "plant-local autonomy, and residency per site"), updating `reel.tsx`,
   `scenes.tsx` and `narration.json` together so all three stayed in sync, rather than adding
   steps and renumbering the whole storyboard.
3. **Pre-notes.** 10 bullets (sensor, plant, gateway, buffer, MQTT, time-series database, asset
   hierarchy, cardinality, retention, edge — `CHAPTER.md`'s own "Pre-notes terms" list), each
   under the per-term format, no links.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the Gorilla and Prometheus claims
   each trace to the cited source's own text, and that the topic doesn't overclaim the Gorilla
   compression figure as a promise for this topic's own manufacturing data — `CHAPTER.md`'s own
   instruction to quote it only as a reference point is checked directly against the reveal's
   own wording.
5. **Engagement.** Hook (step 1, a four-hour WAN outage that blanks every plant, then floods on
   reconnect); predict within the first four steps (step 2, the two missing design decisions);
   four takeaways across the reveal steps; recap (step 9); "Prove it" (step 10) extends the
   design to ten times the sensor count, a case not in the hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the outage length, the per-plant rate, the buffer size, the tenfold sensor-count growth)
   stayed in `examples.py`'s lab and `FACT-CHECK.md`'s illustrative-numbers disclosure, out of
   both the on-screen text and the narration.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test. Three values ran to four words in the first draft ("building to a total," "the
   peak, not mean," "the hot store's limit") and were caught and trimmed to "sums to total,"
   "the real peak," and "its own limit" in the same pre-check sweep, rather than discovered
   afterward from a failed smoke test.
2. No takeaway ran over the twenty-word limit in the first draft; the newly added asset-context
   takeaway (added during the gap-hunt fix above) was counted by hand at nineteen words before
   it was ever committed.
3. No "answer"-without-predict mistake occurred this time — the pattern caught on topics 20
   through 23 was checked proactively before writing a single narration line.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-23's reviews.
