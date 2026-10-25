import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py): a single UPDATE leaves
// both the old and new heap tuple present on the same page, read directly via the pageinspect
// extension, with the old tuple's own xmax equal to the new tuple's own xmin. Repeated updates
// to an indexed column, with no vacuum running, grow the table and its index by a real number of
// pages. An open repeatable-read transaction's own reads stay unchanged through a concurrent
// transaction's committed update to the same row, then see the new value only once it starts a
// fresh snapshot of its own. InnoDB's and Oracle's own undo-log mechanics, and Oracle's own
// "snapshot too old" failure, are sourced directly from their own documentation rather than
// reproduced, since this sandbox has no InnoDB or Oracle engine to measure directly.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A B-tree index answers "where is this row" fast. It says nothing about what happens
          when two transactions reach for the same row at once — and what a reader, caught in
          the middle, actually sees.
        </>
      ),
      duration: 4.8,
      fig: 'two transactions reach for the same row at once. What does a reader, mid-query, see?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a real update, inspected directly',
      body: (
        <>
          A real row, updated once on this sandbox's own cluster, read straight from the page
          with Postgres's own page-inspection tools: the old tuple and the new tuple, both still
          there, the same transaction ID closing one and opening the other.
        </>
      ),
      duration: 4.8,
      fig: "a real row, updated once, read directly from the page: the old and new heap tuple, side by side.",
      Visual: S.RevealRealUpdate,
    },
    {
      title: 'Reveal: what decides visibility',
      body: (
        <>
          A tuple's own header isn't enough on its own. A reader also needs a snapshot — which
          transaction IDs were still in progress — and a separate lookup to confirm whether a
          given transaction actually committed.
        </>
      ),
      duration: 4.8,
      fig: "a tuple's own header alone can't decide visibility. What else does a reader need?",
      Visual: S.RevealVisibility,
    },
    {
      title: 'Predict: the other family',
      body: (
        <>
          InnoDB and Oracle don't do this. Each row has exactly one physical copy, updated in
          place. When a concurrent reader still needs the value from before that update, where
          does it come from?
        </>
      ),
      duration: 2.8,
      fig: "a row with one physical copy, updated in place. Where does a concurrent reader's old value come from?",
      predict: {
        options: [
          { label: "There isn't one — the reader just waits for the writer" },
          { label: 'A separate log holds the old value, rebuilt on demand', correct: true },
        ],
        explain: (
          <>
            "The reader waits" is the locking-era intuition MVCC was built to avoid, and it's
            not what either system actually does. Both keep the old value in a separate log,
            built back into a readable version only when a reader actually needs it.
          </>
        ),
      },
      Visual: S.PredictOtherFamily,
    },
    {
      title: "Reveal: the undo-log family's own answer",
      body: (
        <>
          The same update, under the other family's own model, sourced directly from InnoDB's
          and Oracle's own documentation: one row, updated in place, with the value it
          overwrote pushed out to a separate undo log. InnoDB's own primary key is that one
          physical copy — rows live in primary-key order, at the index's own leaf level.
        </>
      ),
      duration: 4.8,
      fig: "the same update, under InnoDB's and Oracle's own model: one row in place, one undo record pointing back.",
      Visual: S.RevealUndoLogFamily,
    },
    {
      title: 'Reveal: the real cost of never overwriting',
      body: (
        <>
          Every new heap tuple needs its own index entry too, not just the index's old one
          updated. Repeated updates to one indexed row, with no vacuum running, measured
          directly: the table and its index both grow by a real number of pages. Nothing has
          cleaned up the old tuples yet, and nothing will until something does.
        </>
      ),
      duration: 4.8,
      fig: 'repeated updates, no vacuum: does an indexed row leave real, measured growth behind?',
      takeaway: 'Every update that leaves a tuple nobody has reclaimed yet is real, measured disk growth, not a theoretical cost.',
      Visual: S.RevealAppendCost,
    },
    {
      title: 'Reveal: a reader that never blocks',
      body: (
        <>
          An open transaction keeps reading the same value, measured directly, while a second,
          independent connection commits an update to that same row. The reader's own snapshot
          is what keeps it consistent — not a lock on anyone else.
        </>
      ),
      duration: 4.8,
      fig: "an open transaction's own reads, measured against a real concurrent commit to the same row. Blocked, or not?",
      takeaway: "MVCC's own headline guarantee, measured directly: a reader's snapshot, not a lock, is what keeps its reads consistent.",
      Visual: S.RevealNoBlock,
    },
    {
      title: 'Reveal: snapshot too old',
      body: (
        <>
          The undo-log family's own failure mode, sourced from Oracle's documentation: the
          undo log is bounded and reused circularly, so a long-running reader can outlive the
          very undo records it still needs.
        </>
      ),
      duration: 4.8,
      fig: "a long-running reader outlives the undo it still needs. What does the undo-log family do about it?",
      takeaway: "Snapshot too old isn't a bug; it's a bounded, circular log outliving a reader that still needs it.",
      Visual: S.RevealSnapshotTooOld,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two physically different answers to the same problem: Postgres appends a new tuple
          and leaves the old one for later; InnoDB and Oracle update in place and keep the old
          value in a separate, bounded log — the one place that bound can fail a reader
          outright.
        </>
      ),
      duration: 4.8,
      fig: 'two physically different answers to one problem, and the one failure mode only one of them has.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team on Oracle sees frequent "snapshot too old" errors on a nightly report job and
          raises undo_retention to fix it. Does this remove the structural risk, or only delay
          it?
        </>
      ),
      duration: 2.8,
      fig: 'raising undo_retention after frequent snapshot-too-old errors: does it remove the risk, or only delay it?',
      predict: {
        options: [
          { label: 'Removes it — the report will never fail this way again' },
          { label: "Only delays it — a long enough report, or heavy enough writes, still outruns any retention setting", correct: true },
        ],
        explain: (
          <>
            Oracle's own documented fix treats retention as a target, not a hard cap: the log is
            still bounded and still reused circularly. A bigger bound just moves the failure
            point further out — it doesn't remove the mechanism that causes it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
