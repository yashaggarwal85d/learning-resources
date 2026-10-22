Last verified against these sources: 22 October 2026, with the three-schema (plus PIT) lab and the
hash-key determinism check both run directly on this session's PostgreSQL sandbox and Python.
Expert sign-off: pending.

- Wikipedia, "Data vault modeling": [en.wikipedia.org/wiki/Data_vault_modeling](https://en.wikipedia.org/wiki/Data_vault_modeling). Hub, link, satellite definitions and the parallel-loading rationale, citing Dan Linstedt's own methodology.
- PuppyGraph, "What Is Data Vault? Architecture & Modeling": [puppygraph.com/learn/what-is-data-vault](https://www.puppygraph.com/learn/what-is-data-vault). Hash keys vs. sequence keys for parallel loading; PIT and bridge structures.
- WhereScape, "What Is Data Vault 2.0 and How Does It Improve on Data Vault?": [wherescape.com/blog](https://www.wherescape.com/blog/data-vault-2-0/). PIT and bridge tables, and the query-performance problem they solve.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-vault-2-modeling:%20).
