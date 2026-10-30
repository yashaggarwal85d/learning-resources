# Fact-check — de.ingestion-modes-push-vs

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/` or from re-running `examples.py`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Spark Structured Streaming's Result Table is updated on a trigger interval ("every trigger interval (say, every 1 second), new rows get appended to the Input Table, which eventually updates the Result Table"). | Confirmed | `sources/spark-structured-streaming.txt`, quoted in full. |
| 2 | Kafka chose a pull-based consumer over a push-based one because a push-based system can overwhelm a slow consumer, while a pull-based consumer falls behind and catches up instead. | Confirmed | `sources/kafka-design-pull.txt`, quoted in full. |
| 3 | A naive pull-based consumer can busy-wait in a tight loop when the broker has no data; Kafka's long-poll parameter fixes this by letting the request block until data arrives. | Confirmed | `sources/kafka-design-pull.txt`, quoted in full. |
| 4 | One specific simulated order (arriving at t≈3640s into a 7200s window) is delivered ~3560s later under an hourly batch poll, ~20s later under a 30s micro-batch poll, and under 1s later under a 1s streaming poll. | Confirmed, executed | `examples.py: batch_vs_microbatch_vs_streaming`, run three times with the fixed seed (42), identical result each run. |
| 5 | Across all 300 simulated orders, average end-to-end delay is roughly 1981s for batch, 14s for micro-batch, 0.5s for streaming. | Confirmed, executed | Same function, same three runs. |
| 6 | Batch delivers roughly 100 rows per tick on average, micro-batch roughly 1.2, streaming roughly 0.04. | Confirmed, executed | `examples.py: burst_size_per_delivery`, run three times, identical result each run. |
| 7 | The moving-parts counts (1 for batch, 2 for micro-batch, 3 for streaming) are a disclosed architectural tally, not a measurement. | Confirmed, as scoped | `examples.py: moving_parts_by_mode`'s own docstring and the reel/post-notes both disclose this is a named part count, never presented as a benchmark number. |

## Currency check

- Kafka 4.4 and Spark 4.2 are the current releases at planning time (per the chapter plan's own version table); the pull-vs-push design rationale and the Structured Streaming trigger model are long-standing architectural decisions, not version-specific features. No currency risk.
- The `#design_pull` fragment on the old `kafka.apache.org/44/documentation.html` URL now client-side-redirects to `kafka.apache.org/44/design/design/`; the direct URL was used for the fetch and is what `SOURCES.md` cites, so the citation will not break when the redirect page's JS changes again.

## Red team

1. **"Is the Poisson-arrival simulation a fair stand-in for a real 'orders' stream, or does it cherry-pick a rate that flatters the comparison?"** The simulation's only free choice is the mean rate (300 orders / 7200s); the three cuts are then the *same* fixed arrival trace (one random seed, generated once) read by three different poll interval sizes, so the comparison is apples-to-apples by construction — no mode gets a friendlier trace. Re-running with seed=7 and seed=99 (ad hoc, not committed) reproduces the same ordering (batch > micro-batch > streaming, both in delay and burst size) with different absolute numbers, confirming the relationship is structural (a function of the interval sizes), not an artifact of one seed.
2. **"Is calling the 1-second streaming cut 'streaming' honest, given it's really just a very small poll interval and not a push/pull broker?"** The reel and `OUTLINE.md`/post-notes disclose this plainly: it is a simulated consumer at the simulation's own finest resolution, standing in for "a continuously running consumer loop," not a claim about zero latency or a specific broker's real behaviour. The real Kafka pull mechanism (and why it is pull, not push) is covered separately and correctly from Kafka's own documentation, not inferred from the simulation.
3. **"Does the predict step's wrong option ("batch, because it does the most work") have a real temptation, or is it a strawman?"** It is genuinely tempting: batch really does do the largest single unit of work (100 rows/tick vs. streaming's 0.04), which a learner could mistake for "most burden on the consumer." The reveal step's correction is precise: *total* work and *surprise* to the consumer are different axes — batch's work arrives on a schedule the consumer chose, streaming's arrives whenever the producer sends it, which is the actual source of consumer-side risk (an unbounded backlog), not the row count.
4. **"Is the moving-parts count defensible, or an arbitrary round number?"** Each count is a named, enumerated list in `examples.py` (one job for batch; a scheduler and a checkpoint for micro-batch; a broker, a consumer group and a committed offset for streaming), not an unexplained integer; the streaming count is directly grounded in Kafka's own documented mechanism (a consumer's offset as "the position of a consumer in each partition," SOURCES.md). Held, with the scope caveat already stated in claim 7.

## Problem Solving

- **Both the Spark and Kafka documentation URLs named in the chapter plan were client-side redirect stubs** (`spark.apache.org/docs/latest/structured-streaming-programming-guide.html` returns only a one-line "broken apart into smaller pages" notice; `kafka.apache.org/documentation/#design_pull` and the version-pinned `kafka.apache.org/44/documentation.html#design_pull` are both JS redirects that `curl` cannot follow, since the destination is computed by a `window.location.hash` lookup table in the page's own script). **Fixed** by reading the redirect script's own lookup table (`"#design":"design/design/"`) to find the real destination (`kafka.apache.org/44/design/design/`), and by finding Spark's real trigger-interval page (`streaming/getting-started.html`) by crawling the live `streaming/index.html` page's own links. Both were then fetched and checked normally; `node scripts/sources.mjs check` passed (4 quotes, 0 problems).
- **PostgreSQL was not running in this sandbox** (installed but stopped, no `learnshop` database, no `psycopg2`). Not needed for this topic's own examples (a pure-Python simulation), but started and provisioned (`service postgresql start`, `createdb learnshop`, `pip install psycopg2-binary`) since later chapter 8 topics (extraction, CDC) will need it against the same running cluster.
