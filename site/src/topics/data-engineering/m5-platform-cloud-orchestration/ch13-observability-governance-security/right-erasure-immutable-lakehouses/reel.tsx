import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here runs in examples.py: a real Delta Lake table's DELETE survives time travel
// until VACUUM runs, after which the same time-travel read fails; a backup copied before the
// erasure still carries the subject; a compacted-log tombstone keeps its key until retention
// elapses; one key deletion makes all three synthetic copies unreadable at once.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A customer asks to be forgotten. You run a `DELETE`, and the row is gone from every
          query. A month later an auditor time-travels to last week's snapshot — and reads the
          customer's name there, in a Kafka topic, and in last night's backup.
        </>
      ),
      duration: 6,
      fig: 'deleted, everywhere you looked. Still readable in three other places.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: SQL, or something else?',
      body: (
        <>
          The table, the Kafka topic, the backup. Does one more SQL statement finish the job on
          all three, or does each one actually need something different?
        </>
      ),
      duration: 6,
      fig: 'table, topic, backup. One fix, or three different ones?',
      predict: {
        options: [
          { label: 'One more SQL statement, run against each one, finishes the job' },
          { label: 'Three different operations — none of them is just "run more SQL"', correct: true },
        ],
        explain: (
          <>
            The table needs its old snapshot expired and vacuumed, not just deleted from. The
            topic needs its own tombstone's retention window to pass. The backup needs a new
            backup cycle, or a key deleted out from under it.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: a delete writes a snapshot, not an erasure',
      body: (
        <>
          `DELETE` doesn't erase a row — it writes a new snapshot that leaves it out. The old
          snapshot, and every file it points to, is still sitting right there on disk, and a
          time-travel query at that old snapshot still reads it.
        </>
      ),
      duration: 6,
      fig: 'a new snapshot, leaving the row out. The old one, untouched.',
      Visual: S.RevealSnapshotNotErasure,
    },
    {
      title: 'Reveal: hidden from queries before it’s gone from disk',
      body: (
        <>
          A delete file marks the row as removed for every query that runs from here on. The
          row's own bytes stay exactly where they were, inside the original file, until a
          compaction actually rewrites it away.
        </>
      ),
      duration: 6,
      fig: 'marked removed for every query. Its bytes, untouched, until rewritten.',
      Visual: S.RevealMergeOnRead,
    },
    {
      title: 'Reveal: what actually frees the bytes',
      body: (
        <>
          Expiring the old snapshot, vacuuming, removing orphan files — these are what physically
          remove data. Each has its own retention window, and shortening that window risks
          breaking a reader mid-query.
        </>
      ),
      duration: 6,
      fig: 'expire, vacuum, remove orphans. Each with its own window, its own risk.',
      Visual: S.RevealMaintenanceOps,
    },
    {
      title: 'Reveal: three more places it survives',
      body: (
        <>
          A replica. A nightly backup. A Kafka topic, cleared only once its own tombstone's
          retention window elapses. None of these sit anywhere near a table operation at all.
        </>
      ),
      duration: 6,
      fig: 'replica, backup, topic. Outside every table operation, entirely.',
      Visual: S.RevealSurvivalPoints,
    },
    {
      title: 'Reveal: one key, every copy at once',
      body: (
        <>
          Encrypt a subject's rows under a key that belongs only to them. Delete that one key,
          and the table, the topic and the backup all go unreadable in the same instant — without
          touching a single one of them.
        </>
      ),
      duration: 6.4,
      fig: 'one key, deleted once. Three copies, unreadable at once.',
      Visual: S.RevealCryptoShredding,
    },
    {
      title: 'Reveal: what that costs at scale',
      body: (
        <>
          A key per subject means a key to store, a key looked up on every single read, and a KMS
          call rate that climbs with every subject added — and it only ever erases what was
          actually encrypted under that one key.
        </>
      ),
      duration: 6.4,
      fig: 'a key per subject. Storage, lookups, and a limit of its own.',
      takeaway: 'Crypto-shredding scales with every subject added — a key to store, a lookup per read, a growing call rate.',
      Visual: S.RevealShredCost,
    },
    {
      title: 'Reveal: proving it to an auditor',
      body: (
        <>
          "We ran a command" isn't evidence. The table's own metadata showing no active snapshot
          points at the subject's files, and the key store's own record of exactly when the key
          was destroyed — that's what actually proves it.
        </>
      ),
      duration: 6.4,
      fig: "metadata, and a key store's own record. Not a memory of a command.",
      takeaway: 'Proof is the table’s own metadata and the key store’s deletion record — not a memory of a command run.',
      Visual: S.RevealProvingErasure,
    },
    {
      title: 'Reveal: retention, written down as code',
      body: (
        <>
          Which windows apply, and which artefacts get crypto-shredded versus left to retention —
          written down and version-controlled, not decided fresh, under pressure, every single
          time a request lands.
        </>
      ),
      duration: 6,
      fig: 'the policy, in code. Not a judgment call, remade each time.',
      takeaway: 'Retention and crypto-shredding decisions belong in version-controlled policy, not a fresh judgment call per request.',
      Visual: S.RevealPolicyAsCode,
    },
    {
      title: 'Recap',
      body: (
        <>
          A delete writes a snapshot, not an erasure. Merge-on-read hides a row before it's
          physically gone. Expiry and vacuum are what actually free the bytes. A replica, a
          backup, a topic all sit outside every table operation. One key, deleted once, reaches
          every copy. And proof is metadata, not memory.
        </>
      ),
      duration: 6.4,
      fig: 'hidden, then freed; outside the table; one key; proof in metadata.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A subject's key gets crypto-shredded today. Nobody ever ran a table-level `DELETE` for
          that subject — their row is still sitting there, in every ordinary query. Does the
          query still hand back readable data, or not?
        </>
      ),
      duration: 6.4,
      fig: 'key shredded, row never deleted. Still readable, or not?',
      predict: {
        options: [
          { label: 'The row disappears from the query entirely, the same as a real delete' },
          { label: 'The row is still returned — its value is now ciphertext nobody can decrypt', correct: true },
        ],
        explain: (
          <>
            Crypto-shredding never touches the table itself — only the key. The row stays exactly
            where it was and the query still returns it; what comes back is unreadable ciphertext,
            because the one key that could decrypt it is gone.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
