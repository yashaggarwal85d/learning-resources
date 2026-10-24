import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A file descriptor is a handle, not the resource itself — which is exactly why
// duplicating it, closing it, and leaking it across exec are each their own,
// genuinely separate, measured event.
const reel: Reel = {
  steps: [
    {
      title: 'Duplicate a file descriptor with a real dup() call, then read from the original and then the duplicate. Does the duplicate start reading from the beginning of the file, or from wherever the original left off?',
      body: (
        <>
          A real dup() call, then a read from each fd in turn.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It starts over, from the beginning' },
          { label: 'It continues from exactly where the original stopped', correct: true },
          { label: 'It depends on which one is read first' },
        ],
        explain: (
          <>
            It continues. Both fds point at the same open file description, and the same offset.
          </>
        ),
      },
      Visual: S.DupPredict,
    },
    {
      title: "Measured: the original fd read the first half of the file, and the duplicated fd read exactly the second half — continuing from the shared offset, not restarting",
      body: (
        <>
          Ten bytes, split exactly in half, across two different fd numbers.
        </>
      ),
      duration: 3.0,
      Visual: S.DupReveal,
    },
    {
      title: 'An OwnedFd is dropped. A moment later, something tries a raw syscall on that exact file descriptor number. What happens?',
      body: (
        <>
          drop(owned), then a raw fcntl on that same fd number.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It still works, the number is just a number" },
          { label: 'It fails outright — the fd is genuinely gone', correct: true },
          { label: 'It works only if nothing else opened a new fd in between' },
        ],
        explain: (
          <>
            It fails outright. OwnedFd's whole purpose is closing the real resource on drop.
          </>
        ),
      },
      Visual: S.OwnedPredict,
    },
    {
      title: "Measured: after the OwnedFd was dropped, a raw syscall on its fd failed outright with EBADF — while a BorrowedFd taken from a completely different, still-owned file stayed valid the whole time",
      body: (
        <>
          One fd genuinely closed; a separate, still-owned one left completely untouched.
        </>
      ),
      duration: 3.0,
      takeaway: "An OwnedFd's Drop genuinely closes its file descriptor — a raw syscall on that number afterward fails outright.",
      Visual: S.OwnedReveal,
    },
    {
      title: 'Open the same file twice: once the normal way, once with its close-on-exec flag explicitly cleared. Fork and exec a real child process. Which file descriptor is still open inside it?',
      body: (
        <>
          A real fork and exec, then a check of exactly which fd survived.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Both are still open in the child' },
          { label: 'Neither is' },
          { label: 'Only the one with close-on-exec explicitly cleared', correct: true },
        ],
        explain: (
          <>
            Only the cleared one. The normal fd was never going to survive exec in the first place.
          </>
        ),
      },
      Visual: S.CloexecPredict,
    },
    {
      title: "Measured: the normally-opened file descriptor, protected by O_CLOEXEC, never appeared inside the real forked and exec'd child — the one with that flag explicitly cleared leaked straight into it",
      body: (
        <>
          A real child process, inspected directly for exactly which fd it inherited.
        </>
      ),
      duration: 3.0,
      takeaway: 'std opens a file descriptor with O_CLOEXEC by default, which genuinely stops it leaking into a forked child.',
      Visual: S.CloexecReveal,
    },
    {
      title: 'So why does any of this matter for a real, long-running service?',
      body: (
        <>
          The real ceiling every one of these open descriptors counts against.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'A service can open as many file descriptors as it wants, forever' },
          { label: 'A real kernel limit genuinely caps how many it may hold open at once', correct: true },
          { label: 'Only network sockets count toward any limit' },
        ],
        explain: (
          <>
            A real limit. Every fd — duplicated, leaked, or not — counts against the same ceiling.
          </>
        ),
      },
      Visual: S.LimitPredict,
    },
    {
      title: 'RLIMIT_NOFILE is a real, enforced ceiling — one greater than the highest file descriptor number a process may ever have open at once',
      body: (
        <>
          The kernel's own definition of exactly where that ceiling sits.
        </>
      ),
      duration: 2.8,
      Visual: S.LimitReveal,
    },
    {
      title: 'Every one of these mechanisms exists because an fd is a handle into a kernel-side resource, not the resource itself — and a handle can be duplicated, closed, or leaked independently of what it points to',
      body: (
        <>
          Shared offset. Closes on drop. Leaks without O_CLOEXEC. Three handle behaviors, one real resource.
        </>
      ),
      duration: 2.8,
      takeaway: 'A file descriptor is a handle, not the resource itself — closing or leaking it are separate, real events.',
      Visual: S.HandleReveal,
    },
    {
      title: 'Recap: a shared offset, a drop that really closes, and a leak that really does not happen by default',
      body: (
        <>
          A duplicated file descriptor genuinely shares its original's offset. An OwnedFd's drop genuinely closes the real resource, while a borrow never can. A normally-opened fd genuinely does not leak across exec, and a leaked one genuinely does.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
