import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Not reading a real connection genuinely closes its own receive window and blocks
// the remote sender; a real bounded output buffer enforces its cap by genuinely
// rejecting the next push once full; a real per-connection timeout genuinely fires
// against a peer that may never send anything. Backpressure is a choice, not an accident.
const reel: Reel = {
  steps: [
    {
      title: 'A real server accepts a connection, then deliberately never reads from it again. Keep writing from the other side. Does the writer eventually notice, or does it just keep succeeding forever?',
      body: (
        <>
          A real client writing in a loop, against a server that never reads.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It keeps succeeding forever, since TCP buffers everything' },
          { label: "It eventually blocks, once the kernel's own receive window closes", correct: true },
          { label: 'The connection is silently reset after a few seconds' },
        ],
        explain: (
          <>
            It blocks. The kernel's own window has a real, finite size.
          </>
        ),
      },
      Visual: S.WindowPredict,
    },
    {
      title: 'Measured: the client wrote several megabytes successfully, then a real write() call genuinely blocked, once the real receive window had filled and closed',
      body: (
        <>
          A real, measured write that eventually, genuinely blocked.
        </>
      ),
      duration: 3.0,
      Visual: S.WindowReveal,
    },
    {
      title: 'Build a real per-connection output buffer with an explicit cap of sixteen messages. Fill it to exactly the cap, then push one more. What happens to that extra message?',
      body: (
        <>
          A real bounded buffer, filled and then overfilled by exactly one.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's queued anyway, since the cap is really just a soft hint" },
          { label: "It's genuinely rejected; the queue's length never grows past the cap", correct: true },
          { label: 'The oldest message is silently dropped to make room' },
        ],
        explain: (
          <>
            Rejected outright. A real cap doesn't bend to fit one more.
          </>
        ),
      },
      Visual: S.BufferPredict,
    },
    {
      title: 'Measured: the buffer filled to exactly its cap, and the very next push was genuinely rejected, its length never growing past the cap',
      body: (
        <>
          A real, measured accept-and-reject count, not an assumption.
        </>
      ),
      duration: 3.0,
      takeaway: 'A bounded buffer that is actually bounded rejects the next push outright.',
      Visual: S.BufferReveal,
    },
    {
      title: 'A real client connects, then deliberately sends nothing at all, a stalled, slow-loris-style peer. The server sets a real read timeout. Does it wait forever, or does the timeout genuinely fire?',
      body: (
        <>
          A real stalled connection, against a real configured read timeout.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It waits forever, since no error ever arrives on a connection that is just slow' },
          { label: 'The timeout genuinely fires, closing the connection on schedule', correct: true },
          { label: 'The timeout only fires on partial, malformed data' },
        ],
        explain: (
          <>
            It fires on schedule. Waiting on good faith was never the real policy.
          </>
        ),
      },
      Visual: S.TimeoutPredict,
    },
    {
      title: 'Measured: the real read timeout fired right on schedule, closing the connection to a peer that had sent nothing at all',
      body: (
        <>
          A real, measured timeout, firing exactly where it was configured to.
        </>
      ),
      duration: 3.0,
      takeaway: 'A connection that might never send anything needs its own real timeout.',
      Visual: S.TimeoutReveal,
    },
    {
      title: "The TCP standard's own documentation makes a specific claim about how long an implementation may keep its own receive window closed. What does it actually say?",
      body: (
        <>
          The standard's own text on zero-window probing.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'At most a few seconds, before the kernel forces it back open' },
          { label: 'Indefinitely, as long as it keeps answering the real probes', correct: true },
          { label: 'Only until the application process itself exits' },
        ],
        explain: (
          <>
            Indefinitely. The standard itself sanctions waiting as long as it takes.
          </>
        ),
      },
      Visual: S.RfcPredict,
    },
    {
      title: "The standard's own words: a TCP implementation may keep its offered receive window closed indefinitely, as long as it keeps answering the sender's own probes, not reading is a real, sanctioned way to say not yet",
      body: (
        <>
          The TCP standard's own quote, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.RfcReveal,
    },
    {
      title: 'Stop reading to say not yet, cap the buffer to say no more than this, and time out to say not forever: that is backpressure as an explicit connection state machine, not something that just happens on its own',
      body: (
        <>
          The three measured behaviors, shown together as one shared idea.
        </>
      ),
      duration: 2.8,
      takeaway: 'Backpressure is a choice a connection makes on purpose, never an accident of a buffer.',
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: a connection that chooses to pause, bound, or stop, on purpose',
      body: (
        <>
          Not reading a real connection genuinely closes its own receive window and blocks the remote sender, exactly as the TCP standard says an implementation is allowed to do indefinitely. A real bounded output buffer enforces its cap by genuinely rejecting the next push once full, and a real per-connection timeout genuinely fires against a peer that may never send anything at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
