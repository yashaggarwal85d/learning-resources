---
title: "Atomicity versus ordering"
---

## Outcomes

- State the difference between atomicity (no torn updates) and ordering (visibility between threads) in one sentence each, and explain why a program can have one without the other.
- State that Rust's atomics follow the C++20 memory model (minus `consume`): happens-before, per-location agreement on a total order of writes, and data races as undefined behavior.
- Name the Linux kernel's own memory model (LKMM) as a distinct, stricter model that matters only for kernel Rust, deferred to a later chapter.

## Internals

Proving an ordering violation honestly is harder than it looks: real hardware doesn't reliably reorder memory accesses on every run, and x86-64 (this container's target) is particularly strongly-ordered by default, so a bare stress loop that "hopes" to catch a relaxed-ordering bug can run millions of times without ever showing it. This topic uses `loom` instead, a model checker purpose-built for exactly this: rather than running a program once with real threads, it drives the program's logic through every legal interleaving the Rust memory model actually permits (within configured bounds), and panics the instant one of them violates an assertion. Finding the relaxed-publication violation this way is strictly stronger evidence than any number of real runs, because it answers "can this happen" rather than "did this happen to happen."

## In production

Real lock-free and concurrent-data-structure code leans on exactly this chapter's vocabulary constantly: a lock-free queue, a `once`-style lazy initializer, or a reference-counted handoff all reduce, at their core, to some version of the publication pattern this chapter's running example used — write some data, then signal that it's ready. Getting the ordering wrong in real code is a genuine, documented source of bugs that pass every test on x86 and then fail in production on ARM servers or mobile devices, which is precisely why `loom` (and tools like it) exist as a standard part of serious unsafe/lock-free Rust development, not an academic curiosity.

## The frontier

Rust's own specification of its memory model is, in a strict sense, still "aspirational" in places: the language reference explicitly defers to the C++20 model rather than fully formalizing its own, and known edge cases (particularly around mixed-size atomic accesses, and interactions between atomic and non-atomic accesses to overlapping memory) remain areas of ongoing specification work rather than fully settled law. This is a deliberate, acknowledged gap in the ecosystem, not something this topic glosses over.

## Where this goes next

Atomicity and ordering are each precise now, and so is the vocabulary — happens-before, a data race as real undefined behavior. The one pattern worth building correctly, every time, is publication: writing some data, then telling another thread it's ready. The next topic builds exactly that, and the one case where even that isn't strong enough.
