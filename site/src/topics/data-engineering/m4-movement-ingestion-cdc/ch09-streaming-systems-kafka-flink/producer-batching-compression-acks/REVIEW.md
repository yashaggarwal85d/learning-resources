# Review

## Content review, self-review, 2026-10-30

- **Flow**: hook (twice the requests for "lowest latency") → setup (the accumulator) → predict
  (batch close) → reveal (the race's real numbers) → reveal (compression per batch) → predict
  (sticky vs round-robin) → reveal (sticky fill numbers) → reveal (acks and the crash sim) →
  prove it → recap. Each reveal's takeaway is picked up by the next step, and the recap's four
  rows map one-to-one onto the four reveals. No dangling thread.
- **Pre-notes / post-notes**: pre-notes assume topic 1's partition/segment/offset vocabulary
  (per `prerequisites.mdx`, linking topic 1 as "before this"); post-notes point forward to topic
  3 (replication/ISR), matching `CHAPTER.md`'s handoff.
- **Gap-hunt**: all eight claims in `OUTLINE.md`'s claims list are sourced in `SOURCES.md` and
  checked in `FACT-CHECK.md`. No claim in `reel.tsx` or `narration.json` lacks a corresponding
  source or `examples.py` measurement. `coverage.json`'s `gapReview.open` stays `[]`.
- **Expert-reader pass**: a reader who already knows Kafka would not find anything misleading —
  the toy's single-in-flight-request simplification and record-count-instead-of-bytes batch cap
  are both disclosed (`examples.py`'s docstring, `FACT-CHECK.md`, `references.md`), and the
  qualitative claims (fewer/larger batches, batch-level compression, sticky fill, acks risk) all
  match Kafka's real documented behavior.
- **Engagement**: two predict steps (batch-close, sticky-vs-round-robin), both with a plausible
  wrong option per `FACT-CHECK.md`'s red-team section.
- **Narration-teaches**: `narration.json`'s ten blocks explain the reasoning (why a wait reduces
  request count, why a lone record barely compresses, why sticking fills bigger batches, why
  leader-only acknowledgement can lie) rather than reading the on-screen rows back; narration
  avoids every raw config name and symbol (`linger.ms`, `acks=1`, `KIP-480`), replacing each with
  a spoken equivalent, verified with a script before the build's own check ran it again.

No findings. Nothing added to `coverage.json`'s `gapReview.open`.

## Looks review, self-review

Reviewed all 24 screenshots in `site/test-results/` for `producer-batching-compression-acks`:
every step (01–10) at desktop and phone width, plus the predict-answer-shown (`-q`) frames for
steps 03 and 06.

**One finding, fixed:** step 6's predict title ("Predict: sticking to one partition instead of
round-robin — bigger batches, or smaller?") wrapped to enough lines at desktop width that it
pushed up into the top navigation bar, overlapping the domain-switcher pills. Shortened the
title to "Predict: sticking to one partition — bigger batches, or smaller?" (the dropped clause
stays in the step's body text) in `reel.tsx`, updated the two matching `step` references in
`coverage.json`, rebuilt, and re-ran the reel test and the looks pass on the changed step —
clean at both sizes afterward (`desktop-producer-batching-compression-acks-06.png` confirmed).

**One non-finding, noted:** the step-01 header's "DE §9.1 · 01/10" position counter rendered as
scrambled characters (e.g. "0K6C5") in one screenshot capture at both desktop and phone width,
while every other step's counter (02/10 through 10/10) rendered correctly. This is the shared
step-counter widget, not anything in this topic's own `reel.tsx`/`scenes.tsx`; the automated
reel test (which checks the finished, settled state of each step, not a mid-animation frame)
passed clean on the same build, and topic 1's equivalent step-01 screenshot showed no such
artifact, so this reads as a one-off animation-timing flake in the screenshot capture rather
than a real rendering defect in this topic's own files. Not fixed here (no topic-file change
would address a shared-component animation-timing artifact); flagging for the owner rather than
guessing at the shared counter component's code.

Judged the remaining screenshots against DESIGN.md's looks-review checks (the point visible at a
glance, every step landing on a teaching final frame, nothing crowded or clipped, colour only
where it means something, caption matching the picture) — all clean after the one fix above.
