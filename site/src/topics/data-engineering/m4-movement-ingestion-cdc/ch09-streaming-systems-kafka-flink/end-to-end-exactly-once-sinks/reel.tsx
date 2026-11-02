import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy two-phase-commit sink that really
// survives a crash between pre-commit and checkpoint-complete with no loss and no duplicate,
// a toy idempotent-upsert sink that really collapses a retry into one row, and a toy
// timeout-vs-interval model that really loses every checkpoint's write when misconfigured. No
// literal digits anywhere below (duration numbers are exempt); real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a timeout quietly shorter than the checkpoint',
      body: (
        <>
          A sink's transaction timeout is set shorter than the job's checkpoint interval. Every
          checkpoint's staged write silently expires before it can ever be committed.
        </>
      ),
      duration: 4.8,
      fig: "a transaction timeout shorter than the checkpoint interval, staged writes expiring unseen",
      Visual: S.Hook,
    },
    {
      title: 'Setup: a guarantee that stops at an edge',
      body: (
        <>
          A Kafka transaction keeps everything inside Kafka consistent. The moment the sink is a
          database, a file, or an API, that mechanism can't reach it at all.
        </>
      ),
      duration: 4.8,
      fig: "a Kafka transaction stops at Kafka's own edge; a non-Kafka sink needs its own mechanism",
      Visual: S.Setup,
    },
    {
      title: 'Predict: what happens to a write caught mid-crash?',
      body: (
        <>
          A sink pre-commits a write, then the job crashes before the checkpoint that pre-
          committed it is ever confirmed complete. Is that write lost, duplicated, or neither?
        </>
      ),
      duration: 2.8,
      fig: 'a crash lands right after pre-commit, before the checkpoint is confirmed complete',
      predict: {
        options: [
          { label: 'Lost — the sink never hears the checkpoint finished' },
          { label: 'Duplicated — recovery replays it from the start' },
          { label: 'Neither — recovery finishes the commit it already staged', correct: true },
        ],
        explain: (
          <>
            Neither. The staged write is already durable, just not yet visible. Recovery simply
            confirms the checkpoint and finishes the commit it had already prepared.
          </>
        ),
      },
      Visual: S.PredictCrash,
    },
    {
      title: 'Reveal: durable first, visible only once confirmed',
      body: (
        <>
          A pre-committed write survives any crash before commit. Recovery finds it already
          staged and finishes committing it exactly once — no loss, no duplicate.
        </>
      ),
      duration: 4.8,
      fig: 'the staged write survives the crash and commits once recovery confirms the checkpoint',
      takeaway: 'A staged write is durable the moment it is pre-committed — a crash before commit loses nothing and duplicates nothing.',
      Visual: S.RevealCrash,
    },
    {
      title: 'Reveal: the other path, no transaction at all',
      body: (
        <>
          Instead of two-phase commit, a sink keyed by a deterministic id simply overwrites the
          same row on a retry. A repeated write becomes harmless by construction.
        </>
      ),
      duration: 4.8,
      fig: 'a retried write lands on the same row instead of a new one, keyed by a deterministic id',
      Visual: S.RevealUpsert,
    },
    {
      title: "Reveal: the offset rides inside the same unit",
      body: (
        <>
          Storing an offset separately from its output reopens the exact crash window this
          chapter already closed once — committing both together closes it again, here.
        </>
      ),
      duration: 4.8,
      fig: 'an offset stored separately from the output reopens a crash window at the sink boundary',
      takeaway: "An offset stored apart from its output is just the earlier crash window, relocated to wherever that offset is kept.",
      Visual: S.RevealOffsetAtomicity,
    },
    {
      title: 'Predict: name a way this guarantee quietly fails',
      body: (
        <>
          Three real, documented situations make this exactly-once effect stop being true, even
          with every mechanism above correctly in place. Name one.
        </>
      ),
      duration: 2.8,
      fig: 'three real ways this guarantee quietly stops being true',
      predict: {
        options: [
          { label: 'A non-deterministic retry, an external side effect, or a short timeout', correct: true },
          { label: 'Running more than one sink in the same job' },
          { label: 'Using a checkpoint interval under one minute' },
        ],
        explain: (
          <>
            All three are real, independent failure modes — each breaks a different part of the
            mechanism, not a variation on the same cause.
          </>
        ),
      },
      Visual: S.PredictBreaks,
    },
    {
      title: 'Reveal: three different ways it breaks',
      body: (
        <>
          A non-deterministic retry isn't the same write twice. A side effect can't be rolled
          back by anything. A timeout shorter than the checkpoint interval silently expires it.
        </>
      ),
      duration: 4.8,
      fig: "non-determinism, a side effect, and a short transaction timeout each break it a different way",
      takeaway: 'A non-deterministic retry, an irreversible side effect, and a short timeout each defeat a different part of this guarantee.',
      Visual: S.RevealBreaks,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy sink
          models, just now — the crash recovery, the upsert collapse, and the lost writes.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two-phase commit stages, then finalizes. Idempotent upsert overwrites. Offsets ride
          inside the same unit as output. And three specific things can still break all of it.
        </>
      ),
      duration: 4.8,
      fig: 'two-phase commit, idempotent upsert, atomic offsets, and three ways the guarantee breaks',
      Visual: S.Recap,
    },
  ],
};

export default reel;
