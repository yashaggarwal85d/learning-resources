# Fact-check — Data Vault 2.0 modeling

| # | Claim | Status |
|---|---|---|
| 1 | The Data Vault Model is a detail-oriented, historical-tracking, uniquely linked set of normalized tables, a hybrid of 3NF and star schema. | Confirmed, quoted directly (Wikipedia, "Data vault modeling", citing Linstedt's original overview). |
| 2 | Hubs contain a list of unique business keys with low propensity to change, plus a surrogate key and origin metadata, and no descriptive attributes. | Confirmed, quoted directly (same source). |
| 3 | Links capture the relationship (often many-to-many) between hubs; the participating hub keys define the grain of the relationship. | Confirmed, quoted directly (same source). |
| 4 | Satellites contain descriptive attributes and their history, associated with a hub or link; satellites are append-only, so every change is preserved. | Confirmed, quoted directly (same source). |
| 5 | Data is never deleted from the data vault, unless there is a technical error while loading data. | Confirmed, quoted directly (same source). |
| 6 | Data vault is designed to enable parallel loading as much as possible, so large implementations can scale out without major redesign; since hubs/links/satellites are only joined through links, each can be loaded in parallel. | Confirmed, quoted directly (same source, split across two adjacent sentences per the footnote-marker boundary). |
| 7 | A deterministic hash key (MD5 or SHA-256) can replace a sequence-generated surrogate key on hubs and links; every loader using the same key definition can derive the identical key independently. | Confirmed, quoted directly (PuppyGraph, "What Is Data Vault?"). |
| 8 | With generated surrogate keys, a child loader must obtain the parent's stored key first, creating load-order dependencies; deterministic hash keys remove that lookup, letting hubs, links and satellites load concurrently. | Confirmed, quoted directly (same source). |
| 9 | PIT structures identify the applicable satellite records for selected snapshot times, avoiding several independent time-variant joins per query; bridge structures collect keys across commonly traversed hubs/links to simplify multi-join paths. | Confirmed, quoted directly (same source). |
| 10 | Join performance improves with fixed-length hash keys over variable-length composite keys; parallel loading becomes simpler because multiple processes can independently generate identical hash values without coordinating. | Confirmed, quoted directly (WhereScape, "What Is Data Vault 2.0..."). |
| 11 | PIT tables pre-materialize temporal joins across multiple satellites at load time rather than query time; answering "what did this customer look like on a given date" without one means joining every relevant satellite with temporal logic, on every query. | Confirmed, quoted directly (same source). |
| 12 | Bridge tables flatten complex link structures (e.g., a path through five links) for common query patterns. | Confirmed, quoted directly (same source). |
| 13 | The same "as-of address" query returns the identical, correct answer against a 3NF schema, a star schema, a raw Data Vault schema, and a Data Vault schema with a PIT table, built fresh for this topic. | Measured directly: all four schemas built and queried on this sandbox; see `examples.py` and SOURCES.md's "Measured directly" section. |
| 14 | The 3NF and star-schema versions of that query need one join each; the raw Data Vault version needs four joins plus a correlated as-of subquery; the Data-Vault-plus-PIT version needs three joins and no correlated subquery. | Measured directly: the literal join count in each query's own SQL text, recorded in `examples.py`, not estimated. |
| 15 | Two independent loaders hashing the same business key, with no coordination between them, derive the identical hub hash key. | Computed directly in `examples.py` (`hash_key`), verifying the determinism claims 7–8 and 10 describe. |
| 16 | Auditability and source agility are what Data Vault's extra join cost buys, against the 3NF and star alternatives this topic's own lab measures directly. | Reasoned, following CHAPTER.md's own scope: a direct synthesis of the measured join-count difference (claim 14) against the sourced auditability/parallel-loading/resilience claims (1, 5, 6, and the PuppyGraph "Resilience to source-system change" point not separately quoted here since it restates claim 6's structural point) — not itself an external citation. |

No claim in this topic is presented with more certainty than its sourcing supports: every definitional and
structural claim traces to Wikipedia's own text (itself citing Linstedt), PuppyGraph's, or WhereScape's own
text; every join-count and determinism claim is measured or computed directly, not estimated; the
worth-the-cost synthesis is explicitly marked as this topic's own reasoning.
