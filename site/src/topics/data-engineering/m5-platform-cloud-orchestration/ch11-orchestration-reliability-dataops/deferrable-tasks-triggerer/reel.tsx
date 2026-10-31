import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real experiments against a live Apache Airflow install: the same TimeDeltaSensor run
// twelve times in poke mode and twelve times deferrable, same wait, same worker cap (examples.py,
// FACT-CHECK.md); and a live threading.Lock round-tripped through Airflow's own trigger
// serializer to see what actually happens to an unpicklable argument.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A hundred sensors in poke mode, each waiting up to six hours for an upstream file. All
          hundred worker slots sit occupied, almost entirely idle.
        </>
      ),
      duration: 4.8,
      fig: "a hundred sensors, a hundred slots, almost all idle.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: worker occupancy, measured',
      body: (
        <>
          The exact same sensor, the exact same wait, run twelve times in poke mode and twelve
          times deferrable — read back from the real task logs of both runs.
        </>
      ),
      duration: 4.8,
      fig: 'same wait, same cap. poke holds the worker the whole time.',
      takeaway: "Poke mode doesn't just wait slowly. It wastes a worker the entire time it waits.",
      Visual: S.RevealWorkerOccupancy,
    },
    {
      title: 'Predict: who still holds a worker mid-wait?',
      body: (
        <>
          Ten seconds into that same fifteen-second wait, in each mode: does the task still
          occupy a worker slot, or has it already let go?
        </>
      ),
      duration: 2.8,
      fig: 'ten seconds into the wait, who still holds a worker?',
      predict: {
        options: [
          { label: 'Both modes still hold their worker at that point' },
          { label: 'Poke still holds it; deferred let go almost immediately', correct: true },
        ],
        explain: (
          <>
            A deferred task hands its worker back the moment it defers, long before the wait
            itself ends. A poke-mode task holds on until the very last check.
          </>
        ),
      },
      Visual: S.PredictMidWait,
    },
    {
      title: 'Reveal: the triggerer, scaled on its own',
      body: (
        <>
          Where that freed-up waiting actually goes: a separate process, running many lightweight
          coroutines in one place, scaled independently of workers or the scheduler.
        </>
      ),
      duration: 4.8,
      fig: 'the triggerer: one process, many coroutines, scaled on its own.',
      Visual: S.RevealTriggererScaling,
    },
    {
      title: "Predict: what if a trigger holds something that can't survive?",
      body: (
        <>
          Suppose a trigger's own setup captures something that can't be written to a database and
          read back later — a lock, a live connection. What happens when it's deferred?
        </>
      ),
      duration: 2.8,
      fig: "a trigger holds something unpicklable. what happens?",
      predict: {
        options: [
          { label: 'Airflow refuses to defer, and the task fails loudly right away' },
          { label: 'It defers fine, and the break only shows up later', correct: true },
        ],
        explain: (
          <>
            Deferring doesn't check what it's handed. The object quietly survives as the wrong
            thing, and only breaks when something later tries to use it as the real one.
          </>
        ),
      },
      Visual: S.PredictSerialization,
    },
    {
      title: 'Reveal: trigger serialization, corrupted not crashed',
      body: (
        <>
          A live lock, serialized through Airflow's own machinery and read back: no error at all,
          just the wrong type, which only fails once something tries to use it.
        </>
      ),
      duration: 4.8,
      fig: 'serialize never raised. the lock came back as a string.',
      takeaway: "Trigger serialization doesn't reject a bad argument. It quietly keeps the wrong one.",
      Visual: S.RevealSerializationCorruption,
    },
    {
      title: 'Reveal: triggerer saturation, sourced',
      body: (
        <>
          A single triggerer defaults to a capacity of a thousand triggers at once; past that,
          some simply wait their turn — Airflow's own documented limit, not run here at that scale.
        </>
      ),
      duration: 4.8,
      fig: 'default capacity: a thousand triggers per triggerer host.',
      Visual: S.RevealSaturation,
    },
    {
      title: 'Recap',
      body: (
        <>
          A pool bounds how many tasks run at once. Deferral goes further: it gives the worker
          back entirely while a task only waits — the same mechanism Airflow's own newer features
          for pausing on a human, or a missed deadline, reuse rather than reinvent.
        </>
      ),
      duration: 4.8,
      fig: 'a pool bounds how many run. the triggerer gives the worker back.',
      takeaway: 'A pool bounds how many tasks run. Deferral frees the worker itself, not just a slot.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Back to the hundred sensors from the hook, switched to deferrable mode for the same
          six-hour waits.
        </>
      ),
      duration: 2.8,
      fig: 'switch the hundred sensors to deferrable. what happens to worker-hours?',
      predict: {
        options: [
          { label: "Worker-hours barely change — the wait is the wait" },
          { label: 'Worker-hours drop by roughly the same share measured here', correct: true },
        ],
        explain: (
          <>
            The measured run showed worker time drop by well over ninety percent for an identical
            wait. The same mechanism applies at a hundred sensors as it did at twelve.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
