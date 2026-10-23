import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Mapping a file genuinely holds the same bytes twice once an application keeps its own
// cache; direct I/O removes that only by making alignment the caller's own responsibility;
// and the paper's own four failure classes are why most DBMSs own their buffer pool instead.
const reel: Reel = {
  steps: [
    {
      title: 'Memory-map a file, and also keep a separate, hand-built cache of the same bytes in your own code. Does the mapped data end up resident in memory once, or twice?',
      body: (
        <>
          A real Mmap::map(), next to a real fs::read() into an application-level cache.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Once — the kernel merges them' },
          { label: 'Twice — both are resident at the same time', correct: true },
          { label: 'It depends on how large the file is' },
        ],
        explain: (
          <>
            Twice. The page cache and the application's own cache know nothing of each other.
          </>
        ),
      },
      Visual: S.DoubleCachePredict,
    },
    {
      title: "Measured: the mapped file's pages stayed resident in the kernel's own page cache, and reading the exact same file again into a separate application cache grew the process's resident memory by roughly another full copy",
      body: (
        <>
          A real mapping's own residency, and a second, independent copy read in.
        </>
      ),
      duration: 3.0,
      Visual: S.DoubleCacheReveal,
    },
    {
      title: "Open the same file with O_DIRECT and read it into a buffer that isn't aligned to a block boundary. Does the read quietly degrade, silently succeed, or fail outright?",
      body: (
        <>
          A real pread() against an O_DIRECT fd, with a deliberately misaligned buffer.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It quietly degrades in performance but still works' },
          { label: 'It fails outright with a specific, clear error', correct: true },
          { label: 'It silently rounds the buffer up for you' },
        ],
        explain: (
          <>
            It fails outright, with EINVAL. The kernel never silently fixes a misaligned buffer.
          </>
        ),
      },
      Visual: S.AlignPredict,
    },
    {
      title: 'Measured: the misaligned read failed outright with the kernel’s own EINVAL, and the exact same read with a properly aligned buffer succeeded cleanly',
      body: (
        <>
          One real failed read, one real succeeding read, against the same open file.
        </>
      ),
      duration: 3.0,
      takeaway: "Direct I/O removes the double copy only by making every buffer's alignment the caller's own strict job.",
      Visual: S.AlignReveal,
    },
    {
      title: "If a mapped page's real read genuinely fails — a bad sector, a disk gone missing — does the program get a normal, recoverable error back?",
      body: (
        <>
          What a real I/O failure underneath a mapped page actually surfaces as.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — the same Result a normal read would give' },
          { label: 'No — it can raise SIGBUS and terminate the process outright', correct: true },
          { label: 'The kernel silently retries until it succeeds' },
        ],
        explain: (
          <>
            SIGBUS, not a Result. A page fault has no normal error channel to return through.
          </>
        ),
      },
      Visual: S.SigbusPredict,
    },
    {
      title: "The paper's own argument is specific: a dirty mapped page can be written back at a moment the database never chose, a page fault can stall with no promised end, a real I/O error surfaces as a process-killing SIGBUS instead of a Result, and unmapping has to interrupt every other thread's TLB just to unmap one region",
      body: (
        <>
          The four failure classes, quoted directly from the paper's own argument.
        </>
      ),
      duration: 3.0,
      takeaway: "Mapping a file trades an explicit Result for four real failure modes most systems can't actually afford.",
      Visual: S.FourFailuresReveal,
    },
    {
      title: 'Given all four of those costs, is there ever a real system where mapping a file directly is still the right call?',
      body: (
        <>
          LMDB's own design, measured against the paper's own stated conditions.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'No, never in a serious system' },
          { label: 'Only for tiny configuration files' },
          { label: 'Yes — a read-mostly workload with no bounded-latency requirement', correct: true },
        ],
        explain: (
          <>
            Read-mostly, with no bounded-latency need. That is exactly LMDB's own case.
          </>
        ),
      },
      Visual: S.ExceptionPredict,
    },
    {
      title: "The paper's own recommendation is exactly that narrow: mapping remains the right call when the working set fits in memory and the workload is read-only — precisely the case LMDB's own design is built around",
      body: (
        <>
          The paper's own closing recommendation, quoted directly, next to LMDB's design.
        </>
      ),
      duration: 2.8,
      Visual: S.ExceptionReveal,
    },
    {
      title: "Double caching, direct I/O's alignment cost, and the paper's own four failure classes are all the same question asked three ways: who decides when a page moves, and does the caller find out if it goes wrong",
      body: (
        <>
          Double caching. Alignment's strict cost. Four named failure classes. One question.
        </>
      ),
      duration: 2.8,
      takeaway: "An owned buffer pool exists because most systems need an explicit answer mmap leaves to the kernel.",
      Visual: S.LessonReveal,
    },
    {
      title: "Recap: a real double cache, a real alignment gate, and a real exception finally named",
      body: (
        <>
          Mapping a file genuinely holds the same bytes twice once an application keeps its own cache. Direct I/O genuinely removes that only by making alignment the caller's strict job. And the paper's own four failure classes are why most DBMSs own their buffer pool instead — except the narrow, read-mostly case LMDB is built around.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
