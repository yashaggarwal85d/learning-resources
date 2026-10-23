# Outline — de.gil-free-threading-subinterpreters

1. **Hook.** Threads in most languages mean real parallel CPU work. A plain Python thread
   doesn't, no matter how many are started. What exactly is standing in the way?
2. **Reveal: the GIL, quoted directly.** Only one thread executes Python bytecode at a time — by
   design, to make the object model implicitly safe against concurrent access.
3. **Predict (within first four).** Does the GIL serialize every line a thread runs, including a
   call into a C extension like a hash function, or just the Python bytecode itself?
4. **Reveal: the lab — native code releasing the GIL, measured for real.** `hashlib`'s own C
   computation genuinely parallelizes across threads; the identical total work in pure Python
   doesn't.
5. **Reveal: the lab — multiprocessing's fork vs. spawn, measured for real.** Startup cost,
   measured directly, and a real memory-duplication difference a fork child inherits that a
   spawn child never sees at all.
6. **Reveal: pickling's own real cost, measured for real.** A spawn/forkserver child needs
   anything it's handed serialized first; that serialization itself costs real, measured time.
   Takeaway on what multiprocessing actually costs beyond "more processes."
7. **Predict.** Free-threaded CPython removes the GIL entirely. Does that mean a thread now runs
   exactly as fast as before, just with real parallelism added on top for free?
8. **Reveal: free-threading's own disclosed cost, quoted directly.** A real single-thread
   overhead, named by CPython's own steering body — this sandbox's own build doesn't have it, so
   this is disclosed, not measured.
9. **Reveal: the lab — subinterpreters, a real multi-core speedup measured directly.** The
   low-level module beneath the newer high-level API, exercised directly on this sandbox,
   genuinely scaling pure Python work across cores.
10. **Reveal: what subinterpreters trade for that, quoted directly.** Isolation first, with no
    implicit threads and no shared GIL — concurrency has to be built on top deliberately.
    Takeaway on the real contrast with plain threads in one interpreter.
11. **Recap.**
12. **Prove it.** A pipeline needs four independent CPU-bound transforms running in parallel,
    today, on this sandbox's own non-free-threaded Python. Which of multiprocessing, native
    GIL-releasing code, or subinterpreters actually delivers that, and what does each cost to set
    up?
