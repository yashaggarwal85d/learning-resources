# Fact-check: Kafka tiered storage (de.kafka-tiered-storage)

## Claims table

| Claim | Status | Source |
|---|---|---|
| KIP-405 is merged and production-ready since Kafka 3.9 | Confirmed | KIP-405 wiki, "Status" section |
| RemoteLogManager (RLM) is a broker-side component that copies rolled-over (closed) segments, with their indexes, to the remote tier | Confirmed | KIP-405, "RLM Leader Task" |
| Copying delegates to a pluggable `RemoteStorageManager` implementation | Confirmed | KIP-405 "Proposed Changes"; ops docs, "RemoteStorageManager is an interface..." |
| `local.retention.ms`/`.bytes` (topic config; `log.local.retention.ms`/`.bytes` broker default) bound how long a segment stays on local disk after being tiered, independent of total `retention.ms`/`.bytes` | Confirmed | ops docs "Topic Configurations"; configuration reference `log.local.retention.ms` |
| Tiered storage does not support compacted topics | Confirmed, stated twice independently | ops docs "Limitations"; KIP-405 "Non-Goals" |
| A consumer reading an offset already deleted locally gets it from remote storage transparently, same fetch API | Confirmed by design description (RLM "also serves the fetch requests for older data from the remote tier") | KIP-405 |

## Red-team

**Predict step 3-4 (does copying wait for local retention?)** — the wrong intuition is that
copying and local deletion are the same event, gated by the same retention clock. KIP-405 is
explicit that copying starts as soon as a segment rolls (subject to an optional delay via
`remote.copy.lag.ms`/`.bytes`, default 0 = immediate), and the *local* copy is only deleted once
it has already been copied successfully, after `local.retention.ms` additionally elapses. Getting
this backwards would make the toy `segment_placement` model wrong — it correctly treats "copied"
and "locally deleted" as two separate, independently-timed events.

**Reveal step 8 (why no compacted topics)** — this topic states the *documented* limitation (both
primary sources say it plainly) without inventing a mechanism neither source states outright for
*why*. The scope line's own phrasing ("per Kafka's own tiered-storage documentation") is honored:
the reel's body describes the limitation as stated, and the *reason given* (compaction rewrites
segments in place, breaking the remote copy's immutability assumption) is a direct, uncontroversial
inference from what compaction does (topic 6) and what RLM assumes (an already-uploaded segment's
bytes don't change) — not an invented implementation detail.

**Toy measurements (`examples.py`)** — `segment_placement` and `read_path` are simplified standalone
models of the *rules* stated in KIP-405 and the ops docs, not a port of Kafka's actual
`RemoteLogManager`/`RemoteStorageManager` code (no Kafka broker or object store runs in this
sandbox). The specific latency numbers (`0.02` vs `1.0`) are illustrative relative costs chosen to
make the "cold read costs more" claim measurable and reproducible, not a claim about actual S3 or
HDFS latency.

## Corrections

None needed — both version claims (KIP-405 production-ready since 3.9) and the compacted-topics
limitation were directly confirmed by current Kafka documentation, so no downgrade of the scope
line's claims was required (see the pattern noted in topics 3-4, not needed again here, as with
topics 5-7).
