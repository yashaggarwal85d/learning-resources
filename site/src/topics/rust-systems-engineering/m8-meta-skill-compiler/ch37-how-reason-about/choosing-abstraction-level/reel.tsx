import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A recorded hypothesis is what a real result is checked against; the
// identical real measurement, without it, is just a number with nothing
// to confirm or contradict.
const reel: Reel = {
  steps: [
    {
      title: "Before any code changes, a real hypothesis gets written down: replying to a client only once the worker's own storage write for that request has genuinely finished, instead of replying the instant the request is enqueued, will add roughly the worker's own real per-request delay to what the client observes. Is that hypothesis specific enough to actually be wrong?",
      body: (
        <>
          A hypothesis, written down before the change.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, it's too vague to check against a real number" },
          { label: 'Yes, genuinely; it names a real metric and a real size', correct: true },
          { label: 'Only once the code is already written' },
        ],
        explain: (
          <>
            Yes. It names a real, checkable number.
          </>
        ),
      },
      Visual: S.HypothesisPredict,
    },
    {
      title: "Measured: a real workload of five sequential requests, against the identical real service, with the handler replying immediately on enqueue first",
      body: (
        <>
          The baseline, measured first.
        </>
      ),
      duration: 3.0,
      Visual: S.HypothesisReveal,
    },
    {
      title: "Now the one real, specific change: the handler is changed to await a real completion signal from the worker before it replies, for the identical workload against the identical service shape. Does the client's own real, observed latency actually change the way the hypothesis predicted?",
      body: (
        <>
          One change, the identical workload.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, replying is replying either way' },
          { label: "Yes, genuinely; it grows by roughly the worker's own delay", correct: true },
          { label: 'Only on the very first request' },
        ],
        explain: (
          <>
            Yes. The wait shows up directly.
          </>
        ),
      },
      Visual: S.ChangePredict,
    },
    {
      title: "Measured: the real, observed latency jumps from a fraction of a millisecond to a number close to the worker's own real delay, once the handler waits for the real completion signal instead of replying immediately",
      body: (
        <>
          The change, measured the same way.
        </>
      ),
      duration: 3.0,
      takeaway: 'A recorded hypothesis turns a real number into something that is confirmed or contradicted, not just observed.',
      Visual: S.ChangeReveal,
    },
    {
      title: "Side by side, does the real, measured size of the added latency actually match the hypothesis's own stated prediction, or did writing the hypothesis down turn out to be a coincidence?",
      body: (
        <>
          The guess, beside the real result.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It was a lucky coincidence, with no real connection' },
          { label: "It matches, genuinely; the wait really is the worker's delay", correct: true },
          { label: 'It only matches for this one specific run' },
        ],
        explain: (
          <>
            It matches. That's what confirms it.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: "Measured: the real, added latency lands within a wide margin of the worker's own stated delay, confirming the hypothesis directly rather than merely producing a number that happens to exist",
      body: (
        <>
          The match, held up against the guess.
        </>
      ),
      duration: 3.0,
      takeaway: "A change's own real result only means something once it is checked against what was actually predicted beforehand.",
      Visual: S.CompareReveal,
    },
    {
      title: "The Google SRE Book's own Effective Troubleshooting chapter states this directly: hypothesize, then compare the observed state against the theory to find confirming or disconfirming evidence. Does this topic's own measured hypothesis and result follow exactly that real method?",
      body: (
        <>
          The method, in its own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'Writing the guess down before checking it is what makes a real result able to confirm or contradict it.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: writing down the guess before checking it',
      body: (
        <>
          A real hypothesis, a real workload, a real metric, and a real change, checked against a real result: that is the whole of evidence discipline, and it is what turns an optimization from a feeling that it worked into a number that genuinely did, or genuinely didn't, match what was predicted.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
