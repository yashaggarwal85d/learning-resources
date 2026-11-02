- **Iceberg metadata tree and scan planning**, this chapter's previous-but-four topic. *Where you
  meet it:* this topic's manifest bound truncation is read directly off the same
  `table.inspect.data_files()` metadata that topic walked by hand.
- **HyperLogLog and distinct counting**, Chapter 5 §5.6. *Where you meet it:* referenced by direct
  analogy — an NDV theta sketch is the same kind of bounded-memory, approximate-count object that
  topic already built a different way.
- **Quantile sketches: t-digest, DDSketch, KLL**, Chapter 5 §5.6's closing topic. *Where you meet
  it:* this topic directly reuses that topic's sketch-vs-exact-value framing, applied here to a
  distinct-count sketch instead of a quantile sketch.
- **Table snapshot model**, Chapter 6's earlier shared-foundations topics. *Where you meet it:*
  registering a statistics file is its own real table-metadata update, read back from a freshly
  reloaded table the same way a schema or data change would be.
