import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy non-idempotent-vs-idempotent batch-
// reorder comparison, and a toy key-to-partition hash check before and after a partition-count
// change. No literal digits anywhere below (duration numbers are exempt); the real values are
// shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a cancellation seen before its own creation',
      body: (
        <>
          A team adds partitions to scale out. A downstream consumer starts seeing an order's
          cancellation before its creation — for any order placed after the change. Not a
          consumer bug.
        </>
      ),
      duration: 4.8,
      fig: "an event seen out of order, for any key touched by a scale-out that already happened",
      Visual: S.Hook,
    },
    {
      title: 'Setup: lanes with no line between them',
      body: (
        <>
          The partition strip, drawn as several lanes side by side. No synchronizing line runs
          between them — each lane keeps its own order, and nothing ties one lane's order to
          another's.
        </>
      ),
      duration: 4.8,
      fig: 'several partition lanes side by side, with no synchronizing line between them',
      Visual: S.Setup,
    },
    {
      title: 'Predict: any order between two different keys?',
      body: (
        <>
          Two records with different keys almost always land in different partitions. Does Kafka
          guarantee anything at all about their relative order?
        </>
      ),
      duration: 2.8,
      fig: 'two records, two different keys, two different partitions — any guaranteed order between them?',
      predict: {
        options: [
          { label: "Yes — Kafka preserves send order across the whole topic" },
          { label: 'No — there is no defined relative order across partitions', correct: true },
          { label: 'Only if both records were sent by the same producer' },
        ],
        explain: (
          <>
            No order is guaranteed at all. Order is strictly a property of one partition; nothing
            about sharing a producer, or anything else, creates a relationship between two
            different partitions' orderings.
          </>
        ),
      },
      Visual: S.PredictCrossPartition,
    },
    {
      title: 'Reveal: order ends at the partition boundary',
      body: (
        <>
          A topic is a set of totally ordered partitions — ordered individually, with nothing
          promised between them. Two keys in two partitions simply have no relative order.
        </>
      ),
      duration: 4.8,
      fig: 'one partition, totally ordered; a second partition, totally ordered — and nothing linking the two',
      takeaway: "Order is a property of one partition alone — Kafka promises nothing about the order of records across different partitions.",
      Visual: S.RevealScope,
    },
    {
      title: 'Predict: can a retry put records out of order?',
      body: (
        <>
          A batch fails and gets retried while a later batch, sent to the same partition, succeeds
          immediately. Can that later batch end up delivered first?
        </>
      ),
      duration: 2.8,
      fig: 'a failed batch retried, racing a later batch that succeeded immediately — which lands first?',
      predict: {
        options: [
          { label: 'Yes — the later batch can land first unless idempotence is on', correct: true },
          { label: 'No — Kafka always delivers batches in send order' },
          { label: 'Only if the two batches use different keys' },
        ],
        explain: (
          <>
            Yes, exactly backwards from send order — unless idempotence is enabled, or retries
            are off entirely, a retried first batch can be accepted after a later batch that
            never needed a retry.
          </>
        ),
      },
      Visual: S.PredictRetry,
    },
    {
      title: 'Reveal: idempotence, measured',
      body: (
        <>
          A real toy run: without idempotence, that retried batch really does land second. With
          idempotence on, delivered order always matches send order.
        </>
      ),
      duration: 4.8,
      fig: 'the same two batches, delivered order measured with and without idempotence',
      takeaway: 'Idempotence turns a retry from a reordering risk into a guarantee that send order and delivered order match.',
      Visual: S.RevealIdempotence,
    },
    {
      title: 'Reveal: five in flight, by documented limit',
      body: (
        <>
          That guarantee holds for any number of in-flight requests up to five — the documented
          ceiling, because the broker only retains that many batches per producer to check
          against.
        </>
      ),
      duration: 4.8,
      fig: 'the documented ceiling on in-flight requests for the ordering guarantee to hold',
      Visual: S.RevealFiveLimit,
    },
    {
      title: 'Reveal: a key that moves, and one that stays',
      body: (
        <>
          A real toy repartition: the same key, hashed before and after a partition-count change.
          Most keys land somewhere new. A few, by chance, land exactly where they already were.
        </>
      ),
      duration: 4.8,
      fig: 'the same two keys, one moved and one unmoved, measured across a real partition-count change',
      takeaway: "Adding partitions changes the default partitioner's mapping — the same key can land somewhere new, and nothing gets redistributed.",
      Visual: S.RevealRepartition,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy ordering
          model, just now — the batch-reorder comparison and the key-to-partition hash check.
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
          Total order within one partition, nothing promised between partitions. Idempotence
          turns a retry's reordering risk into a guarantee, up to five in flight. And a key's own
          partition can quietly move the moment the partition count does.
        </>
      ),
      duration: 4.8,
      fig: 'order within a partition, none across partitions, and a key-to-partition mapping that can quietly move',
      Visual: S.Recap,
    },
  ],
};

export default reel;
