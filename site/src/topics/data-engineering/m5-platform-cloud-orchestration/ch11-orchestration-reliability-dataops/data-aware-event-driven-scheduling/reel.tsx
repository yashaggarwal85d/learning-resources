import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real experiments against a live Apache Airflow install: six separate consumer Dags
// scheduled on one asset, all fired by a single real update (examples.py, FACT-CHECK.md); and
// Airflow's own StartOfHourMapper, run live on four real timestamps to show partition translation.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The moment the shop's hourly orders asset updates, eleven downstream Dags that all
          depend on it fire within the same second, each spinning up its own executor slots.
        </>
      ),
      duration: 4.8,
      fig: "one asset updates. eleven downstream dags fire at once.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one asset update, measured',
      body: (
        <>
          One producer Dag updates a single asset. Six separate consumer Dags, each scheduled on
          that same asset, all create a run — read back from the real metadata database.
        </>
      ),
      duration: 4.8,
      fig: 'one update, six dags scheduled on it. measured for real.',
      Visual: S.RevealFanoutMeasured,
    },
    {
      title: 'Predict: does Airflow stagger them?',
      body: (
        <>
          Six Dags, scheduled on the exact same asset, triggered by the exact same update. Does
          Airflow space their runs out, or create them all at essentially the same instant?
        </>
      ),
      duration: 2.8,
      fig: 'does airflow space the six runs out, or fire them together?',
      predict: {
        options: [
          { label: 'Airflow staggers them to smooth out the load' },
          { label: 'All six fire together, microseconds apart', correct: true },
        ],
        explain: (
          <>
            Nothing in the asset-scheduling mechanism staggers anything. Every Dag watching an
            asset reacts the moment it updates, at the same time as every other one watching it.
          </>
        ),
      },
      Visual: S.PredictStaggering,
    },
    {
      title: 'Reveal: the asset model, renamed and extended',
      body: (
        <>
          What's actually being watched: Airflow's data-aware unit, called Dataset through the
          two-point line and renamed Asset — with watchers that can pull from an external queue.
        </>
      ),
      duration: 4.8,
      fig: 'renamed from dataset to asset. watchers pull from queues.',
      takeaway: "One asset update doesn't trigger one Dag. It triggers every Dag scheduled on it, together.",
      Visual: S.RevealAssetModel,
    },
    {
      title: "Predict: what happens when granularities don't match?",
      body: (
        <>
          An upstream asset partitioned by the hour feeding a downstream one partitioned by the
          day. What happens to an upstream key that falls in the middle of an hour?
        </>
      ),
      duration: 2.8,
      fig: 'upstream hourly, downstream daily. what happens to the key?',
      predict: {
        options: [
          { label: 'Airflow rejects it -- the granularities must match exactly' },
          { label: 'A mapper translates it to the coarser downstream key', correct: true },
        ],
        explain: (
          <>
            A partition mapper exists specifically for this. It translates an upstream key to
            whatever downstream key it belongs to, however the two granularities differ.
          </>
        ),
      },
      Visual: S.PredictGranularityMismatch,
    },
    {
      title: 'Reveal: a partition mapper, run live',
      body: (
        <>
          Airflow's own hour-rounding mapper, called directly on four real timestamps: three
          landing in the same hour collapse to one downstream key; the fourth doesn't.
        </>
      ),
      duration: 4.8,
      fig: 'a real partition mapper, run live on four real timestamps.',
      takeaway: 'A partition mapper translates a key. It never forces two mismatched schedules to agree.',
      Visual: S.RevealPartitionMapper,
    },
    {
      title: "Reveal: Dagster's declarative version, sourced",
      body: (
        <>
          Dagster states the condition for running an asset rather than wiring up a trigger for
          it, and adds a freshness policy that fails loudly when an asset falls behind its promise.
        </>
      ),
      duration: 4.8,
      fig: "dagster's version: state the condition, not the trigger.",
      Visual: S.RevealDagsterComparison,
    },
    {
      title: 'Recap',
      body: (
        <>
          Data-driven scheduling reacts the instant data shows up, but only as reliably as the
          event that announces it. Time-based scheduling never misses an event, because it isn't
          watching for one -- and can run against data that was never actually ready.
        </>
      ),
      duration: 4.8,
      fig: 'data-driven reacts fast. time-based is predictable. both have a cost.',
      takeaway: "Data-driven scheduling trades predictability for speed. Time-based trades speed for never missing a run.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Back to the hook's eleven Dags, all watching the same hourly asset, about to fire
          together exactly as measured with six.
        </>
      ),
      duration: 2.8,
      fig: 'back to the eleven dags. does a fairness fix change the herd?',
      predict: {
        options: [
          { label: 'With eleven instead of six, Airflow starts staggering them' },
          { label: 'All eleven still fire together -- the count never mattered', correct: true },
        ],
        explain: (
          <>
            The mechanism doesn't count how many Dags are watching. Every one of them reacts to
            the same update at the same moment, whether there are six or eleven or a hundred.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
