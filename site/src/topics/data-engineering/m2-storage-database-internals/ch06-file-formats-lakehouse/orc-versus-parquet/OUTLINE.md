# Outline — de.orc-versus-parquet

1. **Hook.** A single Parquet file, however well encoded and skippable, is still one immutable
   file — ORC is the one real rival that made nearly every layout decision differently.
2. **Predict: does ORC's own built-in row index prune finer than Parquet's bare row-group
   statistics, by default, with no configuration?**
3. **Reveal: ORC's stripe/stream layout** — each column stored as several named streams
   (PRESENT, DATA) inside a stripe, with index streams always placed first so a plain scan never
   has to read them.
4. **Reveal: ORC's ROW_INDEX stream, one entry every 10,000 rows, present unconditionally** — on
   the same 100,000-row dataset, a selective query reads 10,000 rows under ORC's fixed index vs.
   25,000 under Parquet's bare row-group statistics at this row-group size.
5. **Predict: can Parquet still beat ORC's fixed 10,000-row granularity?**
6. **Reveal: Parquet's page index, once turned on, prunes to 2,500 rows** — finer than ORC's
   fixed default, but it's opt-in, and it costs 4x ORC's row-index metadata for that precision.
7. **Reveal: measured bytes and rows, ORC vs. both Parquet configurations, side by side.**
8. **Reveal: ORC's own ACID history in Hive** — row-level transactions landed in Hive 0.13 for
   ORC specifically, because the feature needed a row id no other format Hive supported had yet;
   that's why ORC became Hive's own default.
9. **Reveal: why Parquet became the lakehouse-wide default anyway** — a format built from the
   start to be used by any framework, plus the table formats of the next section choosing it
   first; ORC still shows up in legacy Hive and some Trino estates.
10. **Recap.**

Predicts at steps 2 and 5 (both within the quality guideline's early-predict window, same step
numbers topic 8 used). Takeaways at steps 4, 7, 9 — none immediately after a predict step (3 and
6 are reveals with no takeaway tag; 4 and 7 carry the takeaways from the measurement, 9 carries
the one from the adoption story).
