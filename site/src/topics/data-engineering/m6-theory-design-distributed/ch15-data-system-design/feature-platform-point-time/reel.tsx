import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The label-leakage experiment (the point-in-time join versus the latest-
// value join, scored against a planted future-leaking feature) and the
// parity-check sampling cost are asserted in examples.py's own
// point_in_time_count(), leaky_count(), accuracy_at_threshold(),
// parity_mismatch_rate() and sampling_cost(). The Feast claims trace to its
// own docs, quoted in SOURCES.md and checked step by step in FACT-CHECK.md.
// No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a strong offline score, a flat online lift",
      body: (
        <>
          The recommendation model scores well offline and drives no measurable lift in
          production. The feature "orders in the last thirty days" was computed from the table's
          current state, so a training row for a click months ago counted orders placed after
          that click.
        </>
      ),
      duration: 5.0,
      fig: "a strong offline-score bar beside a flat online-lift bar, a feature drawn as computed from now instead of from the click",
      Visual: S.Hook,
    },
    {
      title: "Predict: what single join rule prevents this?",
      body: (
        <>
          How would you have caught this before launch, and what single join rule prevents it?
        </>
      ),
      duration: 4.0,
      predict: {
        options: [
          { label: "collect more training data, since more examples average out the error" },
          {
            label: "join each feature as it was known at the event's own timestamp, never later",
            correct: true,
          },
        ],
        explain: (
          <>
            More rows joined the same wrong way only repeat the same leak at a larger scale, never
            close it. The real fix joins each feature as it was known at the event's own time.
          </>
        ),
      },
      fig: "more data repeats the leak; joining as of the event's own time closes it",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: one feature definition, two computations",
      body: (
        <>
          One feature definition compiles to a batch computation over history, the offline store,
          and an incremental computation, the online store. This closes the gap where a feature
          computed one way for training and another for serving trains on something it never sees
          live.
        </>
      ),
      duration: 5.0,
      fig: "one definition box splitting into two paths, one landing in a lake table, the other in a low-latency store",
      Visual: S.RevealOneDefinition,
    },
    {
      title: "Reveal: batch or streaming, chosen per feature",
      body: (
        <>
          Each feature's own freshness need decides its path: a feature updated daily from batch
          sits beside one updated per event from a stream, with the same logic running on both
          so neither computation silently drifts from the other.
        </>
      ),
      duration: 4.8,
      fig: "a freshness-need column matched against a chosen path per feature, no mismatch between the two",
      Visual: S.RevealFreshnessChoice,
    },
    {
      title: "Reveal: the point-in-time join, and the leak it closes",
      body: (
        <>
          To build a training row for an event, each feature joins as it was known at that
          event's own time, never later. A join on the latest value instead reaches into the
          future.
        </>
      ),
      duration: 4.8,
      takeaway: "A join on the latest value leaks the future; it has to land on what was known at that moment.",
      fig: "a latest-value join reaching ahead of the event versus an as-of join landing exactly on it",
      Visual: S.RevealPointInTimeJoin,
    },
    {
      title: "Reveal: the leakage measured",
      body: (
        <>
          A planted future-leaking feature, joined two ways against the same synthetic dataset —
          the as-of join and the latest-value join — scored against a held-out future, with the
          leaking join's score standing well above its real one.
        </>
      ),
      duration: 4.8,
      takeaway: "The leaking join's score was optimistic by a measured, specific margin, not a vague risk.",
      fig: "two scores for the same feature, the leaky one towering over the as-of one",
      Visual: S.RevealLeakageMeasured,
    },
    {
      title: "Reveal: parity as a continuous SLO",
      body: (
        <>
          A sampled, continuous check compares the online store's value for an entity at a time
          against what the offline computation produces for that same time, run as an SLO with an
          alert, because skew arrives silently from a changed upstream or different null-handling.
        </>
      ),
      duration: 5.0,
      takeaway: "A parity check run once at launch catches nothing later; it has to be a standing SLO with its alert.",
      fig: "an online value and an offline value for the same entity and time, compared on a running dashboard",
      Visual: S.RevealParitySLO,
    },
    {
      title: "Reveal: backfilling a new feature's history",
      body: (
        <>
          Adding a feature means reconstructing its point-in-time values from raw history for the
          whole training set, not turning it on only from today, with the backfill's own cost and
          a shadow-and-validate rollout before it's trusted.
        </>
      ),
      duration: 4.8,
      fig: "a new feature's column filling backward through past training rows from reconstructed history, not forward only",
      Visual: S.RevealBackfill,
    },
    {
      title: "Recap",
      body: (
        <>
          One feature definition feeding both stores. A freshness choice made per feature. A join
          that lands on the event's own time. A measured leakage bias. A parity check run as a
          standing SLO. And a backfill plan for whatever feature comes next.
        </>
      ),
      duration: 4.8,
      fig: "the one-definition split, the freshness choice, the as-of join, the measured leak, the parity SLO, and the backfill plan, side by side",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the features",
      body: (
        <>
          The feature count grows tenfold. The point-in-time join and the parity check both still
          run correctly. What's the next bottleneck?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "the training-set join itself breaks down, since more features means a bigger join" },
          {
            label: "the parity check's own sampling and alert volume become the bottleneck",
            correct: true,
          },
        ],
        explain: (
          <>
            The join's correctness is per-feature and per-event, so a higher feature count doesn't
            change how any single join behaves. Checking every feature at the same rate is what
            stops being affordable.
          </>
        ),
      },
      fig: "the join staying correct while the parity check's own sampling and alert volume climb with the feature count",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
