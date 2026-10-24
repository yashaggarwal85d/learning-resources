import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// select! genuinely dropping its losing branch; recv() proven cancel-safe, read_exact
// proven not; a dropped JoinHandle detaching its task rather than cancelling it.
const reel: Reel = {
  steps: [
    {
      title: 'select! races two branches and picks whichever finishes first. What happens to the one that loses?',
      body: (
        <>
          Two concurrent branches, one fast, one slow, racing inside a single select!.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It keeps running quietly in the background' },
          { label: "It's dropped outright, cancelling it", correct: true },
          { label: "It's paused and resumed later if needed" },
        ],
        explain: (
          <>
            Dropped outright. The losing future simply stops existing.
          </>
        ),
      },
      Visual: S.SelectPredict,
    },
    {
      title: "Measured: the losing branch's own side effect never ran, even long after its own delay had passed",
      body: (
        <>
          Checked well past the loser's own full duration, to rule out it finishing late.
        </>
      ),
      duration: 2.8,
      Visual: S.SelectReveal,
    },
    {
      title: 'Cancel an mpsc recv() mid-wait with select!, then send a message and call recv() again. Does the first message ever go missing?',
      body: (
        <>
          A cancelled recv(), then a real send, then a fresh recv().
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the cancelled recv() can silently consume it' },
          { label: "No, nothing is lost — recv() is cancel-safe", correct: true },
          { label: 'Only if the message arrives before the next poll' },
        ],
        explain: (
          <>
            Nothing is lost. A dropped recv() never half-consumes a message.
          </>
        ),
      },
      Visual: S.RecvPredict,
    },
    {
      title: 'Measured: a fresh recv() after cancellation received exactly the message that was sent, nothing lost',
      body: (
        <>
          The cancelled recv(), then the fresh one, each measured directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'mpsc::Receiver::recv is cancel-safe — dropping it mid-wait and starting a fresh one loses nothing.',
      Visual: S.RecvReveal,
    },
    {
      title: "Now cancel a read_exact() midway through reading, after it's already consumed part of the stream. What happens to those bytes?",
      body: (
        <>
          A read_exact() cancelled after it has already pulled some bytes in.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "They're buffered internally and returned by the next read" },
          { label: "They're gone — a fresh read only gets what arrives after", correct: true },
          { label: "read_exact can't be cancelled at all" },
        ],
        explain: (
          <>
            Gone. Whatever it already pulled in is lost the moment it's dropped.
          </>
        ),
      },
      Visual: S.ReadExactPredict,
    },
    {
      title: 'Measured: the first half of the stream, already consumed by the cancelled read, is gone for good',
      body: (
        <>
          A fresh read after cancellation, measured against what was actually sent.
        </>
      ),
      duration: 3.0,
      takeaway: 'read_exact is not cancel-safe — cancelling it mid-read loses the bytes it already consumed, permanently.',
      Visual: S.ReadExactReveal,
    },
    {
      title: 'Drop a JoinHandle without awaiting or aborting it. Does its task stop, or keep going?',
      body: (
        <>
          A spawned task, its one handle dropped immediately.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'The task is cancelled along with the handle' },
          { label: 'The task keeps running, completely detached', correct: true },
          { label: 'The task pauses until a new handle is created' },
        ],
        explain: (
          <>
            It keeps running. Dropping the handle only gives up the ability to join it.
          </>
        ),
      },
      Visual: S.JoinHandlePredict,
    },
    {
      title: 'Measured: the task kept ticking long after its only handle was dropped — detached, not cancelled',
      body: (
        <>
          Checked well after the handle was dropped, counting real, ongoing side effects.
        </>
      ),
      duration: 2.8,
      Visual: S.JoinHandleReveal,
    },
    {
      title: 'One real mechanism, two very different outcomes depending on what was cancelled',
      body: (
        <>
          recv() loses nothing. read_exact loses what it already consumed. A detached task isn't even cancelled at all.
        </>
      ),
      duration: 2.8,
      takeaway: 'Cancellation is always a drop at the current .await — whether that loses anything depends on what was paused.',
      Visual: S.SummaryReveal,
    },
    {
      title: 'Recap: a real drop, a safe recv, an unsafe read, and a detached task',
      body: (
        <>
          select! genuinely drops its losing branch. recv() is cancel-safe and loses nothing. read_exact is not, and loses already-consumed bytes. Dropping a JoinHandle detaches a task instead of cancelling it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
