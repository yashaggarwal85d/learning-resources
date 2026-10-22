# Sources — Data Vault 2.0 modeling

Fetched: 2026-10-22.

## Wikipedia, "Data vault modeling"
URL: https://en.wikipedia.org/wiki/Data_vault_modeling

> "The Data Vault Model is a detail oriented, historical tracking and uniquely linked set of normalized tables that support one or more functional areas of business. It is a hybrid approach encompassing the best of breed between 3rd normal form (3NF) and star schema. The design is flexible, scalable, consistent and adaptable to the needs of the enterprise"

> Link – captures the relationship (often many-to-many) between hubs; the participating hub keys define the grain of the relationship.

> Satellite – contains descriptive attributes and their history associated with a hub or link; satellites are append-only, so every change is preserved (similar in effect to Type-II history in dimensional models).

> Hubs contain a list of unique business keys with low propensity to change. Hubs also contain a surrogate key for each Hub item and metadata describing the origin of the business key.

> The hubs and links form the structure of the model, but have no temporal attributes and hold no descriptive attributes.

> Data vault is designed to enable parallel loading as much as possible,

> so that very large implementations can scale out without the need for major redesign.

> Since the hubs are not joined to each other except through links, you can load all the hubs in parallel. Since links are not attached directly to each other, you can load all the links in parallel as well. Since satellites can be attached only to hubs and links, you can also load these in parallel.

> Data is never deleted from the data vault, unless you have a technical error while loading data.

> Business Vault – a derived layer that applies business rules and query-assistance structures (e.g., PIT and bridge tables) to facilitate downstream consumption.

## PuppyGraph, "What Is Data Vault? Architecture & Modeling"
URL: https://www.puppygraph.com/learn/what-is-data-vault

> The technique models three things separately: a hub holds the unique list of business keys for one concept (a customer number, a product SKU), a link holds the relationships between business keys from one or more hubs, and a satellite holds the descriptive attributes about a hub or link, tracked over time.

> A deterministic hash key, often an MD5 or SHA-256 digest, can replace a sequence-generated surrogate key on hubs and links. Hubs hash a standardized enterprise or integration business key, while links hash a consistently ordered combination of participating keys. When every loader uses the same semantic key definition and canonicalization rules, it can derive the same key independently and avoid looking up a parent's stored surrogate key before loading.

> With generated surrogate keys, a link or satellite loader must obtain the parent's stored key, which conventionally creates load-order dependencies. Deterministic hash keys calculated in staging from consistently normalized business keys remove that parent-key lookup, allowing hubs, links, and satellites to load concurrently when orchestration and referential-integrity settings permit.

> Point-in-time (PIT) structures identify the applicable satellite records for selected snapshot times, so a query can avoid resolving several independent time-variant joins on every execution. Bridge structures collect keys across commonly traversed hubs and links to simplify multi-join paths, especially in multi-tier hierarchies.

## WhereScape, "What Is Data Vault 2.0 and How Does It Improve on Data Vault?"
URL: https://www.wherescape.com/blog/data-vault-2-0/

> Join performance improves because you're joining on fixed-length 16-byte or 32-byte values instead of variable-length composite keys. Parallel loading becomes simpler because multiple processes can independently generate identical hash values without coordinating.

> Point-in-time (PIT) tables pre-materialize temporal joins across multiple satellites.

> A customer might have satellites for contact information, credit rating, and purchase preferences. To answer "what did this customer look like on March 15, 2024?" you need to join all three satellites with temporal logic. Do this for every customer in every query, and performance suffers.

> Bridge tables flatten complex link structures for common query patterns. If your reporting layer constantly joins through five links to answer a single question, a bridge table can pre-compute those joins.

## Measured directly
URL: n/a — measured on this session's PostgreSQL sandbox; nothing dropped or created that doesn't belong to
this topic's own throwaway lab tables.

The three-schema lab (3NF, star, raw Data Vault, and Data Vault plus a PIT table) is built fresh on this
session's PostgreSQL sandbox — no `customers`/`products` tables exist here in the `public` schema (confirmed:
a `customers` table exists only in an unrelated `join_demo` schema) — and the "what was this customer's address
on this order's date" query is run against all four, with the literal join count in each query's own SQL
recorded in `examples.py`, not estimated. The hash-key parallel-load property (two independent processes
deriving the identical hub key with no coordination) is computed directly in Python, not merely asserted.
