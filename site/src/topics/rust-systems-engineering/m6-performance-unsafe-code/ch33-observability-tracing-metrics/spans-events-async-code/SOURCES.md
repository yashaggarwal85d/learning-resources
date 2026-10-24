# Sources — Spans and events in async code

## Span in tracing — docs.rs
URL: https://docs.rs/tracing/latest/tracing/struct.Span.html
Fetched: 2026-10-24, cached at `sources/span.txt`.

> Holding
> the drop guard returned by Span::enter across .await points will
> result in incorrect traces.

> This means that another task will
> begin executing while remaining in the entered span. This results in
> an incorrect trace.

## Instrument in tracing — docs.rs
URL: https://docs.rs/tracing/latest/tracing/trait.Instrument.html
Fetched: 2026-10-24, cached at `sources/instrument.txt`.

> The attached Span will be entered every time the instrumented
> Future is polled or Dropped.

Last verified: 2026-10-24. Expert sign-off: pending.
