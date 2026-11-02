import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// real PostgreSQL: a real dual-write crash and its outbox fix, a real router applied to two
// real decoded outbox inserts, a real ordering measurement across interleaved aggregates, and a
// real cleanup delete decoded only after the slot had already captured the row it removes.
// Debezium's own Outbox Event Router and its Quarkus and message-based variants are quoted from
// their own documentation, not reproduced, since running a real connector needs a JVM and Kafka
// this sandbox doesn't have.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An order service commits the order and crashes before publishing OrderPlaced. The
          warehouse never hears about it, and the order exists only in the database.
        </>
      ),
      duration: 4.8,
      fig: 'an order service commits the order and crashes before publishing OrderPlaced; the warehouse never hears about the order, and it exists only in the database.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: is the event recoverable',
      body: (
        <>
          The order was committed, and the separate publish step crashed before it ever ran. Is
          that event recoverable anywhere, or is it simply gone?
        </>
      ),
      duration: 2.8,
      fig: 'the order was committed, and the separate publish step crashed before it ever ran. Is that event recoverable anywhere, or is it simply gone?',
      predict: {
        options: [
          { label: 'Recoverable — the database still knows the order needs to be published' },
          {
            label: 'Gone — nothing anywhere ever recorded that a publish was supposed to happen',
            correct: true,
          },
        ],
        explain: (
          <>
            Committing the order and publishing the event were two separate acts. The database
            has no memory of the second act ever being owed — it only knows the order exists,
            never that anything else was supposed to follow from it.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the outbox fix',
      body: (
        <>
          An outbox writes the event in the exact same transaction as the state change, so both
          exist or neither does. CDC, not the application, does the actual publishing.
        </>
      ),
      duration: 4.8,
      fig: 'an outbox writes the event in the exact same transaction as the state change, so both exist or neither does; CDC, not the application, does the publishing.',
      Visual: S.RevealOutboxMechanism,
    },
    {
      title: 'Reveal: the dual-write loss, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: a crash after commit but before a
          separate publish leaves nothing decodable to recover. An outbox row written in the
          same transaction as the order is always there to decode.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a crash after commit but before a separate publish leaves nothing decodable to recover; an outbox row written in the same transaction as the order is always there to decode.',
      takeaway: "The database never lost the event — the application never wrote it down in the first place.",
      Visual: S.RevealDualWriteMeasured,
    },
    {
      title: 'Reveal: the router routes and dedups',
      body: (
        <>
          The router routes by aggregatetype to its own topic, and the outbox row's own id
          becomes the message's own dedup key. A delete on the outbox table is filtered out
          automatically.
        </>
      ),
      duration: 4.8,
      fig: "the router routes by aggregatetype to its own topic, and the outbox row's own id becomes the message's dedup key; a delete on the outbox table is filtered out automatically.",
      Visual: S.RevealRouterMechanism,
    },
    {
      title: 'Reveal: routing and dedup, measured',
      body: (
        <>
          Run directly against the real database: two real decoded outbox inserts of different
          aggregate types route to two different topics, each carrying its own row's own id as a
          dedup key.
        </>
      ),
      duration: 4.8,
      fig: "the real run: two real decoded outbox inserts of different aggregate types route to two different topics, each carrying its own row's own id as a dedup key.",
      takeaway: 'One table, read one way, already carries its own topic name and its own dedup key.',
      Visual: S.RevealRouterMeasured,
    },
    {
      title: 'Reveal: ordering, measured',
      body: (
        <>
          Run directly against the real database: two aggregates' own events, written
          interleaved, still come apart cleanly by aggregateid into each one's own correctly
          ordered sequence.
        </>
      ),
      duration: 4.8,
      fig: "the real run: two aggregates' own events, written interleaved, still come apart cleanly by aggregateid into each one's own correctly ordered sequence.",
      takeaway: 'Interleaving on the wire never threatens order — only the shared key you read it by does.',
      Visual: S.RevealOrderingMeasured,
    },
    {
      title: 'Reveal: cleanup safety, measured',
      body: (
        <>
          Run directly against the real database: the slot captures the insert first. The later
          delete on the outbox table produces no routed event at all, confirming cleanup is both
          invisible and already safe.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the slot captures the insert first; the later delete on the outbox table produces no routed event at all, confirming cleanup is both invisible and already safe.',
      takeaway: "Cleanup isn't risky by nature — it's only risky before the slot has caught up.",
      Visual: S.RevealCleanupMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          The outbox turns publish into commit; the router routes by aggregatetype and dedups by
          id; aggregateid keeps order; and cleanup is safe only once the slot has already moved
          past a row.
        </>
      ),
      duration: 4.8,
      fig: 'the outbox turns publish into commit; the router routes by aggregatetype and dedups by id; aggregateid keeps order; and cleanup is safe only once the slot has already moved past a row.',
      takeaway: 'Every piece of this pattern leans on the same fact: one transaction, one outcome.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team deletes old outbox rows the moment they're written, without ever checking
          whether the slot has actually captured them yet. Is that cleanup still safe?
        </>
      ),
      duration: 2.8,
      fig: "a team deletes old outbox rows the moment they're written, without ever checking whether the slot has actually captured them yet. Is that cleanup still safe?",
      predict: {
        options: [
          { label: "Yes — the router filters deletes either way, so timing never matters" },
          {
            label: "No — a row deleted before the slot captures it is lost to every consumer, with nothing in the stream to show it ever existed",
            correct: true,
          },
        ],
        explain: (
          <>
            The router filtering a delete only protects against the delete itself leaking
            through as a fake event. It does nothing to protect a row that vanishes before the
            slot ever got to read the insert that mattered.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
