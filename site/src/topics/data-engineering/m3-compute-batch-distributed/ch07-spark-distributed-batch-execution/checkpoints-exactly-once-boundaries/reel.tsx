import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real local Structured Streaming queries (examples.py): a batch that finishes
// its work but loses its commit-log entry gets replayed on restart, producing a real duplicate
// through a plain, non-idempotent sink; the identical replay through a sink that deduplicates by
// the batchId foreachBatch provides produces zero duplicates; restarting a streaming aggregation
// with changed grouping keys from the same checkpoint fails before any row of the restart moves.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A stateful operator computes the right answer once. This topic is what survives a
          crash in the middle of computing it.
        </>
      ),
      duration: 4.5,
      fig: 'computed once, correctly. What survives a crash partway through?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: kill a batch mid-run, restart from checkpoint',
      body: (
        <>
          Measured: kill a batch after its work finishes but before its commit is recorded, then
          restart from the same checkpoint. No row lost, none doubled -- yet.
        </>
      ),
      duration: 4.8,
      fig: 'killed after the work, before the commit. Restarted clean.',
      Visual: S.RevealRestartClean,
    },
    {
      title: 'Predict: an at-least-once sink, restarted the same way. Still exact?',
      body: (
        <>
          The same crash and restart, but writing to a sink that only promises at-least-once.
          Does the end-to-end result stay exactly-once, or not?
        </>
      ),
      duration: 2.8,
      fig: 'the sink only promises at-least-once. Still exact, end to end?',
      predict: {
        options: [
          { label: "Yes — the checkpoint's own guarantee covers the sink too" },
          { label: "No — the sink's own replay produces a duplicate", correct: true },
        ],
        explain: (
          <>
            The checkpoint only guarantees Spark replays the right batch. What that sink does
            with a replay is entirely its own.
          </>
        ),
      },
      Visual: S.PredictAtLeastOnceSink,
    },
    {
      title: 'Reveal: no -- a duplicate survives, in the sink alone',
      body: (
        <>
          Measured: one batch's row now appears twice in the sink's own output. The checkpoint
          replayed the exact right batch -- the sink just wrote it again.
        </>
      ),
      duration: 4.8,
      fig: "the checkpoint replayed correctly. The sink wrote it twice anyway.",
      Visual: S.RevealDuplicateSurvives,
    },
    {
      title: "Elaborate: Spark's guarantee stops at its own boundary",
      body: (
        <>
          Offsets, state and the commit log are Spark's own job, and Spark gets them right.
          What a replayed batch does once it reaches the sink is the sink's job alone.
        </>
      ),
      duration: 5,
      fig: "Spark's own job ends at the sink's front door.",
      takeaway: "Exactly-once end to end needs Spark's own guarantee plus a sink that can survive being handed the same batch twice.",
      Visual: S.ElaborateSparkBoundary,
    },
    {
      title: 'Predict: the same sink, now deduplicating by batchId. Exact now?',
      body: (
        <>
          The identical sink, but checking the batchId foreachBatch hands it before writing
          anything. Does the same crash and restart stay exactly-once this time?
        </>
      ),
      duration: 2.8,
      fig: 'the sink now checks batchId first. Exact, this time?',
      predict: {
        options: [
          { label: 'Yes — the same batchId never gets written twice', correct: true },
          { label: "No — batchId doesn't survive a restart either" },
        ],
        explain: (
          <>
            Zero duplicates. Checking a batchId that's already been seen is enough to make this
            particular sink safe against the exact replay that broke the last one.
          </>
        ),
      },
      Visual: S.PredictDedupByBatchId,
    },
    {
      title: 'Reveal: yes -- zero duplicates, same crash, same restart',
      body: (
        <>
          Measured: the identical crash and restart, but this time the sink's own batchId check
          catches the replay before it writes anything twice.
        </>
      ),
      duration: 4.8,
      fig: 'same crash, same restart -- zero duplicates this time.',
      Visual: S.RevealZeroDuplicates,
    },
    {
      title: "Elaborate: batchId is the same number, every time it's replayed",
      body: (
        <>
          A replayed batch gets the identical batchId it had the first time -- never a new one.
          That determinism is exactly what a batchId-keyed dedup check depends on.
        </>
      ),
      duration: 5,
      fig: 'the same batch always gets the same number back.',
      takeaway: "A batchId that's deterministic across every replay is what makes checking it, rather than trusting the write, enough for exactly-once.",
      Visual: S.ElaborateBatchIdDeterministic,
    },
    {
      title: 'Reveal: not every restart survives -- changed grouping keys fail first',
      body: (
        <>
          Measured: swap a streaming aggregation's own grouping keys and restart from the same
          checkpoint. It fails immediately, before a single row of the restart is processed.
        </>
      ),
      duration: 5,
      fig: 'changed grouping keys: restart fails before any row moves.',
      Visual: S.RevealIncompatibleChange,
    },
    {
      title: 'Recap',
      body: (
        <>
          Offsets, state and the commit log are Spark's own guarantee, and that guarantee has a
          real boundary: a replay-safe sink, a replayable source, and a checkpoint whose query
          hasn't changed underneath it.
        </>
      ),
      duration: 5,
      fig: "Spark's own guarantee, and exactly where it stops.",
      takeaway: "Spark's checkpoint guarantees the right batch gets replayed; it never guarantees the sink or the query stayed the same.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
