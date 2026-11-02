import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// real PostgreSQL: a real decoded insert and update rebuilt by hand into Debezium's own
// envelope, a real decoded delete unwrapped into a deleted-marker record, and a real upsert
// applied twice to a real sink table. Debezium's own deployment shapes and its JDBC sink's
// configuration are quoted from their own documentation, not reproduced, since running a real
// Debezium deployment needs a JVM and Kafka this sandbox doesn't have.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A team unwraps a Debezium topic to simplify it for a sink. The op field goes with it,
          and now a re-snapshot read event looks exactly like a real insert.
        </>
      ),
      duration: 4.8,
      fig: 'a team unwraps a Debezium topic to simplify it for a sink; the op field goes with it, and a re-snapshot read event now looks exactly like a real insert.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: read against insert',
      body: (
        <>
          Unwrapping a change event keeps only its column values. Can a consumer still tell a
          re-snapshot read apart from a genuine insert once that happens?
        </>
      ),
      duration: 2.8,
      fig: 'unwrapping a change event keeps only its column values. Can a consumer still tell a re-snapshot read apart from a genuine insert once that happens?',
      predict: {
        options: [
          { label: 'Yes — the column values alone are enough to tell them apart' },
          {
            label: 'No — both now look identical: an ordinary row with no op and no way to tell which one actually happened',
            correct: true,
          },
        ],
        explain: (
          <>
            Unwrapping keeps only the after values. Nothing about a plain row says whether it
            arrived as a fresh insert or as a re-snapshot catching up — that distinction lived
            entirely in the op field this transform just removed.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: three deployment shapes',
      body: (
        <>
          Debezium deploys three ways: as a Kafka Connect connector, as the standalone Debezium
          Server streaming straight to a messaging system, or as the Debezium Engine, a library
          embedded inside an application.
        </>
      ),
      duration: 4.8,
      fig: "Debezium deploys three ways: a Kafka Connect connector, the standalone Debezium Server streaming straight to a messaging system, or the Debezium Engine embedded as a library.",
      Visual: S.RevealThreeShapes,
    },
    {
      title: 'Reveal: the envelope card, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: a real insert and a real update,
          each rebuilt by hand into the full envelope. The insert's own before is empty; the
          update carries both before and after.
        </>
      ),
      duration: 4.8,
      fig: "the real run: a real insert and a real update, each rebuilt by hand into the full envelope; the insert's own before is empty, the update carries both before and after.",
      takeaway: 'Every field in the card is already there before any transform ever touches it.',
      Visual: S.RevealEnvelopeMeasured,
    },
    {
      title: 'Reveal: what unwrap actually drops',
      body: (
        <>
          The unwrap transform extracts only the after field from an envelope and replaces the
          whole record with it. Before, op and source are gone unless a variant explicitly adds
          them back.
        </>
      ),
      duration: 4.8,
      fig: 'the unwrap transform extracts only the after field from an envelope and replaces the whole record with it; before, op and source are gone unless a variant adds them back.',
      Visual: S.RevealUnwrapMechanism,
    },
    {
      title: 'Reveal: unwrap, measured',
      body: (
        <>
          Run against a real envelope: unwrapping it keeps only the column values and drops
          before, op and source entirely. A real delete, unwrapped, carries its last-known
          columns plus a deleted marker instead of vanishing.
        </>
      ),
      duration: 4.8,
      fig: "the real run: unwrapping a real envelope keeps only its column values; a real delete, unwrapped, carries its last-known columns plus a deleted marker instead of vanishing.",
      takeaway: 'Unwrapping never destroys a delete — it just renames what disappearing looks like.',
      Visual: S.RevealUnwrapMeasured,
    },
    {
      title: 'Reveal: why upsert is the safe mode',
      body: (
        <>
          A JDBC sink configured for upsert mode makes writes idempotent: replaying an event
          always produces the same final row state, because an upsert updates an existing key
          instead of duplicating it.
        </>
      ),
      duration: 4.8,
      fig: 'a JDBC sink configured for upsert mode makes writes idempotent: replaying an event always produces the same final row state, because an upsert updates an existing key instead of duplicating it.',
      Visual: S.RevealUpsertMechanism,
    },
    {
      title: 'Reveal: the idempotent sink, measured',
      body: (
        <>
          Run directly against the real database: applying the identical unwrapped record
          twice, by a real upsert, leaves the row in the exact same state both times, and never
          inserts a second row.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: applying the identical unwrapped record twice, by a real upsert, leaves the row in the exact same state both times, and never inserts a second row.',
      takeaway: 'A replay only stays harmless because the write itself refuses to duplicate anything.',
      Visual: S.RevealUpsertMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three deployment shapes, one envelope card, an unwrap transform that trades fields for
          simplicity, and a sink that only stays safe to replay if it upserts.
        </>
      ),
      duration: 4.8,
      fig: 'three deployment shapes, one envelope card, an unwrap transform that trades fields for simplicity, and a sink that only stays safe to replay if it upserts.',
      takeaway: 'Every shortcut here trades one field or one guarantee for something simpler.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team configures a JDBC sink without ever setting insert mode to upsert. Is replaying
          one already-applied event still guaranteed to leave the table in the same state?
        </>
      ),
      duration: 2.8,
      fig: 'a team configures a JDBC sink without ever setting insert mode to upsert. Is replaying one already-applied event still guaranteed to leave the table in the same state?',
      predict: {
        options: [
          { label: 'Yes — the sink always ends up consistent regardless of insert mode' },
          {
            label: 'No — without upsert mode a replayed event can insert a duplicate row instead of updating the existing one',
            correct: true,
          },
        ],
        explain: (
          <>
            Idempotence was never automatic. It came specifically from configuring upsert mode,
            exactly as measured a few steps ago — without it, a sink has no reason to treat a
            repeated key as anything other than a brand-new row.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
