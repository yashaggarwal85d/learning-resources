import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a serializability checker that finds a legal total order for the hook's history by
// placing the refresh BEFORE the order it missed, and finds none that also respects real time;
// the same checker with the fix applied, now also strictly serializable; a case where two
// causally-timed transactions legally serialize in reverse; and the two-axis map as data. The
// Postgres measurement itself (post-notes.md) ran on this sandbox's real PostgreSQL server, not
// simulated. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: confirmed, then refreshed, then gone',
      body: (
        <>
          A customer places an order, sees "confirmed", and immediately refreshes their order
          list. The new order isn't there. The store is documented as serializable, and has no
          bug.
        </>
      ),
      duration: 4.8,
      fig: 'a customer sees "confirmed" then refreshes and the new order is missing, on a store documented as serializable with no bug',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the definition forbid this?',
      body: (
        <>
          Does the serializable definition forbid this refresh, allow it outright, or allow it
          only if the refresh happened to hit a lagging replica?
        </>
      ),
      duration: 2.8,
      fig: 'does the serializable definition forbid the missing-order refresh, allow it outright, or allow it only through a lagging replica?',
      predict: {
        options: [
          { label: 'It allows it only through a lagging replica — on the primary itself this could never happen' },
          { label: 'It allows it outright — the definition constrains the order of transactions and says nothing about real time', correct: true },
        ],
        explain: (
          <>
            It allows it outright. Serializability promises some total order over transactions,
            nothing about when that order has to agree with the clock on the wall. The refresh
            can legally be placed before the order it missed, no replica required.
          </>
        ),
      },
      Visual: S.PredictForbidden,
    },
    {
      title: 'Reveal: serializability is one total order, multi-object, no clock',
      body: (
        <>
          Every transaction, not every operation, lands in one shared total order. That order has
          to be legal — each transaction's reads have to match what came before it in that order
          — but nothing ties the order to real time. Checked against the hook's own history, an
          order exists: refresh first, order second.
        </>
      ),
      duration: 4.8,
      fig: "serializability places every transaction, not operation, in one legal total order with no real-time rule; the hook's history has a legal order with the refresh placed before the order",
      Visual: S.RevealSerializable,
    },
    {
      title: 'Reveal: strict serializability is the same check, real time added back',
      body: (
        <>
          Nothing about the database changes. The checker just adds one more rule: if one
          transaction finished before another began, the order has to agree. Run against the
          identical hook history, no order survives both rules at once.
        </>
      ),
      duration: 4.8,
      fig: 'strict serializability adds one rule, if a transaction finished before another began the serial order must agree; run on the identical hook history, no order satisfies both rules',
      Visual: S.RevealStrict,
    },
    {
      title: 'Reveal: measured on a real Postgres, not assumed',
      body: (
        <>
          A fresh transaction, opened after a sibling's commit finishes, saw the write — real
          time held, as a side effect of snapshot timing, not a promise. A transaction already
          open when a sibling committed did not see that write, even on its very next read. Both
          are real `psql` sessions, not a diagram.
        </>
      ),
      duration: 4.8,
      fig: 'measured on a real PostgreSQL server: a non-overlapping transaction saw a sibling commit; an already-open transaction did not see a sibling that committed mid-flight, even on a later read',
      takeaway: "Whether a deployment respects real time is a measurement to run, not something to read off the isolation level's name.",
      Visual: S.RevealMeasured,
    },
    {
      title: 'Reveal: the two-axis map, placed from documentation',
      body: (
        <>
          One axis is single-object versus multi-object; the other is ordering strength. etcd's
          own guarantees page claims strict serializability. Spanner's paper calls the same
          property external consistency. PostgreSQL's own documentation places `SERIALIZABLE`
          one rung down, explicitly disclaiming the real-time rule.
        </>
      ),
      duration: 4.8,
      fig: "the two-axis map: single/multi-object by ordering strength, with etcd's strict-serializable claim, Spanner's external-consistency claim, and Postgres's own serializable-not-strict wording, each quoted from its own documentation",
      Visual: S.RevealMap,
    },
    {
      title: 'Reveal: order can run backward even without a stale read',
      body: (
        <>
          A second transaction that starts after an unrelated write finishes, and never reads
          that write's object, can still be placed before it in the serial order. Nothing about
          this is a bug or a missed commit — the two transactions never causally touched, so
          nothing forces one order over the other.
        </>
      ),
      duration: 4.8,
      fig: 'a transaction starting after an unrelated write finishes, and never reading that object, can legally be placed before it in the serial order — no causal link forces either order',
      takeaway: "Serializability's total order is a bookkeeping device, not a record of what actually happened first.",
      Visual: S.RevealReverse,
    },
    {
      title: 'Recap',
      body: (
        <>
          Serializability: one total order over whole transactions, multi-object, no real-time
          rule. Strict serializability: the identical check, with real time added back. Measured,
          not assumed, on a real database. Placed on a map from four systems' own documentation.
        </>
      ),
      duration: 4.8,
      fig: 'serializability is one legal total order with no real-time rule; strict serializability adds real time back; measured directly on Postgres; placed on the two-axis map from documented claims',
      takeaway: 'A label like "serializable" names a precise promise about order, and a separate, precise absence of a promise about time.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: a database that runs every transaction literally one at a time — strictly serializable?',
      body: (
        <>
          A database has no concurrency at all: every transaction runs to completion before the
          next one starts, in the exact order clients submitted them. Is that database strictly
          serializable?
        </>
      ),
      duration: 2.8,
      fig: 'a database runs every transaction to completion, one at a time, before the next starts — is that database strictly serializable?',
      predict: {
        options: [
          { label: "No — true serial execution says nothing about ordering transactions by when they completed versus began" },
          { label: 'Yes — with no concurrency, the one legal order and real time are forced to coincide', correct: true },
        ],
        explain: (
          <>
            Yes. Literal serial execution leaves no freedom: the order transactions run in is the
            only legal order, and since each one finishes before the next begins, that order
            already respects real time. Strict serializability's extra rule costs nothing when
            there was never a choice to begin with.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
