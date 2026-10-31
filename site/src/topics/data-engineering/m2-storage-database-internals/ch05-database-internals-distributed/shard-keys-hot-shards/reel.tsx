import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No live lab of its own (CHAPTER.md): five real simulations in examples.py -- a celebrity key
// making a hot shard despite high overall cardinality, salting fixing it, the real fan-out cost
// difference between a local and a global secondary index, and the real correctness cost of
// resharding without a write-pause window.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two thousand distinct user accounts, hashed onto ten shards. By the usual advice, that's
          plenty of cardinality to spread load evenly. One shard still ends up doing almost half
          the work.
        </>
      ),
      duration: 4.8,
      fig: "two thousand users, ten shards, plenty of cardinality. One shard still drowns.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does high cardinality alone guarantee even load?',
      body: (
        <>
          The shard key has thousands of distinct values, uniformly hashed. Does that alone
          guarantee the load lands evenly across shards?
        </>
      ),
      duration: 2.8,
      fig: 'thousands of distinct values, uniformly hashed. Does load land evenly?',
      predict: {
        options: [
          { label: "Yes — enough distinct values always spreads the load evenly" },
          { label: "No — one celebrity key can still dominate whichever shard it hashes to", correct: true },
        ],
        explain: (
          <>
            Cardinality only guarantees the keys spread evenly — it says nothing about how much
            traffic each key actually drives. One celebrity account can out-traffic a thousand
            ordinary ones combined.
          </>
        ),
      },
      Visual: S.PredictCardinalityAlone,
    },
    {
      title: 'Reveal: cardinality alone, measured',
      body: (
        <>
          A real Zipf-shaped traffic split, hashed by user ID: the celebrity's own shard alone
          carries far more than its fair share, even though every one of two thousand users
          landed on a shard uniformly at random.
        </>
      ),
      duration: 4.8,
      fig: "the celebrity's own shard: nearly half the traffic, by itself.",
      Visual: S.RevealCardinalityMeasured,
    },
    {
      title: 'Reveal: salting the celebrity key',
      body: (
        <>
          Split only that one key into several salted sub-keys — same user, several hash
          targets — and its own traffic spreads across shards without moving anyone else's data.
        </>
      ),
      duration: 4.8,
      fig: 'one key, several salted sub-keys. Its own traffic spreads out.',
      takeaway: "Salting fixes the one hot key — it doesn't touch the shard scheme everyone else's data lives under.",
      Visual: S.RevealSalting,
    },
    {
      title: 'Reveal: secondary indexes across shards',
      body: (
        <>
          A local index lives inside its own shard, so a query without the partition key still
          has to ask every shard. A global index re-partitions by its own key, so the same query
          reaches only the partitions that actually matter.
        </>
      ),
      duration: 5.2,
      fig: 'local: ask every shard. Global: ask only the ones that matter.',
      takeaway: "A local index only helps with the partition key in hand — otherwise it fans out like no index exists.",
      Visual: S.RevealSecondaryIndexes,
    },
    {
      title: 'Predict: what happens without a write-pause window during a split?',
      body: (
        <>
          A shard splits its key range into two while writes keep arriving. Skip the brief pause
          where every writer agrees on the new boundary. What happens to writes in flight?
        </>
      ),
      duration: 2.8,
      fig: 'a split happens; writes keep arriving. No pause. Then what?',
      predict: {
        options: [
          { label: "Nothing — the split is a background operation and writes are unaffected" },
          { label: "A real fraction of in-flight writes get routed by the old boundary and land on the wrong new shard", correct: true },
        ],
        explain: (
          <>
            A write routed by a client that hasn't yet seen the new boundary still believes the
            old, single shard owns the key — some of those keys now belong to the other half of
            the split, and the write lands in the wrong place.
          </>
        ),
      },
      Visual: S.PredictPauseWindow,
    },
    {
      title: 'Reveal: the pause window, measured',
      body: (
        <>
          Without a pause, over half of a batch of in-flight writes land on the wrong one of the
          two new shards. With a brief pause — every writer waiting for the new boundary before
          resuming — none do.
        </>
      ),
      duration: 4.8,
      fig: 'no pause: half the writes misroute. A brief pause: zero do.',
      takeaway: "The real cost of moving data isn't the copy — it's the brief pause every correct cutover must pay for.",
      Visual: S.RevealPauseMeasured,
    },
    {
      title: 'Reveal: the same mechanisms, in real systems',
      body: (
        <>
          Vitess reshards a keyspace through exactly this kind of cutover. CockroachDB splits a
          range into two once it grows past a size threshold. DynamoDB's adaptive capacity
          rebalances a hot item onto its own partition automatically.
        </>
      ),
      duration: 5.2,
      fig: 'Vitess reshards. CockroachDB splits ranges. DynamoDB isolates hot items.',
      Visual: S.RevealRealSystems,
    },
    {
      title: 'Recap',
      body: (
        <>
          Cardinality isn't the same as even load; salting fixes the one key that's hot; local
          indexes need the partition key, global indexes don't; moving data under load costs a
          real pause, not just a copy.
        </>
      ),
      duration: 4.8,
      fig: "cardinality isn't load. Salting, index scope, and the pause all matter.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table is sharded by customer ID — millions of distinct customers, uniformly hashed.
          One customer is a massive retail chain generating ten times the traffic of the next
          biggest.
        </>
      ),
      duration: 2.8,
      fig: 'millions of customer IDs, uniformly hashed. One is a massive chain.',
      predict: {
        options: [
          { label: "Millions of distinct, uniformly-hashed IDs means the load is already spread evenly" },
          { label: "That one chain still makes its own shard hot, no matter how many other IDs exist", correct: true },
        ],
        explain: (
          <>
            The same mechanism as the Hook: cardinality describes the key space, not the traffic.
            A single outsized customer is a celebrity key by another name, and it needs the same
            fix — salting that one key, not re-choosing the shard key for everyone.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
