# Chapter 31 — FFI, ABI, Dynamic Linking, and Native Interop (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 6, *Performance, Unsafe Code, FFI, Build, and Observability* (its third chapter). Chapter 31 has one section: 31.1 *Native interop* (two full topics: the FFI boundary as a protocol, and embedding Rust in Python and the JVM; two skipped topics, already recorded in `syllabus/review-notes/rust-cuts.md` under "Chapter 31 — FFI, ABI, Dynamic Linking, and Native Interop (2 of 4)": binding generation and linking, and callbacks and cross-boundary lifetimes). The chapter's own lab exercise (wrap a tiny C library that allocates and frees buffers, add safe ownership, introduce a callback with explicit lifetime handling, run under sanitizers, then expose an Arrow array to Python through PyO3 without copying) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter's own last topic: topic 79, *Miri and sanitizers for UB detection*, which closed Chapter 30 by naming this chapter's own first question directly: a boundary where Rust's own rules stop applying at all, because the code on the other side of it was never written in Rust.

This file is the contract the chapter's two topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 30 measured what it takes for Rust's own rules — a documented safety contract, a validity invariant, a real checker — to hold inside Rust. This chapter's own opening sentence states its thesis directly: the FFI boundary is a protocol, not just `repr(C)`. Matching a C struct's own layout is necessary but nowhere near sufficient: crossing into or out of foreign code is a real, unwritten-by-the-compiler agreement about who allocates and who frees a given buffer, how an error is represented when there is no `Result` on the other side, whether an unwinding panic is allowed to reach a C frame (it is not, unless the boundary is explicitly `extern "C-unwind"`), which thread is allowed to touch a given piece of state, and whether a callback can arrive while the call that registered it is still running, or from more than one thread at once. None of this is a type the compiler checks; every one of these is a real promise a human has to keep by hand, on both sides of the boundary, continuing this domain's own deeper theme that unsafe code is a proof obligation, now extended to a boundary where only one side is even written in a language that has the concept.

By the end of this chapter's two topics, the learner can: name the specific protocol questions a real FFI boundary has to answer before a single `extern` function is safe to call, and build a real, small model proving that an ownership/error/unwinding/threading protocol is upheld across a real boundary; and build a real, working PyO3 extension exposing Rust data to Python, measuring a real zero-copy exchange and a real GIL-release boundary around Rust work, continuing this chapter's own real-model convention into the one real cross-language toolchain this sandboxed container can actually build and run.

## A.2 The order of ideas, and why

1. **FFI boundary as a protocol** (topic 80, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real, minimal `extern "C"` boundary with an explicit allocate/free contract, a real error-representation convention, and `extern "C-unwind"`, measuring that the protocol is genuinely upheld (ownership transferred exactly once, an error genuinely surfaced through the chosen representation, a panic genuinely caught before it would unwind into a foreign frame) rather than merely declared.
2. **Embedding Rust in Python and JVM** (topic 81) — builds a real PyO3 extension (the one real cross-language toolchain this sandboxed container can actually install and build), measuring a real zero-copy data exchange and the real GIL-release discipline topic 80's own protocol language already set up; the JVM/JNI half of the syllabus clause is covered in prose (post-notes), since this sandboxed container cannot install a JVM toolchain, continuing this domain's own rule of never faking a measurement it cannot actually run.
3. **Binding generation and linking** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.
4. **Callbacks and cross-boundary lifetimes** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.

*(The chapter's own lab — wrap a tiny C library that allocates and frees buffers, add safe ownership, introduce a callback with explicit lifetime handling, run under sanitizers, then expose an Arrow array to Python through PyO3 without copying — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own two full topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: a real, minimal boundary and a real, working extension

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–30's conventions. Topic 80 cannot call into a real, separately compiled C library inside this sandboxed container's own constrained build step, so it instead builds a real `extern "C"` boundary inside the same crate (a real `#[no_mangle] extern "C" fn` on one side, a real caller using it only through its own declared signature on the other, exactly as a genuinely separate C caller would), continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith; this is a real ABI boundary (the function is genuinely called through its own `extern "C"` signature, not through ordinary Rust call conventions) even though both sides happen to be compiled by `rustc` here. Topic 81 can and does install and build a real PyO3 extension, since `pip`/`maturin` are available in this sandboxed container, and measures a real Python-facing module built from real Rust code.

- **Topic 80** builds a real buffer-handle type crossing an `extern "C"` boundary with an explicit allocate/free pair (a double-free or a leak is measured directly as a real, counted violation of the protocol, not asserted away), a real two-variant result representation standing in for "how errors are represented" when there is no `Result` on the wire, and a real `extern "C-unwind"` function that lets a genuine panic cross the boundary as a defined abort/unwind rather than the undefined behavior an ordinary `extern "C"` panic-unwind would cause.
- **Topic 81** builds a real, minimal PyO3 extension module (built with `maturin develop` or an equivalent direct `pyo3`/`cdylib` build this sandboxed container can run), exposing one real function that accepts and returns data without a copy (measured by comparing a real buffer's own memory address on both sides of the call) and one real function demonstrating the GIL being explicitly released around real Rust-side work.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024) plus, for topic 81, a real Python interpreter and `pyo3`/`maturin` installed in this sandboxed container. This chapter needs no root access beyond installing `maturin`/`pyo3`'s own build dependencies, no real network I/O, and no real JVM toolchain (covered in prose only); "the boundary," "the allocate/free pair," and "the PyO3 module" are all real, working code exercised directly, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.4 Terms and notation (continuing Chapters 1–30's vocabulary)

Everything in Chapters 1–30 §A.4 still applies. This chapter adds:

- **FFI boundary**: the real, explicit point where a function call crosses from Rust into foreign code or back, governed by a real but unenforced protocol beyond mere layout compatibility.
- **Ownership protocol**: the real, explicit answer to who allocates a given piece of memory and who is responsible for freeing it, which must be upheld by convention on both sides of the boundary since the compiler cannot check it across languages.
- **`extern "C-unwind"`**: the real, stable calling convention that lets a panic unwind across an FFI boundary in a defined way; an ordinary `extern "C"` function that panics and unwinds across it is undefined behavior.
- **Thread affinity**: the real, explicit requirement that some foreign state may only be safely touched from one particular thread (often the one that created it), a constraint the type system does not express on its own.
- **GIL (Global Interpreter Lock)**: the real lock CPython uses to serialize access to Python objects; a PyO3 extension's own Rust-side work can explicitly release it to run real Rust code concurrently with other Python threads.
- **Zero-copy exchange**: the real sharing of one buffer's own underlying memory across a language boundary (for example via the Arrow C Data Interface or a `PyCapsule`) without a real duplicate allocation and copy.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "who is on the hook for freeing this" for the ownership protocol; "letting a real failure cross back in a way the caller can see" for the error representation; "a defined way to let a crash cross the line, instead of an undefined one" for `extern "C-unwind"`; "handing the other language the same memory, not a copy of it" for zero-copy exchange; "stepping out of the way so other Python work can run" for releasing the GIL.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A boundary-line glyph**: a real, simple vertical divider marking the FFI boundary directly, with a labeled arrow crossing it for a call, a return, or a callback.
- **A handle-ownership glyph**: a real small token passed across the boundary line, shown held by exactly one side at a time, for the allocate/free protocol.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–30 §A.6, with this chapter's own explicit addition: topic 80's FFI boundary is built as a real `extern "C"` function inside the same crate rather than a genuinely separate compiled library, since this sandboxed container's own build step cannot add and link a second, separately compiled C library; this is disclosed directly in `OUTLINE.md` and `post-notes.md` rather than presented as a limitation the learner would not otherwise know about. Topic 81 installs and builds a real PyO3 extension using whatever Python/`maturin` toolchain this sandboxed container actually has available; if that toolchain cannot be installed, the topic falls back to the identical same-crate `extern "C"` pattern topic 80 established and states the JVM/Python toolchain limitation directly in `post-notes.md`, continuing this domain's own rule of never faking a measurement it cannot actually run. Executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 6, title: 'Performance, Unsafe Code, FFI, Build, and Observability' }` and `chapter: { number: 31, title: 'FFI, ABI, Dynamic Linking, and Native Interop', section: '31.1' }` (this chapter's own two full topics are both in section 31.1). A cargo crate under `examples/` is used; no root access beyond ordinary package installation, no real network I/O beyond fetching sources, and no real JVM toolchain are needed for the chapter's own measured claims.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–30's own declared list. Topic 80's own first topic in this chapter reuses no earlier chapter's own introduced id directly in its own measured code, since this chapter changes subject from soundness within Rust to a boundary outside it; its own bridge instead names this chapter's own opening question in prose. Topic 81 reuses topic 80's own introduced id directly, continuing the identical within-chapter pattern Chapter 30 established.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `an-ffi-boundary-is-a-protocol-not-just-layout` | 80 | A real `extern "C"` boundary genuinely upholds its own ownership, error-representation, and panic-unwinding protocol, which is a real, unenforced agreement beyond mere `repr(C)` layout compatibility. |
| `pyo3-exchanges-data-without-copying-it` | 81 | A real PyO3 extension genuinely shares one buffer's own underlying memory across the Python/Rust boundary rather than duplicating it, while explicitly releasing the GIL around the real Rust-side work that does not need it. |

## A.8 Bridges and handoffs

- **80** bridges from Chapter 30's own real handoff (this chapter's own first sentence names it directly: a boundary where Rust's own rules stop applying at all, because the code on the other side of it was never written in Rust) and needs no earlier chapter's own introduced concept directly, since it changes subject to a boundary outside Rust itself. Hands off within the chapter to topic 81: "A protocol for who allocates, who frees, and how an error or a panic crosses the line holds for any foreign boundary at all; the next question is what that boundary actually looks like for the two real runtimes this domain's own data platforms are built around."
- **81** bridges from topic 80's own measured boundary-protocol model directly and hands off to the next chapter: "A correct boundary and a working extension both still live inside one crate; the next chapter turns to the question of where a crate's own boundary should actually sit once a real project has more than one of them."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Rust Reference's own FFI-related pages, or the `std::ffi`/`extern` documentation, and the Rustonomicon's own FFI chapter, for topic 80's own concrete reference on calling conventions, `extern "C-unwind"`, and the real ownership/panic rules at an FFI boundary, if fetchable.
- The PyO3 project's own documentation (`pyo3.rs`) on the GIL, `Python<'py>` tokens, and zero-copy exchange via the Arrow C Data Interface/`PyCapsule`, for topic 81's own concrete reference, if fetchable.
