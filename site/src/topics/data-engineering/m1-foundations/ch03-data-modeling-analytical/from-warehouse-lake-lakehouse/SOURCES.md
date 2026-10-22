# Sources — de.from-warehouse-lake-lakehouse

## Armbrust, Ghodsi, Xin, Zaharia, "Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics" (CIDR 2021)

URL: https://mail.vldb.org/cidrdb/papers/2021/cidr2021_paper17.pdf
Fetched: 2026-10-22.

Quotes:
> We refer to this as the first generation data analytics platforms.

> To solve these problems, the second generation data analytics platforms started offloading all the raw data into data lakes: low-cost storage systems with a file API that hold data in generic and usually open file formats, such as Apache Parquet and ORC [8, 9].

> From 2015 onwards, cloud data lakes, such as S3, ADLS and GCS, started replacing HDFS.

> This two-tier data lake + warehouse architecture is now dominant in the industry in our experience (used at virtually all Fortune 500 enterprises).

> a recent family of systems such as Delta Lake [10] and Apache Iceberg [7] provide transactional views of a data lake, and enable these management features.

Items: (1) a first-generation platform coupled compute and storage into one on-premises appliance, paid for at peak load; (2) a second-generation data lake offloaded raw data into low-cost, open-format storage (schema-on-read), with a downstream warehouse still used for the most important BI; (3) cloud object storage (S3/ADLS/GCS) replaced HDFS from 2015 onward, making the two-tier lake-plus-warehouse architecture dominant; (4) a Lakehouse's open table formats (Delta Lake, Apache Iceberg) give a data lake transactional views and management features back, without requiring a separate warehouse engine.

## Databricks, "Introduction to Data Lakes"

URL: https://www.databricks.com/glossary/data-lake
Fetched: 2026-10-22.

Quote:
> Despite their pros, many of the promises of data lakes have not been realized due to the lack of some critical features: no support for transactions, no enforcement of data quality or governance, and poor performance optimizations. As a result, most of the data lakes in the enterprise have become data swamps.

Items: (1) data lakes lack transactions, data-quality/governance enforcement, and performance optimization by default; (2) this is why, in practice, most enterprise data lakes became known as "data swamps" — the risk is real, not a strawman.
