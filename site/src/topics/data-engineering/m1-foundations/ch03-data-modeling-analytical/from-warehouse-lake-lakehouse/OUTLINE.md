# OUTLINE — de.from-warehouse-lake-lakehouse

## Learning outcomes

1. Explain what a coupled MPP warehouse actually buys (transactions, performance, governance) that a schema-on-read lake gave up, and why it still gave it up (cost, flexibility).
2. Explain how an open table format plus a catalog gets transactions back without recoupling storage to one engine.
3. Place a given workload correctly against which stage still serves it best.

Running thread: one capability — ACID transactions — tracked across all three stages, present, then absent, then present again, by a different mechanism each time.

## Steps and storyboard (13 steps)

1. **Hook.** A warehouse owns its storage and compute as one box. What happens when the data it must hold outgrows what that one box can affordably store?
2. **Reveal: the first generation, quoted directly.** Coupled compute and storage, paid for at peak load; transactions and performance included, cost is the price.
3. **Predict (index 2): does splitting storage from compute cleanly solve the cost problem?** Wrong: yes, cleanly. Right: it solves cost, but gives something up to do it.
4. **Reveal: the second generation (the data lake), quoted directly.** Cheap, open-format, schema-on-read storage; a downstream warehouse still handled the important BI.
5. **Reveal: the swamp risk, quoted directly.** Without transactions or governance, most real data lakes became "data swamps" — named honestly as a real risk, not a strawman.
6. **Reveal: the two-tier architecture, quoted directly.** Cloud object storage (S3/ADLS/GCS) made lake-plus-warehouse the dominant architecture from 2015 onward.
7. **Predict: does the two-tier architecture need more or fewer pipeline steps than the first generation's direct load?** Wrong: fewer (it's supposed to be the improvement). Right: more — ETL into the lake, then ELT again into the warehouse.
8. **Reveal: the step count, by the paper's own account.** One step, first generation; two steps, two-tier. **Takeaway.**
9. **Predict: can an open table format give the lake transactions back without recoupling it to one engine?** Wrong: no, transactions require one owning engine. Right: yes — a transactional layer over open files, many engines can still read.
10. **Reveal: the lakehouse, quoted directly.** Delta Lake / Apache Iceberg as transactional views over open-format files; many engines over the same data.
11. **Reveal: one capability, three stages.** ACID transactions: present (coupled warehouse) → absent (lake alone) → present again (lakehouse) — by a different mechanism each time. **Takeaway.**
12. **Recap.**
13. **Prove it.** A new workload: a one-off interactive dashboard needing the day's streaming data with no multi-engine access requirement. Which stage actually serves it best?

## Engagement arc

- Hook: step 1.
- First predict: step 3 (index 2).
- Three predicts: steps 3, 7, 9.
- Surprising count: step 8 (two pipeline steps now, not fewer).
- Takeaways: steps 8, 11 (at least raise one more during build if needed).
- Recap: step 12.

## Post-notes headings

- **Outcomes.**
- **Internals:** how Delta Lake / Iceberg actually implement transactions over files that have no native transaction support (a log of commits, atomic pointer swap) — pointer to Chapter 6's own internals, deferred there.
- **Lab:** none of this topic's own (`CHAPTER.md`); the pipeline-step count is the paper's own claim, not a sandbox measurement.
- **Production:** the real failure — treating "we moved to a data lake" as a governance win by itself, when the governance loss is exactly what makes it a swamp without a transactional layer on top.
- **Frontier:** the catalog layer (table format plus catalog) is itself an active area — multiple catalogs (Hive Metastore, Unity Catalog, Polaris) competing on exactly the "many engines, one source of truth" promise.
- **Where this goes next:** topic 17, object storage and query economics — what drove every stage of this history underneath: what object storage costs, and how it bills.

## Bridge and handoff (from CHAPTER.md)

- Bridge: "Every topic in the previous section built tables assuming a warehouse's own physical home was already settled. This topic is that home itself..."
- Handoff: "Every stage of this history was actually driven by one thing underneath it: what object storage costs, and how it bills. Next: that billing model itself..."

## Concept ledger

- Introduces: `warehouse-lake-lakehouse-history`.
- Uses: `inmon-enterprise-warehouse`, `kimball-dimensional-bus`.
- Declared: basic familiarity with "a data warehouse."

## Claims list

1. First-generation platforms coupled compute and storage into an on-premises appliance, paid for at peak load. Source: Lakehouse paper.
2. Second-generation data lakes offloaded raw data into low-cost, open-format, schema-on-read storage; a downstream warehouse still handled the most important BI. Source: Lakehouse paper.
3. Cloud object storage (S3/ADLS/GCS) replaced HDFS from 2015 onward, making lake-plus-warehouse the dominant architecture. Source: Lakehouse paper.
4. Without transactions or governance enforcement, most real data lakes became known as data swamps. Source: Databricks, "Introduction to Data Lakes".
5. A two-tier architecture ETLs into the lake, then ELTs again into the warehouse — more steps than first generation's direct load. Source: Lakehouse paper (step count: this topic's own count from the paper's prose, in `examples.py`).
6. Delta Lake and Apache Iceberg provide transactional views over open-format data lake files, giving transactions back without recoupling storage to one engine. Source: Lakehouse paper.
