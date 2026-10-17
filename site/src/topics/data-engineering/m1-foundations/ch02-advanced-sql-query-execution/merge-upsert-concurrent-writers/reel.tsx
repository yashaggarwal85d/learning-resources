import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Writing when you do not know whether the row exists. Running example: a staging table of 5 stock changes merged into
// a wines table: 2 new names, 2 existing names that change, 1 that drops to zero and is deleted. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Insert it, or update it, or delete it',
      body: (
        <>
          A load arrives and for each row you do not know whether the target already has it. New names must be inserted, existing ones updated, and
          some removed. Doing that row by row in application code is slow and racy; SQL has two statements for it.
        </>
      ),
      duration: 3.4,
      Visual: S.Problem,
    },
    {
      title: 'MERGE: one join, several actions',
      body: (
        <>
          <code>MERGE</code> joins source to target, classifies each source row as matched or not, and runs the first <code>WHEN</code> clause that
          fits. Of <b>5</b> staged rows: <b>2</b> are inserted, <b>2</b> updated and <b>1</b> deleted, in one statement.
        </>
      ),
      duration: 4.8,
      Visual: S.MergeActions,
    },
    {
      title: 'At most one source row per target row',
      body: (
        <>
          If two source rows join to the same target row, only one may change it; the second attempt raises an error, a cardinality violation for an
          update or delete and a uniqueness violation for an insert. It is loud on purpose.
        </>
      ),
      duration: 3.8,
      Visual: S.Duplicates,
    },
    {
      title: 'Predict: two source rows, one target row',
      body: (
        <>
          The staging table holds two rows for the same existing wine, and both would update it. What does <code>MERGE</code> do?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Applies both, in order' },
          { label: 'Applies the last one silently' },
          { label: 'Raises an error', correct: true },
          { label: 'Skips the wine' },
        ],
        explain: (
          <>
            An error. The standard requires it: quietly applying one of two conflicting changes would be silent data loss, so the second attempt to
            change the same target row fails.
          </>
        ),
      },
      Visual: S.DuplicatePredict,
    },
    {
      title: 'ON CONFLICT is one atomic step',
      body: (
        <>
          <code>INSERT … ON CONFLICT DO UPDATE</code> guarantees one of two outcomes, an insert or an update, even under heavy concurrency. The index
          itself decides: try to insert, and if the key is taken, turn into an update, atomically.
        </>
      ),
      duration: 4,
      Visual: S.Atomic,
    },
    {
      title: 'MERGE decides from a snapshot',
      body: (
        <>
          <code>MERGE</code> reads its join first, decides &ldquo;not matched&rdquo;, and only then inserts. If another session commits the same key in the
          gap between the read and the insert, the insert hits the unique index like any other and fails.
        </>
      ),
      duration: 4.6,
      Visual: S.Gap,
    },
    {
      title: 'Predict: the other session wins the gap',
      body: (
        <>
          Session A&rsquo;s <code>MERGE</code> has decided to insert a new key. Session B inserts the same key and commits first. What happens to A?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'MERGE switches to the update branch' },
          { label: 'A uniqueness violation is raised', correct: true },
          { label: 'Both rows are stored' },
          { label: 'B is rolled back' },
        ],
        explain: (
          <>
            A fails with a uniqueness violation. <code>MERGE</code> does not restart its matching to re-route to the update; only{' '}
            <code>ON CONFLICT</code> does that. Code that merges concurrently must be ready to retry.
          </>
        ),
      },
      Visual: S.GapPredict,
    },
    {
      title: 'Which one to use',
      body: (
        <>
          For a plain &ldquo;insert, or update if present&rdquo; use <code>ON CONFLICT</code>, race-free by construction. Use <code>MERGE</code> when the
          logic is richer: several branches, a <code>DELETE</code>, or a second source, accepting the retry.
        </>
      ),
      duration: 3.8,
      Visual: S.Choose,
    },
    {
      title: 'RETURNING says what happened',
      body: (
        <>
          <code>MERGE</code> can return a row per change. PostgreSQL <b>17</b> added <code>merge_action()</code>, which names the insert, update or
          delete; PostgreSQL <b>18</b> added <code>old</code> and <code>new</code> values, so before and after sit side by side.
        </>
      ),
      duration: 4,
      Visual: S.Returning,
    },
    {
      title: 'On a lakehouse, MERGE rewrites files',
      body: (
        <>
          A table of Parquet files has no in-place row update. A <code>MERGE INTO</code> must rewrite every file that holds a touched row, and an
          unconditional &ldquo;delete the rest&rdquo; branch can force the whole table to be rewritten.
        </>
      ),
      duration: 4,
      Visual: S.FileRewrite,
    },
    {
      title: 'Back to the load',
      body: (
        <>
          Make sure each target key appears once in the source. Use <code>ON CONFLICT</code> for the plain upsert, <code>MERGE</code> for richer logic
          with a retry, and write lakehouse merges to touch as few files as possible.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which statement guarantees an insert-or-update outcome under concurrency?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'MERGE' }, { label: 'INSERT … ON CONFLICT DO UPDATE', correct: true }, { label: 'Neither' }],
        explain: <>ON CONFLICT. It is atomic at the index; MERGE decides from a snapshot and can race.</>,
      },
      Visual: S.ProveAtomic,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Which PostgreSQL release added merge_action() to MERGE ... RETURNING?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '15' }, { label: '17', correct: true }, { label: '18' }],
        explain: <>PostgreSQL 17. Version 18 added old and new values.</>,
      },
      Visual: S.ProveRelease,
    },
  ],
};

export default reel;
