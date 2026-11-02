# Outline

## Scope mapped to steps

1. Hook: a furnace reads one exact value for hours, and every dashboard calls it stable.
2. Reveal: a windowed variance check catches the frozen reading no spike or range rule would.
3. Reveal: a range check and a spike-robust detector catch two other fault shapes on the same fleet.
4. Predict: does deleting a flagged point ever lose something a post-mortem needs?
5. Reveal: a firmware update shifts the whole signal's level, caught as a change point, not a spike.
6. Reveal: a replayed batch dedupes by its own key; a backfill and a clock fault are told apart by comparing two timestamps.
7. Reveal: every flagged point gets a quality flag and a seat in quarantine, and the original series never shrinks.
8. Reveal: measured precision, recall, and the per-point cost of running every check, at the plant's own write rate.
9. Recap.
10. ProveIt (second predict: does the furnace's frozen reading get caught by a spike rule or a range rule?).

## Why a windowed variance check, not a spike or range rule, catches the hook

CHAPTER.md's own scope distinguishes a flatline from a legitimately constant signal; this topic's
`detect_flatline` flags a trailing window whose variance is effectively zero. The hook's furnace
passes both a spike check (no sudden jump) and a range check (842 is a plausible furnace
temperature) — only a variance-over-a-window check notices that a reading that should move isn't
moving at all. `examples.py` plants exactly this fault on one synthetic sensor and confirms the
flatline detector catches it while the spike and range detectors, run on the same sensor, do not.

## What's measured vs. what's a simplification

Four fault types are planted on four separate synthetic sensors (flatline, isolated spikes,
below-absolute-zero out-of-range, a firmware-style scale change), with sixteen healthy sensors in
the same fleet to measure false positives against. Precision and recall are computed over the three
point-rule fault types (flatline, spike, range); the firmware scale change is a level shift, checked
separately by its own change-point assertion, since a change-point detector answers "did the level
move" rather than "is this one point wrong." CHAPTER.md also asks that a flatline be distinguished
from a legitimately constant signal (a held setpoint) using the signal's own expected-variation
metadata (topic 8); this topic's synthetic fleet has no legitimately-constant sensor to demonstrate
that distinction against, so it is discussed in `FACT-CHECK.md`'s red-team rather than measured.

## The registry gap (eighth of this chapter, same handling each time)

CHAPTER.md's `uses` line names `dq-gates-vs-posthoc-scans` and `dq-check-cost-incremental-metrics-sampling`
(Chapter 13 topic 12). Verified by grep before writing this file: neither id exists anywhere in
`registry.ts` — that Chapter 13 topic hasn't shipped under those ids. This topic omits both from its
own `uses` list rather than claiming a topic that hasn't shipped — the same pattern as topics 6, 10,
11, 12 and 14's seven prior gaps.

## What this topic leaves out (per CHAPTER.md)

Streaming anomaly detection on the process itself (EWMA, seasonal baselines: Chapter 15 topic 25)
and SPC rules (topic 3); the OPC UA status-code mechanism in depth (topic 16); validation frameworks
in general (Chapter 13 topic 12); imputation (topic 8); machine-learned fault detection.
