# Review: de.stateful-operators-output-modes

## Content review

The three measured claims line up directly with the chapter's own outcome ("choose the correct
output mode ... and explain why an unsupported combination is rejected"): a real
`AnalysisException` for complete-mode-on-a-join, unbounded join-state growth with no watermark,
and a plateau once a watermark and time-range condition are added. The state-growth probes
originally used the memory sink for all three scenarios; switching the two growth/plateau
probes to the `noop` sink (still exposes `recentProgress.stateOperators`, materializes nothing)
kept the run fast and made the longer unbounded-growth probe safe to leave running unattended
for the full measurement window.

`SOURCES.md` needed several quote fixes on the first `sources.mjs check` pass -- three of the
initial quotes stitched together text from adjacent HTML table cells that aren't actually
contiguous in the source's own plain-text extraction (each cell lands on its own line). Fixed by
quoting them as the multi-line `>` blocks the format doc already supports, matching the source's
own line breaks exactly rather than paraphrasing cells into one sentence.

`reel.tsx`'s two "elaborate" takeaways both needed trimming from 21 words down to 20 on the
first pass -- the same pattern as the previous two topics in this chapter; still worth padding
less on the first draft rather than catching it every time in review.

## Looks review

`scenes.tsx` follows the chapter's established `Row` kit pattern. The first draft had four
Row values running to 4 words ("whole table, every time", "no safe drop point", "what rejects a
mode", "what the query computes") -- caught by the usual `grep | sed | awk` word-count pass
before writing `reel.tsx`, all shortened to 1-3 words. Predicts land at steps 3 and 6 (index 2
and 5), both within the chapter's established "takeaway never on the from-step or immediately
after a predict" pattern, applied without needing a rework this time.
