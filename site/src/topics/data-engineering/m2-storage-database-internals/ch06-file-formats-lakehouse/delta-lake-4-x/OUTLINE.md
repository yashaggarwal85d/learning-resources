# OUTLINE — de.delta-lake-4-x

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Topic 29 closed on: everything so far is the protocol as it stands. This topic closes
   the Delta arc with the current release line that ships it, and the library, Delta Kernel, that
   lets this very sandbox read and write Delta correctly with no Spark cluster at all.
2. **Predict.** Does every engine that wants to read Delta (Flink, Trino, DuckDB, this script)
   have to reimplement the whole protocol itself, or is there one shared library?
3. **Reveal.** Delta Kernel: a Rust library that handles the protocol so a connector doesn't have
   to; query-engine agnostic, with a native Rust API and a C/C++ FFI layer.
4. **Reveal + takeaway.** delta-rs is a *separate*, independent implementation (not a Kernel
   connector) -- the one `deltalake`, installed directly in this script, is built on. Demo 1: a
   real table written and appended with delta-rs, its real `_delta_log` protocol action read
   straight off disk.
5. **Predict.** The table's already moved on to version 1. Can delta-rs still read what it looked
   like at version 0, with no Spark session, no separate catalog?
6. **Reveal + takeaway.** Yes -- demo 2's real time-travel read by version number, multi-version
   support with delta-rs alone.
7. **Reveal.** Demo 3: enabling deletion vectors and row tracking (the exact two features topics
   14-15 and 29 built by hand) with one call -- the table's real protocol numbers jump from (1, 2)
   to (3, 7), real reader/writer feature lists appear.
8. **Reveal.** Demo 4: the same mechanism enables the Variant type feature, connecting back to
   topic 8's own Variant work -- collations and the Geospatial table feature are the same kind of
   protocol feature, both landing in Delta Kernel at 4.2.
9. **Reveal + takeaway.** The 4.x release line, precisely: 4.4 built/tested against Spark 4.0.1,
   4.1.0, 4.2.0 (UniForm's Iceberg module lags at 4.1); identity and generated columns in 4.4; type
   widening fully supported since 4.0; Variant shredding still preview-named in 4.3, not fully out
   of preview as the syllabus line claims.
10. **Recap.** Delta Kernel is the shared library; delta-rs is a separate real implementation this
    script used directly; the 4.x line's features are real, versioned, and most are Kernel
    features specifically. Handoff: both Iceberg and Delta now exist as real, fully built arcs --
    next is what sits above either so more than one engine can find a table: the catalog.
