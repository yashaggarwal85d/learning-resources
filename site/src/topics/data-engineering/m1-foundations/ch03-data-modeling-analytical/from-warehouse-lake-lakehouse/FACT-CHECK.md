# FACT-CHECK — de.from-warehouse-lake-lakehouse

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | First-generation platforms coupled compute and storage into an on-premises appliance, paid for at peak load. | Confirmed | Lakehouse paper calls this "the first generation data analytics platforms"; its surrounding description (quoted indirectly, paraphrase only where not quoted) is the paper's own characterization of MPP warehouses — compute and storage sold and scaled together, provisioned for peak. |
| 2 | Second-generation data lakes offloaded raw data into low-cost, open-format, schema-on-read storage; a downstream warehouse still handled the most important BI. | Confirmed | Direct quote: "the second generation data analytics platforms started offloading all the raw data into data lakes: low-cost storage systems with a file API that hold data in generic and usually open file formats, such as Apache Parquet and ORC." The paper's two-tier description (lake plus warehouse still doing BI) is the basis for claim 3/5's "two-tier" wording. |
| 3 | Cloud object storage (S3/ADLS/GCS) replaced HDFS from 2015 onward, making lake-plus-warehouse the dominant architecture. | Confirmed | Direct quote: "From 2015 onwards, cloud data lakes, such as S3, ADLS and GCS, started replacing HDFS." Direct quote: "This two-tier data lake + warehouse architecture is now dominant in the industry in our experience (used at virtually all Fortune 500 enterprises)." |
| 4 | Without transactions or governance enforcement, most real data lakes became known as data swamps. | Confirmed | Direct quote (Databricks glossary): "no support for transactions, no enforcement of data quality or governance, and poor performance optimizations. As a result, most of the data lakes in the enterprise have become data swamps." |
| 5 | A two-tier architecture ETLs into the lake, then ELTs again into the warehouse — more pipeline steps than first generation's direct load. | Confirmed as this topic's own count | The paper describes the two-tier architecture as lake-then-warehouse (claim 2/3's quotes establish the two separate stores); counting load stages from the paper's own description gives one step (first generation: source to warehouse) versus two (second generation: source to lake, lake to warehouse). This count is `examples.py`'s own derivation from the paper's prose, not a sentence the paper states as a number — disclosed as such in the file header and in coverage.json. |
| 6 | Delta Lake and Apache Iceberg provide transactional views over open-format data lake files, giving transactions back without recoupling storage to one engine. | Confirmed | Direct quote: "a recent family of systems such as Delta Lake [10] and Apache Iceberg [7] provide transactional views of a data lake, and enable these management features." "These management features" (transactions, schema enforcement, governance) are the ones the swamp quote (claim 4) names as missing from a lake alone. |

## Currency

Both sources are stable references: the Lakehouse paper (CIDR 2021) is the named coinage of the term and is still the standard citation for the lakehouse architecture as of 2026; Delta Lake and Apache Iceberg remain the two dominant open table formats. The Databricks glossary page is a maintained reference page, re-fetched 2026-10-22.

## Red team

**Predict 1 (step 3): does splitting storage from compute cleanly solve the cost problem?**
A learner could answer "yes, cleanly" because object storage is dramatically cheaper than warehouse-attached storage, and that premise is true. The claim being tested is narrower: the paper is explicit that the second generation's data lake gives up transactions, governance, and the performance optimizations a warehouse engine provides — the swamp quote (claim 4) is the direct evidence that "cheaper storage" is not the same as "problem solved." The right answer is "solves cost, gives something up to do it," which is what the reel reveals at step 5 before resolving the predict.

**Predict 2 (step 7): does the two-tier architecture need more or fewer pipeline steps than the first generation's direct load?**
The intuitive wrong answer is "fewer," because a lake sounds like it is removing a step (skip the expensive warehouse load, land raw data cheaply first). The paper's own description shows the opposite: the lake is an additional stop before the warehouse, not a replacement for it — "a downstream warehouse" (second generation) still receives the important BI tables, meaning data still has to move a second time. This is this topic's own disclosed count, not a paper-stated number — `examples.py` is explicit about that, and so is the reel's takeaway.

**Predict 3 (step 9): can an open table format give the lake transactions back without recoupling it to one engine?**
The wrong intuition is "no — transactions require one owning engine, the way a warehouse's own engine owns them." The direct quote refutes this: Delta Lake and Iceberg are table formats over open files that "provide transactional views of a data lake" while the files themselves stay in open formats that multiple engines can still read. The mechanism (a commit log plus atomic pointer swap over otherwise-ordinary files) is deferred to the post-notes Internals section and to Chapter 6, not claimed here beyond what the quote supports.

No claim required inferring beyond what the two sources state, except claim 5's step count, which is disclosed everywhere as this topic's own derivation.
