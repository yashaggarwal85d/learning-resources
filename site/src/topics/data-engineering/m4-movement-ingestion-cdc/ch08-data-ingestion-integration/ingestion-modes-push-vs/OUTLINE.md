# Outline: Ingestion modes: push vs pull, batch vs streaming (`de.ingestion-modes-push-vs`)

## Learning outcomes

1. Say who owns the schedule and who owns the buffer for a pull and for a push, and what that costs the side that owns the buffer.
2. Place a workload on the batch / micro-batch / streaming spectrum from its latency need, using real measured delay and burst-size numbers, not adjectives.
3. Name the one failure mode each ingestion mode is most prone to (a late batch, a small-files pile-up under micro-batch, an unbounded backlog under streaming).

## Reel steps and storyboard

1. **Hook.** `fig`: "a team's 'real-time' dashboard is an hourly cron; the same orders stream, cut three ways, with one row's own delay counting up in each." Visual: three `Bar`s (batch / micro-batch / streaming) growing at different rates toward the example row's own measured delay (examples.py `example_batch_delay`/`example_micro_delay`/`example_stream_delay`). Caption states the numbers. Moves: three bars grow on staggered beats (kit `Bar` + `seg`/`easeOut`). Narrator's line of thought: the team calls it real-time, but nobody has ever put a number on "real" — this topic is about to.
2. **Reveal: the four positions.** `fig`: "source, buffer, sink, cursor — every pipeline has all four; who owns the buffer is the question." Visual: four labelled rows (source/buffer/sink/cursor) with the buffer row's owner flipping between "source" and "consumer" on a beat. Narrator explains: in a pull, the consumer asks, so the source has to hold what it hasn't been asked for yet; in a push, the roles swap. Not a predict step: this is vocabulary everything after it depends on.
3. **Predict: which mode drops the most work on the consumer, and why.** `predict`: options are "streaming, because it has no schedule to shield it" (correct) vs "batch, because it does the most work" (tempting but wrong: batch does the most work per run but on its own schedule, never surprising the consumer). Visual: the three bars again, flat.
4. **Reveal: the three cuts, measured.** `fig`: the real average delay and burst size for all 300 simulated orders (examples.py `batch_avg`/`micro_avg`/`stream_avg`, `rows_per_tick_*`). Visual: two `Bar` pairs — one row per mode for average delay, one row per mode for rows handled per delivery tick. Takeaway: "the same stream, cut three ways, trades latency for burst size — nothing here is free."
5. **Reveal: moving parts, and the one failure each mode is prone to.** `fig`: moving-parts counts (examples.py `moving_parts_by_mode`) plus, in prose, the failure each is prone to: batch — a late or skipped run goes unnoticed until the report is stale; micro-batch — many small checkpointed runs leave many small files/commits to pile up downstream; streaming — nothing shields the consumer from a producer surge, so an unbounded backlog is the failure, not a late number. Takeaway: "more moving parts buys lower latency, and a new way to fail."
6. **Recap.** The four positions; the three cuts and their real numbers; one failure per mode. Handoff line narrated.

Engagement arc: hook on step 1 (a real, mis-named "real-time" dashboard); predict on step 3 (within the first four steps, one predict as a refresher needs); surprising number is the burst-size contrast (100 rows/tick for batch vs 0.04 for streaming) and the delay contrast (thousands of seconds vs under one second); three takeaways across steps 4-5-6; recap closes it.

## Post-notes headings (Deep dive)

- **Outcomes** — the three outcomes above, restated plainly.
- **Internals** — Kafka's own stated reason for pulling instead of pushing (SOURCES.md), and Spark Structured Streaming's trigger-interval model of a micro-batch (SOURCES.md).
- **Production** — the hourly-cron team's own failure: nobody measured the real delay, and a cron that silently stops is the same "last successful run" forever.
- **Frontier** — not deeply explored here; named and left to Chapter 9 (Kafka as the buffer) and Chapter 7 7.4 (micro-batch execution inside Spark).
- **Where this goes next** — webhooks (the *(skipped)* syllabus topic, named here only as the canonical push case, sourced: webhooks push an event to a URL the moment it happens, with no poll and no schedule the consumer controls — the push side of this topic's own pull/push line, left unbuilt per the chapter plan); topic 2, reading a database without hurting it.

## Examples to execute

`examples.py`: `simulate_arrivals` (a seeded Poisson process, disclosed as simulated, not a real production trace), `delivery_delay` (the ceil-to-boundary mechanism applied at three interval sizes), `batch_vs_microbatch_vs_streaming` (one example row's own delay in each mode, and the average across all 300), `burst_size_per_delivery` (rows handled per delivery tick in each mode), `moving_parts_by_mode` (a disclosed architectural count, not a benchmark). All run and assert; see the printed output.

## Bridge and handoff

- **Bridge:** restates Chapter 7's assumed ending in this topic's own words (per CHAPTER.md's assumption note): Milestone 3's engines all assumed the data was already sitting in storage; this chapter opens by asking how it got there.
- **Handoff:** pull is the most common mode, and the most common thing it pulls from is a production database built to serve customers, not analysts — topic 2.

## Concept ledger

- **Introduces:** `ingestion-modes-ownership`.
- **Uses:** `medallion-bronze-silver-gold`, `lambda-architecture`, `kappa-architecture` (Chapter 3 topic 20, verified live in registry.ts).
- **Declared:** basic familiarity with ETL.

## Claims list

1. Spark Structured Streaming advances its Result Table on a trigger interval (e.g. every 1 second) — SOURCES.md, Spark Getting Started page.
2. Kafka's consumers pull from brokers rather than being pushed to, because a pull-based consumer falls behind and catches up instead of being overwhelmed — SOURCES.md, Kafka Design page.
3. A naive pull loop busy-waits without data; Kafka's long poll fixes this — SOURCES.md, Kafka Design page.
4. The measured delay, burst-size and moving-parts numbers on screen — examples.py, executed and asserted, this run.

## Changes from the chapter plan

None: this topic follows its CHAPTER.md entry as written.
