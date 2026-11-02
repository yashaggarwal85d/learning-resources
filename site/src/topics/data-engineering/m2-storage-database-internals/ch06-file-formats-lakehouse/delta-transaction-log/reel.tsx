import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Delta Lake transaction log protocol's own sections on
// Delta Log Entries, Checkpoints, Log Compaction Files, the Version Checksum File, Action
// Reconciliation and Protocol Evolution/Table Features, plus Delta's own "How does Delta Lake
// manage feature compatibility?" docs -- and against a real _delta_log directory built by hand
// in this sandbox: five real JSON commits, a real classic Parquet checkpoint (via pyarrow, this
// repo's baseline dependency) verified against an independent replay, a real _last_checkpoint
// pointer, a real log compaction file, a real Version Checksum file, and a real upgrade from
// numeric protocol versions to named table features. No deltalake/delta-rs library is used.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Iceberg's own transaction log is a metadata tree of files. This topic opens the Delta
          arc: the same commit-and-history idea, built from a visibly different mechanism — an
          ordered JSON log, reconstructed by hand from a real `_delta_log` directory.
        </>
      ),
      duration: 4.8,
      fig: "iceberg's transaction log is a metadata tree. this topic opens the delta arc: an ordered json log.",
      Visual: S.Hook,
    },
    {
      title: "Predict: what do you need to read to know the table's files right now?",
      body: (
        <>
          Five real JSON commits sit in `_delta_log`. What do you need to read to know what files
          are in the table right now?
        </>
      ),
      duration: 4.8,
      fig: 'five real json commits sit in _delta_log. what do you need to read to know the files right now?',
      predict: {
        options: [
          { label: 'Just the latest commit file' },
          { label: 'Every commit from the start, in order', correct: true },
        ],
        explain: (
          <>
            A commit is a diff against the previous version, not the full state. With no
            checkpoint, a reader has to replay every commit in order to know what's live.
          </>
        ),
      },
      Visual: S.PredictReplayOrLatest,
    },
    {
      title: 'Reveal: five real commits, written by hand to spec',
      body: (
        <>
          Five real commits, written by hand to spec: `00000000000000000000.json` through
          `00000000000000000004.json` — newline-delimited JSON, one action per line, named by the
          next available version number, zero-padded to 20 digits.
        </>
      ),
      duration: 4.8,
      fig: 'five real commits, written by hand to spec: 00000000000000000000.json through ...0004.json.',
      Visual: S.RevealFiveRealCommits,
    },
    {
      title: 'Reveal: reconstructed by hand, from nothing but the raw log',
      body: (
        <>
          Reconstructed by hand: replaying all five commits' `add`/`remove`/`metaData`/`protocol`
          actions gives 4 live files, 9 rows — and a file added in v0 and removed in v2 is
          correctly gone.
        </>
      ),
      duration: 4.8,
      fig: 'reconstructed by hand, from nothing but the raw log: 4 live files, 9 rows.',
      takeaway: "A Delta reader's whole job is replaying ordered JSON actions and keeping the newest reference per file path.",
      Visual: S.RevealReconstructedByHand,
    },
    {
      title: 'Predict: does a reader still replay version 0 after a checkpoint exists?',
      body: (
        <>
          A real checkpoint gets written at version 2. To get version 4's state, does a reader
          still have to replay version 0?
        </>
      ),
      duration: 4.8,
      fig: 'a real checkpoint gets written at version 2. to get version 4, does a reader still replay version 0?',
      predict: {
        options: [
          { label: "Yes, checkpoints don't change that" },
          { label: 'No, it can start from the checkpoint', correct: true },
        ],
        explain: (
          <>
            A checkpoint is the complete reconciled state up to its version. A reader can start
            there and replay only the commits newer than it.
          </>
        ),
      },
      Visual: S.PredictCheckpointShortCircuit,
    },
    {
      title: 'Reveal: a real checkpoint, verified against an independent replay',
      body: (
        <>
          A real classic checkpoint, written as real Parquet via pyarrow — its contents match an
          independent, from-scratch replay of versions 0 through 2 exactly.
        </>
      ),
      duration: 4.8,
      fig: 'a real parquet checkpoint, verified against an independent from-scratch replay.',
      takeaway: 'A checkpoint is the complete reconciled state up to a version; a reader can start there, not from the beginning.',
      Visual: S.RevealCheckpointMatchesReplay,
    },
    {
      title: 'Reveal: short-circuited for real, same answer either way',
      body: (
        <>
          Short-circuited for real: starting from the v2 checkpoint and replaying only versions 3
          and 4 gives the identical file set as replaying from version 0 — and `_last_checkpoint`
          is the real pointer that lets a reader find it without listing the directory.
        </>
      ),
      duration: 4.8,
      fig: 'short-circuited for real: v2 checkpoint + replaying v3-v4 gives the same answer as from v0.',
      Visual: S.RevealShortCircuited,
    },
    {
      title: 'Reveal: a real log compaction file, and a real version checksum',
      body: (
        <>
          A real log compaction file for the range [3, 4] matches reading those two commits
          directly. A real version checksum's `numFiles` and `tableSizeBytes` are computed from
          the real reconciled state, not asserted.
        </>
      ),
      duration: 4.8,
      fig: 'a real log compaction file, and a real version checksum, both computed from real state.',
      Visual: S.RevealCompactionAndChecksum,
    },
    {
      title: 'Reveal: the same protocol, two different vocabularies',
      body: (
        <>
          Version 0's protocol action uses only numeric `minReaderVersion`/`minWriterVersion`.
          After a real upgrade at version 3, the identical concept is expressed as named strings
          in `readerFeatures`/`writerFeatures`.
        </>
      ),
      duration: 4.8,
      fig: 'the same protocol, two vocabularies: numeric versions at v0, named table features after a real upgrade at v3.',
      takeaway: 'Table features replace a protocol version number with an explicit, named list of what a client must actually support.',
      Visual: S.RevealProtocolVsFeatures,
    },
    {
      title: 'Recap',
      body: (
        <>
          `_delta_log` is an ordered, replayable JSON log. A checkpoint is a reconciled snapshot
          of it. Compaction and checksums are optional accelerants and integrity checks on top.
          Protocol versions are giving way to named table features.
        </>
      ),
      duration: 4.8,
      fig: "a json log entry is only a commit once it's atomic -- next is exactly how, for real.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
