import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster, the identical `orders` table earlier topics of this chapter use: a
// real logical replication slot created with pg_create_logical_replication_slot, decoded with
// the test_decoding plugin, reading back a test order's own insert and three status updates, a
// test order inserted and deleted inside one window, a real AFTER INSERT OR UPDATE trigger on
// orders copying every change into a shadow table, and a comparison of the table's full row
// count against the exact number of change events a slot returns for a handful of real edits.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An order goes new, paid, shipped, refunded, all within a few seconds. A poll samples
          the row once and sees "refunded." The warehouse's own history of this order never
          includes that it was ever paid, or ever shipped, at all.
        </>
      ),
      duration: 4.8,
      fig: 'order one-oh-four-two goes new, paid, shipped, refunded within seconds; a poll samples once and sees only refunded.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a trigger see the gap',
      body: (
        <>
          The identical four-second sequence, but this time a trigger copies every change into
          a shadow table the instant it happens, inside the same transaction as the real write.
          Does the shadow table see the states the poll missed?
        </>
      ),
      duration: 2.8,
      fig: 'the identical sequence, but a trigger copies every change to a shadow table as it happens. Does it see what the poll missed?',
      predict: {
        options: [
          { label: "No — a trigger only fires on a transaction's final committed state, the same as a poll" },
          { label: 'Yes — a trigger fires on every individual statement, capturing every intermediate state a poll would skip over', correct: true },
        ],
        explain: (
          <>
            A trigger fires once per row-affecting statement, inside that statement's own
            transaction, not once per transaction as a whole. Four separate updates to the
            identical row produce four separate shadow-table rows, not one — exactly the states
            a poll's single sample would never catch.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: "Reveal: a poll's one sample",
      body: (
        <>
          A poll is a single query, run on a schedule. Between two runs, a row can pass through
          any number of states, and the poll only ever reports the one it happened to catch.
        </>
      ),
      duration: 4.8,
      fig: 'a poll is one query, run on a schedule; between two runs, a row can pass through any number of states.',
      Visual: S.RevealPollSample,
    },
    {
      title: 'Reveal: the intermediate states, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: a test order's own insert and
          three status updates, read back two ways — a single poll query, and the same changes
          decoded from a real logical replication slot.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: one poll query against a real replication slot reading every change.',
      takeaway: 'A poll reports the state it happens to catch — a log reports every state a row passed through.',
      Visual: S.RevealIntermediateMeasured,
    },
    {
      title: "Reveal: a poll can't see what's gone",
      body: (
        <>
          A row is inserted and deleted inside the same short window. A poll that asks what
          changed since the watermark finds nothing, because by the time it looks, there is
          nothing left to find.
        </>
      ),
      duration: 4.8,
      fig: 'a row is inserted and deleted inside one window; a poll asking what changed finds nothing left to find.',
      Visual: S.RevealDeleteGap,
    },
    {
      title: 'Reveal: the delete, measured',
      body: (
        <>
          Run directly against the real database: a test row inserted and deleted in one
          window, the poll's own watermark query finding zero matching rows, the replication
          slot showing the exact delete event.
        </>
      ),
      duration: 4.8,
      fig: "the real run: the poll's own query against the exact delete event in the log.",
      takeaway: "A poll can't tell a row that never existed from one that was deleted — the log always can.",
      Visual: S.RevealDeleteMeasured,
    },
    {
      title: "Reveal: a trigger's real cost",
      body: (
        <>
          A trigger that copies a change into a shadow table runs inside the identical
          transaction as the write it's capturing, so every write to the real table becomes two
          writes: one to the table, one to the shadow.
        </>
      ),
      duration: 4.8,
      fig: 'a trigger copying a change into a shadow table runs inside the identical transaction as the write itself.',
      Visual: S.RevealTriggerCost,
    },
    {
      title: 'Reveal: write cost and log cost, both measured',
      body: (
        <>
          Run directly against the real database: four writes to a test order producing four
          shadow-table rows through a real trigger, against the identical four changes read for
          free from WAL the server had already written for its own recovery.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: four writes to orders producing four shadow rows, against the identical changes read for free from the log.',
      takeaway: 'A trigger doubles every write it captures — the log reads the identical changes for free, already written.',
      Visual: S.RevealCostsMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A poll's one sample, a trigger's doubled write, and a log's complete, ordered,
          low-overhead read — and the one price the log alone carries.
        </>
      ),
      duration: 4.8,
      fig: "a poll's one sample, a trigger's doubled write, and a log's complete, ordered, low-overhead read.",
      takeaway: 'Polling misses gaps, triggers double writes, the log is complete and cheap — but it ties you to the source.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Reading the database's own log is complete and cheap. What does it cost operationally
          that polling and triggers don't?
        </>
      ),
      duration: 2.8,
      fig: 'reading the log is complete and cheap. What does it cost that polling and triggers don’t?',
      predict: {
        options: [
          { label: 'Nothing extra — reading WAL is free since the server already wrote it' },
          { label: "The capture holds a position on the source that pins storage, depends on retention and privileges, and breaks on a failover", correct: true },
        ],
        explain: (
          <>
            WAL is purged after a retention window, so a consumer's own position in that log, a
            slot, is a real and ongoing cost: it pins storage on the source for as long as the
            consumer hasn't caught up, needs privileges to create, and is broken outright by a
            failover that loses its position.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
