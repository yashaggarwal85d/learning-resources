import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 sessions (examples.py), five deliberately broken jobs,
// read back purely from the REST API that mirrors the Spark UI's own stage/task/executor
// tables: a groupByKey skew where one task runs hundreds of times longer than the rest in the same stage; a
// skewed sort whose memory and disk spill land on exactly one task; object-heavy RDD code that
// pays real JVM GC time where the equivalent DataFrame job pays none; 2,000 tiny partitions
// whose per-task scheduler delay exceeds their own CPU time; and driver-side post-processing
// that leaves every executor idle for a stretch no stage accounts for.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Five jobs are all slow. From a distance they look the same. Does the Spark UI tell
          them apart, or is "slow" as specific as it gets?
        </>
      ),
      duration: 4.5,
      fig: 'five slow jobs, one symptom. Does the UI tell the causes apart?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: skew -- one task dwarfs the rest',
      body: (
        <>
          Measured: in an eight-task stage over a lopsided key, one task runs hundreds of times longer
          than the others in the same stage.
        </>
      ),
      duration: 4.8,
      fig: 'one task in eight runs hundreds of times longer, same stage, same job.',
      Visual: S.RevealSkew,
    },
    {
      title: "Predict: what will the stage's own task table show?",
      body: (
        <>
          Open that stage's own task-duration table. Will it show one obvious outlier, or will
          the imbalance be too subtle to spot at a glance?
        </>
      ),
      duration: 2.8,
      fig: 'the stage task table: one obvious outlier, or too subtle to see?',
      predict: {
        options: [
          { label: 'One unmistakable outlier -- min, median, and max tell it apart', correct: true },
          { label: 'Too subtle -- the imbalance only shows up in aggregate stats' },
        ],
        explain: (
          <>
            A gap this large between one task and the rest isn't subtle in any view: the stage's own
            min/median/max already names the one task responsible.
          </>
        ),
      },
      Visual: S.PredictTaskTable,
    },
    {
      title: 'Reveal: the table confirms it',
      body: (
        <>
          Measured: the stage's own min and median sit close together, and the max is one huge
          outlier -- the table alone identifies the skewed task.
        </>
      ),
      duration: 4.8,
      fig: "min and median agree; max is one huge outlier.",
      Visual: S.RevealTableConfirms,
    },
    {
      title: "Elaborate: skew's signature is within one stage",
      body: (
        <>
          Skew shows up as uneven task durations inside a single stage, not as one stage being
          slower than another -- the culprit is how the data was partitioned, not the hardware.
        </>
      ),
      duration: 5,
      fig: "skew's signature: one stage, uneven durations, not slow hardware.",
      takeaway: 'Skew is uneven task durations within one stage; a slow stage overall points somewhere else entirely.',
      Visual: S.ElaborateSkewSignature,
    },
    {
      title: 'Predict: a second job shows the same lopsided shape. Same cause?',
      body: (
        <>
          A second broken job shows the exact same shape: one task stands out, the rest are
          uniform. Is this skew again, or something else wearing the same costume?
        </>
      ),
      duration: 2.8,
      fig: 'same lopsided shape, a different job. Same cause, or a different one?',
      predict: {
        options: [
          { label: 'Still skew -- the shape alone is the diagnosis' },
          { label: "A different cause -- the shape repeats, but the task-level columns differ", correct: true },
        ],
        explain: (
          <>
            The same lopsided shape can come from spill, GC, or skew -- the shape alone never
            settles it; the task's own metric columns (spill bytes, GC time) do.
          </>
        ),
      },
      Visual: S.PredictSpillShape,
    },
    {
      title: 'Reveal: spill and GC -- the task-level columns decide',
      body: (
        <>
          Measured: one job's lopsided task carries real spill bytes, memory and disk alike; a
          second, unrelated job carries real GC time where its DataFrame equivalent carries
          none.
        </>
      ),
      duration: 5,
      fig: 'spill on one task; GC time nonzero in one job, zero in its twin.',
      Visual: S.RevealSpillAndGC,
    },
    {
      title: 'Reveal: small files and a driver bottleneck',
      body: (
        <>
          Measured: 2,000 tiny tasks whose own scheduling overhead outweighs their real CPU
          time, and a separate stretch of wall-clock time where every executor sits idle.
        </>
      ),
      duration: 5,
      fig: '2,000 tasks, overhead over work; idle executors, no stage to blame.',
      Visual: S.RevealSmallFilesAndDriver,
    },
    {
      title: 'Elaborate: a fixed triage order, not five separate tools',
      body: (
        <>
          Reading it in order collapses five symptoms into one method: task-duration spread,
          then the task's own spill and GC columns, then task count, then the event timeline's
          idle gaps.
        </>
      ),
      duration: 5,
      fig: 'one fixed order replaces five separate, one-off investigations.',
      takeaway: 'A fixed reading order turns five separate symptoms into one repeatable method, not five one-off investigations.',
      Visual: S.ElaborateTriageOrder,
    },
    {
      title: 'Recap',
      body: (
        <>
          Skew lives inside one stage's own task spread; spill and GC live in a task's own
          metric columns; small files and driver bottlenecks live in task count and idle gaps.
        </>
      ),
      duration: 5,
      fig: 'one triage order: task spread, metric columns, task count, idle gaps.',
      takeaway: 'Every cause leaves its own trace in one place; naming it means reading that trace, not guessing from the symptom.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
