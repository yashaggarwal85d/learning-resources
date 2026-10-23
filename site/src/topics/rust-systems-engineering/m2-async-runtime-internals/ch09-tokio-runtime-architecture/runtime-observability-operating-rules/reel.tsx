import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Semaphore saturation, runtime-metrics backlog, and bounded-channel backpressure,
// each measured directly; tokio-console named from the crate's own words.
const reel: Reel = {
  steps: [
    {
      title: '20 tasks, one Semaphore with 4 permits. Does the runtime actually stop at 4 running at once?',
      body: (
        <>
          A real Semaphore, contended by far more tasks than it has permits for.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No — more than 4 still slip through' },
          { label: 'Yes — never more than 4, and it reports fully saturated', correct: true },
          { label: 'Only on the current-thread runtime' },
        ],
        explain: (
          <>
            Yes. The permits really run out, and the semaphore says so directly.
          </>
        ),
      },
      Visual: S.SemaphorePredict,
    },
    {
      title: 'Measured: 4 tasks running, zero permits available, with the rest genuinely waiting',
      body: (
        <>
          Counted directly, while the rest of the tasks are still waiting their turn.
        </>
      ),
      duration: 2.8,
      Visual: S.SemaphoreReveal,
    },
    {
      title: "Spawn 500 tasks onto one worker, then ask the runtime's own metrics what's still queued. Zero, or a real backlog?",
      body: (
        <>
          Sampled the instant after the spawn loop finishes, before the worker catches up.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Zero — spawning is instant, so they're all already running" },
          { label: "A real, large backlog — the one worker hasn't touched most of them yet", correct: true },
          { label: 'The metric only updates once a second' },
        ],
        explain: (
          <>
            A real backlog. One worker cannot run 500 tasks between one line of code and the next.
          </>
        ),
      },
      Visual: S.MetricsPredict,
    },
    {
      title: "Measured: hundreds of tasks still queued, read straight from the runtime's own metrics",
      body: (
        <>
          Not an estimate — the runtime's own count of what it has not gotten to yet.
        </>
      ),
      duration: 3.0,
      takeaway: 'Runtime metrics report a real backlog, not an estimate, well before a violated rule turns into an incident.',
      Visual: S.MetricsReveal,
    },
    {
      title: 'A channel with capacity for one message. Does a second send wait politely, or get refused outright?',
      body: (
        <>
          tx.try_send(1) then tx.try_send(2), with nothing yet receiving.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'It waits until space frees up' },
          { label: "try_send is refused immediately — the channel is actually full", correct: true },
          { label: 'The channel silently grows to fit it' },
        ],
        explain: (
          <>
            Refused immediately. The bound is enforced, not a polite suggestion.
          </>
        ),
      },
      Visual: S.ChannelPredict,
    },
    {
      title: 'Measured: the second send was refused outright, and a third went through the instant capacity freed up',
      body: (
        <>
          Refused while full, accepted the moment a receive opened a slot — both measured directly.
        </>
      ),
      duration: 2.8,
      takeaway: "A bounded channel's limit is enforced, not aspirational — refused when full, accepted the moment it isn't.",
      Visual: S.ChannelReveal,
    },
    {
      title: 'Is tokio-console just a log viewer, or does it see every task this chapter has measured?',
      body: (
        <>
          The crate's own description of what it actually collects, in a running process.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Just a structured log viewer' },
          { label: 'A live view into tasks, resources, and operations across the whole runtime', correct: true },
          { label: 'It only works with the current-thread runtime' },
        ],
        explain: (
          <>
            A live view. Tasks, resources, and operations, across the whole runtime.
          </>
        ),
      },
      Visual: S.ConsolePredict,
    },
    {
      title: "The crate's own words: tokio-console sees tasks, resources, and operations, live in a running process",
      body: (
        <>
          The exact description text, naming what it actually watches.
        </>
      ),
      duration: 2.6,
      Visual: S.ConsoleReveal,
    },
    {
      title: "This chapter's rules, named one more time: small enough to yield, bounded concurrency, bounded channels, explicit cancellation",
      body: (
        <>
          Each rule pointed back at the mechanism that proved it, from this chapter's five topics.
        </>
      ),
      duration: 2.8,
      takeaway: "A Semaphore's permits genuinely run out, and the runtime genuinely stops there — a real cap, not a suggestion.",
      Visual: S.RulesReveal,
    },
    {
      title: 'Recap: a real cap, a real backlog, a real refusal, and a live view of all three',
      body: (
        <>
          A Semaphore's permits really run out. Runtime metrics report a real backlog. A bounded channel really refuses a full send. tokio-console turns every one of these into a live view in production.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
