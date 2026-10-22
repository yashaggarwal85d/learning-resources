# Outline — Inmon vs Kimball warehouse philosophies

1. **Hook.** Two architects, two warehouses built from the same key types this chapter just covered —
   and neither one is simply "right."
2. **Reveal: Inmon's definition, and his direction.** The accepted definition of a data warehouse
   itself is Inmon's own; his approach is top-down, a normalized enterprise model built first, marts
   fed from it after.
3. **Reveal: Kimball's bus, and his direction.** Kimball's own bus architecture: an incremental
   approach, business processes first, conformed dimensions doing the integration work — bottom-up,
   the opposite direction from Inmon's.
4. **Predict.** A team has an urgent deadline and one source system. Which architecture gets them to
   value fastest?
5. **Reveal: time to value favors Kimball's bus.** One business process, one star schema, live —
   building the full normalized model first is the slower path when the deadline is the constraint.
6. **Predict.** A team is integrating a dozen source systems that all need to agree on what
   "customer" means. Which architecture handles that better?
7. **Reveal: integration cost favors Inmon's model.** A normalized enterprise model built once, as
   the single integration point, avoids re-litigating "customer" in every mart; conformed dimensions
   do real work here too, but the normalized model is built for exactly this.
8. **Predict.** The business's own definition of a core entity changes often and unpredictably.
   Which architecture tolerates that better?
9. **Reveal: tolerance to change is genuinely contested.** Kimball's incremental bus can add a new
   process without redesigning everything; Inmon's normalized model can absorb a changed business
   rule in one place instead of many marts — both have a real claim here, not a clean win either way.
10. **Reveal: the three axes, side by side.** Time to value, integration cost, tolerance to change —
    the same three scenarios, two architectures, and the verdict differs by scenario, not by which
    methodology is "better" in general.
11. **Reveal: what ELT on a columnar engine changed.** Quoted directly: cloud columnar warehouses
    drove down storage cost and pushed up processing power, making it far cheaper to load data raw
    and transform it after, rather than before.
12. **Reveal: how that narrows the original gap.** The old argument assumed transforming before load
    was expensive and had to be planned around; cheap, fast, repeatable post-load transforms mean a
    team can start with Kimball's incremental marts and still fold in Inmon-style integration later,
    without the original either-or commitment.
13. **Recap.** Two reference architectures, two directions. The real choice is against three axes,
    not a single verdict — and ELT on a columnar engine narrowed, not erased, the original tradeoff.
14. **Prove it.** A team must onboard a new source system monthly, with no single enterprise model
    agreed yet. Which architecture's own strength does that scenario call for?
