import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real measured experiments against a real Apache Airflow install and this sandbox's own
// PostgreSQL cluster (examples.py): DAG-parsing cost measured at three real file counts, and two
// real concurrent "scheduler" threads coordinating through SKIP LOCKED with zero double-claims.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A team's DAG file count goes from a few hundred to several thousand overnight. Scheduler
          latency doesn't double. It falls off a cliff.
        </>
      ),
      duration: 4.8,
      fig: 'dag files go from a few hundred to thousands. Latency does not just double.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the three required parts',
      body: (
        <>
          A scheduler, a Dag processor, an API server, a metadata database. The executor is not a
          fifth part — it runs inside the scheduler itself.
        </>
      ),
      duration: 4.8,
      fig: 'scheduler, dag processor, api server, metadata database. the executor lives inside the scheduler.',
      Visual: S.RevealThreeRequiredParts,
    },
    {
      title: 'Reveal: executors, three shapes',
      body: (
        <>
          Local keeps everything in one process. Celery hands tasks to a pool of workers through a
          broker. Kubernetes starts one pod per task.
        </>
      ),
      duration: 4.8,
      fig: 'one process, or a worker pool through a broker, or one pod per task.',
      Visual: S.RevealExecutorsThreeShapes,
    },
    {
      title: 'Predict: two schedulers, one metadata DB',
      body: (
        <>
          Two schedulers run against the same metadata database at once. Does any task ever get
          scheduled twice?
        </>
      ),
      duration: 2.8,
      fig: 'two schedulers, one shared database. does a task ever get claimed twice?',
      predict: {
        options: [
          { label: 'Eventually one wins, but duplicates happen along the way' },
          { label: 'No — a row lock that skips instead of waiting stops that', correct: true },
        ],
        explain: (
          <>
            The lock only has to survive from the moment a scheduler claims a row to the moment it
            commits that claim. A second scheduler's identical query simply skips a row that's
            already locked, instead of waiting for it and possibly acting on stale information.
          </>
        ),
      },
      Visual: S.PredictTwoSchedulers,
    },
    {
      title: 'Reveal: HA via row locks, measured',
      body: (
        <>
          Two real scheduler-loop threads, one real shared queue table, ten real rows. Every row
          claimed exactly once.
        </>
      ),
      duration: 4.8,
      fig: 'two real threads, ten real rows, measured against this sandbox’s own postgres.',
      takeaway: 'A lock held only long enough to claim a row lets two schedulers share one queue without colliding.',
      Visual: S.RevealSkipLockedMeasured,
    },
    {
      title: 'Reveal: DAG-parsing cost, measured',
      body: (
        <>
          A real Dag processor, parsing synthetic Dag files at three real scales. The cost per
          file barely moves — the total cost grows with every file added.
        </>
      ),
      duration: 4.8,
      fig: 'a real parse pass, measured at three scales. cost per file holds, total cost climbs.',
      takeaway: 'Parsing cost is not paid once at startup. It is paid again on every cycle, for every file.',
      Visual: S.RevealDagParsingCostMeasured,
    },
    {
      title: 'Reveal: the metadata DB as the real ceiling',
      body: (
        <>
          Every task's state change is a write the metadata database must absorb. Airflow two
          reaches end of life before Airflow three's own documentation sets one.
        </>
      ),
      duration: 4.8,
      fig: 'every state change writes to the metadata database. that is usually where it actually strains.',
      takeaway: 'The part that looks busiest in a dashboard, the scheduler process, is often not the part actually limiting throughput.',
      Visual: S.RevealMetadataDbCeiling,
    },
    {
      title: 'Recap',
      body: (
        <>
          Four required parts, three executor shapes, one row-lock trick that scales, one real
          cost curve measured instead of assumed.
        </>
      ),
      duration: 4.8,
      fig: 'four parts. three executor shapes. one lock trick. one measured cost curve.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          After a migration, a deployment's Dag file count jumps overnight. Nothing in any
          individual Dag changed.
        </>
      ),
      duration: 2.8,
      fig: 'the file count jumps overnight. nothing in any one dag changed. what do you profile first?',
      predict: {
        options: [
          { label: "Give the scheduler process itself more CPU" },
          { label: 'Profile parsing cost and metadata-database writes first — they grow with file count', correct: true },
        ],
        explain: (
          <>
            This is exactly what the measured parsing curve and the metadata-database reasoning
            from two steps earlier already showed: the thing that scales with file count is
            parsing and database writes, not the scheduler process's own CPU.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
