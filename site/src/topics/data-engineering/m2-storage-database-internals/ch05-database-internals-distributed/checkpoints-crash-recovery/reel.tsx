import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py): checkpointing every
// round of ten identical update rounds against a two-thousand-row table measures far more
// full-page images and a far smaller live replay gap than checkpointing only once up front
// before the same ten rounds does — the documented checkpoint-frequency trade-off as a real,
// repeatable, order-of-magnitude pair of numbers, not an abstraction. The ARIES
// three-pass recovery structure and the point-in-time-recovery/replication/logical-decoding
// substrate claims are named and sourced directly from Postgres's own documentation (and ARIES's
// own paper, cited without a block quote since its only available copies are badly OCR-scrambled)
// rather than reproduced, since this sandbox runs no second engine and no second node. No
// literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a crash doesn't replay forever — something marks where recovery actually starts",
      body: (
        <>
          The last topic established that every committed change is durable in the log before
          the page is. But a log that's never trimmed would mean a crash replays the engine's
          entire history. Something marks a far more recent point to start from instead.
        </>
      ),
      duration: 4.8,
      fig: "a crash doesn't replay a database's entire history — something marks a far more recent, trustworthy point to start recovery from. What's that something?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the redo record',
      body: (
        <>
          That point is a checkpoint's own redo record, read directly off this sandbox's own
          cluster. The live gap behind it — the distance to right now — is exactly how much a
          crash this instant would force a replay of.
        </>
      ),
      duration: 4.8,
      fig: "a checkpoint names an exact position recovery would resume from — what does the live gap behind that position actually measure?",
      Visual: S.RevealRedoLsn,
    },
    {
      title: 'Reveal: the frequency trade-off',
      body: (
        <>
          Checkpoint more often, and there's genuinely less to redo after a crash. But the same
          documentation names a real cost: with full-page writes on, checkpointing more often
          means more write amplification — a full copy of a page logged more often than the
          change itself would need on its own.
        </>
      ),
      duration: 4.8,
      fig: "checkpoint more often, and recovery is faster — but what's the real, documented cost that comes with it?",
      takeaway: 'A smaller checkpoint interval shortens replay — but logs a full page copy more often.',
      Visual: S.RevealFrequencyTradeoff,
    },
    {
      title: 'Predict: torn page',
      body: (
        <>
          A disk write isn't one atomic step; it lands in smaller physical pieces. If a crash
          happens mid-write, why would logging the entire page be needed, rather than just the
          change that was being made?
        </>
      ),
      duration: 2.8,
      fig: "why log the whole page instead of just the change — what could go wrong with a delta alone?",
      predict: {
        options: [
          { label: "The log format doesn't support partial-page differences" },
          { label: 'A crash mid-write can leave a page half old, half new, and only a full before/after copy can repair that', correct: true },
          { label: 'Full pages compress better than differences do' },
        ],
        explain: (
          <>
            A page is written in smaller physical pieces, and a crash partway through can leave
            some of those pieces landed and others not — a torn page, part old and part new.
            Applying an ordinary delta to that mixed-up state could still produce garbage, so only
            a full, known-good copy of the page can safely repair it.
          </>
        ),
      },
      Visual: S.PredictTornPage,
    },
    {
      title: 'Reveal: the real measurement, frequent',
      body: (
        <>
          Checkpointing every single round of ten identical update rounds, measured directly:
          far more full-page images, and a real replay gap kept very small.
        </>
      ),
      duration: 4.8,
      fig: 'checkpointing every round, measured directly: how many full-page images, how small a replay gap?',
      takeaway: 'Checkpointing every round logs far more full-page images, but keeps the live replay gap small.',
      Visual: S.RevealFrequentMeasurement,
    },
    {
      title: 'Reveal: the real measurement, infrequent',
      body: (
        <>
          The identical workload, checkpointed only once before those same ten rounds: far fewer
          full-page images, and a real replay gap that's grown far larger.
        </>
      ),
      duration: 4.8,
      fig: 'the same workload, checkpointed once instead of ten times: how few full-page images, how much larger a gap?',
      takeaway: 'Checkpointing once logs far fewer full-page images, but leaves a far larger replay gap behind.',
      Visual: S.RevealInfrequentMeasurement,
    },
    {
      title: "Reveal: redo-only vs. ARIES's three passes",
      body: (
        <>
          Postgres's own documentation describes crash recovery as a single redo pass. ARIES,
          named directly from its own paper, defines a third, separate pass that physically
          undoes the transactions still in progress when the crash happened.
        </>
      ),
      duration: 4.8,
      fig: "Postgres describes one recovery pass. ARIES describes three. What does the third one actually do, and why doesn't Postgres need it?",
      Visual: S.RevealRedoVsUndo,
    },
    {
      title: 'Reveal: the substrate reused later',
      body: (
        <>
          The identical WAL this topic measures is reused three more times: stop replay early for
          point-in-time recovery, ship the same bytes continuously for physical replication, or
          decode the same bytes into row changes for logical decoding.
        </>
      ),
      duration: 4.8,
      fig: 'three features that sound unrelated turn out to reuse the exact same log — which three, and how?',
      Visual: S.RevealSubstrate,
    },
    {
      title: 'Recap',
      body: (
        <>
          A checkpoint's redo record, the real starting point for recovery. A real, measured
          trade-off: almost twenty times more full-page images in one direction, almost seven
          times more replay distance in the other. Postgres redoes once; a row's own status
          decides visibility, with no separate undo pass. And the same WAL reused for
          point-in-time recovery, replication, and logical decoding.
        </>
      ),
      duration: 4.8,
      fig: "a checkpoint's redo record, a real measured trade-off in both directions, redo-only recovery, and the same WAL reused three more times",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A system claims instant crash recovery no matter how long it's been running, with no
          checkpoint mentioned at all. Before believing it, what would have to be true?
        </>
      ),
      duration: 2.8,
      fig: "a system claims instant crash recovery however long it's been running, with no checkpoint mentioned — what's missing from that claim?",
      predict: {
        options: [
          { label: 'Nothing — a modern engine can redo an arbitrarily long history instantly' },
          { label: 'It must be bounding replay distance somehow — most likely its own version of a checkpoint', correct: true },
          { label: "It must be using an undo pass instead of a redo pass" },
        ],
        explain: (
          <>
            Any crash-recovery claim that doesn't scale with uptime has to be capping how far
            back recovery looks — that's exactly what a checkpoint's redo record does. A claim
            of instant recovery with no stated bound is either marketing or hiding a
            checkpoint-equivalent under another name. Undo versus redo-only is a different axis
            entirely; neither one bounds replay distance by itself.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
