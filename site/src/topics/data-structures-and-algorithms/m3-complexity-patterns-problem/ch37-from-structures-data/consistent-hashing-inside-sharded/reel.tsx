import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's seventh topic: Chapter 3's ring, read against three real partition-assignment
// choices -- Cassandra's token ring, Redis Cluster's fixed slot table, Kafka's plain modulo
// hashing -- and what each does, or does not do, about a hot key. Every number is computed in
// examples.py; every system claim is a word-for-word quote in SOURCES.md.

const reel: Reel = {
  steps: [
    {
      title: "A cluster of ten nodes becomes eleven. Plain modulo hashing moves almost every key; a ring moves about one key in eleven; a fixed-slot table moves exactly the slots an operator chooses to move. But one key is hot, and none of those three placement schemes notices by itself. Predict: when one key carries a quarter of all traffic, does giving every node a thousand points on the ring instead of one actually help that key?",
      body: <>Three schemes handle growth differently. Does any of them notice a hot key?</>,
      duration: 6,
      fig: 'GrowthHook',
      predict: {
        options: [
          { label: 'Yes, a thousand points per node spreads the hot key out too' },
          { label: "No, the hot key's own hash position never moves, however many points exist", correct: true },
          { label: 'It depends on which of the three schemes is used' },
        ],
        explain: (
          <>
            No scheme helps. Virtual nodes smooth an ordinary key distribution across many
            points, but one specific key still hashes to exactly one position. The node
            boundaries move; the hot key's position does not.
          </>
        ),
      },
      Visual: S.GrowthHook,
    },
    {
      title: "Three real answers to the same question: which machine owns this key? Cassandra's token ring, Redis Cluster's fixed slot table, Kafka's plain modulo hashing.",
      body: <>Three production systems, three different answers to the same placement question.</>,
      duration: 5,
      fig: 'ThreeChoices',
      Visual: S.ThreeChoices,
    },
    {
      title: "Cassandra names its own mechanism directly: consistent hashing using a token ring. Virtual nodes, several tokens per physical node, fix the imbalance a single token per node has on a small cluster.",
      body: <>Cassandra's own name for it: a token ring, with virtual nodes for balance.</>,
      duration: 5.5,
      fig: 'CassandraRing',
      Visual: S.CassandraRing,
    },
    {
      title: "Redis Cluster is not a ring at all. The key space is a fixed table of slots; a key's slot is a hash of the key, taken modulo the slot count; each master node owns a subset of the slots directly, not a subset of a numeric range.",
      body: <>Redis Cluster: a fixed table of slots, not a ring, not a range.</>,
      duration: 5.5,
      fig: 'RedisSlotTable',
      Visual: S.RedisSlotTable,
    },
    {
      title: "Kafka's keyed partitioner computes a hash of the key, taken modulo the current partition count. Plain modulo hashing, with no stability property at all: change the partition count, and the mapping changes almost everywhere.",
      body: <>Kafka: plain modulo hashing, with no stability when the count changes.</>,
      duration: 5,
      fig: 'KafkaModulo',
      Visual: S.KafkaModulo,
    },
    {
      title: "Predict, then measured: growing ten nodes to eleven. How much of the key space does each of the three schemes actually move?",
      body: <>Same growth, three schemes. How much of the key space actually moves?</>,
      duration: 4.5,
      fig: 'PredictGrowth',
      predict: {
        options: [
          { label: 'All three move about the same share' },
          { label: 'The ring and the slot table both move a small share; modulo hashing moves almost everything', correct: true },
          { label: 'Modulo hashing moves the least, since it is the simplest rule' },
        ],
        explain: (
          <>
            The ring and the fixed-slot table were both designed for this: a joining node takes
            only its fair share. Modulo hashing was not designed for it at all, and changing the
            divisor changes almost every remainder.
          </>
        ),
      },
      Visual: S.PredictGrowth,
    },
    {
      title: "Measured: the ring moves about one key in nine; the fixed-slot table moves a comparably small, operator-controlled share; modulo hashing moves almost every key.",
      body: <>A small, comparable share for the ring and the slot table; almost everything for modulo.</>,
      duration: 5.5,
      fig: 'GrowthMeasured',
      takeaway: 'A ring and a fixed-slot table both move a small, controlled share of keys; modulo hashing moves almost everything.',
      Visual: S.GrowthMeasured,
    },
    {
      title: "Two different mechanics for a similar-sized move. A ring's new node claims a token range from its neighbors automatically. A slot table's operator moves whole slots one at a time, each going through an explicit migrating and importing handshake: data is never moved between nodes except when resharding.",
      body: <>Automatic token ranges on a ring; explicit, one-slot-at-a-time moves on a table.</>,
      duration: 6,
      fig: 'Rebalancing',
      Visual: S.Rebalancing,
    },
    {
      title: "The shared blind spot: every one of these three schemes balances keys, never load. One hot key still lands on exactly one node, whichever scheme placed it there.",
      body: <>All three balance keys, not load. A hot key still lands on exactly one node.</>,
      duration: 5,
      fig: 'SharedBlindSpot',
      Visual: S.SharedBlindSpot,
    },
    {
      title: "Measured: the same hot key, now under a ring with a thousand points per node instead of one. Which node ends up owning it can change, but how overloaded that node becomes does not systematically improve: the key still hashes to exactly one point, however many points exist.",
      body: <>A thousand points per node changes who owns the key, not how overloaded they get.</>,
      duration: 6,
      fig: 'VirtualNodesDontHelp',
      takeaway: 'Virtual nodes smooth an ordinary key distribution; they do nothing for one single hot key.',
      Visual: S.VirtualNodesDontHelp,
    },
    {
      title: "HAProxy's real knob for this: hash-balance-factor. A server already carrying more than its share of the average load is skipped, and the next candidate the same hash would choose is tried instead, until one with room is found. The feature is off by default.",
      body: <>A server over its share is skipped for the next candidate the hash would pick.</>,
      duration: 6,
      fig: 'BoundedLoadRule',
      Visual: S.BoundedLoadRule,
    },
    {
      title: "Measured: the same hot key, now under bounded-load placement at HAProxy's own example factor. The busiest node's share drops from several times the average down to close to the factor itself.",
      body: <>Bounded load caps the busiest node near the factor, not several times over it.</>,
      duration: 5.5,
      fig: 'BoundedLoadMeasured',
      takeaway: "Bounded load caps the busiest node's share by skipping it for the next candidate on the ring.",
      Visual: S.BoundedLoadMeasured,
    },
    {
      title: "Three real placement schemes, one shared vulnerability. The fix was never a better placement scheme; it was a rule about how much load any one placement is allowed to carry before it gets skipped.",
      body: <>The fix is not a better placement; it is a cap on how much load one placement carries.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
    {
      title: "Placement decides which machine owns a key. Each machine then answers aggregate questions about its own part, and the system must combine those partial answers into one without ever seeing the raw rows -- possible only if the structure holding the answer can actually be merged.",
      body: <>Next: combining each machine's own partial answer into one, without the raw rows.</>,
      duration: 5.5,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
