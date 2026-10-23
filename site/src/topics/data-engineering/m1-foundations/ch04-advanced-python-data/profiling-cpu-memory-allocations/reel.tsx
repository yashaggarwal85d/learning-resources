import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Hosts the §4.1 chapter lab. Real measurements on this sandbox's own CPython 3.13.16
// (examples.py): the chapter's synthetic feed processed four ways (plain loop, multiprocessing,
// async, Polars/DuckDB), profiled with cProfile, tracemalloc, a real py-spy external attach,
// Scalene's real Python-vs-native split, and an Arrow-vs-CSV handoff timing. `perf`, PEP 768
// (3.14) and profiling.sampling (3.15) are genuinely unavailable on this sandbox and disclosed
// as sourced-only. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "Three claims about speed so far — none of them checked with a real profiler yet",
      body: (
        <>
          An object's overhead, the GIL's cost, async's own win for I/O — each one a real
          measured number, in its own topic, on its own small example. Not one of them has been
          checked with an actual profiler, on the same data, side by side.
        </>
      ),
      duration: 4.8,
      fig: "three speed claims so far, each measured alone — none checked side by side yet",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: deterministic profiling, quoted directly',
      body: (
        <>
          Every function call, return, and exception event gets monitored, with precise timing
          for the interval between them — real instrumentation, at a real cost.
        </>
      ),
      duration: 4.8,
      fig: 'every call and return monitored, with precise timing — real instrumentation, real cost',
      Visual: S.RevealDeterministicQuote,
    },
    {
      title: "Predict: does async beat the plain loop here too?",
      body: (
        <>
          This chapter's own feed, processed four different ways side by side. Async won its own
          topic's own race against the plain loop. Does it win this one too?
        </>
      ),
      duration: 2.8,
      fig: "the same feed, four ways — does async win here the way it won its own topic's race?",
      predict: {
        options: [
          { label: 'Yes — async already beat the plain loop once, it should again' },
          { label: "No — this workload isn't the one async is built for", correct: true },
        ],
        explain: (
          <>
            No. Async's own win was for network waits. Parsing a file is CPU-bound work, and
            handing CPU-bound work to a thread pool still runs under the same GIL this chapter
            already named.
          </>
        ),
      },
      Visual: S.PredictAsyncAgain,
    },
    {
      title: 'Reveal: the lab — all four ways, measured together for real',
      body: (
        <>
          The native engine wins by a wide margin. Multiprocessing modestly beats the plain loop.
          Async, measured honestly, loses to every other approach on this exact workload.
        </>
      ),
      duration: 4.8,
      fig: 'four ways, measured together — native engine wins big, async measured slowest of all',
      Visual: S.RevealFourWaysMeasured,
    },
    {
      title: 'Reveal: cProfile, run for real on the plain loop',
      body: (
        <>
          A real deterministic trace of the actual loop that just ran — naming the real function
          it profiled, not a stand-in example built to look tidy.
        </>
      ),
      duration: 4.8,
      fig: 'a real trace of the actual loop that ran — the real function, named directly',
      Visual: S.RevealCProfileMeasured,
    },
    {
      title: 'Reveal: tracemalloc, quoted and measured',
      body: (
        <>
          A real peak Python-heap size traced for the loop against the native engine — after an
          earlier version of this very measurement compared the wrong number and got a backwards
          result, caught and fixed.
        </>
      ),
      duration: 4.8,
      fig: 'a real peak heap size, loop vs native engine — an earlier wrong measurement caught and fixed',
      takeaway: "A profiler's number is only as honest as what it measures; a count after the fact isn't a real peak.",
      Visual: S.RevealTracemallocMeasured,
    },
    {
      title: 'Predict: can an outside tool see real function names with no code change at all?',
      body: (
        <>
          py-spy attaches to an already-running process from completely outside it, with nothing
          changed in that process's own code. Does it actually see real function names, or only
          generic addresses?
        </>
      ),
      duration: 2.8,
      fig: 'attach from outside, no code changed — real function names, or just addresses?',
      predict: {
        options: [
          { label: 'Only generic addresses — without code changes, real names are lost' },
          { label: 'Real function names — it reads the live process directly', correct: true },
        ],
        explain: (
          <>
            Real function names. It reads the running interpreter's own memory directly from the
            outside, which is exactly what makes it useful on a process nobody can afford to
            restart or modify.
          </>
        ),
      },
      Visual: S.PredictPyspyNames,
    },
    {
      title: 'Reveal: the lab — py-spy attaching to a live process, for real',
      body: (
        <>
          A real external attach to a process already running, capturing its exact real call
          stack — the exact file and function this lab's own workload was executing at that
          moment.
        </>
      ),
      duration: 4.8,
      fig: "a real live attach — the lab's own exact function, named directly from outside",
      Visual: S.RevealPyspyMeasured,
    },
    {
      title: 'Reveal: Scalene, run for real on the native-engine leg',
      body: (
        <>
          A real measured split between Python time and native time, confirming the native
          engine genuinely does the work — not assumed from either library's own description of
          itself.
        </>
      ),
      duration: 4.8,
      fig: 'a real measured split — native time genuinely dominates, confirmed, not assumed',
      takeaway: "Separating Python time from native time is a real measured split, not a label a library claims for itself.",
      Visual: S.RevealScaleneMeasured,
    },
    {
      title: 'Reveal: the lab — the Arrow handoff, measured against a round trip',
      body: (
        <>
          Querying the in-memory table directly beats a real round trip through a file format
          for the identical data — the actual measured benefit, after an earlier, more obvious
          test of the same claim gave an honest negative result.
        </>
      ),
      duration: 4.8,
      fig: 'querying in memory beats a real file round trip — the actual measured benefit',
      takeaway: "The real benefit of an in-memory handoff is skipping a real round trip, not sharing one buffer address.",
      Visual: S.RevealArrowHandoffMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Deterministic profiling times every call for real. A live attach reads a real running
          process from outside. Scalene genuinely splits Python time from native time. And this
          chapter's own four approaches, measured together, finally settle which one actually
          wins on this exact workload.
        </>
      ),
      duration: 4.8,
      fig: 'real timing, a real live attach, a real split, four approaches finally settled together',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline "feels slow." Is the real cost CPU time, memory held somewhere, or a call
          that's genuinely stalling the whole thread? Which tool from this topic actually answers
          which question?
        </>
      ),
      duration: 2.8,
      fig: "a pipeline 'feels slow' — cpu, memory, or a stall? which tool answers which?",
      predict: {
        options: [
          { label: 'Any one of the tools works for any of the three questions' },
          { label: 'Each tool answers its own specific question, not the others', correct: true },
        ],
        explain: (
          <>
            Each tool answers its own question. A deterministic or live-attach profiler answers
            CPU time; tracemalloc answers memory; neither one, on its own, tells you a thread is
            genuinely blocked rather than just slow.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
