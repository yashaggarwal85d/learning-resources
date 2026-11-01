import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against a real local Structured Streaming query (examples.py): a hand-computed
// watermark -- the maximum event time seen so far, minus the delay threshold, lagging one
// trigger behind -- matches Spark's own reported watermark at every batch; a late event is
// dropped only once the watermark has advanced past the *end* of the window it would fall
// into, not merely past the event's own timestamp, while the identical lateness one trigger
// earlier is still correctly counted.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Micro-batch execution says a plan reruns on a schedule. This topic is the bound that
          keeps that plan's own state from growing forever.
        </>
      ),
      duration: 4.5,
      fig: "a schedule says when it reruns. This bounds what it's allowed to keep.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the watermark, computed by hand',
      body: (
        <>
          Measured: the maximum event time seen so far, minus the delay threshold -- and it
          lags exactly one trigger behind, matching Spark's own number every time.
        </>
      ),
      duration: 4.8,
      fig: 'max event time minus delay, lagging one trigger, matches exactly.',
      Visual: S.RevealWatermarkByHand,
    },
    {
      title: 'Predict: an event arrives late, inside the delay. Counted?',
      body: (
        <>
          An event arrives late, but still inside the delay threshold. Does it get counted, or
          dropped on arrival?
        </>
      ),
      duration: 2.8,
      fig: 'late, but inside the delay window. Counted, or dropped?',
      predict: {
        options: [
          { label: 'Counted — it arrived before the delay ran out', correct: true },
          { label: 'Dropped — anything late gets ignored on principle' },
        ],
        explain: (
          <>
            Lateness by itself isn't the test. What matters is whether the window that event
            belongs to has already had its state cleared.
          </>
        ),
      },
      Visual: S.PredictLateCounted,
    },
    {
      title: "Reveal: counted -- its window hasn't been evicted yet",
      body: (
        <>
          Measured: counted, correctly, into its own window. Late relative to the newest event,
          but that window's state is still alive.
        </>
      ),
      duration: 4.8,
      fig: "counted. Late, but the window holding it is still alive.",
      Visual: S.RevealCounted,
    },
    {
      title: "Elaborate: lateness alone isn't the test",
      body: (
        <>
          Lateness by itself decides nothing. What decides is whether the window that event
          belongs to still has live state -- or has already been cleared out.
        </>
      ),
      duration: 5,
      fig: "not how late an event is -- whether its window is still alive.",
      takeaway: "A late event is judged by whether its own window's state is still alive, not by how late it is.",
      Visual: S.ElaborateNotLatenessAlone,
    },
    {
      title: 'Predict: same lateness, one trigger later. Counted this time?',
      body: (
        <>
          The identical lateness arrives again, one trigger later, after the watermark has
          moved past that window's own end. Counted this time, or not?
        </>
      ),
      duration: 2.8,
      fig: 'same lateness, one trigger later, past the window end. Counted?',
      predict: {
        options: [
          { label: 'Still counted — the lateness itself hasn\'t changed' },
          { label: "Dropped — that window's state is gone now", correct: true },
        ],
        explain: (
          <>
            Nothing about the event changed. What changed is the watermark crossing that
            window's own end, clearing its state for good.
          </>
        ),
      },
      Visual: S.PredictSameLatenessLater,
    },
    {
      title: 'Reveal: dropped -- never counted, anywhere',
      body: (
        <>
          Measured: dropped entirely. Not in this window, not in any other -- the identical
          lateness as before, but its window's state is already gone.
        </>
      ),
      duration: 4.8,
      fig: 'dropped. Same lateness, but the window is already gone.',
      Visual: S.RevealDropped,
    },
    {
      title: 'Elaborate: a window dies exactly when the watermark passes its end',
      body: (
        <>
          A window's state dies the instant the watermark passes that window's own end -- not
          a moment before, and no later chance is given after.
        </>
      ),
      duration: 5,
      fig: "a window's state ends exactly when the watermark passes it.",
      takeaway: "A window's state is cleared exactly when the watermark passes that window's own end, with no partial grace period.",
      Visual: S.ElaborateStateDies,
    },
    {
      title: 'Reveal: global watermark across multiple inputs',
      body: (
        <>
          With multiple input streams, the engine takes the minimum of their watermarks by
          default, so the slowest stream sets the pace -- configurable to the maximum instead,
          at the cost of dropping the slower stream's own late data.
        </>
      ),
      duration: 5,
      fig: 'multiple inputs: minimum by default, maximum by choice -- never both free.',
      Visual: S.RevealGlobalWatermark,
    },
    {
      title: 'Recap',
      body: (
        <>
          A watermark is the maximum event time seen, minus a delay. What it actually bounds
          is a window's own state, cleared exactly when the watermark passes that window's end.
        </>
      ),
      duration: 5,
      fig: 'a watermark bounds a window by its end, not by raw lateness.',
      takeaway: "The watermark trades unbounded state for a hard cost: real late data, past the delay, the query will never count.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
