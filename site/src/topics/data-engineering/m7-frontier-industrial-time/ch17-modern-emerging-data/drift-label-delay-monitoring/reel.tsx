import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows (the PSI/KS/JS values, the precision collapse, the null-rate
// creep) is measured for real in examples.py, implemented directly in NumPy against this
// sandbox's own reproduced shifts.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A model's PSI on every feature stays under 0.05 for months — no drift, by that number —
          while its live precision quietly halves.
        </>
      ),
      duration: 2.6,
      fig: 'no drift, by that number. The model got worse anyway.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what a distribution test misses',
      body: (
        <>
          What kind of drift does a per-feature distribution test structurally miss, and what
          would have caught this one instead?
        </>
      ),
      duration: 2.4,
      fig: 'the input looks the same. What it predicts does not.',
      predict: {
        options: [
          { label: 'Data drift — the inputs themselves must have shifted somewhere the test missed' },
          { label: 'Concept drift — the inputs look the same, but what they predict has changed', correct: true },
        ],
        explain: (
          <>
            A distribution test over the inputs has nothing to say about the relationship between
            those inputs and the label. If that relationship moves while the inputs hold still,
            the test has nothing to flag.
          </>
        ),
      },
      Visual: S.PredictWhatItMisses,
    },
    {
      title: 'Reveal: data drift vs. concept drift',
      body: (
        <>
          Data drift is the input distribution moving. Concept drift is the relationship between
          inputs and the label moving, even when the inputs look the same.
        </>
      ),
      duration: 4.2,
      fig: 'same shape, different meaning.',
      Visual: S.RevealDataVsConceptDrift,
    },
    {
      title: 'Reveal: PSI, KS and Jensen-Shannon agree',
      body: (
        <>
          On an obvious mean shift, all three per-feature tests agree cleanly: the Population
          Stability Index, the Kolmogorov-Smirnov statistic, and Jensen-Shannon distance.
        </>
      ),
      duration: 4.2,
      fig: 'an obvious shift. All three tests flag it.',
      takeaway: 'PSI bins and sums, KS compares the full curve, Jensen-Shannon handles sparse bins — different mechanics, same answer here.',
      Visual: S.RevealThreeTestsAgree,
    },
    {
      title: 'Reveal: a case where they disagree',
      body: (
        <>
          A shift concentrated narrowly enough stays quiet in PSI's coarse decile bins, while KS,
          comparing every point, registers more of it.
        </>
      ),
      duration: 4.2,
      fig: 'the same shift, read at two different resolutions.',
      takeaway: 'PSI and KS disagreeing is not a bug in either test. They measure the same shift at different resolutions.',
      Visual: S.RevealDisagreementCase,
    },
    {
      title: 'Reveal: null-rate creep, the silent corruption',
      body: (
        <>
          Mean-imputing a rising null rate keeps a distributional test on the imputed column quiet
          — but the null rate itself is directly, clearly checkable.
        </>
      ),
      duration: 4.2,
      fig: 'the imputed column looks fine. The null rate does not.',
      takeaway: 'A distributional test over imputed values can miss exactly the corruption the imputation itself is hiding.',
      Visual: S.RevealNullRateCreep,
    },
    {
      title: 'Reveal: proxy metrics during label delay',
      body: (
        <>
          While the true label is still weeks away, a team watches named proxies instead: input
          and output distributions, confidence scores, downstream signals.
        </>
      ),
      duration: 4.2,
      fig: 'proxies, named as proxies, while the real label waits.',
      takeaway: 'Calling a signal a proxy, out loud, matters. It stands in for the label — it is not the label.',
      Visual: S.RevealProxyMetrics,
    },
    {
      title: 'Reveal: what a proxy does not prove',
      body: (
        <>
          The concept-drift case from earlier: PSI on the feature stayed near zero while real
          precision collapsed completely, with no warning from the proxy at all.
        </>
      ),
      duration: 4.2,
      fig: "the proxy stayed quiet. The real thing failed.",
      takeaway: "A proxy's movement is suggestive. It is never proof of what really happened to performance.",
      Visual: S.RevealProxyDoesNotProve,
    },
    {
      title: 'Recap',
      body: (
        <>
          Tell data drift from concept drift. Expect PSI, KS and Jensen-Shannon to disagree on
          purpose. Check the null rate directly. Treat a proxy's movement as a hint, not proof.
        </>
      ),
      duration: 4.5,
      fig: 'two kinds of drift, three tests, a direct check, a hint.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          PSI, KS and Jensen-Shannon all agree there is no drift on a feature. Live precision has
          visibly dropped anyway.
        </>
      ),
      duration: 2.6,
      fig: 'three tests say no drift. Precision says otherwise.',
      predict: {
        options: [
          { label: 'Trust the three tests — if none of them flag it, nothing worth worrying about moved' },
          { label: "Neither alone is enough — the tests cover data drift, not the concept drift a falling precision suggests", correct: true },
        ],
        explain: (
          <>
            The three tests were never built to see concept drift, so their silence proves nothing
            about it. A dropping precision is exactly the gap a label-tied proxy exists to watch
            for, once the label itself finally arrives.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
