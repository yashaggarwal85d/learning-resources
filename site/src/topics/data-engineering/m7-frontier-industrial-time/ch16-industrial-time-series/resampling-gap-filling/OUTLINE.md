# Outline

## Scope mapped to steps

1. Hook: the oven dashboard reports 212°F steady through a four-hour outage; the line was fine but held a real 30° excursion the fill hid.
2. Reveal: a reading carries no single truth about "what the sensor was doing" at rest — it needs a declared signal type (continuous / step / counter) to know which aggregate is even legal.
3. Predict: what happens if a mean is taken over machine-state codes.
4. Reveal: the wrong-aggregate bug — averaging state 1 and state 2 gives 1.5, a state that never existed.
5. Reveal: resampling each signal type to the 1-minute grid with its correct aggregate (mean / LOCF / diff-of-last).
6. Reveal: LOCF and linear interpolation across the real outage both independently erase the excursion — a filled value is a claim, and both fills here lie.
7. Reveal: the max-gap rule and the observed/filled/missing flag column — an honest aggregate over a partially filled bucket excludes `missing` points rather than inventing a number.
8. Recap.
9. ProveIt.

## Signal-type declaration

`SIGNAL_TYPE_METADATA` in `examples.py` is the stand-in for the chapter's "declared per-tag property" — in a real system this lives in tag metadata (the historian or the OT contract from topic 6), not inferred from the data at query time, because inferring it is itself unreliable (a step signal with many states can look "continuous" over a short window).

## Gap-filling bug found while building this topic

The first version of the wrong-aggregate example tried to demonstrate the state-mean bug by resampling a forward-filled state series over a 20-minute window straddling a state change (01:40–01:59) — that produced a time-weighted mean of 1.75 (15 minutes at state 2, 5 at state 1), not the clean "1.5" illustration the hook calls for. Fixed by taking the two raw event rows directly (state 2 at 01:40, state 1 at 01:55) rather than resampling first — the simple two-point mean is the clearer demonstration of the bug, and the grid-based forward-fill version is correctly used elsewhere in the file for the real resampling reveal (step 5), not for the wrong-aggregate illustration.

## What this topic leaves out (per CHAPTER.md)

Event-time windows, watermarks and allowed lateness (§9.2, pointed to only); aligning two different series against each other (topic 9, the as-of join); rollups that stay mergeable and retention tiers (topic 10); whether a value itself is valid (topic 15, sensor data quality); forecasting or imputation by a trained model (out of scope entirely — LOCF and linear interpolation are the only two fill methods this topic uses, both non-model).
