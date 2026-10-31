# Outline — de.zero-etl-replication

## Outcomes (from CHAPTER.md)

Name the real mechanism underneath "zero-ETL" (log-based CDC, managed) and state what is actually
removed (operated pipeline code) versus what is not (the mechanism itself); reproduce the shape of
a managed zero-ETL integration's cadence and prerequisites (an initial load, then a fixed
incremental window, point-in-time recovery required) against this sandbox's own Postgres; name the
three costs of giving up pipeline control (schema-change timing, filtering limits, vendor billing)
and decide, for a stated freshness requirement, whether a documented zero-ETL cadence can meet it.

## 9-step storyboard (full, ~15 min, closes the chapter)

1. **Hook.** A vendor's slide says their new integration moves data from a production database
   into the warehouse with "zero ETL." A team with a sub-minute fraud-detection freshness
   requirement adopts it and starts missing fraud for up to half an hour at a time.
2. **Predict: what did "zero" actually mean, and what number was always the real limit.**
   (Correct: "zero" meant zero pipeline *code*, not zero latency; the real limit was the vendor's
   documented incremental-replication window, which the team never read as a freshness SLA until
   it broke something.)
3. **Reveal: managed CDC from operational databases into analytics engines.** AWS's own Redshift
   documentation lists Aurora MySQL, Aurora PostgreSQL, DynamoDB, RDS for MySQL/Oracle/PostgreSQL
   and Oracle Database@AWS as supported zero-ETL sources; Microsoft Fabric mirroring is the
   comparable pattern on Microsoft's platform. No takeaway (reel test's reference step).
4. **Reveal: DynamoDB's own documented cadence.** An initial full export, then incremental
   replication every 15–30 minutes using DynamoDB's own incremental exports, with point-in-time
   recovery required as a prerequisite. Takeaway.
5. **Reveal: what "zero" actually hides.** Every "zero-ETL" integration is log-based CDC running
   inside a vendor's managed infrastructure; nothing about the underlying mechanism is new — what's
   removed is the pipeline code a team used to write and operate, not the pipeline. Takeaway.
6. **Reveal: reproducing the shape on this sandbox's own Postgres.** An initial full load, then a
   fixed incremental window using a WAL-position cursor, with the prerequisite (continuous WAL
   retention, Postgres's own analog to point-in-time recovery) checked before the integration can
   start — executed for real in examples.py. Takeaway.
7. **Reveal: the three costs of giving up pipeline control.** Schema-change timing (the vendor's
   schedule, not the team's migration plan), filtering limits (only what the managed integration
   exposes), and the cost model (a vendor's billing unit instead of a tunable pipeline). Takeaway.
8. **Recap.**
9. **Prove it.** A different team has a freshness requirement of exactly twenty minutes and is
   deciding whether DynamoDB's zero-ETL integration can meet it. Can it? (Correct: not reliably —
   the documented window is 15 to 30 minutes, so the worst case misses a twenty-minute requirement
   by up to ten minutes; a fixed window with no guarantee of its own lower bound can't be trusted
   against a requirement that falls inside its own documented range.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the documented cadence and prerequisites, by each vendor's own
documentation); Lab (a real initial-load-then-incremental-window reproduction against this
sandbox's own Postgres); Production (the fraud-detection freshness miss); Frontier (the three
costs of giving up pipeline control); Where this goes next (benchmarking a system honestly,
closing the course's run through the modern data stack and opening the next chapter).

## Bridge / handoff

Bridge (answers topic 10's handoff verbatim): "Everything in this section assumed data
engineering still moves the data at all. This topic is what happens when a vendor claims it
doesn't have to: 'zero-ETL' from Aurora, DynamoDB or a managed database straight into an analytics
engine. It is still log-based CDC underneath, now running on a vendor's schedule and rules instead
of a team's own, and the chapter closes on exactly what that trade costs."

Handoff (closes the chapter): "That closes this chapter's look at where the data stack is
heading. Everything in it, from a point-in-time join to a managed zero-ETL feed, is a claim
someone has to be able to test, not just trust. The next chapter is the method for testing claims
like that honestly: how to benchmark a system so the number you report is the number that's
actually true, starting with the first way a benchmark lies — the warm-up period you forgot to
discard."

## Concept ledger

Introduces: `zero-etl-is-managed-log-cdc`, `managed-cdc-cadence-and-prerequisites`,
`vendor-controlled-schema-filter-cost`.
Uses: `label-feature-timeline-join`, `feature-ttl-staleness` (topic 1); `grain-and-freshness-documentation`
(topic 8). Builds on Chapter 8's log-based-CDC topic (§8.2, not yet live) and Chapter 9's
Kafka/CDC propagation material (§9.2, not yet live) in prose only.
Declared: none beyond basic CDC vocabulary.

## Claims list (for FACT-CHECK.md)

1. AWS's own Redshift documentation: the following sources are currently supported for zero-ETL
   integrations — Aurora MySQL, Aurora PostgreSQL, DynamoDB, RDS for MySQL, RDS for Oracle, RDS for
   PostgreSQL, Oracle Database@AWS, plus named SaaS applications and self-managed databases.
2. AWS's own Redshift documentation: to create a zero-ETL integration, you specify an integration
   source and a Redshift data warehouse as the target; after an initial data load, the integration
   replicates data from the source to the target.
3. AWS's own DynamoDB developer guide: on activation, the integration exports the full DynamoDB
   table to populate the Redshift database, then incrementally replicates updates every 15–30
   minutes using DynamoDB's own incremental exports.
4. AWS's own DynamoDB developer guide: a zero-ETL integration between DynamoDB and Redshift
   requires the source DynamoDB table to have point-in-time recovery (PITR) enabled.
5. Microsoft's own Fabric documentation: mirroring for a SQL database in Fabric starts upon
   creation with no user action required, and there are no settings to configure it.
6. Microsoft's own Fabric documentation: mirrored data is stored as Delta Parquet files in
   OneLake.
7. (This course) every "zero-ETL" integration is log-based CDC running inside a vendor's managed
   infrastructure — the central, named claim this topic builds from the course's own prior
   mechanism (named forward, not yet live, per CHAPTER.md).
8. (This course) a sandbox reproduction of the shape of a managed zero-ETL integration's cadence
   and prerequisites — an initial full load, a fixed incremental window, a continuous-WAL-retention
   prerequisite — executed for real in examples.py against this sandbox's own Postgres.
9. (This course) the three named costs of giving up pipeline control: schema-change timing,
   filtering limits, and vendor billing replacing a tunable pipeline's cost model.
10. (This course) a documented 15–30 minute incremental window cannot reliably meet a stated
    freshness requirement that falls inside its own range (e.g. twenty minutes), since the
    window's own lower bound isn't guaranteed on any given cycle.
