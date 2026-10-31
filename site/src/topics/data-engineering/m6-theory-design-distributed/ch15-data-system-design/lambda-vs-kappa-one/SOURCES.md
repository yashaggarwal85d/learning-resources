# Sources — de.lambda-vs-kappa-one

`CHAPTER.md` names Kreps's "Questioning the Lambda Architecture" (O'Reilly Radar, 2014), Marz's
original Lambda Architecture description, the Dataflow Model paper, Flink's and Spark's
documentation for unified execution, and Chapter 3 §3.3's and Chapter 9 §9.1's own material as
candidates, and explicitly requires this topic to check and quote Kreps's exact sentence on
dual-logic drift. This topic quotes Kreps's own article (the dual-logic-drift sentence
`CHAPTER.md` itself names, plus his own proposed single-log-replay alternative, the Kappa
design) and Apache Flink's own execution-mode documentation (the unified-engine guarantee this
topic's "drift reduced, not removed" claim is built on) — two sources, satisfying the ≥2-source
rule. Chapter 3 §3.3's Lambda-and-Kappa definitions and Chapter 9 §9.1's retention material are
prior topics on this same site, used and not re-taught, not external sources.

## Jay Kreps, "Questioning the Lambda Architecture" (O'Reilly Radar, 2014)

URL: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
Fetched: 2026-10-30.

Quotes:
> The problem with the Lambda Architecture is that maintaining code that needs to produce the same result in two complex distributed systems is exactly as painful as it seems like it would be. I don't think this problem is fixable.

> Use Kafka or some other system that will let you retain the full log of the data you want to be able to reprocess and that allows for multiple subscribers. For example, if you want to reprocess up to 30 days of data, set your retention in Kafka to 30 days.

Items: (1) the exact sentence `CHAPTER.md` itself names and requires this topic to quote — the
named author's own stated, unfixable cost of running two code paths that must agree; (2) Kreps's
own proposed alternative (retain the log, replay it through an improved copy of the same job) —
the mechanism this topic's own Kappa design is built on, in the same author's own words.

## Apache Flink Documentation, "Execution Mode (Batch/Streaming)"

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/execution_mode/
Fetched: 2026-10-30.

Quotes:
> Apache Flink's unified approach to stream and batch processing means that a DataStream application executed over bounded input will produce the same final results regardless of the configured execution mode.

Items: the named mechanism behind this topic's "a unified engine reduces drift without removing
the second path" claim — one program, run in either mode, is documented to produce the same
result, which is the guarantee a unified engine offers that two independently-maintained code
bases cannot.
