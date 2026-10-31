import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: the voting restriction denying a candidate missing a committed entry; the paper's
// own worked scenario walked step by step, showing an old-term entry on a majority is not yet
// committed while a current-term entry on a majority is; and joint consensus's overlapping-
// majority requirement, shown failing when either side's own majority alone is allowed to decide.
// No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a leader crashes before telling anyone an entry is committed',
      body: (
        <>
          A leader writes one entry to itself and a single follower, then crashes before telling
          either server, or anyone else, whether that write succeeded. A server that never
          received it wins the next election.
        </>
      ),
      duration: 4.8,
      fig: 'a leader writes an entry to itself and one follower, crashes before announcing it, and a server that never received it wins the next election',
      Visual: S.Hook,
    },
    {
      title: 'Predict: is that entry committed, and can the new leader overwrite it?',
      body: (
        <>
          The entry sits on two of five servers when the leader crashes. Is it committed? And is
          the new leader, elected without it, allowed to overwrite it with something else?
        </>
      ),
      duration: 2.8,
      fig: 'the entry sits on two of five servers when the leader crashes — is it committed, and can the new leader overwrite it?',
      predict: {
        options: [
          { label: 'Not committed, since only two of five servers have it; the new leader may safely overwrite it', correct: true },
          { label: 'Committed the moment a second server stored it, so the new leader must not touch it' },
        ],
        explain: (
          <>
            Not committed. Raft only treats an entry as committed once a majority holds it, and
            two of five is not a majority, so the new leader is free to overwrite it.
          </>
        ),
      },
      Visual: S.PredictCommitted,
    },
    {
      title: 'Reveal: terms as a logical clock',
      body: (
        <>
          Time is divided into terms, numbered upward. A server that sees a higher term updates
          its own and steps down. A request carrying a stale term is rejected outright — the same
          job a Lamport clock does for ordering events.
        </>
      ),
      duration: 4.8,
      fig: 'terms act as a logical clock: a server seeing a higher term steps down, and a request with a stale term is rejected',
      Visual: S.RevealTerms,
    },
    {
      title: 'Reveal: the voting restriction',
      body: (
        <>
          Each server votes once per term, and only for a candidate whose log is at least as
          up-to-date as its own — later last term wins outright; a tied last term falls back to
          whichever log is longer. That restriction alone is what guarantees every elected leader
          holds every committed entry.
        </>
      ),
      duration: 4.8,
      fig: 'a voter grants its vote only if the candidate is at least as up-to-date (later last term wins outright, a tie falls back to log length) — this restriction is what gives leader completeness',
      Visual: S.RevealVotingRestriction,
    },
    {
      title: "Reveal: the log matching property, enforced on every append",
      body: (
        <>
          If two logs share an entry at the same index and term, they are identical up through
          that point. Every `AppendEntries` call checks the entry just before the new ones; a
          mismatch gets refused, and the leader repairs the follower's log until it matches.
        </>
      ),
      duration: 4.8,
      fig: "two logs sharing an entry at the same index and term are identical up through it, enforced by AppendEntries's consistency check on every append",
      takeaway: "Two logs agreeing at one point are forced to agree on everything earlier, by a check run on every append.",
      Visual: S.RevealLogMatching,
    },
    {
      title: 'Reveal: why counting replicas of an old-term entry is unsafe',
      body: (
        <>
          Walk the paper's own timeline: a term-two entry reaches a majority, yet a later
          candidate with a higher last term can still win and erase it — the majority alone proves
          nothing. Only once an entry from the leader's own current term reaches a majority does
          every earlier entry become safe, carried along by the log matching property.
        </>
      ),
      duration: 4.8,
      fig: "a term-two entry on a majority can still be erased by a later candidate with a higher last term; only a current-term entry on a majority makes everything before it safe",
      Visual: S.RevealOldTermUnsafe,
    },
    {
      title: 'Reveal: joint consensus for membership change',
      body: (
        <>
          Switching the cluster's membership can't happen on every server at the same instant, so
          Raft routes through a transitional configuration requiring a majority of the old set and
          a majority of the new set at once. A snapshot, named here and not detailed, is how a
          server discards a log that has grown too long to keep.
        </>
      ),
      duration: 4.8,
      fig: 'membership changes route through joint consensus, needing overlapping majorities of both the old and new configurations; snapshots let a server discard a log grown too long',
      takeaway: "A membership change that skips overlapping majorities can let the old half and the new half each elect their leader.",
      Visual: S.RevealJointConsensus,
    },
    {
      title: 'Recap',
      body: (
        <>
          Terms reject stale leaders. The voting restriction forces every leader to hold every
          committed entry. Log matching makes agreement at one point force agreement before it.
          Counting replicas only commits an entry from the leader's own term. Joint consensus
          carries all of that through a membership change.
        </>
      ),
      duration: 4.8,
      fig: "terms reject stale leaders; voting restriction forces leader completeness; log matching forces agreement backward; only current-term entries are safely committed by counting; joint consensus carries this through membership change",
      takeaway: 'Raft gives Multi-Paxos\'s result with an understandable argument for why each rule is there, nothing more.',
      Visual: S.Recap,
    },
    {
      title: "Prove it: the leader's own current-term entry just reached a majority, then it crashes — is the new leader free to overwrite it?",
      body: (
        <>
          The leader replicated one entry from its own current term to a majority of the cluster,
          then crashed immediately afterward. Is that entry committed, and can whoever wins the
          next election safely erase it?
        </>
      ),
      duration: 2.8,
      fig: "a leader's own current-term entry reaches a majority, then it crashes — is the entry committed, and can the next leader erase it?",
      predict: {
        options: [
          { label: 'No — the entry is committed, and the voting restriction guarantees no one can be elected without holding it', correct: true },
          { label: 'Yes — the leader crashed before confirming the commit to anyone, so it is still up for grabs' },
        ],
        explain: (
          <>
            No. A current-term entry on a majority is committed the instant that majority is
            reached, regardless of whether the leader survives to say so. Any later candidate
            missing it fails the up-to-date check against every server that holds it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
