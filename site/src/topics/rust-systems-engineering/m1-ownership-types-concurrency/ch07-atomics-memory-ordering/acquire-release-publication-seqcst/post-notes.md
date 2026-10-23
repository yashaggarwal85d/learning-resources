---
title: "Acquire/release publication, and when SeqCst is required"
---

## Outcomes

- Apply the publication pattern correctly: a `Release` store of the data-carrying flag, paired with an `Acquire` load of that same flag, establishes a happens-before edge and fixes the Chapter 7 opening topic's race.
- Explain why fixing only one side of a `Release`/`Acquire` pair does not establish that edge, and why `Relaxed` remains the right choice when nothing is actually being handed off between threads.
- State the one extra guarantee `SeqCst` gives beyond `Release`/`Acquire` — a single total order every thread agrees on — and why a store-load (Dekker / store-buffer) litmus test needs exactly that guarantee.
- Name `fence`/`compiler_fence` as carrying the same acquire/release handoff without being attached to a specific atomic operation, and name x86-TSO vs ARM as the reason an under-synchronized program can pass on one and fail on the other.

## Internals

The topic's hardest engineering decision wasn't which pattern to build — it was which claims a model checker can actually be trusted to verify. `loom` proved, correctly, that the `Release`/`Acquire` fix closes the previous topic's race, and that fixing only the write side leaves the race open, and that the store-buffering shape still breaks under `Release`/`Acquire` everywhere. But `loom`'s own test suite (`tests/spec.rs`) marks its `SeqCst` version of this exact store-buffering shape as `#[ignore]`, with a comment admitting loom "executes a permutation that isn't legal under `SeqCst` according to the spec." Running loom against the `SeqCst`-fixed version anyway reproduced that exact failure during this topic's own verification — a counterexample loom reported that the memory model itself does not actually permit. The honest fix was to stop asking the wrong tool the wrong question: that example is verified by compiling, and its correctness claim rests on the standard library's and the nomicon's own stated `SeqCst` guarantee (a single global total order), not on a model-check result that would have taught the wrong lesson.

## In production

The publication pattern — release-store a flag or pointer, then acquire-load it before touching what it published — is the mechanism underneath one-time lazy initialization, ready/not-ready handshakes, and lock-free single-producer/single-consumer handoffs throughout real systems code. `SeqCst`-dependent store-load patterns are much rarer in practice; most production code that reaches for `SeqCst` everywhere is paying a real, measurable cost (every strongly-ordered platform still has to emit fences for it) for a guarantee the code doesn't actually need, because a pairwise `Release`/`Acquire` edge already covers the overwhelming majority of real handoffs. Knowing the narrow, specific shape that genuinely requires a total order — not "I'm not sure, so I'll use the strongest one" — is what separates correct-and-fast lock-free code from correct-but-needlessly-slow code.

## The frontier

Mixed-ordering code that passes every test on this container's x86-64 target is not evidence the ordering choice was correct; x86-TSO's strong default guarantees can mask a missing `Acquire`/`Release` pairing that ARM's weaker model would expose immediately. This topic cannot demonstrate that gap directly (there is no ARM hardware in this environment), so the claim is cited from the nomicon rather than reproduced — a deliberately acknowledged limit, not a glossed-over one, exactly as earlier topics in this milestone scoped what this container's target can and cannot honestly show.

## Where this goes next

Milestone 1 ends here: every guarantee in this chapter was about memory becoming visible between threads that already exist and are already running. The next question is different in kind — what does it mean for a unit of work to not be running at all yet, and for something else entirely, not a thread, a scheduler, to decide when it starts again?
