# Outline — de.cpython-object-model-memory

1. **Hook.** A per-row Python loop over a million integers looks innocent — the same math, the
   same loop, that a native kernel runs 10–100× faster right next to it. What is each number in
   that loop actually carrying that a packed buffer never pays for?
2. **Reveal: the PyObject header, quoted directly.** Every Python object carries a reference
   count and a type pointer before a single byte of its own value — "the information Python
   needs to treat a pointer to an object as an object."
3. **Predict (within first four).** Does a Python list of a million plain integers cost about the
   same memory as the identical values packed into a native buffer, or dramatically more?
4. **Reveal: the lab — boxed vs. packed, measured for real.** A list of boxed ints measured
   against the identical values in a packed `array.array` on this sandbox's own CPython.
5. **Reveal: the lab — `__slots__`, measured for real.** The same three-field object with and
   without its own `__dict__`, measured directly. Takeaway on the real ratio.
6. **Predict.** Does the interpreter run the exact same bytecode for a line of code no matter what
   types flow through it, or does it rewrite itself once it sees what actually shows up?
7. **Reveal: the lab — the specializing adaptive interpreter, disassembled before and after.** The
   identical function's own bytecode, cold and then warm for two different argument types.
8. **Reveal: what specialization buys and what it doesn't, quoted directly.** PEP 659's own
   "speedups of up to 50%" claim, and its own adapt-on-mis-specialization safety valve.
9. **Reveal: the experimental JIT (3.13+), quoted directly; this sandbox doesn't have it built.**
   What CPython's own Tier 2 IR and copy-and-patch JIT actually do, honestly disclosed against
   what this sandbox's own build can show directly (`sys._jit` absent, no `--enable-experimental-jit`).
10. **Reveal: the lab — the real speedup a vectorized call still has over all of the above.**
    Takeaway: specialization and the JIT both speed up the interpreter's own dispatch loop; neither
    removes the boxed representation topics 2–5 already measured, which is most of the gap.
11. **Recap.**
12. **Prove it.** A function is called millions of times, but with a mix of int and float
    arguments rather than one consistent type throughout. Does specialization still help here, or
    does the mix undo it?
