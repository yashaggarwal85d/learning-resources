# Outline — de.dbt-models-tests-lineage

1. **Hook.** A model file is just one `select` statement, with no `CREATE TABLE`, no `INSERT`,
   no target schema name anywhere in it. How does dbt turn that into a table that actually
   exists in a database at all?
2. **Reveal: what a model actually is, quoted directly.** "A SQL model is a select statement" —
   dbt wraps it in the DDL/DML for whatever warehouse is configured.
3. **Predict (within first four).** Does `stg_orders.sql` selecting from `stg_customers.sql` by
   literally writing `stg_customers`'s table name create a dependency dbt can see and order by?
4. **Reveal: the lab — `ref()`, not table names.** The real project's `fct_orders.sql` uses
   `{{ ref('stg_orders') }}`, never a literal table name.
5. **Reveal: the lab — the DAG, read from dbt's own manifest after a real build.** Takeaway:
   `ref()` is what lets dbt compute the build order and the dependency graph; a literal table
   name is invisible to it.
6. **Predict.** A Jinja macro converting cents to dollars is used in one model. Does changing the
   macro's own code require editing every model that uses it?
7. **Reveal: the macro, quoted directly; the lab's own macro.** `cents_to_dollars()`, used once,
   verified against the real dbt run's own numbers.
8. **Predict.** If a `relationships` test on `stg_orders` fails (a dangling `customer_id`), does
   dbt still try to build `fct_orders` on top of the bad data?
9. **Reveal: the lab — a failing data test actually blocking downstream models.** Takeaway: dbt
   tests aren't just a report — a failing test on `main` blocks exactly what depends on it.
10. **Reveal: the unit test, run in isolation, no seeded data touched.** Validates the macro's own
    logic against fixed fabricated rows before any real data is ever loaded.
11. **Reveal: docs and lineage; dbt Mesh, named and sourced.** The docs site is generated from the
    same dependency graph already proven in steps 4-5; dbt Mesh's cross-project refs, model
    contracts, versions and access levels are quoted from dbt's own documentation, not built
    hands-on (requires a second project and an Enterprise plan).
12. **Recap.**
13. **Prove it.** Given a brand-new model that joins two existing ones by writing out their table
    names directly instead of `ref()`-ing them, what breaks, and when does it break?
