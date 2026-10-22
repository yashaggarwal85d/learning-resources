# OUTLINE — de.object-storage-query-economics

## Learning outcomes

1. Name the distinct billing dimensions of object storage (storage, requests, egress) and of query engines (bytes-scanned vs compute-time).
2. Predict how a file-layout change (many small files vs fewer large ones) moves a real bill, in either direction depending on the query shape.
3. Run the chapter's own lab and read its measured bytes-scanned, files-touched, and storage numbers across JSON, Parquet, Hive-partitioned Parquet, and an Iceberg table.

Running thread: the bill has more than one knob, and pulling one of them (file layout) can lower the cost of one query shape while raising the cost of another, on the exact same data.

## Steps and storyboard (13 steps)

1. **Hook.** The same data, the same query, stored four different ways. Which storage choice actually costs the least to answer it?
2. **Reveal: storage bills several axes at once, quoted directly.** Storage, requests, and data transfer are each billed separately — not bundled into one price.
3. **Predict (index 2): does the format that's cheapest to write also cost the least to query?** Wrong: yes, cheap to write means cheap to query. Right: no — measured directly next.
4. **Reveal: JSON vs Parquet, measured.** The same query reads back many times more bytes from JSON than from the columnar Parquet file holding the same data.
5. **Reveal: two billing models for query compute, quoted directly.** Bytes-scanned pricing charges for data read regardless of runtime; flat-rate/capacity pricing charges for reserved compute regardless of bytes read — the same workload, billed on two different axes.
6. **Predict: does splitting one file into many smaller files by month always lower the bill?** Wrong: yes, always — more partitioning is strictly better. Right: it depends on the query.
7. **Reveal: a narrow query, measured.** Asking for one month out of twelve reads far fewer bytes once the data is split into one file per month.
8. **Reveal: a broad query, measured.** The exact same partitioned layout, asked for every month at once, reads *more* bytes than one single large file holding the identical data. **Takeaway.**
9. **Reveal: storage cost, measured.** On disk, the JSON copy of this dataset is several times larger than any of the three columnar layouts holding the same rows. **Takeaway.**
10. **Predict: does wrapping the data in an open table format change its bytes-scanned numbers, by itself?** Wrong: yes, a transactional format reads data differently. Right: no — the format wrapper alone doesn't move it, physical layout does.
11. **Reveal: an Iceberg table, measured.** Its bytes-scanned numbers track the bare Parquet file underneath it almost exactly, for both the narrow and the broad query. **Takeaway.**
12. **Recap.**
13. **Prove it.** A new access pattern: a dashboard that always queries the most recent single day's data, never more. Which of today's four layouts should it actually use?

## Engagement arc

- Hook: step 1.
- First predict: step 3 (index 2).
- Three predicts: steps 3, 6, 10.
- Surprising count: step 8 (partitioning making a broad query *more* expensive, not less).
- Takeaways: steps 8, 9, 11.
- Recap: step 12.

## Post-notes headings

- **Outcomes.**
- **Internals:** how DuckDB's profiler actually counts `total_bytes_read` (row-group and file-footer reads, not a guess from file size) — this topic's own measurement method, made visible.
- **Lab:** this topic's own (`CHAPTER.md`): the same dataset stored as JSON, a single Parquet file, a Hive-partitioned Parquet directory, and an Iceberg table; a narrow and a broad query run against each, with bytes scanned, files touched, and on-disk storage measured for real.
- **Production:** the real failure — choosing a file layout once, for one dominant query shape, then discovering a second workload with the opposite shape pays a layout tax nobody budgeted for.
- **Frontier:** small-file compaction as an operational job in its own right (Iceberg/Delta `OPTIMIZE`/compaction), because the broad-query cost measured here is exactly what accumulates over time if nothing ever merges small files back together.
- **Where this goes next:** topic 18, compute-storage separation — the architectural consequence of this topic's own economics, elastic stateless compute over the same shared storage this topic just priced out.

## Bridge and handoff (from CHAPTER.md)

- Bridge: "Every stage of this history was actually driven by one thing underneath it: what object storage costs, and how it bills. This topic is that billing model itself, in enough detail to predict a real bill from a real file layout."
- Handoff: "This billing model is exactly what made separating storage from compute economically attractive in the first place. Next: compute-storage separation itself, the architectural consequence of this topic's own economics."

## Concept ledger

- Introduces: `object-storage-billing-model`, `bytes-scanned-vs-compute-time-billing`.
- Uses: `warehouse-lake-lakehouse-history`.
- Declared: basic familiarity with cloud storage.

## Claims list

1. Object storage bills storage, requests, and data transfer as separate, independent dimensions. Source: AWS S3 pricing.
2. On-demand query pricing charges for bytes scanned regardless of runtime; flat-rate/capacity pricing charges for reserved compute time regardless of bytes scanned. Source: BigQuery pricing.
3. The same query reads far more bytes from a JSON file than from a Parquet file holding the same data. Source: this topic's own lab (examples.py), measured via DuckDB's profiler.
4. A narrow query against a layout partitioned by the filtered column reads far fewer bytes than against one unpartitioned file. Source: this topic's own lab, measured.
5. A broad query against that same partitioned layout reads *more* bytes than against one large unpartitioned file holding the same data. Source: this topic's own lab, measured.
6. An (unpartitioned) Iceberg table's bytes-scanned numbers track the bare Parquet file it wraps almost exactly; the format wrapper by itself does not change bytes-scanned, physical partitioning does. Source: this topic's own lab, measured.
