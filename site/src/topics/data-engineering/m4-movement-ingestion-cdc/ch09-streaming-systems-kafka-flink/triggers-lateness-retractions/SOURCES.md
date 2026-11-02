Sources fetched and quoted for `de.triggers-lateness-retractions`.

## The Dataflow Model (Akidau et al., 2015, VLDB)

URL: https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf

Same PDF already fetched in topics `event-time-watermarks-completeness` and
`windowing-tumbling-sliding-session` (`sources/dataflow-model-paper.txt`, copied in unchanged).

> Discarding: Upon triggering, window contents are
> discarded, and later results bear no relation to previous results.

> Accumulating: Upon triggering, window contents
> are left intact in persistent state, and later results become a refinement of previous results.

> Accumulating & Retracting: Upon triggering, in
> addition to the Accumulating semantics, a copy of the
> emitted value is also stored in persistent state. When
> the window triggers again in the future, a retraction for
> the previous value will be emitted first, followed by the
> new value as a normal datum

> The watermark trigger fires when the watermark passes
> the end of the window in question.

> The Repeat call in the trigger is used to handle late
> data; should any data arrive after the watermark, they will
> instantiate the repeated watermark trigger, which will fire
> immediately since the watermark has already passed.

## Windows (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/operators/windows/

Same page already fetched in topic `windowing-tumbling-sliding-session`
(`sources/flink-windows.txt`, copied in unchanged; this topic quotes its Allowed Lateness
section).

> By default, late elements are dropped when the watermark is past the end of the window.

> a late but not dropped element may cause the window to fire again. This is the case for the EventTimeTrigger.

> These firings are called late firings, as they are triggered by late events and in contrast to the main firing
> which is the first firing of the window.

## Beam Programming Guide — Triggers (Apache Beam docs)

URL: https://beam.apache.org/documentation/programming-guide/#triggers

> Speculative firings that precede the watermark passing the end of the window
> to allow faster processing of partial results.

> Late firings that happen after the watermark passes the end of the window,
> to allow for handling late-arriving data

> If allowed lateness is set, the default trigger will emit new
> results immediately whenever late data arrives.

Notes on this topic's research: all three documents fetched clean on the first attempt. Beam is
cited here as a second, independent primary source for the same trigger/accumulation vocabulary
the Dataflow Model paper defines, per CHAPTER.md — Beam implements the Dataflow Model directly,
even though Beam itself is this chapter's skipped topic. Flink's own
discarding/accumulating/accumulating-and-retracting terminology is not exposed as a public API
the way Beam's is; Flink's allowed-lateness and late-firing mechanics are quoted instead, and the
accumulation-mode vocabulary itself is sourced from the Dataflow Model paper and Beam.
