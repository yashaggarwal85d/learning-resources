<section data-section="internals">

## Internals: the pause is modeled as a free variable, not a fixed delay

`recheck_before_write_does_not_help` in `examples.py` doesn't simulate a GC pause's duration at
all; it only asserts where the pause sits relative to the check and the write, because that
relationship is the entire argument. `zombie_leader_overwrites_without_fencing` and
`fencing_token_rejects_the_same_scenario` run the identical sequence of events twice, against two
different storage implementations, so the only variable between a corrupted write and a rejected
one is whether the resource checks a token — nothing about the pause, the clients, or the timing
changes between the two runs.

</section>

<section data-section="lab">

## Lab: why a unique token is a weaker property than an increasing one

`monotonic_token_is_necessary_unique_token_is_not_enough` makes the distinction concrete: two
random strings are trivially distinct from each other, which is all uniqueness promises, but
nothing about either string's value says which one was issued more recently. An increasing
counter carries that information for free, in the number itself; a hash, a UUID, or any other
unique identifier does not, and would need an entirely separate mechanism (a timestamp, a
sequence number from somewhere else) bolted on to recover it — at which point the fencing token
is that separate mechanism, not the unique string.

</section>

<section data-section="production">

## Production: four systems, one check, four names for the same number

Chubby's sequencer carries "the name of the lock, the mode in which it was acquired... and the
lock generation number," checked by any server willing to validate it. Kafka's producer epoch is
fetched in `initTransactions()` and fences out "another producer with the same transactional.id,"
rejecting it with `ProducerFencedException`. ZooKeeper's zxid stamps "every change to the
ZooKeeper state," giving a total order any client can compare against. Raft's term, covered fully
in topic 9, rejects a stale leader's request the identical way. None of the four papers or docs
describe their mechanism as "the same as the others' " — the naming is this topic's own
observation, made by lining up what each one actually checks.

</section>

<section data-section="frontier">

## Frontier: fencing moves the trust boundary, it doesn't remove it

It's tempting to read fencing tokens as "solving" distributed locking, but they relocate the
problem rather than eliminating it: safety now depends on the resource correctly implementing
the monotonic check, instead of on every client correctly implementing a lease check. That's a
real improvement, because there's exactly one resource and arbitrarily many clients, and the
resource's check runs at write time, after any pause has already ended, where a client-side
check cannot. But it is not a proof that distributed coordination has gotten easier in general —
it is a proof that this particular failure mode has a cheap fix once you know where to put the
check, which is a narrower and more useful claim.

</section>

<section data-section="where-next">

## Where this goes next

Fencing tokens and leader election both need a small, strongly consistent service that hands out
the next number and holds the lease. Real data systems rely on a few such services, and on a
replicated log that is not quite a majority quorum. The next topic places them: ZooKeeper, etcd,
Kafka's KRaft and its in-sync replicas, and the table-format commit.

</section>
