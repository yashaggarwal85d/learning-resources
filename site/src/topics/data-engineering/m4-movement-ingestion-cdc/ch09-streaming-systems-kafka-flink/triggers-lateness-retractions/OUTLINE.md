# Outline — Triggers, allowed lateness and retractions

1. **Hook: a dashboard that silently lies about its own total.** A downstream dashboard sums
   every value a window emits, assuming accumulating mode, while the upstream job is actually
   configured for discarding mode — its running total silently multiplies far beyond the truth,
   caught only when compared against a measured ground truth.
2. **Setup: a window has a shape. Now it has to say something.** The prior topic fixed what a
   window is. This topic is when it actually speaks — early, on time, or as a correction — and
   what it says each time.
3. **Reveal: the same window, three different moments to speak.** A window can fire early
   (a speculative, incomplete answer before the watermark passes), on time (right as the
   watermark passes its end), or late (a correction once a late record arrives within an
   allowed-lateness window) — each a real, different emitted total on the same window.
4. **Predict: once the allowed-lateness window closes, what happens to a later record?** A window
   configured with allowed lateness keeps accepting corrections for exactly that long. What
   happens to a record that shows up after that period ends? (predict)
5. **Reveal: dropped, not queued, not retried.** Once allowed lateness expires, the pane's state
   is gone — a later record is simply dropped, a deliberate, bounded trade-off between
   correctness and unbounded state retention.
6. **Predict: does a downstream sum-of-sums always get the right answer?** A downstream consumer
   just adds up every value a window emits, regardless of mode. Does that work for every
   accumulation mode, or only some? (predict)
7. **Reveal: discarding and accumulating report completely different things.** Discarding reports
   only the delta since the last firing — a sum-of-sums naturally gets it right. Accumulating
   reports the full running total each time — the same naive sum double- and triple-counts it.
8. **Reveal: a retraction is how accumulating gets fixed.** Accumulating-and-retracting emits an
   explicit negative-valued retraction of its previous value before the new one — applying every
   value, including the retractions, a naive downstream sum gets the right answer again.
9. **Prove it.** Every number comes from this topic's own real run: the three firings for one
   window, the exact moment a late record starts being dropped, and the three accumulation modes
   measured against the same ground truth.
10. **Recap.** Early, on time, or late — a window can say the same thing three different ways.
    Allowed lateness is a bounded trade-off, not a bug. And accumulation mode is not a detail — a
    downstream consumer that doesn't know which one it's receiving will get the wrong answer.

Predict steps: 4 and 6 (first one within the first four steps). Takeaways planned on steps 5, 7,
and 8 (≥3).
