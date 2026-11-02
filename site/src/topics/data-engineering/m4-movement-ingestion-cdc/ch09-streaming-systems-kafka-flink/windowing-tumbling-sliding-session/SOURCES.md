Sources fetched and quoted for `de.windowing-tumbling-sliding-session`.

## The Dataflow Model (Akidau et al., 2015, VLDB)

URL: https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf

Same PDF already fetched in topic `event-time-watermarks-completeness`
(`sources/dataflow-model-paper.txt`, copied in unchanged).

> For any given windowing strategy, the two operations are
> intimately related; sliding window assignment requires sliding window merging, sessions window assignment requires
> sessions window merging, etc.

> are initially assigned to a default global window, covering all of event time, providing semantics that
> match the defaults in the standard batch model.

> the windows
> for v1 and v4 overlap, so the sessions windowing strategy merges them into a single new, larger session

> But when using the global window with an
> unbounded input source, we are guaranteed that will never
> happen, since the global window covers all of event time.

> we will need to either trigger by something other than
> the default trigger, or window by something other than the
> global window. Otherwise, we will never get any output.

## Windows (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/operators/windows/

> Tumbling windows have a fixed size and do not overlap.

> sliding
> windows can be overlapping if the slide is smaller than the window size. In this case elements
> are assigned to multiple windows.

> The session windows assigner groups elements by sessions of activity. Session windows do not overlap and
> do not have a fixed start and end time, in contrast to tumbling windows and sliding windows.

> a
> session window closes when it does not receive elements for a certain period of time, i.e., when a gap of
> inactivity occurred.

> In order to be mergeable, a session window operator requires a merging Trigger and a merging
> Window Function, such as ReduceFunction, AggregateFunction, or ProcessWindowFunction

> A global windows assigner assigns all elements with the same key to the same single global window.

> This windowing scheme is only useful if you also specify a custom trigger. Otherwise,
> no computation will be performed, as the global window does not have a natural end at
> which we could process the aggregated elements.

> a window is created as soon as the first element that should belong to this window arrives, and the
> window is completely removed when the time (event or processing time) passes its end timestamp plus the user-specified
> allowed lateness

> Flink guarantees removal only for time-based
> windows and not for other types, e.g. global windows

Notes on this topic's research: both documents fetched clean on the first attempt. The Dataflow
Model PDF's known figure-interleaving artifact (noted in topic 17's SOURCES.md) did not affect any
passage quoted here. Flink's window-operator internals and state-backend choice (topics 22-24) and
exactly when a window is allowed to close on late data (topic 19) are named per CHAPTER.md's own
"Leaves out" note, not retaught here.
