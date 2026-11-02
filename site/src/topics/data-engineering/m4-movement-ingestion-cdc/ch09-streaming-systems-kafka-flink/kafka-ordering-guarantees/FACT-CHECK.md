# Fact-check: Kafka ordering guarantees (`de.kafka-ordering-guarantees`)

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A topic is divided into totally ordered partitions. | Confirmed | Design docs: "Our topic is divided into a set of totally ordered partitions..." |
| 2 | The default partitioner hashes a key to a partition. | Confirmed | Design docs: "...allowing the user to specify a key to partition by and using this to hash to a partition..." |
| 3 | Idempotence requires `max.in.flight.requests.per.connection` ≤ 5, ordering preserved for any allowable value. | Confirmed | Producer config reference: "enabling idempotence requires max.in.flight.requests.per.connection to be less than or equal to 5 (with message ordering preserved for any allowable value)..." |
| 4 | Without idempotence, >1 in-flight request risks reordering after a retry. | Confirmed | Producer config reference ("max.in.flight.requests.per.connection"): "if this configuration is set to be greater than 1 and enable.idempotence is set to false, there is a risk of message reordering after a failed send due to retries..." |
| 5 | With idempotence (or retries disabled), ordering is preserved. | Confirmed | Same entry: "if retries are disabled or if enable.idempotence is set to true, ordering will be preserved." |
| 6 | The concrete reordering mechanism: a retried first batch can land after a later batch that succeeded immediately. | Confirmed | Producer config reference ("retries"): "if two batches are sent to a single partition, and the first fails and is retried but the second succeeds, then the records in the second batch may appear first." |
| 7 | Increasing partition count changes the default partitioner's key-to-partition mapping; Kafka doesn't redistribute existing data. | Confirmed | Operations docs: "If data is partitioned by hash(key) % number_of_partitions, the default partitioner's mapping logic changes when the partition count increases... Kafka will not attempt to automatically redistribute existing data." |

## Currency check

- All three sources are version-pinned Kafka 4.4 pages; the producer config reference and design
  doc were already confirmed clean in earlier topics this chapter. The 5-in-flight limit and the
  key-redistribution behavior are stable, long-documented mechanics, not a moving target.

## Red team: predict step 3 ("does Kafka guarantee order between two records with different keys?")

- Tempting wrong answer: "yes, Kafka preserves send order across the whole topic" — wrong because
  the design doc is explicit that ordering is a per-partition property of "totally ordered
  partitions," plural, with no stated relationship between them; two records with different keys
  will usually land in different partitions and have no defined relative order at all.

## Red team: predict step 5 ("does a retried batch risk landing out of order?")

- Tempting wrong answer: "no, Kafka always retries in the order batches were sent" — wrong
  because the producer config reference states plainly that without idempotence and with more
  than one in-flight request, a retried first batch can be accepted *after* a second batch that
  succeeded on its first try, which is exactly backwards from send order.

## Red team: the toy measurements themselves

- **`retry_can_reorder_batches` / `idempotent_preserves_order`**: direct, rule-based
  reimplementations of the sourced claim (retries can reorder without idempotence; idempotence
  always preserves order), not a simulation of real TCP retransmission or broker-side sequence
  number tracking — isolates the one claim this topic needs.
- **`default_partitioner_hash` / `key_stability_across_repartition`**: uses a custom deterministic
  string hash, not Python's built-in `hash()` (which is randomized per process via
  `PYTHONHASHSEED` and would make the example's shown numbers non-reproducible between runs) —
  disclosed in the code's own docstring. The underlying claim this models — `hash(key) %
  number_of_partitions` changes when the partition count changes — is sourced directly; the
  specific hash function used is a stand-in for Kafka's real murmur2-based default partitioner,
  not a reimplementation of it, since this topic's claim is about the *mod-by-partition-count*
  mechanism, not the specific hash algorithm.

## Corrections applied to OUTLINE.md

None needed — every claim is directly confirmed by Kafka's own current documentation, with no
unconfirmed version numbers in this topic's scope line.
