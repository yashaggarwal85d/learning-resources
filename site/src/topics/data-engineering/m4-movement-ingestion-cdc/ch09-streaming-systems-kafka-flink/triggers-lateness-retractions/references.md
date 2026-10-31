Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy windowed aggregator, no real Flink or Beam runner available): three real,
different totals for one window's early, on-time, and late firings; a late record measurably
dropped once the allowed-lateness boundary passes; and a downstream sum-of-sums measurably
correct under discarding and accumulating-and-retracting, but measurably wrong under accumulating
alone. The firing-timing vocabulary, the allowed-lateness mechanics, and the three accumulation
modes are disclosed, sourced-only claims from the Dataflow Model paper, Apache Flink's
documentation, and Apache Beam's documentation.

- The Dataflow Model (Akidau, Chernyak & Lax, 2015, VLDB):
  [vldb.org/pvldb/vol8/p1792-Akidau.pdf](https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf). The
  discarding/accumulating/accumulating-and-retracting definitions and the watermark-trigger
  mechanics this topic cites.
- Windows (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../operators/windows/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/operators/windows/).
  The allowed-lateness and late-firing mechanics this topic cites.
- Beam Programming Guide — Triggers (Apache Beam docs):
  [beam.apache.org/documentation/programming-guide/#triggers](https://beam.apache.org/documentation/programming-guide/#triggers).
  The early/late firing terminology and allowed-lateness behavior this topic cites, as a second,
  independent primary source implementing the same Dataflow Model vocabulary.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=triggers-lateness-retractions:%20).
