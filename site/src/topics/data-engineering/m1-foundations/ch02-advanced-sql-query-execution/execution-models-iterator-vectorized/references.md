Last verified: 2026-10-22.

- DuckDB Documentation, ["Execution Format"](https://duckdb.org/docs/2.0/internals/vector.html) — the vectorized execution model and default vector size, quoted verbatim.
- Boncz, Zukowski, Nes, ["MonetDB/X100: Hyper-Pipelining Query Execution"](https://cs.brown.edu/courses/cs227/archives/2008/Papers/ColumnStores/MonetDB.pdf) (CIDR 2005) — the Volcano-iterator diagnosis and the vector-size experiment, quoted verbatim.
- Neumann, ["Efficiently Compiling Efficient Query Plans for Modern Hardware"](https://www.vldb.org/pvldb/vol4/p539-neumann.pdf) (VLDB 2011) — HyPer's data-centric, push-based compilation model, quoted verbatim.
- Leis, Boncz, Kemper, Neumann, ["Morsel-Driven Parallelism: A NUMA-Aware Query Evaluation Framework for the Many-Core Age"](https://db.in.tum.de/~leis/papers/morsels.pdf) (SIGMOD 2014) — the morsel-driven scheduling model, quoted verbatim.
- Measured directly on this topic's own PostgreSQL 16.15 and DuckDB 2.0.0 instances (identical 20,000,000-row logical dataset in both) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=execution-models-iterator-vectorized:%20).
