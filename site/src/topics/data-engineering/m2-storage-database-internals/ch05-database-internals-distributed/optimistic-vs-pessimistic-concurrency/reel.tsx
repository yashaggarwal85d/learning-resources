import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real measured comparisons against this sandbox's real Postgres cluster (examples.py): the
// identical 8-worker/300-op workload, run under SELECT ... FOR UPDATE and a version-column
// compare-and-set, once against 400 rows and once against 2 rows — a real, measured reversal.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two checkouts touch the same inventory row at once. One of them has to lose. The
          question is how the database finds that out — and what it costs to ask.
        </>
      ),
      duration: 4.8,
      fig: 'two checkouts, one row. One loses. How, and at what cost?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: pessimistic, for real',
      body: (
        <>
          SELECT ... FOR UPDATE: lock the row before anyone even knows there's really a conflict.
          Topic 14's own mechanism, reused here as one side of the choice.
        </>
      ),
      duration: 4.8,
      fig: 'lock first, find out never. Blocks before a conflict is even possible.',
      Visual: S.RevealPessimistic,
    },
    {
      title: 'Reveal: optimistic, a version-column compare-and-set',
      body: (
        <>
          Read the row with no lock at all. Write only if its version hasn't moved. If it has,
          the whole read is thrown away and retried.
        </>
      ),
      duration: 4.8,
      fig: 'no lock, read freely. Write only if nobody beat you there first.',
      Visual: S.RevealOptimistic,
    },
    {
      title: 'Predict: is paying for a lock still worth it when conflicts are rare?',
      body: (
        <>
          Almost nobody collides most of the time. Given that, is paying for a lock still worth
          it — or is that cost wasted on rows nobody else was ever going to touch?
        </>
      ),
      duration: 2.8,
      fig: 'rare conflicts, paid-for locks. Worth it, or wasted?',
      predict: {
        options: [
          { label: "Yes — the lock's own cost barely matters, so it's always safer to pay it" },
          { label: "No — with conflicts this rare, skipping the lock wins on the identical workload", correct: true },
        ],
        explain: (
          <>
            It's tempting to think a lock is cheap insurance regardless. But at a low conflict
            rate, the version-column compare-and-set skips the lock's own overhead entirely and
            almost never has to retry — on the identical workload, that wins outright.
          </>
        ),
      },
      Visual: S.PredictLockWorthIt,
    },
    {
      title: 'Reveal: low conflict, measured',
      body: (
        <>
          The identical workload — 400 rows, 8 workers, 300 increments each — run both ways
          against this sandbox's own cluster. The version-column compare-and-set wins.
        </>
      ),
      duration: 4.8,
      fig: '400 rows, same workload, both ways. The optimistic run finishes first.',
      Visual: S.RevealLowConflict,
    },
    {
      title: 'Reveal: high conflict, measured',
      body: (
        <>
          The same 8 workers, now hammering 2 rows instead of 400. The result reverses:
          pessimistic wins decisively, and the optimistic run burns over five thousand retries.
        </>
      ),
      duration: 4.8,
      fig: '2 rows, same workload, both ways. This time, FOR UPDATE finishes first.',
      takeaway: 'The same workload, the same two strategies, reversed. Conflict rate decided the winner, not either mechanism alone.',
      Visual: S.RevealHighConflict,
    },
    {
      title: 'Reveal: why the crossover happens',
      body: (
        <>
          A blocked pessimistic wait is never wasted — it just queues. Every optimistic retry is
          a full round trip, read and write both, thrown away and redone from scratch.
        </>
      ),
      duration: 4.8,
      fig: 'a queued wait wastes time. A failed retry wastes a whole read and write.',
      takeaway: 'Locking pays in time spent waiting. Optimistic concurrency pays in work thrown away and redone with every collision.',
      Visual: S.RevealWhyCrossover,
    },
    {
      title: 'Reveal: a third flavor, validate-at-commit OCC',
      body: (
        <>
          Not just one row's own version — a whole transaction's whole read set, checked
          together at commit. Topic 13's own SSI, named here as exactly this.
        </>
      ),
      duration: 4.8,
      fig: "one row's version, or a whole transaction's read set — both optimistic, different scope.",
      Visual: S.RevealThirdFlavor,
    },
    {
      title: 'Reveal: the same pattern elsewhere',
      body: (
        <>
          An object-store table format's own commit is a compare-and-swap on one pointer. A
          distributed SQL engine's own commit protocol runs the same bet at cluster scale.
        </>
      ),
      duration: 4.8,
      fig: 'one row, one table pointer, one cluster-wide commit — the same optimistic bet.',
      takeaway: "This isn't a database-only trick. The same optimistic bet reappears wherever detecting a lost race beats preventing one.",
      Visual: S.RevealSamePatternElsewhere,
    },
    {
      title: 'Recap',
      body: (
        <>
          Pessimistic blocks before it knows. Optimistic bets that it won't need to. Which one
          wins is a question conflict rate answers, not instinct.
        </>
      ),
      duration: 4.8,
      fig: 'block first, or bet first — conflict rate decides which one wins.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A "claim this seat" endpoint can use FOR UPDATE or a version-column compare-and-set.
          Traffic is light most of the day, but spikes hard for ninety seconds at on-sale time.
        </>
      ),
      duration: 2.8,
      fig: 'light traffic most of the day, a ninety-second spike at on-sale time. Which one?',
      predict: {
        options: [
          { label: 'Pick one strategy and keep it fixed — the workload is still the same endpoint' },
          { label: 'The right answer flips: optimistic the rest of the day, pessimistic during the spike', correct: true },
        ],
        explain: (
          <>
            It's tempting to assume one endpoint needs one fixed strategy. But conflict rate is
            what decides the winner, not the endpoint's identity — and this endpoint's own
            conflict rate genuinely changes for those ninety seconds, which is exactly the
            reversal this topic just measured.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
