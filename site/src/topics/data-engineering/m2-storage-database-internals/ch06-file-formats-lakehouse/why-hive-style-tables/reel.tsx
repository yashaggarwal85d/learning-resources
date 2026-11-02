import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Hive's own documentation (the VLDB paper's own
// directory-as-partition example, the Hive Transactions wiki's own documented reason for adding
// ACID) and against a real demonstration run in this sandbox: a real two-partition write, paused
// between partitions, with a real concurrent directory listing catching the second partition
// half-written; and a real os.scandir() latency measurement across growing file counts on local
// disk. The local-filesystem substitution for object storage is disclosed explicitly, since this
// sandbox has no real multi-petabyte S3 bucket, but the filesystem-listing mechanics shown are
// the same mechanics a real object-store LIST call has.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A Hive-style table isn't a thing anyone commits to. It's whatever a directory listing
          happens to return right now, for a tree of date-partitioned folders on disk.
        </>
      ),
      duration: 4.4,
      fig: "the shop's order history, laid out as one directory per date -- is that 'the table'?",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does Hive validate a partition value before writing it?',
      body: (
        <>
          A writer inserts a row into a partition directory it names by hand. Does Hive check
          that the partition value actually matches the row's own data?
        </>
      ),
      duration: 3.6,
      fig: "a writer supplies a partition value by hand on every insert -- checked, or just trusted?",
      predict: {
        options: [
          { label: "No — it's entirely up to the writer to supply the correct value", correct: true },
          { label: 'Yes — Hive derives and checks it against the row itself' },
        ],
        explain: (
          <>
            Hive can't validate partition values — it's up to the writer to produce the correct
            one. A wrong value doesn't fail the query; it silently produces wrong results.
          </>
        ),
      },
      Visual: S.PredictValidation,
    },
    {
      title: 'Reveal: directory-as-partition, and no validation',
      body: (
        <>
          Hive's own example: table T, partitioned on two columns, lands its data in a directory
          named by those column values directly — nothing checks the value against the row.
        </>
      ),
      duration: 4.4,
      fig: "a partition is a sub-directory named column=value -- the writer's value, trusted as-is.",
      Visual: S.RevealDirectoryPartition,
    },
    {
      title: "Reveal: the metastore can drift from what's actually on disk",
      body: (
        <>
          Add or drop files and directories on disk, and Hive's metastore doesn't update itself.
          A reader trusts that metadata until an explicit sync catches it up.
        </>
      ),
      duration: 4.6,
      fig: "files change on disk; the metastore's own metadata stays exactly as it was until synced.",
      takeaway: 'Table state and file-system state are two different things that can silently disagree.',
      Visual: S.RevealStaleMetastore,
    },
    {
      title: 'Predict: can a write to two partitions commit as one atomic unit?',
      body: (
        <>
          An insert touches two different partition directories at once. Can a reader ever see
          one partition finished and the other still being written?
        </>
      ),
      duration: 3.6,
      fig: 'an insert spans two partition directories at once -- one atomic commit, or two independent ones?',
      predict: {
        options: [
          { label: 'Yes — a reader can catch one partition done and the other mid-write', correct: true },
          { label: "No — Hive wraps the whole multi-partition write in one transaction" },
        ],
        explain: (
          <>
            Before Hive added transactions, atomicity was only guaranteed at the partition level
            — never across more than one partition in the same write.
          </>
        ),
      },
      Visual: S.PredictAtomicCommit,
    },
    {
      title: 'Reveal: reproduced for real — a listing catches a partition mid-write',
      body: (
        <>
          A real two-partition write, paused between partitions. A concurrent directory listing,
          taken right at that pause, sees the first partition complete and the second half-done.
        </>
      ),
      duration: 4.6,
      fig: 'a real write paused mid-partition: the listing taken right then sees it half-finished.',
      Visual: S.RevealPartialWriteReproduced,
    },
    {
      title: "Reveal: this is Hive's own documented reason for adding ACID",
      body: (
        <>
          Streaming writers into a live partition caused exactly this — readers getting dirty
          reads, and so many small files landing that it pressured the metastore's own NameNode.
        </>
      ),
      duration: 4.6,
      fig: "Hive's own wiki names this directly: dirty reads and small-file pressure from streaming writers.",
      takeaway: "A table with no atomic commit is a moving target for every concurrent reader, not just a theoretical risk.",
      Visual: S.RevealDirtyReadMotivation,
    },
    {
      title: "Reveal: listing itself gets slower as files pile up",
      body: (
        <>
          A real listing call, timed against directories holding a growing number of files, gets
          slower as the count grows — and a full metastore sync scales the same way.
        </>
      ),
      duration: 4.4,
      fig: 'a real timed directory listing at three growing file counts, each one slower than the last.',
      Visual: S.RevealListingCost,
    },
    {
      title: 'Reveal: every problem traces back to one choice',
      body: (
        <>
          No validation, a metastore that drifts, no atomic multi-partition commit, listing that
          gets slower — all of it comes from using a directory listing as the table's own state.
        </>
      ),
      duration: 4.6,
      fig: "four separate symptoms, one root cause: the table's state is just whatever LIST returns.",
      takeaway: 'Every problem this topic reproduced comes from using a directory listing as the table itself.',
      Visual: S.RevealFixShape,
    },
    {
      title: 'Recap',
      body: (
        <>
          Directory-as-partition with no validation, no atomic commit across partitions, and
          listing cost that grows with every file — fixed by an explicit, versioned table state.
        </>
      ),
      duration: 4.8,
      fig: "a mutable table on an immutable, list-based store needs an explicit state, not a directory listing.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
