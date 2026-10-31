import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 sessions (examples.py): a task that fails fewer times
// than the configured failure limit is retried until it succeeds and the job completes; the
// identical flaky task run again under a lower limit it can't stay under aborts the job with
// the scheduler's own exact "failed N times; aborting job" message. A fetch failure on the
// reduce side -- caused by deleting a real shuffle data file after the map stage wrote it --
// resubmits the entire parent shuffle-map stage as a second stage attempt rerunning every map
// task, not just the one reduce task that noticed the data was gone.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          One task in a group of four keeps failing. Does the whole job collapse the first
          time, or does Spark give it more chances?
        </>
      ),
      duration: 4.5,
      fig: 'one task keeps failing. Does the job die, or get more tries?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline -- given enough tries, the job finishes',
      body: (
        <>
          Measured: given a high enough number of tries, the one troublesome task eventually
          succeeds and the whole job finishes normally.
        </>
      ),
      duration: 4.8,
      fig: 'enough tries: the flaky task succeeds, the job finishes.',
      Visual: S.RevealBaselineRecovers,
    },
    {
      title: 'Predict: fewer tries than it needs. Does the job still recover?',
      body: (
        <>
          Give that same task far fewer tries than it actually needs to succeed. Does the job
          still pull through, or does it finally give up?
        </>
      ),
      duration: 2.8,
      fig: 'the same task, far fewer tries. Does the job still recover?',
      predict: {
        options: [
          { label: 'It still recovers eventually — Spark keeps trying no matter what' },
          { label: "It gives up once the lower limit is reached", correct: true },
        ],
        explain: (
          <>
            A retry limit is a fixed number of extra chances, not an unlimited one — spend
            them all and the job dies, even on work that would have eventually succeeded.
          </>
        ),
      },
      Visual: S.PredictLowerLimit,
    },
    {
      title: 'Reveal: it gives up -- the job aborts this time',
      body: (
        <>
          Measured: the identical task, the identical failures, but under the lower limit the
          whole job aborts the moment that limit is reached.
        </>
      ),
      duration: 4.8,
      fig: 'same task, same failures: the job aborts once the limit is hit.',
      Visual: S.RevealGivesUp,
    },
    {
      title: 'Elaborate: why -- a retry limit is a fixed number of chances',
      body: (
        <>
          A retry limit only buys a fixed number of extra chances. Spend all of them, and the
          job dies on work that might have eventually come through anyway.
        </>
      ),
      duration: 4.8,
      fig: 'a retry limit is fixed; run out, and the job dies regardless.',
      takeaway: "A retry limit is a fixed number of chances; exceeding it aborts the job even on work that would've succeeded.",
      Visual: S.ElaborateFixedChances,
    },
    {
      title: 'Predict: a finished piece of work goes missing. Just that piece redone?',
      body: (
        <>
          This time, instead of a task failing outright, a piece of already-finished work
          simply goes missing partway through. Does Spark just redo that one missing piece, or
          reach further back?
        </>
      ),
      duration: 2.8,
      fig: 'a finished piece goes missing. Just that piece redone, or more?',
      predict: {
        options: [
          { label: 'Just that one missing piece gets redone' },
          { label: "The entire earlier stage that produced it reruns", correct: true },
        ],
        explain: (
          <>
            Once that earlier output is gone, there's no partial fix — the only way to get it
            back is rerunning everything that produced it in the first place.
          </>
        ),
      },
      Visual: S.PredictLostPiece,
    },
    {
      title: 'Reveal: far more -- the entire earlier stage reruns',
      body: (
        <>
          Measured: far more than the one missing piece. The entire earlier stage that
          produced it gets resubmitted and rerun in full, every task included.
        </>
      ),
      duration: 4.8,
      fig: 'far more than one piece: the whole earlier stage reruns.',
      Visual: S.RevealFarMore,
    },
    {
      title: "Elaborate: why -- there's no partial fix available",
      body: (
        <>
          Once that earlier work is gone, there's no partial patch to apply. The only way
          back is rerunning everything that produced it, not just the one piece that noticed
          it was missing.
        </>
      ),
      duration: 5,
      fig: 'no partial fix exists; the only option is rerunning all of it.',
      takeaway: "A fetch failure resubmits the entire parent stage that produced the lost data, not just the one task that noticed.",
      Visual: S.ElaborateNoPartialFix,
    },
    {
      title: 'Reveal: both failures, side by side',
      body: (
        <>
          Measured together: a task failure bounded by a simple retry count, and a lost piece
          of shuffle output that drags an entire earlier stage back into motion.
        </>
      ),
      duration: 5,
      fig: 'one failure bounded by a retry count; one dragging back a whole stage.',
      Visual: S.RevealSideBySide,
    },
    {
      title: 'Recap',
      body: (
        <>
          A retry limit only buys a fixed number of extra chances, and losing already-finished
          work can cost far more than the one piece that noticed it was gone.
        </>
      ),
      duration: 5,
      fig: 'a retry limit is bounded; a lost piece can cost a whole stage.',
      takeaway: 'Task retry is bounded and cheap; a lost shuffle piece has no partial fix and resubmits an entire stage.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
