# Outline — Event time, watermarks and completeness

1. **Hook: a silent partition freezes everything.** A toy source with one partition that goes
   silent for a while freezes the entire pipeline's watermark; not a crash, just nothing telling
   the watermark generator the silent partition has nothing to say.
2. **Setup: two needles, one axis.** Event time (when it happened) and processing time (when the
   system noticed) drift apart under delay, retries, and backlogs — the shared time-axis figure.
3. **Predict: is a watermark a guarantee?** Would a real system's watermark ever be wrong? (predict)
4. **Reveal: a heuristic claim, generated per partition.** "No more data before T" is almost
   always heuristic, not provable; it's also generated per partition, which is exactly why one
   silent partition can freeze the global minimum.
5. **Predict: does the idle partition's silence fix itself?** Without an explicit timeout, does
   the global watermark ever recover on its own? (predict)
6. **Reveal: idle-source detection unfreezes it.** A timeout-based idle detector excludes a
   silent partition from the minimum, letting the global watermark advance again.
7. **Reveal: watermark alignment bounds the opposite problem.** A fast partition's watermark can
   race ahead and force a downstream operator to buffer enormously; alignment caps how far ahead
   any one partition's watermark can get.
8. **Reveal: the trade-off, measured.** A tighter bound means lower latency but more late/revised
   results; a looser bound means higher latency but more complete results on the first pass —
   measured directly on the synthetic stream this topic generates.
9. **Prove it.** Every figure comes from this topic's own real run: the synthetic stream, the
   idle-source stall and its fix, alignment bounding the drift, and the measured trade-off.
10. **Recap.** Event time vs processing time, watermark as heuristic, idle sources and alignment
    as necessary refinements (not edge cases), and the trade-off itself.

Predict steps: 3 and 5 (first one within the first four steps). Takeaways planned on steps 4, 7,
and 8 (≥3, none on the step immediately after a predict step).
