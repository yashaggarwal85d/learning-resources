---
id: de.key-design-natural-surrogate-durable-hash
title: Key design, natural, surrogate, durable, hash
---

<section data-section="outcomes">

## After this topic you can

- Distinguish natural, surrogate, durable and hash keys, and state what each one buys and what it costs,
  instead of treating "key" as one undifferentiated idea.
- Choose a surrogate-generation strategy for a distributed pipeline — sequence, hash, or UUIDv7 — and justify
  the choice against each one's real, measured tradeoffs rather than a rule of thumb.
- Explain why a dimension that gets versioned (SCD2, ahead) needs both a surrogate key and a separate durable
  key, and why neither one can stand in for the other.

</section>

<section data-section="internals">

## A little deeper

The natural-key failure in this topic's reveal is not a hypothetical: a real foreign-key-constrained table pair
was built for this topic, and the exact update a business would actually perform — a customer changing her own
email address — was attempted against it. PostgreSQL refused it outright, because the orders table still
referenced the value about to change. The same event against a surrogate-keyed pair succeeded in one row, and
every order kept resolving by an id untouched by the whole episode. Neither outcome was described secondhand;
both were run.

The generation-cost and locality numbers are measured the same way, against this sandbox's own PostgreSQL
cluster that carries `uuidv7()` (version 18, the only one of this sandbox's two clusters that has it — version
16 does not). A sequence, UUIDv7, and UUIDv4 each generated one hundred thousand keys into a table with a
pre-built index, and a sequence came out fastest every time, UUIDv7 next, UUIDv4 slowest. The same three tables'
indexes were then inspected directly with PostgreSQL's own `pgstatindex()`: the sequence and UUIDv7 indexes
stayed almost identically dense, while the UUIDv4 index came out visibly more bloated — more leaf pages holding
the same row count, each one emptier. That is RFC 9562's own claim about random UUIDs' poor database-index
locality, reproduced directly rather than taken on the RFC's word alone. Two UUIDv7 values generated back to
back on this same cluster shared a long leading substring — the millisecond timestamp the RFC's own bit-layout
figure places in the leading forty-eight bits — while a `gen_random_uuid()` value alongside them shared nothing
with either.

The hash-collision numbers in this topic's closing reveal are computed, not asserted or read off a table someone
else built: the standard birthday-bound formula, applied to the exact bit widths this topic's own sources name
(the 122 random bits RFC 9562 reserves for a version-4 UUID, and the narrower widths a hash key is sometimes
truncated to for storage). A narrow hash reaches even odds of a collision at a surprisingly small number of
generated values; a mid-width hash still carries a real, non-trivial risk at the scale a growing pipeline
actually reaches; a full-width hash does not, by many orders of magnitude. The point of running the computation
rather than citing a caveat is that the risk is a number a team can check against its own expected volume, not a
reason to avoid hash keys altogether.

</section>
