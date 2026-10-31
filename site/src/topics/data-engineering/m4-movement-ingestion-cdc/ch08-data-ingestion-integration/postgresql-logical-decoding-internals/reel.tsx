import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster: a real logical replication slot created with
// pg_create_logical_replication_slot and decoded with the test_decoding plugin, a row's own
// primary-key value changed under each REPLICA IDENTITY setting, two transactions committed in
// the reverse of the order they started, an unconfirmed slot peeked twice, and
// restart_lsn/confirmed_flush_lsn read live from pg_replication_slots before and after a
// confirmed read. The server's own version and the absence of the newer failover-only slot
// columns are confirmed directly, not assumed.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The same statement, run three times with three different REPLICA IDENTITY settings in
          effect, decoded each time. The before-image fills in completely, shrinks to the
          primary key alone, or stays empty.
        </>
      ),
      duration: 4.8,
      fig: "the same update is decoded three times under three REPLICA IDENTITY settings; the before row fills in, shrinks, or stays empty.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a second peek repeat the first',
      body: (
        <>
          The same slot, read twice by a peek that never confirms anything. Does the second read
          come back empty, or identical to the first?
        </>
      ),
      duration: 2.8,
      fig: 'the same unconfirmed slot, peeked twice. Does the second peek come back empty, or identical to the first?',
      predict: {
        options: [
          { label: 'The slot remembers, so the second peek comes back empty' },
          { label: 'The second peek returns the identical change, because nothing has confirmed it was ever delivered', correct: true },
        ],
        explain: (
          <>
            A slot's own position only moves forward when a read explicitly confirms it.
            Peeking never confirms, so the slot has no record that anything was delivered, and
            the second peek hands back exactly what the first one did.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: decoding is WAL, turned into row changes',
      body: (
        <>
          Two transactions open in one order, but decoding reports them in the order they
          committed, not the order they began, since that's the order the WAL itself records
          them as finished.
        </>
      ),
      duration: 4.8,
      fig: 'two transactions start out of order; decoding reports them in the order they committed, not the order they began.',
      Visual: S.RevealDecodingOrder,
    },
    {
      title: 'Reveal: the before-image, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: the identical row's primary key
          changed three times, once under each REPLICA IDENTITY setting, and decoded back with
          the built-in test_decoding plugin.
        </>
      ),
      duration: 4.8,
      fig: "the real run: one row's own key changed three times, once under each REPLICA IDENTITY setting.",
      takeaway: 'The before-image a decoded update carries is exactly what REPLICA IDENTITY allows — the key alone, every column, or nothing.',
      Visual: S.RevealBeforeImageMeasured,
    },
    {
      title: "Reveal: a slot's position is a promise, not a guarantee",
      body: (
        <>
          A slot's own position is written to disk only at a checkpoint. Between checkpoints,
          what the slot thinks it has already delivered lives only in memory.
        </>
      ),
      duration: 4.8,
      fig: "a slot's own position is written to disk only at a checkpoint; between checkpoints it lives only in memory.",
      Visual: S.RevealSlotPromise,
    },
    {
      title: 'Reveal: repeats, measured',
      body: (
        <>
          Run directly against the real database: the identical unconfirmed slot, peeked twice,
          returning byte-for-byte the same decoded output both times.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the identical unconfirmed slot, peeked twice.',
      takeaway: "A slot only forgets what it's delivered once a consumer confirms it — until then, the same change repeats.",
      Visual: S.RevealRepeatsMeasured,
    },
    {
      title: 'Reveal: two positions, two different jobs',
      body: (
        <>
          restart_lsn is the oldest WAL the server still can't discard for this slot.
          confirmed_flush_lsn is the point up to which the consumer has actually acknowledged
          receiving data.
        </>
      ),
      duration: 4.8,
      fig: "restart_lsn is the oldest WAL the server can't discard for this slot; confirmed_flush_lsn is what the consumer has acknowledged.",
      Visual: S.RevealTwoPositions,
    },
    {
      title: 'Reveal: the two positions, measured',
      body: (
        <>
          Run directly against the real database: both positions read from
          pg_replication_slots, before and after a confirmed read of this sandbox's own slot.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: both positions read before and after a confirmed read.',
      takeaway: "Confirming a read moves confirmed_flush_lsn forward; restart_lsn doesn't follow — the gap between them is what the server holds.",
      Visual: S.RevealPositionsMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          The before-image REPLICA IDENTITY allows, a slot's own tolerance for repeats, and the
          two separate positions that track what it has kept and what it has confirmed.
        </>
      ),
      duration: 4.8,
      fig: "the before-image REPLICA IDENTITY allows, a slot's tolerance for repeats, and its two separate positions.",
      takeaway: "A slot's before-image, its repeats, and its two positions are all one server's bookkeeping — none of it survives alone.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          One slot on one server is what's been shown here. What does a consumer actually need
          to keep running through a real failover?
        </>
      ),
      duration: 2.8,
      fig: "one slot on one server is what's been shown. What does a consumer need to survive a real failover?",
      predict: {
        options: [
          { label: "Nothing beyond the slot itself — a slot already survives a crash of its own server" },
          { label: "A standby has to be told to track the slot, or the primary has to synchronise it there in advance, or a promotion leaves the new primary with no memory of where the consumer was", correct: true },
        ],
        explain: (
          <>
            A slot lives only on the server that created it. PostgreSQL sixteen lets a standby
            decode directly, needing hot_standby_feedback configured there. PostgreSQL
            seventeen lets a slot's own failover property and synchronized_standby_slots keep a
            standby's copy current, so a promotion doesn't strand the consumer with no position
            at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
