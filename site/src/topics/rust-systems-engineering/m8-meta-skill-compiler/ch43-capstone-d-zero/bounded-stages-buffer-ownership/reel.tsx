import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A bounded pipeline that moves each batch forward keeps its own
// memory capped under a slow sink; an unbounded, cloning pipeline
// does not, however identically slow that sink stays underneath it.
const reel: Reel = {
  steps: [
    {
      title: 'A real, bounded pipeline connects its stages with channels that hold only four batches at a time, moving each batch forward rather than copying it, against a sink that is deliberately twenty times slower than the producer feeding it. Does its own real memory keep growing while the producer runs ahead, or does it stay capped?',
      body: (
        <>
          A bounded pipeline, a deliberately slow sink.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It keeps growing for as long as the producer outruns the sink' },
          { label: 'It stays capped near the channel own real capacity', correct: true },
          { label: 'It grows only until the producer finishes, then shrinks' },
        ],
        explain: (
          <>
            It stays capped, however far ahead the producer gets.
          </>
        ),
      },
      Visual: S.BoundedPredict,
    },
    {
      title: 'Measured: the real, bounded pipeline own peak bytes held across every in-flight batch lands at six thousand bytes, just a few batches worth, for the entire real run of fifty batches',
      body: (
        <>
          Fifty real batches, a memory peak that stays small.
        </>
      ),
      duration: 3.0,
      Visual: S.BoundedReveal,
    },
    {
      title: 'The identical real producer and the identical real, slow sink, this time connected by channels with no real limit on how many batches they can hold, each stage cloning its own batch before handing it downstream. Does its own real peak memory land near the bounded pipeline own real peak, or far past it?',
      body: (
        <>
          An unbounded pipeline, the identical workload.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Close to the bounded pipeline own real peak' },
          { label: 'Far past it, toward the full run own total bytes', correct: true },
          { label: 'It depends only on how many stages clone' },
        ],
        explain: (
          <>
            Far past it, toward the entire run own bytes.
          </>
        ),
      },
      Visual: S.UnboundedPredict,
    },
    {
      title: 'Measured: the real, unbounded, cloning pipeline own peak bytes held reaches fifty-one thousand bytes, essentially the entire run own total batch bytes, because its fast producer never once has to wait on the real, slow sink',
      body: (
        <>
          The same fifty batches, a peak that keeps climbing.
        </>
      ),
      duration: 3.0,
      takeaway: 'A channel with no real limit removes the one signal that would have told a fast producer to slow down.',
      Visual: S.UnboundedReveal,
    },
    {
      title: 'The real, bounded pipeline own measured peak, six thousand bytes, against the real, unbounded pipeline own measured peak, fifty-one thousand bytes, for the identical real workload. Is that real gap a small, incidental difference, or a large, structural one?',
      body: (
        <>
          Two real peaks, the identical fifty batches.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'A small, incidental difference, since both process the same batches' },
          { label: 'A large, structural difference, over eight times larger', correct: true },
          { label: 'A difference only because this run picked a slow sink' },
        ],
        explain: (
          <>
            A large, structural gap, over eight times larger.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: 'Measured: the real, unbounded pipeline own peak is more than eight times the real, bounded pipeline own peak, for the identical fifty real batches and the identical real sink delay, a real, structural gap rather than an incidental one',
      body: (
        <>
          The identical workload, an eightfold gap.
        </>
      ),
      duration: 3.0,
      takeaway: 'A bounded channel own real limit is what turns a fast producer head start into backpressure, not goodwill.',
      Visual: S.CompareReveal,
    },
    {
      title: 'The tokio mpsc module own documentation states this directly: a bounded channel at capacity rejects a send until capacity frees up, which is exactly how it provides backpressure; an unbounded channel own send always completes immediately, with no real limit to push back against',
      body: (
        <>
          tokio mpsc, in its own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'A buffer moved through a channel that can say no keeps memory bounded; cloning into one that cannot does not.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a limit that is actually enforced',
      body: (
        <>
          A real, bounded pipeline that moves each batch forward through channels with a real, enforced limit keeps its own memory capped under a slow sink; a real, unbounded pipeline that clones each batch into channels with no real limit lets a fast producer own head start turn into unbounded real memory, however identically slow the sink stays underneath it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
