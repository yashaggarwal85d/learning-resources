- **State (in a processing engine)**: the data an engine holds between inputs to compute its
  result — may fit in memory or need a dedicated backend. *Where you meet it:* the engine-drivers
  reveal.
- **Key-value store**: a serving store answering a point lookup by key, fast and simple. *Where
  you meet it:* the question-shape-to-store reveal.
- **Columnar store**: a serving store answering slice-and-aggregate questions over many rows at
  once. *Where you meet it:* the question-shape-to-store reveal.
- **Pre-aggregation**: computing and storing a query's answer ahead of time, rather than at read
  time. *Where you meet it:* the pre-agg-versus-on-query reveal.
- **Amplification**: how many physical bytes get read or written for one logical byte of data —
  assumed vocabulary from Chapter 5's own LSM-compaction topic. *Where you meet it:* the
  amplification-ledger reveal.
- **Operator (in a processing engine)**: one step of a computation pipeline — assumed vocabulary
  this topic doesn't re-derive. *Where you meet it:* named only in passing, in the engine-drivers
  reveal.
