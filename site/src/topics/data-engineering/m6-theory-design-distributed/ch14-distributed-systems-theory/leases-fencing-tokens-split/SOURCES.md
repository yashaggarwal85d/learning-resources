## Kleppmann: How to do distributed locking

URL: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
Version: 8 February 2016, fetched 2026-10-30

> In this example, the client that acquired the lock is paused for an extended period of time while
holding the lock – for example because the garbage collector (GC) kicked in. The lock has a timeout
(i.e. it is a lease), which is always a good idea (otherwise a crashed client could end up holding
a lock forever and never releasing it). However, if the GC pause lasts longer than the lease expiry
period, and the client doesn’t realise that it has expired, it may go ahead and make some unsafe
change.

> You cannot fix this problem by inserting a check on the lock expiry just before writing back to
storage. Remember that GC can pause a running thread at any point, including the point that is
maximally inconvenient for you (between the last check and the write operation).

> The fix for this problem is actually pretty simple: you need to include a fencing token with every
write request to the storage service. In this context, a fencing token is simply a number that
increases (e.g. incremented by the lock service) every time a client acquires the lock.

> Client 1 acquires the lease and gets a token of 33, but then it goes into a long pause and the lease
expires. Client 2 acquires the lease, gets a token of 34 (the number always increases), and then
sends its write to the storage service, including the token of 34. Later, client 1 comes back to
life and sends its write to the storage service, including its token value 33. However, the storage
server remembers that it has already processed a write with a higher token number (34), and so it
rejects the request with token 33.

> Note this requires the storage server to take an active role in checking tokens, and rejecting any
writes on which the token has gone backwards.

## Burrows: The Chubby Lock Service for Loosely-Coupled Distributed Systems

URL: https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf
Version: OSDI 2006, fetched 2026-10-30

> The replicas use a distributed consensus protocol
to elect a master; the master must obtain votes from a
majority of the replicas, plus promises that those replicas
will not elect a different master for an interval of a few
seconds known as the master lease.

> Read requests are satisfied by the master alone;
this is safe provided the master lease has not expired, as
no other master can possibly exist.

> At any time, a lock holder may request a sequencer, an opaque byte-string that describes the state of
the lock immediately after acquisition. It contains the
name of the lock, the mode in which it was acquired
(exclusive or shared), and the lock generation number.

> The recipient server is expected to test whether
the sequencer is still valid and has the appropriate mode;
if not, it should reject the request.

> However, if a lock becomes free
because the holder has failed or become inaccessible,
the lock server will prevent other clients from claiming
the lock for a period called the lock-delay.

> While imperfect, the lock-delay protects
unmodified servers and clients from everyday problems
caused by message delays and restarts.

## Apache Kafka: KafkaProducer (Javadoc, 3.9 API)

URL: https://kafka.apache.org/39/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html
Version: kafka 3.9.2 API, fetched 2026-10-30

> Gets the internal producer id and epoch, used in all future transactional
messages issued by the producer.

> ProducerFencedException - if another producer with the same transactional.id is active

## ZooKeeper Programmer's Guide

URL: https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html
Version: current, fetched 2026-10-30

> Every change to the ZooKeeper state receives a stamp in the form of a zxid (ZooKeeper Transaction Id). This exposes the total ordering of all changes to ZooKeeper. Each change will have a unique zxid and if zxid1 is smaller than zxid2 then zxid1 happened before zxid2.

## de.raft-at-conceptual-level (internal cross-reference)

URL: internal-not-fetched-de.raft-at-conceptual-level
Version: this topic's own commit history

No quotes; Raft's term is this topic's fourth example of the same fencing-token idea, referenced here, not re-quoted. The paper's own term definition is topic 9's, already quoted there.

## de.linearizability (internal cross-reference)

URL: internal-not-fetched-de.linearizability
Version: this topic's own commit history

No quotes; a lease's quorum read turned local read is a variation on topic 5's quorum-read argument, referenced here, not re-quoted.
