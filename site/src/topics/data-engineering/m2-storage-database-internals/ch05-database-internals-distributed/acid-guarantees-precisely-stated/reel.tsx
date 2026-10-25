import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real transactions run against a real Postgres cluster in this sandbox (examples.py): a
// CHECK-constrained transfer that fails partway leaves its row at its original (40, 60), not a
// half-applied (30, 60); a declared CHECK (on_hand >= 0) blocks a bad update outright, while an
// undeclared rule lets reserved reach 53 against an on_hand of 10 without complaint; the identical
// read-modify-reread interleaving measures 100 then 110 under Read Committed and 100 then 100
// under Repeatable Read; and a commit measurably advances the server's own WAL position, with a
// brand new connection reading the committed value back.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Mid-transfer, the power dies. Ten dollars left account A, never reached account B. Four
          letters are supposed to promise this can't happen. What does each one actually promise?
        </>
      ),
      duration: 4.8,
      fig: 'a transfer, crashed mid-flight. Four letters promise something about this. Which promises what?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: Atomicity',
      body: (
        <>
          A real transfer, run against a real Postgres table with a CHECK that A plus B must stay
          one hundred. The second statement never runs. The row comes back exactly as it started.
        </>
      ),
      duration: 4.8,
      fig: 'a transaction fails partway. The row: (40, 60), unchanged — not left half-applied.',
      Visual: S.RevealAtomicity,
    },
    {
      title: 'Predict: who owns "Consistency"?',
      body: (
        <>
          The engine does check some rules. So who actually owns "the database stays correct" —
          the engine, because it enforces constraints, or the application, because of what it
          doesn't know to enforce?
        </>
      ),
      duration: 2.8,
      fig: 'the engine checks some rules. Who owns "correct": the engine, or the application?',
      predict: {
        options: [
          { label: "The engine — it's the one that actually checks every rule" },
          { label: "Both — the engine enforces what it's told; the rest is the application's own job", correct: true },
        ],
        explain: (
          <>
            The engine really does check rules — that's the trap. It only checks the rules you
            declared. Anything you never told it is a rule the engine cannot possibly enforce.
          </>
        ),
      },
      Visual: S.PredictConsistencyOwner,
    },
    {
      title: 'Reveal: Consistency, the split answer',
      body: (
        <>
          A declared rule — stock can't go negative — gets blocked outright. An undeclared rule —
          reserved can't exceed on hand — was never written down, so the engine commits it anyway:
          fifty-three reserved against ten on hand.
        </>
      ),
      duration: 4.8,
      fig: 'declared rule: blocked. Undeclared rule: reserved 53, on hand 10 — committed anyway.',
      Visual: S.RevealConsistencySplit,
    },
    {
      title: 'Reveal: Isolation',
      body: (
        <>
          The same interleaving, measured under two real isolation levels. Read Committed
          re-reads the row and sees the concurrent change land mid-transaction. Repeatable Read
          never does — it keeps the snapshot it started with.
        </>
      ),
      duration: 4.8,
      fig: 'Read Committed: 100, then 110. Repeatable Read: 100, then 100 — same interleaving.',
      takeaway: 'Isolation is not one guarantee. It is a choice of how much of the concurrent world a transaction sees.',
      Visual: S.RevealIsolation,
    },
    {
      title: 'Reveal: Durability',
      body: (
        <>
          A commit measurably moves the server's own write-ahead log forward, and a brand new
          connection — not the one that wrote it — reads the committed value straight back.
        </>
      ),
      duration: 4.8,
      fig: "the WAL position advances on commit. A fresh connection: still reads the committed value.",
      takeaway: 'A commit is not a promise about this connection. It is a promise about every connection, forever.',
      Visual: S.RevealDurability,
    },
    {
      title: 'Reveal: the ten-year gap',
      body: (
        <>
          IBM's own IMS was already running transactions with these four guarantees in nineteen
          seventy-three. The acronym that named them didn't exist until nineteen eighty-three.
        </>
      ),
      duration: 4.8,
      fig: 'nineteen seventy-three: the guarantees, running. Nineteen eighty-three: the acronym, finally.',
      takeaway: 'The guarantees came first, built and running for a decade, before anyone needed a word for all four at once.',
      Visual: S.RevealTenYearGap,
    },
    {
      title: 'Recap',
      body: (
        <>
          Atomicity: all or nothing. Isolation: as if alone. Durability: survives a crash. And
          consistency, the one letter split across two layers — the engine owns its own declared
          rules; everything else is the application's.
        </>
      ),
      duration: 4.8,
      fig: 'four letters, four promises — one of them split between two layers, not one.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
