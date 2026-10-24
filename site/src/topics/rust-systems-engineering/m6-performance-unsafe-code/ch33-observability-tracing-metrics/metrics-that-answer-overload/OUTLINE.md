# Outline — Metrics that answer overload questions

Concept ledger: introduces `the-right-metric-shape-answers-the-real-question`; uses `a-structured-field-survives-being-queried` (topic 87) only in prose, per Chapter 33's own CHAPTER.md §A.7 — this topic reuses the immediately preceding topic's own introduced id directly, continuing the identical within-chapter pattern Chapters 30–32 established.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "A structured field survives being queried about one real event or one real span; it says nothing yet about the real shape of a question asked across many of them at once, the way an overload question always is." Hands off to topic 89 (verbatim): "The right metric shape tells you that something is overloaded right now; it says nothing yet about what kind of real failure that overload, or anything else, actually produces once it happens."

Chapter 33's own disclosed convention (§A.3/§A.6) applies: this topic's own crate (`examples/metric_demo/`) calls one real async operation five times with a deliberately uneven real delay pattern (three calls at 20ms, two calls at 100ms), recording every call through a real counter (an `AtomicU64`), a real gauge (an `AtomicI64` tracking in-flight count), and a real histogram (a `Vec<u64>` of completed latencies behind a `Mutex`); at one real checkpoint 50ms in, three calls have finished and two are genuinely still running.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **CounterPredict** — At the real checkpoint, while two of the five real calls are genuinely still running, does the counter's own value, read right then, tell you that? Options: yes, its value says exactly how many are still running; no, genuinely, it only ever counts what has already finished (correct); only once the counter stops moving at all.
2. **CounterReveal** — Measured: at the checkpoint, the counter reads three, which is genuinely only the number of calls that have already finished; nothing about that number says whether anything else is still running. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **HistogramPredict** — The histogram, at that same checkpoint, holds only the latencies of calls that have already finished. Does it do any better at answering whether anything is backed up right now? Options: yes, an empty-looking bucket would show something is stuck; no, genuinely, it shares the identical blind spot as the counter (correct); only if the buckets are read in reverse.
4. **HistogramReveal** — Measured: the histogram holds exactly three completed latencies at the checkpoint, the identical count the counter reports, and is genuinely just as blind to the two calls still running. Takeaway: a counter and a histogram built only from finished work share the identical blind spot toward whatever has not finished yet.
5. **GaugePredict** — The gauge, at that same real checkpoint, reads the real, current number of calls still in flight. Does it correctly answer whether anything is backed up right now? Options: no, a gauge only reflects the past, like the other two; yes, genuinely, because it is read as a current value, not a running total (correct); only after the calls finish and it returns to zero.
6. **GaugeReveal** — Measured: the gauge reads exactly two at the checkpoint, the real, correct number of calls genuinely still running at that instant, answering the question the counter and the histogram could not. Takeaway: a gauge answers a right-now question the other two genuinely cannot, because it is the only one of the three built to go back down.
7. **DocsReveal** — Prometheus's own documentation states this directly, in its own words: a counter can only increase; a gauge can arbitrarily go up and down; a histogram counts observations into buckets. Does this topic's own three measured readings model exactly the difference the docs describe? Takeaway (moved here from step 2): the right metric shape is chosen by the real question being asked, never swapped in afterward to patch a wrong answer.
8. **Recap** — A counter only ever counts what has already finished; a histogram, built the same way, shares that identical blind spot; and a gauge, read as a real current value, is the only one of the three that can correctly answer whether anything is genuinely backed up right now.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what one specific, real metric reads at this exact crate's own real checkpoint.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting "the docs say this" step; step 8's recap carries the closing statement instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the kit's real-measurement standard)

- RED/USE, Tokio runtime metrics (`RuntimeMetrics::num_alive_tasks`, queue depth), and exemplars linking a latency bucket to a trace, which the syllabus names beyond this topic's own three hand-rolled metrics — Internals / In production.
- A real Prometheus server and a real Grafana dashboard reading this topic's own metrics over the network; neither is reachable from this sandboxed container, so this topic measures the identical real metric values locally and states the real export step in prose — In production.
- Native histograms and the `histogram_quantile()` function, Prometheus's own further machinery for a histogram once it holds more than this topic's own three completed values — The frontier.
