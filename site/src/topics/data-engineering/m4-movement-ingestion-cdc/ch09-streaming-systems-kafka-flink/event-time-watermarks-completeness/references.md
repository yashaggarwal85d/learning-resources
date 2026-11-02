Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy synthetic late/duplicate event stream, a toy bounded-out-of-orderness
watermark, a toy idle-source stall and fix, and a toy alignment model, no real Flink cluster
available): a tighter bound that measurably marked more events late, a naive watermark that
stalled while an idle-aware one recovered, and a fast partition's drift bounded by a chosen cap.
The watermark-as-heuristic claim and the idle-source/alignment mechanics are disclosed,
sourced-only claims from the Dataflow Model paper and Apache Flink's own documentation.

- The Dataflow Model (Akidau, Chernyak & Lax, 2015, VLDB):
  [vldb.org/pvldb/vol8/p1792-Akidau.pdf](https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf).
  The watermark-as-heuristic claim this topic's first reveal cites.
- Generating Watermarks (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../generating_watermarks/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/event-time/generating_watermarks/).
  The idle-source and watermark-alignment mechanics this topic's later reveals cite.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=event-time-watermarks-completeness:%20).
