Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own PostgreSQL 16 cluster, database `learnshop`, table `orders`: a real transaction left
open for one second while a cursor run happens, a real strict-cursor miss and a real lookback
catch of that same row, a real idempotent merge repeated three times, and a real hard delete
checked against a watermark that can never see it.

- PostgreSQL docs, "Date/Time Functions and Operators": [postgresql.org](https://www.postgresql.org/docs/current/functions-datetime.html). Why `transaction_timestamp()` and `now()` stay fixed for a transaction's whole life, unlike `clock_timestamp()`.
- PostgreSQL docs, "Sequence Manipulation Functions": [postgresql.org](https://www.postgresql.org/docs/current/functions-sequence.html). Why a `nextval()` value is never handed back, even on rollback.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=incremental-extraction-high-watermark:%20).
