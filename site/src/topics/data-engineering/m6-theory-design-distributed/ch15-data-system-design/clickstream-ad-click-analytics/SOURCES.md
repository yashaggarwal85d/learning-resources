# Sources — de.clickstream-ad-click-analytics

`CHAPTER.md` names several candidate sources for this topic (the Dataflow Model paper, Kafka's
and Flink's documentation, a public pipeline write-up, Kreps's Lambda-architecture post) and
leaves the builder to select and verify which at research time. This topic quotes Apache
Flink's own documentation (the mechanism this design's sessionisation and late-event handling
are built on) and Jay Kreps's "Questioning the Lambda Architecture" (the cost argument behind
the streaming-plus-reconciliation decision), both fetched and verified directly — satisfying
the ≥2-source rule without stretching a third fetch that would only restate the same two points.
Chapter 9's streaming-correctness topics and Chapter 14's exactly-once topic are prior topics on
this same site, referenced via `uses`, not external sources.

## Apache Flink, "Windows" (DataStream API documentation)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/operators/windows/
Fetched: 2026-10-30.

Quotes:
> The session windows assigner groups elements by sessions of activity. Session windows do not overlap and do not have a fixed start and end time, in contrast to tumbling windows and sliding windows. Instead a session window closes when it does not receive elements for a certain period of time, i.e., when a gap of inactivity occurred.

> By default, late elements are dropped when the watermark is past the end of the window. However, Flink allows to specify a maximum allowed lateness for window operators.

Items: (1) a session is defined mechanically as a gap of inactivity, not a fixed clock window —
exactly the sessionisation this design's pipeline strip performs; (2) a late event is dropped
once the watermark has passed, unless the design states an explicit allowed lateness — the
mechanism behind "what a late event does to an already-published session count."

## Jay Kreps, "Questioning the Lambda Architecture" (O'Reilly Radar, 2014)

URL: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
Fetched: 2026-10-30.

Quotes:
> The problem with the Lambda Architecture is that maintaining code that needs to produce the same result in two complex distributed systems is exactly as painful as it seems like it would be. I don't think this problem is fixable.

> It is true that the existing set of stream processing frameworks are less mature than MapReduce, but there is no reason that a stream processing system can't give as strong a semantic guarantee as a batch system.

Items: (1) running the same logic twice, once in a stream engine and once in a batch engine, has
a real, unfixable maintenance cost — the dual-logic drift this design's reconciliation path has
to budget for; (2) a streaming path's weaker guarantee is a property of today's tooling, not a
law of streaming itself — which is why this design states the streaming count as fast and
approximate by choice, not by necessity, and overrides it with the batch figure for anything
billed.
