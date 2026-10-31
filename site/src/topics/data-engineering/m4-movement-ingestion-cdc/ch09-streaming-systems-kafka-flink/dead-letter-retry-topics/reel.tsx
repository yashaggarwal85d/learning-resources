import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy in-place retry that really blocks cold
// at a poison record, a toy non-blocking retry-topic flow that really keeps the main partition
// moving, and a real DLQ record carrying real metadata fields. No literal digits anywhere below
// (duration numbers are exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one bad record, an entire frozen queue',
      body: (
        <>
          A single malformed record, retried in place, blocks every record behind it in the same
          partition — a growing backlog that never clears on its own.
        </>
      ),
      duration: 4.8,
      fig: 'one malformed record blocks every record behind it, retried in place, forever',
      Visual: S.Hook,
    },
    {
      title: 'Setup: when eventually never comes',
      body: (
        <>
          Deduplication assumes a record can eventually be processed. Some records never can —
          and in a system that orders only within a partition, retrying one in place blocks
          everything behind it.
        </>
      ),
      duration: 4.8,
      fig: "some records never can be processed; retrying one in place blocks everything ordered behind it",
      Visual: S.Setup,
    },
    {
      title: 'Predict: divert it instead of retrying in place',
      body: (
        <>
          Instead of retrying the poison record where it sits, it gets republished to a separate
          retry topic. Does the main partition keep moving?
        </>
      ),
      duration: 2.8,
      fig: 'the poison record is diverted to a separate retry topic instead of retried in place',
      predict: {
        options: [
          { label: 'No — the main partition still waits for the retry topic' },
          { label: 'Yes — the main partition processes everything behind it right away', correct: true },
          { label: 'Only if the retry topic is empty' },
        ],
        explain: (
          <>
            Yes. Once the poison record is routed elsewhere, nothing in the main partition is
            waiting on it anymore — the rest simply keeps flowing.
          </>
        ),
      },
      Visual: S.PredictDivert,
    },
    {
      title: 'Reveal: the partition stops waiting',
      body: (
        <>
          Diverted to a retry topic, the poison record no longer sits in anyone's way. Every
          record behind it in the main partition processes immediately.
        </>
      ),
      duration: 4.8,
      fig: 'the main flow processes everything behind the poison record immediately',
      Visual: S.RevealDivert,
    },
    {
      title: 'Reveal: the cost, named outright',
      body: (
        <>
          A diverted record is not guaranteed to reach its target in its original sequence — the
          retry path is slower, so later records routinely arrive first.
        </>
      ),
      duration: 4.8,
      fig: 'not guaranteed to be processed in the same sequence — the named, accepted cost',
      takeaway: "Diverting a poison record off the partition fixes the block by accepting a different, named cost: arriving out of order.",
      Visual: S.RevealOrdering,
    },
    {
      title: 'Predict: every tier exhausted',
      body: (
        <>
          A record keeps failing through tiered retry lanes of increasing delay, and none of them
          ever succeed. What happens to it?
        </>
      ),
      duration: 2.8,
      fig: 'a record keeps failing through every tiered retry lane — what happens to it?',
      predict: {
        options: [
          { label: 'It loops through the tiers indefinitely' },
          { label: 'It is silently dropped' },
          { label: 'It lands in a dead-letter topic, with enough to diagnose it', correct: true },
        ],
        explain: (
          <>
            Neither an infinite loop nor silent loss. It lands in a dead-letter topic — a bounded,
            observable endpoint carrying the original payload and diagnostic metadata.
          </>
        ),
      },
      Visual: S.PredictTiers,
    },
    {
      title: 'Reveal: a bounded, diagnosable endpoint',
      body: (
        <>
          A record that exhausts every retry lane lands in a dead-letter topic, carrying its
          original payload plus metadata — enough for an operator to diagnose and, if fixed,
          replay it.
        </>
      ),
      duration: 4.8,
      fig: 'a separate topic, carrying the original payload plus metadata, for diagnosis and replay',
      takeaway: "A dead-letter record only earns its name if an operator can actually diagnose and replay it from what it carries.",
      Visual: S.RevealDLQ,
    },
    {
      title: 'Reveal: two current, named mechanisms',
      body: (
        <>
          Kafka Connect's own `errors.tolerance` setting controls whether a connector dead-letters
          a bad record. Kafka Streams gained its own DLQ handler support in a recent release.
        </>
      ),
      duration: 4.8,
      fig: "two current, named mechanisms: Connect's error tolerance, and Streams' own DLQ handler",
      takeaway: "Dead-lettering is a first-class, named mechanism in both Kafka Connect and Kafka Streams, not a bolted-on workaround.",
      Visual: S.RevealTooling,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy models,
          just now — the cold block, the flow that kept moving, and a real DLQ record.
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
          A poison record can no longer block a partition. Tiered retry buys that back at the
          cost of order. And a dead-letter topic is the bounded, diagnosable end of the line.
        </>
      ),
      duration: 4.8,
      fig: 'poison records, non-blocking tiers, the ordering cost, and DLQ metadata and tooling',
      Visual: S.Recap,
    },
  ],
};

export default reel;
