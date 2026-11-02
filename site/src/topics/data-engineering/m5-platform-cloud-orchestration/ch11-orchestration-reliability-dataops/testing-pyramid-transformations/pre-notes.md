# Before you watch

- **Unit test** — a check against one small, isolated piece of logic, fast and narrow.
- **dbt unit test** — a mocked input and an expected output, run against a model's SQL logic without materializing it.
- **Property-based test** — an invariant stated once and checked against many generated inputs, not one example.
- **Golden dataset** — a known-good output frozen whole, diffed on every change rather than checked by one narrow assertion.
- **In-pipeline expectation test** — a check that runs inside the live pipeline itself, against real production data.
- **Flaky test** — a test that passes and fails across identical runs, usually from ordering, time or floating point.
