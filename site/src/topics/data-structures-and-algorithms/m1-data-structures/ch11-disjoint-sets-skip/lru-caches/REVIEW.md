# REVIEW: LRU caches (`dsa.lru-caches`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and reel step titles (`dsa.skip-lists`),
this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `pre-notes.md`, `post-notes.md`,
`prerequisites.mdx`, `references.md`, the registry entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, `OUTLINE.md`, `CHAPTER.md`'s topic 40 entry and topic 41's opening line, and the
syllabus line itself.

1. **The scan-effect measurement had two real problems, both found and fixed before any number
   reached a file.** (see `FACT-CHECK.md`'s red team #1–2) A missing `put()` call on a CLOCK miss
   pinned one result at exactly zero; a full-cooldown measurement window washed out the scan's
   effect entirely even after that fix. Re-checked on this pass: the final `probe_hit_rate`
   function and its four call sites match what `post-notes.md`'s Internals section and the reel's
   step 9 claim, numerically, to four decimal places.
2. **No public cache trace is replayed.** `CHAPTER.md` allows naming one without replaying it when
   none reachable by this sandbox is freely available; checked again on this pass that
   `post-notes.md`'s Lab section says this plainly rather than implying otherwise, and that no
   reel step claims a public trace was used.
3. **CLOCK's measured closeness to exact LRU (within three ten-thousandths) is workload-specific.**
   Checked that neither `reel.tsx` nor `post-notes.md` states this as a general property of CLOCK
   — both anchor it to "measured... on the same replay" / "on this workload."
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** hash map + doubly
   linked list for O(1) get/put; CLOCK as the lock-friendly approximation; Redis's sampled
   approximate LRU (pointed to Data Engineering §5.5, not rebuilt). Each clause is taught in a
   step or a Deep dive section, mapped in `coverage.json` and confirmed by the build's own
   coverage check. The online-paging theory pointer (Chapter 34) and the admission/FIFO-based
   eviction family (skipped topic) are both named once in `post-notes.md`'s Frontier section, not
   built — matching `CHAPTER.md`'s own scope boundary. No gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is "a hit is
   cheap under CLOCK, so CLOCK is strictly better than exact LRU" — the reel and post-notes both
   state the actual trade (approximate order, not free order), and `post-notes.md`'s Internals
   section explicitly frames the closeness of CLOCK's miss ratio as a measured fact about this
   workload, not a universal guarantee.
6. **Engagement check:** step 1 hooks on a concrete, universal problem (a full cache) before any
   mechanism; the first predict is step 3, within the first four steps; a second predict at step
   6, a third at step 8; three takeaways (steps 4, 7, 9), none on the step immediately after a
   predict (steps 4, 7 and 9 each follow a non-predict reveal step, not a predict step directly —
   checked against `tests/reels.mjs`'s "from" step rule); step 10 recaps in the narrator's own
   words and points directly at the next topic's subject, not a restatement of the three
   takeaways verbatim.
7. **Narration teaches, not reads:** narration generalizes every product name ("a widely used
   in-memory database" rather than Redis, "a mainstream language's standard library" rather than
   CPython or Java) and never uses the notation "O(1)" or any digit, matching the house
   convention; `narration-teaches.mjs` (run as part of the standard check sequence) reports zero
   to ten percent overlap per step, well under the fifty percent flag threshold.

## Looks review (self-review, 2026-10-31)

Reviewed all ten `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading the
SVG coordinates and opacity timings directly, then confirmed with the real Playwright smoke test
(`tests/reels.mjs`) at desktop and phone widths — which caught three real bugs on the first run,
fixed before this review pass closed:

- `TwoStructures` (step 2): two header captions at the same y-coordinate but different x
  overlapped once font scaled up on phone. Fixed by splitting each into a short title plus a
  short subtitle, stacked vertically, with the list's header moved further right.
- `Recap` (step 10): three label/value pairs, each a long single line, ran outside the drawing on
  phone and overlapped each other on desktop. Fixed by splitting each into two short lines (a
  one-word label, a short trade-off phrase) instead of one long caption per column.
- `ClockReveal` (step 7): the reference-bit digits inside each circle rendered at nine pixels on
  phone, under the thirteen-unit minimum `kit.tsx` recommends. Fixed by raising their font size
  from eleven to thirteen units.

Re-ran `tests/reels.mjs` after all three fixes: "Reel smoke test passed: 1 live reel(s) at desktop
and phone sizes."

- **Colour:** every scene stays inside the chapter's grammar (crema for an entry, latte for
  secondary labels, caramel for the thing to look at — the entry just hit, the hand on the clock,
  the victim leaving — cinnamon only for the alternative being compared, cherry/cherryText only
  for the scan's bad outcome in `ScanPredict`). No scene uses more than two accent colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`, nothing drawn
  fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.

No further findings. `coverage.json` → `gapReview` recorded below.
