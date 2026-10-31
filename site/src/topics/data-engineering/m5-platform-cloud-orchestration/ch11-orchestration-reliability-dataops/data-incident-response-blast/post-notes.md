<section data-section="outcomes">

## Outcomes

By the end of this topic you can: run the five-stage incident loop on an injected stale-source and duplicate-load incident; compute a blast radius from a lineage graph instead of guessing it; write a runbook entry and attach asset-level ownership so an alert routes correctly; name the incident-command roles and why having them prevents a specific failure mode.

</section>

<section data-section="internals">

## Internals

Google's own account of the Incident Command System names three load-bearing roles for a data incident: the commander, who "holds the high-level state about the incident" and assigns responsibility; the Ops lead, the only person who should be modifying the system while the incident is open; and Communication, "the public face of the incident response task force." A blameless postmortem, per the same source, "must focus on identifying the contributing causes of the incident without indicting any individual or team" -- not because mistakes don't matter, but because a culture of blame makes people stop reporting the near-misses that would have caught the next one earlier. Asset-level ownership and on-call routing turn that into a mechanism: an alert on a specific table reaches the person who owns it, not a generic rotation that has to go find them.

</section>

<section data-section="lab">

## Lab

This topic hosts the stale-source and duplicate-load game-day legs of the 11.3 chapter lab, run against a real Dagster asset graph rather than described abstractly. Forty downstream "dashboard" assets sit below the shop's own pipeline; only a small, deliberately planted subset actually declares a dependency on the table an incident affects. Walking the asset graph's own real `get_children` edges computes that exact subset, verified against the planted answer in `examples.py`. A second real experiment seeds three of thirty day-partitions with a duplicate-row incident, quarantines exactly those three, and verifies by real row count that a targeted backfill of only those three restores the correct total without touching anything else.

</section>

<section data-section="production">

## Production

The hook's real cost was never the duplicate rows themselves -- a known, bounded problem with a known fix. It was the hours spent, under pressure, figuring out who else was affected, because the tooling to answer that question with certainty existed but had never actually been exercised. The practical fix is making the lineage query a habit before an incident, not something reached for cold during one, and making "contain" mean quarantine rather than delete, so the evidence a postmortem needs still exists afterward.

</section>

<section data-section="frontier">

## Frontier

OpenLineage names the same problem this topic solves inside one asset graph, but at the scale of an organization whose lineage spans more than one orchestrator, warehouse or processing framework: "an open framework for data lineage collection and analysis," with integrations across Airflow, Spark, dbt and others reusing one shared specification instead of each tool inventing its own. The underlying idea doesn't change -- a declared dependency graph answers blast-radius questions that guessing cannot -- only the scope of what one graph has to cover.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Containing and repairing one bad table assumes the rest of the platform is still there. The next topic is the scenario where it isn't: a whole region, bucket or cluster, and what plan existed before that moment, not after it.

</section>
