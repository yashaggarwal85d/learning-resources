<section data-section="outcomes">

## Outcomes

The shop gets an automated erasure process that locates a subject from classification tags,
lineage, and a subject index; deletes by table-format operations and expires the old snapshot on
a schedule that meets GDPR's deadline against the audit-retention window; handles Kafka,
replicas, and backups each by a named mechanism; and emits proof for every request. The
delete-versus-crypto-shredding crossover is computed from request rate and backup length, the
blind spots lineage cannot see are listed with an owner, and every decision that is a legal
question is marked as one rather than answered by the design.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The erasure mechanisms themselves (Chapter 13 topics 5, 6 and
9, and the table formats of Chapter 6) are composed into one process, not re-taught. Lineage
collection and impact analysis (Chapter 13 topics 11 and 14) are referenced. The legal analysis
of what must be erased and when is counsel's call, which this topic cites (GDPR Articles 5 and
17) and states plainly rather than resolves. The skipped audit-logging and tamper-evidence topic
is named. Tenant-level erasure is topic 19's, referenced here.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg — the erasure lab itself is Chapter 13 topic 9's.
The end-to-end erasure process on the shop's synthetic estate, the delete-versus-shredding
crossover calculation, and the proof-pipeline output are this topic's executable evidence.
`examples.py`'s own lab: `erasure_process_coverage()` names a mechanism for every place in the
estate; `delete_and_expire_cost()` and `crypto_shredding_cost()` price the two routes;
`crossover_requests_per_year()` computes where they cross; `erasure_proof()` assembles the
pipeline's own proof record.

</section>

<section data-section="production">

## Production failures this topic warns about

**A complete delete that isn't an erasure process.** A table operation correctly and completely
clearing the lakehouse says nothing about a backup, a replica, a Kafka topic, or an export it
never touched — each needs its own named mechanism.

**A blind spot with no owner.** Data copied into a spreadsheet or used to train a model sits
outside any lineage graph. Without a register naming a human owner for each such copy, no
automated process will ever find it.

</section>

<section data-section="frontier">

## Frontier

None claimed. Composing table-format deletes, snapshot expiry, and crypto-shredding into one
erasure process is each established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An erasure process is only as good as its inputs: the tags, the lineage, the quality of the data
it touches. The next design is the platform that watches all of that continuously: a
data-quality monitoring platform that runs checks, finds the blast radius of a failure, and,
above all, does not cry wolf.

</section>
