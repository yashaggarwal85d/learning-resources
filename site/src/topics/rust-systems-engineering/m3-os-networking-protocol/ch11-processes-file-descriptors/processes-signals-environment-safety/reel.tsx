import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A forked child genuinely has one thread; a pidfd genuinely refers to one exact
// process; set_var genuinely races with C's own getenv — three different names
// for the same real lesson about shared, process-level state.
const reel: Reel = {
  steps: [
    {
      title: "Spawn a real child process with Command. Does it get its own, separate process id, or does it somehow share the parent's?",
      body: (
        <>
          A real Command::spawn(), then a check of the resulting pid.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It shares the parent's pid" },
          { label: 'It gets its own, completely separate pid', correct: true },
          { label: 'It depends on whether the shell forks internally' },
        ],
        explain: (
          <>
            Its own, separate pid. Command genuinely forks and execs a distinct process.
          </>
        ),
      },
      Visual: S.CommandPredict,
    },
    {
      title: "Measured: the spawned child had its own, genuinely different process id, and its real exit code — 7 — was observed exactly",
      body: (
        <>
          A distinct pid, and an exit code round-tripped through a real child.
        </>
      ),
      duration: 3.0,
      Visual: S.CommandReveal,
    },
    {
      title: 'A multithreaded process calls fork(). How many threads does the resulting child actually have?',
      body: (
        <>
          Several real threads in the parent, then a real fork().
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The same number the parent had' },
          { label: 'Exactly one — the thread that called fork()', correct: true },
          { label: "Zero, until the child starts its own" },
        ],
        explain: (
          <>
            Exactly one. The entire address space is copied, but only one thread runs it.
          </>
        ),
      },
      Visual: S.ForkPredict,
    },
    {
      title: "Measured: the parent genuinely had several real threads running, and the forked child had exactly one — which is exactly why only async-signal-safe operations are allowed there before exec",
      body: (
        <>
          A real thread count, read from /proc, for the parent and then the child.
        </>
      ),
      duration: 3.0,
      takeaway: 'A forked child has exactly one thread — any lock another thread held belongs to nobody there now.',
      Visual: S.ForkReveal,
    },
    {
      title: 'Send a signal through a pidfd to a process that has already exited and been reaped. Does it silently succeed, silently fail, or fail with a specific, clear error?',
      body: (
        <>
          A real pidfd, signaled after the process it refers to is genuinely gone.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It silently succeeds, doing nothing' },
          { label: 'It fails with a clear, specific error, ESRCH', correct: true },
          { label: 'It blocks forever waiting for the process to exist' },
        ],
        explain: (
          <>
            ESRCH, outright. A pidfd never confuses a process that's gone with one that isn't.
          </>
        ),
      },
      Visual: S.PidfdPredict,
    },
    {
      title: "Measured: sending through the pidfd succeeded while the real process was alive, and failed outright with ESRCH the instant it was genuinely gone — never silently reaching some other process that reused its old pid",
      body: (
        <>
          One real signal attempt before exit, one real attempt after.
        </>
      ),
      duration: 3.0,
      takeaway: 'A pidfd is a stable reference to one process — never confused with a later one reusing its number.',
      Visual: S.PidfdReveal,
    },
    {
      title: 'Why did Rust 2024 make std::env::set_var unsafe, when it was perfectly safe to call for years before?',
      body: (
        <>
          The exact race this edition's own signature now has to warn about.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'It was always unsafe, and the edition just caught up' },
          { label: "Because it races with C's own getenv, which no library can be relied on to avoid calling", correct: true },
          { label: 'Because the environment itself became a kernel-managed resource' },
        ],
        explain: (
          <>
            The getenv race. No library can promise it never reads the environment internally.
          </>
        ),
      },
      Visual: S.SetVarPredict,
    },
    {
      title: "std::env::set_var's own safety section is explicit: this function is sound in a single-threaded program, and in any program on Windows — but in a multithreaded program on other platforms, the only sound choice is not to call it at all",
      body: (
        <>
          The function's own documented safety contract, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.SetVarReveal,
    },
    {
      title: 'Every one of these rules is the same rule, said three different ways: a forked child, a pidfd, and the environment are all shared state that something else in the process can be touching at the exact same moment',
      body: (
        <>
          Fork safety. Pidfd stability. The environment's own race. Three names, one lesson.
        </>
      ),
      duration: 2.8,
      takeaway: "Fork safety, pidfds, and set_var's unsafety are one lesson three times: shared state, touched at the wrong moment.",
      Visual: S.LessonReveal,
    },
    {
      title: "Recap: a real pid, a real one-thread child, and a real race finally named",
      body: (
        <>
          Command genuinely spawns a separate process with its own pid. A forked child genuinely has exactly one thread. A pidfd genuinely refers to one exact process, never confusing it with a later one. And set_var genuinely races with C's own getenv.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
