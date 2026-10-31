import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: the proof sketch run on the chapter's own three-replica stock register, showing
// the isolated replica's state is identical whether a write happened on the other side or not;
// what linearizability forces it to refuse versus what causal consistency still lets it answer;
// the concrete overselling cost of choosing availability; and PACELC's four quadrants, each
// placed from a quoted classification. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: "we chose AP, so we never go down"',
      body: (
        <>
          A partition separates two of the shop's three replicas from the third. A customer on
          the isolated replica buys the last unit of stock. A customer on the other two replicas
          buys the same last unit. Both get "order confirmed."
        </>
      ),
      duration: 4.8,
      fig: 'a partition isolates one replica from the other two; a customer on each side buys the same last unit of stock, and both get "order confirmed"',
      Visual: S.Hook,
    },
    {
      title: "Predict: which of CAP's three words did the system keep?",
      body: (
        <>
          Which of consistency, availability and partition tolerance did this system keep, which
          did it give up, and what is the one thing it could still have chosen instead of
          overselling?
        </>
      ),
      duration: 2.8,
      fig: "which of CAP's three words did the overselling system keep, which did it give up, and what could it have chosen instead of overselling?",
      predict: {
        options: [
          { label: 'It kept consistency and partition tolerance, and the fix is to retry the write until it succeeds' },
          { label: 'It kept availability through the partition at the cost of consistency; it could instead have refused the isolated side', correct: true },
        ],
        explain: (
          <>
            It chose availability. Every node kept answering through the partition, which is
            exactly what made the double sale possible. The one thing left on the table was to
            have the isolated replica refuse the purchase instead of confirming it.
          </>
        ),
      },
      Visual: S.PredictChoice,
    },
    {
      title: 'Reveal: the theorem, in its own three exact conditions',
      body: (
        <>
          Atomic: every operation appears to happen at one instant, exactly linearizability.
          Available: every request to a non-failing node eventually gets a response. Partition
          tolerant: the network may lose arbitrarily many messages. The theorem says these three
          cannot all hold.
        </>
      ),
      duration: 4.8,
      fig: 'the theorem in its own three conditions: atomic (linearizable), available (every request to a non-failing node eventually gets a response), partition tolerant (arbitrary message loss) — not all three can hold',
      Visual: S.RevealTheorem,
    },
    {
      title: "Reveal: the proof, on the shop's own register",
      body: (
        <>
          Split the three replicas: one alone, two together. The majority accepts a write the
          isolated replica never receives. That replica's own state looks identical whether the
          write happened or not — it has no way to tell those two histories apart.
        </>
      ),
      duration: 4.8,
      fig: "splitting the chapter's three replicas into one isolated, two together: the isolated replica's state is identical whether the majority committed a write or nothing happened at all",
      Visual: S.RevealProof,
    },
    {
      title: 'Reveal: "pick two" is wrong, and why',
      body: (
        <>
          A partition isn't a choice; it happens or it doesn't. The real choice, once one is
          underway, is consistency versus availability, decided per operation, not declared once
          for the whole system. A system isn't "AP" the way a label reads — it's AP for this
          request, right now.
        </>
      ),
      duration: 4.8,
      fig: '"pick two" misreads the theorem: a partition happens or not, it is not chosen; the real choice, consistency versus availability, is made per operation during a partition, not declared once as a system-wide label',
      takeaway: "CP and AP describe a per-operation choice during a partition, not a label stamped once on a whole system.",
      Visual: S.RevealMisreading,
    },
    {
      title: "Reveal: PACELC's else-branch",
      body: (
        <>
          If there's a partition, choose availability or consistency. Else — even with no
          partition at all — choose latency or consistency, because replicating before answering
          costs time. Dynamo-family systems give up consistency in both branches; fully ACID
          systems pay for it in both; PNUTS splits the two.
        </>
      ),
      duration: 4.8,
      fig: "PACELC's else-branch: with no partition, a system still chooses between latency and consistency; Dynamo-family systems are PA/EL, ACID systems PC/EC, PNUTS splits the two as PC/EL",
      Visual: S.RevealPacelc,
    },
    {
      title: 'Reveal: Spanner is "effectively CA", not literally',
      body: (
        <>
          Spanner's own architect answers directly: technically no, Spanner is a CP system,
          because partitions can and do happen. Effectively yes, because Google's private network
          makes them rare enough that users can plan as if they don't. That "effectively" is a
          statement about probability, not an exception to the theorem.
        </>
      ),
      duration: 4.8,
      fig: 'Spanner is "technically" a CP system, "effectively" treated as CA because partitions are rare on a private network — a statement about probability, not an exception to the theorem',
      takeaway: '"Effectively CA" describes how rarely a system pays CAP\'s cost, never one that has found a way around paying it.',
      Visual: S.RevealSpanner,
    },
    {
      title: 'Recap',
      body: (
        <>
          Atomic, available, partition tolerant: not all three. The proof is one replica unable
          to tell two histories apart. "Pick two" is a per-operation choice, not a label.
          PACELC adds the trade a system makes with no partition at all. Spanner's "CA" is
          probability, not an exemption.
        </>
      ),
      duration: 4.8,
      fig: 'atomic, available, partition tolerant cannot all hold; the proof is one replica unable to distinguish two histories; CP/AP is per-operation; PACELC adds the no-partition trade; Spanner\'s "CA" is probability, not exemption',
      takeaway: "CAP is a precise impossibility proof about one moment of indecision, not a slogan about picking a side forever.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it: a system that has never yet experienced a partition — does CAP apply?',
      body: (
        <>
          A system has run for years without a single network partition. Its designers argue CAP
          doesn't really apply to them, since the condition it depends on has never actually
          occurred. Are they right?
        </>
      ),
      duration: 2.8,
      fig: "a system that has run for years without a network partition argues CAP doesn't apply to it — is that right?",
      predict: {
        options: [
          { label: "Yes — CAP is conditional on a partition occurring, and until one does the system is free to claim consistency and availability both" },
          { label: "No — the theorem is about what the system's design must do if a partition occurs, not about its luck so far", correct: true },
        ],
        explain: (
          <>
            No. The theorem constrains what any correct design has to sacrifice once a partition
            happens — it says nothing about how often that will be. A system that has gotten
            lucky still has an answer baked into its design for the moment it isn't, and that
            answer is exactly what CAP forces a choice about.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
