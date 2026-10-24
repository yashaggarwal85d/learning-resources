# Sources — Structured fields and OpenTelemetry export

## Trace Context — W3C
URL: https://www.w3.org/TR/trace-context/
Fetched: 2026-10-24, cached at `sources/w3c-trace-context.txt`.

> version-format = trace-id "-" parent-id "-" trace-flags

> This is the ID of the whole trace forest and is used to uniquely identify a distributed trace through a system. It is represented as a 16-byte array, for example, 4bf92f3577b34da6a3ce929d0e0e4736.

> This is the ID of this request as known by the caller (in some tracing systems, this is known as the span-id, where a span is the execution of a client request). It is represented as an 8-byte array, for example, 00f067aa0ba902b7.

## tracing::field — docs.rs
URL: https://docs.rs/tracing/latest/tracing/field/index.html
Fetched: 2026-10-24, cached at `sources/fields.txt`.

> Spans and events may be annotated with key-value data, referred to as fields.

Last verified: 2026-10-24. Expert sign-off: pending.
