import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real aligned-vs-unaligned checkpoint
// duration comparison under an induced backlog, a real unaligned-snapshot-size cost, and a real
// incremental-vs-full checkpoint cost comparison across several rounds of growing state. No
// literal digits anywhere below (duration numbers are exempt); the real values live in
// scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: same backlog, two very different checkpoint times',
      body: (
        <>
          Trigger a checkpoint on a job with one badly backed-up input channel. Under one
          checkpointing mode, that channel's backlog stalls the whole checkpoint. Under the other,
          the exact same backlog barely slows it down at all.
        </>
      ),
      duration: 4.8,
      fig: 'same backlog, two checkpoint modes, two very different completion times',
      Visual: S.Hook,
    },
    {
      title: "Setup: a worker can fail, and recovery needs a consistent snapshot",
      body: (
        <>
          The last topic's runtime keeps a job running continuously, but a TaskManager can still
          fail mid-job. Recovering without silently losing or duplicating state means taking a
          consistent snapshot of the whole job graph — while it keeps running.
        </>
      ),
      duration: 4.8,
      fig: 'the runtime keeps running, but a worker can still fail',
      Visual: S.Setup,
    },
    {
      title: "Reveal: a barrier rides the stream like Chandy and Lamport's snapshot",
      body: (
        <>
          A checkpoint barrier is injected at every source and flows through the job graph just
          like a regular record. Once an operator has seen that barrier on every one of its
          inputs, it has seen everything "before" the checkpoint everywhere — the same
          global-snapshot idea Chandy and Lamport formalized, carried by the dataflow itself.
        </>
      ),
      duration: 5.2,
      fig: "a barrier rides the stream itself, the way Chandy and Lamport's snapshot does",
      Visual: S.RevealBarrier,
    },
    {
      title: 'Predict: does a backed-up channel stall the checkpoint, or get skipped?',
      body: (
        <>
          One input channel into an operator is badly backed up with buffered, unprocessed
          records when a checkpoint is triggered. Does the barrier wait behind that backlog, or
          does checkpointing just skip past it?
        </>
      ),
      duration: 2.8,
      fig: 'one input channel is badly backed up — what happens to the checkpoint?',
      predict: {
        options: [
          { label: 'The barrier skips ahead of the backlog automatically, every time' },
          { label: 'It depends entirely on which checkpointing mode is configured', correct: true },
          { label: 'The checkpoint simply fails and has to be retried from scratch' },
        ],
        explain: (
          <>
            It depends on the mode. Aligned checkpoints wait for the barrier on every input, so
            that backlog stalls the whole checkpoint. Unaligned checkpoints snapshot the moment
            the barrier is seen, backlog and all — no wait.
          </>
        ),
      },
      Visual: S.PredictBackpressureStall,
    },
    {
      title: 'Reveal: aligned checkpoints wait for every input',
      body: (
        <>
          An aligned checkpoint makes an operator wait until a barrier has arrived on every input
          channel before it snapshots and forwards the barrier onward. Under backpressure, a slow
          channel's barrier can take a long time to arrive — stalling the whole checkpoint.
        </>
      ),
      duration: 4.8,
      fig: 'aligned checkpoints wait for the barrier on every input before snapshotting',
      takeaway: "Aligned checkpointing's stall under backpressure isn't a bug — it's the cost of waiting for every input to catch up.",
      Visual: S.RevealAligned,
    },
    {
      title: 'Reveal: unaligned checkpoints snapshot on first sight',
      body: (
        <>
          An unaligned checkpoint snapshots the instant an operator sees the first barrier,
          folding in whatever is still buffered ahead of it on the other channels. The checkpoint
          finishes fast regardless of backpressure — at the cost of a larger recorded snapshot.
        </>
      ),
      duration: 4.8,
      fig: 'unaligned checkpoints snapshot on first sight, absorbing the backlog instead',
      Visual: S.RevealUnaligned,
    },
    {
      title: 'Reveal: incremental checkpoints are bounded by the delta',
      body: (
        <>
          Instead of re-snapshotting all state every time, an incremental checkpoint only writes
          what changed since the last one. A full checkpoint's cost keeps growing as state
          accumulates; an incremental checkpoint's cost stays flat, bounded by that round's delta.
        </>
      ),
      duration: 4.8,
      fig: 'an incremental checkpoint only ever pays for what changed since last time',
      takeaway: "Bounding checkpoint cost by the delta, not the whole state, is what keeps checkpointing cheap as state keeps growing forever.",
      Visual: S.RevealIncremental,
    },
    {
      title: 'Predict: is the strictest checkpointing mode always the right default?',
      body: (
        <>
          Exactly-once checkpointing is the stricter, more expensive guarantee. Is it still the
          right choice by default, or does a cheaper mode usually win instead?
        </>
      ),
      duration: 2.8,
      fig: 'is the strictest checkpointing mode always the right default?',
      predict: {
        options: [
          { label: "Yes — exactly-once is the default, for most applications", correct: true },
          { label: 'No — at-least-once is the default; exactly-once is opt-in only' },
          { label: "There's no real difference between the two in practice" },
        ],
        explain: (
          <>
            Exactly-once is the default, and the right one for most applications. At-least-once
            trades a small chance of double-processing a record on recovery for lower alignment
            overhead — a real, named trade-off, not a hidden default.
          </>
        ),
      },
      Visual: S.PredictStricterDefault,
    },
    {
      title: 'Reveal: exactly-once is the default; at-least-once is the rare exception',
      body: (
        <>
          Exactly-once mode guarantees consistent state and is what most jobs should run.
          At-least-once skips some barrier-alignment overhead at the cost of occasionally
          double-processing a record on recovery — relevant only for super-low-latency jobs.
        </>
      ),
      duration: 4.8,
      fig: 'exactly-once is the default; at-least-once trades a little risk for less overhead',
      Visual: S.RevealModes,
    },
    {
      title: 'Reveal: a checkpoint is automatic; a savepoint is deliberate',
      body: (
        <>
          A checkpoint is Flink's own periodic mechanism — created, owned, and deleted by Flink,
          without user interaction. A savepoint is taken deliberately, in a portable format,
          specifically so a job can be stopped and restarted, even with a changed job graph.
        </>
      ),
      duration: 4.8,
      fig: "a checkpoint is Flink's own; a savepoint is deliberate, portable, yours",
      takeaway: "A checkpoint and a savepoint share a mechanism, not a purpose — one recovers a failure, the other survives change.",
      Visual: S.RevealCheckpointVsSavepoint,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy barrier-sweep
          model, just now — the aligned stall under backlog, the unaligned checkpoint that barely
          slows down on the same backlog, and the incremental checkpoint cost staying flat while
          the full-checkpoint cost keeps climbing.
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
          A checkpoint barrier rides the dataflow like a record. Aligned checkpoints wait for it
          everywhere and stall under backpressure; unaligned checkpoints absorb the backlog
          instead. Incremental checkpoints bound their cost by the delta. A checkpoint is
          automatic and Flink's own; a savepoint is deliberate, portable, and yours.
        </>
      ),
      duration: 5.2,
      fig: 'a barrier, a stall or none, a bounded delta, the right mode, the right snapshot',
      Visual: S.Recap,
    },
  ],
};

export default reel;
