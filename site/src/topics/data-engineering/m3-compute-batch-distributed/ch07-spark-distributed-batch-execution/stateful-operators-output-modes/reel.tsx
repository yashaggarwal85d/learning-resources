import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real local Structured Streaming queries (examples.py): complete output mode
// is rejected on a stream-stream join at query-start time, with a real AnalysisException; the
// same join with no watermark is accepted but its buffered state grows without bound, batch
// after batch; given a watermark on both sides plus a time-range join condition, the identical
// join's buffered state plateaus instead.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The watermark bounds how long state waits. This topic is what that state actually is,
          and the three ways Spark will let it out.
        </>
      ),
      duration: 4.5,
      fig: 'a watermark bounds the wait. This topic is what gets held, and how.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: three output modes, side by side',
      body: (
        <>
          Append writes only new rows. Update writes only rows that changed. Complete writes the
          whole result table, every single trigger.
        </>
      ),
      duration: 5,
      fig: 'append: new rows. update: changed rows. complete: the whole table.',
      Visual: S.RevealThreeModes,
    },
    {
      title: 'Predict: complete mode, on a stream-stream join. Accepted?',
      body: (
        <>
          A stream-stream join is asked to run in complete mode. Does Spark accept it, or
          refuse it outright?
        </>
      ),
      duration: 2.8,
      fig: 'a join, asked for complete mode. Accepted, or refused?',
      predict: {
        options: [
          { label: "Refused — a join's own output can't be revised later", correct: true },
          { label: 'Accepted — complete just means writing everything each time' },
        ],
        explain: (
          <>
            Complete mode has to rewrite past output. A join's rows, once emitted, are never
            revised -- so the two can't coexist.
          </>
        ),
      },
      Visual: S.PredictCompleteOnJoin,
    },
    {
      title: 'Reveal: rejected, before the query even starts',
      body: (
        <>
          Measured: refused immediately, with a real analysis error naming the mode and the
          join -- not a failure that shows up once data starts arriving.
        </>
      ),
      duration: 4.8,
      fig: 'refused immediately, before a single row of data moves.',
      Visual: S.RevealRejected,
    },
    {
      title: 'Elaborate: why joins only support append',
      body: (
        <>
          A join's own output rows can never be revised once emitted. Complete and update both
          require revising past output -- only append leaves nothing to take back.
        </>
      ),
      duration: 5,
      fig: "a join's rows are never revised -- so only append fits.",
      takeaway: 'A query that can never revise its own past output is the only kind complete and update have to refuse.',
      Visual: S.ElaborateWhyJoinsAppendOnly,
    },
    {
      title: 'Predict: the same join, with no watermark at all. Accepted?',
      body: (
        <>
          The identical stream-stream join, but with no watermark defined on either side. Does
          Spark accept this one, or refuse it too?
        </>
      ),
      duration: 2.8,
      fig: 'the same join, no watermark anywhere. Accepted, or refused?',
      predict: {
        options: [
          { label: "Accepted — watermarks aren't required to run a join" },
          { label: 'Refused — a join needs a watermark to run at all' },
        ],
        explain: (
          <>
            Accepted and running. What a missing watermark costs isn't rejection -- it's a
            buffer with no safe point to ever shrink.
          </>
        ),
      },
      Visual: S.PredictNoWatermarkJoin,
    },
    {
      title: "Reveal: accepted -- but the buffered state only grows",
      body: (
        <>
          Measured: accepted, and running fine. But its buffered join state climbs every single
          batch, with nothing ever dropped from either side.
        </>
      ),
      duration: 4.8,
      fig: 'accepted and running. State size only climbs, batch after batch.',
      Visual: S.RevealAcceptedButGrowing,
    },
    {
      title: 'Elaborate: a join buffers both sides as state',
      body: (
        <>
          A join keeps every row from both sides as state, waiting for a future match. Without
          a watermark, neither side ever reaches a point where a row is safe to drop.
        </>
      ),
      duration: 5,
      fig: 'both sides buffered, waiting -- with no safe point to drop either.',
      takeaway: 'Rejection and unbounded growth are different failures: Spark only blocks the first, and happily runs the second forever.',
      Visual: S.ElaborateBothSidesBuffer,
    },
    {
      title: 'Reveal: watermark plus time range -- the growth stops',
      body: (
        <>
          Measured: add a watermark to both sides and a time-range join condition, and the
          buffered state climbs briefly, then holds in a steady plateau.
        </>
      ),
      duration: 5,
      fig: 'watermark plus time range: state climbs briefly, then plateaus.',
      Visual: S.RevealBoundedPlateau,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three modes decide what gets emitted, and a query's own shape decides which modes it's
          allowed. A watermark decides something else entirely: what gets kept at all.
        </>
      ),
      duration: 5,
      fig: 'three modes decide output. A watermark decides what state survives.',
      takeaway: "The output mode decides what a query is allowed to say; the watermark decides what it's still allowed to remember.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
