<section data-section="outcomes">

## Outcomes

A five-dimension comparison (workload isolation, concurrency and spilling, cost-based tuning,
data gravity and egress, governance and lock-in) across the six engines this chapter built or
sourced: Trino, ClickHouse and DuckDB run directly earlier in this chapter; Snowflake, BigQuery
and Redshift taught from their own current documentation in topics 37-39. The §6.5 lab runs one
real DuckDB-over-Iceberg measurement against a real local table and prices that same real byte
count at two warehouses' own published per-byte rates.

</section>

<section data-section="deep-dive">

## Deep-dive

Every earlier topic in this chapter answered "how does this one engine work." This topic answers
a different question: given the same table, the same query, which engine is actually the right
choice, and why. The answer splits cleanly along one axis -- whether the workload is paying for
pooled concurrency and built-in governance, or already has the compute and the data it needs.

</section>

<section data-section="production">

## Production

The lab's real/sourced split is itself a production practice: measure what you can run for real,
price what you can't against the vendor's own current numbers, and never blur the two into a
single unlabeled figure. Snowflake's compute-time billing model, with no comparable per-byte rate
to apply to the lab's measurement, is reported as a real structural difference between the three
warehouses' pricing models, not a missing data point.

</section>

<section data-section="frontier">

## Frontier

BigQuery's and Redshift's own current documentation both still price external-Iceberg scanning
per byte -- the open-table-format trend from earlier in this chapter has reached every warehouse
this chapter sourced, not just the open engines.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every engine in this chapter turned stored data into an answer, but none of them yet turned
stored data into *more* stored data at real scale. The next chapter opens that: Apache Spark and
distributed batch execution, starting with its own execution model.

</section>
