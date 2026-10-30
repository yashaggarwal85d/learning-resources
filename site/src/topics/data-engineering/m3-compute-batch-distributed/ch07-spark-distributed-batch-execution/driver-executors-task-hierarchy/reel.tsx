import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is measured against a real local Apache Spark 4.0.1 session (examples.py):
// spark.range(0, 1_000_000, numPartitions=4).count() runs as one job whose per-partition stage has
// four tasks; a second, independent count() on the same DataFrame gets a new job id, not the first
// one reused; df.repartition(8).count() changes that job's task count to eight, tracking the new
// partition count exactly. Local mode runs the driver and the executor threads in one JVM
// (disclosed in post-notes.md); the job/stage/task counts are the real mechanism regardless.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Application. Job. Stage. Task. Everyone nods along to these four words. Ask which number
          each one actually fixes, and most people guess.
        </>
      ),
      duration: 4.5,
      fig: 'four words, one click. How many jobs? How many stages? How many tasks?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one action, one job',
      body: (
        <>
          A real Spark session, a DataFrame cut into four partitions, one <code>count()</code>.
          One job runs. Its one stage — nothing here forces a shuffle — gets exactly four tasks,
          one per partition.
        </>
      ),
      duration: 4.8,
      fig: 'one count(), four partitions: one job, one stage, four tasks — measured, not assumed.',
      Visual: S.RevealOneJob,
    },
    {
      title: 'Predict: the second count()',
      body: (
        <>
          Same DataFrame, same four partitions. Call <code>count()</code> on it again. Does Spark
          reuse the first job, since nothing about the data changed, or does something new happen?
        </>
      ),
      duration: 2.8,
      fig: 'the same DataFrame, count() again. Same job as before, or a new one?',
      predict: {
        options: [
          { label: "The same job — the DataFrame and its partitions haven't changed" },
          { label: 'A new job — every action gets its own job id, regardless of the data', correct: true },
        ],
        explain: (
          <>
            A "job" isn't a property of the DataFrame. It's what one action spawns. Call the
            action twice, and you get two jobs, every time, even against the identical data.
          </>
        ),
      },
      Visual: S.PredictSecondAction,
    },
    {
      title: 'Reveal: a new job id',
      body: (
        <>
          Measured directly from Spark's own status tracker: the second <code>count()</code> gets
          a job id the first one never had. Same DataFrame. A different job, because a different
          action triggered it.
        </>
      ),
      duration: 4.5,
      fig: "first count(): job id N. Second count(), same data: a different job id entirely.",
      takeaway: 'A job is scoped to one action, never to the data it runs against.',
      Visual: S.RevealNewJob,
    },
    {
      title: 'Reveal: task count tracks partitions',
      body: (
        <>
          Repartition the same million rows into eight pieces instead of four, then count again.
          The task count for that job's stage follows the new partition count exactly: eight.
        </>
      ),
      duration: 4.5,
      fig: 'four partitions: four tasks. repartition(8): eight tasks. Same million rows, both times.',
      takeaway: 'A task count is never about how much data there is. It tracks how many partitions that data sits in.',
      Visual: S.RevealRepartitionTasks,
    },
    {
      title: 'Reveal: driver and executor',
      body: (
        <>
          Spark's own glossary is exact: the driver is the process running your program's{' '}
          <code>main()</code> and owning the <code>SparkContext</code>. Executors are separate
          processes, one set per application, that actually run the tasks.
        </>
      ),
      duration: 4.8,
      fig: 'the driver runs your program and plans. Executors, a separate set per application, run the tasks it sends.',
      takeaway: 'Lose the driver and the whole application is gone. Lose one executor and only its tasks are gone.',
      Visual: S.RevealDriverExecutor,
    },
    {
      title: 'Recap',
      body: (
        <>
          An application holds jobs — one per action. A job holds stages — cut wherever a shuffle
          forces one. A stage holds tasks — one per partition. Four words, four fixed scopes.
        </>
      ),
      duration: 4.8,
      fig: 'application → job (per action) → stage (per shuffle) → task (per partition).',
      Visual: S.Recap,
    },
  ],
};

export default reel;
