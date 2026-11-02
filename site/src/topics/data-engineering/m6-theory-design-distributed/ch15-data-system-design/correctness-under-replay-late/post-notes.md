<section data-section="outcomes">

## Outcomes

A pipeline that only works on the normal day isn't done: real data arrives twice, arrives late,
and gets replayed on purpose. A deterministic transform (output from input alone) paired with an
idempotent write (repetition has no further effect) is what makes a re-run actually trustworthy —
either property alone isn't enough, and a hidden non-determinism (wall-clock time, input
ordering, an unseeded sample) can make two runs over identical input silently disagree. A
watermark names what's late as a heuristic, not a guarantee, and a correction window turns a late
event from something dropped or silently overwritten into something that amends a published
result with a new version. Versioned outputs tie this together: a consumer can pin a version, and
an auditor can reconstruct exactly what was reported, and when. None of this protects a side
effect living outside the pipeline's own write path — that needs its own idempotence key.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Watermark generation, windowing and trigger mechanics, Kafka's
and Flink's own delivery-guarantee mechanics, the exactly-once argument, and Iceberg's own
snapshot mechanics each belong to Chapters 6, 7, 9 and 14 respectively, `uses`/`declared` here,
not re-derived. This topic teaches only the *design response* those mechanics execute underneath.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab (topic 9 hosts the chapter's own assigned
lab). `replay_is_trustworthy()` shows a deterministic, idempotent replay landing identical
results, against `non_deterministic_revenue_transform()`'s own hidden-clock bug producing
different output on the same input. `size_correction_window()` and
`late_event_with_correction_window()` show a stated late-data rate turning into a real window
width, state cost, and an amended (rather than dropped) published result.

</section>

<section data-section="production">

## Production failures this topic warns about

**A re-run that silently disagrees with itself.** The shop's own hook is this failure exactly: a
routine bug-fix re-run changes a closed-out number, with the input confirmed unchanged. The cause
is always some untested non-determinism hiding in the pipeline's own logic — a clock read, an
unfixed ordering assumption, an unseeded sample — not a mystery requiring new data.

**Assuming pipeline-level safety reaches external side effects.** A deterministic, idempotent
pipeline is genuinely safer to replay — but an email receipt, a webhook, or any other effect
living outside the pipeline's own write path isn't protected by that safety unless it has its own
deduplication key. The "Prove it" scenario makes this gap concrete rather than theoretical.

</section>

<section data-section="frontier">

## Frontier

None claimed. Deterministic, idempotent pipeline design and watermark-based lateness handling are
established, Dataflow-Model-era (2015) practice, not an emerging technique. What continues to
evolve is the specific table-format mechanics (Iceberg's own snapshot and branch features) that
implement versioned outputs — Chapter 6's own subject, not this topic's.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A pipeline that is correct under replay and late data can still be down. Sources go quiet,
brokers fail, a bad deploy ships, a region disappears. The next topic is enumerating those
failures before they happen: failure-mode analysis and recovery.

</section>
