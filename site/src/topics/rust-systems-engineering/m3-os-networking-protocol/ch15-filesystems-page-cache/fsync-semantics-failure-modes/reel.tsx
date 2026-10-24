import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// sync_all and sync_data genuinely make different syscalls; a file's fsync and its
// directory's fsync are genuinely two separate calls; and a failed fsync's own retry
// can succeed without having written anything at all.
const reel: Reel = {
  steps: [
    {
      title: 'Call File::sync_all() on a file, and separately call File::sync_data() on another. Do they genuinely make the same real syscall underneath, or two different ones?',
      body: (
        <>
          Both real calls, each traced to see which real syscall it actually makes.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The same syscall either way — sync_data is just a nicer name' },
          { label: 'Two genuinely different real syscalls', correct: true },
          { label: 'It depends on the filesystem, not the call itself' },
        ],
        explain: (
          <>
            Two different syscalls. sync_data genuinely isn't just sync_all renamed.
          </>
        ),
      },
      Visual: S.SyncCallPredict,
    },
    {
      title: "Measured: sync_all() made a real fsync() syscall, and sync_data() made a real, genuinely different fdatasync() syscall — confirmed directly by strace, not by the docs alone",
      body: (
        <>
          A real, traced syscall for each real call, side by side.
        </>
      ),
      duration: 3.0,
      Visual: S.SyncCallReveal,
    },
    {
      title: "fsync a file's own fd, then separately fsync its parent directory's fd. Does the file's own fsync already cover the directory, or are these genuinely two separate operations?",
      body: (
        <>
          Both real fsync calls, on two genuinely different file descriptors.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "The file's own fsync already covers its directory entry" },
          { label: "They're genuinely two separate real syscalls, on two different fds", correct: true },
          { label: 'Only needed if the file was newly created, never for an existing one' },
        ],
        explain: (
          <>
            Two separate syscalls. The file's own fsync says nothing about its directory.
          </>
        ),
      },
      Visual: S.DirSyncPredict,
    },
    {
      title: 'Measured: the file’s fsync and the directory’s fsync were two real, separate syscalls, on two genuinely different file descriptors',
      body: (
        <>
          Two real, traced fsync calls, on two genuinely different handles.
        </>
      ),
      duration: 3.0,
      takeaway: "A file's own fsync says nothing about its directory entry — that's a second, separate call.",
      Visual: S.DirSyncReveal,
    },
    {
      title: 'Replace a file’s content two hundred real times using write-temp, fsync, rename, fsync-the-directory, while a separate thread reads that same file as fast as it can. Does that reader ever catch a half-written file?',
      body: (
        <>
          A real atomic-replace loop, racing a real concurrent reader thread.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, occasionally, since rename takes real time' },
          { label: 'No — it only ever sees the old content or the new content, never a mix', correct: true },
          { label: 'Only if the new content is much larger than the old' },
        ],
        explain: (
          <>
            Never a mix. The whole sequence, not just rename, is what makes it atomic.
          </>
        ),
      },
      Visual: S.AtomicReplacePredict,
    },
    {
      title: 'Measured: across many tens of thousands of real concurrent reads during two hundred real replacements, the reader never once observed a length that wasn’t the old file’s or the new file’s',
      body: (
        <>
          A real count of reads, and a real count of partial reads: zero.
        </>
      ),
      duration: 3.0,
      takeaway: "Write-temp, fsync, rename, fsync-the-directory: that whole sequence makes a replace atomic.",
      Visual: S.AtomicReplaceReveal,
    },
    {
      title: 'PostgreSQL retried a failed fsync, exactly as its own code had done for twenty years. What actually went wrong?',
      body: (
        <>
          The real incident the paper's own account traces through, step by step.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'The retry eventually succeeded in writing the missing data' },
          { label: 'The retry succeeded without writing anything, since the dirty page was already marked clean', correct: true },
          { label: 'The retry corrupted a different, unrelated page' },
        ],
        explain: (
          <>
            Nothing written. The dirty page was already marked clean by the first failure.
          </>
        ),
      },
      Visual: S.RetryPredict,
    },
    {
      title: 'The paper’s own finding is specific: on the file systems it tested, a failed fsync marks the dirty page clean regardless, so a second fsync call finds nothing left to write, succeeds immediately, and PostgreSQL mistook that success for a completed write',
      body: (
        <>
          The paper's own account of the 2018 incident, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.RetryReveal,
    },
    {
      title: 'sync_all vs sync_data, a file’s fsync vs its directory’s, and a failed fsync’s retry are all the same question: what, exactly, did that one call actually promise you',
      body: (
        <>
          Two calls. Two handles. One retry. The same question, asked three times.
        </>
      ),
      duration: 2.8,
      takeaway: "Every one of fsync's surprises comes from the same gap: what a call promises, and what it covers.",
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: two real calls, one real sequence, and one real lie, all finally named',
      body: (
        <>
          sync_all and sync_data genuinely make two different real syscalls. A file's fsync and its directory's fsync are genuinely two separate calls the atomic-replace pattern needs both of. And a failed fsync's own retry can succeed without having written anything at all, which is why the fix is to crash and recover from a WAL, never to simply retry.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
