---
id: de.data-vault-2-modeling
title: Data Vault 2.0 modeling
---

<section data-section="outcomes">

## After this topic you can

- Model a business domain as hubs, links and satellites, instead of reaching straight for a
  normalized or dimensional table design.
- Explain why hash keys enable insert-only parallel loading in a way sequence keys don't, by
  pointing to the specific load-order dependency a hash key removes.
- Use PIT and bridge tables to keep a Data Vault query tractable, and say exactly what each one
  pre-resolves at load time instead of query time.
- Judge when Data Vault's auditability is worth its join cost against the 3NF and star
  alternatives this topic's own lab measures directly, rather than taking the tradeoff on faith.

</section>

<section data-section="internals">

## A little deeper

The lab behind this topic's central comparison was built fresh, not borrowed: no `customers` or
`products` table exists in this sandbox's own public schema (a `customers` table does exist, but
only inside an unrelated `join_demo` schema, which is not this chapter's domain). A small
customer/order/product domain was modeled four separate ways — 3NF, a star schema with the customer
dimension already resolved as a type-two slowly changing dimension, a raw Data Vault of hubs, links
and satellites, and that same Data Vault with a point-in-time table added — and the same "what was
this customer's address on this order's date" query was run against all four. Every one returned the
identical, correct answer, confirmed directly rather than assumed. The literal join count in each
query's own SQL text is what the reveal shows: one join apiece for 3NF and the star schema, four
joins plus a correlated as-of lookup for raw Data Vault, and three joins with no correlated lookup
once a point-in-time table pre-resolves that lookup at load time instead.

The hash-key determinism claim is the one piece of this topic that isn't drawn from a database at
all: two independent calls, standing in for two loading processes that never communicate, hash the
identical business key and land on the identical result, checked directly in `examples.py` rather
than asserted from the sourced text alone. That determinism is the entire mechanism behind Data
Vault's claim to insert-only parallel loading. A sequence-generated key cannot offer the same
guarantee, because a child row's loader has to look up its parent's already-assigned key before it
can proceed — a load-order dependency that simply doesn't exist when every loader can derive the
same key on its own, from the same business key, with nothing to coordinate.

</section>
