# REVIEW: Compressed bitmaps: Roaring (`dsa.compressed-bitmaps-roaring`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and handoff (`dsa.bloom-filters-false-
positive`), `CHAPTER.md`'s topic 43 entry and its scope table, this topic's `reel.tsx`,
`scenes.tsx`, `narration.json`, `pre-notes.md`, `post-notes.md`, `prerequisites.mdx`,
`references.md`, the registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`,
`OUTLINE.md`, and the syllabus line itself.

1. **The construction bug this build hit was real and informative, not cosmetic.** The first
   `examples.py` draft built the "thirty thousand values in fifteen thousand runs" worked example
   by doubling fifteen thousand independently scattered points into pairs; some pairs landed
   adjacent to each other by chance, collapsing two runs into one and producing only 10,864 real
   runs — still correctly choosing a bitmap container, but not reproducing `CHAPTER.md`'s own
   planning-table figure of 60,002 bytes for the run alternative. Fixed with a
   `make_runs_of_two(num_runs, universe)` helper that lays down exactly the requested number of
   evenly spaced, guaranteed-non-touching runs. Re-checked on this pass: `examples.py`'s final
   output matches every one of `CHAPTER.md`'s four worked chunk examples exactly, the universe-
   and chunk-level break-evens exactly, the three real predicates each beating both baselines,
   the brute-force-checked intersection, and the galloping-versus-merge cost comparison at and
   beyond the sixty-four-times threshold. `python3 examples.py` prints "all assertions passed."
2. **The two Lucene source quotes (`RoaringDocIdSet.java`, `IndexedDISI.java`) initially failed
   `sources.mjs check`** because javadoc's `" * "` line-continuation marker is literal source text
   that survives the checker's whitespace normalization — a quote spanning a line wrap must
   include that marker on every wrapped line, the same gotcha class previously hit on a
   `#`-commented config file (recorded in project memory). Fixed for one quote by inserting the
   marker at each wrap point, for the other by restructuring the quote to stay within one
   physical line. Both LevelDB-style C-mangling and GitHub-wiki-403 workarounds from the previous
   topic were not needed here — all nine primary sources fetched clean via `sources.mjs fetch` or
   a direct `curl`, confirmed by `sources.mjs check`'s final run: "22 quote(s) found word for
   word, 0 problem(s)."
3. **A real Lucene path guess 404'd** on the first try for `IndexedDISI.java` (guessed under
   `util/`); the correct path is under `codecs/lucene90/`, found by browsing the Lucene source
   tree directly rather than guessing a second time blind.
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** the two-level
   sixty-five-thousand-five-hundred-and-thirty-six-chunk structure and its three container types;
   the citation; fast AND/OR including galloping; the four named adopters. Each clause is taught
   in a step or a Deep dive section, mapped in `coverage.json` and confirmed by the build's own
   coverage check (which initially flagged the expert list as short — fixed by adding two more
   items before this pass closed, reaching twelve). The nine skipped §13.1/§13.2 topics
   (persistence, rank/select, Elias-Fano, wavelet trees, succinct trees) are each named once, in
   `post-notes.md`'s Frontier section, not built, matching `CHAPTER.md`'s own scope boundary. No
   gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is "Does the
   same container win both?" — reading it as "container choice depends only on value count"
   rather than the precise claim (it depends on the chunk's own *shape*, independent of count);
   the takeaway at step 4 and `post-notes.md`'s Internals section both state this explicitly. A
   second risk: a reader assuming the two Lucene classes *are* the RoaringBitmap library — stated
   explicitly as independently-varied, Roaring-inspired code in the reel's own narration, in
   `FACT-CHECK.md`'s red team, and in `post-notes.md`'s Frontier section, not left implicit.
6. **Engagement check:** step 1 hooks directly on Chapter 12's own handoff (an exact set, where
   Bloom gave an approximate one), not a fresh setup; the first predict is step 3, within the
   first four steps; a second predict at step 6 (the surprising "six bytes, not sixty-five
   thousand" number), a third at step 9; three takeaways (steps 4, 7, 10); step 12 recaps in the
   narrator's own words and names the handoff to integer compression, not a verbatim restatement
   of the three takeaways.
7. **Narration teaches, not reads:** `narration-teaches.mjs` reports zero to fifteen percent
   description-overlap per step, well under the fifty percent flag threshold, no sentence spoken
   verbatim from the description, every predict step has its answer clip, and (after splitting
   four over-length lines with `{ "beat": ... }` markers) no line over the fifty-word cap.
   Narration never says a digit, formula symbol or acronym the way the on-screen captions do,
   generalizing to phrases like "four thousand and ninety six" and "many times."
8. **Digit-check fix (not a content finding):** `check-all.mjs`'s build-time check flagged a bare
   "12" in `reel.tsx`'s leading file comment ("the chapter 12 handoff"), which it scans like any
   other on-screen text even though it's a comment, not a drawn claim. Fixed by rewording the
   comment to "the previous chapter's handoff" rather than adding a spurious assertion to
   `examples.py` for a number that was never actually a claim.

## Looks review (self-review, 2026-10-31)

Reviewed all twelve `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading
the SVG coordinates and opacity timings directly, keeping every label at one to three words from
the start (the lesson learned from earlier topics' real Playwright failures), then confirmed with
the real smoke test (`tests/reels.mjs`) at desktop and phone widths — which passed on the first
run, with zero visual-bug fixes needed (`check-all.mjs --only reels`: "Reel smoke test passed: 1
live reel(s) at desktop and phone sizes."; the separate "Editor test failed" output in the same
run is the pre-existing, topic-independent sandbox limitation documented in project memory, not a
finding about this topic).

- **Colour:** every scene stays inside the chapter's own grammar (crema for a stored value, an
  id, or a bit that is one; latte for secondary labels; taupe for a bit that is zero or an empty
  chunk; caramel for the thing to look at — the chosen container, the deciding threshold, the
  smallest size; cinnamon only for the alternative-being-compared side of a pair; cherryText only
  for the one bad outcome shown, an oversized run in `RunOptimize`). No scene uses more than two
  accent colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`, nothing drawn
  fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.
- **No coordinate bug found** on this topic (no scene's drawn element lands outside what its
  caption describes, checked by hand against each scene's own `box`/`T`/`Bar`/`circle`/`rect`
  coordinates, and confirmed by the passing Playwright run at both widths).

No further findings. `coverage.json` → `gapReview` recorded as empty (no open items).
