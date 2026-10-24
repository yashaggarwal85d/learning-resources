import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Which single point in a replication pipeline counts as "acknowledged"
// genuinely decides whether a write survives the node that accepted it
// being destroyed: a subset smaller than a quorum, even a durably
// recorded one, can lose it outright, while a real quorum cannot.
const reel: Reel = {
  steps: [
    {
      title: 'A write is acknowledged once a subset smaller than a quorum has it: the leader alone. The leader is then destroyed. Does the write genuinely survive?',
      body: (
        <>
          The leader alone holding the write, then destroyed.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the acknowledgement itself guarantees it survives' },
          { label: 'No, it genuinely gets lost', correct: true },
          { label: 'Only if the leader had also written it to disk' },
        ],
        explain: (
          <>
            Genuinely lost. The acknowledgement promised nothing more.
          </>
        ),
      },
      Visual: S.SubsetPredict,
    },
    {
      title: 'Measured: genuinely lost, once the leader that alone held the acknowledged write was destroyed',
      body: (
        <>
          An acknowledgement smaller than a quorum promises nothing once the one node holding it is gone.
        </>
      ),
      duration: 3.0,
      Visual: S.SubsetReveal,
    },
    {
      title: "Now the leader durably records the write to its own disk before acknowledging, still with no replica involved. The leader is destroyed the same way. Does durably recording it on the leader alone protect the write this time?",
      body: (
        <>
          The leader's own durable record, then destroyed.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, durability on the leader alone is enough' },
          { label: 'No, it genuinely gets lost too', correct: true },
          { label: "Only if the leader's disk happens to survive separately" },
        ],
        explain: (
          <>
            Genuinely lost too. It never left the one node destroyed.
          </>
        ),
      },
      Visual: S.LeaderOnlyPredict,
    },
    {
      title: 'Measured: genuinely lost again, even though the write was durably recorded, because it never reached any node beyond the one that was destroyed',
      body: (
        <>
          The real, measured loss, despite durability.
        </>
      ),
      duration: 3.0,
      takeaway: 'Durability on one node is not durability at all, once that single node is the one that gets destroyed.',
      Visual: S.LeaderOnlyReveal,
    },
    {
      title: 'Now the write is persisted by a real quorum instead: the leader and enough replicas that any two quorums are guaranteed to overlap. The identical leader destruction happens. Does the write survive this time?',
      body: (
        <>
          A quorum of nodes, the leader destroyed.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the identical destruction still loses it' },
          { label: 'Yes, genuinely, it survives', correct: true },
          { label: "Only if the surviving replica happens to be the one that's asked" },
        ],
        explain: (
          <>
            Survives. A real quorum already held a second copy.
          </>
        ),
      },
      Visual: S.QuorumPredict,
    },
    {
      title: 'Measured: genuinely survives, on the identical leader destruction, because a real quorum already held a durable copy beyond just the leader',
      body: (
        <>
          The real, measured survival.
        </>
      ),
      duration: 3.0,
      takeaway: "A quorum's real promise: destroying any single node, even the leader, can never take every copy with it.",
      Visual: S.QuorumReveal,
    },
    {
      title: "Kafka's own documentation states the weakest of these policies directly, in its own words. Does it name a leader failing right after acknowledging on its own, before any follower replicates the record, as something that genuinely loses it?",
      body: (
        <>
          Kafka's own words on acknowledging from the leader alone, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, acknowledging from the leader alone is named as fully durable' },
          { label: 'Yes, genuinely; it names that exact loss directly', correct: true },
          { label: 'Only when the producer also disables its own retries' },
        ],
        explain: (
          <>
            Yes. The exact loss, named directly.
          </>
        ),
      },
      Visual: S.KafkaAcksPredict,
    },
    {
      title: "Measured, in Kafka's own words: should the leader fail immediately after acknowledging the record but before the followers have replicated it, then the record will be lost",
      body: (
        <>
          Kafka's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: "A real production system states this exact loss in its own documentation; it isn't a hypothetical edge case invented here.",
      Visual: S.KafkaAcksReveal,
    },
    {
      title: "Kafka's own documentation also names the real setting that turns a quorum requirement into an enforced guarantee: does it state that min.insync.replicas causes the producer to raise an exception when the in-sync set falls below it?",
      body: (
        <>
          Kafka's own words on min.insync.replicas, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.MinInsyncReveal,
    },
    {
      title: 'Recap: what an acknowledgement point actually promises',
      body: (
        <>
          Which single point in a replication pipeline counts as "acknowledged" genuinely decides whether a write survives the node that accepted it being destroyed: a subset smaller than a quorum, even a durably recorded one, can lose it outright, while a real quorum cannot.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
