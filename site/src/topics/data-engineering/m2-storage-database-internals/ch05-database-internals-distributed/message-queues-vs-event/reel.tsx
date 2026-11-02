import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The queue's delete-on-acknowledge behavior and the log's offset-rewind-and-replay behavior are
// both reproduced for real in examples.py against a real, on-disk SQLite database. Kafka's own
// share groups (KIP-932) are sourced from the engine's own current upgrade notes and the KIP
// itself, named but not separately run, since this course's own sandbox doesn't stand up a real
// multi-broker Kafka cluster.
// No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the identical message, delivered two ways: a queue acknowledges and it's gone, a log advances a marker but keeps it",
      body: (
        <>
          The exact same message, sent through two different kinds of system. One
          acknowledges receiving it and the message is gone for good. The other advances a
          marker past it — but the message itself stays exactly where it was.
        </>
      ),
      duration: 5.6,
      fig: "the identical message, delivered two ways: a queue acknowledges and it's gone, a log advances a marker but keeps it",
      Visual: S.Hook,
    },
    {
      title: 'Predict: once a second reader needs a message the queue already delivered, can it get it back',
      body: (
        <>
          The first reader already acknowledged that message. Can a second reader, who needs it
          too, still get a copy of it back from the same system?
        </>
      ),
      duration: 2.8,
      fig: "once a second reader needs a message the queue already delivered, can it get it back?",
      predict: {
        options: [
          { label: 'From the queue, yes — the broker keeps a copy around just in case' },
          { label: 'Not from the queue — only the log genuinely still has it', correct: true },
        ],
        explain: (
          <>
            Not from the queue. Acknowledging a delivery is what tells the broker to delete it;
            once gone, no second reader can get it back. A log never deleted its own copy in the
            first place, so it's still there to hand out again.
          </>
        ),
      },
      Visual: S.PredictCanGetItBack,
    },
    {
      title: 'Reveal: a queue deletes on acknowledgement',
      body: (
        <>
          A positive acknowledgement is the real trigger for deletion, in the engine's own words.
          A negative acknowledgement instead discards, dead-letters, or requeues the same
          delivery — never both outcomes for the same message.
        </>
      ),
      duration: 5.2,
      fig: "a queue deletes on acknowledgement; a negative ack discards, dead-letters, or requeues it — never both",
      Visual: S.RevealQueueDeletes,
    },
    {
      title: 'Reveal: a log tracks a position, not a deletion',
      body: (
        <>
          A consumer's own position is just one small, rewindable number per partition. The
          message's own position in the log never changes — which is exactly what makes
          deliberately rewinding back to re-read it possible at all.
        </>
      ),
      duration: 5.6,
      fig: "a log tracks a position, not a deletion: the message's own offset never changes",
      takeaway: "A log's own offset never changes, which is what makes replaying old messages possible.",
      Visual: S.RevealLogOffset,
    },
    {
      title: 'Reveal: replay is the real dividing line',
      body: (
        <>
          A consumer that finds a bug in its own processing can fix it and re-read exactly what it
          already saw from a log. A queue's own acknowledged messages are already deleted by the
          time that bug is found — there's nothing left to re-read.
        </>
      ),
      duration: 5.2,
      fig: "replay is the real dividing line: a log lets a fixed bug re-consume the past, a queue already deleted it",
      takeaway: 'A log lets a fixed bug replay the past; a queue already deleted what it already delivered.',
      Visual: S.RevealReplayLine,
    },
    {
      title: 'Reveal: ordering and fan-out tilt the choice further',
      body: (
        <>
          A log's own partitions give real per-partition ordering, and let many independent
          readers each work through the entire stream at their own pace. A queue's own
          per-message delivery is built for one logical destination per message, not many
          independent readers at once.
        </>
      ),
      duration: 5.6,
      fig: "a log's partitions give real ordering and let many independent readers each read the whole stream",
      takeaway: "A log lets many independent readers each see everything; a queue delivers each message once.",
      Visual: S.RevealOrderingFanout,
    },
    {
      title: "Reveal: Kafka's own share groups blur the line",
      body: (
        <>
          A real, named feature, production-ready in the engine's own current release, layers
          per-record acknowledgement and delivery-attempt counting directly onto a log — without
          handing a whole partition to just one consumer, the way a classic log consumer works.
        </>
      ),
      duration: 5.6,
      fig: "Kafka's own share groups, production-ready, layer per-record acknowledgement onto a log without owning a partition",
      takeaway: "Kafka's own share groups add queue-like per-record acknowledgement directly onto a log.",
      Visual: S.RevealShareGroups,
    },
    {
      title: 'Recap',
      body: (
        <>
          A queue deletes a message the moment it's acknowledged. A log tracks a rewindable
          position instead and never touches the message itself. Replay and fan-out both favor
          the log. And a real, named feature now blurs that line by layering per-record
          acknowledgement directly onto one.
        </>
      ),
      duration: 5.6,
      fig: "a queue deletes on ack, a log tracks a rewindable offset, replay and fan-out favor the log, share groups blur the line",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A workload needs many independent teams to each process every event at their own pace,
          and one of those teams needs to re-run last week's events after fixing a bug. Which
          system fits, and why would the other one fail here?
        </>
      ),
      duration: 2.8,
      fig: "many independent teams, each at their own pace, one replaying last week after a bug fix — which system?",
      predict: {
        options: [
          { label: 'A per-message queue, with enough consumers added' },
          { label: 'An offset-based log — a queue would already have deleted what the team needs back', correct: true },
        ],
        explain: (
          <>
            An offset-based log. A queue's own acknowledged messages would already be gone by the
            time that team's bug was found, and a queue doesn't let many independent teams each
            see every event at their own pace the way a log's partitions do.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
