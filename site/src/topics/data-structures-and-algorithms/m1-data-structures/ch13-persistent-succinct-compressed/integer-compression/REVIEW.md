# REVIEW: Integer compression (`dsa.integer-compression`)

No independent reviewer ran this session (the make-topic skill's own rule: no subagents, no
model switching). Both passes below are self-review: re-reading the files cold against the
checklist, not from memory of having written them.

## Content review (self-review, 2026-11-01)

Re-read in order: the previous topic's registry entry and handoff (`dsa.compressed-bitmaps-
roaring`), `CHAPTER.md`'s topic 44 entry and its scope table, this topic's `reel.tsx`,
`scenes.tsx`, `narration.json`, `pre-notes.md`, `post-notes.md`, `prerequisites.mdx`,
`references.md`, the registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`,
`OUTLINE.md`, and the syllabus line itself.

1. **The outlier-distribution fix was a real finding, not cosmetic.** The first draft of
   `examples.py`'s own posting list drew every gap from a single plain exponential distribution,
   following `CHAPTER.md`'s planning description literally. Patching then barely moved the
   needle (14.95 → 14.93 bits/id), far too small a difference to teach the chapter's own claim
   that "one outlier forces the whole block to a wide width." Diagnosed by comparing the measured
   exception rate (near zero) against the block-width distribution, which showed almost no block
   ever needed a wide width in the first place. Fixed by adding a one-percent fraction of gaps
   drawn from a much wider exponential, exactly the "clustered gap distribution with outliers"
   `CHAPTER.md`'s own scope line asks for. Re-checked on this pass: frame of reference now costs
   16.93 bits/id (genuinely more than plain varint's 15.97, on this list), and patching recovers
   most of that back down to 15.21 — a real, legible result.
2. **Decode speed is never timed in Python and reported as if it meant something on real
   hardware**, per `CHAPTER.md`'s own explicit instruction. `examples.py` instead counts
   data-dependent branches per integer — a model, named as a model in the file's own docstring
   and in `post-notes.md`'s Internals section — and every actual speed figure in the reel,
   narration and post-notes (Stream VByte's four billion integers per second, SIMD-BP128's
   "nearly twice as fast") is attributed to its own paper's own named hardware, never to anything
   measured in this build.
3. **The GOV2-collection decimal bits-per-integer table in Lemire & Boytsov 2015** (the specific
   figures `CHAPTER.md`'s own planning prose mentions: binary packing around 5.5, SIMD-BP128
   around 6.3, OptPFD around 4.5) survived this topic's PDF-text fetch as numbers, but their
   row/column alignment with each scheme's own name did not — verified by reading the raw
   extracted text directly, not assumed. Rather than risk misattributing a specific decimal to
   the wrong scheme, this topic quotes the paper's qualitative claims (each verified word for
   word) and names the dataset without repeating the table's own figures, documented explicitly
   in `OUTLINE.md`'s "Changes from the chapter plan" and `FACT-CHECK.md`'s red team.
4. **Gap hunt against the syllabus line and `CHAPTER.md`'s scope bullets:** varint/LEB128
   including the zigzag mapping; frame of reference; PFOR; SIMD bit-packing; Stream VByte;
   decode speed versus ratio for posting lists and columnar pages; the cross-domain pointer to
   Data Engineering and Rust Systems Engineering. Each clause is taught in a step or a Deep dive
   section, mapped in `coverage.json` and confirmed by the build's own coverage check. No gap
   found.
5. **Expert-reader pass:** the one place a careless viewer could over-generalize is step 10's own
   "frame of reference costs more than varint here" result — read as a universal ranking of the
   two schemes rather than this one list's own outlier-driven measurement. The takeaway at step
   10, `post-notes.md`'s Internals section, and `FACT-CHECK.md`'s red team all state this
   explicitly: on a list without outliers, frame of reference would come out smaller instead. A
   second risk: reading "patching" as free — `post-notes.md`'s Production section states the
   actual trade (exceptions cost more, per value, than a block value would; patching only wins
   when outliers stay rare).
6. **Engagement check:** step 1 hooks directly on topic 43's own array container (a plain sorted
   list), not a fresh setup; the first predict is step 3, within the first four steps; a second
   predict at step 6 (the "one outlier widens the whole block" surprise), a third at step 9
   (Stream VByte's own reorganization); three takeaways (steps 4, 7, 10); step 12 recaps in the
   narrator's own words and names the handoff to progress guarantees and linearizability, not a
   verbatim restatement of the three takeaways.
7. **Narration teaches, not reads:** `narration-teaches.mjs` reports zero to six percent
   description-overlap per step, well under the fifty percent flag threshold, no sentence spoken
   verbatim from the description, every predict step has its answer clip, and no line over the
   fifty-word cap on the first check. Narration never says a digit, formula symbol or acronym the
   way the on-screen captions do, generalizing to phrases like "just under two" and "a hundred and
   twenty eight."

## Looks review (self-review, 2026-11-01)

Reviewed all twelve `scenes.tsx` visuals against `DESIGN.md`'s "looks review checks," keeping
every label to one to three words from the start, then confirmed with the real smoke test
(`tests/reels.mjs`) at desktop and phone widths.

- **Two real coordinate bugs found and fixed, not cosmetic.** The first Playwright run flagged
  step 2 (`VarintMechanism`)'s two adjacent "byte" boxes overlapping at desktop and phone width —
  the original `byte()` helper's fixed 34-unit-wide box was too narrow for a 7-letter label
  ("payload") in the first version of this scene, and even after shortening the label to "byte,"
  the two boxes' 8-unit gap was still too tight at phone width. Fixed in two steps: the `byte()`
  helper now takes an optional width parameter (used to widen the one box in step 8,
  `GroupedControl`, that needs a longer label, "ctrl"), and the two boxes in step 2 were moved
  further apart (a 36-unit gap instead of 8). Re-ran and the smoke test passed cleanly at both
  widths.
- **Colour:** every scene stays inside the chapter's own grammar (crema for a stored value or
  payload byte; latte for secondary labels; taupe reserved for a continuation flag or an empty
  slot, drawn as the flag dot rather than a separate colour fill; caramel for the thing to look
  at — the chosen width, the control byte, the measured bar; cinnamon only for the grouped-code
  comparison row; cherryText only for the one bad outcome drawn, an outlier widening a block).
- **Every step moves:** each `Visual` is driven by `t` through `seg`/`easeOut`, nothing drawn
  fully formed from frame zero.
- **Final frame teaches on its own:** checked each scene's state at `p = 1` against its caption;
  each one's end state matches what the caption claims.

`check-all.mjs --only reels`: "Reel smoke test passed: 1 live reel(s) at desktop and phone
sizes."; the separate "Editor test failed" output in the same run is the pre-existing,
topic-independent sandbox limitation documented in project memory, not a finding about this
topic.

No further findings. `coverage.json` → `gapReview` recorded as empty (no open items).
