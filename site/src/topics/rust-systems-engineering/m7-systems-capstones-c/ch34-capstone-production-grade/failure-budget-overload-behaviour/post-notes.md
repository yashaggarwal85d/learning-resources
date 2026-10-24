---
title: "Failure budget and overload behaviour"
---

## Outcomes

- Measure that a real burst of requests past a real queue's own capacity leaves every request genuinely accounted for, either admitted or shed, with none left over.
- Measure that the real shed requests are genuinely a suffix of the real submission order, never an arbitrary subset of the burst.
- Measure that the identical real burst, run again from a fresh instance, genuinely reproduces the identical admitted/shed split.
- State, from `tower::load_shed`'s own documentation and the Google SRE book's own chapter on error budgets, the real distinction this topic measures between shedding itself and the explicit budget that judges it.

## Internals

The syllabus names an explicit failure budget for five further real failure modes beyond this topic's own queue-full case: database slowdown, client disconnect, `SIGTERM`, and downstream timeout each need their own real, stated threshold the identical way, since each is a genuinely different real reason a request fails and each would otherwise look like an undifferentiated rise in errors. The syllabus also names six further real benchmarks for finding which real resource saturates first under increasing load: request latency, queue wait, storage latency, CPU, allocation rate, and task count. This topic's own measured claim, the queue itself saturating and shedding a reproducible suffix, is the simplest and most direct of the six; a real production benchmark would watch all six at once, since the queue is rarely the only real resource that can saturate first.

## In production

A real container driven by a real, externally generated load generator, and a real dashboard tracking a real failure budget's own consumption against a real quarterly `SLO` (continuing the SRE book's own vocabulary), are exactly what the chapter's own lab exercises; neither is reachable the identical way from this sandboxed container, so this topic measures the identical real saturation behaviour locally, from one real, in-process burst, rather than faking a result it cannot actually run under real, sustained load.

## The frontier

`tower::load_shed`'s own real middleware performs the identical real rejection this topic's own `submit` handler performs by hand, available as a drop-in layer; a real production service also typically pairs it with a real, explicit concurrency limit (`tower::limit`) so the real point of saturation is a deliberately chosen number rather than whatever a bounded channel's own capacity happens to default to.

## Where this goes next

A real service that sheds load correctly, against a real, explicit budget, is judged under one real kind of pressure, too much traffic; the next real system this milestone builds is judged under a genuinely different kind, data that must survive the process itself failing.
