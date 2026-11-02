# REVIEW: Bounded MPMC ring queues (`dsa.bounded-mpmc-ring-queues`)

## Pass 1 — Content

- Research: 20/20 quotes verified word for word by `sources.mjs check`. One real environment
  limitation found and documented, not worked around by fabrication: `web.archive.org` is
  unreachable from this sandbox (confirmed via both the fetch tool and a direct `curl`), so the
  live and Wayback-mirrored Vyukov page `CHAPTER.md` expected to use is unavailable. Verified the
  algorithm instead via two independent, license-attributed vendored copies of his own code
  (spdlog, Rust's old `libsync`) plus crossbeam's own attribution — a different but not weaker
  form of verification — and explicitly did not quote Vyukov's own classification prose or his
  benchmark figure, since neither could be checked against a live source this session.
- `examples.py`: every assertion passes. The capacity-four trace matches `CHAPTER.md`'s own
  planning description exactly; the stalled-producer history (ten thousand straight empty
  dequeues) and both linearizability verdicts (the completed-then-empty history has no legal
  order, the overlapping version does) match the planned outcomes with no surprises.
- `examples.c`: a real, compiled pthread benchmark (false sharing padded vs. unpadded; Vyukov's
  queue vs. a mutex-protected ring at one/two/four/eight threads each side), run via
  `examples.sh`, machine/compiler/flags recorded in `OUTLINE.md`. The false-sharing result is the
  clean, expected direction (padded about five times faster). The queue-throughput result is
  **not** the "expected" shape — Vyukov's queue loses ground to the mutex as thread count rises
  on this specific, oversubscribed four-core machine — and this topic reports that honestly
  rather than re-running until it matched intuition, naming the plausible mechanism (busy-spin
  vs. a parking mutex) without overclaiming it as the explanation.
- Gap hunt against the syllabus and `CHAPTER.md`: no gap found. Michael-Scott queues are named,
  not built, per the skipped-topic rule. The Disruptor's own throughput claims are not repeated,
  per `CHAPTER.md`'s own instruction, since they were not re-read with hardware named this
  session.
- `FACT-CHECK.md`'s red-team section covers the `web.archive.org` unreachability, the
  counter-intuitive throughput result, the queue's own placement on the progress ladder (derived
  from the previous topic's definitions, not a new source), and the Disruptor-claims omission.

## Pass 2 — Looks

- `scenes.tsx`: twelve `Visual` functions, labels kept to one to three words, and every
  near-identical adjacent pair of small elements (the two "cell" boxes in `Hook`,
  `StalledHandoffPredict` and `EmptyNotMessage`; the four cells in `RingAndCounters`) spaced with
  an eighty-unit center-to-center gap against a forty-four-unit box width — a thirty-six-unit
  visible gap, matching the lesson from the previous two chapters' Playwright failures, not the
  eight-unit gap that failed there. Every label font size is thirteen units or above (the
  previous topic's "9.0px tall" failure came from an eleven-unit size at phone scale).
- Colour grammar: `crema` for an ordinary cell or thread, `taupe` for a stalled or claimed-but-
  unpublished one, `caramel` for the thing to look at, `cinnamon` for the Disruptor's own design
  beside Vyukov's, `cherry`/`cherryText` for the bad outcome — consistent with `CHAPTER.md`'s own
  visual idea for this chapter.
- No digit appears anywhere in `reel.tsx`'s on-screen text as a literal character (every count is
  spelled in words: "ten thousand," "four," "eight"), so the digit-check has nothing to flag;
  every `duration:` line is exempt by the check's own rule.
- Two Playwright findings on the first run, both fixed: `RecoversOnItsOwnPredict`'s "claimed" box
  and "still stalled" label sat close enough to run into each other at both desktop and phone
  width (fixed by widening the gap between them well past the thirty-six-unit minimum learned
  last chapter); and step 3's own takeaway squeezed the phone Visual pane enough to shift the
  caption and fail the swipe test from that step (the known gotcha: a takeaway on the first
  non-predict step right after hook-and-predict can do this) — fixed by moving that takeaway to
  step 4 instead, which carries the identical sentence with no swipe-test step riding on it.
