<section data-section="outcomes">

## Outcomes

By the end of this topic you can: set RPO and RTO per tier and justify each number; explain, with the four specific reasons, why bucket replication alone fails as disaster recovery; design an immutable-backup scheme that survives a compromised admin credential; run a timed restore drill and report whether it met its RTO.

</section>

<section data-section="internals">

## Internals

Each of the four reasons is a genuinely separate failure, not one problem told four times. Apache Iceberg's own manifest API returns, in its own words, "fully qualified path to the file, suitable for constructing a Hadoop Path" -- an absolute reference that a bucket-level copy never rewrites. Delta Lake's own transaction-log protocol allows an add action's path to be "a relative path to a data file from the root of the table or an absolute path," so the same failure mode applies there too. The catalog database that resolves a table name to its manifest is a different system again, untouched by a job that only replicates bucket bytes. AWS's own documentation on multi-Region keys explains that such a key lets you "encrypt data in one AWS Region and decrypt it in a different AWS Region without re-encrypting," which is exactly the property a region-scoped key lacks. A Kafka topic replicated to a second cluster does not preserve its original offsets either, so a consumer has to resume by timestamp, not a copied number -- a fourth, independent thing that "the bucket replicated" says nothing about.

</section>

<section data-section="lab">

## Lab

This topic hosts the region-loss leg of the chapter's lab, run on real local files and a real encryption key rather than described abstractly. A table's manifest is shown holding absolute paths that break after a simulated region move and are fixed only once rewritten. A catalog lookup is shown failing against perfectly intact files once the catalog itself is lost, and succeeding once it is backed up alongside the data. A key scoped to a single region is shown failing to decrypt real ciphertext that a genuinely multi-region key decrypts without issue. A mutable backup is shown deleted by stolen admin credentials that a compliance-mode WORM backup refuses. A full restore is then timed end to end and checked against its own RTO target.

</section>

<section data-section="production">

## Production

The hook's real cost was never the bucket replication job itself -- it ran every night, exactly as designed. It was the gap between "the bytes are safe" and "the table is usable," a gap that stayed invisible until the only moment it actually mattered. The practical fix is treating each of the four systems -- metadata, catalog, keys, offsets -- as its own recovery plan with its own backup, and never treating a clean bucket-replication dashboard as proof that any of them are covered.

</section>

<section data-section="frontier">

## Frontier

The Digital Operational Resilience Act names, in the words of its own regulator page, an "operational resilience testing programme encompassing a range of tests, including advanced testing" as a standing requirement for in-scope financial entities. The underlying idea doesn't change from this topic's own restore drill -- a recovery plan is unverified until someone actually runs it -- only the scope: a regulator making that drill a recurring legal obligation rather than a team's own good habit.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Disaster recovery assumes nothing changed on purpose. The opposite risk is a schema change made deliberately, rolled out badly, which is the chapter's last reliability topic.

</section>
