---
title: "Middleware ordering as semantics"
---

## Outcomes

- Measure, by reproducing `tower::ServiceBuilder`'s own documented order example with real code, that order changes how many concurrent callers are admitted immediately, matching the claimed figures closely.
- Measure that a real deadline placed outside a slow auth step genuinely bounds it, while the same deadline placed only around the handler behind it never sees the auth step at all.
- Measure that a real retry layer above a non-idempotent handler genuinely re-executes its own side effect once per attempt, and that a real idempotency key prevents that.
- State, from `tower::ServiceBuilder`'s own documentation, that the order layers are added changes how requests are handled.

## Internals

The order measurement counts how many of a large batch of concurrent callers get their own `ready()` call to return almost instantly, rather than how many calls run concurrently at the innermost service, since both orderings still cap the innermost service's own concurrency at ten — the real, caller-visible difference the documentation describes is about admission, not execution concurrency. The measured admission counts (111 and 10) land almost exactly on the documentation's own claimed figures (110 and 10); the one-off difference is attributed to the fast-admission threshold occasionally catching one additional caller whose own scheduling happened to land just inside that window. The timeout-placement example reuses the exact same two durations in both orderings, so the only variable between the two measured runs is which layer wraps which.

## In production

The idempotency fix here is a single atomic boolean guarding the side effect — the simplest possible real idempotency check, deliberately chosen over a more realistic persisted idempotency-key store, since the claim under test is that some real guard changes the outcome, not what a production-appropriate guard's own storage layer looks like. In a real service, that guard is usually a key supplied by the caller, checked against a durable store before the side effect runs, so a retried request with the same key is recognized rather than re-executed — but the shape of the fix is the same: something has to remember the attempt already happened.

## The frontier

The tracing-layer-placement claim named in the syllabus — where the tracing layer sits decides whether a span describes one logical request or one retry attempt — is discussed in prose only, not measured, since reproducing it needs a real tracing subscriber capturing span structure across retried calls, a layer of infrastructure beyond this topic's own three measured claims. All three of this topic's own measured claims run entirely within this container's own async runtime and wall-clock timing, continuing the pattern from topics 45 and 46 of measuring every claim directly.

## Where this goes next

This chapter was about a request arriving at a service boundary, correctly bounded and correctly ordered. The next is about what sits behind that boundary once the request lands — the storage engine's own physical layout, starting with a single page.
