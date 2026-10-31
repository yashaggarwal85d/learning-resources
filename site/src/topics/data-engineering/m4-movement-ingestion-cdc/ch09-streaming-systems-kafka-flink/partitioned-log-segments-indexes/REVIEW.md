# Review

## Content review, self-review, 2026-10-30

- **Flow**: hook (naive scan vs sparse-index seek, the numbers from the real run) → setup (a
  partition is files on disk) → predict (segment full) → reveal (segment roll) → reveal (sparse
  index) → predict (index correctness) → reveal (zero-copy) → reveal (offset ownership) → prove it
  → recap. Each reveal's takeaway is picked up by the next step's claim, and the recap's four rows
  map one-to-one onto the four reveals. No dangling thread.
- **Pre-notes / post-notes**: pre-notes assume only general programming (append-only files,
  binary search) per `prerequisites.mdx`; post-notes point forward to the next topic (producer
  writes and acks) per `CHAPTER.md`'s handoff. Consistent with both.
- **Gap-hunt**: the five claims (segment roll trigger, sparse index tradeoff, index-never-wrong,
  zero-copy, offset ownership) are each sourced in `SOURCES.md` and checked in `FACT-CHECK.md`.
  No claim in `reel.tsx` or `narration.json` lacks a corresponding source or `examples.py`
  measurement. No open gap; `coverage.json`'s `gapReview.open` stays `[]`.
- **Expert-reader pass**: a reader who already knows Kafka would not find anything wrong or
  oversimplified to the point of being misleading — the toy log's byte/interval numbers are
  explicitly smaller than Kafka's real defaults (disclosed in `SOURCES.md`/`references.md`), and
  the shape (3 files per segment, sparse index, zero-copy, consumer-owned offset) matches the real
  design.
- **Engagement**: two predict steps (segment-full, index-correctness) both have a plausible wrong
  option that a true novice could believe, per `FACT-CHECK.md`'s red-team section — neither is a
  throwaway distractor.
- **Narration-teaches**: `narration.json`'s ten blocks explain the picture (why a segment rolls,
  why sparse is still correct, why zero-copy saves copies, why an offset is the consumer's own)
  rather than reading the on-screen rows back; verified by `narration-teaches.mjs` during the
  build, green.

No findings. Nothing added to `coverage.json`'s `gapReview.open`.

## Looks review, self-review

Reviewed all 24 screenshots in `site/test-results/` for `partitioned-log-segments-indexes`: every
step (01–10) at desktop and phone width, plus the predict-answer-shown (`-q`) frames for steps 03
and 06.

Judged against DESIGN.md's looks-review checks:
- **The point visible at a glance**: each figure panel's two rows state the one comparison that
  step is making (396 vs. 4 scanned; four copies vs. one; offset rewound, partition unchanged) —
  legible without reading the body text.
- **Every step moving and landing on a teaching final frame**: each reveal step's rows fade in
  with `easeOut(seg(...))`, landing on the full row pair.
- **Nothing crowded, clipped, or small**: no overlap at either size, including the two predict
  steps' three-option layout and the "Prove it"/"Recap" four-row panels, which use smaller row
  gaps but stayed clear at both widths.
- **Colour only where it means something**: `C.focus` marks the one row per step that is the
  answer/result (the sparse count, the one-copy path, the unchanged partition state, etc.); the
  predict steps' red/white answer-option boxes follow the shared kit convention, not a one-off.
- **Caption matching the picture**: each `Svg label=` describes exactly the two rows shown.

No findings. No fixes were needed, so the reel test was not re-run for this pass (it already
passed clean after the earlier Row-text-length fixes).
