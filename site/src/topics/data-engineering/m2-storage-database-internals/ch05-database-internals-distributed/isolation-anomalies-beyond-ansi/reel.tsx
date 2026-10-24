import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real two-transaction timelines, forced into their exact interleaving and measured
// against a real Postgres cluster in this sandbox (examples.py): a lost update under Read
// Committed (T1 commits 110, T2 commits 120 off the same stale read, final balance 120); a read
// skew under Read Committed (T1 reads x=50, then rereads y=80 after T2's commit, an inconsistent
// pair inside one transaction); and a dirty write genuinely blocked by real row-level locking (T2's
// own UPDATE blocks for roughly 0.3 seconds, matching T1's own hold time, before applying).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two transactions. Two clean commits. Neither one ever errors. Ten dollars is gone
          anyway. Nothing in the database's own response told anyone it happened.
        </>
      ),
      duration: 4.8,
      fig: "two commits, no errors. Ten dollars, gone anyway. What actually happened?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the ANSI vocabulary',
      body: (
        <>
          ANSI SQL-92 names four phenomena precisely: a dirty write, a dirty read, a
          non-repeatable read, a phantom. Four different ways concurrency can go wrong.
        </>
      ),
      duration: 4.8,
      fig: 'four named phenomena: dirty write, dirty read, non-repeatable read, phantom.',
      Visual: S.RevealAnsiVocabulary,
    },
    {
      title: 'Predict: who reads the same rule the same way?',
      body: (
        <>
          Two engineers each read ANSI's own English definition of a dirty read and write code
          to detect it. Do they end up enforcing the exact same rule?
        </>
      ),
      duration: 2.8,
      fig: "two engineers, one English sentence. Same rule enforced, or two different ones?",
      predict: {
        options: [
          { label: 'Yes — the definition is precise enough that any correct reading agrees' },
          { label: 'No — the same sentence genuinely supports two different, defensible rules', correct: true },
        ],
        explain: (
          <>
            It reads like a precise definition, which is exactly why this is surprising. The
            same sentence really does support a narrow reading and a broader one — and they
            prohibit different sets of histories.
          </>
        ),
      },
      Visual: S.PredictSameRuleSameWay,
    },
    {
      title: 'Reveal: the ambiguity, exposed',
      body: (
        <>
          The narrow reading only blocks a read of an aborted write. The broad reading blocks
          any read before the writer even decides to commit or abort. Same English, two rules.
        </>
      ),
      duration: 4.8,
      fig: 'narrow: blocks reads of aborted writes. Broad: blocks reads before any decision at all.',
      Visual: S.RevealAmbiguityExposed,
    },
    {
      title: 'Reveal: Lost Update, a real timeline',
      body: (
        <>
          A real forced timeline against a real Postgres table. T1 reads one hundred, writes and
          commits one hundred ten. T2 reads that same stale one hundred, writes and commits one
          hundred twenty — after T1's own commit. The final balance is one hundred twenty.
        </>
      ),
      duration: 4.8,
      fig: 'T1 commits 110. T2 commits 120, off the same stale read. Final: 120.',
      Visual: S.RevealLostUpdate,
    },
    {
      title: 'Reveal: Read Skew and Write Skew',
      body: (
        <>
          T1 reads x, then T2 updates both x and y and commits, then T1 rereads y — an
          inconsistent pair, inside one transaction. Write skew is the two-writer version of the
          same shape: each transaction looks correct alone; only the two commits together break it.
        </>
      ),
      duration: 4.8,
      fig: 'T1 reads x, then rereads y after T2 commits. One transaction, an inconsistent pair.',
      takeaway: 'Read skew and write skew share one gap: what you saw is not what the database looked like at commit.',
      Visual: S.RevealReadWriteSkew,
    },
    {
      title: 'Reveal: Dirty Write, blocked anyway',
      body: (
        <>
          ANSI only forces a dirty write to be blocked at its strictest level. A real engine's
          row-level locking blocks it everywhere: a second writer to the same row genuinely
          waits, measured, for as long as the first transaction holds it.
        </>
      ),
      duration: 4.8,
      fig: 'the second writer blocks for roughly the first transaction’s own hold time, measured.',
      Visual: S.RevealDirtyWriteBlocked,
    },
    {
      title: 'Predict #2',
      body: (
        <>
          A transaction that performs no writes at all — only reads. Can it still see a state
          that no real order of execution could ever have actually produced?
        </>
      ),
      duration: 2.8,
      fig: 'a read-only transaction. Can it still see an impossible state?',
      predict: {
        options: [
          { label: "No — with nothing to write, there's nothing for it to get wrong" },
          { label: 'Yes — a reader can see a state no serial execution could have produced', correct: true },
        ],
        explain: (
          <>
            "It only reads, so it can't be the problem" is the intuitive answer. It's wrong — the
            reader itself is innocent, but what it's handed can still be an impossible state.
          </>
        ),
      },
      Visual: S.PredictReadOnlyAnomaly,
    },
    {
      title: 'Reveal: the read-only transaction anomaly',
      body: (
        <>
          A reader can see a state that could not occur in any serial execution leading to the
          database's own actual final state — even though the reader wrote nothing at all.
        </>
      ),
      duration: 4.8,
      fig: 'a reader, no writes of its own. The state it sees: one no serial order could reach.',
      takeaway: "The read-only transaction anomaly proves innocence isn't isolation. Writing nothing doesn't protect you from an impossible view.",
      Visual: S.RevealReadOnlyAnomaly,
    },
    {
      title: "Reveal: Adya's formalization, the real fix",
      body: (
        <>
          Instead of English sentences, a graph of real dependencies between transactions. An
          anomaly becomes a cycle in that graph — checkable, not arguable.
        </>
      ),
      duration: 4.8,
      fig: 'a dependency graph between transactions. An anomaly: a cycle, not a sentence to argue about.',
      takeaway: 'A cycle in a graph has one answer. An English sentence about transactions turned out to have two.',
      Visual: S.RevealAdyaFormalization,
    },
    {
      title: 'Recap',
      body: (
        <>
          Eight named anomalies. One real reason ANSI's own definitions kept slipping past
          engineers. One formal graph that finally closed the gap.
        </>
      ),
      duration: 4.8,
      fig: 'eight anomalies, one ambiguity, one graph that made every one of them checkable.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          T1 reads a doctor count of two. T2 reads the same count of two, then both doctors take
          themselves off call and both commit. Zero doctors on call. Which anomaly is this?
        </>
      ),
      duration: 2.8,
      fig: 'two reads, two independent commits, an invariant broken across both. Which anomaly?',
      predict: {
        options: [
          { label: 'Lost update — one commit silently overwrote the other' },
          { label: 'Write skew — both transactions read a shared constraint, then each wrote a different part of it', correct: true },
        ],
        explain: (
          <>
            No value was overwritten — both writes survive, to different rows. That rules out
            lost update. Two transactions reading one shared constraint, then each independently
            writing a different piece of it, is exactly write skew.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
