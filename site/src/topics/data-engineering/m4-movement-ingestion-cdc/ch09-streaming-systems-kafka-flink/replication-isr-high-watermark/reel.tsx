import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy replica column measuring the high
// watermark as the minimum offset across a leader and two lagging followers; a toy
// min.insync.replicas gate accepting or rejecting writes by in-sync-set size; a direct
// reimplementation of KIP-101's own worked leader-epoch-truncation example; and a toy
// last-replica-standing run comparing classic high-watermark advancement against a rule gated
// on min.insync.replicas. No literal digits anywhere below (duration numbers are exempt); the
// real counts are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: records that were "safe" and vanished anyway',
      body: (
        <>
          A producer can be told a record is durable and be wrong — it depends entirely on
          whose acknowledgement it waited for. A real toy leader crash shows exactly how many
          records one acknowledgement choice loses, and how many the other choice loses.
        </>
      ),
      duration: 4.8,
      fig: 'a real toy leader crash — records one acknowledgement choice loses, against records the other choice loses',
      Visual: S.Hook,
    },
    {
      title: 'Setup: the replica column and the ruler',
      body: (
        <>
          Every replica keeps its own copy of the log, at its own pace. A leader on top,
          followers below, a shared ruler running through all of them — each one's own tick at
          a different position.
        </>
      ),
      duration: 4.8,
      fig: 'a leader and its followers, each at a different position on a shared ruler',
      Visual: S.Setup,
    },
    {
      title: 'Predict: which position actually counts as committed?',
      body: (
        <>
          The leader's tick sits furthest along the ruler. The followers trail behind, each at
          its own position. Which single position is the one a consumer should actually be
          allowed to trust?
        </>
      ),
      duration: 2.8,
      fig: 'the leader furthest along the ruler, followers trailing — which position is the committed one?',
      predict: {
        options: [
          { label: "The leader's own position, since it wrote first" },
          { label: 'The minimum position across every in-sync replica', correct: true },
          { label: 'Whichever follower happens to be fastest' },
        ],
        explain: (
          <>
            The minimum across every in-sync replica. Trusting the leader's own position alone
            assumes the leader never dies — if it did the instant after writing, nothing would
            back that write up. Picking one fast follower ignores the rest of the in-sync set
            entirely; the whole point is that every one of them has to have it.
          </>
        ),
      },
      Visual: S.PredictHW,
    },
    {
      title: 'Reveal: the high watermark, in real numbers',
      body: (
        <>
          The same replica column, with real positions: the leader's own tick, each follower's
          tick, and the line marking the slowest in-sync one of them.
        </>
      ),
      duration: 4.8,
      fig: "the leader's own tick, each follower's tick, and the line sitting at the slowest one",
      takeaway: "The line sits at the slowest in-sync replica, never the leader's own — that gap is what a crash exposes.",
      Visual: S.RevealHW,
    },
    {
      title: 'Predict: safe for a restarted follower to trust its own line?',
      body: (
        <>
          A follower comes back up holding more than its own recorded line says is safe. Is it
          fine for it to just truncate down to that line and move on?
        </>
      ),
      duration: 2.8,
      fig: "a restarted follower holding more than its own recorded line says is safe — trust the line, or ask for something else?",
      predict: {
        options: [
          { label: 'Yes — truncate down to the recorded line' },
          { label: "No — ask for the current leadership period's end position instead", correct: true },
          { label: 'No — just compare raw positions with the leader directly' },
        ],
        explain: (
          <>
            Ask for the leadership period's own end position instead. The follower's own
            recorded line is always at least one round trip behind what it has actually
            fetched, so trusting it can throw away a message that was never actually
            divergent. A raw position number alone can't tell "caught up but unconfirmed" apart
            from "genuinely has data the leader never had" — only the leadership-period marker
            can.
          </>
        ),
      },
      Visual: S.PredictTruncation,
    },
    {
      title: 'Reveal: truncating by the right marker',
      body: (
        <>
          A two-message follower log. Truncating down to the recorded line drops the second
          message. Truncating to the current leadership period's end position keeps it.
        </>
      ),
      duration: 4.8,
      fig: 'the same two-message log, truncated two ways — one drops the second message, one keeps it',
      takeaway: "A follower's own recorded line is always stale — the leadership period's end position proves what was never actually divergent.",
      Visual: S.RevealTruncation,
    },
    {
      title: 'Predict: does one replica left still accept full-durability writes?',
      body: (
        <>
          Network trouble drops every follower out of the in-sync set, leaving just the former
          leader. Classically, does that lone replica keep accepting writes meant to wait for
          every in-sync replica?
        </>
      ),
      duration: 2.8,
      fig: 'only one replica left in sync — does it keep accepting writes meant to wait for every in-sync replica?',
      predict: {
        options: [
          { label: 'No — writes stop once the set gets this small' },
          { label: 'Yes — classically, only whether the set is empty gets checked, not its size against a minimum', correct: true },
          { label: 'It depends only on whether risky leader elections are allowed' },
        ],
        explain: (
          <>
            Yes, classically. Only the set being non-empty is checked before the line keeps
            moving — not its size against a configured minimum. Whether risky elections are
            allowed is a separate, later decision about who gets to lead after a failure, not
            about whether a write was ever safe to accept in the first place.
          </>
        ),
      },
      Visual: S.PredictLastStanding,
    },
    {
      title: 'Reveal: last replica standing',
      body: (
        <>
          A toy run, two rules: one that only checks the set isn't empty, one that also checks
          its size against the configured minimum before letting the line move. Writes made
          during the shrink that are later lost, under each rule.
        </>
      ),
      duration: 4.8,
      fig: 'writes made while the in-sync set is shrunk, later lost, under two different rules for moving the line',
      takeaway: "Checking the minimum before moving the line, not just checking it isn't empty, stops a lone replica losing writes.",
      Visual: S.RevealLastStanding,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          replication model, just now — the high-watermark gap, the truncation outcome, and the
          last-replica-standing loss counts under both rules.
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
          A replica column racing toward a line that only moves at the slowest in-sync pace. A
          truncation rule that trusts a leadership-period marker, not a stale recorded line. And
          a minimum that has to be checked before that line is allowed to move at all.
        </>
      ),
      duration: 4.8,
      fig: 'a replica column, a truncation marker, and a checked minimum — the three ideas this topic opened on',
      Visual: S.Recap,
    },
  ],
};

export default reel;
