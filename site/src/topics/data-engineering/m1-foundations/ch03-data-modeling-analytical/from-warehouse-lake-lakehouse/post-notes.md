<section data-section="outcomes">

## Outcomes

A coupled warehouse buys transactions, performance, and governance by selling storage and compute together, paid for at peak load; a data lake cuts that cost by splitting storage out, but gives up those management features by default, which is why most real lakes became data swamps. An open table format — Delta Lake, Apache Iceberg — gets transactions back over the same open files, through a transactional layer rather than by handing the data back to one owning engine, so more than one engine can still read it. The same capability, transactions, returns by a different mechanism each time; it never just reverts to the warehouse's original one.

</section>

<section data-section="internals">

## Internals: how a transaction happens over files with no native transaction support

A Delta Lake or Iceberg table has no built-in notion of a row lock or a commit the way a database engine does — the files underneath are just Parquet. What gives it transactions is a separate log of commits: every write is recorded as an entry that atomically swaps which set of files counts as "the current table," so a reader either sees the whole old set or the whole new set, never a mix. That log, and the atomic pointer swap at its center, is the actual mechanism; Chapter 6 covers it in full, including how concurrent writers resolve conflicting commits against the same log.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). The pipeline-step count (one step for a direct load, two for lake-then-warehouse) is this topic's own derivation from the Lakehouse paper's description of the two architectures, not a number the paper states as a statistic, and `examples.py` discloses that explicitly.

</section>

<section data-section="production">

## Production failures this topic warns about

**Calling "we moved to a data lake" a governance win by itself.** Moving raw data into cheap, open-format storage says nothing about whether it has transactions, data-quality enforcement, or governance — those have to be added deliberately, or the lake drifts into exactly the swamp the Databricks quote names, not because the architecture failed but because nothing was put in place to prevent it.

**Treating the lakehouse as unconditionally the right default.** An open table format earns its cost (a commit log, maintenance, a catalog to keep current) when more than one engine genuinely needs to read the same data. A workload with no such requirement doesn't need that machinery just because it is the newest stage in the history.

</section>

<section data-section="frontier">

## Frontier

Getting transactions back is only half the story; knowing where a table's current state lives at all is the other half. Multiple catalogs — Hive Metastore, Unity Catalog, Polaris — now compete on exactly the "many engines, one source of truth" promise a lakehouse makes, each with its own answer for how engines discover and agree on which commit is current. Which catalog wins that competition is still an open, actively contested question.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every stage of this history was actually driven by one thing underneath it: what object storage costs, and how it bills. The next topic is that billing model itself — what makes object storage cheap, and the economics that shaped every architecture choice in this topic.

</section>
