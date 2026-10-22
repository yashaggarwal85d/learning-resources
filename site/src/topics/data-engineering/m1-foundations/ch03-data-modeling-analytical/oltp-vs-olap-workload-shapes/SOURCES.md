Fetched: 2026-10-22.

## Amazon Redshift Database Developer Guide, "Columnar storage"
URL: https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html
> In row-wise database storage, data blocks store values sequentially for each consecutive column making up the entire row. If block size is smaller than the size of a record, storage for an entire record may take more than one block. If block size is larger than the size of a record, storage for an entire record may take less than one block, resulting in an inefficient use of disk space. In online transaction processing (OLTP) applications, most transactions involve frequently reading and writing all of the values for entire records, typically one record or a small number of records at a time. As a result, row-wise storage is optimal for OLTP databases.

> Using columnar storage, each data block stores values of a single column for multiple rows.

> For example, suppose a table contains 100 columns. A query that uses five columns will only need to read about five percent of the data contained in the table. This savings is repeated for possibly billions or even trillions of records for large databases. In contrast, a row-wise database would read the blocks that contain the 95 unneeded columns as well.

## Azure Architecture Center, "Online Transaction Processing (OLTP)"
URL: https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-transaction-processing
> The goal of efficiently processing and storing individual transactions by an OLTP system is partly accomplished through data normalization, which breaks up the data into smaller, less redundant chunks. This step enables the OLTP system to process large numbers of transactions independently.

> When you conduct analytics and reporting on data that's highly normalized, the queries tend to be complex, because most queries need to denormalize the data by using joins.

> When you run analytics against the data that rely on aggregate calculations over millions of individual transactions, it's very resource-intensive for an OLTP system.

## Measured directly
URL: n/a — measured on the existing PostgreSQL 16.15 sandbox (database `shop`, table `orders`: 2,400,000 rows, 445 MB, columns order_id/status/event_time/amount/tags/channel, average row width 48 bytes per `pg_stats`).

A point lookup by primary key (`WHERE order_id = 1234567`) uses the existing B-tree index: `Index Scan using orders_order_id_idx`, buffers shared hit=3 read=4 (7 total), execution time 0.635 ms.

A full-table aggregate (`SELECT sum(amount) FROM orders`, with `enable_indexscan` and `enable_bitmapscan` off to force the sequential path) reads the whole heap: `Parallel Seq Scan on orders`, buffers shared hit=1 read=46,483 (46,484 total), execution time 479.426 ms — about 6,600 times the buffers of the point lookup.

`pg_stats.avg_width` for `orders`: order_id 8, status 8, event_time 4, amount 6, tags 18, channel 4 bytes (total 48). The `amount` column the aggregate actually needs is about 6 of those 48 bytes, roughly an eighth of each row — but PostgreSQL's row-oriented heap has no way to skip the other five columns; the sequential scan reads every byte of every row regardless.
