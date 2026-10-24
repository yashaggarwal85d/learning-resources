import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Five real calls, a deliberately uneven real delay pattern, one real
// checkpoint while two are still running: a counter only ever counts
// what finished, a histogram built from finished work shares that
// blind spot, and only a gauge, read as a current value, can answer
// whether anything is genuinely backed up right now.
const reel: Reel = {
  steps: [
    {
      title: 'At a real checkpoint, two of five real calls are genuinely still running. Does the counter, read right then, tell you that?',
      body: (
        <>
          Five real calls, three finished, two still running.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, its value says exactly how many are still running' },
          { label: 'No, genuinely; it only ever counts what already finished', correct: true },
          { label: 'Only once the counter stops moving at all' },
        ],
        explain: (
          <>
            No. A counter only counts what finished.
          </>
        ),
      },
      Visual: S.CounterPredict,
    },
    {
      title: 'Measured: at the real checkpoint, the counter reads three, which is genuinely only the number of calls already finished, saying nothing about the two still running',
      body: (
        <>
          The counter, read right at the checkpoint.
        </>
      ),
      duration: 3.0,
      Visual: S.CounterReveal,
    },
    {
      title: 'The histogram, at the same checkpoint, holds only the latencies of calls that already finished. Does it do any better at answering whether anything is backed up right now?',
      body: (
        <>
          The same checkpoint, read from the histogram.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, an empty-looking bucket would show something is stuck' },
          { label: 'No, genuinely; it shares the identical blind spot', correct: true },
          { label: 'Only if the buckets are read in reverse' },
        ],
        explain: (
          <>
            No. It shares the counter's blind spot.
          </>
        ),
      },
      Visual: S.HistogramPredict,
    },
    {
      title: 'Measured: the histogram holds exactly three completed latencies at the checkpoint, the identical count the counter reports, and is genuinely just as blind to the two calls still running',
      body: (
        <>
          The same checkpoint, read from the histogram instead.
        </>
      ),
      duration: 3.0,
      takeaway: 'A counter and a histogram built only from finished work share the identical blind spot toward what has not finished.',
      Visual: S.HistogramReveal,
    },
    {
      title: 'The gauge, at that same real checkpoint, reads the real, current number of calls still in flight. Does it correctly answer whether anything is backed up right now?',
      body: (
        <>
          The same checkpoint, read from the gauge.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a gauge only reflects the past, like the other two' },
          { label: 'Yes, genuinely; it is read as a current value, not a total', correct: true },
          { label: 'Only after every call finishes and it returns to zero' },
        ],
        explain: (
          <>
            Yes. A gauge reads a current value.
          </>
        ),
      },
      Visual: S.GaugePredict,
    },
    {
      title: 'Measured: the gauge reads exactly two at the checkpoint, the real, correct number of calls genuinely still running at that instant, answering the question the counter and the histogram could not',
      body: (
        <>
          The same checkpoint, read from the gauge instead.
        </>
      ),
      duration: 3.0,
      takeaway: 'A gauge answers a right-now question the other two cannot, since only it can go back down.',
      Visual: S.GaugeReveal,
    },
    {
      title: "Prometheus's own documentation states this directly: a counter can only increase; a gauge can arbitrarily go up and down; a histogram counts observations into buckets. Do this topic's own three measured readings model exactly the difference the docs describe?",
      body: (
        <>
          Prometheus's own words on the three shapes.
        </>
      ),
      duration: 2.8,
      takeaway: 'The right metric shape is chosen by the question asked, never swapped in afterward to patch a wrong answer.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: the right shape for the right question',
      body: (
        <>
          A counter only ever counts what has already finished; a histogram, built the same way, shares that identical blind spot; and a gauge, read as a real current value, is the only one of the three that can correctly answer whether anything is genuinely backed up right now.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
