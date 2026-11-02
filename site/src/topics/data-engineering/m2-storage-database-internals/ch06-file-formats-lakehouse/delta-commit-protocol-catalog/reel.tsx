import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Delta Lake transaction log protocol's own sections on
// Commits and Catalog-managed tables, Databricks' isolation-levels documentation
// (WriteSerializable vs. Serializable, with its own worked delete-vs-insert example), and Delta's
// own 4.0 and 4.3 release announcements -- plus a real put-if-absent commit built in this sandbox
// by reusing topic 10's exact conditional-write primitive and topic 13's two-writer race shape,
// and a real reproduction of the WriteSerializable/Serializable decision rule against real
// committed _delta_log entries. No deltalake/delta-rs library or real catalog is used.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic 27 ended on: a JSON log entry is only a commit once it's written atomically as the
          next version number. This topic is exactly that, for real — using topic 10's own
          conditional-write primitive, now named as Delta's commit mechanism.
        </>
      ),
      duration: 4.8,
      fig: "a json entry is only a commit once it's atomic. this topic is exactly that, for real.",
      Visual: S.Hook,
    },
    {
      title: "Predict: what happens to the losing writer's commit?",
      body: (
        <>
          Two writers race to commit the same next version. Writer A's write lands first. What
          happens to writer B's write — does it overwrite A's, merge with it, or get rejected?
        </>
      ),
      duration: 4.8,
      fig: "two writers race for the same next version. writer a lands first. what happens to writer b?",
      predict: {
        options: [
          { label: "It overwrites or merges with writer A's" },
          { label: 'It gets rejected outright', correct: true },
        ],
        explain: (
          <>
            A commit is a put-if-absent write of the next version number. Exactly one writer can
            win that write; the other gets a real precondition failure, not a merge.
          </>
        ),
      },
      Visual: S.PredictRaceOutcome,
    },
    {
      title: 'Reveal: a real put-if-absent commit, loser rejected with a real 412',
      body: (
        <>
          A real `IfNoneMatch="*"` PUT of `_delta_log/00000000000000000001.json` — writer A's
          write succeeds, writer B's identical attempt is rejected with a real HTTP 412
          `PreconditionFailed`, the same primitive topic 10 demonstrated on a plain key.
        </>
      ),
      duration: 4.8,
      fig: 'a real put-if-absent write of _delta_log/...0001.json. writer b gets a real 412.',
      Visual: S.RevealPutIfAbsentCommit,
    },
    {
      title: 'Reveal: the loser retries and wins the next version',
      body: (
        <>
          Writer B's operation is an append, so there's nothing to re-check — it just re-proposes
          against the new tip and wins version 2, the identical retry rule topic 13 verified for
          Iceberg.
        </>
      ),
      duration: 4.8,
      fig: "writer b's append has no requirements. it retries against the new tip and wins v2.",
      takeaway: 'Put-if-absent decides who wins the commit; what the loser does next depends entirely on what kind of commit it was.',
      Visual: S.RevealAppendRetrySucceeds,
    },
    {
      title: 'Predict: does the delete commit under the default isolation level?',
      body: (
        <>
          A concurrent insert lands at version 3. A delete that read the table before that insert
          then tries to commit at version 4. Under Delta's default isolation level, does that
          delete commit or get rejected as a conflict?
        </>
      ),
      duration: 4.8,
      fig: "an insert commits first. a delete that didn't see it tries to commit next. does it commit?",
      predict: {
        options: [
          { label: 'It commits', correct: true },
          { label: "It's rejected as a conflict" },
        ],
        explain: (
          <>
            WriteSerializable, the default, only requires writes to be serializable — it can order
            the insert "after" the delete, so the delete is allowed to commit.
          </>
        ),
      },
      Visual: S.PredictIsolationLevel,
    },
    {
      title: 'Reveal: WriteSerializable orders it; Serializable would refuse it',
      body: (
        <>
          WriteSerializable (the default) lets the delete commit, because the two operations can
          still be ordered as if the insert happened after the delete. Serializable would refuse
          the same commit as a conflict.
        </>
      ),
      duration: 4.8,
      fig: 'writeserializable (the default) lets it commit: the two can still be ordered.',
      takeaway: 'WriteSerializable orders transactions after the fact; Serializable refuses to, even without an overlap.',
      Visual: S.RevealWriteSerializableAllows,
    },
    {
      title: 'Reveal: the overlapping case splits the two levels further',
      body: (
        <>
          Now the delete's target row is exactly the insert's new row. WriteSerializable still
          allows the commit by the same ordering logic; Serializable now refuses it, because a
          reader must never see a snapshot that disagrees with that ordering.
        </>
      ),
      duration: 4.8,
      fig: 'now the delete targets the exact row the insert just added. writeserializable still allows it.',
      Visual: S.RevealOverlappingCase,
    },
    {
      title: 'Reveal: why S3 historically needed an external coordinator',
      body: (
        <>
          Before S3 supported conditional writes, two writers racing to publish the same next
          version could both succeed, silently overwriting one another — so Delta's DynamoDB
          Commit Coordinator existed specifically to serialize that race externally.
        </>
      ),
      duration: 4.8,
      fig: 'before s3 had conditional writes, two writers could both win. that needed an external lock.',
      Visual: S.RevealWhyDynamoDbExisted,
    },
    {
      title: 'Reveal: catalog-managed tables take over the commit, then everything else',
      body: (
        <>
          Delta 4.0 (September 2025) previews the catalog as the source of truth for commits;
          4.2 moves the commit itself under the catalog; 4.3 moves every other table operation —
          loads, CREATE, REPLACE, schema-changing writes — under the same catalog APIs.
        </>
      ),
      duration: 4.8,
      fig: '4.0 previews the catalog as source of truth; 4.2 moves commits under it; 4.3 moves everything else.',
      takeaway: "This isn't a bigger lock: it's the catalog becoming the only place a commit's success can be answered.",
      Visual: S.RevealCatalogManagedTimeline,
    },
    {
      title: 'Recap',
      body: (
        <>
          A commit is a put-if-absent write of the next version. An isolation level decides which
          non-overlapping races are even allowed to commit. Catalog-managed tables move that
          decision from the filesystem into the catalog, one operation type at a time.
        </>
      ),
      duration: 4.8,
      fig: "a commit protocol only matters because of what produces commits -- next: delta's dml.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
