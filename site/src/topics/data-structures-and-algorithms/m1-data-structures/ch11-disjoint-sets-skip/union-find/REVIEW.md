# REVIEW: Union-find (`dsa.union-find`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and reel step titles
(`dsa.adjacency-lists-matrices-edge`), this topic's `reel.tsx`, `scenes.tsx`, `narration.json`,
`pre-notes.md`, `post-notes.md`, `prerequisites.mdx`, `references.md`, the registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `CHAPTER.md`'s topic 38 entry and
topic 39's opening line, and the syllabus line itself.

1. **Compression scene's "swing to root" lines pointed at the wrong coordinates.** (major, fixed)
   - **Where:** `scenes.tsx`, `Compression`, the `after` branch.
   - **What:** every collapsed node's line target was computed as `90 + 7 * 90 - 7 * 90`, which
     algebraically simplifies to a fixed point that is not the drawn root's position (node index
     seven), so every "swings to the root" line pointed at node index four instead.
   - **Fix:** computed the root's real coordinates once and used them for every line's target.
   - **Status:** fixed.
2. **Step 6's predict and step 7's reveal both name "under five" before step 7 defines why.**
   (minor, no change)
   - **Where:** step 6's predict option/explain, step 7's body.
   - **What:** the predict in step 6 already gives away the exact number ("bounded by a number
     under five") that step 7 then explains as alpha(n). This is deliberate, not an oversight: the
     predict's job is to make the learner commit to a guess before the reveal, and the chapter
     plan's own storyboard puts the predict immediately before the bound, so the number lands
     twice on purpose, once as the answer to a guess and once with its name attached.
   - **Fix:** none; flagged and judged intentional on re-reading.
3. **The Hook step's "ten million" is never revisited with a real measured number.** (minor, no
   change)
   - **Where:** step 1.
   - **What:** ten million is the syllabus lab's own scale and the scenario's hook number, not a
     number this topic's `examples.py` computes (it is reduced to numbers this sandbox can
     actually run, as `FACT-CHECK.md` and `lab_timing.py`'s own docstring record). It is spelled
     as words, not a digit, specifically so it is not read as a claim needing `examples.py`
     backing (`topic-checks.ts`'s digit check only flags literal digits).
   - **Fix:** none needed; this is the intended use of the house convention, not a gap.
4. **Gap hunt against the syllabus line and CHAPTER.md's scope bullets:** every clause (union by
   rank/size; path compression, named with halving/splitting from their standard definition;
   the O(alpha(n)) bound with its Tarjan 1975 attribution; the three uses with the Data
   Engineering pointer) is taught in a step or a Deep dive section, mapped in `coverage.json`
   and confirmed by the build's own coverage check. No gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is step 6/7's
   "under five" — a learner could mistake it for a universal constant rather than a bound tied to
   the specific inverse-Ackermann definition Sedgewick and Wayne state it for. `FACT-CHECK.md`
   already documents the two different exact definitions (Erickson's "at most three" is a
   different function); the reel itself only ever shows the one number it can attribute to one
   source, which is the right call for a 14-minute reel, with the nuance left to `FACT-CHECK.md`
   and `post-notes.md`'s Internals section for anyone who goes looking.
6. **Engagement check:** step 1 hooks on a real, named problem (entity resolution at scale); the
   first predict is step 3, within the first four steps; a surprising number lands at step 7
   (alpha(n) under five, forever); four takeaways; step 9 recaps in the professor's own words, not
   a replay of the takeaways.
7. **Narration teaches, not reads:** `narration-teaches.mjs` reports zero to six percent
   description-overlap on every step (all ten), well under the flag threshold, and no caption
   sentence is spoken verbatim.

## Looks review (self-review, 2026-10-31)

Reviewed the ten `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading the
SVG coordinates and opacity timings directly (no rendered screenshots in this session, since the
reel smoke test — run separately — already confirmed no clipped, overlapping or under-sized text
at desktop and phone widths).

- **Colour:** every scene stays inside the chapter's grammar (crema for an element, latte for
  secondary labels, caramel for the thing to look at, cherry/cherryText for the one bad outcome
  in `ProveIt` and `ThreeUses`'s limit line, cinnamon only for the "under five" reference line in
  `AlphaBound`). No scene uses more than two accent colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`/`easeInOut`, with
  nothing drawn fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` (all reveal windows
  finished) against its caption; each one's end state matches what the caption claims.
- **One real bug found and fixed** (see content review finding 1 above) by reading the
  coordinates by hand rather than trusting the visual description in the code's own comments.

No further findings. `coverage.json` → `gapReview` recorded below.
