# Fact-check — Windowing: tumbling, sliding, session, global

| Claim | Source | Status |
|---|---|---|
| Tumbling windows have a fixed size and do not overlap | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Sliding windows can overlap if the slide is smaller than the window size, assigning an element to multiple windows | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Session windows group elements by sessions of activity, with no fixed start or end, closing on a gap of inactivity | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A session window operator requires a merging trigger and a merging window function to be mergeable | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A global window assigns all elements with the same key to one single window, and is useless without a custom trigger | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A window closes once the watermark passes its end plus allowed lateness, and this guarantee doesn't extend to global windows | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Window assignment and merging are intimately related per windowing strategy (sliding needs sliding merging, sessions need session merging) | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| Elements are initially assigned to a default global window covering all of event time | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| Using the global window with an unbounded source and the default trigger guarantees no output, since the global window never ends | The Dataflow Model (Akidau et al., 2015) | Confirmed, quoted verbatim |
| A half-overlap sliding window nearly doubles the number of assigned element-copies versus an equal-size tumbling window on the same stream | Modeled and measured directly in `examples.py` (`tumbling_windows`, `sliding_windows`) | Confirmed by the toy model's own real run |
| A late record landing inside the gap between two session windows merges them into one | Modeled and measured directly in `examples.py` (`run_session_merge_demo`) | Confirmed by the toy model's own real run |
| A global window with the default trigger never fires; the same window with a custom count trigger fires on schedule | Modeled and measured directly in `examples.py` (`run_global_window_no_trigger`, `run_global_window_custom_trigger`) | Confirmed by the toy model's own real run |
| Live pane count rises while the stream runs and drops to zero once the source goes idle | Modeled and measured directly in `examples.py` (`run_pane_cleanup_demo`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the toy session-merge model a faithful simplification of the Dataflow Model's actual
  MergeWindows algorithm?** It implements the same observable behavior (overlapping or adjacent
  candidate windows for a key merge into one larger window) described and quoted from the paper's
  own Figure 4 example, without claiming to reproduce the paper's internal five-part composite
  operation (AssignWindows, GroupByKey, DropTimestamps, MergeWindows, GroupAlsoByWindow,
  ExpandToElements) step for step.
- **Does the toy pane-cleanup model match Flink's exact window-lifecycle timing?** It implements
  the same rule quoted from Flink's docs (a window closes once time passes its end timestamp plus
  allowed lateness), at the conceptual level CHAPTER.md scopes this topic to; Flink's specific
  state-backend implementation is named, not retaught, per CHAPTER.md's "Leaves out" note.
- **Is the tumbling-vs-sliding state-cost multiplier generalizable beyond this topic's own
  stream?** No — the measured multiplier is specific to this stream's event rate and the chosen
  half-overlap configuration; the reel and SOURCES.md both frame it as this run's own measured
  number, not a universal constant, and the underlying mechanism (one copy per overlapping window)
  is the sourced, generalizable claim.

## Corrections

None. All claims trace to this topic's own two primary sources (the Dataflow Model paper, Apache
Flink's documentation) or to this topic's own toy aggregator, measured directly.
