import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy heartbeat-fencing threshold check; a
// toy comparison of standard-vote vs pre-vote disruption counts under a repeatedly-partitioned,
// unwinnable candidate; and a toy one-voter-change-at-a-time admission rule, both serialized and
// concurrent. No literal digits anywhere below (duration numbers are exempt); the real counts
// are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the broker that kept serving stale metadata',
      body: (
        <>
          A broker loses contact with the controller but can still reach the system that used
          to track cluster state. It keeps answering requests — with a view of the world that
          has already changed underneath it.
        </>
      ),
      duration: 4.8,
      fig: 'a broker cut off from the controller but not from the old coordination system, still answering with a stale view',
      Visual: S.Hook,
    },
    {
      title: 'Setup: one log instead of two systems',
      body: (
        <>
          Cluster metadata used to live in a completely separate coordination system. Now it is
          a log, built the same way every partition in this chapter has already been built —
          with periodic snapshots bounding how much of it a joining broker must replay.
        </>
      ),
      duration: 4.8,
      fig: 'two separate systems collapsing into the one kind of log this chapter keeps reusing',
      Visual: S.Setup,
    },
    {
      title: 'Predict: controller pushes updates, or brokers pull them?',
      body: (
        <>
          Every broker needs to know the current cluster metadata. Does the controller push each
          change out to every broker as it happens, or does each broker pull updates itself?
        </>
      ),
      duration: 2.8,
      fig: 'every broker needs the current metadata — pushed out by the controller, or pulled in by each broker?',
      predict: {
        options: [
          { label: 'The controller pushes updates to every broker' },
          { label: 'Brokers pull updates themselves, tracking their own position', correct: true },
          { label: 'A mix, depending on how large the cluster is' },
        ],
        explain: (
          <>
            Brokers pull. Each one fetches forward from its own tracked position, the same shape
            as a consumer fetching a partition — nothing is pushed out to it, and nothing about
            cluster size changes that.
          </>
        ),
      },
      Visual: S.PredictPullPush,
    },
    {
      title: 'Reveal: the metadata log, fetched like any other',
      body: (
        <>
          A broker tracks its own position in the metadata log and fetches forward from there —
          the exact shape this chapter already used for an ordinary partition.
        </>
      ),
      duration: 4.8,
      fig: "a broker's own tracked position in the metadata log, fetching forward from it",
      takeaway: 'A broker pulls metadata and tracks its own position — the same pull pattern this chapter already used for data.',
      Visual: S.RevealFetch,
    },
    {
      title: 'Reveal: heartbeat fencing, in real numbers',
      body: (
        <>
          That same periodic fetch doubles as a heartbeat. A toy run: one broker comfortably
          under the fencing threshold, one well past it.
        </>
      ),
      duration: 4.8,
      fig: "a broker's time since its last fetch against the fencing threshold, twice — once under it, once well past it",
      takeaway: 'The fetch that pulls metadata also proves a broker is alive — stop fetching too long and it gets fenced.',
      Visual: S.RevealFencing,
    },
    {
      title: 'Predict: why does an unwinnable candidate still disrupt?',
      body: (
        <>
          A candidate that could never actually win an election still forces a disruption every
          time it reconnects and sends a vote request. What about a vote request causes that?
        </>
      ),
      duration: 2.8,
      fig: 'a candidate that can never win, still disrupting the leader every time it reconnects — why?',
      predict: {
        options: [
          { label: 'A vote request always bumps the epoch, win or not', correct: true },
          { label: 'The leader steps down the moment any vote request arrives' },
          { label: "The quorum doesn't check whether a candidate is eligible" },
        ],
        explain: (
          <>
            A vote request always bumps the epoch first — before anyone knows whether it would
            actually win. That epoch bump alone is what disrupts the leader; nothing automatic
            forces a step-down, and eligibility was never the issue.
          </>
        ),
      },
      Visual: S.PredictDisruption,
    },
    {
      title: 'Reveal: pre-vote, measured',
      body: (
        <>
          The same flaky, unwinnable candidate reconnecting across several rounds: epoch bumps
          and disruptions under a standard vote, against the same rounds under pre-vote.
        </>
      ),
      duration: 4.8,
      fig: 'the same rounds of reconnection, twice — epoch bumps and disruptions under a standard vote, against pre-vote',
      takeaway: 'Canvassing for a likely win before bumping the epoch turns an unwinnable candidate into one that never disrupts anyone.',
      Visual: S.RevealPreVote,
    },
    {
      title: 'Reveal: dynamic quorums, one change at a time',
      body: (
        <>
          An operator can add or remove a controller without a restart. But only one membership
          change is ever in flight — a second request while one is pending gets rejected.
        </>
      ),
      duration: 4.8,
      fig: 'adding and removing controllers without a restart, and a second request rejected while one is still pending',
      takeaway: 'Growing or shrinking the controller quorum needs no restart — only one membership change is ever in flight.',
      Visual: S.RevealDynamicQuorum,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          controller-quorum model, just now — the fencing threshold, the vote comparison, and
          the voter-change outcome.
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
          Two systems collapsed into one log. A pull-based fetch that also fences the stale. A
          vote that canvasses before it disrupts. And a quorum that can grow or shrink, one
          change at a time.
        </>
      ),
      duration: 4.8,
      fig: 'one log, a fencing heartbeat, a canvassing vote, and a quorum that changes one member at a time',
      Visual: S.Recap,
    },
  ],
};

export default reel;
