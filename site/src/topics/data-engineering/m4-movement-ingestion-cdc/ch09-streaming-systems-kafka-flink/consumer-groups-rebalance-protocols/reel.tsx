import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy sticky reassignment of 24 partitions
// across an 8-to-9-member scale-up, a direct eager-vs-cooperative paused-member count, and a
// toy static-membership rebalance-trigger check. No literal digits anywhere below (duration
// numbers are exempt); the real counts are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: nine members, one stalled group',
      body: (
        <>
          A consumer group grows by a single member. Under the classic protocol, consumption
          halts for the entire group — not just the member that joined.
        </>
      ),
      duration: 4.8,
      fig: 'a group of consumers, all paused, after only one new member joined',
      Visual: S.Hook,
    },
    {
      title: 'Setup: offsets as a log, partitions divided up',
      body: (
        <>
          A committed offset is itself a record in a compacted log, built the same way this
          chapter has already built everything else. The partitions it tracks get divided among
          a group of consumers — and that division can be disrupted.
        </>
      ),
      duration: 4.8,
      fig: "a consumer group's committed offsets, living in the same kind of log as everything else",
      Visual: S.Setup,
    },
    {
      title: 'Predict: does every member pause, or just the ones that moved?',
      body: (
        <>
          A ninth member joins an eight-member group. Does every member's consumption pause
          during the rebalance, or only the members whose own assignment actually changes?
        </>
      ),
      duration: 2.8,
      fig: 'a membership change — does it pause every member, or only the ones whose partitions moved?',
      predict: {
        options: [
          { label: 'Every member pauses, since the whole group must rebalance' },
          { label: 'Only the members whose assignment actually changed pause', correct: true },
          { label: 'Only the new member pauses; everyone else is unaffected' },
        ],
        explain: (
          <>
            Only the affected members pause — but which protocol is running decides whether
            "affected" means a handful of members or the entire group, which is exactly what the
            next reveal measures.
          </>
        ),
      },
      Visual: S.PredictPause,
    },
    {
      title: 'Reveal: a real reassignment, most members untouched',
      body: (
        <>
          Growing an eight-member group to nine, across a real toy reassignment of its
          partitions, moves only a handful of members' assignments — most members keep exactly
          what they already had.
        </>
      ),
      duration: 4.8,
      fig: "a real toy reassignment: most members' partitions never move at all",
      takeaway: 'A membership change only ever moves a handful of assignments — most members keep exactly what they already had.',
      Visual: S.RevealReassignment,
    },
    {
      title: 'Reveal: eager pauses everyone, cooperative pauses few',
      body: (
        <>
          The classic eager protocol pauses the whole group regardless. Cooperative and
          incremental reconciliation pause only the members this reassignment actually touched.
        </>
      ),
      duration: 4.8,
      fig: 'the same membership change, measured under both protocols side by side',
      takeaway: 'Eager pauses the whole group on principle; cooperative and incremental protocols pause only the members actually affected.',
      Visual: S.RevealPauseCompare,
    },
    {
      title: 'Predict: does a persistent identity still force a rebalance?',
      body: (
        <>
          A member restarts briefly and rejoins with a persistent, configured identity. Does that
          brief restart still force the group to rebalance?
        </>
      ),
      duration: 2.8,
      fig: 'a brief restart under a persistent configured identity — does it still force a rebalance?',
      predict: {
        options: [
          { label: 'Yes — leaving and rejoining the group always triggers one' },
          { label: 'No — a persistent identity means membership looks unchanged', correct: true },
          { label: 'Only if the restart crosses the session timeout' },
        ],
        explain: (
          <>
            No, as long as the restart stays inside the session timeout — a persistent configured
            identity means the coordinator sees membership as unchanged, not merely a fast
            rejoin. Cross that timeout, though, and it rebalances like any other departure.
          </>
        ),
      },
      Visual: S.PredictStatic,
    },
    {
      title: 'Reveal: static membership, measured',
      body: (
        <>
          A fast restart under a configured identity triggers nothing. The same restart without
          one — or one that runs past the session timeout — triggers a rebalance every time.
        </>
      ),
      duration: 4.8,
      fig: 'three restarts, measured: no identity, a fast restart with one, and a slow restart with one',
      takeaway: 'A persistent configured identity makes a restart invisible to the coordinator — skip it, and it still rebalances.',
      Visual: S.RevealStatic,
    },
    {
      title: 'Reveal: assignment moves to the broker, Streams included',
      body: (
        <>
          The newer protocol moves assignment computation itself onto the broker, and Kafka's own
          documentation now describes the classic protocol as being phased out in its favor.
          Kafka Streams gets the same broker-driven shape through its own protocol, shipped with
          its own stated limits for now.
        </>
      ),
      duration: 4.8,
      fig: 'assignment computed on the broker, for ordinary consumers and for Kafka Streams alike',
      Visual: S.RevealBrokerSide,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          rebalance model, just now — the reassignment, the paused-member counts, and the
          static-membership outcomes.
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
          Offsets live in a compacted log. A membership change no longer has to stall the whole
          group. A persistent identity skips the needless case entirely. And the same
          broker-driven shape now reaches Kafka Streams too.
        </>
      ),
      duration: 4.8,
      fig: 'offsets as a log, a rebalance that no longer stalls everyone, and one shape reaching Streams too',
      Visual: S.Recap,
    },
  ],
};

export default reel;
