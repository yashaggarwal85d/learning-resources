import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// PyO3 can hand Python the same real buffer it already has, and can
// explicitly step out of the interpreter's own way while real Rust
// work runs; a data-platform deployment built this way gets both for
// free, if the code asks for them.
const reel: Reel = {
  steps: [
    {
      title: "A real Python bytearray's own buffer is handed to a real Rust function through PyO3, which reads its real memory address. Does the address Rust sees match the address Python's own ctypes reports for the identical buffer?",
      body: (
        <>
          One real buffer, read from both sides.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, PyO3 copies the bytes in first' },
          { label: 'Yes, genuinely; the same real address on both sides', correct: true },
          { label: 'Only for buffers under a fixed size' },
        ],
        explain: (
          <>
            Yes. The real address genuinely matches.
          </>
        ),
      },
      Visual: S.ZeroCopyPredict,
    },
    {
      title: "Measured: the real address Rust reads from the bytearray's own buffer is identical to the real address Python's own ctypes reports for it; no copy was ever made",
      body: (
        <>
          The real, measured address on both sides.
        </>
      ),
      duration: 3.0,
      Visual: S.ZeroCopyReveal,
    },
    {
      title: 'A real Rust function holds the GIL for its entire run while it does real CPU-bound work. While it is running, how much progress does a separate, real Python thread make?',
      body: (
        <>
          Real work, the real GIL held throughout.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'As much as it would normally make' },
          { label: 'Genuinely very little; the GIL is never given up', correct: true },
          { label: 'Exactly double, since Rust is fast' },
        ],
        explain: (
          <>
            Very little. The GIL is never given up.
          </>
        ),
      },
      Visual: S.HeldGilPredict,
    },
    {
      title: "Measured: while the real GIL-holding call runs, a separate, real Python thread's own counter advances by only a small, real amount",
      body: (
        <>
          The real, measured progress while held.
        </>
      ),
      duration: 3.0,
      takeaway: 'Holding the GIL the whole time leaves almost no room for anything else to run.',
      Visual: S.HeldGilReveal,
    },
    {
      title: 'The identical real CPU-bound work now runs inside Python::detach, explicitly releasing the GIL for its own duration. Does the separate Python thread now make dramatically more progress in the same time?',
      body: (
        <>
          The identical work, the GIL released now.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No difference; the thread was never blocked' },
          { label: 'Yes, genuinely; dramatically more progress', correct: true },
          { label: 'Only if the thread also calls detach' },
        ],
        explain: (
          <>
            Yes. Dramatically more progress, for real.
          </>
        ),
      },
      Visual: S.ReleasedGilPredict,
    },
    {
      title: "Measured: the identical real Python thread's own counter advances by many times more in the same real duration once the call explicitly releases the GIL",
      body: (
        <>
          The real, measured progress while released.
        </>
      ),
      duration: 3.0,
      takeaway: 'Python::detach is the real, explicit act that actually lets other work run.',
      Visual: S.ReleasedGilReveal,
    },
    {
      title: "The PyO3 user guide states the GIL-release rule directly: Python::detach lets the interpreter do other work while the Rust work is ongoing. The PyByteArrayMethods documentation states the zero-copy rule directly too: as_bytes extracts a slice of the bytearray's own entire buffer. Does this topic's own two measured boundaries model exactly the two rules both sources describe?",
      body: (
        <>
          Both sources' own words on these rules.
        </>
      ),
      duration: 2.8,
      takeaway: 'A real extension hands over its own memory, and steps out of the way, only if the code asks.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: PyO3 gets both, if the code asks',
      body: (
        <>
          PyO3 can hand Python the same real buffer it already has, and can explicitly step out of the interpreter's own way while real Rust work runs; a data-platform deployment built this way gets both for free, if the code asks for them.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
