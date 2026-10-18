- **CTE (`WITH` clause)**: a named query defined before the main query and used by name. *Where you meet it:* `WITH recent AS (SELECT …) SELECT … FROM recent`.
- **Side effect**: something a query does besides returning rows, such as writing a row or consuming a sequence value. *Where you meet it:* a data-modifying statement inside a `WITH`.
- **Volatile function**: one whose value can change from call to call. *Where you meet it:* `random()` or `nextval()`.
- **Temporary table**: a table that lives only for a session and holds an intermediate result. *Where you meet it:* `CREATE TEMP TABLE` for a step you reuse.

**Check yourself:** if a CTE calls `random()` and is used twice, should both uses see the same values? (Answer: usually yes, which is why a volatile CTE needs to be computed once.)
