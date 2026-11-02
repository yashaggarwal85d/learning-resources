# Outline — de.redshift-distribution-sort-keys

10 steps, entirely sourced-only (no Redshift/AWS account in this sandbox). Predicts at 2 and 6.
Takeaways at 4, 7, 9.

1. **Hook.** Answers topic 38's handoff: both warehouses so far disaggregate storage from
   compute, joined over a network. This topic turns to a third lineage entirely: Redshift's
   classic shared-nothing MPP, with its own nodes and slices.
2. **Predict.** A table's rows have to land somewhere across the cluster's nodes. Does every
   node hold a full copy, or does Redshift split the rows up?
3. **Reveal.** A leader node coordinates; each compute node is partitioned into slices; rows are
   distributed to slices according to a chosen distribution style, not copied everywhere.
4. **Reveal + takeaway.** Four distribution styles -- AUTO, EVEN, KEY, ALL -- each places rows
   differently, and a join's real cost depends entirely on which one a table picked.
5. **Reveal.** A compound or interleaved sort key orders rows inside each block; the engine
   tracks each block's min/max and skips blocks a filter's range can't match.
6. **Predict.** If storage and compute are split (like topics 37 and 38), does scaling one force
   scaling the other here too, or does Redshift's own lineage avoid that?
7. **Reveal + takeaway.** RA3 nodes decouple storage and compute independently through managed
   storage; Serverless goes further, billing compute alone in RPUs with no nodes to size at all.
8. **Reveal.** Automatic WLM adjusts concurrency to the workload on its own; concurrency scaling
   adds a second cluster's capacity automatically when queries would otherwise queue.
9. **Reveal + takeaway.** Spectrum queries files sitting in S3 directly, no load step first; and
   automatic table optimization picks a table's sort and distribution keys without an admin.
10. **Recap.** A third lineage: leader/compute/slices, four distribution styles with a real
    redistribution cost, sort keys and block skipping, RA3/Serverless decoupling, automatic WLM
    and tuning. Handoff: three proprietary engines taught -- the open question left is warehouse
    or lakehouse.
