# REVIEW: Bloom filters and false-positive math (`dsa.bloom-filters-false-positive`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-10-31)

Re-read in order: the previous topic's registry entry and reel step titles (`dsa.scan-resistant-
policies-lfu`), this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `pre-notes.md`,
`post-notes.md`, `prerequisites.mdx`, `references.md`, the registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `CHAPTER.md`'s topic 42 entry and its scope table,
and the syllabus line itself.

1. **The own-code bug this build hit was real and informative, not cosmetic.** The first
   `examples.py` draft simulated k hash functions with Python's built-in `hash()`, salted by a
   small integer, and measured a false-positive rate two to three times the formula's prediction
   at every bits-per-key value — not because the derivation was wrong, but because the simulated
   hash functions weren't independent enough. Diagnosed by manually checking fill fraction
   (correct, ~0.503) against measured false-positive rate (far too high), which isolated the bug
   to probe correlation rather than the formula. Fixed by switching every hash to SHA-256
   (truncated), after which every measured number matched its formula value within sampling
   noise. Re-checked on this pass: `examples.py`'s final numbers match CHAPTER.md's planning
   table at every row (8/10/12/16/20 bits-per-key rates, the flat valley at 10 bits/key, the
   0.503 fill fraction, the 1.44 bound ratio to nine decimal places, the derived-vs-independent
   agreement, the found deletion failure, and the 9.9-bits/key reconciliation with topic 28).
2. **The LevelDB C-source mangling bug (project memory
   `learning-resources-sources-mjs-c-header-mangling`) hit again**, confirmed via a direct
   `curl` fetch alongside the earlier `WebFetch` confirmation — both agree on the clean source.
   `sources.mjs check`'s own fetch path would re-trigger the same mangling bug on every
   un-cached check run, so the clean content was pre-seeded into `sources.mjs`'s expected cache
   file path (computed from the URL's slug+hash) rather than relying on its own fetch. Documented
   in `SOURCES.md` so a future re-check that clears the `sources/` cache knows why.
3. **The RocksDB wiki page returns HTTP 403 to both `sources.mjs`'s own fetch and a direct
   `curl`** from this sandbox (GitHub wiki pages apparently block this environment's user agent
   or IP range specifically, unlike `raw.githubusercontent.com`). Read instead via `WebFetch`,
   and the quotes that tool returned were pre-seeded into the expected cache file the same way as
   LevelDB's source, with the HTTP-403 fact and the fetch method recorded in `SOURCES.md`.
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** the structure and its
   two operations; the rate formula and its two named approximations; the optimum and the flat
   valley; the 1.44 space bound; the two-hash probe trick; no deletes; the cross-domain pointer to
   Data Engineering §5.6. Each clause is taught in a step or a Deep dive section, mapped in
   `coverage.json` and confirmed by the build's own coverage check (which initially flagged the
   "→ Data Engineering §5.6." fragment as uncovered — fixed by adding that clause, pointed at
   `post-notes.md`'s Frontier section, before this pass closed). The four skipped structures
   (blocked/partitioned Bloom, cuckoo, quotient, xor/binary-fuse/ribbon) are each named once in
   post-notes, not built, matching `CHAPTER.md`'s own scope boundary. No gap found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is the "not ten
   thousand times" step — reading it as "memory for a filter barely grows with rarity" rather
   than the precise claim (a small, additive number of extra bits per key, not a multiplicative
   blow-up); the takeaway at step 7 and `post-notes.md`'s Internals section both state the
   additive-vs-multiplicative distinction explicitly, not left for the viewer to infer.
6. **Engagement check:** step 1 hooks directly on Chapter 5's own prior use of the structure, not
   a fresh setup; the first predict is step 3, within the first four steps; a second predict at
   step 6 (the surprising "not ten thousand times" number), a third at step 8; three takeaways
   (steps 4, 7, 9); step 12 recaps in the narrator's own words and points directly at the next
   topic's subject (compressed bitmaps), not a restatement of the three takeaways verbatim.
7. **Narration teaches, not reads:** `narration-teaches.mjs` reports zero to eighteen percent
   description-overlap per step, well under the fifty percent flag threshold, no sentence of
   eight or more words spoken verbatim from the description, no predict step missing its answer
   clip, and (after one fix) no line over the fifty-word cap. Narration never says a digit,
   formula symbol or acronym the way the on-screen captions do, generalizing to phrases like "one
   in a hundred" and "far fewer."

## Looks review (self-review, 2026-10-31)

Reviewed all twelve `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks" by reading
the SVG coordinates and opacity timings directly, keeping every label at one to three words from
the start (the lesson learned from three earlier topics' real Playwright failures), then
confirmed with the real smoke test (`tests/reels.mjs`) at desktop and phone widths — which passed
on the first run, with zero visual-bug fixes needed (`check-all.mjs --only reels`: "Reel smoke
test passed: 1 live reel(s) at desktop and phone sizes."; the separate "Editor test failed"
output in the same run is the pre-existing, topic-independent sandbox limitation documented in
project memory, not a finding about this topic).

- **Colour:** every scene stays inside the chapter's own grammar (crema for a stored bit set to
  one and for a key; latte for secondary labels; taupe for a bit that is zero; caramel for the
  thing to look at — the probes, the deciding bit, the measured bar; cinnamon only for the
  formula/independent-hash comparison side of a pair; cherry/cherryText only for the deletion
  failure's bad outcome). No scene uses more than two accent colours.
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`, nothing drawn
  fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.
- **No coordinate bug found** on this topic (no scene's drawn element lands outside what its
  caption describes, checked by hand against each scene's own `box`/`bit`/`Bar`/`T` coordinates,
  and confirmed by the passing Playwright run at both widths).

No further findings. `coverage.json` → `gapReview` recorded below.
