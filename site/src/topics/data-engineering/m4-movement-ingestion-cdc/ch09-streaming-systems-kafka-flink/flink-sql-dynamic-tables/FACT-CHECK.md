# Fact-check — Flink SQL and dynamic tables

| Claim | Source | Status |
|---|---|---|
| A database table results from a stream of INSERT, UPDATE, and DELETE DML statements, often called a changelog stream | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| Processing streams with a relational query requires converting a stream into a table, interpreting each record as an INSERT on the resulting table | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| A query that only appends to its result table has a changelog consisting only of INSERT changes; a query that updates previously emitted results has a changelog containing INSERT and UPDATE changes | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| An append-only stream converts a dynamic table by emitting only the inserted rows | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| A retract stream encodes an INSERT as an add message, a DELETE as a retract message, and an UPDATE as a retract of the old row plus an add of the new row | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| An upsert stream requires a unique key, encoding INSERT and UPDATE as upsert messages and DELETE as delete messages, with updates needing only a single message | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| Regular joins are the most generic join type, where any new record or change on either side affects the entirety of the join result, requiring both sides kept in Flink state forever | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| An interval join requires at least one equi-join predicate and a join condition bounding time on both sides; it only supports append-only tables with time attributes | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| Temporal joins correlate each probe-side row to the build-side's relevant version; unlike regular joins, previous temporal results aren't affected by build-side changes; unlike interval joins, they define no time window | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| A lookup join enriches a table with data queried from an external system, requiring one table with a processing-time attribute and the other backed by a lookup source connector | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| The delta-join optimizer strategy defaults to AUTO, which tries a delta join first and falls back to a regular join if it fails | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| ML_PREDICT has been supported in Flink SQL since version 2.1; delta join was introduced in Flink 2.1 as a bidirectional lookup-based join replacing regular-join state | Apache Flink 2.2.0 release announcement | Confirmed, quoted verbatim |
| A materialised table's data freshness is a target, not a guarantee, that the engine attempts to meet by deriving a refresh pipeline | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| CONTINUOUS mode launches a streaming job that continuously refreshes the materialised table; FULL mode has the workflow scheduler periodically trigger a batch job | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| Process table functions have access to Flink's managed state, event-time and timer services, and underlying table changelogs | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| FROM_CHANGELOG converts an append-only table with an explicit operation-code column into a potentially updating dynamic table | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| TO_CHANGELOG converts a dynamic table into an append-only table with an explicit operation-code column, emitting every input row as an INSERT-only row | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| ML_PREDICT is a table-valued function for model inference in SQL, supporting append-only tables only, since CDC tables produce non-deterministic results | Apache Flink 2.3 docs | Confirmed, quoted verbatim |
| Append, upsert, and retract modes agree on the final table from identical input events, while emitting a different number of messages per change | Modeled and measured directly in `examples.py` (`apply_changelog`) | Confirmed by the toy model's own real run |
| A regular join's state grows monotonically while an interval join's state plateaus once its time window fills | Modeled and measured directly in `examples.py` (`regular_join_state_size`, `interval_join_state_size`) | Confirmed by the toy model's own real run |
| A tight freshness target selects continuous refresh mode; a loose target selects full refresh mode | Modeled and measured directly in `examples.py` (`choose_refresh_mode`) | Confirmed by the toy model's own real run |

## Red-team

- **Is "delta joins and multi-way joins" one mechanism or two, and does this topic conflate
  them?** They're kept distinct. Delta joins are sourced from the `table.optimizer.delta-join.strategy`
  configuration reference and the 2.2.0 release announcement's description of reusing source-table
  data. Multi-way joins are covered via the Joins docs page's own mention of the MultiJoin operator
  for reducing state across multiple chained regular joins — a related, state-reducing idea, but a
  distinct mechanism, disclosed as such in SOURCES.md rather than treated as interchangeable.
- **Are FROM_CHANGELOG/TO_CHANGELOG and ML_PREDICT's version numbers (2.3, 2.1+) verified at
  build time as CHAPTER.md instructs, or just copied from the syllabus?** Verified directly:
  FROM_CHANGELOG/TO_CHANGELOG were fetched live from the 2.3 release docs (confirming they exist
  in that release) and ML_PREDICT's "since version 2.1" is a direct quote from the 2.2.0 release
  announcement, not an assumption carried over from the syllabus text.
- **Does the toy changelog-mode model's "retract costs more" claim generalize, or is it an
  artifact of this specific input?** It's the documented mechanism, not an artifact: retract mode
  always emits two messages for an update (one retract, one add) while upsert always emits one,
  by the sourced definitions above — the toy model's five-event input exercises the general rule,
  not a special case.
- **Is the regular-vs-interval join state model realistic, or does it trivially assume the
  conclusion?** It directly implements the sourced mechanism (a regular join keeps every row ever
  seen; an interval join drops rows once they age past the window) and measures the one property
  claimed: unbounded growth versus a plateau. Disclosed as a deliberately simplified toy model, not
  a port of Flink's actual join-state implementation.
- **Does this topic overstate how settled delta joins and multi-way joins are?** No — post-notes.md
  explicitly flags both as newer, currency facts to reconfirm, not settled, stable mechanics on
  the same footing as the regular/interval/temporal/lookup join taxonomy.
