Last verified against these sources: 22 October 2026, with the row- and column-read contrast measured directly on
this session's PostgreSQL 16.15 sandbox (database `shop`, table `orders`). Expert sign-off: pending.

- Amazon Redshift Database Developer Guide, "Columnar storage": [docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html](https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html). Row-wise vs. columnar storage mechanics, and the hundred-column example reused in this refresher's reveal.
- Azure Architecture Center, "Online Transaction Processing (OLTP)": [learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-transaction-processing](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-transaction-processing). Normalization pressure and why analytics over normalized data needs joins.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=oltp-vs-olap-workload-shapes:%20).
