import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster: a real uncommitted insert that never appears in the decoded stream, a
// real interleaved multi-key write pattern, a real one-commit order-and-items transaction split
// into two queues and later reassembled using the slot's own real xid and lsn columns.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          One commit inserts an order and its three items. The consumer happens to read the
          items first. By the time it checks, none of them have an order to join against, and
          the join drops all three.
        </>
      ),
      duration: 4.8,
      fig: 'one commit inserts an order and its items; the consumer reads the items topic first, and a join drops all three items as orphans.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does order break the same way',
      body: (
        <>
          A single row's own changes and a transaction spanning two tables are both about
          order. Does order break the same way for both, or does one hold while the other
          doesn't?
        </>
      ),
      duration: 2.8,
      fig: "does order break the same way for one row's own changes as it does for a transaction spanning two tables, or differently?",
      predict: {
        options: [
          { label: 'The same way — if a transaction spanning two tables can lose its order, a single row can too' },
          { label: "Differently — a row's own changes stay in order because of what keys them, which a cross-table commit doesn't get", correct: true },
        ],
        explain: (
          <>
            A single row's changes are ordered by what keys them, not by which transaction wrote
            them. A transaction spanning two tables has no such key tying its two halves
            together once they're split apart.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: per-key order',
      body: (
        <>
          Every change event is keyed by its own row's primary key. A stream ordered within one
          key keeps every change to that single row in the order it actually happened.
        </>
      ),
      duration: 4.8,
      fig: "every change event is keyed by its row's own primary key, and a stream ordered within a key keeps every change to that one row in order.",
      Visual: S.RevealPerKeyMechanism,
    },
    {
      title: 'Reveal: per-key order, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: three different keys updated
          three times each, deliberately interleaved out of order, then split into one queue per
          key.
        </>
      ),
      duration: 4.8,
      fig: "the real run: three keys updated three times each, deliberately interleaved; each key's own queue lists its values in exactly commit order.",
      takeaway: "Scramble the keys going in — each key's own queue still comes out in exactly the order it was written.",
      Visual: S.RevealPerKeyMeasured,
    },
    {
      title: 'Reveal: cross-table order breaks',
      body: (
        <>
          Each table is delivered on its own. One commit touching two tables becomes two
          separate deliveries, and nothing stops a consumer from reading the second one first.
        </>
      ),
      duration: 4.8,
      fig: 'each table goes to its own topic, so one commit across two tables becomes two separate deliveries a consumer can read in either order.',
      Visual: S.RevealCrossTableMechanism,
    },
    {
      title: 'Reveal: cross-table order, measured',
      body: (
        <>
          Run directly against the real database: the identical one-commit transaction, split
          into two queues exactly the way two tables would be, with the items queue drained
          first.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the identical commit, split into two queues; draining the items queue before the orders queue finds every item an orphan.',
      takeaway: 'The source transaction was never torn apart — only the two queues built from it orphaned every item.',
      Visual: S.RevealCrossTableMeasured,
    },
    {
      title: 'Reveal: transaction metadata',
      body: (
        <>
          A begin and an end event frame every commit. The end event carries a total count and a
          count for each table, built from the exact transaction id and log position the commit
          itself carries.
        </>
      ),
      duration: 4.8,
      fig: "a begin and end event frame every commit; the end carries a total count and a count per table, built from the slot's own real position.",
      Visual: S.RevealTransactionMetadata,
    },
    {
      title: 'Reveal: reassembly, measured',
      body: (
        <>
          Run directly against the real database: a consumer buffers every change by its real
          transaction id and releases the join only once it has seen as many events as the end
          event promised.
        </>
      ),
      duration: 4.8,
      fig: "the real run: a consumer buffers by transaction and waits for the end's own count before joining; the same split commit now joins with zero orphans.",
      takeaway: 'The same split commit that orphaned every item now joins clean, just by waiting for its own count.',
      Visual: S.RevealReassemblyMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          One key's own order survives on its own. One commit across tables does not, until a
          consumer buffers by transaction and waits for its own end count before joining
          anything.
        </>
      ),
      duration: 4.8,
      fig: "a key's own order survives on its own; a commit across tables does not, until a consumer buffers by transaction and waits for its own end count.",
      takeaway: "Per-key order comes free from how events are keyed; cross-table order is something a consumer rebuilds itself.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A transaction spans several separate topics, and nothing in Kafka itself guarantees
          anything across them. Whose job is it, exactly, to make that transaction atomic again?
        </>
      ),
      duration: 2.8,
      fig: 'a transaction spans several topics, and Kafka itself gives no guarantee across them. Whose job is it to make that transaction atomic again?',
      predict: {
        options: [
          { label: "Kafka's own job, since it already orders every individual topic correctly on its own" },
          { label: "The consumer's own job, rebuilt from the transaction metadata's begin, end and counts", correct: true },
        ],
        explain: (
          <>
            Kafka guarantees order within one partition, never across the several topics a
            multi-table transaction spans. Recovering that transaction's atomicity is bookkeeping
            the consumer does for itself, using exactly the begin, end and counts this topic just
            measured.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
