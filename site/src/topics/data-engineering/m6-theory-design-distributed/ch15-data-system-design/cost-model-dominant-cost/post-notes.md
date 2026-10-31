<section data-section="outcomes">

## Outcomes

A design with a recovery plan for every failure still has a price. Compute, storage, egress,
requests and licence, each re-expressed per unit of business volume, make different designs and
scales comparable. A cost waterfall ranks those five classes by share of the bill and almost
always finds one term that dominates — optimizing the others first is wasted effort. Scan volume,
cross-AZ traffic, and idle compute are the three shapes a dominating bar usually takes, each with
its own specific lever (pruning layout, locality and rack awareness, autoscaling or suspension),
and a lever's saving is a measured ratio against the actual bill, never a guess. Every lever that
lowers one cost has a second-order cost of its own, priced alongside the saving. A provider price
change can shift which class dominates, so the waterfall is re-run on fresh prices, not assumed to
hold.

</section>

<section data-section="internals">

## Internals

None claimed independently here. FinOps practice, cloud pricing models and infrastructure as
code (Chapter 10 §10.4), and cloud-warehouse billing internals beyond what's directly quoted
(Chapter 6 §6.5) are named but not re-derived. This topic teaches only the *design response* —
pricing per unit, the waterfall, the lever, the second-order cost — not the provider billing
mechanics underneath it.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab. `cost_waterfall()` and `dominating_class()`
rank five stated cost classes and find the one that dominates, against
`apply_pruning_layout_lever()`'s own measured reduction ratio. `lever_with_second_order_cost()`
shows a lever's saving partly eaten by its own second-order cost, and
`waterfall_after_price_change()` shows the dominator shifting when one class's price changes
sharply.

</section>

<section data-section="production">

## Production failures this topic warns about

**Optimizing before measuring.** The hook is this failure exactly: a month of cluster tuning
saves little, because the actual dominant cost was an unwatched query's scan volume the whole
time. The fix isn't more tuning — it's running the waterfall first, so effort lands on the class
that actually dominates.

**Assuming last quarter's dominator still holds.** A provider's price change, or a design change,
can shift which class dominates. Treating the waterfall as a one-time finding instead of a
repeatable check means missing the moment a different lever becomes the right one.

</section>

<section data-section="frontier">

## Frontier

None claimed. Cost-per-unit pricing and waterfall analysis are established FinOps practice, not
an emerging technique. Provider price sheets themselves change often, which is exactly why the
method re-runs rather than memorizes a dominator.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every topic so far has produced one piece of a design: an SLO, an estimate, a shape, a layout, an
engine, a correctness plan, a failure table, a cost. The next topic is the skill of putting them
in front of someone and defending them: stating the alternatives, recording the decision, and
saying what would change your mind.

</section>
