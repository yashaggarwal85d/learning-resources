import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// readahead() genuinely brings pages in before any read; DONTNEED genuinely evicts them
// once they're clean; O_DIRECT genuinely never lets them in at all — one page cache,
// pulled three different directions.
const reel: Reel = {
  steps: [
    {
      title: "A file's pages have genuinely been dropped from the page cache. Call the real readahead() syscall on it. Does that alone bring the pages back in, or does a read still have to happen first?",
      body: (
        <>
          A real readahead() call, against a file confirmed to have no resident pages.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Nothing changes until a real read happens' },
          { label: 'readahead() alone genuinely brings every page in', correct: true },
          { label: 'Only the first page comes in; the rest wait for a real read' },
        ],
        explain: (
          <>
            Every page comes in. readahead() genuinely populates the cache on its own.
          </>
        ),
      },
      Visual: S.ReadaheadPredict,
    },
    {
      title: 'Measured: before readahead, none of the pages were resident; immediately after it, every single one was, with no read() call in between',
      body: (
        <>
          A real residency check, before and after one real readahead() call.
        </>
      ),
      duration: 3.0,
      Visual: S.ReadaheadReveal,
    },
    {
      title: "Those same freshly-cached pages: call posix_fadvise with DONTNEED on them. Does that hint alone genuinely evict them, or is it merely advisory and ignored?",
      body: (
        <>
          A real posix_fadvise(DONTNEED) call, against a now fully resident file.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's only advisory — the kernel is free to ignore it" },
          { label: 'It genuinely evicts every one of those pages', correct: true },
          { label: 'It evicts pages only once memory pressure appears' },
        ],
        explain: (
          <>
            Every page is genuinely evicted. The hint, once called, has a real effect.
          </>
        ),
      },
      Visual: S.DontneedPredict,
    },
    {
      title: 'Measured: every one of those pages was resident right after readahead, and not one of them was resident right after the real DONTNEED call',
      body: (
        <>
          A real residency check, before and after one real DONTNEED call.
        </>
      ),
      duration: 3.0,
      takeaway: 'A hint documented as non-binding can still have a completely real, measured effect once called.',
      Visual: S.DontneedReveal,
    },
    {
      title: 'Read the same amount of data two real ways: once through a normal buffered read, once through O_DIRECT. Does the O_DIRECT read end up resident in the page cache too, or not?',
      body: (
        <>
          The same byte count, read via a normal read() and via O_DIRECT's pread().
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Both end up resident — direct I/O just skips the speed-up' },
          { label: 'Only the buffered read ends up resident', correct: true },
          { label: 'Neither ends up resident, since both are raw syscalls' },
        ],
        explain: (
          <>
            Only the buffered read. O_DIRECT's read never touches the cache at all.
          </>
        ),
      },
      Visual: S.BufferedDirectPredict,
    },
    {
      title: 'Measured: the buffered read left every single page resident in the cache, and the exact same read through O_DIRECT left none resident at all',
      body: (
        <>
          A real residency check, after a buffered read and after an O_DIRECT read.
        </>
      ),
      duration: 3.0,
      takeaway: "O_DIRECT isn't a faster buffered read — it's a read the page cache never sees happen.",
      Visual: S.BufferedDirectReveal,
    },
    {
      title: "If DONTNEED can't evict a file's pages right after it's written, what's actually stopping it?",
      body: (
        <>
          A real DONTNEED call, called immediately after a real write to the same file.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "The kernel simply hasn't scheduled the eviction yet" },
          { label: 'The pages are still dirty, and DONTNEED only discards clean ones', correct: true },
          { label: 'DONTNEED never works on a file opened for writing' },
        ],
        explain: (
          <>
            Still dirty. DONTNEED only ever discards pages that are already clean.
          </>
        ),
      },
      Visual: S.DirtyPredict,
    },
    {
      title: 'The man page is explicit: any unwritten, dirty page will not be freed by DONTNEED at all — fsync or fdatasync has to write it back first, or the hint has nothing clean to discard',
      body: (
        <>
          The man page's own documented caveat about dirty pages, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DirtyReveal,
    },
    {
      title: 'Readahead, DONTNEED, and O_DIRECT are the same page cache, pulled three different directions: bring pages in early, push them back out on request, or never let them in to begin with',
      body: (
        <>
          Readahead's pull. DONTNEED's push. O_DIRECT's refusal. One shared cache.
        </>
      ),
      duration: 2.8,
      takeaway: 'The page cache has exactly one knob, pulled three ways: whether a page is in it.',
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: a real pull, a real push, and a real refusal, all against the same cache',
      body: (
        <>
          A real readahead() call genuinely brings a dropped file's pages back into the cache before any read happens. A real DONTNEED call genuinely evicts them again once they're clean. And O_DIRECT genuinely bypasses the cache on every read, never populating it at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
