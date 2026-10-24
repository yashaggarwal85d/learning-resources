---
title: "Miri and sanitizers for UB detection"
---

## Outcomes

- Build a real, small interpreter over a fixed, real sequence of synthetic memory operations, with a real bounds checker run only on the one branch a given simulated run actually takes, since this sandboxed container cannot reliably run a real nightly Miri session.
- Measure that the checker genuinely finds no violation on a branch whose every real operation stays inside the buffer.
- Measure that the identical checker genuinely catches a real, out-of-bounds operation the moment a run actually takes the branch that holds it.
- Measure that a run taking the safe branch genuinely examines none of the other branch's own operations, which is Miri's own real, stated path limitation, modeled directly.
- State, from Miri's own README and the Rust Unstable Book's own sanitizer page, the real rules this topic's own code measures directly.

## Internals

Miri's own real detection list reaches far beyond the one bounds-checking model this topic builds: out-of-bounds access and use-after-free, invalid use of uninitialized data, violated intrinsic preconditions, insufficiently aligned access, violated type invariants (the identical `bool` and enum-discriminant rules topic 78 measured directly), and, under its own experimental modes, data races and violations of the Stacked Borrows or Tree Borrows aliasing rules. All of it is still subject to the identical real limitation this topic measures: Miri interprets one actual execution and reports what that execution did, never every execution the program's own branches could have taken. Running the identical test suite with different random seeds (`-Zmiri-seed`), or under Miri's own `-Zrandomize-layout`, explores more executions without changing this fundamental limit.

## In production

`cargo +nightly miri test` is the real command that runs a project's own test suite under Miri in CI; it needs the nightly toolchain because Miri reaches into compiler internals (MIR) that are not part of Rust's own stability guarantee. The `-Zsanitizer` flag remains nightly-only overall, though the Tier 2 `x86_64-unknown-linux-gnuasan` target now lets AddressSanitizer run from a stable compiler without a nightly toolchain at all; AddressSanitizer and LeakSanitizer are close to full stabilization, while MemorySanitizer and ThreadSanitizer still need an instrumented standard library to work correctly.

## The frontier

A sanitizer is a genuinely different tool from Miri, not a faster version of the identical one: it instruments real, compiled machine code to catch a real memory error at native execution speed, which is why it can run a full, realistic program (including real FFI and real I/O) that Miri's own platform-independent interpreter cannot reach at all. Its own blind spots are different too: a sanitizer only instruments the code it compiles through it, same as Miri only checks the path it runs, but a sanitizer's instrumentation can miss errors in code it never instrumented (an uninstrumented library, for instance), where Miri's own interpreter sees every operation in the code it runs directly.

## Where this goes next

This chapter measured what a safety contract has to guarantee, what makes a value valid in the first place, and how a real checker catches a violation only on the path it actually runs; the next chapter turns to a boundary where Rust's own rules stop applying at all, because the code on the other side of it was never written in Rust.
