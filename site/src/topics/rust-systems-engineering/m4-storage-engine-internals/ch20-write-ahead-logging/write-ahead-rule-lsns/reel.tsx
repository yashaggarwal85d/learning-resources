import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Log first, data later: the same crash survives when the log comes
// first and silently loses the update when it's reversed. Comparing a
// page's own LSN against a record's own LSN makes redo safe to run more
// than once. And a torn page is caught by its own checksum, fixed by
// restoring the log's own already-durable full-page image.
const reel: Reel = {
  steps: [
    {
      title: "Build a real write-ahead log and a real page, each carrying its own LSN. Apply the same update two ways: log it, then write the page; or write the page, then log it. Crash at the exact same point in both: right between the two steps. Which update survives?",
      body: (
        <>
          A log and a page, mid-update, the crash point marked between them.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Neither survives; the page was never flushed either way' },
          { label: 'Only the logged-first update survives; the other is simply gone', correct: true },
          { label: 'Both survive, since the page already had the new bytes in memory' },
        ],
        explain: (
          <>
            Only logged-first survives. The other is gone, with nothing to redo.
          </>
        ),
      },
      Visual: S.OrderPredict,
    },
    {
      title: 'Measured: the log-first update survived the crash and recovered correctly; the identical crash, with the page written first, genuinely and silently lost the update',
      body: (
        <>
          The real, measured recovery, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: "Log first, data later: the same crash loses nothing with the rule followed, but silently loses the update reversed.",
      Visual: S.OrderReveal,
    },
    {
      title: 'Now replay an already-applied log record against the page it already describes. Does redo apply it again, or leave the page alone?',
      body: (
        <>
          One record, already reflected in the page's own LSN.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It applies again, overwriting the page with the same bytes harmlessly' },
          { label: "It's a genuine no-op; the page's own LSN already covers it", correct: true },
          { label: 'It depends on whether the page happens to be dirty' },
        ],
        explain: (
          <>
            A genuine no-op. The page's own LSN already covers it.
          </>
        ),
      },
      Visual: S.IdempotentPredict,
    },
    {
      title: 'Measured: replaying an already-applied record was a genuine no-op, and running the full recovery pass a second time changed nothing either',
      body: (
        <>
          The real, measured no-op, twice over.
        </>
      ),
      duration: 3.0,
      takeaway: "Comparing a page's own LSN against a record's own LSN is what makes redo safe to run more than once.",
      Visual: S.IdempotentReveal,
    },
    {
      title: "A crash mid-write can tear a page: part of its bytes land in the new state, part are still the old ones. Does a checksum over the page's own bytes catch that?",
      body: (
        <>
          A page, part new bytes, part old.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a checksum only catches corruption from bad hardware, not a partial write' },
          { label: "Yes, the checksum genuinely no longer matches a page that's half-written", correct: true },
          { label: 'Only if the torn part happens to be the checksum\'s own region' },
        ],
        explain: (
          <>
            Yes, genuinely. A half-written page's own checksum no longer matches.
          </>
        ),
      },
      Visual: S.TornPredict,
    },
    {
      title: "Measured: the torn page's own checksum genuinely didn't match, and restoring the log's own full-page image fixed it completely",
      body: (
        <>
          The real, measured tear, caught and fixed.
        </>
      ),
      duration: 3.0,
      takeaway: "A torn page is caught by its own checksum, fixed by restoring the log's own already-durable image.",
      Visual: S.TornReveal,
    },
    {
      title: "PostgreSQL's own documentation states the write-ahead rule directly: why doesn't a transaction's commit need every data page it touched flushed to disk?",
      body: (
        <>
          PostgreSQL's own words on WAL, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Because the OS guarantees it eventually will, on its own schedule" },
          { label: "Because the log record reaching disk is already enough; the data pages can be redone from it later", correct: true },
          { label: "Because PostgreSQL never actually guarantees this" },
        ],
        explain: (
          <>
            The log reaching disk is enough. The pages can be redone from it.
          </>
        ),
      },
      Visual: S.PgWalPredict,
    },
    {
      title: "PostgreSQL's own words: changes to data files must be written only after those changes have been logged, and any change not yet applied to a data page can be redone from the WAL records",
      body: (
        <>
          The documentation's own words, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PgWalReveal,
    },
    {
      title: "PostgreSQL's own fix for a torn page is a full-page write: periodically writing a complete image of a page to the WAL before modifying it on disk, so a partially-written page can always be restored from that image",
      body: (
        <>
          PostgreSQL's own words on full-page writes, next to this topic's own measured fix.
        </>
      ),
      duration: 3.0,
      takeaway: "A full-page write is PostgreSQL's own name for exactly the fix this topic just measured.",
      Visual: S.FullPageWriteReveal,
    },
    {
      title: 'Recap: log first, data later',
      body: (
        <>
          Log first, data later: the exact same crash that's survived when the log comes first silently loses the update when it's reversed. Comparing a page's own LSN against a record's own LSN makes redo safe to run more than once. And a page torn by a partial write is caught by its own checksum, fixed by restoring the log's own complete, already-durable image — PostgreSQL's own full-page write.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
