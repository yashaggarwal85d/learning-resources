import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: 2PC run across in-process participants with a coordinator crash after the
// decision is logged but before it is announced, measuring lock-hold time; the same scenario
// replayed with the decision written through a tiny replicated log instead, resolving without
// that wait; a 3PC partition split into two groups that each finish differently; and Paxos
// Commit's own message-count formula checked to collapse to classic 2PC's count at its stated
// F = 0 case. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the coordinator decided, then vanished before telling anyone',
      body: (
        <>
          An order spans two shards, inventory and payments. The coordinator collects both
          prepare votes, durably logs "commit" — and crashes before telling either shard. Both
          shards voted yes and are holding row locks. The coordinator's machine stays gone for an
          hour.
        </>
      ),
      duration: 4.8,
      fig: "a coordinator collects two prepare votes, logs commit, then crashes before announcing it; both participants voted yes and hold locks while the coordinator's machine is gone for an hour",
      Visual: S.Hook,
    },
    {
      title: 'Predict: abort after a timeout, commit after a timeout, or wait?',
      body: (
        <>
          Each shard has voted yes and is still holding its locks an hour later. Can a shard
          safely abort once its timeout fires? Commit on its own? Or is waiting the only safe
          option?
        </>
      ),
      duration: 2.8,
      fig: "a prepared shard has waited an hour with no word from the coordinator — can it abort on its own, commit on its own, or must it wait?",
      predict: {
        options: [
          { label: 'It can safely abort once a reasonable timeout passes, since silence that long means the coordinator is gone' },
          { label: "It must wait — the coordinator may have already logged commit, and aborting now would contradict a decision that already exists", correct: true },
        ],
        explain: (
          <>
            It must wait. A shard that voted yes cannot know whether the coordinator logged commit
            or abort before it vanished. Guessing wrong in either direction breaks the one thing
            atomic commitment promises: every participant lands on the same outcome.
          </>
        ),
      },
      Visual: S.PredictWait,
    },
    {
      title: 'Reveal: what a yes vote actually promises',
      body: (
        <>
          Prepare asks every participant to make the transaction durable and promise it can
          commit. Once every vote is yes, the coordinator durably logs the decision — commit — and
          only then tells each participant. The vote is a promise the participant cannot take
          back.
        </>
      ),
      duration: 4.8,
      fig: "prepare asks every participant to durably promise it can commit; once every vote is yes, the coordinator durably logs the decision and only then announces it",
      Visual: S.RevealPrepare,
    },
    {
      title: 'Reveal: in doubt, and why that means holding the locks',
      body: (
        <>
          A participant that voted yes is in doubt: the outcome could be either commit or abort,
          and only the coordinator's log says which. It cannot release its locks without knowing,
          so it holds them until the announcement arrives — the lock-hold time the hook's hour was
          made of.
        </>
      ),
      duration: 4.8,
      fig: "a participant that voted yes is in doubt — the outcome could be either commit or abort — so it holds its locks until the announcement arrives, which is the lock-hold time",
      Visual: S.RevealInDoubt,
    },
    {
      title: "Reveal: 3PC's extra phase, and what it still needs to be true",
      body: (
        <>
          Three-phase commit adds a pre-commit step so a participant that received it can finish
          without the coordinator. That rescue depends on a timeout meaning "crashed," which only
          holds when the network is not partitioned. Split the network, and two separate groups
          can each elect their own stand-in and finish — differently. Traditional three-phase
          protocols are exactly what multiple coordinators make inconsistent.
        </>
      ),
      duration: 5.2,
      fig: "3PC's pre-commit phase lets a participant finish without the coordinator, assuming a timeout means a crash — which fails under a real partition, where two separate groups can each finish, differently",
      takeaway: 'Three-phase commit trades the blocking problem for an assumption that a timeout means a crash, which a real partition breaks.',
      Visual: S.RevealThreePc,
    },
    {
      title: "Reveal: Paxos Commit — a vote the coordinator's death can't erase",
      body: (
        <>
          Paxos Commit runs one small consensus instance on each participant's prepare vote, so
          the decision is held by a group of coordinators rather than one machine, and survives
          losing any minority of them. Classic two-phase commit turns out to be this protocol's own
          special case, with no fault tolerance built in at all.
        </>
      ),
      duration: 4.8,
      fig: "Paxos Commit runs a consensus instance on each prepare vote, so the decision survives losing a minority of its coordinators; classic two-phase commit is its own zero-fault-tolerance special case",
      takeaway: "Paxos Commit doesn't replace the coordinator's decision; it replicates it, so no single machine's death can erase it.",
      Visual: S.RevealPaxosCommit,
    },
    {
      title: 'Reveal: where production places the consensus group',
      body: (
        <>
          A transaction manager's state lives inside its own replicated group rather than on one
          machine, so losing the leader does not lose the decision. A commit protocol built this
          way can also let every participant's consensus round run at the same time instead of one
          after another, cutting a cross-shard commit's latency substantially.
        </>
      ),
      duration: 4.8,
      fig: "a transaction manager's state is stored inside its own replicated consensus group rather than on one machine, and running every participant's consensus round at once rather than in sequence cuts a cross-shard commit's latency",
      takeaway: 'Replicating the coordinator and running its consensus rounds in parallel are two separate wins a production system can take independently.',
      Visual: S.RevealProduction,
    },
    {
      title: 'Reveal: sagas and the outbox, named and left for elsewhere',
      body: (
        <>
          A different route gives up atomicity entirely: a saga breaks the transaction into steps
          with a compensating action for each, and the transactional outbox pattern commits an
          event alongside the write a separate process later delivers. Both trade a single commit
          for eventual consistency, application-side.
        </>
      ),
      duration: 4.2,
      fig: "a saga breaks a transaction into steps with compensating actions, and the transactional outbox commits an event alongside the write for later delivery — both give up atomicity for eventual consistency at the application level",
      Visual: S.RevealSagas,
    },
    {
      title: 'Recap',
      body: (
        <>
          A yes vote is a promise a participant cannot take back, which is why its crash-holder
          coordinator leaves it blocked, holding locks. Three-phase commit's rescue needs a
          partition-free network. Paxos Commit survives the coordinator's death by replicating its
          decision, with classic 2PC as its own unreplicated special case.
        </>
      ),
      duration: 4.8,
      fig: "a yes vote cannot be taken back, so a crashed coordinator leaves participants blocked; 3PC's rescue needs a partition-free network; Paxos Commit survives the coordinator's death by replicating the decision, with classic 2PC as its own special case",
      takeaway: 'Every fix here does the same thing: put the one decision somewhere a single crash cannot reach.',
      Visual: S.Recap,
    },
    {
      title: "Prove it: replicating the coordinator's decision — what does it leave unfixed?",
      body: (
        <>
          A team replicates the coordinator's state through a small consensus log, exactly as this
          topic describes, and declares their blocking problem solved for good. What does
          replicating the decision actually fix, and what can still go wrong?
        </>
      ),
      duration: 3,
      fig: "a team replicates the coordinator's decision through a consensus log and calls the blocking problem solved for good — what does that fix, and what can still go wrong?",
      predict: {
        options: [
          { label: "It fixes the single-machine failure that caused blocking before; a participant can still be left in doubt by its own crash, a lost message, or a majority of the decision-group being unreachable", correct: true },
          { label: 'It removes every way a participant can end up in doubt, since the decision itself can never be lost once it is replicated' },
        ],
        explain: (
          <>
            Replicating the decision removes exactly one cause of blocking: one machine holding the
            only copy. A participant can still be stuck in doubt by its own crash, a message that
            never arrives, or the decision-group itself losing its majority — the fix narrows the
            failure, it doesn't erase it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
