import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every skew rate this reel shows is measured for real in examples.py against this sandbox's own
// Postgres cluster, reusing topic 1's churn dataset shape under a topic-local table prefix.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A churn model performs well in every offline test. The week it goes live, it's
          visibly worse — and nobody can find a code change that explains it.
        </>
      ),
      duration: 2.6,
      fig: 'strong offline. Worse live. Nothing in the model changed.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which skew cause',
      body: (
        <>
          The online pipeline computes "days since last order" with a different timezone
          boundary than the offline pipeline used. Which of three named causes is this?
        </>
      ),
      duration: 2.4,
      fig: 'a timezone boundary differs. Which cause?',
      predict: {
        options: [
          { label: "A materialization lag — the online store's value is just old" },
          { label: 'A different code path computing the "same" feature differently', correct: true },
        ],
        explain: (
          <>
            Nothing here is stale — both pipelines ran on schedule. The bug is that two pieces
            of code claim to compute the same feature and don't.
          </>
        ),
      },
      Visual: S.PredictSkewCause,
    },
    {
      title: 'Reveal: one definition, two stores',
      body: (
        <>
          A feature store compiles one transformation. It runs that same definition into an
          offline store for training and an online store for serving.
        </>
      ),
      duration: 4.2,
      fig: 'one transformation. Offline for training, online for serving.',
      Visual: S.RevealOneDefinitionTwoStores,
    },
    {
      title: 'Reveal: skew cause one, measured',
      body: (
        <>
          Run the same definition through both pipes: zero mismatches. Let a second, slightly
          different implementation sneak into the serving path, and the mismatch is real and
          measured.
        </>
      ),
      duration: 4.5,
      fig: 'identical code: zero mismatches. A second definition: measured.',
      takeaway: "The most commonly cited cause of this skew isn't a timing bug. It's two engineers, two code paths, one name.",
      Visual: S.RevealCodePathSkew,
    },
    {
      title: 'Reveal: skew cause two, measured',
      body: (
        <>
          The serving path asks for the feature's current value instead of its value as of the
          request. It's the same leak topic one measured in training, now happening at
          inference time.
        </>
      ),
      duration: 4.2,
      fig: 'current, not as of. The same leak, at inference time.',
      takeaway: "A feature store can guarantee one definition and still lose to a different join. The store isn't the whole guarantee.",
      Visual: S.RevealJoinSkew,
    },
    {
      title: 'Predict: freshness SLA',
      body: (
        <>
          Materialization runs every thirty minutes. A request arrives thirty-five minutes
          after the last run. Is the online value late?
        </>
      ),
      duration: 2.4,
      fig: 'materialized every thirty minutes. Late by five?',
      predict: {
        options: [
          { label: 'No — thirty-five minutes is close enough to count as current' },
          { label: "Yes — past the stated limit, the honest answer is \"unknown,\" not \"close enough\"", correct: true },
        ],
        explain: (
          <>
            A freshness SLA is a stated number, not a feeling. Past the limit the value is late
            by definition, however small the gap looks.
          </>
        ),
      },
      Visual: S.PredictFreshnessSla,
    },
    {
      title: 'Reveal: skew cause three, measured',
      body: (
        <>
          Materialization happens in pulses, not a continuous flow. Under a thirty-minute
          freshness limit, a forty-five-minute pulse interval produces real, measured
          violations; a fifteen-minute interval produces none.
        </>
      ),
      duration: 4.2,
      fig: 'pulses, not a flow. Some intervals violate the limit, some never do.',
      takeaway: "Materialization isn't instant. The gap between the last run and a new request is what a freshness SLA names.",
      Visual: S.RevealStaleValueSkew,
    },
    {
      title: 'Reveal: the named platforms, placed',
      body: (
        <>
          Feast, Tecton, Hopsworks, a warehouse's own serving layer — four names drawing the
          same two pipes, differing in who manages them and how real-time the online side
          needs to be.
        </>
      ),
      duration: 4.5,
      fig: 'four names. The same two pipes underneath.',
      takeaway: "Four names for the same two pipes. What differs is who manages them, and how real-time serving must be.",
      Visual: S.RevealNamedPlatforms,
    },
    {
      title: 'Recap',
      body: (
        <>
          One definition, compiled once, feeding an offline store and an online store. A
          different code path, a different join, or a stale materialization can each still
          break the guarantee.
        </>
      ),
      duration: 4.5,
      fig: 'one definition, two stores, three ways it still breaks.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team adopts a feature store and keeps a separate, hand-written query in a
          dashboard that recomputes the same feature "for a quick check."
        </>
      ),
      duration: 2.6,
      fig: 'a dashboard recomputes the feature by hand. Protected?',
      predict: {
        options: [
          { label: "Still protected — the dashboard query is read-only" },
          { label: "Not protected — it's a second code path, the exact first cause again", correct: true },
        ],
        explain: (
          <>
            A feature store only guarantees consistency for code that goes through it. Anything
            that recomputes the feature outside the store is skew cause one again, wearing a
            different excuse.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
