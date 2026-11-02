# OUTLINE — de.choosing-table-format-catalog

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Every mechanism §6.3 needed now exists, real or precisely sourced. This topic closes
   the section by asking the question all of it was really in service of: which format do you
   actually pick, built from a real current support matrix, not brand preference.
2. **Predict.** More engines can write one of these two formats today than the other. Which one?
3. **Reveal.** A real matrix built from each engine's own current docs: most engines can write
   Iceberg; several can only read Delta, or write it in a narrower way.
4. **Reveal + takeaway.** Demo: Snowflake and BigQuery both genuinely write Iceberg today -- a
   real correction to "cloud warehouses only read open formats."
5. **Predict.** This chapter's own `analytics.events` table needs Snowflake, BigQuery, and DuckDB
   to all write it, upsert-heavy. Does the real matrix let Delta survive that requirement?
6. **Reveal + takeaway.** No -- Delta is blocked by all three engines for this exact workload; the
   decision framework rules it out mechanically, not by preference.
7. **Reveal.** Two sourced nuances worth keeping precise: DuckDB's Iceberg write needs a catalog;
   its Delta write exists without one but stays append-only, no updates or merges.
8. **Reveal.** Three real announcements, the same month: Databricks acquiring Tabular, Databricks
   open-sourcing Unity Catalog, Snowflake unveiling Polaris Catalog -- all June 2024.
9. **Reveal + takeaway.** The market's convergence on Iceberg REST as the interop contract isn't a
   trend line -- it's three named vendor decisions in the same month, plus the matrix this topic
   just built.
10. **Recap.** A real matrix, a real decision framework, applied to this chapter's own table:
    Iceberg, over a REST catalog. Handoff: every topic from here forward asks who actually reads
    these tables -- Trino first.
