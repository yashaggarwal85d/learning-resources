import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a sequential-consistency checker that drops the real-time rule and finds a legal
// total order for a stale-but-program-order-respecting history; a causal-consistency checker
// over the chat example showing two replies free to swap but never preceding the question; and
// one small violating history for each of the four session guarantees. No literal digits
// anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one comment, three anomalies',
      body: (
        <>
          A user posts a comment and refreshes. The comment is missing. They refresh again — it's
          there. On a friend's screen, a reply to that comment shows up before the comment it's
          replying to. Three different anomalies, from one always-available store.
        </>
      ),
      duration: 4.8,
      fig: "a comment vanishes on refresh then reappears; on another screen a reply to it appears before the comment itself — three anomalies from one always-available store",
      Visual: S.Hook,
    },
    {
      title: 'Predict: which weakest model forbids all three?',
      body: (
        <>
          For a store that always stays available, even through a partition, which is the
          weakest model that rules out every one of those three anomalies: sequential
          consistency, causal consistency, or linearizability?
        </>
      ),
      duration: 2.8,
      fig: 'for an always-available store, which weakest model forbids all three anomalies: sequential consistency, causal consistency, or linearizability?',
      predict: {
        options: [
          { label: 'Linearizability — the strongest model rules out the most, so it must be the one that forbids all three' },
          { label: "Causal consistency — it's the strongest model that can stay available through every partition", correct: true },
        ],
        explain: (
          <>
            Causal consistency. Linearizability and sequential consistency both require giving up
            availability during a partition — neither is an option for a store that promises to
            always answer. Causal consistency is the strongest model that doesn't make that
            trade.
          </>
        ),
      },
      Visual: S.PredictModel,
    },
    {
      title: 'Reveal: sequential consistency keeps one order, drops real time',
      body: (
        <>
          Sequential consistency still demands a single total order for every operation, and that
          order has to respect each process's own program order. What it drops, compared to
          linearizability, is the real-time rule — a read that starts after a write finishes is
          still allowed to return the old value.
        </>
      ),
      duration: 4.8,
      fig: "sequential consistency: one total order, every process's own program order respected inside it, but no requirement that the order track real time",
      Visual: S.RevealSequential,
    },
    {
      title: 'Reveal: causal consistency orders only cause and effect',
      body: (
        <>
          In the chat example, Attiya asks whether to have lunch; Barbarella and Cyrus answer. Every
          participant sees the question before either answer — that's the causal link. But the two
          answers are concurrent, so different participants are free to see them in either order.
        </>
      ),
      duration: 4.8,
      fig: 'causal consistency: everyone sees the question before either answer, since answering depends on reading the question; the two answers are concurrent and may be seen in either order',
      Visual: S.RevealCausal,
    },
    {
      title: 'Reveal: causal is the ceiling for a store that never refuses',
      body: (
        <>
          A precise result, not a slogan: a slightly stronger version of causal consistency is
          proven to be the strongest model obtainable in a system that is always available and
          one-way convergent. Drop either of those two conditions and a stronger model becomes
          possible again — they're load-bearing, not decoration.
        </>
      ),
      duration: 4.8,
      fig: 'real-time causal consistency is proven to be the strongest model obtainable in a system that is always available and one-way convergent — both conditions are load-bearing',
      takeaway: "Causal consistency is the strongest model a store that never refuses to answer can actually prove it has.",
      Visual: S.RevealCeiling,
    },
    {
      title: 'Reveal: four session guarantees, each one breakable alone',
      body: (
        <>
          Read-your-writes: your own next read sees your own last write. Monotonic reads: your
          reads never regress. Monotonic writes: your writes land everywhere in the order you
          made them. Writes-follow-reads: a write you make after a read can never appear before
          what you read. Each one fails on its own, independently of the other three.
        </>
      ),
      duration: 4.8,
      fig: 'read-your-writes, monotonic reads, monotonic writes, and writes-follow-reads, each defined precisely and each breakable on its own, independently of the other three',
      Visual: S.RevealSessionGuarantees,
    },
    {
      title: "Reveal: what this doesn't claim",
      body: (
        <>
          The hook's vanishing comment breaks read-your-writes; the out-of-order reply breaks
          writes-follow-reads. Together, the four guarantees are often said to add up to causal
          consistency — but that equivalence takes more reading than this topic's sources settle,
          so it's not asserted here.
        </>
      ),
      duration: 4.8,
      fig: "the hook's two anomalies map exactly to read-your-writes and writes-follow-reads broken; whether all four guarantees together amount to causal consistency is a claim this topic does not make",
      takeaway: 'A precise definition that refuses to claim more than its sources support beats a tidy, overreaching slogan.',
      Visual: S.RevealWhatIsNotClaimed,
    },
    {
      title: 'Recap',
      body: (
        <>
          Sequential consistency: one total order, program order kept, real time dropped. Causal
          consistency: only cause and effect ordered, and provably the ceiling for a store that's
          always available and one-way convergent. Four session guarantees, defined and broken
          one at a time.
        </>
      ),
      duration: 4.8,
      fig: 'sequential consistency drops real time; causal consistency orders only cause and effect and is the proven ceiling under always-available, one-way convergence; four session guarantees, each independently breakable',
      takeaway: 'Weaker than linearizable is a ladder, not one thing, and where a store sits is a provable claim.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: read-your-writes and monotonic reads, but no causal guarantee — is it causally consistent?',
      body: (
        <>
          A store guarantees read-your-writes and monotonic reads to every client, nothing more.
          Does holding those two session guarantees make it causally consistent?
        </>
      ),
      duration: 2.8,
      fig: 'a store guarantees only read-your-writes and monotonic reads to its clients — does that make it causally consistent?',
      predict: {
        options: [
          { label: 'Yes — between them, those two guarantees cover every causal dependency a client could create' },
          { label: "No — neither guarantee says anything about a dependency created on one client and observed by a different one", correct: true },
        ],
        explain: (
          <>
            No. Both guarantees are properties of a single client's own session — they say
            nothing about what a different client observes. The chat example's causal link, Attiya's
            question reaching Barbarella before her answer does, is exactly the kind of
            cross-client dependency read-your-writes and monotonic reads don't cover.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
