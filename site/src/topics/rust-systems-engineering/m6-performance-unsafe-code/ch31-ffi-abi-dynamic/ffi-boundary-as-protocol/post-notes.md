---
title: "FFI boundary as a protocol"
---

## Outcomes

- Build a real allocate/free pair crossing a real `extern "C"` boundary and measure that a correct pair is always accepted, a double free is genuinely rejected, and no handle is ever left outstanding, since this sandboxed container cannot add and link a genuinely separate compiled C library.
- Measure that a real status-code function leaves its out pointer genuinely untouched on a genuine failure, and writes the real value through it only on a genuine success.
- Measure that a real panic crossing a real `extern "C-unwind"` boundary is genuinely caught, and that the caller genuinely keeps running afterward.
- State, from the Rustonomicon and the Rust Reference, the real ownership and calling-convention rules this topic's own code measures directly.

## Internals

The syllabus names three further protocol questions this topic's own three measured boundaries do not cover directly: alignment (a type crossing the boundary must genuinely satisfy the foreign side's own alignment requirement, which `repr(C)` matches but a hand-written, mismatched struct can silently violate), thread affinity (some foreign state may only be safely touched from the one thread that created it, a constraint no type expresses), and whether a callback can arrive concurrently or reentrantly (a native library calling back into Rust while the call that registered it is still running, or from more than one thread at once, needs its own explicit synchronization). All three are real, common sources of FFI bugs that layout matching alone can never catch; the latter two are the specific subject of the chapter's own skipped "Callbacks and cross-boundary lifetimes" topic.

## In production

Real-world FFI almost never puts both sides of the boundary in the same crate the way this topic's own measured code does; a genuinely separate C library is linked in through a `-sys` crate convention, with `build.rs` plus `cc` or `pkg-config` driving the actual compilation and linking, and either a static or a dynamic link (or an explicit `dlopen` through the `libloading` crate) deciding when the foreign code is actually loaded. Hand-written bindings drift from the library they describe the moment either side changes, which is why real projects prefer generated bindings: `bindgen` for calling C from Rust, `cbindgen` for exposing Rust to C, and the `cxx` crate for a safer, two-way C++ interface. This is the chapter's own skipped "Binding generation and linking" topic's own subject, named here rather than measured.

## The frontier

A callback that a native library calls back into after the Rust function that registered it has already returned cannot safely capture a Rust stack frame, since that frame is gone; the real pattern is a stable heap allocation plus a context pointer (`Box::into_raw` on the Rust side, `Box::from_raw` to reclaim it), with explicit synchronization and explicit unregistration once the native side is done with it, and a hard rule that a panic must never be allowed to unwind through a foreign, non-Rust stack frame. Separately, current stable Rust no longer treats an ordinary panic across a plain, non-unwind `extern "C"` function as undefined behavior the way earlier Rust versions did: that specific case is now a defined, safe process abort. What remains genuinely undefined is the other direction: a foreign C++ exception actually entering Rust code, which this topic's own measured code never attempts, since undefined behavior is never something a correct measurement can trust once triggered.

## Where this goes next

A protocol for who allocates, who frees, and how an error or a panic crosses the line holds for any foreign boundary at all; the next question is what that boundary actually looks like for the two real runtimes this domain's own data platforms are built around.
