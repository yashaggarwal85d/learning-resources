Last verified: 30 October 2026. Expert sign-off: pending. One measured experiment run in this
sandbox (`examples.py`): a cold-restart latency measurement, a sliding-window steady-state
detector, and five repeated trials with a confidence interval, against this sandbox's own
Postgres.

- PostgreSQL, "19.4. Resource Consumption": [postgresql.org](https://www.postgresql.org/docs/current/runtime-config-resource.html). The buffer pool/OS page cache relationship, quoted directly.
- RocksDB project wiki, "Overview of RocksDB": [raw.githubusercontent.com](https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Overview.md). Compaction debt, read for comparison, quoted directly.
- Georges, Buytaert & Eeckhout, "Statistically Rigorous Java Performance Evaluation" (OOPSLA 2007): [dri.es](https://dri.es/files/oopsla07-georges.pdf). Steady-state detection and confidence-interval convention, quoted directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=warmup-steady-state-measurement:%20).
