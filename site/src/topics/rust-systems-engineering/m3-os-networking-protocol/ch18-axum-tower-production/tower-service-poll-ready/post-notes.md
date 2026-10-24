---
title: "Tower Service and poll_ready backpressure"
---

## Outcomes

- Measure, with a real, minimal `tower::Service` implementation, that `poll_ready` and `call` are genuinely two separate steps, and that a caller only calls once it has observed a real `Ready` result.
- Measure that `ConcurrencyLimit`, `LoadShed`, `RateLimit`, and `Timeout` each really bound a different axis of a real call stack under load.
- Measure that `Buffer` genuinely enqueues calls beyond what the inner service's own readiness would otherwise allow — the hidden queue the syllabus calls out.
- State, from `tower::Service`'s own documentation, that an implementation is permitted to panic if `call` is invoked without first obtaining a real `Ready` result.

## Internals

The `poll_ready` example drives readiness with a raw `std::future::poll_fn` loop rather than `tower::ServiceExt::ready`, specifically so each individual `Pending` result is visible and countable — the claim under test is that a caller genuinely observes and waits through those `Pending` results, not merely that a convenience method happens to work underneath. The `ConcurrencyLimit` measurement holds its shared lock only long enough to reserve readiness and obtain the response future, then drops the lock before awaiting that future; an earlier draft held the lock across the whole call, which serialized every request and silently measured a concurrency of one regardless of the configured limit — a bug the measurement itself would otherwise have hidden rather than exposed. `LoadShed`'s own `poll_ready` always reports `Ready` immediately regardless of the inner service's own state; it defers the actual readiness check to call time, so the example calls both `ready()` and `call()` in sequence, matching `LoadShed`'s own documented behavior rather than the default contract.

## In production

The `Buffer` example deliberately nests a `ConcurrencyLimit` of one inside the `Buffer` rather than measuring `Buffer` alone, since `Buffer`'s own queue has no bound of its own in this example: what it demonstrates is that `Buffer`'s acceptance of a call is entirely decoupled from whatever bound the inner service enforces — exactly the hidden-queue hazard the syllabus calls out by name. In a real service, that means a `Buffer` sized without thought can absorb far more backlog than the team believes their `ConcurrencyLimit` or `RateLimit` layers are actually permitting, because `Buffer` sits in front of those layers and accepts work before they ever see it. The panic-permission quote matters for the same reason: it is not an implementation quirk of one particular service, but a documented, sanctioned property of the `Service` trait itself, which is why cloning a service and assuming the clone is ready just because the original was is explicitly called out in the trait's own documentation as a mistake.

## The frontier

All four of this topic's own measured claims run entirely within this container's own async runtime and wall-clock timing; none need a real network, root access, or hardware the sandbox lacks, unlike several topics in the two previous chapters that had to quote rather than measure a claim for exactly that reason. The `RateLimit` and `Timeout` measurements are folded into the same executed binary and the same reel step as `ConcurrencyLimit` and `LoadShed`, rather than given their own dedicated predict-and-reveal pair, since all four are independently measured, independently asserted claims about one syllabus clause naming four layers; splitting them further would not change what is actually being tested, only how many steps present it.

## Where this goes next

`Service` and `Layer` are the whole abstraction. The next question is whether a real framework actually uses them, or invents its own thing.
