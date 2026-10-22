# Sources — key design: natural, surrogate, durable, hash

Fetched: 2026-10-22.

## PostgreSQL docs, "CREATE SEQUENCE"
URL: https://www.postgresql.org/docs/current/sql-createsequence.html

> Because nextval and setval calls are never rolled back, sequence objects
> cannot be used if "gapless" assignment of sequence numbers is needed. It is
> possible to build gapless assignment by using exclusive locking of a table
> containing a counter; but this solution is much more expensive than
> sequence objects, especially if many transactions need sequence numbers
> concurrently.

> Unexpected results might be obtained if a cache setting greater than one is
> used for a sequence object that will be used concurrently by multiple
> sessions. Each session will allocate and cache successive sequence values
> during one access to the sequence object and increase the sequence
> object's last_value accordingly. Then, the next cache-1 uses of nextval
> within that session simply return the preallocated values without
> touching the sequence object. So, any numbers allocated but not used
> within a session will be lost when that session ends, resulting in
> "holes" in the sequence.

> Furthermore, although multiple sessions are guaranteed to allocate
> distinct sequence values, the values might be generated out of sequence
> when all the sessions are considered.

## PostgreSQL docs, "UUID Functions"
URL: https://www.postgresql.org/docs/current/functions-uuid.html

> uuidv7 ( [ shift interval ] ) → uuid
> Generates a version 7 (time-ordered) UUID. The timestamp is computed
> using UNIX timestamp with millisecond precision + sub-millisecond
> timestamp + random.

> gen_random_uuid ( ) → uuid
> uuidv4 ( ) → uuid
> Generates a version 4 (random) UUID

## RFC 9562, "Universally Unique IDentifiers (UUIDs)"
URL: https://www.rfc-editor.org/rfc/rfc9562.html

> UUID versions that are not time ordered, such as UUIDv4 (described in
> Section 5.4), have poor database-index locality. This means that new
> values created in succession are not close to each other in the index;
> thus, they require inserts to be performed at random locations. The
> resulting negative performance effects on the common structures used for
> this (B-tree and its variants) can be dramatic.

> This stems from the increasingly distributed nature of modern
> applications. In such cases, "auto-increment" schemes that are often used
> by databases do not work well: the effort required to coordinate
> sequential numeric identifiers across a network can easily become a
> burden.

> UUIDv7 values are created by allocating a Unix timestamp in milliseconds
> in the most significant 48 bits and filling the remaining 74 bits,
> excluding the required version and variant bits, with random bits for
> each new UUIDv7 generated to provide uniqueness as per Section 6.9.

> unix_ts_ms:
> 48-bit big-endian unsigned number of the Unix Epoch timestamp in
> milliseconds as per Section 6.1. Occupies bits 0 through 47 (octets 0-5).

> variant fields, leaving 122 bits for implementation-specific UUIDs.

> Distributed applications generating UUIDs at a variety of hosts MUST be
> willing to rely on the random number source at all hosts.

## Measured directly
URL: n/a — measured on this sandbox's existing PostgreSQL clusters (port 5432, PG 16.15; port 5433, PG
18.6), and a real combinatorial computation in examples.py; nothing dropped or created for this topic.

PostgreSQL 18.6 (this sandbox's port-5433 cluster, the only one here with
`uuidv7()`): two consecutive `SELECT uuidv7()` calls share a long leading
substring (the millisecond-timestamp prefix), while a `gen_random_uuid()`
call alongside them shares no such prefix with either. A real
fixed-point/combinatorial computation of the birthday-bound collision
probability for 122 random bits (UUIDv4) vs. 74 random bits (UUIDv7, within
one millisecond) at realistic generation volumes is in `examples.py`,
not merely asserted.
