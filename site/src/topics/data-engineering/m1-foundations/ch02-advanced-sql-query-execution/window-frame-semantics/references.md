Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§4.2.8, "Window Function Calls"](https://www.postgresql.org/docs/current/sql-expressions.html) — `PARTITION BY`/`ORDER BY`/frame syntax, the `ROWS`/`RANGE`/`GROUPS` peer-group definitions, the default-frame statement, and `EXCLUDE`, all quoted verbatim.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/parser/parse_agg.c`](https://github.com/postgres/postgres/blob/master/src/backend/parser/parse_agg.c), function `transformWindowFuncCall` — the exact no-nesting rule and its `ERRCODE_WINDOWING_ERROR` message.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=window-frame-semantics:%20).
