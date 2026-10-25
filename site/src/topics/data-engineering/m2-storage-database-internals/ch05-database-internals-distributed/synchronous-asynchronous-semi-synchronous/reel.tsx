import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// One real measured experiment against this sandbox's real Postgres cluster (examples.py):
// synchronous_commit = on vs off, the identical acknowledgement-wait mechanism the documentation
// describes for synchronous replication, measured locally against this sandbox's own WAL.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A primary just told a client its write committed. Is that write anywhere else yet —
          and does the answer even matter, until something fails?
        </>
      ),
      duration: 4.8,
      fig: 'the primary says committed. Is anyone else told yet?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: asynchronous',
      body: (
        <>
          Fire and forget. The primary commits, tells the client, and ships the change to the
          replica whenever it gets to it. No wait at all.
        </>
      ),
      duration: 4.8,
      fig: 'commit, tell the client, ship it later. No wait at all.',
      Visual: S.RevealAsynchronous,
    },
    {
      title: 'Predict: what does synchronous replication cost instead?',
      body: (
        <>
          Synchronous replication removes that risk of losing an already-acknowledged commit.
          What does it cost instead?
        </>
      ),
      duration: 2.8,
      fig: 'remove the lost-commit risk. What do you pay for that?',
      predict: {
        options: [
          { label: 'Nothing — confirming the replica got it first is effectively free' },
          { label: "Every commit now waits on the replica's own round trip", correct: true },
        ],
        explain: (
          <>
            Confirming the replica got it first means the commit can't return until that
            confirmation arrives. That wait is real, and it's paid on every single commit, not
            just the ones that would have mattered.
          </>
        ),
      },
      Visual: S.PredictSynchronousCost,
    },
    {
      title: 'Reveal: synchronous, measured',
      body: (
        <>
          The commit waits for confirmation before it returns. This sandbox has no second host,
          so the same wait is measured locally, against this sandbox's own write-ahead log.
        </>
      ),
      duration: 4.8,
      fig: "commit, then wait. Measured locally: waiting costs real time.",
      Visual: S.RevealSynchronousMeasured,
    },
    {
      title: 'Reveal: what synchronous risks',
      body: (
        <>
          Every commit pays that wait, and the transaction's own locks are held for the whole of
          it. A slow or unreachable replica doesn't just delay one write.
        </>
      ),
      duration: 4.8,
      fig: 'the wait holds locks too. A slow replica stalls real writes.',
      takeaway: "Asynchronous risks a lost commit. Synchronous risks a stalled write. Neither mode is free, only free of a different cost.",
      Visual: S.RevealWhatSynchronousRisks,
    },
    {
      title: 'Reveal: semi-synchronous',
      body: (
        <>
          The middle ground: wait for just one replica's own acknowledgement, with a timeout
          that falls back to asynchronous if it goes quiet.
        </>
      ),
      duration: 4.8,
      fig: 'wait for just one reply. Go quiet, and it falls back to async.',
      takeaway: 'Semi-synchronous is a bet with a timer on it. Go quiet too long, and the guarantee it offered quietly disappears.',
      Visual: S.RevealSemiSynchronous,
    },
    {
      title: 'Reveal: failover and promotion, basics',
      body: (
        <>
          When the primary is gone, a replica is promoted to take its place. One real command
          triggers it, named directly from the documentation.
        </>
      ),
      duration: 4.8,
      fig: 'the primary is gone. One command promotes a replica in its place.',
      takeaway: 'Promotion is a one-way door. The old primary does not get its role back just by coming back online.',
      Visual: S.RevealFailoverPromotion,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three modes, three honest trade-offs: lose a commit, stall a write, or bet on one
          replica with a timeout underneath it.
        </>
      ),
      duration: 4.8,
      fig: 'lose a commit, stall a write, or bet with a timer. Pick one.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
