---
id: de.inmon-vs-kimball-warehouse
title: Inmon vs Kimball warehouse philosophies
---

<section data-section="outcomes">

## After this topic you can

- Draw both reference architectures — Inmon's single normalized model feeding dependent marts, and
  Kimball's conformed bus matrix feeding independent dimensional marts directly.
- Place a given team's constraints (time pressure, integration need, expected rate of change)
  against the three axes this topic names, and justify a choice rather than reciting a preference.
- Explain concretely how ELT on a columnar engine changed the calculus Inmon and Kimball originally
  argued over, rather than treating that shift as a vague "things got better" claim.

</section>

<section data-section="internals">

## A little deeper

The three axes in this topic's reveals are not an attempt to crown one methodology as universally
better; they are this topic's own synthesis of two well-documented, genuinely opposed approaches,
applied honestly to three concrete scenarios. Time to value and integration cost resolve cleanly
because the two methodologies were quite literally built to optimize for different things: Kimball's
bus architecture is an incremental approach decomposed by business process specifically so a team can
ship value before an enterprise-wide model exists at all; Inmon's normalized model is a single
integration point specifically so a shared concept like "customer" is settled once rather than
separately in every mart. Tolerance to change is the one axis that genuinely does not resolve cleanly,
and this topic says so directly rather than forcing a verdict: a new business process slots into the
bus without disturbing existing stars, while a changed business rule is fixed once in the normalized
model instead of being chased down across many marts. Both are real, and neither subsumes the other.

The ELT reveal deserves a clearer line drawn than the reel has room for. The original Inmon-versus-
Kimball argument assumed that transforming data was expensive, and that expense forced a team to
commit upfront to one direction: build the whole model before anything ships, or ship one process and
defer integration. Cloud columnar warehouses changed the economics underneath that assumption,
specifically by making storage cheap enough that loading data raw is no longer wasteful, and making
compute fast enough that transforming it afterward, repeatedly, is no longer a cost a team has to plan
around in advance. That is why this topic frames the effect as narrowing the original tradeoff rather
than erasing it: a team can now start with Kimball's incremental marts and fold in Inmon-style
integration work later, without either an all-or-nothing upfront bet or the slower path previously
required to get real integration. The tradeoff between the two philosophies is still real — it is
simply no longer as expensive to defer.

</section>
