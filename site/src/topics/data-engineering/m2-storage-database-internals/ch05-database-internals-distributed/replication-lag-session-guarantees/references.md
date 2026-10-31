Last verified: 30 October 2026. Five real measured experiments run in this sandbox (`examples.py`),
against a real streaming-replication primary/standby pair this topic's own setup built (primary on
port 5432, standby on port 5434): read-your-writes broken on a paused standby and fixed with a real
LSN-token wait, monotonic reads and consistent-prefix reads confirmed holding on the single standby,
and real `write_lag`/`flush_lag`/`replay_lag` measured under a 2,000-row write load.

- Jepsen, "Read Your Writes": [jepsen.io](https://jepsen.io/consistency/models/read-your-writes). The guarantee this topic breaks on a real paused standby and fixes with a real LSN token.
- Jepsen, "Monotonic Reads": [jepsen.io](https://jepsen.io/consistency/models/monotonic-reads). The second guarantee, measured holding on this topic's own single standby.
- PostgreSQL documentation, "26.2. Log-Shipping Standby Servers": [postgresql.org](https://www.postgresql.org/docs/current/warm-standby.html). The real standby configuration this topic's own setup built, and the WAL-receiver lag indicator it describes.
- PostgreSQL documentation, "27.2.4. pg_stat_replication": [postgresql.org](https://www.postgresql.org/docs/current/monitoring-stats.html). The real write_lag/flush_lag/replay_lag numbers this topic measures under load.
- Terry et al., "Managing Update Conflicts in Bayou, a Weakly Connected Replicated Storage System" (SOSP 1995) — the original source of the session-guarantees terminology, cited bibliographically only: `cs.utexas.edu`, `cs.cornell.edu` and `cs.umd.edu` all serve it behind a broken TLS chain in this sandbox (confirmed domain-wide, 2026-10-30); Jepsen's own pages above restate the same guarantees precisely and are quoted instead.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=replication-lag-session-guarantees:%20).
