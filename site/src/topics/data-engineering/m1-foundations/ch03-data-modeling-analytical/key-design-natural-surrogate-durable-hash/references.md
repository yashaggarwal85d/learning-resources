Last verified against these sources: 22 October 2026, with the generation-cost, index-locality, natural-key and
surrogate-key measurements all run directly on this session's PostgreSQL sandbox (clusters at version 16 and
version 18), and the hash-collision figures computed directly by the birthday-bound formula. Expert sign-off:
pending.

- PostgreSQL docs, "CREATE SEQUENCE": [postgresql.org/docs/current/sql-createsequence.html](https://www.postgresql.org/docs/current/sql-createsequence.html). Sequence gaps and cross-session ordering under caching.
- PostgreSQL docs, "UUID Functions": [postgresql.org/docs/current/functions-uuid.html](https://www.postgresql.org/docs/current/functions-uuid.html). gen_random_uuid()/uuidv4() and uuidv7().
- RFC 9562, "Universally Unique IDentifiers (UUIDs)": [rfc-editor.org/rfc/rfc9562.html](https://www.rfc-editor.org/rfc/rfc9562.html). The UUIDv7 bit layout, and random UUIDs' own index-locality problem.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=key-design-natural-surrogate-durable-hash:%20).
