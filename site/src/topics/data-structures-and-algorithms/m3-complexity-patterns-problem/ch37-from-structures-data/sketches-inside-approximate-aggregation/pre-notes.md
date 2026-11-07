# Pre-notes — Sketches inside approximate aggregation

- **Aggregate:** a function that reduces many rows to one answer (a count, a sum, a median).
- **Partial aggregate:** the in-progress state an aggregate keeps while scanning only part of the data, before it has seen the rest.
- **Associative:** combining two partial states in either order gives the same result; required for a partial aggregate to be combined later without re-reading the rows.
- **Cardinality:** the count of distinct values in a set.
- **Quantile:** the value below which a given fraction of the data falls (the median is the one-half quantile).
- **Sample:** a small subset of the data, kept in place of all of it.
- **Relative error:** how far an estimate is allowed to be from the true value, as a fraction of the true value.
