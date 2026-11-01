# Review: de.event-time-watermarks-late-data

## Content review

The core claim this topic needed was the watermark-eviction rule, and the first probe round
got it wrong: sending a late event just after the watermark had numerically passed its own
timestamp, expecting a drop, and watching it get counted anyway. That forced a re-read of
`EventTimeWatermarkExec.scala` and the docs' own illustration together, which clarified the
real rule -- eviction keys off the window's own *end* against the watermark, not the event's
own timestamp against the watermark. The final `examples.py` design (two probes: the same
lateness sent twice, once while the window is still live and once after it has been evicted)
isolates that distinction directly rather than asserting a single drop in isolation, which is
what makes the fact-check's red-team section meaningfully different from a restated docs quote.

`reel.tsx`'s two takeaways originally ran to 22 words each and needed a trim to fit the
20-word limit -- a recurring pattern across this chapter's topics, worth budgeting for on the
first draft rather than the second pass. `narration.json` was initially written with a `text`
field per step instead of the actual `lines` array schema the build expects (`Step = { lines:
Line[]; answer?: Line[] }`), which failed the build with an opaque `n.lines is not iterable`
error inside Astro's static-path generation -- fixed by rewriting the file against an existing
topic's own `narration.json` as a template. Worth flagging for the next topic in this chapter
in case the same mistake recurs.

## Looks review

Scenes follow the established `Row` kit pattern from every prior chapter-7 topic; every label
and value stayed within the 1-3 word budget on the first pass this time (checked with the usual
`grep | sed | awk` word count before writing `reel.tsx`, rather than after). No visual
elaboration beyond the kit's own moves was needed for the eviction-rule contrast -- the
predict/reveal pair at steps 3-4 and 6-7 carries the distinction on its own.
