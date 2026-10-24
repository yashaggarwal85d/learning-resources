## PgBouncer features

URL: https://www.pgbouncer.org/features.html
Version: current (fetched 2026-10-23)

> Session pooling

> Most polite method. When a client connects, a server
> connection will be assigned to it for the whole duration it
> stays connected. When the client disconnects, the server
> connection will be put back into pool. This mode supports all
> PostgreSQL features.

> Transaction pooling

> A server connection is assigned to a client only during a
> transaction. When PgBouncer notices that the transaction is
> over, the server will be put back into the pool.

> This mode breaks a few session-based features of PostgreSQL.
> You can use it only when the application cooperates by not
> using features that break. See the table below for
> incompatible features.

Contents: the three pooling modes (session, transaction, statement) with their trade-offs; a
feature-compatibility table for session vs. transaction pooling; low per-connection memory (2 kB
default); online reconfiguration and restart support.

## PgBouncer config

URL: https://www.pgbouncer.org/config.html
Version: current (fetched 2026-10-23)

> When this is set to a non-zero value PgBouncer tracks protocol-level named
> prepared statements related commands sent by the client in transaction and
> statement pooling mode. PgBouncer makes sure that any statement prepared by
> a client is available on the backing server connection.

> The reuse of prepared statements has one downside. If the return or argument
> types of a prepared statement changes across executions then PostgreSQL
> currently throws an error such as:

> ERROR: cached plan must not change result type

Contents: `max_prepared_statements` and how PgBouncer rewrites client-side prepared-statement
names to an internal `PGBOUNCER_{unique_id}` name shared across clients; the memory/CPU cost of
tracking prepared statements; the exact error prepared-statement reuse across differently-typed
executions produces.

## PgBouncer FAQ

URL: https://www.pgbouncer.org/faq.html
Version: current (fetched 2026-10-23)

> In session pooling mode, the reset query must clean old prepared
> statements. This can be achieved by server_reset_query = DISCARD ALL;

> Since version 1.21.0 PgBouncer can track prepared statements in transaction
> pooling mode and make sure they get prepared on-the-fly on the linked server
> connection. To enable this feature, max_prepared_statements needs to be
> set to a non-zero value.

Contents: the session-pooling prepared-statement reset requirement; the version (1.21.0) at
which transaction-pooling prepared-statement tracking became possible at all.

## The simple scalability equation

URL: https://vladmihalcea.com/the-simple-scalability-equation/
Version: Vlad Mihalcea (fetched 2026-10-23)

> A general purpose formula, applicable to any stable system (a system where the arrival rate is
> not greater than the departure rate) is Little's Law.

> Ws = service time (the connection acquire and hold time) = 100 ms = 0.1s

> Ls = in-service requests (pool size) = 5

> Our connection pool can deliver up to 50 requests per second without ever queuing any incoming
> connection request.

> Little's Law operates with long-term averages and it might not suit for various traffic burst
> patterns. That's why metrics are very important when doing resource provisioning.

Contents: Little's Law (L = λW) applied directly to a connection pool (pool size = throughput ×
average acquire-and-hold time), with a fully worked numeric example (0.1s hold time, pool of 5,
50 req/s with no queuing); the explicit caveat that it describes long-term averages, not burst
traffic.

## Cursor types (psycopg 3)

URL: https://www.psycopg.org/psycopg3/docs/advanced/cursors.html
Version: psycopg 3.3.7.dev1 docs (fetched 2026-10-23)

> When a database cursor is created, the query is not necessarily
> completely processed: the server might be able to produce results only as they
> are needed. Only the results requested are transmitted to the client: if the
> query result is very large but the client only needs the first few records it
> is possible to transmit only them.

> Using a server-side cursor it is possible to process datasets larger than what
> would fit in the client's memory. However for small queries they are less
> efficient because it takes more commands to receive their result, so you
> should use them only if you need to process huge results or if only a partial
> result is needed.

Contents: server-side (named) cursors via `ServerCursor`/`AsyncServerCursor`; the server-memory
cost of keeping partially-processed results; when a server-side cursor helps (large results) vs.
hurts (small queries, more round trips).

## Using COPY TO and COPY FROM (psycopg 3)

URL: https://www.psycopg.org/psycopg3/docs/basic/copy.html
Version: psycopg 3.3.7.dev1 docs (fetched 2026-10-23)

> Psycopg allows to operate with PostgreSQL COPY protocol. COPY is
> one of the most efficient ways to load data into the database (and to modify
> it, with some SQL creativity).

Contents: `Cursor.copy()` with a `COPY ... FROM STDIN`/`COPY ... TO STDOUT` query; writing rows
with `write_row()`; still subject to normal transaction behavior (commit/rollback still apply).

## PostgreSQL Driver (ADBC)

URL: https://arrow.apache.org/adbc/current/driver/postgresql.html
Version: ADBC 24 docs (fetched 2026-10-23)

> The PostgreSQL driver executes queries with COPY for best performance.
> PostgreSQL does not support this for all queries, however (such as SHOW).

> Bulk ingestion is supported. The mapping from Arrow types to
> PostgreSQL types is the same as below.

Contents: the ADBC PostgreSQL driver uses `COPY` internally for query execution and bulk
ingestion (not a separate wire protocol of its own); the Arrow↔PostgreSQL type mapping; the
`adbc.postgresql.use_copy` option to disable the optimization.
