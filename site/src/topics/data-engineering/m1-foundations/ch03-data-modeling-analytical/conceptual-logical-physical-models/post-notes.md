---
id: de.conceptual-logical-physical-models
title: Conceptual, logical and physical models
---

<section data-section="outcomes">

## After this refresher you can

- Name the three levels a schema passes through — conceptual, logical, physical — and say which business question
  each one answers: what exists, how it is shaped, how it runs.
- Tell a conceptual claim from a logical one: a conceptual model names entities and relationships; it deliberately
  leaves cardinality and storage to the logical level.
- Point to the artifact each level actually produces: a stakeholder-readable entity list for the conceptual level,
  an entity-relationship diagram with cardinality for the logical level, a `CREATE TABLE` statement for the
  physical level.
- Recognize when logical and physical have merged in practice, for a single target engine, and why keeping them
  separate on paper still matters when more than one engine or more than one logical model is in play.

</section>

<section data-section="internals">

## A little deeper

Wikipedia's "Data modeling" article frames this as a pipeline: requirements go in, and three successive model types
come out, each one translated from the last. The conceptual model is explicitly aimed at a non-technical audience —
its job is agreement on what exists, not agreement on structure. That is a deliberate scoping choice, not an
oversight: a conceptual model that already fixed cardinality or storage would stop being a document a stakeholder
without database background could sign off on, and it would start making engineering commitments before anyone who
should weigh in on them has had the chance.

The logical model is where that structure gets fixed, but still without picking an engine — the same logical model
could, in principle, become more than one physical model, built for different database products. That gap is also
why the source explicitly flags the logical/physical boundary as the one most often blurred in real projects:
once a team commits to a single target engine from the start, there is little practical reason to keep drawing a
platform-neutral logical model that no other engine will ever implement. The distinction still earns its keep
whenever a design has to survive more than one engine, or whenever a stakeholder conversation needs to happen
before anyone commits to column types at all.

</section>
