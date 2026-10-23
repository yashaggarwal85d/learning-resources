import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own CPython 3.13.16 (examples.py): fork vs. spawn/
// forkserver startup and memory duplication, pickling cost, hashlib's own GIL release vs. a
// pure-Python loop, and genuine subinterpreter parallelism via the low-level `_interpreters`
// module. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "A thread in most languages means real parallel work — in Python, it often doesn't",
      body: (
        <>
          Start four threads doing real CPU work in most languages, and four cores light up.
          Start four plain Python threads doing the same thing, and often only one core does.
          What's actually standing in the way?
        </>
      ),
      duration: 4.8,
      fig: "four threads, four cores, in most languages — often just one core in plain Python",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the GIL, quoted directly',
      body: (
        <>
          Only one thread executes Python bytecode at a time. By design — it's what makes the
          object model itself safe against concurrent access without the programmer doing
          anything.
        </>
      ),
      duration: 4.8,
      fig: 'only one thread executes python bytecode at a time, by design',
      Visual: S.RevealGilQuote,
    },
    {
      title: 'Predict: does the GIL block a call into a C extension too?',
      body: (
        <>
          A thread calls into a hash function written in C instead of running Python bytecode.
          Does the GIL still serialize that the same way it serializes a Python loop?
        </>
      ),
      duration: 2.8,
      fig: 'a thread calling into C instead of python bytecode — still serialized the same way?',
      predict: {
        options: [
          { label: 'Yes — the GIL blocks every line a thread runs, Python or not' },
          { label: 'No — native code can release the GIL for its own computation', correct: true },
        ],
        explain: (
          <>
            No. The GIL specifically guards Python bytecode execution; extension code written to
            release it during its own computation genuinely runs alongside other threads.
          </>
        ),
      },
      Visual: S.PredictGilRelease,
    },
    {
      title: 'Reveal: the lab — native code releasing the GIL, measured for real',
      body: (
        <>
          The identical total amount of work, in threads: a C hash function genuinely
          parallelizes across cores, while the same work written as a plain Python loop doesn't
          speed up at all.
        </>
      ),
      duration: 4.8,
      fig: 'the same total work, threaded — a C hash function parallelizes, a python loop does not',
      takeaway: "The GIL serializes Python bytecode, not every native call; code that releases it deliberately runs alongside other threads.",
      Visual: S.RevealGilReleaseMeasured,
    },
    {
      title: "Reveal: the lab — multiprocessing's fork vs. spawn, measured for real",
      body: (
        <>
          A fork child starts fast because it inherits the parent's own memory directly. A spawn
          child starts a fresh interpreter instead — slower, and it genuinely never sees what the
          parent already had in memory.
        </>
      ),
      duration: 4.8,
      fig: "fork inherits the parent's memory; spawn starts fresh and never sees it at all",
      Visual: S.RevealForkVsSpawnMeasured,
    },
    {
      title: "Reveal: pickling's own real cost, measured for real",
      body: (
        <>
          Anything a spawn or forkserver child needs has to be serialized first, since it starts
          with none of the parent's memory. That serialization itself has a real, measured cost.
        </>
      ),
      duration: 4.8,
      fig: 'anything a fresh child needs must be serialized first — a real, measured cost of its own',
      takeaway: "Multiprocessing's real cost isn't just more processes; it's everything a fresh process has to be handed instead of inheriting.",
      Visual: S.RevealPicklingMeasured,
    },
    {
      title: 'Predict: does removing the GIL mean the same speed, plus free parallelism?',
      body: (
        <>
          Free-threaded CPython removes the GIL entirely. Does a single thread then run exactly
          as fast as before, with genuine multi-core parallelism simply added on top for free?
        </>
      ),
      duration: 2.8,
      fig: 'remove the gil entirely — same single-thread speed, plus parallelism for free?',
      predict: {
        options: [
          { label: 'Yes — removing a lock should cost nothing when only one thread is running' },
          { label: 'No — single-thread speed itself gets measurably slower too', correct: true },
        ],
        explain: (
          <>
            No. The locking the GIL used to provide for free has to be replaced with finer-grained
            locking throughout the interpreter, and that replacement has a real, disclosed cost
            even when nothing is running in parallel.
          </>
        ),
      },
      Visual: S.PredictFreeThreadingCost,
    },
    {
      title: "Reveal: free-threading's own disclosed cost, quoted directly",
      body: (
        <>
          A real single-thread performance penalty and real added memory use — named directly by
          the body governing the feature's own path to being officially supported, not hidden in
          the pitch. The same proposal names a second cost up front: every C extension needs a
          separately compiled build before it even runs on a GIL-free interpreter.
        </>
      ),
      duration: 4.8,
      fig: 'a real single-thread penalty and real added memory — disclosed directly, not hidden',
      Visual: S.RevealFreeThreadingCostQuote,
    },
    {
      title: 'Reveal: the lab — subinterpreters, a real multi-core speedup measured directly',
      body: (
        <>
          A lower-level mechanism, sitting underneath the newer concurrent.interpreters module
          and its InterpreterPoolExecutor — neither available on this sandbox's own Python —
          genuinely scales pure Python work across cores when run for real right here.
        </>
      ),
      duration: 4.8,
      fig: 'a lower-level mechanism, run for real on this sandbox, genuinely scales across cores',
      Visual: S.RevealSubinterpreterMeasured,
    },
    {
      title: 'Reveal: what subinterpreters trade for that, quoted directly',
      body: (
        <>
          Isolation comes first. No threads start automatically, and no GIL is shared between
          interpreters — real parallelism has to be built deliberately on top of that isolation.
        </>
      ),
      duration: 4.8,
      fig: 'isolated by default, no automatic threads, no shared gil — parallelism built on top',
      takeaway: 'Subinterpreters trade automatic sharing for real separate cores; one shared interpreter keeps the sharing and gives up the cores.',
      Visual: S.RevealSubinterpreterTradeoffQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          The GIL serializes Python bytecode, not native code that releases it. Multiprocessing
          trades inherited memory for a slower, picklable start. Free-threading's own disclosed
          cost is real. Subinterpreters trade automatic sharing for real, separate cores.
        </>
      ),
      duration: 4.8,
      fig: 'the gil, multiprocessing, free-threading, subinterpreters — each trade named plainly',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Four independent CPU-bound transforms need to run in parallel, today, on this sandbox's
          own non-free-threaded Python. Does simply creating four subinterpreters, with no new
          threads, already deliver that parallelism?
        </>
      ),
      duration: 2.8,
      fig: 'four independent transforms, today, on a non-free-threaded python — subinterpreters alone enough?',
      predict: {
        options: [
          { label: 'Yes — isolated interpreters run concurrently the moment they exist' },
          { label: "No — interpreters add no concurrency by themselves; threads still have to run them", correct: true },
        ],
        explain: (
          <>
            No. Interpreters only provide isolation; nothing runs concurrently until each one is
            actually driven by its own thread. The real win here is multiprocessing or
            subinterpreters-plus-threads, not native GIL-released code, since the transforms
            themselves are plain Python, not a C extension that releases the GIL on its own.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
