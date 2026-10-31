# REVIEW: Scan-resistant policies: LFU, 2Q, ARC, LIRS (`dsa.scan-resistant-policies-lfu`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and reel step titles (`dsa.lru-caches`),
this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `pre-notes.md`, `post-notes.md`,
`prerequisites.mdx`, `references.md`, the registry entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, `OUTLINE.md`, `CHAPTER.md`'s topic 41 entry and topic 42's opening line (Bloom
filters), and the syllabus line itself.

1. **The ARC implementation's first draft had a real bug, caught on its own hand trace, not by
   the automated checks.** An ad-hoc eviction rule created a ghost entry on a cold miss in a
   situation the paper's own four-case pseudocode handles differently (evicting directly from T1
   with no ghost at all, when T1 is already exactly at the cache's own size with zero prior
   adaptation). Fixed by implementing the paper's published branching exactly. Re-checked on this
   pass: the final `_replace`/`access` methods and the hand trace's assertions match the paper's
   own Case I–IV structure as described in `SOURCES.md`'s quotes and `FACT-CHECK.md`'s red team.
2. **LIRS's claims are explicitly caveated as secondary-sourced**, not independently verified
   against the original paper. Checked on this pass that this caveat appears in all three places
   it should (`SOURCES.md`, `FACT-CHECK.md`, `post-notes.md`), not buried in only one.
3. **The coverage.json `at.step` values initially didn't match `reel.tsx`'s actual titles word
   for word** (one step was referenced as "2Q's own scan resistance, measured" when the reel's
   real title is "2Q, measured against the same scan") — caught by the build's own coverage check,
   not by this review; fixed before this pass closed. Re-checked every other `at.step` reference
   against the final `reel.tsx` titles by hand on this pass; all match.
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** why plain LRU is
   flushed by one large scan; frequency counting and decay; ghost lists and adaptive partitioning
   in ARC; reuse distance in LIRS. Each clause is taught in a step or a Deep dive section, mapped
   in `coverage.json` and confirmed by the build's own coverage check. The online-paging theory
   pointer (Chapter 34) and admission/FIFO-based eviction (skipped topic, SIEVE's own abstract
   quoted for its numbers) are both named once in `post-notes.md`'s Frontier section, not built —
   matching `CHAPTER.md`'s own scope boundary. No gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is "2Q's measured
   scan-resistance on this trace (essentially no drop) is stronger than the paper's own quoted
   number (about seventy percent retained)" — `FACT-CHECK.md`'s red team #4 and `post-notes.md`'s
   Internals section both explicitly say these are two different traces measuring two different
   things, not a reproduction of the paper's own experiment.
6. **Engagement check:** step 1 hooks directly on the previous topic's own measured failure, not
   a fresh setup; the first predict is step 3, within the first four steps; a second predict at
   step 6, a third at step 8; three takeaways (steps 4, 7, 9); step 12 recaps in the narrator's
   own words and points directly at the next topic's subject (ghost lists as a membership
   question → Bloom filters), not a restatement of the three takeaways verbatim.
7. **Narration teaches, not reads:** narration never names a specific product (Redis, PostgreSQL)
   the way the captions and body text do, generalizing to "one real system" / "a loop" instead,
   and never uses a digit or the acronym names (LFU, 2Q, ARC, LIRS) the way the on-screen titles
   do; `narration-teaches.mjs` reports zero to eight percent overlap per step, well under the
   fifty percent flag threshold, with no predict step missing its answer clip.

## Looks review (self-review, 2026-10-31)

Reviewed all twelve `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading
the SVG coordinates and opacity timings directly, keeping every label at one to three words
following the lesson learned from the previous three topics' real Playwright failures, then
confirmed with the real smoke test (`tests/reels.mjs`) at desktop and phone widths — which passed
on the first run this time, with no fixes needed.

- **Colour:** every scene stays inside the chapter's grammar (crema for a resident entry, latte
  for secondary labels, taupe for a ghost entry or an untouched one, caramel for the thing to
  look at — the entry just hit, the target size that just grew, the low-reuse-distance set —
  cinnamon only for the alternative being compared, cherry/cherryText only for the scan's bad
  outcome, reused from the previous topic's own grammar). No scene uses more than two accent
  colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`, nothing drawn
  fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.
- **No coordinate bug found** on this topic (no scene's drawn element lands outside what its
  caption describes, checked by hand against each scene's own `box`/`T`/`Bar` coordinates).

No further findings. `coverage.json` → `gapReview` recorded below.
