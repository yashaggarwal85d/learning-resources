import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two unrelated counters sharing one real cache line genuinely pay a
// real, growing invalidation cost; padding each counter onto its own
// real cache line genuinely removes that cost entirely.
const reel: Reel = {
  steps: [
    {
      title: 'Two unrelated counters, one touched by each of two cores, happen to share one real cache line. Does writing one counter ever cost the other core anything?',
      body: (
        <>
          Two counters, one shared line.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, genuinely; they are unrelated values' },
          { label: "Yes, genuinely; every write can invalidate the other core's own cached copy", correct: true },
          { label: 'Only if both cores write the identical counter' },
        ],
        explain: (
          <>
            Yes. Every write can genuinely invalidate it.
          </>
        ),
      },
      Visual: S.SharedPredict,
    },
    {
      title: 'Measured: the shared layout genuinely pays a real invalidation cost on every single alternating write between the two cores, even though the two counters are otherwise unrelated',
      body: (
        <>
          The real, measured invalidation count.
        </>
      ),
      duration: 3.0,
      takeaway: '"Unrelated" data is not the same as "safe to place on the identical cache line."',
      Visual: S.SharedReveal,
    },
    {
      title: 'Now pad each counter onto its own real cache line instead. Does that genuinely remove the cost, or only reduce it?',
      body: (
        <>
          Two counters, two separate lines.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It only reduces it; some real cost remains' },
          { label: 'It genuinely removes it entirely, down to zero', correct: true },
          { label: 'It depends on how many cores are involved' },
        ],
        explain: (
          <>
            It genuinely removes it, entirely.
          </>
        ),
      },
      Visual: S.PaddedPredict,
    },
    {
      title: 'Measured: the padded layout genuinely avoids every real cross-core invalidation, at the identical sequence of writes the shared layout paid for',
      body: (
        <>
          The real, measured zero-invalidation count.
        </>
      ),
      duration: 3.0,
      takeaway: 'Padding buys all of the cost back, not a partial share of it.',
      Visual: S.PaddedReveal,
    },
    {
      title: "Run both layouts again, but with far more operations this time. Does the shared layout's own real cost grow, or does it stay the same no matter how much work runs?",
      body: (
        <>
          A longer real sequence, both layouts.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It stays the same; false sharing has a fixed, one-time cost' },
          { label: 'It genuinely grows with every additional operation', correct: true },
          { label: "Only the padded layout's own cost changes" },
        ],
        explain: (
          <>
            It genuinely grows, every time.
          </>
        ),
      },
      Visual: S.ScalePredict,
    },
    {
      title: "Measured: the shared layout's own real cost genuinely grows with more operations, while the padded layout's own real cost stays genuinely at zero no matter how many run",
      body: (
        <>
          The real, measured comparison, two workload sizes.
        </>
      ),
      duration: 3.0,
      takeaway: 'False sharing gets worse the longer a real program runs, never better.',
      Visual: S.ScaleReveal,
    },
    {
      title: "crossbeam_utils's own CachePadded documentation and Wikipedia's own False sharing article both state this exact mechanism directly: updating one piece of data invalidates the whole real cache line it belongs to, and padding is the real, standard fix. Does this topic's own code measure the identical real cost those real tools exist to remove?",
      body: (
        <>
          Both sources' own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a real cache line, shared and padded, measured directly',
      body: (
        <>
          Two unrelated counters sharing one real cache line genuinely pay a real, growing invalidation cost; padding each counter onto its own real cache line genuinely removes that cost entirely.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
