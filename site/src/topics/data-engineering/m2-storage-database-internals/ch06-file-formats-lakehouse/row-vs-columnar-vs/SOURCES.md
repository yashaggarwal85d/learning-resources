# Sources — de.row-vs-columnar-vs

## Ailamaki, DeWitt, Hill, Skounakis, "Weaving Relations for Cache Performance" (VLDB 2001)

URL: https://www.csd.uoc.gr/~hy460/pdf/pax222.pdf
Version: Proceedings of the 27th VLDB Conference, Roma, Italy, 2001

> NSM stores records contiguously starting from the beginning of each disk page, and uses an offset (slot) table at the end of the page to locate the beginning of each record

> DSM partitions an n-attribute relation vertically into n sub-relations, each of which is accessed only when the corresponding attribute is needed.

> tremendous additional time to join the participating subrelations together

(These are two separate sentences from the same paragraph; a page-break footnote sits between them in the source PDF's extracted text, so they are quoted separately rather than as one unbroken span.)

> This paper introduces and evaluates Partition Attributes Across (PAX), a new layout for data records that combines the best of the two worlds and exhibits performance superior to both placement schemes by eliminating unnecessary accesses to main memory. For a given relation, PAX stores the same data on each page as NSM. Within each page, however, PAX groups all the values of a particular attribute together on a minipage.

> Because PAX only affects layout inside the pages, it incurs no storage penalty and does not affect I/O behavior.

> According to our experimental results, when compared to NSM (a) PAX exhibits superior cache and memory bandwidth utilization, saving at least 75% of NSM's stall time due to data cache accesses, (b) range selection queries and updates on memoryresident relations execute 17-25% faster, and (c) TPC-H queries involving I/O execute 11-48% faster.

Contents:
- Introduction: defines NSM (slotted pages, records contiguous) and DSM (full column decomposition, point lookups need a cross-sub-relation join).
- Introduction: defines PAX — same per-page data as NSM, but columns grouped into per-page minipages, so I/O (which pages are read) is unchanged while cache behavior improves.
- Abstract: the paper's own headline measured results for PAX versus NSM and DSM.

## Apache Parquet, "Motivation" (docs.parquet.apache.org)

URL: https://parquet.apache.org/docs/overview/motivation/
Version: fetched 2026-10-30

> We created Parquet to make the advantages of compressed, efficient columnar data representation available to any project in the Hadoop ecosystem.

> Parquet is built to support very efficient compression and encoding schemes. Multiple projects have demonstrated the performance impact of applying the right compression and encoding scheme to the data. Parquet allows compression schemes to be specified on a per-column level, and is future-proofed to allow adding more encodings as they are invented and implemented.

Contents:
- Why Parquet exists: columnar storage plus per-column-tunable compression/encoding, available to any Hadoop-ecosystem project.

## Apache Parquet, "Overview" (docs.parquet.apache.org)

URL: https://parquet.apache.org/docs/overview/
Version: fetched 2026-10-30

> Apache Parquet is an open source, column-oriented data file format designed for efficient data storage and retrieval.

Contents:
- The one-line definition of Parquet as a column-oriented file format.
