# Outline — de.connection-pooling-database-clients

## Learning outcomes

1. Measure a real TCP+TLS/auth connection-setup cost against this sandbox's own PostgreSQL
   cluster, against reusing an already-open connection.
2. Size a connection pool with Little's Law from a measured acquire-and-hold time and a target
   throughput.
3. Contrast PgBouncer's session vs. transaction pooling modes, and name and reproduce the
   prepared-statement caveat transaction pooling introduces.
4. Use a server-side cursor with a tuned fetch size, and measure three bulk-load paths
   (`executemany`, `COPY`, an Arrow-native ADBC driver) against the same data.

## Reel steps (storyboard)

1. **Hook: does opening a connection actually cost something real?**
   - `fig`: "arrow, pandas and polars all stayed in-process — does leaving the process for a real database connection actually cost something?"
   - Visual: two rows, "in-process so far" / "claimed" vs. "a real connection costs?" / "not yet measured".
   - Narrator's line: names the real handoff (everything before this stayed inside one process; this is the first place a pipeline genuinely leaves it).

2. **Reveal: connection setup cost**
   - `fig`: "a fresh connection vs. reusing one already open — measured on this sandbox's own cluster"
   - Visual: "fresh connect, each time" / "measurably slower" vs. "one connection, reused" / "far faster, measured".
   - Takeaway: a pool's whole reason to exist is this one gap, measured directly rather than assumed.

3. **Reveal: Little's Law pool sizing**
   - `fig`: "a measured hold time, fed into one formula, gives a concrete pool size"
   - Visual: "measured hold time" / "real, not assumed" vs. "target throughput" / "a chosen number" vs. "pool size needed" / "the formula's answer".
   - Takeaway: a pool size isn't a guess — it's a measured hold time times a target throughput, the same formula a supermarket queue obeys.

4. **Predict: does a prepared statement survive into a client's next request, under transaction pooling?** (within first four ✓)
   - `fig`: "the same client, prepares now, asks again later — does transaction pooling remember?"
   - Options: "Yes — it's the same client's own connection the whole time" / "No — a different request can land on a different backend" (correct).
   - Explain: PgBouncer's own docs state transaction pooling hands a backend back to the pool the moment a transaction ends, and the next transaction — even the same client's own next one — isn't guaranteed the same backend.

5. **Reveal: the prepared-statement caveat, reproduced**
   - `fig`: "prepared here, discarded by someone else, denied here — the exact failure, reproduced"
   - Visual: "client prepares" / "on one backend" vs. "another client resets that backend" / "same shared backend" vs. "client re-asks" / "statement gone".
   - Takeaway: a prepared statement lives on the physical backend, not the logical client — transaction pooling is what exposes that difference.

6. **Reveal: session pooling, the same test, survives**
   - `fig`: "the identical test, over session pooling instead — the statement survives"
   - Visual: "session pooling" / "one dedicated backend, whole session" vs. "same prepare-then-execute" / "always succeeds".
   - Narrator's line: the contrast makes the trade concrete — session pooling supports everything but gives each client its own backend the whole time it's connected, so it can't share connections as tightly.

7. **Reveal: server-side cursor, a tuned fetch size**
   - `fig`: "the same large result, pulled whole vs. pulled in batches — measured peak memory"
   - Visual: "pulled whole (fetchall)" / "higher peak memory" vs. "pulled in batches (server-side cursor)" / "lower peak memory, measured".
   - Takeaway: a server-side cursor trades server-side state for client-side memory — worth it exactly when the result is too big to hold at once.

8. **Reveal: three bulk-load paths, measured**
   - `fig`: "the same rows, loaded three ways — row-by-row, COPY, and an Arrow-native driver"
   - Visual: "row-by-row (executemany)" / "slowest, measured" vs. "COPY" / "fastest, measured" vs. "Arrow-native driver" / "close behind — it runs COPY underneath".
   - Takeaway: an Arrow-native bulk driver isn't a different wire protocol — by its own documentation it's COPY underneath, with an Arrow-shaped front door.

9. **Recap**
10. **Prove it** — a production scenario: a service pools through PgBouncer in transaction mode and relies on a prepared statement surviving across requests; diagnose the failure and the fix.

## Engagement arc

- Hook (1): the real handoff from topic 32 (everything stayed in-process; this is where it leaves).
- Predict within first four: step 4.
- Surprising number: step 2 (fresh-connect ratio) and step 5 (a real, deterministic reproduction of a documented failure).
- Takeaways: steps 2, 3, 5, 7, 8 (five, well over the minimum three).
- Recap: step 9. Prove it: step 10, synthesis task.

## Post-notes headings

- **Outcomes** — restated above.
- **Lab** — feeds the §4.2 chapter lab's connection-pooling and bulk-load parts (per `CHAPTER.md`), measured against the sandbox's own PostgreSQL cluster.
- **Production failures** — relying on prepared-statement survival under transaction pooling; assuming a server-side cursor is free; choosing `executemany` for a large one-time load.
- **Frontier** — none claimed beyond what's measured/sourced here.
- **Where this goes next** — hands off to resilient clients (topic 9): a pool decides how many connections exist; next, what happens when one of those connections' calls fails.

## Claims list

1. Session pooling supports all PostgreSQL features; transaction pooling breaks session-based ones unless the application cooperates → PgBouncer features.
2. `max_prepared_statements` and the internal `PGBOUNCER_{id}` rewriting mechanism; the "cached plan must not change result type" error → PgBouncer config.
3. Transaction-pooling prepared-statement tracking requires PgBouncer ≥1.21.0 → PgBouncer FAQ.
4. Little's Law applied to a connection pool (pool size = throughput × hold time), with a worked example → Vlad Mihalcea, "The simple scalability equation".
5. Server-side cursors let a client process more than fits in memory, at the cost of server-side state; inefficient for small results → psycopg cursor docs.
6. `COPY` is one of the most efficient ways to load data; psycopg's `Cursor.copy()`/`write_row()` → psycopg COPY docs.
7. The ADBC PostgreSQL driver executes queries (and bulk ingestion) with `COPY` internally → ADBC PostgreSQL driver docs.
8. The measured connection-setup-cost ratio, Little's Law pool-sizing arithmetic, the deterministic prepared-statement failure/survival contrast, the server-side-cursor peak-RSS gap, and the three-way bulk-load timings → direct sandbox measurement (`examples.py`), never attributed to a source.

## Changes from the chapter plan

None.
