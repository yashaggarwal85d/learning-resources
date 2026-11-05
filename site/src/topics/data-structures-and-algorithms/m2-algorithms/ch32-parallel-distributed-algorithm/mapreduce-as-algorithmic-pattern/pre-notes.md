- **Key–value pair**: a record with a key (what it is grouped by) and a value (its data).
- **Hash partitioning**: sending a key to one of R buckets by hash(key) mod R, so every record
  with the same key always lands in the same bucket.
- **A binary operator and its properties**: associative means grouping does not change the
  result; commutative means order does not change the result.
- **Aggregation**: a group-by computation such as a sum, a count, or a maximum per key.
- **Equi-join**: combining two relations' rows where a key column matches exactly.
- **Network round trip versus local computation**: moving data across machines costs far more
  than computing with it once it is already there.
- **Zipf-skewed frequencies**: a distribution where a few items (a few keys, a few words) are
  far more common than the rest.
