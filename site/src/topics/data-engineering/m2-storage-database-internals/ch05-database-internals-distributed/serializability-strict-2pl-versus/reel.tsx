import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real experiments against this sandbox's real Postgres cluster under SERIALIZABLE
// (examples.py): topic 12's own doctors scenario rerun unchanged, now catching one of the two
// transactions with a real serialization failure; a real retry loop that correctly stays on
// call once it reads the post-commit state; and the same contention shape scaled from two
// transactions to six, with a measured abort rate rising from one of two to five of six.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The exact same two doctors. The exact same rule. The exact same disjoint writes that
          broke cleanly last topic. Rerun it one isolation level stricter.
        </>
      ),
      duration: 4.8,
      fig: 'same scenario, one isolation level stricter. One of the two transactions does not survive.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: strict two-phase locking',
      body: (
        <>
          Lock everything you touch. Hold every lock until you commit. Block anyone else who
          wants in. A cycle of blocking is a deadlock, rolled back; everyone else never overlaps.
        </>
      ),
      duration: 4.8,
      fig: 'lock on touch, hold until commit, block the rest. A blocking cycle: rolled back.',
      Visual: S.RevealStrict2PL,
    },
    {
      title: "Reveal: SSI's own mechanism",
      body: (
        <>
          Run snapshot isolation exactly as before — nothing blocks. But watch the read-write
          conflicts between concurrent transactions for one specific, checkable pattern.
        </>
      ),
      duration: 4.8,
      fig: 'snapshot isolation, unchanged. Plus one thing watched: read-write conflicts, concurrently.',
      Visual: S.RevealSSIMechanism,
    },
    {
      title: 'Predict: both routes guarantee the exact same thing',
      body: (
        <>
          Strict locking and SSI both promise full serializability. Do they cost the same thing
          to actually deliver it?
        </>
      ),
      duration: 2.8,
      fig: 'same guarantee, both routes. Same cost to get there, or two different bills?',
      predict: {
        options: [
          { label: 'Yes — serializability is one guarantee, so the cost converges too' },
          { label: 'No — one pays in blocking, the other pays in aborted retries', correct: true },
        ],
        explain: (
          <>
            The guarantee really is identical — both forbid every anomaly. What differs is where
            the cost lands: one route makes transactions wait, the other lets them run and
            sometimes throws work away afterward.
          </>
        ),
      },
      Visual: S.PredictSameCost,
    },
    {
      title: 'Reveal: the dangerous structure',
      body: (
        <>
          Two concurrent transactions, each reading what the other is about to write, chained
          through a pivot in the middle. Find that exact shape, and you've found write skew.
        </>
      ),
      duration: 4.8,
      fig: 'Tin reads what Tpivot will write. Tpivot reads what Tout will write. The pattern itself.',
      Visual: S.RevealDangerousStructure,
    },
    {
      title: 'Reveal: SERIALIZABLE catches the doctors',
      body: (
        <>
          The exact rerun, measured. One doctor's own commit succeeds. The other gets a real
          serialization failure — the same anomaly snapshot isolation let straight through.
        </>
      ),
      duration: 4.8,
      fig: 'one commit succeeds. One gets a real serialization failure. Measured, not assumed.',
      takeaway: 'The same two writes — one isolation level is all that separates a broken invariant from a caught one.',
      Visual: S.RevealCatchesDoctors,
    },
    {
      title: 'Reveal: a real retry, succeeding',
      body: (
        <>
          The caught doctor retries, from scratch, on a fresh snapshot. This time the count is
          real: the other doctor already left. The check comes out differently, correctly.
        </>
      ),
      duration: 4.8,
      fig: 'retry, fresh snapshot, real count. The same check, a different and correct answer.',
      Visual: S.RevealRetrySucceeds,
    },
    {
      title: 'Reveal: throughput and false positives, the real cost on each side',
      body: (
        <>
          Strict locking blocks, and can deadlock, under contention. SSI never blocks — but it
          sometimes aborts a transaction that would actually have been perfectly fine.
        </>
      ),
      duration: 4.8,
      fig: 'locking: blocks, can deadlock. SSI: never blocks, sometimes aborts for nothing.',
      takeaway: 'Serializability is never free. The only real choice is which bill you want to pay: waiting, or retrying.',
      Visual: S.RevealThroughputFalsePositives,
    },
    {
      title: 'Reveal: abort rate, measured as contention rises',
      body: (
        <>
          The same shape of contention, scaled from two transactions sharing one invariant to
          six. The real, measured abort rate jumps as the sharing gets more crowded.
        </>
      ),
      duration: 4.8,
      fig: 'two transactions: half aborted. Six transactions: most of them aborted. Measured directly.',
      takeaway: 'More transactions sharing one invariant means more chances for a dangerous structure, and a rising abort rate to prove it.',
      Visual: S.RevealAbortRateContention,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two routes, one guarantee. One pays its bill in blocking and deadlocks. The other pays
          its bill in false-positive aborts and mandatory retries.
        </>
      ),
      duration: 4.8,
      fig: 'one guarantee, two routes, two different bills — blocking, or retrying.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A workload with heavy write-write contention concentrated on a handful of hot rows.
          Which route handles that better: strict locking, or SSI?
        </>
      ),
      duration: 2.8,
      fig: 'heavy contention, a few hot rows. Blocking locks, or an optimistic snapshot that retries?',
      predict: {
        options: [
          { label: "SSI — it never blocks, so hot rows can't slow anyone else down", correct: false },
          { label: 'Strict locking — predictable blocking beats repeatedly aborting on the same hot rows', correct: true },
        ],
        explain: (
          <>
            SSI's own abort rate rises fastest exactly where reads and writes overlap most
            densely — a few very hot rows is its worst case, not its best one. Strict locking's
            blocking is at least predictable there, which is usually the better trade.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
