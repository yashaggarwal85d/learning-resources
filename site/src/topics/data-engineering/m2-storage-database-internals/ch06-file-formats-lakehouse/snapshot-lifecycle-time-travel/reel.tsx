import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's own maintenance docs (snapshots enable time
// travel and rollback; expiring snapshots removes them from metadata and lets their data files be
// deleted; removing orphan files with too short a retention can corrupt the table), Delta's own
// utility-commands docs (VACUUM's default retention, the loss of time travel past it, and its own
// danger note about a retention interval shorter than a concurrent reader or writer), and
// Databricks' own GDPR-compliance docs (a hard delete needs VACUUM to actually, permanently remove
// the data; Delta's default history retention) -- and against a real snapshot chain, a real
// expiry-and-vacuum pass that reclaims measured storage, a real "GDPR delete" whose original file
// survives until vacuum, and a real reader corrupted by too-short a retention window, all
// reproduced on a real local directory tree.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic sixteen was about how a column's identity survives a rename. This topic is about
          the table as a whole: how far back a snapshot-based table lets you go to see an old
          version, and how it eventually forgets that version ever existed.
        </>
      ),
      duration: 4.8,
      fig: "a column's identity survives change -- this topic is how far a whole table lets you go back, and how it forgets.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: after three more commits, can you still read the table as it looked right after the first one?',
      body: (
        <>
          A table commits three more times after its very first commit, each one adding a new
          file. Can a query still read the table exactly as it looked right after that first
          commit?
        </>
      ),
      duration: 4.8,
      fig: 'three commits happen after the first one -- can you still read the table as it looked right then?',
      predict: {
        options: [
          { label: 'No — only the current version is ever readable' },
          { label: "Yes, as long as that snapshot hasn't been expired", correct: true },
        ],
        explain: (
          <>
            Every snapshot a table has ever committed stays readable by time travel, right up
            until something expires it.
          </>
        ),
      },
      Visual: S.PredictTimeTravelAfterCommits,
    },
    {
      title: 'Reveal: reproduced for real — time travel by id, by timestamp, and rollback',
      body: (
        <>
          A real chain of snapshots, queried both ways: time travel by snapshot id returns that
          exact file list, time travel by timestamp resolves to whichever snapshot was current at
          that moment, and rollback moves the table's current pointer straight back to an earlier
          snapshot.
        </>
      ),
      duration: 4.8,
      fig: 'a real snapshot chain -- time travel by id, by timestamp, and rollback, all verified.',
      Visual: S.RevealTimeTravelAndRollback,
    },
    {
      title: "Reveal: Iceberg's own words — a superseded file stays until no snapshot needs it",
      body: (
        <>
          Iceberg's own maintenance docs: "Data files are not deleted until they are no longer
          referenced by a snapshot that may be used for time travel or rollback."
        </>
      ),
      duration: 4.8,
      fig: "a superseded file isn't deleted -- it stays until every snapshot referencing it expires.",
      takeaway: 'A file a new commit replaces still sits on disk until the snapshots pointing at it expire.',
      Visual: S.RevealSnapshotsKeepFilesAlive,
    },
    {
      title: 'Reveal: reproduced for real — expiring old snapshots and vacuuming reclaims real storage',
      body: (
        <>
          Two old snapshots expired for real, then their now-orphaned files removed: the exact
          bytes reclaimed were measured directly on disk, and a time-travel query to either
          expired snapshot now genuinely fails.
        </>
      ),
      duration: 4.8,
      fig: 'two old snapshots expired, their orphaned files removed -- the reclaimed bytes measured for real.',
      takeaway: 'Expiring a snapshot is what finally lets its files be deleted and the storage reclaimed.',
      Visual: S.RevealExpireReclaimsStorage,
    },
    {
      title: "Reveal: a hard delete isn't gone until vacuum runs — the real GDPR conflict",
      body: (
        <>
          Databricks' own words: "Delta Lake retains table history, including deleted records...
          and makes it available for time travel." Reproduced for real: a delete commit's original
          file survives on disk, still time-travelable, until the old snapshot referencing it is
          expired and vacuumed.
        </>
      ),
      duration: 4.8,
      fig: "a delete commits a redacted file -- the original isn't gone until the old snapshot is vacuumed.",
      Visual: S.RevealGdprConflict,
    },
    {
      title: 'Predict: maintenance expires a snapshot a reader is still mid-read on — what happens?',
      body: (
        <>
          A reader has pinned a snapshot and started reading its files. Before it finishes,
          maintenance expires that very snapshot and deletes the files it alone referenced. What
          happens to the reader?
        </>
      ),
      duration: 4.8,
      fig: 'a reader is mid-read on a snapshot maintenance just expired -- what happens to that read?',
      predict: {
        options: [
          { label: 'Nothing — the reader already has what it needs' },
          { label: 'The read can fail, or worse', correct: true },
        ],
        explain: (
          <>
            Both Iceberg's and Delta's own docs warn exactly about this: a retention window
            shorter than an in-flight read or write is genuinely dangerous.
          </>
        ),
      },
      Visual: S.PredictRetentionTooShort,
    },
    {
      title: 'Reveal: reproduced for real — too-aggressive cleanup corrupts a pinned reader',
      body: (
        <>
          Reproduced for real, twice: with a retention window shorter than the reader's in-flight
          read, the reader's own file genuinely disappears underneath it and the read fails. The
          identical scenario with a long-enough window succeeds.
        </>
      ),
      duration: 4.8,
      fig: 'too-short retention expires the reader’s own snapshot mid-read -- the read fails, measured for real.',
      Visual: S.RevealReaderCorrupted,
    },
    {
      title: 'Reveal: the real retention-window trade-off',
      body: (
        <>
          Delta's own caution: retention "must be longer than the longest running concurrent
          transaction." Too long, and storage and deleted PII both linger. Too short, and a reader
          or writer gets corrupted. One knob trades off all three.
        </>
      ),
      duration: 4.8,
      fig: 'retention must outlast every reader and writer, yet stay short enough to reclaim storage or honor a delete.',
      takeaway: 'The retention window is one knob that trades reclaimed storage, honored deletes, and reader safety against each other.',
      Visual: S.RevealRetentionTradeoff,
    },
    {
      title: 'Recap',
      body: (
        <>
          Time travel and rollback both read from the same snapshot chain. Expiring old snapshots
          is what reclaims storage and what finally makes a hard delete real. The retention window
          is the one knob that trades reclaiming storage, honoring a delete, and protecting a
          concurrent reader against each other.
        </>
      ),
      duration: 4.8,
      fig: "a snapshot isn't really gone until expiry and vacuum say so -- and that timing is the real trade-off.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
