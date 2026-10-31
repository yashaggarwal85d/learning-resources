import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL sixteen cluster, database learnshop, table orders. A transaction left open for one
// second, while a cursor run happens, finds nothing new and still advances its own watermark; the
// transaction's row, stamped with its own fixed start time, is then missed by every later strict
// run and caught by a two-second lookback. The same idempotent merge, re-run three times on that
// re-read row, leaves the row count at exactly one every time. A row deleted outright drops the
// source's own count by one and leaves nothing for any cursor, lookback or not, to find.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A nightly row-count reconciliation is off by a handful of rows. Every single cursor
          run reported success. Nothing in its own log explains the gap.
        </>
      ),
      duration: 4.8,
      fig: 'two counts side by side, a small gap between them, no error anywhere in the run log.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what a cursor can never see',
      body: (
        <>
          An updated_at cursor only ever asks for rows newer than its own watermark. Which kind
          of change can it never detect, however that watermark is tuned?
        </>
      ),
      duration: 2.8,
      fig: 'an updated_at cursor only asks for rows newer than its watermark. What can it never detect?',
      predict: {
        options: [
          { label: 'A row that updates twice in one run — the cursor just re-reads it, harmlessly' },
          { label: 'A row deleted outright — there is no updated_at left on a row that no longer exists', correct: true },
        ],
        explain: (
          <>
            A repeated read of an unchanged row is exactly what an idempotent merge is built to
            absorb without harm. A deletion leaves categorically nothing behind — no timestamp,
            no row, nothing a cursor's own query can ever match against.
          </>
        ),
      },
      Visual: S.PredictMissKind,
    },
    {
      title: 'Reveal: the mechanism',
      body: (
        <>
          A transaction's own start time never advances while it runs. A transaction that starts
          before a cursor's run and only commits after stamps its row with a time already behind
          where that run's watermark ended up. An application server with a clock running behind
          its neighbours stamps rows the identical way, by hand, for an even more mundane reason.
        </>
      ),
      duration: 5.6,
      fig: "transaction_timestamp is fixed at start. A slow transaction's own stamp sits behind the line it commits past.",
      Visual: S.RevealMechanism,
    },
    {
      title: 'Reveal: reproduced for real',
      body: (
        <>
          Run directly against this sandbox's own database: the cursor run finds nothing while
          the transaction is still open, advances its watermark anyway, and the transaction's own
          commit lands stamped behind that new line. Every later strict run misses it for good.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: nothing found while open, watermark advances anyway, the commit lands behind it.',
      takeaway: "Commit order is not timestamp order — a transaction's own stamp can sit behind the watermark it commits past.",
      Visual: S.RevealReproduced,
    },
    {
      title: 'Reveal: sequence ids are not commit order either',
      body: (
        <>
          A sequence value, once handed out, is never given back, even if its own transaction
          rolls back. The same disagreement between "when a value was assigned" and "when a row
          actually committed" shows up here too.
        </>
      ),
      duration: 4.8,
      fig: 'a sequence value, once handed out, is never given back — even if its own transaction rolls back.',
      Visual: S.RevealSequenceGaps,
    },
    {
      title: 'Reveal: lookback plus idempotent merge, reproduced',
      body: (
        <>
          Re-reading a short margin behind the watermark catches the exact row the strict run
          missed. Merging it in with a key-based upsert, run three times over, leaves the row
          count and its own data completely unchanged, every time.
        </>
      ),
      duration: 4.8,
      fig: 'a lookback window catches the late row; an idempotent merge, run three times, changes nothing.',
      takeaway: 'A lookback window catches a late commit, and an idempotent merge makes repeating that read completely harmless.',
      Visual: S.RevealLookbackMerge,
    },
    {
      title: 'Reveal: sizing the lookback',
      body: (
        <>
          The margin has to be at least as long as the slowest transaction this source ever runs.
          A margin picked by feel, shorter than that, still misses exactly the slow commits it was
          meant to catch.
        </>
      ),
      duration: 4.8,
      fig: 'the lookback margin has to cover the slowest transaction this source ever runs.',
      Visual: S.RevealSizing,
    },
    {
      title: 'Reveal: the one miss lookback cannot fix',
      body: (
        <>
          A row deleted outright leaves no updated_at behind at all. The source's own count drops
          by one, and no lookback window, however wide, finds a timestamp that was never written.
        </>
      ),
      duration: 4.8,
      fig: 'a row deleted outright leaves no updated_at behind — nothing for any cursor to find.',
      takeaway: "A hard delete is invisible to any updated_at cursor — only a full count against the source catches it.",
      Visual: S.RevealHardDelete,
    },
    {
      title: 'Recap',
      body: (
        <>
          Four distinct ways a cursor misses a row, reproduced for real. Lookback plus an
          idempotent merge fixes three of them completely. A hard delete, and any source whose
          transactions run too long or whose in-between states matter, is where a cursor like
          this stops being the right tool at all — that is exactly the gap log-based capture, the
          chapter's own next stop, is built to close.
        </>
      ),
      duration: 4.8,
      fig: 'four miss modes. Lookback plus merge fixes three. The rest is log-based capture\'s own territory.',
      takeaway: 'Know exactly which of a cursor’s misses lookback repairs, and when the real fix is log-based capture instead.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A bulk update is run directly against the database, bypassing the application, and
          never touches the updated_at column at all. Does the cursor catch it next run?
        </>
      ),
      duration: 2.8,
      fig: 'a bulk UPDATE run directly against the database, never touching updated_at at all.',
      predict: {
        options: [
          { label: 'Yes — any UPDATE bumps a row’s own last-modified time automatically' },
          { label: 'No — updated_at is only ever set by whatever writes it, so a column it skips never signals the change', correct: true },
        ],
        explain: (
          <>
            `updated_at` is an ordinary column: nothing in the database updates it on its own.
            A bulk update that never writes that column leaves the old timestamp in place, which
            is mechanically the same blind spot as a hard delete — no timestamp, no signal.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
