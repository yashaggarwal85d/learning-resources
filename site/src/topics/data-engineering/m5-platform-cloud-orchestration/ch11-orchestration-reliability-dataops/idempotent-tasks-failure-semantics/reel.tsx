import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real experiments (examples.py): an overwrite-vs-append idempotency measurement, and a real
// three-task Apache Airflow DAG run end to end with `airflow dags test` against this sandbox's
// own metadata database, read back directly from its task_instance table.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A worker is killed mid-task. The scheduler retries it. The row count that comes out the
          other side is twice what it should be.
        </>
      ),
      duration: 4.8,
      fig: 'a worker dies mid-task. the retry doubles the row count.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: at-least-once, not exactly-once',
      body: (
        <>
          "Retried" doesn't mean it ran once, then ran again. The first attempt may have already
          written its output before anyone lost track of it.
        </>
      ),
      duration: 4.8,
      fig: 'retried does not mean ran once. the first attempt may have already written.',
      Visual: S.RevealAtLeastOnce,
    },
    {
      title: 'Reveal: overwrite vs append, measured',
      body: (
        <>
          The same task, run twice, two ways. One stays correct. The other silently doubles.
        </>
      ),
      duration: 4.8,
      fig: 'the same task, run twice. one way stays correct. one way doubles.',
      Visual: S.RevealOverwriteVsAppend,
    },
    {
      title: 'Predict: does a timeout retry like a data error?',
      body: (
        <>
          A task times out. Another task hits a malformed row. Does the executor retry both the
          same way?
        </>
      ),
      duration: 2.8,
      fig: 'a timeout, and a bad row. retried the same way?',
      predict: {
        options: [
          { label: 'Yes — same backoff, same retry count, either way' },
          { label: 'No — a bad row should fail fast, not burn the retry budget', correct: true },
        ],
        explain: (
          <>
            A timeout is often transient and worth retrying. A malformed row is a data problem no
            retry fixes — retrying it anyway only delays finding out, and wastes the attempts a
            real transient failure might have needed.
          </>
        ),
      },
      Visual: S.PredictTimeoutVsDataError,
    },
    {
      title: 'Reveal: trigger rules, run for real',
      body: (
        <>
          One task fails on purpose. A downstream task on the default rule never runs at all. A
          third, told to run on failure, runs anyway. All real, all measured.
        </>
      ),
      duration: 4.8,
      fig: 'one task fails. one downstream never runs. one runs anyway. measured.',
      takeaway: "Upstream failed isn't skipped. It means a task never got the chance to run, by design.",
      Visual: S.RevealTriggerRulesReal,
    },
    {
      title: 'Reveal: zombies, by the book',
      body: (
        <>
          A worker's process dies without telling anyone. Airflow's own fix: find the task
          instances whose heartbeat has gone quiet, and treat them as failed.
        </>
      ),
      duration: 4.8,
      fig: "a worker dies silently. a missed heartbeat is the only sign.",
      takeaway: 'The scheduler can only infer a worker is gone. It can never be sure the task did not already finish.',
      Visual: S.RevealZombiesByTheBook,
    },
    {
      title: 'Reveal: timeouts and the retry budget',
      body: (
        <>
          A timeout caps how long any task can run. Retrying something that was never going to
          succeed just spends that budget on nothing.
        </>
      ),
      duration: 4.8,
      fig: 'a timeout caps the run. retrying a doomed task spends the budget for nothing.',
      takeaway: 'A retry is a safety net for a transient failure. On a real data problem it only delays the outcome.',
      Visual: S.RevealTimeoutsRetryBudget,
    },
    {
      title: 'Recap',
      body: (
        <>
          At-least-once execution, an overwrite that survives a retry, trigger rules measured for
          real, and a budget retries can waste.
        </>
      ),
      duration: 4.8,
      fig: 'at least once. overwrite survives a retry. trigger rules measured. a budget to protect.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A task instance has shown "running" for six hours. Its log has no errors, no output, no
          progress.
        </>
      ),
      duration: 2.8,
      fig: 'running for hours. no log, no progress. what now?',
      predict: {
        options: [
          { label: "It's clearly still working — leave it alone" },
          { label: "Check its heartbeat — it may be a zombie nobody's caught yet", correct: true },
        ],
        explain: (
          <>
            Nothing about "still running" rules out a worker that died silently. The heartbeat is
            the only honest signal, and it's exactly what the scheduler itself watches.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
