import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Leaving a backpressure point implicit does not avoid the decision; it
// genuinely defaults to an unbounded queue, measurably different from a
// real, explicit, bounded one under the identical real overload.
const reel: Reel = {
  steps: [
    {
      title: 'A real burst of eight requests, arriving faster than one worker can finish them, hits a real service whose own backpressure point was stated on purpose, capacity two. Does its real queue length stay capped?',
      body: (
        <>
          Eight requests, one stated boundary.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, it grows to fit whatever the burst sends' },
          { label: 'Yes, genuinely; it stays capped and sheds the rest', correct: true },
          { label: 'Only if the requests arrive more slowly' },
        ],
        explain: (
          <>
            Yes. The stated capacity caps it.
          </>
        ),
      },
      Visual: S.BoundedPredict,
    },
    {
      title: 'Measured: of the eight real requests, three are genuinely admitted and five genuinely rejected, and the real queue length at the checkpoint stays at exactly two',
      body: (
        <>
          The stated boundary, checked against all eight.
        </>
      ),
      duration: 3.0,
      Visual: S.BoundedReveal,
    },
    {
      title: 'The identical real burst of eight requests hits a second, independent service that never states its own backpressure point at all. Does leaving that real decision implicit change what actually happens?',
      body: (
        <>
          The same burst, no stated boundary this time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, an unstated default behaves the same way' },
          { label: 'Yes, genuinely; the queue keeps growing instead of shedding', correct: true },
          { label: 'Only once the burst is much larger' },
        ],
        explain: (
          <>
            Yes. Nothing was shed at all.
          </>
        ),
      },
      Visual: S.UnboundedPredict,
    },
    {
      title: 'Measured: all eight real requests are genuinely admitted, none rejected, and the real queue length at the identical checkpoint has grown to seven',
      body: (
        <>
          The same checkpoint, nothing shed this time.
        </>
      ),
      duration: 3.0,
      takeaway: 'Leaving a backpressure point implicit does not avoid the decision, it genuinely defaults to an unbounded queue instead.',
      Visual: S.UnboundedReveal,
    },
    {
      title: 'Side by side, under the identical real overload, which real design actually protects the service behind it?',
      body: (
        <>
          Two real designs, one identical burst.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The one that never rejects anyone' },
          { label: 'The one that sheds load at a boundary it chose', correct: true },
          { label: 'Both protect it equally well' },
        ],
        explain: (
          <>
            The one that chose to shed load.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: 'Measured: the identical eight-request burst leaves one real queue capped at two and the other genuinely climbing to seven, side by side',
      body: (
        <>
          Two real queues, measured at once.
        </>
      ),
      duration: 3.0,
      takeaway: 'An implicit decision is still a real decision, just one answered by a library default instead of a real choice.',
      Visual: S.CompareReveal,
    },
    {
      title: "The tokio::sync::mpsc documentation states this directly: a bounded channel communicates with backpressure, an unbounded one communicates without it. Does this topic's own measured comparison match exactly what both of the module's own functions describe?",
      body: (
        <>
          mpsc's own words on both variants.
        </>
      ),
      duration: 2.8,
      takeaway: "The worksheet's own backpressure question is never optional, only ever answered explicitly or answered by default.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a question nobody actually answered',
      body: (
        <>
          A design that states its own backpressure point sheds load at a real boundary it chose; a design that leaves it unstated still gets a real answer, just not one anybody actually chose; together, that is why the worksheet's own nine questions get checked before writing code, not after.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
