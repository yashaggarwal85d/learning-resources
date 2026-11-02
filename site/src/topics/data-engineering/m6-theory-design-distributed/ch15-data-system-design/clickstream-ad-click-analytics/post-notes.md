<section data-section="outcomes">

## Outcomes

With the method and the interview questions already in hand, this topic runs them on the
largest data stream most companies own: clicks. The pipeline strip — client SDK, collector,
log, lake, warehouse, dashboards — carries a three-alternative decision card at every hop.
Sessionisation groups events by a gap of inactivity, never a fixed clock boundary, and bot
filtering costs something no matter which way it's wrong. A late event lands in the log but
misses a streaming window that already fired, by default, unless the design explicitly allows
for lateness — which is exactly the mechanism behind two correct pipelines disagreeing on a
click count. The streaming path gives a fast, approximately right count with an exactly-once
*effect*; a scheduled batch job recomputes the same count from the immutable log and overrides
the streaming figure for anything billed. Running both paths costs something real: drift,
whenever only one copy of the logic gets updated — a cost to budget for, not a bug to eventually
eliminate.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Kafka, Flink, Spark streaming, sessionisation SQL, bot-
detection models, and the lake's table format are each named only as a choice pointing to its
home chapter — this topic doesn't re-derive any of their mechanics. The design method itself
(topics 1-9) is used only as the template's own sections, already taught.

</section>

<section data-section="lab">

## Lab

None of its own as a syllabus lab leg. The late-event simulation and the estimate sheet are
this topic's executable evidence. `examples.py`'s own lab: `sessionize()` groups events by an
inactivity gap; `streaming_count()` drops a late event by default unless lateness is allowed;
`batch_reconciled_count()` recomputes from every event in the log; `late_event_share()` measures
the gap's own direct cause; `idempotent_upsert()` absorbs a duplicate without double-counting;
`estimate_sheet()` and `dominant_cost_lever()` compute the shop's own numbers.

</section>

<section data-section="production">

## Production failures this topic warns about

**A billing dispute mistaken for a bug report.** Two pipelines disagreeing on a count isn't
automatically a defect in either one — the design has to state, in advance, which number is the
number of record and why the other one is allowed to differ.

**Assuming the last incident's cause explains this one.** A count disagreeing is a symptom, not
a diagnosis; the same symptom traced to a late-event sliver one time and a retry-storm timing
collision the next.

</section>

<section data-section="frontier">

## Frontier

None claimed. Streaming-plus-batch reconciliation is established practice (Kreps, 2014), not an
emerging technique. The Lambda-versus-Kappa debate as such is left to topic 17, where the same
pipeline gets built both ways.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Clicks are an append-only stream with no natural dimensions. Orders are different: they are
mutable business entities that must be modelled, loaded incrementally, and joined to customers
and products. The next design is the warehouse that holds them.

</section>
