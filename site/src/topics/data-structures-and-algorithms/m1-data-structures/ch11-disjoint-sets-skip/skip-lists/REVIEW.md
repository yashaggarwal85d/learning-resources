# REVIEW: Skip lists (`dsa.skip-lists`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and reel step titles (`dsa.union-find`),
this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `pre-notes.md`, `post-notes.md`,
`prerequisites.mdx`, `references.md`, the registry entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, `OUTLINE.md`, `CHAPTER.md`'s topic 39 entry and topic 40's opening line, and the
syllabus line itself.

1. **The sixteen-key picture in `CHAPTER.md`'s plan vs. this topic's own key set.** (minor, no
   change) `CHAPTER.md` asks for "the keys of Chapter 5's memtable picture"; this topic uses its
   own seeded eight-column staging instead (`OUTLINE.md`'s "Changes from the chapter plan" records
   why: the claims being illustrated don't depend on which keys are shown). Judged acceptable on
   re-read — no viewer-facing claim depends on key identity.
2. **`Compression` — wait, that scene belongs to `dsa.union-find`, not this topic.** Checked this
   topic's own `scenes.tsx` for the equivalent risk (a scene whose drawn coordinates don't match
   its caption): walked every one of the eleven scenes' coordinates by hand. `ProveIt`'s `Prev`
   path uses a cubic Bezier purely for visual direction (no claim about its exact shape), and
   every other scene's node/link coordinates were checked against the `BASE_X`/`HEIGHTS` arrays
   they're built from. No coordinate bug found (contrast with topic 38, where one was found and
   fixed at this exact review step).
3. **Step 6 (the search-cost predict) and step 7 (the bound reveal) both land near "twenty".**
   (minor, no change) Deliberate, matching the chapter's own established pattern from topic 38:
   the predict commits the learner to a guess before the reveal gives the precise measured number.
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** every clause (geometric
   tower heights; expected O(log n) search; simple ordered iteration; why they are easy to make
   concurrent; the memtable in LevelDB/RocksDB and Redis sorted sets, with the Chapter 14 pointer)
   is taught in a step or a Deep dive section, mapped in `coverage.json` and confirmed by the
   build's own coverage check. No gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is "only the
   skiplist memtable supports concurrent insert" — `FACT-CHECK.md` already caught and corrected
   this during research (red team #1); the reel itself says "the default, skiplist-based
   memtable," not "only," so the correction reached the shipped text.
6. **Engagement check:** step 1 hooks on a real, named production constraint (a lock-free reader
   against a write buffer); the first predict is step 3, within the first four steps; a surprising
   number lands at step 7 (under thirty steps on a twenty-thousand-key list, and the "worse"
   p = 1/4 beating p = 1/2's bound); four takeaways (steps 4, 7, 8, 9); step 10 recaps in the
   professor's own words, not a replay of the takeaways; step 11 closes on a real implementation
   detail (`Prev()`), not a restatement.
7. **Narration teaches, not reads:** narration generalizes every system name ("a well known
   storage engine", "a well known in-memory database") rather than naming LevelDB/RocksDB/Redis
   the way the captions do, specifically to avoid the kind of verbatim overlap the automated check
   flags; `narration-teaches.mjs` (run as part of the standard check sequence) reports the actual
   overlap percentage per step.

## Looks review (self-review, 2026-10-31)

Reviewed the eleven `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading
the SVG coordinates and opacity timings directly (no rendered screenshots in this session, since
the reel smoke test — run separately — already confirms no clipped, overlapping or under-sized
text at desktop and phone widths).

- **Colour:** every scene stays inside the chapter's grammar (crema for an element, latte for
  secondary labels, caramel for the thing to look at, cinnamon only for the alternative being
  compared — p = 1/4 against p = 1/2, kept to the same two scenes it's introduced in — cherry and
  cherryText only for the rotation's "several pointers together" bad outcome in `Hook`). No scene
  uses more than two accent colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`/`easeInOut`,
  nothing drawn fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.
- **No coordinate bug found** on this topic (see content-review finding 2 above for the specific
  check performed).

No further findings. `coverage.json` → `gapReview` recorded below.
