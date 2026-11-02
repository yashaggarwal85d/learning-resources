<section data-section="outcomes">

## Outcomes

By the end of this topic you can: split a breaking schema change into expand, migrate and contract steps and show each step is individually safe; choose a schema-registry compatibility mode for a given migration and predict what it will reject; bound a dual-write window and justify the bound; connect this rollout discipline to the CI gate and the CDC mechanism that depend on it.

</section>

<section data-section="internals">

## Internals

Confluent's own documentation explains why BACKWARD, not FORWARD, is the schema registry's default: "the main reason that BACKWARD compatibility mode is the default, and preferred for Kafka, is so that you can rewind consumers to the beginning of the topic" -- a Kafka-shaped reason that doesn't automatically generalize to every registry. The two rules are not mirror images of the same idea: BACKWARD asks whether a reader on the new schema can process old data, FORWARD asks the opposite direction, and a change can clear one cleanly while failing the other, which is exactly why FULL names a third, stricter requirement. Google Cloud's own material on database migration names the sharpest risk of dual-write directly: "two database writes are two separate transactions; you might encounter a failure after the first finishes and before the second finishes," leaving the two copies inconsistent -- the real cost a dual-write window asks a producer to carry for its duration.

</section>

<section data-section="lab">

## Lab

This topic's own real rollout runs a column rename on the shop's `orders` schema, `amount` to `total_amount`, through all three phases. A toy but genuine compatibility checker confirms the expand step passes both the backward and forward rules, and confirms that contracting straight from the expand schema -- skipping migrate entirely -- fails forward compatibility before any real consumer is even involved. A second real simulation ticks three consumers through a measured dual-write window, migrating two of them and deliberately leaving the third behind; a premature contract attempt raises a genuine `KeyError` naming that exact consumer, while the two already-migrated consumers are completely unaffected. Only once every consumer has actually migrated does the real, final contract run cleanly.

</section>

<section data-section="production">

## Production

The hook's real mistake was never the rename. It was treating "add the compatibility check" and "wait for every consumer to actually finish migrating" as the same step, when passing a schema-registry check only proves the schema change itself is safe -- it says nothing about whether any particular consumer has gotten around to switching over yet. The practical fix is tracking migration completion as its own explicit, checked condition, separate from and after the compatibility check, before contract is ever allowed to run.

</section>

<section data-section="frontier">

## Frontier

This rollout discipline is exactly what a contract-enforcement CI gate, later in this chapter, checks for automatically before a breaking schema change ever reaches production -- the gate verifies the discipline happened, rather than performing it. The same three-phase shape reappears, under a harder constraint, in CDC schema evolution: a change-data-capture stream can't pause between phases the way a batch deploy can, since downstream consumers are reading continuously, so the streaming version has to carry the same expand, migrate and contract phases without ever declaring a clean stopping point between them.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A rollout done carefully by hand is still something a human has to remember to do carefully every time. The chapter's last section is about building that discipline into the testing and deployment pipeline itself, so it happens whether or not anyone remembers.

</section>
