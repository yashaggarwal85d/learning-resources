import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py: a real delete decoded
// under two different REPLICA IDENTITY settings, a real soft and hard delete checked against a
// real cursor query, a real MERGE applied to a real landing table, and a hand-built compaction
// model that implements Kafka's own documented keep-the-latest-per-key and retention rules
// exactly, not a simplified stand-in for them.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A new sink is bootstrapped from a compacted topic days after a customer was deleted.
          The delete's own marker was already cleaned up, and the customer comes back.
        </>
      ),
      duration: 4.8,
      fig: "a new sink is bootstrapped from a compacted topic days after a customer was deleted; the delete's own marker was already cleaned up, and the customer comes back.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: kept by compaction',
      body: (
        <>
          A delete produces two records sharing one key, one right after the other. Does log
          compaction's keep-the-latest rule keep both, or only the newer of the two?
        </>
      ),
      duration: 2.8,
      fig: "a delete produces two records sharing one key, one after the other. Does compaction's keep-the-latest rule keep both, or only the newest of the two?",
      predict: {
        options: [
          { label: 'Both — one explains what was deleted and the other proves it can be cleaned up' },
          { label: 'Only the newer one — compaction keeps one record per key, whatever that record actually says', correct: true },
        ],
        explain: (
          <>
            Compaction never reads what a record means. It only ever keeps the latest offset for
            a key, so the earlier of the two delete records is gone the moment the newer one
            exists, long before any retention window even starts.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the before-image follows the identity',
      body: (
        <>
          A delete's before field answers to the same REPLICA IDENTITY setting an update's before
          field does: DEFAULT carries only the key, FULL carries the whole row.
        </>
      ),
      duration: 4.8,
      fig: "a delete's before field answers to the same REPLICA IDENTITY setting an update's before field does: DEFAULT carries only the key, FULL carries the whole row.",
      Visual: S.RevealBeforeImageMechanism,
    },
    {
      title: 'Reveal: the before-image, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: the identical delete against a
          table at its default identity, then against one set to full.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the identical delete against a table at its default identity, then against one set to full; the first before-image carried only the key, the second the whole row.',
      takeaway: "A delete's own before field is not special — it obeys whatever REPLICA IDENTITY the table was already set to.",
      Visual: S.RevealBeforeImageMeasured,
    },
    {
      title: 'Reveal: soft against hard',
      body: (
        <>
          A soft delete is just another update, so a cursor query polling for recent changes sees
          it like any other row. A hard delete leaves the log as its only trace.
        </>
      ),
      duration: 4.8,
      fig: 'a soft delete is just another update, so a cursor query polling for recent changes sees it like any other row; a hard delete leaves the log as its only trace.',
      Visual: S.RevealSoftHardMechanism,
    },
    {
      title: 'Reveal: soft against hard, measured',
      body: (
        <>
          Run directly against the real database: a cursor query sees the soft-deleted row show
          up like any update; the same cursor query never finds the hard-deleted row at all.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a cursor query sees the soft-deleted row show up like any update; the same cursor query never finds the hard-deleted row, with no trace at all.',
      takeaway: "The exact same cursor query that catches a soft delete has nothing to catch once it's hard.",
      Visual: S.RevealSoftHardMeasured,
    },
    {
      title: 'Reveal: carried by MERGE, measured',
      body: (
        <>
          Run directly against the real database: one MERGE statement applied to a real landing
          table removes exactly the deleted row's own key, leaving every other row untouched.
        </>
      ),
      duration: 4.8,
      fig: "the real run: one MERGE statement applied to a real landing table removes exactly the deleted row's own key, leaving every other row untouched.",
      takeaway: 'One statement carries every kind of change at once — insert, update and delete all land in one MERGE.',
      Visual: S.RevealMergeMeasured,
    },
    {
      title: 'Reveal: the retention race, measured',
      body: (
        <>
          Run against a hand-built model of Kafka's own compaction rule: a consumer resuming
          before the retention window closes still finds the tombstone and applies the delete; one
          resuming after finds nothing at all and stays stale.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a consumer resuming before the retention window closes still finds the tombstone and applies the delete; one resuming after finds nothing at all and stays stale.',
      takeaway: "A consumer doesn't have to be wrong about anything to resurrect a row — it only has to be late.",
      Visual: S.RevealRetentionRaceMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A delete's before-image follows REPLICA IDENTITY; soft deletes stay visible to a cursor
          and hard ones don't; a MERGE carries one into a table; and a tombstone outlives a delete
          only for so long.
        </>
      ),
      duration: 4.8,
      fig: "a delete's before-image follows REPLICA IDENTITY; soft deletes stay visible to a cursor and hard ones don't; a MERGE carries one into a table; and a tombstone outlives a delete only for so long.",
      takeaway: 'None of this is one rule — four separate windows, and only one of them ever closes on you.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Nothing stops a team from avoiding this race entirely. What's the one number a sink's
          own maximum lag actually has to stay under?
        </>
      ),
      duration: 2.8,
      fig: "nothing stops a team from avoiding this race entirely. What's the one number a sink's own maximum lag has to stay under?",
      predict: {
        options: [
          { label: "However long the source's own log keeps changes around for" },
          { label: "The topic's own delete.retention.ms — the window a tombstone is actually guaranteed to still be there", correct: true },
        ],
        explain: (
          <>
            The source's own log retention decides how far back a brand-new consumer can start
            from. Once a delete has already become a tombstone in Kafka, the only clock left
            running against it is the topic's own retention window.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
