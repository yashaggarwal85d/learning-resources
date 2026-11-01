import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 Structured Streaming queries (examples.py): every batch
// writes one offset-log entry and one commit-log entry, the commit log never running ahead of
// the offset log; even with the trigger interval forced to zero and almost no data, steady-state
// batches still take a measurable floor, a few hundred milliseconds, for planning and
// committing alone; and a fixed processingTime trigger spaces consecutive batch starts at the
// configured interval, even though each batch's own execution time is far shorter.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every topic so far ran one plan once, against data that already existed. This topic
          runs the same kind of plan over and over, once per trigger, against data still
          arriving.
        </>
      ),
      duration: 4.5,
      fig: 'one plan, run once, becomes one plan run over and over.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one trigger, one incremental batch',
      body: (
        <>
          Measured: a running query's own checkpoint directory gets a new offset-log entry and
          a new commit-log entry, one pair per batch, every single trigger.
        </>
      ),
      duration: 4.8,
      fig: 'one offset entry, one commit entry, written per batch.',
      Visual: S.RevealOneTriggerOneBatch,
    },
    {
      title: 'Predict: with a zero-second interval and almost no data, how fast?',
      body: (
        <>
          Force the trigger interval down to zero seconds, and feed it almost no data. How fast
          can a single batch actually run?
        </>
      ),
      duration: 2.8,
      fig: 'zero-second interval, almost no data. How fast can one batch run?',
      predict: {
        options: [
          { label: "Down to single-digit milliseconds — there's almost nothing to do" },
          { label: 'Still a real floor of a few hundred milliseconds', correct: true },
        ],
        explain: (
          <>
            Planning and committing a batch costs something real, independent of how much data
            is actually in it — that cost doesn't disappear just because the batch is tiny.
          </>
        ),
      },
      Visual: S.PredictLatencyFloor,
    },
    {
      title: 'Reveal: not single-digit milliseconds',
      body: (
        <>
          Measured: steady-state batches hold at a real floor, a few hundred milliseconds, no
          matter how close to empty each batch's own data gets.
        </>
      ),
      duration: 4.8,
      fig: 'a real floor, hundreds of milliseconds, independent of row count.',
      Visual: S.RevealNotMilliseconds,
    },
    {
      title: "Elaborate: the floor is planning, not data",
      body: (
        <>
          That floor is the cost of planning and committing one more batch — not the cost of
          the rows inside it. An empty batch still pays almost the whole price.
        </>
      ),
      duration: 5,
      fig: 'planning and committing cost something, regardless of row count.',
      takeaway: 'Micro-batch latency floors on planning and committing a batch, not on how much data that batch holds.',
      Visual: S.ElaborateFloorIsPlanning,
    },
    {
      title: "Predict: a three-second trigger, sub-second batches. Back-to-back?",
      body: (
        <>
          Set a fixed three-second trigger, but each batch itself finishes in well under a
          second. Do consecutive batches start back-to-back, or three seconds apart?
        </>
      ),
      duration: 2.8,
      fig: 'sub-second batches, a three-second trigger. Back-to-back, or spaced apart?',
      predict: {
        options: [
          { label: 'Back-to-back — no reason to wait once the batch is done' },
          { label: 'Three seconds apart — the engine waits for the interval', correct: true },
        ],
        explain: (
          <>
            A fixed interval means waiting for the clock, not just for the previous batch to
            finish — the engine idles out the rest of the interval on purpose.
          </>
        ),
      },
      Visual: S.PredictBackToBack,
    },
    {
      title: 'Reveal: three seconds apart, every time',
      body: (
        <>
          Measured: consecutive batches start almost exactly three seconds apart, even though
          each one's own execution finishes in a small fraction of that time.
        </>
      ),
      duration: 4.8,
      fig: 'batch starts land three seconds apart, exactly as configured.',
      Visual: S.RevealSpacedApart,
    },
    {
      title: "Elaborate: a log that's replayed, never guessed",
      body: (
        <>
          The commit log never runs ahead of the offset log. Resuming after a crash means
          replaying exactly what was checkpointed — nothing about an unfinished batch is ever
          assumed.
        </>
      ),
      duration: 5,
      fig: 'the commit log never outruns the offset log; resuming replays, never guesses.',
      takeaway: 'The commit log never runs ahead of the offset log, so a crash recovery replays checkpointed state instead of guessing.',
      Visual: S.ElaborateLogsNotGuess,
    },
    {
      title: 'Reveal: the trigger types, side by side',
      body: (
        <>
          A fixed interval waits for the clock before starting the next batch. Available-now
          instead runs batch after batch until the backlog is empty, then stops on its own.
        </>
      ),
      duration: 5,
      fig: 'a fixed wait versus running until the backlog is empty.',
      Visual: S.RevealTriggerTypes,
    },
    {
      title: 'Recap',
      body: (
        <>
          One plan, run per trigger: a real latency floor from planning, a real wait for the
          clock, and a real log replayed rather than guessed.
        </>
      ),
      duration: 5,
      fig: 'one plan, one trigger: a real floor, a real wait, a real log.',
      takeaway: 'A micro-batch engine trades true low latency for a real, auditable log of exactly what ran and when.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
