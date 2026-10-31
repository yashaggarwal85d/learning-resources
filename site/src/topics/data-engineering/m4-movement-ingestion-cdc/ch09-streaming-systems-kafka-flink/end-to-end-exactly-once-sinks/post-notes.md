<section data-section="outcomes">

## Outcomes

A toy two-phase-commit sink confirms a write staged by pre-commit survives a crash before
checkpoint-complete with zero loss and zero duplicates. A toy idempotent-upsert sink confirms a
retried write collapses into one row. A toy timeout model confirms a transaction timeout shorter
than the checkpoint interval loses every single staged write, while a correctly configured one
survives. All three are measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Setting a transaction timeout shorter than the checkpoint interval.** Every checkpoint's
staged write silently expires before it can commit — a real, documented Flink Kafka-sink
misconfiguration, invisible until a reconciliation job finds the gap.

**Assuming idempotent-upsert survives non-deterministic processing.** If a retry computes a
different value than the original attempt (a random id, a wall-clock timestamp), the "same"
write is not actually the same write, and the upsert overwrites with wrong data instead of
preventing a duplicate.

**Treating an exactly-once pipeline as safe around side effects.** An email sent or a payment
API called cannot be undone by any database transaction — the exactly-once *effect* is simply
false the moment such a side effect exists in the pipeline.

</section>

<section data-section="frontier">

## Frontier

Flink's own `TwoPhaseCommitSinkFunction` implementation for checkpointed jobs, in full, is a
later topic (named here, not retaught). CDC's own exactly-once-to-a-sink caveats were already
covered in an earlier chapter, used by name.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A deterministic id is one specific way to make a retried write harmless. The general version of
that idea — tracking which event ids have already been applied, at all — is its own topic, and
it's needed even when no transaction or two-phase sink exists at all.

</section>
