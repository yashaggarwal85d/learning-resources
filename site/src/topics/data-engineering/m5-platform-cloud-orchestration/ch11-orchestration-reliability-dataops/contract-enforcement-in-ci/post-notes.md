<section data-section="outcomes">

## Outcomes

By the end of this topic you can: write an ODCS-conformant contract for a table including schema, quality rules, SLAs and ownership; classify a proposed change against the contract and show the CI gate correctly blocking a breaking one; demonstrate a runtime enforcement check catching a violation a CI gate couldn't see in advance; wire automated owner notification from a lineage graph.

</section>

<section data-section="internals">

## Internals

The breaking-change classifier's real safety property is conservative by construction: it only calls a removed field "migrated" when some new field in the proposed schema explicitly names what it deprecates. A rename that merely happens to look similar, with no such link, is correctly treated as a silent disappearance rather than a documented migration -- which is exactly the premature-contract mistake topic 14 warned about by hand, now caught automatically. ODCS's own documentation is explicit that its sections are layered, not independent: schema "supports both a business representation of your data and a physical implementation," and the data quality section is "tightly linked to the schema described in the previous section" -- a quality rule is only meaningful once the schema it checks against is itself declared. The contract's SLA section and topic 11's error-budget vocabulary describe the same kind of commitment at two different layers: an SLO is a target a platform team tracks operationally, while an SLA entry in the contract is that same target written down as a promise to a specific named consumer, which is what makes it something CI or runtime enforcement can actually check.

</section>

<section data-section="lab">

## Lab

Against a real ODCS-conformant contract built for the shop's own fct_orders, a straight rename of `customer_id` to `cust_id` with no migration path is classified breaking with no path and blocked by the producer's own CI gate. The identical rename, proposed only once a replacement column names what it deprecates, is classified breaking with a migration path and let through, and a purely additive column addition is classified non-breaking. Separately, a real out-of-band write -- one that never goes through a pull request, and so never runs through CI at all -- is still caught by a runtime check against the same contract, flagging both a missing required field and a negative amount neither CI run ever saw. Finally, an approved change to fct_orders is traced through a real lineage graph to exactly three downstream tables, owned by three different teams, every one of them notified automatically rather than relying on the producer to remember who reads the table.

</section>

<section data-section="production">

## Production

GoCardless's own account of the problem predates ODCS specifically as a standard: "breaking changes and data migrations will be a regular part of the applications evolution and will be done without knowledge of how it has been used downstream, leading to breaking changes affecting key reports and data-driven products." The pattern this topic demonstrates -- contract-as-code, enforced in CI, with lineage-driven notification -- is a later, more structured answer to exactly that informal pain.

</section>

<section data-section="frontier">

## Frontier

This topic reuses, rather than reinvents, vocabulary and mechanisms from three earlier topics: the expand/migrate/contract rollout discipline (topic 14), the SLI/SLO/error-budget vocabulary inside the contract's own SLA section (topic 11), and the lineage mechanism driving notification (topic 8's software-defined-asset model and Chapter 13's tooling), used here as a small synthetic stand-in rather than independently built or re-taught. The modeling view of a data contract, and the organizational ownership model it sits inside, are Chapter 3's and Chapter 13's own topics (`Data contracts as a modeling artifact`, `Federated governance operating model`), used here and not re-taught.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A contract enforced in CI closes the loop this chapter opened: a schedule that runs the right tasks (11.1), a model chosen for the work's real shape (11.2), a platform that knows when it's broken and recovers (11.3), and a pipeline that cannot ship a change its own promises would reject (11.4). The next chapter turns from running the platform to packaging and delivering it: containers and Kubernetes.

</section>
