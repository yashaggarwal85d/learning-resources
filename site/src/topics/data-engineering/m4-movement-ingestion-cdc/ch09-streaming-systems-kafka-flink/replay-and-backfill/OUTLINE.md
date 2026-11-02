# Outline — Replay and backfill

1. **Hook: a bug found two weeks later.** A derived metric is wrong, found past the hot log's
   retention but within tiered storage's total retention; replaying the affected week to a
   versioned output (not overwriting) lets the two be diffed before the fix is trusted.
2. **Setup: resetting offsets by timestamp.** A dead-lettered record gets fixed one at a time;
   sometimes the whole pipeline was wrong for a while and the fix is a time-scoped replay instead.
   `offsetsForTimes` jumps a consumer to "the first offset at or after time T."
3. **Predict: scope the replay.** Replay the whole topic from the beginning, or scope it to one
   partition or a bounded time range? (predict)
4. **Reveal: scoped, not whole-topic.** A replay can be scoped to a single partition or a time
   range, touching only what was actually wrong.
5. **Reveal: where the data actually comes from.** If the range is aged out of the hot log but
   within tiered storage's total retention, it's still in Kafka; otherwise it must be
   reconstructed from the lakehouse instead.
6. **Predict: overwrite or version the output?** A buggy replay's output overwrites the original
   metric in place. What's lost? (predict)
7. **Reveal: the original is gone.** Overwriting in place destroys the one thing needed to tell
   whether the replay fixed the bug or made it worse: the original value to diff against.
8. **Reveal: versioned output, and suppressed side effects.** Writing to a new, separately
   labeled version keeps both; a flag on each replayed record suppresses any external side
   effect (an email, a webhook) it would otherwise trigger a second time.
9. **Prove it.** Every figure comes from this topic's own real run: offset-for-times lookup,
   scoped replay, backfill source selection by data age, and the overwrite-vs-versioned diff.
10. **Recap.** Reset by timestamp, scope the replay, pick hot log vs tiered storage vs lakehouse
    by age, and keep the replay itself from becoming a second incident.

Predict steps: 3 and 6 (first one within the first four steps). Takeaways planned on steps 5, 7,
and 8 (≥3, none on the step immediately after a predict step — step 4 and step 7 are each one
step removed from their predicts' reveal, not directly adjacent to the predict itself).
