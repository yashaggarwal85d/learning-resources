import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed resampling/gap-fill computation (examples.py): a continuous,
// a step and a counter signal resampled to a common grid with the right
// aggregate each, a wrong-aggregate illustration, and an honest max-gap fill
// flag. No numbers are repeated on screen beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a steady line through a four-hour outage',
      body: (
        <>
          The oven dashboard shows a flat line through a four-hour network outage. The
          sensor was down the whole time. The flat line is the last known reading,
          carried forward, not a fourth hour of real measurements.
        </>
      ),
      duration: 5.4,
      fig: "an oven dashboard shows a flat line through a four-hour network outage — the sensor was down the whole time, and the flat line is the last known reading carried forward",
      Visual: S.Hook,
    },
    {
      title: "Reveal: a signal needs a declared type before it has an aggregate",
      body: (
        <>
          A continuous reading, a machine-state code and an energy counter are not the
          same kind of number. Averaging, carrying forward and summing a difference are
          each right for exactly one of the three.
        </>
      ),
      duration: 5.2,
      fig: "a continuous reading, a machine-state code and an energy counter are three different kinds of number, each needing a different aggregate",
      Visual: S.RevealSignalType,
    },
    {
      title: 'Predict: averaging two machine states',
      body: (
        <>
          One bucket holds a state-1 reading and a state-2 reading. Averaged the way a
          temperature would be, what does the bucket report?
        </>
      ),
      duration: 4.4,
      fig: "a bucket holds a state-1 reading and a state-2 reading — averaged like a temperature, what does the bucket report?",
      predict: {
        options: [
          { label: 'The more frequent of the two states' },
          {
            label: 'A number, 1.5, that is not a valid state at all',
            correct: true,
          },
        ],
        explain: (
          <>
            1.5. A machine state is a code, not a quantity — there is no state between 1
            and 2, so the mean of the two is meaningless.
          </>
        ),
      },
      Visual: S.PredictStateMean,
    },
    {
      title: 'Reveal: the wrong aggregate',
      body: (
        <>
          State 1 and state 2 land in the same bucket. The mean comes back 1.5. No
          machine was ever in state 1.5 — the aggregate itself was never valid for this
          kind of signal.
        </>
      ),
      duration: 5.0,
      fig: "state 1 and state 2 land in the same bucket; their mean is 1.5, a state no machine was ever in",
      Visual: S.RevealWrongAggregate,
    },
    {
      title: 'Reveal: the right aggregate for each type',
      body: (
        <>
          A continuous reading resamples to a mean. A state code carries the last value
          forward. A counter resamples to the difference between the bucket's end
          values, never a mean of the running total itself.
        </>
      ),
      duration: 5.4,
      fig: "a continuous reading resamples to a mean, a state code carries forward its last value, a counter resamples to the difference of its end values",
      takeaway: "A continuous signal, a state code, and a running total each need a different aggregate, not one mean.",
      Visual: S.RevealRightAggregate,
    },
    {
      title: 'Reveal: two fills, one hidden excursion',
      body: (
        <>
          A real 30-degree excursion happens during the outage. Carrying the last value
          forward hides it completely. A straight interpolation across the outage hides
          it too, in the opposite direction, for the opposite reason.
        </>
      ),
      duration: 5.6,
      fig: "a real 30-degree excursion happens during the outage; carrying the last value forward and interpolating across the gap both independently hide it",
      takeaway: "A filled value is only a claim about what the sensor would have said, not a measurement.",
      Visual: S.RevealTwoFillsLie,
    },
    {
      title: 'Reveal: the max-gap rule and the fill flag',
      body: (
        <>
          A fill only runs up to a stated maximum gap; past it, the bucket is marked
          missing, not filled. Every bucket carries a flag: observed, filled, or
          missing, so an aggregate can say which it used.
        </>
      ),
      duration: 5.4,
      fig: "a fill only runs up to a stated maximum gap; past it, the bucket is marked missing, not filled, and every bucket carries an observed/filled/missing flag",
      takeaway: "Marking a value observed, filled, or missing turns an invisible assumption into a fact a reader doesn't have to guess.",
      Visual: S.RevealMaxGapFlag,
    },
    {
      title: 'Recap',
      body: (
        <>
          A signal's type decides its aggregate, not the other way around. Averaging a
          state code produces a state that never existed. A filled value is a claim,
          bounded by a max-gap rule and marked by a flag.
        </>
      ),
      duration: 5.4,
      fig: 'a signal type decides its aggregate, averaging a state code is meaningless, and a filled value is a bounded, flagged claim',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard's line has never once shown a gap, for any sensor, in a year of
          operation. Is that evidence the sensors never went offline?
        </>
      ),
      duration: 4.2,
      fig: "a dashboard's line has never once shown a gap, for any sensor, in a year — is that evidence the sensors never went offline?",
      predict: {
        options: [
          { label: 'Yes — a perfect line means perfect uptime' },
          {
            label: 'No — it means every gap was already filled before it reached the chart',
            correct: true,
          },
        ],
        explain: (
          <>
            No. Sensors and networks fail; a line with no visible gaps in a year is
            evidence of an unflagged fill, not evidence of flawless hardware.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
