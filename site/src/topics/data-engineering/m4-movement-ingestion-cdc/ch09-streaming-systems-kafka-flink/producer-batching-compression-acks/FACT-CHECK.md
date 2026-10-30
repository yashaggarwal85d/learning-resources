# Fact-check: Producer batching, compression and acks (`de.producer-batching-compression-acks`)

Role: adversarial fact-checker, re-deriving every claim in `OUTLINE.md`'s claims list from the
fetched source text in `sources/`, and red-teaming both predict steps and the toy measurements.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A batch closes at `batch.size` or `linger.ms`, whichever happens first. | Confirmed | Direct quote, `batch.size`: "we will wait for 5ms or until the record batch is of batch.size (whichever happens first)". |
| 2 | `linger.ms` defaults to five, changed from zero in Kafka 4.0, specifically because larger batches tend to match or beat the added wait under load. | Confirmed | Direct quote, `linger.ms`: "The default changed from 0 to 5 in Apache Kafka 4.0 as the efficiency gains from larger batches typically result in similar or lower producer latency despite the increased linger." |
| 3 | Compression is of whole batches, not individual records. | Confirmed | Direct quote, `compression.type`: "Compression is of full batches of data, so the efficacy of batching will also impact the compression ratio (more batching means better compression)." |
| 4 | The default (no-key) partitioner used to round-robin; KIP-480 made it stick to one partition for a batch's lifetime. | Confirmed | Direct quote, KIP-480: "Currently... the default partitioner partitions records in a round-robin fashion... The sticky partitioner attempts to create this behavior... By 'sticking' to a partition until the batch is full (or is sent when linger.ms is up)." |
| 5 | The sticky partition changes only when a new batch opens, not mid-batch. | Confirmed | Direct quote, KIP-480: "After sending a batch, the partition that is sticky changes." |
| 6 | `acks=0`/`1`/`all` each wait for a different point and give a different guarantee. | Confirmed | Direct quotes for all three levels, producer config docs (`acks`). |
| 7 | Kafka 3.0 changed client defaults: `enable.idempotence` false→true, `acks` 1→all. | Confirmed | Direct quote, KIP-679's own table: "enable.idempotence / false / true" and "acks / 1 / all", under "Producer config defaults will change in release version 3.0". |
| 8 | Idempotence requires `acks=all`. | Confirmed | Direct quote, `enable.idempotence`: "enabling idempotence requires... acks must be 'all'." |

## Currency check

- The producer-config quotes are read from the Apache Kafka 4.4 documentation's generated,
  version-pinned config-reference page (`/44/generated/producer_config.html`), not an unversioned
  or trunk source — lower currency risk than topic 1's design-doc fetch, which had to fall back
  to trunk. No further check needed.
- KIP-679 and KIP-480 are both accepted, shipped KIPs (3.0 and 2.4 respectively, both long past
  release); their text is a historical record of a specific version-to-version change, not a
  moving target, so no currency risk.

## Red team: predict step 3 ("the clock runs out before the buffer fills")

- **Wrong option (a), "the batch waits for `batch.size` anyway":** tempting because `batch.size`
  is the more prominently-named setting and a learner may assume it is a hard floor; wrong
  because the source text is explicit that `linger.ms` gives only an *upper bound* on the wait —
  whichever limit is hit first fires the send, and a batch under `batch.size` is not held back.
- **Wrong option (c), "the partial batch is dropped and retried later":** tempting because
  "partial" suggests "incomplete work," and some systems do discard partial units; wrong because
  nothing in the accumulator design treats an under-filled batch as invalid — every record that
  was ever added to it is sent, in order, every time.
- **Edge case checked:** what if `linger.ms=0`? The toy's own `batch_race` function treats
  `linger_ms == 0` as "close immediately," matching the docs' framing of `linger.ms=0` as "no
  artificial delay" rather than "always send singleton batches" — under backlog, whatever has
  already accumulated while the connection was busy still goes out together. This matches the
  real accumulator's behaviour (new records keep appending to the open batch until it is
  actually dequeued to send, not just until it becomes "ready"), and is the reason `examples.py`
  still shows `linger.ms=0` closing some batches larger than one record once the single
  simulated connection falls behind.

## Red team: predict step 6 ("sticking to one partition — bigger or smaller batches?")

- **Wrong option (b), "no real difference":** tempting because the same total record volume
  goes out either way, so a learner might assume total bytes sent is what matters, not how it's
  grouped; wrong because request count and per-batch compression both depend on grouping, not
  just total volume (step 5 already established this for compression).
- **Wrong option (c), "smaller, since one partition gets overloaded":** tempting because
  "sticking" sounds like it could create a hot partition; wrong because sticky partitioning
  switches which partition is sticky every time a batch closes (claim 5), so no partition is
  favored over a longer window — only within one batch's lifetime, by design.

## Red team: the toy measurements themselves

- **`batch_race`:** re-read against the source quotes — the toy's "whichever comes first" check
  (`len(batch) >= batch_cap or linger_ms == 0 or elapsed >= linger_ms`) matches the documented
  race exactly. The toy counts records, not bytes, and uses a request-serialized single
  in-flight slot rather than Kafka's real default of five concurrent in-flight requests — both
  simplifications are disclosed in `examples.py`'s own docstring and `references.md`, and do not
  change the qualitative claim (fewer, larger batches mean fewer requests for the same volume).
- **Compression ratios:** re-run independently outside `examples.py` to confirm the single-record
  vs full-batch gap is not a fluke of one record's content — re-running with different starting
  offsets for the synthetic order-event stream produces the same qualitative gap (a lone record's
  JSON has too little repeated structure for the compressor to exploit; eighty records share
  field names, status strings and similar numeric ranges, which compress well together). The
  exact ratio numbers are specific to this toy's synthetic data shape and are disclosed as such,
  not claimed as Kafka's own real-world compression ratio.
- **`acks_crash_sim`:** re-derived by hand for the chosen parameters (two followers, four ticks
  of lag per follower rank, crash at tick two hundred): follower 0 lags by four ticks (caught up
  to offset 196), follower 1 lags by eight ticks (caught up to offset 192); the ISR floor is the
  slower one, 192. An `acks=1` producer believed all two hundred and one records (offsets 0
  through 200) were durable; only offsets 0 through 192 survive the crash, so eight are lost
  (offsets 193–200) — matches `examples.py`'s asserted `lost_acks1 == 8`. An `acks=all` producer
  never considered anything past offset 192 durable in the first place, so by construction it
  loses nothing — matches `lost_acksall == 0`. The simulation does not model follower recovery,
  leader re-election mechanics, or `min.insync.replicas`; it isolates exactly the one claim this
  topic needs (what "durable" means differs by acks level) and nothing more, consistent with the
  "leaves out" line in `CHAPTER.md` (the ISR/high-watermark mechanics are topic 3's job).

## Corrections applied to OUTLINE.md

- None required. Step 1's hook text had a leftover draft fragment ("ten thousand... no —") caught
  and fixed before this fact-check pass; no claim content was affected.
