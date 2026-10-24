import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A CancellationToken genuinely rejecting new work outright; a TaskTracker's wait()
// genuinely waiting for real completion; a real deadline genuinely abandoning a straggler —
// three already-proven mechanisms, assembled into one explicit shutdown sequence.
const reel: Reel = {
  steps: [
    {
      title: 'A worker pool signals shutdown with a CancellationToken. Does a job submitted right after that signal still get accepted?',
      body: (
        <>
          A real token, cancelled, then a new job submitted right after.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, it's queued and runs eventually" },
          { label: "No, it's rejected outright, immediately", correct: true },
          { label: 'It depends on whether any workers are still idle' },
        ],
        explain: (
          <>
            Rejected immediately. A cancelled token is a hard stop, not a queue.
          </>
        ),
      },
      Visual: S.TokenPredict,
    },
    {
      title: 'Measured: 3 jobs accepted before the signal, then every single submission after it rejected outright',
      body: (
        <>
          Counted directly, before and after the exact moment of cancellation.
        </>
      ),
      duration: 3.0,
      Visual: S.TokenReveal,
    },
    {
      title: "A TaskTracker's wait() is called right after the tracker is closed. Does it return as soon as the tracker is closed, or does it wait for the jobs themselves?",
      body: (
        <>
          8 jobs in flight, the tracker closed, then wait() called.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It returns immediately once closed' },
          { label: 'It waits until every tracked job has actually finished', correct: true },
          { label: 'It waits for exactly one job, the first to finish' },
        ],
        explain: (
          <>
            It waits for all of them. Closing only stops new jobs from being added.
          </>
        ),
      },
      Visual: S.TrackerPredict,
    },
    {
      title: "Measured: wait() didn't return until all 8 accepted jobs had genuinely finished running",
      body: (
        <>
          Timed from close() to the moment wait() actually returns.
        </>
      ),
      duration: 3.0,
      takeaway: "A TaskTracker's wait() returns only once every tracked job has actually finished, not merely stopped.",
      Visual: S.TrackerReveal,
    },
    {
      title: 'Wrap that same wait in a real deadline, with one job that deliberately runs far longer than it. Does the shutdown hang, or does it stop on time?',
      body: (
        <>
          A 300ms deadline, racing against a job that takes 2 full seconds.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It hangs until the straggler finishes, deadline or not' },
          { label: 'It stops close to the deadline, straggler or not', correct: true },
          { label: 'The deadline only applies to new jobs, not ones already running' },
        ],
        explain: (
          <>
            It stops on time. A deadline that doesn't actually end the wait isn't one.
          </>
        ),
      },
      Visual: S.DeadlinePredict,
    },
    {
      title: "Measured: the wait genuinely stopped right at its deadline — the straggler, still unfinished, was not waited for any longer",
      body: (
        <>
          Timed directly: the wait ends at the deadline, not when the straggler does.
        </>
      ),
      duration: 3.0,
      takeaway: "A shutdown's own wait respects a real deadline — it stops on time, even if a straggler hasn't finished.",
      Visual: S.DeadlineReveal,
    },
    {
      title: 'Which real-world signal is this entire sequence actually built to answer, in time?',
      body: (
        <>
          The real external deadline every one of these mechanisms is answering to.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'An unhandled crash, caught after the fact' },
          { label: 'A deliberate shutdown request, with a real, limited amount of time to respond', correct: true },
          { label: 'Only a manual, interactive shutdown command' },
        ],
        explain: (
          <>
            A deliberate request, on a real clock. That's exactly what a grace period is.
          </>
        ),
      },
      Visual: S.SignalPredict,
    },
    {
      title: 'The real sequence, assembled from this chapter: stop accepting, signal, drain or cancel, close, wait',
      body: (
        <>
          All five stages, each one a mechanism this chapter has already proven directly.
        </>
      ),
      duration: 2.8,
      Visual: S.SequenceReveal,
    },
    {
      title: 'Every stage of that sequence just used a mechanism this chapter already proved',
      body: (
        <>
          Stop accepting (a token). Drain or cancel (cancel safety). Wait with a deadline (a tracker, timed).
        </>
      ),
      duration: 2.8,
      takeaway: "Graceful shutdown isn't a new mechanism — it's three already-proven ones, assembled into one sequence.",
      Visual: S.MechanismsReveal,
    },
    {
      title: 'Recap: a real stop, a real wait, and a real deadline',
      body: (
        <>
          A cancellation signal genuinely stops new work outright. A task tracker's wait genuinely waits for real completion. A stated deadline is genuinely enforced, even against a straggler.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
