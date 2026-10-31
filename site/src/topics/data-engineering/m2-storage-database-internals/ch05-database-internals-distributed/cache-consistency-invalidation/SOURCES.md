## Nishtala et al. — "Scaling Memcache at Facebook" (NSDI '13)

URL: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170.pdf
Version: NSDI 2013 proceedings, fetched 2026-10-31

> For write requests, the web server issues SQL statements to the database and then sends a delete request to memcache that invalidates any stale data. We choose to delete cached data instead of updating it because deletes are idempotent.

> Intuitively, a memcached instance gives a lease to a client to set data back into the cache when that client experiences a cache miss. The lease is a 64-bit token bound to the specific key the client originally requested. The client provides the lease token when setting the value in the cache. With the lease token, memcached can verify and determine whether the data should be stored and thus arbitrate concurrent writes. Verification can fail if memcached has invalidated the lease token due to receiving a delete request for that item.

> We deploy invalidation daemons (named mcsqueal) on every database. Each daemon inspects the SQL statements that its database commits, extracts any deletes, and broadcasts these deletes to the memcache deployment in every frontend cluster in that region.

Used for: why delete, not update, is the correct write-path operation (deletes are idempotent,
updates are not); the leases mechanism arbitrating concurrent writes against a cache miss by
invalidating a stale client's token on a later delete; CDC-driven invalidation reading database
commit logs (mcsqueal) rather than having application code fan out invalidations itself.

## Bronson et al. — "TAO: Facebook's Distributed Data Store for the Social Graph" (USENIX ATC '13)

URL: https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf
Version: USENIX ATC 2013 proceedings, fetched 2026-10-31

> Although TAO does not provide strong consistency for its clients, because it writes to MySQL synchronously the master database is a consistent source of truth. This allows us to provide stronger consistency for the small subset of requests that need it. TAO reads may be marked critical, in which case they will be proxied to the master region. We could use critical reads during an authentication process, for example, so that replication lag doesn't allow use of stale credentials.

Used for: the per-field staleness decision this topic's own syllabus names as the TAO case
study — most reads tolerate eventual consistency, but a specific field (here, authentication
credentials) can be marked critical and routed to the consistent source instead, a per-field
decision rather than one global consistency setting for the whole store.
