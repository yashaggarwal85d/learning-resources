## DuckDB — "Why DuckDB"

URL: https://duckdb.org/why_duckdb
Version: DuckDB documentation (accessed 2026-10-30)

> SQLite is the world's most widely deployed DBMS. Simplicity in installation, and embedded in-process operation are central to its success. DuckDB adopted the ideas of simplicity and in-process operation – but later stepped out of the realm of in-process operations through the Quack protocol.

> DuckDB has no external dependencies, neither for compilation nor during run-time. This greatly simplifies deployment and integration in other build processes. To build DuckDB, all that is required is a working C++17 compiler.

Contents (for the coverage map):
1. DuckDB's own stated design lineage: in-process, embedded operation (as SQLite's defining trait) adopted deliberately, not accidentally, as the reason a single-node engine is viable at all.
2. DuckDB's own claim of zero external dependencies, which is the concrete form of "no server to operate" — the team-skill cost this topic's decision card weighs against a distributed engine.

## Martin Kleppmann — "Turning the database inside-out" (talk abstract)

URL: https://martin.kleppmann.com/2015/11/05/database-inside-out-at-oredev.html
Version: Øredev talk abstract, 5 November 2015 (accessed 2026-10-30)

> Databases are global, shared, mutable state. That's the way it has been since the 1960s, and no amount of NoSQL has changed that. However, most self-respecting developers have got rid of mutable global variables in their code long ago. So why do we tolerate databases as they are?

> What we have to gain from turning the database inside out? Simpler code, better scalability, better robustness, lower latency, and more flexibility for doing interesting things with data.

Contents (for the coverage map):
1. Kleppmann's own framing of a database as mutable global state, and his argument for treating derived views (materialized from streams) as the alternative — the direct ancestor of this topic's "one system of record, several derived serving stores" claim.
2. Kleppmann's own named trade-off for that approach: simpler code and lower latency are gained, which this topic ties to pre-aggregation's own cost (staleness, fixed shape) rather than treating the gain as free.
