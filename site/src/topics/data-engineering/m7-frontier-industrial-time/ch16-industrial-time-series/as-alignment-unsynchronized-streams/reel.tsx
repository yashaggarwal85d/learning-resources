import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed as-of join (examples.py): pandas merge_asof and DuckDB's
// ASOF JOIN run on the same dense-pressure/sparse-temperature data and
// checked row for row, plus a tolerance sweep and a step-vs-interpolated
// comparison on a known ramp. No numbers are repeated on screen beyond what
// that file computes.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a root-cause query that finds almost nothing",
      body: (
        <>
          "What was the oven temperature when the thickness went out of limits?" On
          equal timestamps, the join returns nothing for nearly every row. With no
          tolerance at all, it returns a value — one of them nearly an hour old.
        </>
      ),
      duration: 5.6,
      fig: "a root-cause query joined on equal timestamps returns almost nothing; joined with no tolerance it returns a value for every row, one of them nearly an hour old",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the as-of join, applied to telemetry',
      body: (
        <>
          For each dense pressure reading, take the last temperature reading at or
          before it. The same join this course used earlier for business facts, now
          matching two sensors instead.
        </>
      ),
      duration: 5.0,
      fig: "for each dense pressure reading, the as-of join takes the last temperature reading at or before it — the same join mechanism, now matching two sensors",
      Visual: S.RevealAsofJoin,
    },
    {
      title: 'Predict: can a tolerance below the clock offset help?',
      body: (
        <>
          The two sensors' clocks disagree by a known amount. Set the match tolerance
          tighter than that disagreement. Does the join get more accurate?
        </>
      ),
      duration: 4.6,
      fig: "the two sensors' clocks disagree by a known offset — setting the tolerance tighter than that offset, does the join get more accurate?",
      predict: {
        options: [
          { label: 'Yes — a tighter tolerance always means a more precise match' },
          {
            label: 'No — it only throws away matches that were already correct',
            correct: true,
          },
        ],
        explain: (
          <>
            No. Below the clock offset, every excluded match was already within the
            true, correct range — tightening further manufactures nothing.
          </>
        ),
      },
      Visual: S.PredictTolerance,
    },
    {
      title: 'Reveal: below the offset, nothing helps',
      body: (
        <>
          A tolerance set under the clock offset excludes at least as many matches as
          one set at the offset itself. Nothing is gained, and real matches are lost.
        </>
      ),
      duration: 5.0,
      fig: "a tolerance set under the clock offset excludes at least as many matches as one set at the offset — nothing gained, real matches lost",
      Visual: S.RevealBelowOffset,
    },
    {
      title: 'Reveal: the null rate against tolerance',
      body: (
        <>
          DuckDB and pandas, run on the same data, agree on every joined row. As
          tolerance shrinks past the signal's own report period, the null rate climbs
          from zero.
        </>
      ),
      duration: 5.4,
      fig: "DuckDB and pandas agree on every joined row; as tolerance shrinks past the signal's own report period, the null rate climbs from zero",
      takeaway: "Two engines agreeing on every joined row is stronger evidence than either engine's output checked alone.",
      Visual: S.RevealNullRate,
    },
    {
      title: "Reveal: a step vs. an interpolated value, and its cost",
      body: (
        <>
          On a known ramp, the backward match holds a flat, stale value. Interpolating
          between the sample before and the sample after recovers the true value — but
          only by looking ahead of the left row's own time.
        </>
      ),
      duration: 5.6,
      fig: "on a known ramp, a backward match holds a flat stale value while interpolating between the sample before and after recovers the true value, at the cost of looking ahead",
      takeaway: "Accuracy bought by looking past the left row's own time is the same look-ahead a leaking feature makes.",
      Visual: S.RevealStepVsInterpolated,
    },
    {
      title: "Reveal: the partition key, and what happens without it",
      body: (
        <>
          Without matching within each piece of equipment first, one equipment's
          pressure reading can quietly borrow another's nearest temperature value — no
          error, just a wrong answer.
        </>
      ),
      duration: 5.2,
      fig: "without a per-equipment partition key, one equipment's pressure reading can quietly borrow another equipment's nearest temperature value",
      takeaway: "A missing partition key doesn't fail loudly — it returns a plausible row borrowed from the wrong equipment.",
      Visual: S.RevealPartitionKey,
    },
    {
      title: 'Recap',
      body: (
        <>
          An as-of join takes the last value at or before. A tolerance below the clock
          offset helps nothing. Interpolation trades accuracy for a look-ahead cost. A
          partition key is a correctness requirement, not an optimization.
        </>
      ),
      duration: 5.6,
      fig: 'an as-of join takes the last value at or before, a too-tight tolerance helps nothing, interpolation costs a look-ahead, and a partition key is required for correctness',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A different pipeline's as-of join has no tolerance and no partition key, and
          it has never once returned a null. Is that a sign the join is working well?
        </>
      ),
      duration: 4.4,
      fig: "a pipeline's as-of join has no tolerance and no partition key and has never once returned a null — is that a sign the join is working well?",
      predict: {
        options: [
          { label: 'Yes — no nulls means every row found a real match' },
          {
            label: 'No — it means stale and cross-equipment matches are being accepted silently',
            correct: true,
          },
        ],
        explain: (
          <>
            No. With no tolerance, nothing is ever too old to match; with no partition
            key, nothing is ever matched to the wrong equipment and rejected for it —
            zero nulls is exactly what that combination guarantees.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
