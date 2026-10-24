# Outline — de.incremental-models-snapshots-dbt

1. **Hook.** Every model in the last topic rebuilt completely, every run. What happens once a
   fact table has far too many rows to keep doing that?
2. **Reveal: what makes a run incremental, quoted directly.** `is_incremental()` only returns
   true under specific conditions; it is what makes a run touch less than the whole table.
3. **Predict (within first four).** A correction to an old row, dated as of when it actually
   happened rather than when it arrived, needs a wider lookback window to be caught safely?
4. **Reveal: the lab — the strategies, run for real.** `append`, `delete+insert`, `merge`,
   `microbatch` — four real materializations of the same fact table, named and compared.
5. **Reveal: the lab — the adapter doesn't support every named strategy.** `insert_overwrite`
   is a real, documented strategy that this project's own adapter genuinely cannot run.
   Takeaway: choosing a strategy also means checking it against the actual adapter.
6. **Predict.** Does any lookback window, however wide, catch a correction dated in the past?
7. **Reveal: the lab — a missed correction, confirmed, then fixed with --full-refresh.**
   Takeaway: a lookback window only helps a correction that is itself recent; an old-dated
   correction needs a different mechanism or a full rebuild.
8. **Predict.** Does adding a column to a model's own query just work on the next incremental
   run?
9. **Reveal: the lab — three real stages of a schema change.** Ignore silently drops the
   column; append_new_columns adds it but leaves old rows null; full-refresh backfills
   everything. Takeaway: "ignore" is not "refuse" — it is silent, and that is the trap.
10. **Reveal: snapshots as SCD2, quoted directly; the timestamp vs check strategies, run for
    real.** The same real change produces two different `dbt_valid_from` values depending on
    strategy.
11. **Reveal: why timestamp is preferred, quoted directly; tied back to topic 13's own
    mechanism.** `dbt_valid_from`/`dbt_valid_to` are exactly the effective/expiry columns topic
    13 built by hand.
12. **Recap.**
13. **Prove it.** Given a fact table that is append-only by nature but occasionally receives a
    correction to a months-old row, which strategy, and what extra care, actually handles both?
