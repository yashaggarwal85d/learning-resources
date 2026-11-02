# References

- Confluent Platform Documentation, "Schema Evolution and Compatibility": https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html
- Martin Fowler's bliki, "Parallel Change" (Danilo Sato, 2014): https://martinfowler.com/bliki/ParallelChange.html
- Google Cloud Architecture Center, "Database migration: Concepts and principles (Part 1)": https://cloud.google.com/architecture/database-migration-concepts-principles-part-1

Last verified: 2026-10-31. Expert sign-off: pending.

Software run in this sandbox: Python 3 standard library (`dataclasses`) for the toy Confluent-style compatibility checker and the real expand/migrate/contract rollout simulation on the shop's own `orders` schema. Every Confluent, Fowler and Google Cloud quote is verified word for word against the fetched source text.
