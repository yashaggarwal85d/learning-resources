# Outline — de.profiling-cpu-memory-allocations

1. **Hook.** Three different mechanisms, three claims about speed — an object's overhead, the
   GIL's cost, async's win for I/O. Not one of those claims has been checked with a real
   profiler yet.
2. **Reveal: deterministic profiling, quoted directly.** Every function call and return event
   gets instrumented, giving precise timing at a real cost.
3. **Predict (within first four).** This chapter's own feed, processed four ways — a plain
   loop, multiprocessing, async, and a native engine. Does async beat the plain loop here too?
4. **Reveal: the lab — all four ways, measured together for real.** The native engine wins by
   far; multiprocessing modestly beats the plain loop; async, measured honestly, loses to
   all three.
5. **Reveal: cProfile, run for real on the plain loop.** A real deterministic trace, naming the
   real function it profiled, not a stand-in example.
6. **Reveal: tracemalloc, quoted and measured.** A real peak Python-heap size traced for the
   loop versus the native-engine leg — and a wrong first measurement this build caught and
   fixed along the way. Takeaway on what a profiler's own numbers actually mean.
7. **Predict.** py-spy can attach to an already-running Python process from the outside, with
   no code change in that process. Can it actually see real function names, or only generic
   addresses?
8. **Reveal: the lab — py-spy attaching to a live process, for real.** A real external attach
   to a process already running, capturing its real call stack — the exact file and function
   this build's own workload was executing.
9. **Reveal: Scalene, run for real on the native-engine leg.** A real measured split between
   Python time and native time, confirming the native engine does the real work, not assumed
   from either library's own description of itself. Takeaway on separating glue from engine.
10. **Reveal: the lab — the Arrow handoff, measured against a round trip.** Querying the
    in-memory table directly beats a CSV round trip for the identical data — the real,
    measured benefit, not a "zero-copy" claim taken on faith. Takeaway on what that benefit
    actually is.
11. **Recap.**
12. **Prove it.** A pipeline that "feels slow" needs an actual answer: is the real cost CPU time,
    memory, or something stalling the loop entirely? Which tool from this topic answers which
    question?
