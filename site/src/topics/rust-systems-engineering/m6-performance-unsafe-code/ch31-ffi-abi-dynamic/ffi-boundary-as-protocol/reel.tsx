import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Matching a C struct's own layout is necessary, but a real FFI
// boundary is a protocol: who frees a handle, where a failure's real
// answer is written, and what a panic crossing the line must do.
const reel: Reel = {
  steps: [
    {
      title: 'A real buffer handle crosses the boundary through an allocate and a free function. After a handle is correctly freed once, what happens when the identical handle is freed a second time?',
      body: (
        <>
          One real handle, freed, then freed again.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It frees successfully again, silently' },
          { label: 'The free is genuinely rejected; the handle is no longer live', correct: true },
          { label: 'The program crashes immediately' },
        ],
        explain: (
          <>
            Rejected. The handle is no longer live.
          </>
        ),
      },
      Visual: S.OwnershipPredict,
    },
    {
      title: "Measured: every correct allocate/free pair is accepted exactly once, a second free on the same handle is genuinely rejected rather than performed, and no handle is ever left outstanding afterward",
      body: (
        <>
          The real, measured allocate/free protocol.
        </>
      ),
      duration: 3.0,
      Visual: S.OwnershipReveal,
    },
    {
      title: "A real status-code function writes its result through an out pointer, since there is no Result on the wire. When the real call fails, what happens to the out pointer?",
      body: (
        <>
          A real failure, and its out pointer.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It is set to zero' },
          { label: 'It is left genuinely untouched', correct: true },
          { label: 'It is set to the error code itself' },
        ],
        explain: (
          <>
            Untouched. Only the status code reports it.
          </>
        ),
      },
      Visual: S.ErrorCodePredict,
    },
    {
      title: "Measured: a genuine success writes the real value through the out pointer and returns the OK status; a genuine failure returns its own status code and leaves the out pointer genuinely untouched",
      body: (
        <>
          The real, measured success and failure calls.
        </>
      ),
      duration: 3.0,
      takeaway: 'A status code is only half the error protocol; where the real answer is written matters just as much.',
      Visual: S.ErrorCodeReveal,
    },
    {
      title: 'A real function declared extern "C-unwind" panics when told to. When a real caller catches that panic, does the caller genuinely keep running afterward?',
      body: (
        <>
          A real panic, crossing a real boundary.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the whole process has already aborted' },
          { label: 'Yes, genuinely; "C-unwind" defines exactly this crossing', correct: true },
          { label: 'Only if the panic message is empty' },
        ],
        explain: (
          <>
            Yes. The caller genuinely keeps running.
          </>
        ),
      },
      Visual: S.UnwindPredict,
    },
    {
      title: `Measured: the real panic crossing the "C-unwind" boundary is genuinely caught, and the caller genuinely keeps running afterward, exactly as the ABI's own unwind contract defines`,
      body: (
        <>
          The real, measured catch and recovery.
        </>
      ),
      duration: 3.0,
      takeaway: '"C-unwind" is not a suggestion; it is the one calling convention that genuinely defines what crossing with an unwind means.',
      Visual: S.UnwindReveal,
    },
    {
      title: "The Rustonomicon states the ownership and unwinding rules directly: a foreign library handing off ownership of a resource requires Rust's own destructors to guarantee its release, and a boundary expecting a panic to cross it must use the appropriate unwind ABI string. The Rust Reference's own definition of a calling convention names who is responsible for cleaning up the stack as part of that same protocol. Does this topic's own three measured boundaries model exactly the protocol both sources describe?",
      body: (
        <>
          Both sources' own words on this protocol.
        </>
      ),
      duration: 2.8,
      takeaway: "A calling convention's string names only the visible fraction of a protocol both sides keep by hand.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: the boundary is a protocol, not just layout',
      body: (
        <>
          Matching a C struct's own layout is necessary, but a real FFI boundary is a protocol: who frees a handle, where a failure's real answer is written, and what a panic crossing the line must do.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
