# Outline — Embedding Rust in Python and JVM

Concept ledger: introduces `pyo3-exchanges-data-without-copying-it`; uses `an-ffi-boundary-is-a-protocol-not-just-layout` (topic 80), per Chapter 31's own CHAPTER.md §A.7 — this topic closes the chapter by building the one real cross-language toolchain this sandboxed container can actually install and run.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "A protocol for who allocates, who frees, and how an error or a panic crosses the line holds for any foreign boundary at all; the next question is what that boundary actually looks like for the two real runtimes this domain's own data platforms are built around." Hands off to the next chapter (verbatim): "A correct boundary and a working extension both still live inside one crate; the next chapter turns to the question of where a crate's own boundary should actually sit once a real project has more than one of them."

Chapter 31's own disclosed limitation (§A.6) applies the other way this time: this sandboxed container *can* install and build a real PyO3 extension (`pip install maturin`, confirmed working), so the Python half of the syllabus clause is a real, working extension module, built and imported for real; the JVM/JNI half is covered in prose only (post-notes.md), since no JVM toolchain is available here.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **ZeroCopyPredict** — A real Python `bytearray`'s own buffer is handed to a real Rust function through PyO3, which reads its real memory address. Does the address Rust sees match the address Python's own `ctypes` reports for the identical buffer? Options: no, PyO3 copies the bytes in first; yes, genuinely, the same real address on both sides (correct); only for buffers under a fixed size.
2. **ZeroCopyReveal** — Measured: the real address Rust reads from the bytearray's own buffer is identical to the real address Python's own `ctypes` reports for it; no copy was ever made. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **HeldGilPredict** — A real Rust function holds the GIL for its entire run while it does real CPU-bound work. While it is running, how much progress does a separate, real Python thread make? Options: as much as it would normally make; genuinely very little, since the GIL is never given up (correct); exactly double, since Rust is fast.
4. **HeldGilReveal** — Measured: while the real GIL-holding call runs, a separate, real Python thread's own counter advances by only a small, real amount. Takeaway: holding the GIL the whole time leaves almost no room for anything else to run.
5. **ReleasedGilPredict** — The identical real CPU-bound work now runs inside `Python::detach`, explicitly releasing the GIL for its own duration. Does the separate Python thread now make dramatically more progress in the same time? Options: no difference, the thread was never blocked; yes, genuinely, dramatically more (correct); only if the thread also calls `detach`.
6. **ReleasedGilReveal** — Measured: the identical real Python thread's own counter advances by many times more in the same real duration once the call explicitly releases the GIL. Takeaway: `Python::detach` is the real, explicit act that actually lets other work run.
7. **DocsReveal** — The PyO3 user guide states the GIL-release rule directly, in its own words: `Python::detach` lets the interpreter do other work while the Rust work is ongoing; the `PyByteArrayMethods` documentation states the zero-copy rule directly too: `as_bytes` extracts a slice of the bytearray's own entire buffer. Does this topic's own two measured boundaries model exactly the two rules both sources describe? Takeaway (moved here from step 2): a real PyO3 extension can hand over the identical memory it already has, and can explicitly step out of the interpreter's own way, but neither happens unless the code says so.
8. **Recap** — PyO3 can hand Python the same real buffer it already has, and can explicitly step out of the interpreter's own way while real Rust work runs; a data-platform deployment built this way gets both for free, if the code asks for them.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what one specific, real crossing of the Python/Rust boundary actually does.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting "both sources say this" step; step 8's recap carries the closing statement instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the kit's real-measurement standard)

- JNI (`jni` crate) for embedding Rust-backed native code into the JVM, and who owns JVM-heap versus native memory across that boundary — this sandboxed container has no JVM toolchain to build and run it for real, so it is named in prose only — Internals.
- The real Arrow C Data Interface and `PyCapsule` convention for a genuinely zero-copy columnar exchange between Rust and Python (the syllabus's own named mechanism beyond this topic's own simpler `bytearray` address comparison) — In production.
- Free-threaded CPython, officially supported from 3.14 (PEP 779), and how it changes the real GIL story this topic measures under a standard, non-free-threaded build — The frontier.
- Real production users of this exact pattern (Polars, delta-rs, pydantic-core shipping through PyO3 and maturin) — In production.
