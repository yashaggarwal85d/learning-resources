import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Four of Tokio's channel kinds, each measured keeping its own real promise: mpsc paces a
// producer, broadcast reports exactly what a lagging receiver missed, watch keeps only the
// latest value, and try_send refuses a full channel outright rather than waiting.
const reel: Reel = {
  steps: [
    {
      title: 'A fast producer, a slow consumer, one channel with room for a single message. Does the producer race ahead, or get paced?',
      body: (
        <>
          A real bounded channel, with a consumer deliberately slower than its producer.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It races ahead, buffering internally' },
          { label: 'It genuinely waits on the consumer, paced to its speed', correct: true },
          { label: "It drops messages the consumer can't keep up with" },
        ],
        explain: (
          <>
            It genuinely waits. The channel's bound is the producer's real speed limit.
          </>
        ),
      },
      Visual: S.MpscPredict,
    },
    {
      title: "Measured: the producer's own total time tracked the consumer's pace, message for message",
      body: (
        <>
          Timed directly, from the first send to the last, against a consumer that never speeds up.
        </>
      ),
      duration: 2.8,
      Visual: S.MpscReveal,
    },
    {
      title: 'A broadcast channel with room for 2 values, and a receiver that never checks in while 5 are sent. What happens to the ones it missed?',
      body: (
        <>
          Five sends, two slots, and nobody reading until afterward.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'They queue up invisibly until the receiver catches up' },
          { label: 'The oldest ones are overwritten, and the receiver is told exactly how many it missed', correct: true },
          { label: 'The sends simply fail once the buffer is full' },
        ],
        explain: (
          <>
            Overwritten, and named directly. The receiver finds out exactly what it lost.
          </>
        ),
      },
      Visual: S.BroadcastPredict,
    },
    {
      title: 'Measured: a real Lagged error, naming exactly how many messages were dropped before resuming cleanly',
      body: (
        <>
          The receiver's first read after falling behind, measured directly.
        </>
      ),
      duration: 3.0,
      takeaway: "A lagging broadcast receiver is told exactly how many messages it missed, then resumes from what's left.",
      Visual: S.BroadcastReveal,
    },
    {
      title: 'A watch channel sends 50 updates in a row before anyone checks in. How many of those 50 does a late receiver actually see?',
      body: (
        <>
          Fifty rapid sends into a channel built to hold only the latest value.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'All 50, buffered in order' },
          { label: 'Only the very latest one', correct: true },
          { label: 'Only the first one it happened to catch' },
        ],
        explain: (
          <>
            Only the latest. Everything in between is gone by design, not by accident.
          </>
        ),
      },
      Visual: S.WatchPredict,
    },
    {
      title: 'Measured: one receiver, checking in once, saw exactly the latest value — none of the other 49',
      body: (
        <>
          A single read, after all 50 sends, measured directly.
        </>
      ),
      duration: 2.8,
      takeaway: 'A watch channel is not a queue — it keeps only the most recent value, by design.',
      Visual: S.WatchReveal,
    },
    {
      title: "The same channel, but now call try_send on it while it's already full. Does it wait a little, or refuse outright?",
      body: (
        <>
          tx.try_send(2) on a channel whose one slot is already taken.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'It waits briefly for room, like send does' },
          { label: "It's refused immediately, with no wait at all", correct: true },
          { label: 'It silently drops the new value and returns success' },
        ],
        explain: (
          <>
            Refused immediately. No wait, no silent drop — a real, instant decision.
          </>
        ),
      },
      Visual: S.TrySendPredict,
    },
    {
      title: 'Measured: refused in a fraction of a millisecond — not a wait, a decision',
      body: (
        <>
          Timed from the call to the refusal, directly.
        </>
      ),
      duration: 2.6,
      Visual: S.TrySendReveal,
    },
    {
      title: 'Four channels, four different promises about a message nobody was ready for',
      body: (
        <>
          mpsc waits. broadcast drops the oldest and says so. watch keeps only the latest. oneshot delivers exactly one reply.
        </>
      ),
      duration: 2.8,
      takeaway: 'Every channel must be bounded — but which of these four promises it keeps is a real design decision.',
      Visual: S.ComparisonReveal,
    },
    {
      title: 'Recap: a wait, a count of what was lost, a latest value kept, and a refusal that costs nothing',
      body: (
        <>
          A bounded mpsc channel genuinely paces a fast producer. A broadcast channel reports exactly how many messages a lagging receiver missed. A watch channel keeps only the latest value, by design. try_send refuses a full channel outright.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
