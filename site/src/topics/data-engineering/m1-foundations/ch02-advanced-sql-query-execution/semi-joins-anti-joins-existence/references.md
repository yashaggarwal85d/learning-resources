Last verified: 2026-10-14.

- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/plan/subselect.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/plan/subselect.c), functions `convert_ANY_sublink_to_join`, `convert_EXISTS_sublink_to_join`, `sublink_testexpr_is_not_nullable` — the exact nullability-proof requirement that gates converting `NOT IN` to an anti-join, and the unconditional conversion for `EXISTS`/`NOT EXISTS`.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/path/joinpath.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/path/joinpath.c) — `JOIN_SEMI`/`JOIN_ANTI` as planner-internal join types.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/commands/explain.c`](https://github.com/postgres/postgres/blob/master/src/backend/commands/explain.c) — the `EXPLAIN` join-type labels `Semi`/`Anti`/`Right Semi`/`Right Anti`.
- PostgreSQL 18 Release Notes, [§E.1](https://www.postgresql.org/docs/18/release-18.html) — "Allow the optimizer to use Right Semi Join plans... semi-joins are used when needing to find if there is at least one match" (Richard Guo).
- PostgreSQL 18 Documentation, [§9.24, "Subquery Expressions"](https://www.postgresql.org/docs/current/functions-subquery.html) — `EXISTS`/`IN`/`NOT EXISTS`/`NOT IN` as specified from the SQL side (cited in full by topic 2).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=semi-joins-anti-joins-existence:%20).
