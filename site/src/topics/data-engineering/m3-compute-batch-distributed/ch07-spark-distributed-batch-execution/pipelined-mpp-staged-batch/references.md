Last verified: 1 November 2026. Both measured claims -- a vectorised, batched computation
running meaningfully faster per row than the identical row-at-a-time computation, and a
streaming pipeline keeping peak memory flat across a hundredfold row-count increase while a
materialising pipeline's peak memory grows proportionally -- are measured directly against real
local Python/NumPy, standing in for the chapter's own pandas-UDF-vs-Ray-Data lab (CPU-only,
scaled down; the GPU-utilisation claim is sourced from Ray's own documentation, not measured
here, since the builder's machine has no GPU).

- Trino documentation, "Fault-tolerant execution": [trino.io](https://trino.io/docs/current/admin/fault-tolerant-execution.html).
- Ray documentation, "Ray Data internals": [docs.ray.io](https://docs.ray.io/en/latest/data/data-internals.html).
- Apache Spark documentation, "RDD Programming Guide" (4.0.0): [spark.apache.org](https://spark.apache.org/docs/4.0.0/rdd-programming-guide.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=pipelined-mpp-staged-batch:%20).
