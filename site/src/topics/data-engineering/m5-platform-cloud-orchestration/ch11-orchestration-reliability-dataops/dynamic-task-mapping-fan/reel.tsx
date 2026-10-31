import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real experiments against a live Apache Airflow install: a mapped task (`expand`/`partial`)
// over a runtime-discovered file list, including the exact mapped-task-limit boundary (one more
// file than the default allows is rejected outright), and scheduling-overhead wall time measured
// at four fan-out sizes (examples.py, FACT-CHECK.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An engineer maps a task over "one file." The partner's drop folder holds eleven
          thousand small files today. Every other Dag sharing that cluster slows to a crawl.
        </>
      ),
      duration: 4.8,
      fig: "one file, eleven thousand files. the whole cluster slows down.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: expand and partial, run for real',
      body: (
        <>
          A task mapped over a list discovered at run time, not written in the Dag. Airflow
          decides the fan-out count when it actually runs — here, five files, five task instances.
        </>
      ),
      duration: 4.8,
      fig: 'fan-out count decided at run time. five files, five instances.',
      Visual: S.RevealExpandPartial,
    },
    {
      title: 'Predict: truncate or fail outright?',
      body: (
        <>
          Map over more files than Airflow allows at once. Does it silently process only the
          first batch, or does the whole run refuse to start?
        </>
      ),
      duration: 2.8,
      fig: 'too many files. clipped, or refused outright?',
      predict: {
        options: [
          { label: 'It silently processes only the allowed number' },
          { label: 'The whole run fails outright — nothing gets clipped', correct: true },
        ],
        explain: (
          <>
            Airflow doesn't guess which files to drop. Past the limit, the task that produced the
            list fails, and the run fails with it — loud, not quiet.
          </>
        ),
      },
      Visual: S.PredictTruncateOrFail,
    },
    {
      title: 'Reveal: the exact boundary, measured',
      body: (
        <>
          One thousand twenty-four discovered files: every one maps and succeeds. One more file —
          one thousand twenty-five — and the whole run fails, with Airflow's own real error.
        </>
      ),
      duration: 4.8,
      fig: 'one more file than the limit. the whole run fails.',
      takeaway: "The limit isn't a cap on what runs. It's a refusal to run at all.",
      Visual: S.RevealExactBoundary,
    },
    {
      title: 'Reveal: scheduling overhead, measured at four scales',
      body: (
        <>
          The same mapped Dag, timed end to end at ten, a hundred, five hundred, and a thousand
          files. Every extra mapped task instance costs real, measured wall time.
        </>
      ),
      duration: 4.8,
      fig: 'ten, a hundred, five hundred, a thousand files. timed.',
      takeaway: 'Scheduling overhead is not fixed. It grows with every extra task instance.',
      Visual: S.RevealOverheadScaling,
    },
    {
      title: 'Reveal: the same work, pushed into the engine',
      body: (
        <>
          The same file count as partitions inside one engine job, instead of one orchestrator
          task instance per file. Dozens of times less scheduling overhead for identical work.
        </>
      ),
      duration: 4.8,
      fig: 'one task instance per file, or one job with internal partitions.',
      takeaway: 'Scheduler overhead and engine overhead are not the same cost. Pick which one pays it.',
      Visual: S.RevealEngineContrast,
    },
    {
      title: 'Recap',
      body: (
        <>
          Fan-out count is decided at run time. Past the mapped-task limit, the run refuses to
          start. Thousands of task instances cost far more scheduling overhead than one engine job.
        </>
      ),
      duration: 4.8,
      fig: 'decided at run time. a hard limit. engine overhead is cheaper.',
      Visual: S.Recap,
    },
    {
      title: 'Predict: zero files today',
      body: (
        <>
          The drop folder is empty this run — the partner sent nothing. What happens to a task
          mapped over that empty list?
        </>
      ),
      duration: 2.8,
      fig: 'zero files discovered. mapped over nothing.',
      predict: {
        options: [
          { label: 'The mapped task fails, since it has nothing to run' },
          { label: 'No task instances are created; it is marked skipped', correct: true },
        ],
        explain: (
          <>
            An empty input isn't an error. Airflow creates zero mapped instances and marks the
            task skipped — exactly the outcome a run with genuinely nothing to do should have.
          </>
        ),
      },
      Visual: S.PredictZeroLength,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Fan-out can put thousands of task instances in front of the scheduler at once. Nothing
          here has said yet how many of them actually get to run together.
        </>
      ),
      duration: 2.8,
      fig: 'thousands want to run. how many actually do?',
      predict: {
        options: [
          { label: 'All of them — the scheduler just queues whatever fits' },
          { label: 'Something has to bound it, or it starves every other Dag on the cluster', correct: true },
        ],
        explain: (
          <>
            A fan-out with no concurrency bound of its own will happily try to run every mapped
            instance at once, crowding out every other Dag sharing that scheduler and database.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
