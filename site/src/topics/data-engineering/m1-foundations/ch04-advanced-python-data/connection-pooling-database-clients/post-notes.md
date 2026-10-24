<section data-section="outcomes">

## Outcomes

A fresh connection to this sandbox's own PostgreSQL cluster is measurably, repeatably slower
than reusing one already open — measured directly, not assumed. Little's Law (pool size equals
throughput times hold time) turns a measured hold time and a chosen target throughput into a
concrete pool size, not a round number picked by habit; this topic measured the hold time
against a disclosed simulated workload, since a trivial local round trip alone understates a
real request's hold time. PgBouncer's transaction pooling mode hands a backend connection back
to the shared pool the instant a transaction ends, which this topic reproduced directly: one
client's prepared statement, cleared by a second client sharing that same physical backend, is
then denied to a third request on that same backend — the same test survives unchanged under
session pooling, where one backend stays dedicated to a client for its whole connection. A
server-side cursor, fetched in a tuned batch size, measurably peaks lower in client memory than
fetching an identical large result all at once. Of three measured bulk-load paths against the
same rows, row-by-row inserts were by far the slowest, a direct bulk-copy path was the fastest,
and an Arrow-native driver tracked the bulk-copy path closely — because, by its own
documentation, it runs that same path underneath.

</section>

<section data-section="lab">

## Lab

Feeds the §4.2 chapter lab's connection-pooling and bulk-load parts (per `CHAPTER.md`), measured
against this sandbox's own PostgreSQL cluster and two live PgBouncer instances (session pooling
on one port, transaction pooling on another). Every number in `examples.py` is a real
measurement: fresh-connect vs. reused-connection timing; a measured Little's Law hold time
against both a simulated workload and a trivial round trip; the transaction-pooling
prepared-statement failure reproduced with the same physical backend process id confirmed
throughout; the identical test surviving under session pooling; isolated-subprocess peak
resident memory for `fetchall()` vs. a named server-side cursor; and `executemany` vs. `COPY`
vs. an Arrow-native (ADBC) bulk ingest, timed with each path's own connection setup excluded from
the measured region.

</section>

<section data-section="production">

## Production failures this topic warns about

**Relying on a prepared statement surviving across separate requests from the same client, when
the service pools connections through PgBouncer in transaction mode.** The failure is
intermittent by nature — it only shows up when a request happens to land on a physical backend
that a different client has since reset — which makes it easy to misdiagnose as database
flakiness rather than a pooling-mode mismatch. The fix is enabling PgBouncer's own
prepared-statement tracking (`max_prepared_statements`), or moving that specific workload to
session pooling.

**Treating a server-side cursor as free.** It measurably lowers client memory on a large result,
but costs more round trips to the server and keeps server-side state open for longer — a bad
trade for a small query that would have fit in memory anyway.

**Choosing `executemany` for a large one-time load.** Measured directly here, row-by-row inserts
were far slower than either bulk path on the identical rows; a bulk-copy path, or an Arrow-native
driver that runs one underneath, is the one that scales.

</section>

<section data-section="frontier">

## Frontier

PgBouncer's own documentation names a third pooling mode, statement pooling — transaction
pooling with multi-statement transactions disallowed entirely, aimed at tools like PL/Proxy —
which this topic doesn't measure or demonstrate, since neither of its two reveals needs a mode
stricter than transaction pooling to make its point.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A pool decides how many connections exist; it says nothing about what happens when one of those
connections' calls actually fails. Next: making the client built on top of this pool resilient
to exactly that.

</section>
