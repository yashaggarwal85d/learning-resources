import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No live lab of its own (CHAPTER.md): five real simulations in examples.py -- majority quorum
// vs unanimity under node failures, a quorum loss refusing a write rather than guessing, the
// blast-radius difference between one global consensus group and many independent per-range
// groups, and the real round-trip cost gap between a single-group commit and a cross-range one.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Five nodes hold the same data. Two of them go dark at once. The other three keep
          accepting writes without missing a beat — and they're not guessing.
        </>
      ),
      duration: 4.8,
      fig: "five nodes, two go dark. The other three keep writing, correctly.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a write need every node to agree, or just most of them?',
      body: (
        <>
          Two of five nodes are unreachable. Does the remaining group still need every single node
          to agree before it can commit a write?
        </>
      ),
      duration: 2.8,
      fig: 'two of five unreachable. Does the write still need everyone?',
      predict: {
        options: [
          { label: "Yes — every node must agree, or the write isn't safe" },
          { label: "No — a majority of the group agreeing is enough", correct: true },
        ],
        explain: (
          <>
            Any two majorities out of the same group always overlap by at least one node — so two
            different majorities can never disagree about what was committed. Unanimity isn't
            needed for that guarantee; a majority already provides it.
          </>
        ),
      },
      Visual: S.PredictMajorityVsUnanimity,
    },
    {
      title: 'Reveal: majority, measured against unanimity',
      body: (
        <>
          Three of five nodes reachable is already a majority — the group commits. Unanimity
          would have refused the instant even one node went dark.
        </>
      ),
      duration: 4.8,
      fig: 'three of five: majority commits. Unanimity would already have refused.',
      Visual: S.RevealMajorityMeasured,
    },
    {
      title: 'Reveal: losing quorum, operationally',
      body: (
        <>
          Drop to two reachable nodes, below the majority, and the group refuses the write
          outright. It doesn't fall back to a smaller, unsafe quorum — it stops.
        </>
      ),
      duration: 4.8,
      fig: "below a majority, the group refuses. It doesn't guess.",
      takeaway: "Losing quorum isn't a slowdown — a correctly-built consensus group refuses the write rather than risk two conflicting answers.",
      Visual: S.RevealLosingQuorum,
    },
    {
      title: 'Reveal: one global group vs. many per-range groups',
      body: (
        <>
          One consensus group over the whole keyspace loses quorum, and every key stops accepting
          writes. Split that keyspace into many independent groups, and the identical quorum loss
          in just one of them leaves everyone else untouched.
        </>
      ),
      duration: 5.2,
      fig: 'one group: everything halts. Many groups: only one range does.',
      takeaway: "Per-range consensus doesn't prevent quorum loss — it shrinks the blast radius to one range.",
      Visual: S.RevealGlobalVsPerRange,
    },
    {
      title: 'Predict: does a transaction spanning two ranges cost the same as a normal write?',
      body: (
        <>
          A write landing inside one consensus group commits in a single round trip. Does a
          transaction touching two separate groups cost the same?
        </>
      ),
      duration: 2.8,
      fig: 'one group: one round trip. Two groups, one transaction. Same cost?',
      predict: {
        options: [
          { label: "Yes — the groups commit in parallel, so the cost doesn't change" },
          { label: "No — it needs its own prepare-then-commit round trips on top of each group's own", correct: true },
        ],
        explain: (
          <>
            Each group can only promise its own piece is safely committed on its own. Getting both
            pieces to agree to commit together needs a coordinating round of prepare, then a
            separate round of commit, layered on top of each group's own round trip.
          </>
        ),
      },
      Visual: S.PredictCrossRangeCost,
    },
    {
      title: 'Reveal: the round-trip cost, measured',
      body: (
        <>
          A single-group write costs one round trip. The identical write spread across two groups,
          coordinated with a two-phase commit, costs several times that.
        </>
      ),
      duration: 4.8,
      fig: 'one round trip, single group. Several, once two groups must agree.',
      takeaway: "A commit's real cost is round trips, not data size — crossing a group boundary multiplies it.",
      Visual: S.RevealRoundTripCost,
    },
    {
      title: 'Reveal: where this actually runs',
      body: (
        <>
          Kafka's own metadata quorum is a small group of controllers agreeing on cluster state.
          etcd keeps its entire keyspace in one such group. CockroachDB and TiKV give every range
          its own.
        </>
      ),
      duration: 5.2,
      fig: "Kafka's controllers, etcd's one group, CockroachDB's per-range groups.",
      Visual: S.RevealRealSystems,
    },
    {
      title: 'Recap',
      body: (
        <>
          A majority, not everyone, is enough to commit; losing quorum means refusing, not
          guessing; one group makes quorum loss global, many groups make it local; crossing group
          boundaries costs real extra round trips.
        </>
      ),
      duration: 4.8,
      fig: 'majority commits. Quorum loss refuses. Group boundaries cost round trips.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A cluster runs one hundred independent per-range consensus groups. A single rack loses
          power, taking down exactly one node from each of ten of those groups.
        </>
      ),
      duration: 2.8,
      fig: 'one hundred groups. One rack fails, touching one node in ten of them.',
      predict: {
        options: [
          { label: "The whole cluster stops accepting writes until the rack comes back" },
          { label: "Only those ten groups are even affected, and most of them likely still have a majority left", correct: true },
        ],
        explain: (
          <>
            Each group's own quorum depends only on its own members. Losing one node out of five
            in ten different groups still leaves four reachable in each — comfortably above a
            majority of three — so none of those ten groups even loses quorum.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
