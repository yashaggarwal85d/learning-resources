<section data-section="outcomes">

## Outcomes

A real offset-for-times lookup confirms a consumer can jump straight to the first offset at or
after a given moment. A real scoped replay confirms a partition- or time-range-bound replay
touches only what was actually wrong. A real backfill-source chooser confirms data within tiered
storage's retention is pulled from there, and otherwise falls back to the lakehouse. A real
overwrite-versus-versioned-sink comparison confirms an in-place overwrite destroys the original
value, while a versioned write keeps both. All four are measured directly against the models' own
state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own; the chapter's 9.2 lab lives in topics 11, 17, and 18.

</section>

<section data-section="production">

## Production failures this topic warns about

**Replaying without scoping.** Re-running an entire topic from the beginning when only one
partition or one time range was actually wrong wastes time and risks touching records that were
never broken.

**Overwriting the original during a replay.** Without a versioned output, there's nothing left to
diff a replay's result against — no way to confirm the fix actually worked, or to roll back if it
didn't.

**Forgetting to suppress side effects.** A replay that re-triggers every downstream email, webhook,
or notification a second time turns a data fix into a user-facing incident of its own.

</section>

<section data-section="frontier">

## Frontier

Choosing a replay's backfill source assumes the lakehouse's own raw layer and table format are
already reliable places to reconstruct history from — that reliability is the lakehouse's own
territory (Chapter 6, Chapter 8), used here by name.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every topic so far has assumed producers and consumers agree on what a record's fields mean. The
moment a producer changes its schema without warning, that agreement breaks — and a schema
registry is the contract that's supposed to stop it. That's next.

</section>
