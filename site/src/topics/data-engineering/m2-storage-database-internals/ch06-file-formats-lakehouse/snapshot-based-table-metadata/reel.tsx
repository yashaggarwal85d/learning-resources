import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's and Delta's own specifications (atomic
// metadata-file swap, optimistic commits, a serial history of atomic versions) and against a
// real demonstration run in this sandbox: a real pinned reader's file list, read before and
// after a real second writer's commit, proven identical both times; and a real compare-and-swap
// race between two writers using os.open with O_EXCL, where exactly one wins and the other gets
// a real, immediate rejection. The local-filesystem stand-in for a catalog/object store is
// disclosed explicitly, since the same atomicity primitive (POSIX atomic rename, O_EXCL) is what
// a real metastore check-and-put or a real conditional write provides underneath.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A directory listing broke as table state — a reader could catch a write half-finished.
          This topic is the fix: one immutable file describing the whole table, plus one pointer.
        </>
      ),
      duration: 4.4,
      fig: "the fix for a broken directory listing: an explicit, versioned table state.",
      Visual: S.Hook,
    },
    {
      title: "Predict: if a snapshot never changes, how does the table change at all?",
      body: (
        <>
          A snapshot is immutable — not one byte of it is ever edited after it's written. So how
          does a table's contents ever actually change?
        </>
      ),
      duration: 3.6,
      fig: 'a snapshot never gets edited, ever -- so how does the table itself ever change?',
      predict: {
        options: [
          { label: 'A whole new snapshot is written, and a pointer moves to it', correct: true },
          { label: 'The existing snapshot file is edited in place, field by field' },
        ],
        explain: (
          <>
            A new snapshot file is written describing the new state. The old one is left exactly
            as it was — nothing about it is ever touched again.
          </>
        ),
      },
      Visual: S.PredictImmutable,
    },
    {
      title: 'Reveal: a snapshot is the whole file list, not a diff',
      body: (
        <>
          A snapshot represents the complete set of data files in the table at one moment — not a
          change since the last version, the entire table, readable on its own.
        </>
      ),
      duration: 4.4,
      fig: 'a snapshot: the full set of data files, right now, self-contained.',
      Visual: S.RevealSnapshotIsWholeFile,
    },
    {
      title: 'Reveal: the commit is one atomic pointer swap',
      body: (
        <>
          Every change to table state creates a brand new metadata file and replaces the old one
          with an atomic swap. The listing is gone; a pointer is all that moves.
        </>
      ),
      duration: 4.6,
      fig: 'a new metadata file written; the pointer swapped atomically; the old file never touched.',
      takeaway: "A table version is a fact written once — the pointer says what's current, not a listing.",
      Visual: S.RevealAtomicPointerSwap,
    },
    {
      title: 'Predict: can a pinned reader ever see a concurrent commit?',
      body: (
        <>
          A reader pins one snapshot id and reads only that. A second writer commits while it's
          still reading. Does the pinned reader ever see that writer's change?
        </>
      ),
      duration: 3.6,
      fig: 'a reader pins a snapshot; a second writer commits meanwhile -- does the pinned read ever notice?',
      predict: {
        options: [
          { label: 'No — the pinned snapshot is immutable, so it never changes under the reader', correct: true },
          { label: "Yes — if the commit lands mid-read, the reader can catch part of it" },
        ],
        explain: (
          <>
            Readers use the snapshot that was current when they loaded the table and are not
            affected by changes until they explicitly refresh.
          </>
        ),
      },
      Visual: S.PredictPinnedReader,
    },
    {
      title: 'Reveal: reproduced for real — the pinned reader never moves',
      body: (
        <>
          A real reader pins a snapshot and reads it. A second writer commits for real. The
          pinned reader reads the exact same path again — identical file list, both times.
        </>
      ),
      duration: 4.6,
      fig: 'the same pinned file, read twice, before and after a real second commit -- byte for byte identical.',
      Visual: S.RevealPinnedReaderUnaffected,
    },
    {
      title: 'Reveal: the protocol is optimistic by design',
      body: (
        <>
          Writers stage their files first, with no lock and no coordination at all. Only the
          commit itself — the pointer swap — is a race, and a lost race just means a retry.
        </>
      ),
      duration: 4.6,
      fig: 'writers stage files freely; only the final commit -- the pointer swap -- is ever a race.',
      takeaway: 'Optimistic concurrency means writers never block each other to write — only to commit.',
      Visual: S.RevealOptimisticCommit,
    },
    {
      title: 'Reveal: reproduced for real — exactly one writer wins',
      body: (
        <>
          Two real writers race to claim the same commit slot from the same base. One succeeds.
          The other gets a real, immediate rejection and retries against the new base.
        </>
      ),
      duration: 4.4,
      fig: 'two real writers claim the same slot at once -- one real success, one real rejection.',
      Visual: S.RevealCompareAndSwapRace,
    },
    {
      title: "Reveal: Delta's own protocol is the identical shape",
      body: (
        <>
          Delta describes its own table state the same way: a single serial history of atomic
          versions, with readers using a transaction log instead of listing files.
        </>
      ),
      duration: 4.6,
      fig: "Delta's own words: a serial history of atomic versions, read through a log.",
      takeaway: 'Iceberg and Delta reach the same design from the same problem — an explicit, versioned history beats a listing.',
      Visual: S.RevealDeltaSameShape,
    },
    {
      title: 'Recap',
      body: (
        <>
          A snapshot is immutable, a commit is one atomic pointer swap, and when two writers race
          for that same swap, exactly one of them wins.
        </>
      ),
      duration: 4.8,
      fig: 'replace the listing with an immutable version and one pointer that moves atomically.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
