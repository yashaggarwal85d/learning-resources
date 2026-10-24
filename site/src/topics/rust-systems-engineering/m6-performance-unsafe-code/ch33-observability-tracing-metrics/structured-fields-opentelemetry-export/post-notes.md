---
title: "Structured fields and OpenTelemetry export"
---

## Outcomes

- Measure that a real, structured field survives being summed directly and exactly, regardless of how differently each event's own message happens to be worded.
- Measure that the identical total, recovered only from each event's own rendered message, is genuinely wrong, since a real message can spell its own number out as a word instead of a digit.
- Measure that a real W3C Trace Context `traceparent` header round-trips its own trace id, span id, and sampled flag exactly, and genuinely rejects a real, malformed header rather than guessing at it.
- State, from the W3C Trace Context specification and the `tracing` crate's own documentation, the real rules this topic's own code measures directly.

## Internals

The syllabus names several further structured fields beyond this topic's own `attempt` field — `request_id`, `tenant`, `shard`, `partition`, `operation`, and `queue depth` — each a real, specific value a production system's own request handler would attach directly. Every one of them shares the identical real property this topic measures with `attempt`: a typed field survives being queried, filtered, or summed directly, where the same value embedded in a formatted sentence does not, regardless of which specific field it happens to be.

## In production

`tracing-opentelemetry` is the real crate that bridges a `tracing` span into a real OTLP (OpenTelemetry Protocol) export, sending it to a real collector over the network; W3C trace-context propagation across services, and across a real Kafka message's own headers, carries the identical `traceparent` string this topic's own code builds and parses, so a downstream service or consumer can continue the identical real trace. Neither a real OTLP collector nor a real Kafka broker is reachable from this sandboxed container, so both are named here in prose: this topic's own code implements and measures the real header format directly, which is the part of the mechanism that survives the network, rather than faking a network call this container cannot make.

## The frontier

`tracing`'s own `Value` trait is deliberately minimal, supporting only a small set of Rust primitives directly; the experimental `valuable` crate extends this to real, nested values (an array, a `Vec`, a `HashMap`) recorded as a structured field without first being flattened into text. This topic's own `attempt` field is a single scalar, which is already enough to measure the real property the syllabus names; a real, nested structured value is a genuinely further case beyond what this topic's own crate needs to demonstrate it.

## Where this goes next

A structured field survives being queried about one real event or one real span; it says nothing yet about the real shape of a question asked across many of them at once, the way an overload question always is.
