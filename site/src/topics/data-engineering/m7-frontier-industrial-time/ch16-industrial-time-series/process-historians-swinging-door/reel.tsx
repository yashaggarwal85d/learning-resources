import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Exception (deadband) filtering, then Bristol's own swinging-door
// compression (his own patented method: an anchor, two slope-bounding doors,
// a knee recorded exactly when the doors can no longer stay parallel), with
// the error-band guarantee measured; a plain average over recorded knees
// shown to disagree with a true time-weighted average; step interpolation
// shown necessary for a step-shaped series (examples.py).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a historian's own mean comes out degrees off the plant's",
      body: (
        <>
          A year of a temperature tag, extracted and averaged. The result is
          several degrees off the plant's own reported average. Nothing in
          the archive is actually broken.
        </>
      ),
      duration: 5.8,
      fig: "a year of a temperature tag, extracted and averaged, comes out several degrees off the plant's own reported average — nothing in the archive is actually broken",
      Visual: S.Hook,
    },
    {
      title: 'Predict: what would have given the right mean?',
      body: (
        <>
          The historian kept only the points needed to reconstruct the
          curve within a stated error band. What would have given the right
          mean, and what should the extraction have recorded?
        </>
      ),
      duration: 5.6,
      fig: 'the historian kept only the points needed to reconstruct the curve within a stated error band — what would have given the right mean, and what should the extraction have recorded?',
      predict: {
        options: [
          { label: 'A larger sample of the same stored points' },
          {
            label: 'A time-weighted average, and a flag marking which points were interpolated',
            correct: true,
          },
        ],
        explain: (
          <>
            A time-weighted average, computed over time rather than over
            rows, plus the compression deviation and an interpolated flag
            carried forward with every extracted value.
          </>
        ),
      },
      Visual: S.PredictMean,
    },
    {
      title: 'Reveal: exception filtering drops points before the archive sees them',
      body: (
        <>
          A simple deadband, applied at the interface, passes a value only
          once it moves past a stated threshold. Nearly every point in a
          flat stretch never reaches the archive.
        </>
      ),
      duration: 5.8,
      fig: 'a simple deadband applied at the interface passes a value only once it moves past a stated threshold, so nearly every point in a flat stretch never reaches the archive',
      Visual: S.RevealException,
    },
    {
      title: 'Reveal: swinging-door compression keeps only the knees',
      body: (
        <>
          Two doors pivot on the last stored point, swinging open as values
          arrive. A knee is recorded the moment the doors can no longer
          stay parallel.
        </>
      ),
      duration: 5.8,
      fig: 'two doors pivot on the last stored point, swinging open as values arrive, and a knee is recorded the moment the doors can no longer stay parallel',
      Visual: S.RevealSwingingDoor,
    },
    {
      title: 'Reveal: the error band holds, measured against the original signal',
      body: (
        <>
          Every stored knee stays within the stated compression deviation
          of the line it approximates, and the point count falls by more
          than 80%.
        </>
      ),
      duration: 5.8,
      fig: 'every stored knee stays within the stated compression deviation of the line it approximates, and the point count falls by more than 80%',
      Visual: S.RevealErrorBand,
    },
    {
      title: 'Reveal: a flat hold and a short excursion compress very differently',
      body: (
        <>
          A long quiet hold collapses to almost nothing. A short, volatile
          stretch forces many knees. A plain average over the stored knees
          weighs them equally anyway.
        </>
      ),
      duration: 5.8,
      fig: 'a long quiet hold collapses to almost nothing while a short volatile stretch forces many knees, and a plain average over the stored knees weighs them equally anyway',
      takeaway: 'Counting every stored point equally treats a brief excursion as if it lasted as long as the hold around it.',
      Visual: S.RevealBias,
    },
    {
      title: "Reveal: a time-weighted average gets it right",
      body: (
        <>
          Weighting by time instead of by row, or interpolating a value at
          every original timestamp, tracks the true average far more
          closely than the plain knee average does.
        </>
      ),
      duration: 5.8,
      fig: 'weighting by time instead of by row, or interpolating a value at every original timestamp, tracks the true average far more closely than the plain knee average does',
      takeaway: 'A mean over stored rows and a mean over time are different calculations that happen to share a name.',
      Visual: S.RevealTimeWeighted,
    },
    {
      title: 'Reveal: a step series needs step interpolation, not a line',
      body: (
        <>
          Drawing a straight line between two knees across a genuine step
          badly misreads the value just before it moves. Holding the last
          recorded value reads it exactly.
        </>
      ),
      duration: 5.8,
      fig: 'drawing a straight line between two knees across a genuine step badly misreads the value just before it moves, while holding the last recorded value reads it exactly',
      Visual: S.RevealStep,
    },
    {
      title: 'Recap',
      body: (
        <>
          Exception filtering before compression, swinging-door knees
          within a stated error band, a plain knee average that misleads,
          a time-weighted fix, and step series that need step
          interpolation.
        </>
      ),
      duration: 6.0,
      fig: 'exception filtering before compression, swinging-door knees within a stated error band, a plain knee average that misleads, a time-weighted fix, and step series that need step interpolation',
      takeaway: 'A compressed archive is never wrong about what it kept — only a calculation forgetting what kind those were.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          An extraction carries only values, no flag and no compression
          deviation. Can a later analyst tell a recorded point from an
          interpolated one?
        </>
      ),
      duration: 5.2,
      fig: 'an extraction carries only values, no flag and no compression deviation — can a later analyst tell a recorded point from an interpolated one?',
      predict: {
        options: [
          { label: "Yes — an interpolated value always looks smoother than a recorded one" },
          {
            label: 'No — without the flag, a recorded point and an interpolated one are indistinguishable',
            correct: true,
          },
        ],
        explain: (
          <>
            No. Once the metadata is dropped, every value in the row looks
            the same. The flag and the deviation are the only things that
            ever told you which points were real.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
