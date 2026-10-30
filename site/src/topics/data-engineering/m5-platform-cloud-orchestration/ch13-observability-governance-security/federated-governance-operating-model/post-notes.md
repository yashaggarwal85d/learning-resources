<section data-section="outcomes">

## Outcomes

Divide a governance rule set between the central body, the platform and the domain team for the
shop's three domains; state reverse Conway's law with its source and apply it to a proposed team
split; decide for six given decisions whether they are automated or human and name the steward;
build and run the self-serve registration check (schema, contract, classification tags) that
blocks an unregistered table from becoming discoverable and show it rejecting a table with a
missing tag.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `register_table` runs three gates in order — `check_schema`, `check_contract`,
`check_classification` — against each candidate table, stopping and returning a named reason at
the first failure, and admitting the table to a shared catalog dict only if all three pass. Three
synthetic tables exercise it: a well-formed one (admitted), one missing its contract's `version`
field (rejected by the contract gate), and one with a free-text column carrying no
`classification` key at all (rejected by the classification gate, echoing topic 4's
discovery-false-negative theme). `DECISIONS` lists six governance calls, split and asserted
exactly 3 automated (each with a stated rule) and 3 human (each with a named steward and a
reason).

</section>

<section data-section="lab">

## Lab: hosts the §13.4 chapter lab

This topic hosts the governance-split and self-serve-registration half of the §13.4 lab: dividing
policy, ownership and tooling across the shop's three domain teams and two compliance regimes, and
building the registration flow that validates schema, contract and classification tags before a
table becomes discoverable. The lineage collection itself is topic 11's, referenced here and not
repeated.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "automated" as "no judgement involved."** A rule over an attribute (a missing field, an
absent owner) can run itself. A retention exception, a criticality call, or classifying a column a
scanner never tagged all need a reason a machine cannot supply — skipping the named steward on
these just moves the judgement call later, to whoever discovers the mistake.

**Rejecting a column for a missing value instead of a missing tag.** The classification gate in
this topic's own code checks for the presence of a `category` key, not that its value is non-null
— a non-personal column legitimately carries `category: None`. Checking for a non-null value
instead would reject every correctly-tagged non-personal column, a bug this build caught on its
first run before shipping.

</section>

<section data-section="frontier">

## Frontier

Multi-tenant isolation and compliance is the *(skipped)* syllabus topic, named once here with the
isolation spectrum. Team topology and stakeholder management (Chapter 19, §19.1) go deeper later
and are only pointed to by name, not taught here — no Chapter 19 entry exists in `registry.ts` yet.
Contract enforcement in CI (Chapter 11 §11.4) and compliance regimes (Chapter 10 §10.5) are both
declared gaps, logged in `OUTLINE.md` rather than guessed at, the same pattern topics 11 and 12
used for their own unbuilt Chapter 11 dependencies.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A governance model is judged the day somebody wants to change something. Before a schema change or
a deprecation, the question is who will be hurt, and the lineage graph can answer it. The last
topic of this chapter is computing exactly that: lineage-driven impact analysis.

</section>
