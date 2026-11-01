import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// real PostgreSQL: a real crash-and-replay, a real committed-in-time contrast, a real naive-vs-
// dedup read of a duplicated batch, and a real purged-slot failure and recovery. Kafka Connect's
// own transactional exactly-once source support is quoted from KIP-618 and Confluent's own
// configuration docs, not reproduced, since running a real Connect cluster needs a JVM and a
// broker this sandbox doesn't have.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A connector pod is killed between producing five thousand change events and committing
          their offsets. On restart it emits them again, and a downstream counter that sums
          amount is now five thousand orders too high.
        </>
      ),
      duration: 4.8,
      fig: 'a connector pod is killed between producing five thousand change events and committing their offsets; on restart it emits them again, and a downstream counter that sums amount is now five thousand orders too high.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what the restart emits',
      body: (
        <>
          The offset was never committed before the crash. Does the restart skip the batch it
          already produced, or emit the identical batch again?
        </>
      ),
      duration: 2.8,
      fig: 'the offset was never committed before the crash. Does the restart skip the batch it already produced, or emit the identical batch again?',
      predict: {
        options: [
          { label: 'Skip it — Kafka Connect already remembers what it sent' },
          { label: 'Emit it again — nothing ever told the source position it had moved', correct: true },
        ],
        explain: (
          <>
            Producing and committing are two separate steps. Nothing about producing a record
            moves the source's own position — only an explicit commit does that, and this crash
            lands before one ever happens.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: two positions, two stores',
      body: (
        <>
          A connector tracks a source position, an LSN or a GTID, and a Kafka offset, and they
          are stored in different places. Kafka Connect commits the source position to its own
          compacted topic periodically, not after every record.
        </>
      ),
      duration: 4.8,
      fig: "a connector tracks a source position and a Kafka offset, stored in different places; Kafka Connect commits the source position to its own topic periodically, not per record.",
      Visual: S.RevealTwoPositions,
    },
    {
      title: 'Reveal: the crash and replay, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: peeking the decoded batch twice
          without ever advancing the slot returns the identical batch both times. Advancing right
          after producing leaves nothing for the next peek to find at all.
        </>
      ),
      duration: 4.8,
      fig: "the real run: peeking the decoded batch twice without ever advancing the slot returns the identical batch both times; advancing right after producing leaves nothing for the next peek to find.",
      takeaway: "Nothing about the batch is wrong or corrupted — it's correct twice, which is exactly the problem.",
      Visual: S.RevealCrashMeasured,
    },
    {
      title: 'Reveal: no dedup layer of its own',
      body: (
        <>
          Debezium does not implement an internal deduplication layer, and provides at-least-once
          delivery by default. While recovering from a fault, the connector might emit some
          duplicate change events.
        </>
      ),
      duration: 4.8,
      fig: 'Debezium does not implement an internal deduplication layer of its own, and provides at-least-once delivery by default; recovering from a fault can emit some duplicate change events.',
      Visual: S.RevealNoDedupLayer,
    },
    {
      title: 'Reveal: naive against dedup, measured',
      body: (
        <>
          Run against the duplicated batch from the crash above: a reader that only sums what it
          sees comes out double the true total. One that dedupes by each change's own log
          position matches the true total exactly.
        </>
      ),
      duration: 4.8,
      fig: "the real run: a reader that only sums what it sees comes out double the true total; one that dedupes by each change's own log position matches the true total exactly.",
      takeaway: "A consumer's own dedup is something it builds — never something handed to it.",
      Visual: S.RevealDedupMeasured,
    },
    {
      title: 'Reveal: exactly-once, by transaction',
      body: (
        <>
          Kafka Connect's own exactly-once source support writes records and their offsets
          atomically in one transaction, and fences out old task generations first. An existing
          cluster enables it across two rolling upgrades: preparing, then enabled.
        </>
      ),
      duration: 4.8,
      fig: 'Kafka Connect\'s own exactly-once source support writes records and offsets atomically in one transaction, and fences out old task generations; an existing cluster enables it across two rolling upgrades, preparing then enabled.',
      Visual: S.RevealExactlyOnce,
    },
    {
      title: 'Reveal: a purged position, measured',
      body: (
        <>
          Run directly against the real database: dropping a slot and then reading from its own
          name raises an error immediately. Only creating a brand-new slot lets the pipeline run
          again.
        </>
      ),
      duration: 4.8,
      fig: "the real run: dropping a slot and then reading from its own name raises an error immediately; only creating a brand-new slot lets the pipeline run again.",
      takeaway: "A purged position doesn't resume from where it was — it can only restart from scratch.",
      Visual: S.RevealPurgedMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two positions, two stores, committed on different schedules. A crash before the commit
          replays; Debezium offers no dedup of its own; a transaction can close that gap; a
          purged position closes the account entirely.
        </>
      ),
      duration: 4.8,
      fig: 'two positions, two stores, committed on different schedules; a crash before the commit replays; Debezium offers no dedup of its own; a transaction can close that gap; a purged position closes the account entirely.',
      takeaway: 'None of these four facts rescues you from the other three — each one needs its own fix.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A source connector just enabled exactly-once source support successfully. Does that
          alone guarantee the consumer reading its topic can never double-count a record?
        </>
      ),
      duration: 2.8,
      fig: 'a source connector just enabled exactly-once source support successfully. Does that alone guarantee the consumer reading its topic can never double-count a record?',
      predict: {
        options: [
          { label: 'Yes — exactly-once source support covers the whole pipeline end to end' },
          {
            label: "No — it only protects the connector's own write of records and offsets; what a consumer does downstream is still its own responsibility",
            correct: true,
          },
        ],
        explain: (
          <>
            Exactly-once source support never promised anything about a consumer. Debezium's own
            documentation says exactly this about itself: no internal dedup layer, and the
            consumer that skips building one is the one that gets fooled.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
