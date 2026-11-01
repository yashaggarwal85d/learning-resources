import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py, modelling Iceberg/Delta's own documented snapshot and
// delete-file mechanics, and Kafka's own documented tombstone and delete.retention.ms
// behaviour): a time-travel query against a snapshot from before a DELETE still returns the
// "erased" subject; expiring old snapshots and compacting removes them from the physical data
// file; a Kafka tombstone hides the value immediately but the tombstone record itself only
// disappears after the retention window elapses; and deleting one subject's encryption key
// makes every copy of their data -- including a backup taken before the key was deleted --
// unreadable at once, while an untouched subject's data in the same copies stays readable.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A customer exercises the right to erasure. `DELETE FROM customers WHERE id = 42` runs,
          and the row is gone from every query you try. A month later, an auditor runs a
          time-travel query at last week's snapshot and reads the customer's name -- in the
          lakehouse, in a Kafka topic, and in last night's backup. Which of the three can a SQL
          statement actually fix, and which needs a key?
        </>
      ),
      duration: 5,
      fig: 'DELETE ran. An auditor still finds the name, three places. Which needs a key?',
      Visual: S.Hook,
    },
    {
      title: "Reveal: a DELETE writes a new snapshot; the old snapshot still references the old data file, untouched",
      body: (
        <>
          A `DELETE` in a lakehouse table does not erase anything in place. It writes a brand
          new snapshot with a marker saying the row is gone. The snapshot that existed a moment
          earlier still points at the exact same data file, which nothing has touched.
        </>
      ),
      duration: 4.8,
      fig: 'DELETE writes a new snapshot. The old one still points at the old, untouched file.',
      Visual: S.RevealNewSnapshot,
    },
    {
      title: 'Predict: time-travel to the snapshot from before the DELETE. Does it still show the subject?',
      body: (
        <>
          Run a query against the snapshot that existed the moment before the `DELETE` ran.
          Does that query still return the subject whose row was supposedly erased?
        </>
      ),
      duration: 2.8,
      fig: 'query the old snapshot, from before the DELETE. Subject still there?',
      predict: {
        options: [
          { label: "No -- deleting the row should have removed it from every snapshot, old or new" },
          { label: "Yes -- the old snapshot's own metadata still points at the same unchanged file", correct: true },
        ],
        explain: (
          <>
            Yes. The old snapshot was never edited; it still references the data file exactly
            as it existed before the delete, which still physically contains the row.
          </>
        ),
      },
      Visual: S.PredictTimeTravel,
    },
    {
      title: 'Reveal: yes, measured directly -- the current read hides them, the old snapshot does not',
      body: (
        <>
          Measured directly: querying the table normally hides the deleted subject, exactly as
          expected. Querying the old snapshot by its own id still returns them, untouched.
        </>
      ),
      duration: 4.8,
      fig: 'current read: hidden. Old snapshot: still there, measured.',
      Visual: S.RevealTimeTravelShows,
    },
    {
      title: 'Elaborate: expiring the old snapshots and compacting physically removes the row',
      body: (
        <>
          Erasure finishes in two more steps. Expiring the old snapshots removes them from
          metadata, so time travel can no longer reach them. Compacting rewrites the data file
          itself, leaving out whatever no remaining snapshot still points at. Neither step runs
          automatically -- a real system defaults to a retention window of about a week before
          it will even consider a file safe to remove.
        </>
      ),
      duration: 5,
      fig: 'expire: old metadata gone. Compact: file rewritten, row gone for good.',
      takeaway: "A delete only hides a row from the newest snapshot; expiring and compacting is what actually erases it.",
      Visual: S.ElaborateExpireCompact,
    },
    {
      title: 'Predict: a Kafka tombstone removes the value. Does it remove the record that a deletion happened?',
      body: (
        <>
          A tombstone is a record with the subject's key and no value, written specifically to
          delete their earlier value from a compacted log. Does writing that tombstone also
          erase the evidence that a deletion ever took place?
        </>
      ),
      duration: 2.8,
      fig: 'tombstone written. Value gone. Does the deletion record disappear too?',
      predict: {
        options: [
          { label: 'Yes -- a tombstone and the thing it deletes vanish from the log together' },
          { label: 'No -- the tombstone itself sticks around for a separate retention window', correct: true },
        ],
        explain: (
          <>
            No. The tombstone is its own record, and it is kept for its own configured length
            of time before the log cleans it out too -- deleting the value and erasing the
            tombstone are two different moments.
          </>
        ),
      },
      Visual: S.PredictTombstone,
    },
    {
      title: 'Reveal: not immediately -- the tombstone itself only disappears after delete.retention.ms, measured directly',
      body: (
        <>
          Measured directly: right after the tombstone is written, the subject's value is gone
          but the tombstone record itself is still sitting there. Only once the configured
          retention window has actually elapsed does a later compaction remove the tombstone
          too.
        </>
      ),
      duration: 4.8,
      fig: 'right after: tombstone present. After the window: tombstone gone, measured.',
      Visual: S.RevealTombstoneExpires,
    },
    {
      title: 'Elaborate: a lagging consumer can miss the delete marker entirely',
      body: (
        <>
          If a reader is behind by more than that retention window when it finally gets to
          scanning from the start of the log, the tombstone has already been swept away. It
          sees no value and no record that one was ever removed -- which is exactly why a
          backup taken before the key was ever touched can quietly go on holding the subject.
        </>
      ),
      duration: 5,
      fig: 'lag past the window, and the deletion itself leaves no trace to find.',
      takeaway: 'A compacted log forgets the value at once, but only forgets it forgot after its own retention window runs out.',
      Visual: S.ElaborateLaggingConsumer,
    },
    {
      title: "Reveal: crypto-shredding -- deleting one subject's key makes every copy unreadable at once, measured directly; an untouched subject stays fully readable",
      body: (
        <>
          Measured directly: encrypt one subject's data under their own key everywhere it
          lives -- the table, the log, and a backup taken before the key is ever deleted.
          Delete that one key, and all three copies become unreadable in the same instant,
          without touching a single byte of any of them. A different subject, whose key was
          never deleted, stays fully readable in those exact same copies.
        </>
      ),
      duration: 5,
      fig: 'one key deleted: table, log, backup -- all unreadable at once, measured.',
      Visual: S.RevealCryptoShredding,
    },
    {
      title: "Reveal: proving deletion to an auditor; retention policies as code",
      body: (
        <>
          None of this is worth anything to an auditor unless it can be shown, not just
          asserted. The evidence is the table's own snapshot list after expiry, the physical
          file listing, and the key store's own deletion record, plus a repeat of the search
          for the subject coming back empty. Writing the retention rule itself as versioned
          configuration -- a retention class per dataset, applied by a scheduled job -- is what
          turns "we delete after some number of days" into something that can actually be
          checked, not just claimed.
        </>
      ),
      duration: 5,
      fig: "evidence: snapshot list, file listing, key store record. Retention: written as code.",
      Visual: S.RevealProvingDeletion,
    },
    {
      title: 'Recap',
      body: (
        <>
          A `DELETE` alone leaves the old snapshot standing. Expiring and compacting is what
          actually erases the file. A tombstone hides a value before the log forgets the
          tombstone ever existed. One key deleted reaches every copy at once, measured.
        </>
      ),
      duration: 5,
      fig: 'delete hides; expire and compact erase; one key reaches every copy, measured.',
      takeaway: "Erasure here is never one step: the SQL statement, the maintenance job, and for what SQL can't reach, a key.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
