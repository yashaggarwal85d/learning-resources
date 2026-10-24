import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py): deleting half of 300 rows
// leaves that many dead tuples, reclaimed to 0 by VACUUM; 300 updates to an unindexed column leave a
// table's own index size unchanged, while 300 updates to the indexed column double it; a fresh
// table's age(relfrozenxid) drops to 0 right after VACUUM FREEZE; and holding one
// REPEATABLE READ transaction open through 600 concurrent updates leaves a VACUUM run during
// that window unable to reclaim any of the 600 dead tuples it created, reclaiming all of them
// only once the transaction is released. The exact wraparound warning/error thresholds and the
// Sentry outage are sourced directly from Postgres's own documentation and Sentry's own
// postmortem, not reproduced, since reaching real wraparound needs billions of transactions.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Postgres's own append-only design never overwrites a row in place. Every update leaves
          an old version behind. Something has to clean that up — and something can stop it from
          running at all.
        </>
      ),
      duration: 4.8,
      fig: 'every update leaves an old version behind. Who cleans that up?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a dead tuple, counted directly',
      body: (
        <>
          Delete half of 300 rows on this sandbox's own cluster, and the leftover row versions
          show up directly in Postgres's own statistics — not removed, just marked dead. VACUUM
          is the only thing that reclaims that space for reuse.
        </>
      ),
      duration: 4.8,
      fig: 'half of 300 rows, deleted. A real dead-tuple count, measured — then VACUUM runs.',
      takeaway: "A dead tuple is MVCC's own leftover. Nothing but VACUUM gets that space back.",
      Visual: S.RevealDeadTuple,
    },
    {
      title: 'Reveal: HOT updates, the free optimization',
      body: (
        <>
          The same 300 updates, on the same table, cost a completely different amount depending
          on one thing: which column changed. Touch no indexed column, and the index's own size,
          measured directly, never moves. Touch the indexed column, and it doubles.
        </>
      ),
      duration: 4.8,
      fig: "the same update, two columns: one leaves the table's own index untouched, one doubles it.",
      takeaway: 'A heap-only tuple update skips the index entirely. Touch an indexed column, and that saving is gone.',
      Visual: S.RevealHotUpdate,
    },
    {
      title: 'Predict: what actually pins the cleanup',
      body: (
        <>
          A table keeps growing even though nothing looks wrong with its queries. Autovacuum is
          running. What's actually holding it back?
        </>
      ),
      duration: 2.8,
      fig: "a table keeps growing. Autovacuum is running. What's actually holding it back?",
      predict: {
        options: [
          { label: "Autovacuum is just falling behind under load" },
          { label: 'Something is still holding an old snapshot open', correct: true },
        ],
        explain: (
          <>
            "Falling behind" is the usual answer to "why is this slow," so it feels right here
            too — but VACUUM isn't behind schedule. It's refusing, correctly, to reclaim a row an
            open snapshot might still need.
          </>
        ),
      },
      Visual: S.PredictPinned,
    },
    {
      title: 'Reveal: the xmin horizon, held open',
      body: (
        <>
          Three real, named things hold that same horizon open, sourced directly from Postgres's
          own documentation: a transaction left running, a stale prepared transaction nobody
          committed, an abandoned replication slot nobody dropped.
        </>
      ),
      duration: 4.8,
      fig: 'three real doors onto one held-open horizon: a transaction, a prepared transaction, a replication slot.',
      Visual: S.RevealXminHorizon,
    },
    {
      title: 'Reveal: bloat, charted live',
      body: (
        <>
          Hold one transaction open on this sandbox's own cluster through 600 concurrent updates,
          then run VACUUM anyway: it reclaims nothing, measured directly. Release the
          transaction, run VACUUM again, and every dead tuple it left behind is gone.
        </>
      ),
      duration: 4.8,
      fig: '600 real updates, one transaction held open, VACUUM run anyway. What does it reclaim?',
      takeaway: 'VACUUM can run and still reclaim nothing. An open snapshot, not a broken job, is usually why.',
      Visual: S.RevealBloatCharted,
    },
    {
      title: "Reveal: autovacuum's own knobs",
      body: (
        <>
          Autovacuum isn't on a clock. It reacts once a table's own obsolete-tuple count crosses
          a threshold built from a base value plus a scale factor times its row count — and once
          a worker is running specifically to prevent wraparound, nothing interrupts it.
        </>
      ),
      duration: 4.8,
      fig: "autovacuum reacts to a threshold, not a schedule. What's actually in that threshold?",
      Visual: S.RevealAutovacuumKnobs,
    },
    {
      title: 'Reveal: freezing and the wraparound shutdown',
      body: (
        <>
          Transaction IDs are compared in a circle, not a line, so Postgres freezes old rows to
          keep that circle safe — measured directly, a fresh table's own freeze age resets the
          moment VACUUM FREEZE runs. Ignore it for long enough, and Postgres stops taking writes
          on purpose, the way Sentry's own production cluster did in 2015.
        </>
      ),
      duration: 4.8,
      fig: "a real freeze age, reset by VACUUM FREEZE, next to a real outage: Sentry, 2015.",
      takeaway: 'Freezing keeps a fixed-size counter safe to wrap. Skip it long enough, and Postgres stops writes on purpose.',
      Visual: S.RevealWraparound,
    },
    {
      title: 'Recap',
      body: (
        <>
          One mechanism at three scales: a dead tuple on one row, a held-open horizon on one
          table, an unfrozen counter on an entire cluster — and a real outage when nothing stops
          any of them.
        </>
      ),
      duration: 4.8,
      fig: 'one mechanism, three scales: a dead tuple, a held-open horizon, an unfrozen counter.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Sentry's own cluster just hit wraparound protection. The internet's advice is to
          disable autovacuum so it stops interfering. Is that the fix?
        </>
      ),
      duration: 2.8,
      fig: "Sentry's cluster hits wraparound protection. Disable autovacuum to stop it interfering — is that the fix?",
      predict: {
        options: [
          { label: 'Yes — disable it so nothing fights the recovery' },
          { label: "No — find what's pinning the horizon, then let vacuum finish, then retune it", correct: true },
        ],
        explain: (
          <>
            Sentry's own postmortem calls "disable autovacuum" out by name as the common advice
            — and the exact opposite of the fix. Postgres's documented recovery is the second
            option: resolve what's pinning the horizon, let vacuum finish, then tune the
            thresholds that let this happen.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
