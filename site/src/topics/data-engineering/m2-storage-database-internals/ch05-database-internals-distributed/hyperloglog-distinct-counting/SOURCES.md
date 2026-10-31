# Sources: HyperLogLog and distinct counting (`de.hyperloglog-distinct-counting`)

The original HyperLogLog paper (Flajolet, Fusy, Gandouet, Meunier, AofA 2007) and Google's own
HyperLogLog++ engineering paper (Heule, Nunkesser, Hall, EDBT 2013) are both fetched directly
from their authors' own hosted PDFs. BigQuery's own documentation gives a real warehouse's
`APPROX_COUNT_DISTINCT` contract against exact `COUNT(DISTINCT)`, and Apache DataSketches' own
documentation gives the real accuracy rules for Theta-sketch set operations.

## HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm (Flajolet, Fusy, Gandouet, Meunier)

URL: https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf
Version: AofA 2007

> the best previously known cardinality estimator, L OG L OG, whose accuracy can be matched by consuming only 64%
of the original memory.

> H YPER L OG L OG, described in detail in the next section, is based on the same observable as L OG L OG, namely
the largest ρ value obtained, where ρ(x) is the position of the leftmost 1-bit in binary string x.

> our algorithm differs from standard L OG L OG by its
evaluation function: its is based on harmonic means, while the standard algorithm uses what amounts to
a geometric mean

Contents: the structure's own register observable (the position of the leftmost set bit of a
hashed value) and its own choice of a harmonic rather than geometric mean across registers —
the "leading-zero estimation, registers and harmonic mean" half of this topic's own scope line.

## HyperLogLog in Practice: Algorithmic Engineering of a State of the Art Cardinality Estimation Algorithm (Heule, Nunkesser, Hall)

URL: https://research.google.com/pubs/archive/40671.pdf
Version: EDBT 2013

> we can compute
the observed bias and use it to correct the raw estimate.

> We use knearest neighbor interpolation to get the bias for a given
raw estimate

> Instead, we can use a sparse representation that stores pairs (idx, %(w)). If the list of such pairs
would require more memory than the dense representation
of the registers (i.e., 6m bits), the list can be converted to
the dense representation.

Contents: the empirical bias correction (a measured, interpolated correction table for small
cardinalities) and the sparse representation (storing only non-empty register pairs until the
list would cost more than a dense array) — the "HLL++ bias correction and sparse mode" half of
this topic's own scope line.

## Approximate aggregate functions (BigQuery documentation)

URL: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions
Version: retrieved 2026-10-31

> Returns the approximate result for COUNT(DISTINCT expression). The value
returned is a statistical estimate, not necessarily the actual value.

> This function is less accurate than COUNT(DISTINCT expression), but performs
better on very large input.

Contents: a real warehouse's own documented contract for `APPROX_COUNT_DISTINCT` — a statistical
estimate, not the exact value, traded for performance on very large input — the "what
`APPROX_COUNT_DISTINCT` returns vs exact `COUNT(DISTINCT)`" clause of this topic's own scope line.

## Theta Sketch Set Operations Accuracy (Apache DataSketches documentation)

URL: https://datasketches.apache.org/docs/Theta/ThetaSketchSetOpsAccuracy.html
Version: retrieved 2026-10-31

> All set operations (Union, Intersection, Difference) between two sketches A and B
must obey the following two rules:

> This means, of course, that depending on the operations and the data, the result set could have
zero, all, or some number in between of the retained values of the Union sketch.

Contents: a real sketch library's own documented rules for union, intersection and difference
over sketches — the real capability (set intersection and difference, not just a count) a Theta
or KMV sketch adds over HyperLogLog, named in this topic's own scope line.
