<section data-section="outcomes">

## Outcomes

Both designs for the shop's revenue-by-product pipeline get built, priced, and measured against
each other. Kappa's reprocessing cost replays the retained log through the streaming engine;
Lambda's re-runs the cheap batch layer over the lake — the two cross at a retention length and
reprocessing frequency computed from the shop's own numbers, not chosen out of habit. Running
both paths over one synthetic stream with a deliberately planted edge case measures the
discrepancy directly: two code paths that must agree will drift, and a unified engine reduces
that drift without removing the second path entirely. Four named conditions — billing-grade late
data, very large reprocessing, a huge historical-dimension join, and a compliance restatement —
decide, as computable thresholds against the shop's own numbers, whether a batch layer still
earns its complexity.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Lambda and Kappa as architectures (Chapter 3 §3.3) are built
on, not re-taught; the engines themselves (Chapters 7 and 9) and the correctness mechanisms
(topic 6, Chapter 14 topic 13) are each named only as a choice pointing to its home chapter.
The clickstream design that uses a reconciliation path belongs to topic 12; the general choice
of pipeline shape belongs to topic 3.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The two-path simulation on a synthetic stream
with a planted edge-case difference, the reprocessing-cost crossover, and the threshold
calculations are this topic's executable evidence. `examples.py`'s own lab: `kappa_revenue()`
and `lambda_batch_revenue()` run the two paths; `dual_logic_discrepancy()` measures exactly
where they diverge; `reprocessing_crossover_days()` computes the crossover;
`batch_layer_earns_its_place()` checks the four named conditions.

</section>

<section data-section="production">

## Production failures this topic warns about

**Two code paths that quietly drift.** A streaming job and a batch job that must produce the
same number will diverge the moment their rules differ even slightly, and the gap can go
unnoticed until a reconciliation catches it, days later.

**Ripping out a batch layer by feel.** Removing the second code path without checking it
against the four named conditions can make a future restatement impossible, if it turns out the
retained log was never built to hold what that restatement needs.

</section>

<section data-section="frontier">

## Frontier

None claimed. Lambda, Kappa, and unified batch/stream engines are each established practice —
Flink ships unified execution — not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Both designs lived in one region. A platform that must serve two continents faces a different
set of constraints: where data is allowed to live, what crossing a border costs, and what
happens to pipelines and catalogs when a region fails. The next design is a multi-region
analytical platform.

</section>
