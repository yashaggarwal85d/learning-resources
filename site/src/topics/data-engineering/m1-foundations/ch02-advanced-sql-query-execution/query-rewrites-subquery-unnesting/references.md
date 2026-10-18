Last verified: 2026-10-14.

- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/plan/analyzejoins.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/plan/analyzejoins.c), function `join_is_removable` — the exact join-elimination condition, quoted verbatim.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/prep/prepjointree.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/prep/prepjointree.c), function `reduce_outer_joins` — the LEFT-to-INNER and LEFT-to-ANTI strength-reduction rules, quoted verbatim.
- T. Neumann, A. Kemper, ["Unnesting Arbitrary Queries"](http://www.btw-2015.de/res/proceedings/Hauptband/Wiss/Neumann-Unnesting_Arbitrary_Querie.pdf), BTW 2015 — the dependent-join formalism, simple unnesting (predicate pull-up), and general unnesting (dependent-join push-down), quoted and paraphrased directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=query-rewrites-subquery-unnesting:%20).
