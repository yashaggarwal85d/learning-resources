import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session (examples.py):
// writing the same 1,000,000-row DataFrame (4-valued partition column) at 2, 4, 8 tasks with
// AQE off produces exactly 8, 16, 32 files — tasks times partitions touched, every time. The
// same 2-task write with maxRecordsPerFile=50000 set produces 24 files instead of 8, every file
// at or under the cap. A 32-task write produces 128 files whether or not a plain REBALANCE hint
// is present when AQE is off (the hint is silently ignored); with AQE and coalescePartitions on,
// the same REBALANCE hint cuts the write to 16 files, and REBALANCE(k) (by the partition column
// itself) cuts it to exactly 4 — one file per partition value.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The same data, written to the same path, partitioned by the same column. Nothing
          changes except how many tasks did the writing. How many files land on disk?
        </>
      ),
      duration: 4.5,
      fig: 'same write, same partition column — only the task count changes. How many files?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline, tasks times partitions',
      body: (
        <>
          Measured at 2, 4, and 8 tasks: 8, 16, and 32 files. The rule holds exactly — file count
          is tasks multiplied by the number of distinct partition values each task touches.
        </>
      ),
      duration: 4.8,
      fig: '2, 4, 8 tasks produce 8, 16, 32 files: tasks times partitions touched.',
      Visual: S.RevealBaseline,
    },
    {
      title: "Predict: can a per-file cap fix it without touching task count?",
      body: (
        <>
          Suppose the problem is files that are too big, not too many. Is there a setting that
          caps an individual file's size directly, leaving the number of tasks untouched?
        </>
      ),
      duration: 2.8,
      fig: 'cap a file\'s own size, without changing task count. Possible?',
      predict: {
        options: [
          { label: 'No — the only lever Spark has for file size runs through task count' },
          { label: 'Yes — a write option caps rows per file independent of tasks', correct: true },
        ],
        explain: (
          <>
            maxRecordsPerFile works entirely inside a single task's own output, splitting it
            once that task has already decided what to write — nothing about parallelism moves.
          </>
        ),
      },
      Visual: S.PredictMaxRecords,
    },
    {
      title: 'Reveal: maxRecordsPerFile caps rows per file',
      body: (
        <>
          Measured: the same 2-task write now produces 24 files instead of 8, and every file,
          read back directly, holds at or under the cap — never more.
        </>
      ),
      duration: 4.8,
      fig: '2 tasks, capped: 24 files instead of 8, every file at or under the cap.',
      Visual: S.RevealMaxRecordsWorks,
    },
    {
      title: "Elaborate: the cap doesn't touch task count at all",
      body: (
        <>
          The job still ran with exactly 2 tasks. The cap only decides, after a task already has
          its own rows to write, how many pieces to split them into on the way to disk.
        </>
      ),
      duration: 4.8,
      fig: 'task count unchanged — the split happens entirely inside one task\'s own output.',
      takeaway: "maxRecordsPerFile splits a task's own output after the fact; it never changes how many tasks ran.",
      Visual: S.ElaborateMaxRecordsMechanism,
    },
    {
      title: 'Predict: does REBALANCE alone, without AQE, change anything?',
      body: (
        <>
          Now the opposite problem: too many small files from a 32-task write. Can the
          REBALANCE hint collapse that file count on its own, with AQE left off?
        </>
      ),
      duration: 2.8,
      fig: 'REBALANCE hint, AQE off. Does the file count drop?',
      predict: {
        options: [
          { label: "No — the hint's own effect requires AQE to be enabled at all", correct: true },
          { label: 'Yes — the hint rewrites the write plan regardless of AQE' },
        ],
        explain: (
          <>
            REBALANCE only makes sense as a decision AQE's own runtime coalescing can carry
            out. Without AQE there is no mechanism left to act on the hint.
          </>
        ),
      },
      Visual: S.PredictRebalanceNoAqe,
    },
    {
      title: 'Reveal: REBALANCE is a no-op without AQE',
      body: (
        <>
          Measured: 128 files either way. The hint is present in one run and absent in the
          other, and the file count doesn't move at all.
        </>
      ),
      duration: 4.8,
      fig: '32 tasks, AQE off: 128 files whether or not the hint is there.',
      Visual: S.RevealRebalanceNoop,
    },
    {
      title: 'Elaborate: with AQE, REBALANCE coalesces, REBALANCE(col) aligns to partitions',
      body: (
        <>
          Turn AQE on, and the same hint coalesces the shuffle down to 16 files before the write
          even starts. Name the partition column in the hint, and it lands on exactly one file
          per partition value.
        </>
      ),
      duration: 5,
      fig: 'AQE on: REBALANCE cuts to 16 files; REBALANCE(k) cuts to 4 — one per partition.',
      takeaway: 'REBALANCE only acts through AQE: plain, it coalesces the shuffle; naming the partition column aligns the output to it.',
      Visual: S.ElaborateRebalanceWithAqe,
    },
    {
      title: 'Reveal: three file counts from the same write, side by side',
      body: (
        <>
          Measured together: 128 files with no hint, 16 with REBALANCE, 4 with REBALANCE naming
          the partition column — the same data, the same job, three different outcomes.
        </>
      ),
      duration: 5,
      fig: 'same write: 128, then 16, then 4 files — nothing but a hint and AQE changed.',
      Visual: S.RevealSideBySide,
    },
    {
      title: 'Recap',
      body: (
        <>
          File count obeys a rule — tasks times partitions touched — and two separate levers
          break it on purpose: a per-file cap that never touches task count, and a per-job hint
          that only works once AQE is there to carry it out.
        </>
      ),
      duration: 5,
      fig: 'one rule, two levers: a per-file cap, and a per-job hint that needs AQE.',
      takeaway: 'File count is tasks times partitions touched by default; maxRecordsPerFile and REBALANCE under AQE override it on purpose.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
