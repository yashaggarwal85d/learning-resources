Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): a real HyperLogLog sketch's error against an exact count on a Zipf-skewed
stream, measured across several register counts; two partitioned sketches merged and confirmed to
match a single combined-stream sketch exactly; a real Count-Min Sketch checked against the
stream's heaviest keys and confirmed to never undercount.

- Flajolet, Fusy, Gandouet, Meunier, "HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm": [algo.inria.fr](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf). The register observable and the harmonic-mean evaluation function.
- Heule, Nunkesser, Hall, "HyperLogLog in Practice": [research.google.com](https://research.google.com/pubs/archive/40671.pdf). HLL++'s own empirical bias correction and sparse representation.
- BigQuery documentation, "Approximate aggregate functions": [docs.cloud.google.com](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions). A real warehouse's own `APPROX_COUNT_DISTINCT` contract.
- Apache DataSketches documentation, "Theta Sketch Set Operations Accuracy": [datasketches.apache.org](https://datasketches.apache.org/docs/Theta/ThetaSketchSetOpsAccuracy.html). A real sketch library's own set-operation accuracy rules.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=hyperloglog-distinct-counting:%20).
