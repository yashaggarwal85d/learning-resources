import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two real measured experiments against this sandbox's real Postgres cluster (examples.py), using
// PREPARE TRANSACTION: a prepared transaction stays invisible until committed from a separate
// session, and keeps holding its own locks until it's resolved.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          One order has to touch two engines at once, the inventory database and the payments
          database, and both must agree to commit or neither should. Shaking hands over a network
          isn't simple.
        </>
      ),
      duration: 4.8,
      fig: 'two databases, one order. Both commit, or neither does.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: Phase 1, prepare',
      body: (
        <>
          The coordinator asks every participant to prepare: can you guarantee you could commit
          this, if asked? Each one answers, having already stably recorded what it would need to
          follow through.
        </>
      ),
      duration: 4.8,
      fig: 'prepare asks a guarantee, not a promise to try.',
      Visual: S.RevealPhaseOnePrepare,
    },
    {
      title: 'Reveal: Phase 2, commit',
      body: (
        <>
          Only after every participant says yes does the coordinator record its own decision
          stably, then tell everyone to actually commit.
        </>
      ),
      duration: 4.8,
      fig: 'the decision is recorded first. The order to commit comes after.',
      Visual: S.RevealPhaseTwoCommit,
    },
    {
      title: 'Predict: what happens to the participants if the coordinator itself goes silent',
      body: (
        <>
          The coordinator gives every order here. What happens to the participants if the
          coordinator itself goes silent between the two phases?
        </>
      ),
      duration: 2.8,
      fig: 'both participants said yes. Then the coordinator goes silent.',
      predict: {
        options: [
          { label: 'Each participant times out on its own and decides independently' },
          { label: "Each one just sits there, prepared and locked, waiting to be told", correct: true },
        ],
        explain: (
          <>
            A prepared participant can't safely decide on its own — it already promised it could
            commit, so guessing wrong either way could break the whole transaction. It just
            waits, still holding what it holds, until some session resolves it.
          </>
        ),
      },
      Visual: S.PredictCoordinatorSilent,
    },
    {
      title: 'Reveal: prepared, for real',
      body: (
        <>
          This sandbox's own Postgres, PREPARE TRANSACTION, measured directly: the change is
          invisible to every other session until a separate session, never the one that prepared
          it, commits it.
        </>
      ),
      duration: 4.8,
      fig: 'prepared and invisible, until a different session commits it.',
      Visual: S.RevealPreparedForReal,
    },
    {
      title: 'Reveal: still holding its locks, measured',
      body: (
        <>
          The same prepared transaction, still unresolved, makes a second, concurrent writer
          wait. Measured directly: it blocks for as long as the transaction stays unresolved.
        </>
      ),
      duration: 4.8,
      fig: 'a prepared transaction still holds its row. A second writer waits.',
      takeaway: 'Prepared is not finished. A transaction can sit there, still holding its own locks, until some other session resolves it.',
      Visual: S.RevealHoldsLocks,
    },
    {
      title: 'Reveal: the in-doubt state, named',
      body: (
        <>
          This is exactly what a coordinator failure leaves behind: locks held, nothing resolved,
          for as long as nobody steps in. Postgres's own documentation warns against ever leaving
          it long.
        </>
      ),
      duration: 4.8,
      fig: 'locks held, nothing resolved. Left too long, this can force a shutdown.',
      takeaway: 'A coordinator failure does not undo the prepare. It leaves every participant stuck in doubt, holding locks, until someone intervenes.',
      Visual: S.RevealInDoubtNamed,
    },
    {
      title: 'Reveal: XA in practice',
      body: (
        <>
          The vendor-neutral standard those two commands implement: one negative reply vetoes the
          whole transaction, and a participant's own affirmative prepare is a guarantee it can
          still follow through later, even after its own failure.
        </>
      ),
      duration: 4.8,
      fig: 'one no vetoes everyone. One yes is a guarantee, not a guess.',
      takeaway: "Presumed rollback is a safety choice. When the coordinator can't confirm a decision, undoing is recoverable, finishing one isn't.",
      Visual: S.RevealXaInPractice,
    },
    {
      title: 'Reveal: distributed SQL hides this behind consensus',
      body: (
        <>
          Spanner's own participant leader and coordinator leader are each backed by their own
          Paxos group, so the fragile single coordinator this topic just measured is itself made
          durable by consensus, not assumed away.
        </>
      ),
      duration: 4.8,
      fig: 'the coordinator is not one process anymore. It is a whole Paxos group.',
      Visual: S.RevealDistributedSqlConsensus,
    },
    {
      title: 'Recap',
      body: (
        <>
          Prepare asks a guarantee. Commit spends it. The in-doubt gap between them is real,
          measured, and exactly what every production 2PC implementation exists to shrink.
        </>
      ),
      duration: 4.8,
      fig: 'ask the guarantee, then spend it. The gap between is what gets engineered away.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A payment and an inventory decrement must commit together across two databases. The
          coordinator crashes one second after telling both to prepare, before either is told to
          commit.
        </>
      ),
      duration: 2.8,
      fig: 'both said yes to prepare. The coordinator crashed before telling either to commit.',
      predict: {
        options: [
          { label: 'Both databases roll back automatically, since no commit order ever arrived' },
          { label: 'Both stay prepared and locked, in doubt, until a session resolves each one', correct: true },
        ],
        explain: (
          <>
            Neither database can safely decide alone — each already guaranteed it could commit
            if asked. Both sit prepared and locked, exactly what this topic's own measurements
            showed, until the coordinator recovers or an operator steps in to resolve each one.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
