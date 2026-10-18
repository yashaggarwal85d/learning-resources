- **Round-trip time (RTT)**: the time for a small message to reach a machine and for its reply to come back. *Where you meet it:* the number `ping` prints, about 0.5 ms inside a data centre and tens of milliseconds between regions.
- **Availability zone and region**: a zone is one data-centre site within a region; a region is a cluster of zones in one metropolitan area or country. *Where you meet it:* `us-east-1a` is a zone in the region `us-east-1`.
- **Shuffle and broadcast (join strategies)**: a shuffle sends rows to machines by hashing the join key; a broadcast sends a whole small table to every machine. *Where you meet it:* Spark's `BroadcastHashJoin` versus `SortMergeJoin` in a query plan.
- **Egress**: data leaving a cloud provider's network or crossing a billing boundary. *Where you meet it:* the "data transfer out" line on a cloud bill.

**Check yourself:** a path runs at 1.25 GB/s with a 60 ms round trip. Roughly how much data must be in flight to fill it? (Answer: 1.25 GB/s × 0.06 s = 75,000,000 bytes, about 71.5 MiB.)
