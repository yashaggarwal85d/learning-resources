# Fact-check — Event time, watermarks and completeness

| Claim | Source | Status |
|---|---|---|
| Most watermarks must be heuristically defined based on limited knowledge available | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| Watermarks have shortcomings: late data can arrive behind the watermark, and a completely perfect event-time watermark is intractable for many sources | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| An idle partition stops the WatermarkGenerator from getting new information, and the overall watermark is held back since it's computed as the minimum over all parallel watermarks | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A fast partition can increase its watermark much faster than others, forcing a downstream operator to buffer excessively | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Watermark alignment ensures no partition increases its watermark too far ahead of the rest | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A tighter watermark bound produces more late (to-be-revised) events than a looser bound, on the same stream | Modeled and measured directly in `examples.py` (`test_tighter_bound_marks_more_events_late`, `test_latency_completeness_trade_off`) | Confirmed by the toy model's own real run |
| An idle-aware global watermark advances past the point a naive minimum-based watermark stalls at | Modeled and measured directly in `examples.py` (`test_idle_source_stalls_the_naive_watermark`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the synthetic stream's exact late/duplicate fraction independently sourced?** No — the
  2%-late/1%-duplicate figures are CHAPTER.md's own stated design for this chapter's shared lab
  stream, not a claim about any real production system; `examples.py` implements them directly
  and the reel never cites them as an externally sourced statistic.
- **Does "idle-source detection" as taught here match Flink's actual mechanism exactly?**
  The reel teaches the general idea (a timeout that excludes a silent partition from the
  watermark minimum), which matches Flink's own `withIdleness` behavior as quoted in SOURCES.md,
  without claiming the toy model is a literal reimplementation of Flink's internals.
- **Is "watermark alignment" taught at the right level of detail?** CHAPTER.md scopes this topic
  to the concept (bounding drift between partitions) rather than Flink's specific alignment-group
  configuration API; the reel stays at that level, and SOURCES.md discloses the quoted material
  comes from Flink's own alignment-group documentation.

## Corrections

None. All claims trace to this topic's own two primary sources (the Dataflow Model paper, Apache
Flink's documentation) or to this topic's own toy models, measured directly.
