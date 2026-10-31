# Fact-check — Triggers, allowed lateness and retractions

| Claim | Source | Status |
|---|---|---|
| Discarding mode: upon triggering, window contents are discarded, and later results bear no relation to previous results | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| Accumulating mode: upon triggering, window contents are left intact, and later results become a refinement of previous results | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| Accumulating-and-retracting: a retraction for the previous value is emitted first, followed by the new value, upon re-triggering | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| The watermark trigger fires when the watermark passes the end of the window | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| A repeated watermark trigger fires immediately for late data that arrives after the watermark has already passed | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| By default, late elements are dropped once the watermark is past the end of the window | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A late but not dropped element may cause the window to fire again (the EventTimeTrigger case) | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| These later corrections are called late firings, distinct from the main (first) firing | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Speculative (early) firings precede the watermark passing the window's end, for faster partial results | Apache Beam docs | Confirmed, quoted verbatim |
| Late firings happen after the watermark passes the window's end, to handle late-arriving data | Apache Beam docs | Confirmed, quoted verbatim |
| With allowed lateness set, the default trigger emits new results immediately whenever late data arrives | Apache Beam docs | Confirmed, quoted verbatim |
| The same window produces three distinct real totals across an early, on-time, and late firing | Modeled and measured directly in `examples.py` (`run_firings`) | Confirmed by the toy model's own real run |
| A record arriving after the allowed-lateness boundary is dropped, excluded from the window's final total | Modeled and measured directly in `examples.py` (`run_firings`, the dropped-record assertion) | Confirmed by the toy model's own real run |
| A downstream sum-of-sums lands on the correct ground truth under discarding and accumulating-and-retracting, but over-counts under accumulating alone | Modeled and measured directly in `examples.py` (`downstream_sum_assuming_accumulating`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the toy model's trigger logic a faithful simplification of a real engine's trigger
  composition (e.g. Beam's `AfterWatermark.pastEndOfWindow().withEarlyFirings(...)` /
  `.withLateFirings(...)`)?** It reproduces the same observable firing sequence (early, on-time,
  late) these composite triggers are quoted and described as producing, at the conceptual level
  CHAPTER.md scopes this topic to, without claiming to reimplement any engine's actual trigger
  composition API.
- **Does the toy accumulation-mode model match the Dataflow Model paper's exact retraction
  mechanics?** It implements the same observable behavior quoted from the paper (a retraction of
  the previous value emitted before the new one) rather than the paper's full Combiner-based
  uncombine machinery, which CHAPTER.md names as belonging to a lower level of detail than this
  topic teaches.
- **Is Flink actually cited for the discarding/accumulating/accumulating-and-retracting
  vocabulary itself?** No — Flink's own public API does not expose these three named modes the
  way Beam and the Dataflow Model paper do; Flink is cited here only for allowed-lateness and
  late-firing mechanics, and SOURCES.md discloses this distinction explicitly.

## Corrections

None. All claims trace to this topic's own three primary sources (the Dataflow Model paper,
Apache Flink's documentation, Apache Beam's documentation) or to this topic's own toy model,
measured directly.
