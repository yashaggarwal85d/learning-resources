import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real election under terms and randomized timeouts elects a correct
// leader only when the up-to-date-log voting rule is enforced; a real
// PreVote round genuinely stops a partitioned node's own stale term from
// ever disrupting a healthy cluster at all.
const reel: Reel = {
  steps: [
    {
      title: "Five identical, healthy nodes each get a real, deterministic timeout. The one whose timeout fires first becomes a candidate and asks for votes. Does it genuinely win, and does the winner genuinely match the fastest timeout?",
      body: (
        <>
          Five healthy nodes, a real timeout each.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely' },
          { label: "Ties always need a human to break them" },
          { label: 'Only if every log is already identical' },
        ],
        explain: (
          <>
            Yes. The fastest real timeout genuinely wins.
          </>
        ),
      },
      Visual: S.ElectionPredict,
    },
    {
      title: 'Measured: the real election genuinely elects the node whose real timeout fired first, with a real majority of votes',
      body: (
        <>
          The real, measured election outcome, matching exactly which node timed out first.
        </>
      ),
      duration: 3.0,
      Visual: S.ElectionReveal,
    },
    {
      title: "Now one candidate's own log is genuinely behind the rest of the cluster's. Does its vote request still win, or does the up-to-date-log voting rule genuinely reject it?",
      body: (
        <>
          A stale candidate, among fresh voters.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It still wins, since its term is still fresh' },
          { label: 'The voting rule genuinely rejects it', correct: true },
          { label: "Only if it's behind by more than one entry" },
        ],
        explain: (
          <>
            Rejected. A fresh term alone was never enough.
          </>
        ),
      },
      Visual: S.StaleCandidatePredict,
    },
    {
      title: "Measured: the out-of-date candidate's own vote request is genuinely rejected; it loses the election",
      body: (
        <>
          The real, measured rejection, by the real up-to-date-log voting rule.
        </>
      ),
      duration: 3.0,
      takeaway: 'A fresh term alone is never enough; the voting rule also checks whether a log is genuinely caught up.',
      Visual: S.StaleCandidateReveal,
    },
    {
      title: "A healthy cluster has a live leader. One node gets partitioned and, missing every heartbeat, keeps incrementing its own term locally. When it rejoins and broadcasts that stale, inflated term, does the healthy leader genuinely step down?",
      body: (
        <>
          A partitioned node, an inflated term, rejoining.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, the leader ignores a term it's never heard of" },
          { label: 'Yes, genuinely; every node updates to a higher term', correct: true },
          { label: "Only if the partitioned node's log is also longer" },
        ],
        explain: (
          <>
            Yes, genuinely. Every node updates to a higher term it sees.
          </>
        ),
      },
      Visual: S.DisruptionPredict,
    },
    {
      title: 'Measured: genuinely disruptive. Every node updates its own term the moment it sees a higher one, and the healthy leader genuinely steps down',
      body: (
        <>
          The real, measured disruption, from nothing more than a bare term increase.
        </>
      ),
      duration: 3.0,
      takeaway: 'A bare term increase alone, with nothing else genuinely wrong, can depose a working leader.',
      Visual: S.DisruptionReveal,
    },
    {
      title: 'Now the identical partitioned node runs a real PreVote round first, before ever raising its own term. Does PreVote genuinely stop the identical disruption this time?',
      body: (
        <>
          The identical node, a real pre-vote round first.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, PreVote only delays the same disruption' },
          { label: "Yes, genuinely; its term never even rises", correct: true },
          { label: "Only if the partitioned node's log is also stale" },
        ],
        explain: (
          <>
            Yes, genuinely. Its term never even rises.
          </>
        ),
      },
      Visual: S.PrevotePredict,
    },
    {
      title: "Measured: with PreVote, every healthy voter already has a live leader and genuinely denies the pre-vote; the partitioned node's own term never rises, and the healthy leader is never disturbed",
      body: (
        <>
          The real, measured non-disruption, with the identical node and the identical rejoin.
        </>
      ),
      duration: 3.0,
      takeaway: "PreVote protects a leader before any real term is ever spent trying to depose it.",
      Visual: S.PrevoteReveal,
    },
    {
      title: "One real, widely used Raft implementation's own documentation states this exact purpose directly, in its own words. Does it name stopping a partitioned node from disrupting the cluster on rejoin?",
      body: (
        <>
          A real implementation's own words on PreVote, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PrevoteDocsReveal,
    },
    {
      title: 'Recap: a real election, checked against the real rules',
      body: (
        <>
          A real election under terms and randomized timeouts elects a correct leader only when the up-to-date-log voting rule is enforced; a real PreVote round genuinely stops a partitioned node's own stale term from ever disrupting a healthy cluster at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
