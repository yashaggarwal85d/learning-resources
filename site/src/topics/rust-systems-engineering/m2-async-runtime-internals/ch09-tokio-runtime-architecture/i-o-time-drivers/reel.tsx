import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// mio::Poll's real register -> park -> readiness event -> poll cycle, built directly; the
// timer driver's own wake cycle, measured; io_uring named as real but unstable and opt-in.
const reel: Reel = {
  steps: [
    {
      title: 'Register a real socket’s connection with mio, then poll. Does a real readiness event actually arrive once it connects?',
      body: (
        <>
          A real socket connection, registered for readiness, then polled for real.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No — mio only reports errors' },
          { label: 'Yes — a real writable event arrives', correct: true },
          { label: 'Only after a fixed delay' },
        ],
        explain: (
          <>
            Yes. The event names the exact socket that became ready, not a guess.
          </>
        ),
      },
      Visual: S.RegisterPredict,
    },
    {
      title: 'Measured: a real writable readiness event, naming the exact socket that connected',
      body: (
        <>
          Register interest, then wait to be tapped on the shoulder — measured directly, for real.
        </>
      ),
      duration: 2.8,
      Visual: S.RegisterReveal,
    },
    {
      title: 'Register a socket for readiness that will never arrive. What does poll actually do?',
      body: (
        <>
          The identical registration, but nothing is ever written to the socket at all.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'It returns immediately with no events' },
          { label: 'It parks for close to the full timeout, then returns empty', correct: true },
          { label: 'It panics' },
        ],
        explain: (
          <>
            It parks. There is nothing to report, so it genuinely waits for the time it was given.
          </>
        ),
      },
      Visual: S.TimeoutPredict,
    },
    {
      title: 'Measured: poll parked for the full timeout, delivering no event at all',
      body: (
        <>
          The real wait, timed precisely — the mechanism behind an idle worker, for real.
        </>
      ),
      duration: 2.8,
      takeaway: 'Registering interest delivers a named event when ready, and genuinely parks for close to the timeout when nothing is.',
      Visual: S.TimeoutReveal,
    },
    {
      title: 'tokio::time::sleep: does it actually wake close to its real deadline, or just eventually?',
      body: (
        <>
          sleep(Duration::from_millis(200)).await, timed precisely from the moment it starts.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'It wakes immediately, ignoring the duration' },
          { label: 'It wakes close to the real deadline', correct: true },
          { label: 'It only wakes on the next readiness event' },
        ],
        explain: (
          <>
            Close to the deadline. Something is actually watching the clock.
          </>
        ),
      },
      Visual: S.SleepPredict,
    },
    {
      title: 'Measured: a 200ms sleep woke right at its deadline — the timer driver’s own wake cycle',
      body: (
        <>
          The thing that actually calls wake, at close to the right moment — proven directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'The timer driver is the thing that actually calls wake at close to the right moment — proven directly here.',
      Visual: S.SleepReveal,
    },
    {
      title: 'Is io_uring Tokio’s default way of doing I/O now?',
      body: (
        <>
          A newer, much-discussed way of doing fast I/O on modern Linux systems.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'Yes — it replaced mio by default' },
          { label: "No — it's real, but unstable and opt-in", correct: true },
          { label: 'It only exists in a separate crate' },
        ],
        explain: (
          <>
            No. It's real, but still marked unstable, requiring an explicit flag.
          </>
        ),
      },
      Visual: S.UringPredict,
    },
    {
      title: 'The crate’s own words: io-uring requires tokio_unstable, opted in explicitly',
      body: (
        <>
          The exact feature-flag text, naming the real tradeoff directly.
        </>
      ),
      duration: 2.6,
      takeaway: 'io_uring is real, but still unstable and opt-in — mio stays the default readiness path.',
      Visual: S.UringReveal,
    },
    {
      title: 'This closes the loop the earlier chapter opened: register, park, event, wake, poll again — for real',
      body: (
        <>
          Every step of the cycle, now backed by one of this topic’s own measurements.
        </>
      ),
      duration: 2.8,
      Visual: S.CycleReveal,
    },
    {
      title: 'Recap: register, park, a real event, and a timer that wakes on time',
      body: (
        <>
          Registering delivers a real, named event. With nothing ready, it genuinely parks. A timer wakes close to its deadline. io_uring is real but still unstable.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
