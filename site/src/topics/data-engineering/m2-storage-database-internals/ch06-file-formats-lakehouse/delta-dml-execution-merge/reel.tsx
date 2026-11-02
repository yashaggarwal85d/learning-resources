import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Delta's own Transaction Log Protocol (Row Tracking: fresh
// vs. stable Row IDs), Delta's Concurrency control docs (the MERGE-vs-COMPACTION conflict pair,
// ConcurrentDeleteReadException), and Databricks' Low shuffle merge documentation -- plus a real
// MERGE built in this sandbox: a full-file rewrite measured in real bytes, a deletion-vector-mode
// rewrite measured the same way, a real conflict between a MERGE and a concurrent compaction with
// a real successful retry, and a real demonstration of Row Tracking's fresh-vs-stable split. No
// deltalake/delta-rs library is used.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic 28 ended on: a commit protocol only matters because of what produces commits. This
          topic is exactly that — Delta's own DML, starting with MERGE.
        </>
      ),
      duration: 4.8,
      fig: "a commit protocol only matters because of what produces commits. this topic: delta's own dml.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: how much of the file does MERGE actually rewrite?',
      body: (
        <>
          A MERGE matches 11 rows out of 1000 in one file. With deletion vectors disabled, how
          much of that file does MERGE actually rewrite — just the 11 rows, or the whole file?
        </>
      ),
      duration: 4.8,
      fig: 'merge matches 11 rows out of 1000 in one file. how much of that file gets rewritten?',
      predict: {
        options: [
          { label: 'Just the 11 matched rows' },
          { label: 'The whole file', correct: true },
        ],
        explain: (
          <>
            Delta updates a table by rewriting whole data files — MERGE finds a file by its row
            range, not its contents, then rewrites every row in it, matched or not.
          </>
        ),
      },
      Visual: S.PredictRewriteScope,
    },
    {
      title: 'Reveal: the whole file, for real',
      body: (
        <>
          The whole file, for real: 17834 bytes written to rewrite 1000 rows in order to change
          11 of them. MERGE finds the file by its row range, not its contents, then rewrites it
          whole.
        </>
      ),
      duration: 4.8,
      fig: 'the whole file, for real: 17834 bytes written to change 11 rows out of 1000.',
      Visual: S.RevealFullRewrite,
    },
    {
      title: 'Reveal: with deletion vectors, 70.8x less',
      body: (
        <>
          With deletion vectors enabled, the same MERGE writes a real bitmap marking the old rows
          deleted, plus a small new-rows file — 70.8x less written, for the identical matched
          set.
        </>
      ),
      duration: 4.8,
      fig: 'deletion vectors on: a real bitmap plus a small new-rows file. 70.8x less.',
      takeaway: 'Deletion vectors turn "rewrite everything that file holds" into "mark what changed, write only what\'s new."',
      Visual: S.RevealDeletionVectorMode,
    },
    {
      title: "Predict: what happens to MERGE's commit?",
      body: (
        <>
          A MERGE reads the table and plans to touch file 1. A concurrent compaction commits first
          and removes file 1. Does the MERGE's commit succeed, fail outright, or get a chance to
          retry?
        </>
      ),
      duration: 4.8,
      fig: 'merge plans to touch file 1. a concurrent compaction removes it first. what happens to merge?',
      predict: {
        options: [
          { label: 'It succeeds anyway' },
          { label: 'It conflicts, and can retry', correct: true },
        ],
        explain: (
          <>
            MERGE and compaction can conflict by Delta's own rules — and a conflict triggers a
            specific exception naming exactly what changed, not a silent failure.
          </>
        ),
      },
      Visual: S.PredictMergeCompactionRace,
    },
    {
      title: "Reveal: a real conflict, and a real retry",
      body: (
        <>
          A real conflict, the exact pair Delta's own docs name as "can conflict." The MERGE
          detects it, re-reads the new tip, finds file 1's compacted replacement, and retries
          successfully.
        </>
      ),
      duration: 4.8,
      fig: "a real conflict, the exact pair delta's docs name. merge re-reads and retries, for real.",
      takeaway: "A conflict isn't a dead end; it's a signal to re-plan against what's actually there now.",
      Visual: S.RevealConflictAndRetry,
    },
    {
      title: 'Reveal: the same row, rewritten, keeps one ID and loses the other',
      body: (
        <>
          Row Tracking: the same row, rewritten into a new file at a new position, keeps its
          materialized (stable) Row ID exactly — but its default generated (fresh) Row ID, computed
          only from file plus position, comes out completely different.
        </>
      ),
      duration: 4.8,
      fig: 'the same row, rewritten: its stable id survives exactly; its fresh id comes out different.',
      Visual: S.RevealRowTrackingSplit,
    },
    {
      title: 'Reveal: why the split exists',
      body: (
        <>
          A fresh ID is cheap and needs no extra storage — good for matching rows within one
          version, like a self-join. A stable ID costs a materialized column, but survives a
          rewrite. Delta gives you both, separately.
        </>
      ),
      duration: 4.8,
      fig: "a fresh id is free but unstable; a stable id costs a column but survives a rewrite.",
      Visual: S.RevealWhySplitExists,
    },
    {
      title: 'Reveal: named, not rebuilt here',
      body: (
        <>
          Named, not rebuilt here: low-shuffle merge, a real query engine's own shuffle planner
          optimizing this exact full-rewrite cost inside Spark; and Change Data Feed, already
          built for real back in topic 20.
        </>
      ),
      duration: 4.8,
      fig: 'named, not rebuilt here: low-shuffle merge, inside a real engine. change data feed, already real.',
      takeaway: "MERGE's physical cost and its CDC output are two different concerns Delta pulls apart.",
      Visual: S.RevealNamedNotBuilt,
    },
    {
      title: 'Recap',
      body: (
        <>
          MERGE finds touched files, then rewrites them whole or just the parts that changed. A
          conflict with a concurrent compaction is detected and retried, not silently lost. Row
          Tracking keeps a row's identity stable even when its physical location isn't.
        </>
      ),
      duration: 4.8,
      fig: "everything so far is the protocol as it stands today -- next: the release that ships it.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
