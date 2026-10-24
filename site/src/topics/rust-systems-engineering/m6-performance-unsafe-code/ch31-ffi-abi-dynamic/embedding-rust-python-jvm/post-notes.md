---
title: "Embedding Rust in Python and JVM"
---

## Outcomes

- Build a real PyO3 extension module with `maturin`, installed into this sandboxed container's own real Python interpreter, and measure that a real bytearray's own buffer address matches on both sides of the Python/Rust boundary, with no copy made.
- Measure that a real Python thread's own counter makes only a small amount of real progress while a real Rust function holds the GIL for its own CPU-bound work.
- Measure that the identical real Python thread's own counter makes dramatically more real progress once the identical Rust work runs inside `Python::detach`.
- State, from the PyO3 user guide and the `PyByteArrayMethods` documentation, the real rules this topic's own code measures directly.

## Internals

JNI (the `jni` crate) is the JVM's own equivalent boundary: a native Rust library compiled against the JVM's own C ABI, called from Java or Scala code through a generated binding layer, the way Spark accelerators such as Comet embed Rust-backed native code into a JVM process. The real question JNI raises that PyO3's own GIL story does not is ownership across two independently garbage-collected (or non-garbage-collected) memory spaces: who owns a given buffer, the JVM's own managed heap or Rust's own allocator, and when is it safe to free it. This sandboxed container has no JVM toolchain to build and run a real JNI example, so this is named here in prose rather than measured, continuing this domain's own rule of never faking a measurement it cannot actually run.

## In production

Real production PyO3 extensions (Polars, delta-rs, and pydantic-core all ship this way) go further than this topic's own `bytearray`-address comparison: a genuinely zero-copy exchange of columnar data crosses through the Arrow C Data Interface, a stable, language-independent C struct layout for an Arrow array, handed across the boundary wrapped in a `PyCapsule` so Python's own garbage collector knows when it is safe to free the underlying buffer. The real mechanism this topic measures (reading a real address straight through PyO3's own `PyByteArrayMethods::as_bytes`) is the same underlying idea in its simplest, directly measurable form.

## The frontier

Free-threaded CPython, officially supported from Python 3.14 under PEP 779, removes the GIL this topic's own measured claims depend on: in a free-threaded build, two Python threads can already run Python bytecode genuinely concurrently, without any extension needing to call `Python::detach` at all, which changes (and, for pure-Python code, mostly erases) the specific gap this topic measures between holding and releasing it. This sandboxed container's own interpreter is a standard, non-free-threaded build, so this topic's own measured 'held vs. released' gap is the gap that build genuinely has.

## Where this goes next

A correct boundary and a working extension both still live inside one crate; the next chapter turns to the question of where a crate's own boundary should actually sit once a real project has more than one of them.
