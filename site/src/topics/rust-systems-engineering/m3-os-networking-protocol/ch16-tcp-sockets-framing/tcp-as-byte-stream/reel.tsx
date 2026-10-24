import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// TCP genuinely delivers an undifferentiated byte stream, not discrete messages;
// a real half-close leaves one direction open while closing the other; Nagle's own
// batching and SO_LINGER's own close-blocking are each a different, documented
// surprise about what a byte stream does not promise you.
const reel: Reel = {
  steps: [
    {
      title: 'Write one real 4 MiB payload to a real TCP connection in a single write_all() call. On the other end, read it back with a 64 KiB buffer. How many real read() calls does that actually take?',
      body: (
        <>
          One real write, traced by counting the real reads it takes to receive it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Exactly one, since TCP delivers whatever was sent as one unit' },
          { label: 'Many, since TCP delivers an undifferentiated stream, not messages', correct: true },
          { label: "It depends only on the network's own latency, not the buffer size" },
        ],
        explain: (
          <>
            Many. TCP has no idea your write was ever one unit in the first place.
          </>
        ),
      },
      Visual: S.PartialReadsPredict,
    },
    {
      title: 'Measured: writing 4 MiB in one real call took dozens of real read() calls to receive, through a 64 KiB read buffer, confirmed directly',
      body: (
        <>
          A real, traced count of the real read calls this one write actually took.
        </>
      ),
      duration: 3.0,
      Visual: S.PartialReadsReveal,
    },
    {
      title: "Write a message, then call the real shutdown(Write) half-close on just one side of a real connection. Does the other side's read() see an error, or something else, and can that side still reply?",
      body: (
        <>
          A real half-close, traced on both the reading and the still-writable side.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "The other side's read() returns an error" },
          { label: "The other side's read() sees EOF, and can still reply", correct: true },
          { label: 'The connection is fully closed in both directions immediately' },
        ],
        explain: (
          <>
            EOF, and still writable. A half-close only closes one direction.
          </>
        ),
      },
      Visual: S.HalfClosePredict,
    },
    {
      title: "Measured: the server's own read() genuinely saw EOF once the client half-closed, and the server could still write a real reply back, which the client genuinely received",
      body: (
        <>
          A real, traced sequence: EOF on one side, a real reply on the other.
        </>
      ),
      duration: 3.0,
      takeaway: 'Half-closing with shutdown(Write) leaves the other direction genuinely open.',
      Visual: S.HalfCloseReveal,
    },
    {
      title: "The TCP manual page's own documentation describes what TCP_NODELAY actually disables. What does it say happens to small writes when Nagle's algorithm is left on?",
      body: (
        <>
          The documentation's own description of what Nagle actually does to writes.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Small writes are sent immediately regardless' },
          { label: "Small writes are buffered until there's enough to send", correct: true },
          { label: 'Small writes are silently dropped if too small' },
        ],
        explain: (
          <>
            Buffered. Nagle waits rather than flood the network with tiny packets.
          </>
        ),
      },
      Visual: S.NaglePredict,
    },
    {
      title: "The documentation's own words: with Nagle left on, data is buffered until there's a sufficient amount to send out, specifically to avoid the frequent sending of small packets, and TCP_NODELAY turns that batching off",
      body: (
        <>
          The TCP manual page's own quote on Nagle and TCP_NODELAY, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.NagleReveal,
    },
    {
      title: "The socket manual page's own documentation describes what SO_LINGER actually changes. Does enabling it make close() behave the same, just with a timer attached, or something genuinely different?",
      body: (
        <>
          The documentation's own description of SO_LINGER's effect on close().
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The same either way, just with a timer running in the background' },
          { label: 'Genuinely different: close() itself blocks until sent or timed out', correct: true },
          { label: 'SO_LINGER only affects accept(), never close()' },
        ],
        explain: (
          <>
            Genuinely different. close() itself blocks, which it otherwise never does.
          </>
        ),
      },
      Visual: S.LingerPredict,
    },
    {
      title: "The documentation's own words: with SO_LINGER enabled, close() won't return until all queued messages have been sent or the linger timeout is reached, while TIME-WAIT is a separate, later wait for an entirely different reason",
      body: (
        <>
          The socket manual page's own quote on SO_LINGER, and the TCP standard's own quote on TIME-WAIT, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: "SO_LINGER changes whether close() itself waits; TIME-WAIT is the kernel's wait, after.",
      Visual: S.LingerReveal,
    },
    {
      title: "Partial reads, a half-close that leaves one direction open, Nagle's own batching, and SO_LINGER's own blocking are all the same kind of surprise: a byte stream genuinely has none of a message's boundaries",
      body: (
        <>
          Four surprises, one shared cause, shown together.
        </>
      ),
      duration: 2.8,
      takeaway: 'TCP promises an ordered stream of bytes, never your own write boundaries back.',
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: a stream that never promised to keep your own boundaries',
      body: (
        <>
          Writing 4 MiB in one real call took dozens of real reads to receive, because TCP delivers an undifferentiated byte stream. A real half-close genuinely leaves one direction open while closing the other. Nagle's own documented batching is what TCP_NODELAY turns off, and SO_LINGER changes whether close() itself waits, which is entirely different from TIME-WAIT's own kernel-held wait afterward.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
