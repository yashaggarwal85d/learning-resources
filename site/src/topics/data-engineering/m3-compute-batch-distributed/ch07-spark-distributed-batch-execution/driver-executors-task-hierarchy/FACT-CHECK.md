# Fact-check: de.driver-executors-task-hierarchy

Adversarial pass against the fetched source texts in `sources/` and the measured output of
`examples.py`. One row per claim in `OUTLINE.md`'s claims list.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Application → job → stage → task, exact definitions | Confirmed | `sources/cluster-overview.txt` glossary, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | Driver runs `main()`, owns `SparkContext` | Confirmed | Same glossary, "Driver program" row, quoted exactly. |
| 3 | Executors are per-application processes that run tasks | Confirmed | Same glossary, "Executor" row, quoted exactly. |
| 4 | Spark 4.x cluster managers: standalone, YARN, Kubernetes | Confirmed | Same page, "Cluster Manager Types" section, all three named and quoted. |
| 5 | Mesos removed in Spark 4.0 | Confirmed | `sources/release-4-0-0.txt` line "[SPARK-44442] Drop mesos support", in the 4.0.0 release notes. |
| 6 | A job is scoped per action, not per DataFrame; task count equals partition count | Confirmed | Measured directly: two `count()` calls on the same unrepartitioned DataFrame produced two distinct job ids (verified strictly increasing); `repartition(8)` changed the busiest new stage's task count from 4 to 8 on the identical 1,000,000-row dataset. See `examples.py` output in session log. |

## Red team

- **Could the "new job id" result be an artifact of AQE adding bookkeeping jobs, not a genuine second computation?** Checked: both the first and second `count()` produce a job whose busiest stage has exactly 4 tasks (matching the 4 real partitions), and the job id strictly increases between calls — this is consistent with two genuine, independent computations, not a stray bookkeeping job (which would not scan all 4 partitions). The script takes the *newest* job id after each action specifically to avoid being confused by any extra trivial job Spark's AQE/codegen path may register alongside the real one (observed in an early run: `[1, 0]` after one action) — documented in the script's own comment.
- **Does "task count equals partition count" hold only because `count()` happens to not aggregate?** `count()` does aggregate (a per-partition count, then a one-task reduce). The script explicitly takes the stage with the *most* tasks among the job's stages, which is the per-partition map stage (4, then 8), not the one-task reduce stage — otherwise the claim would be checking the wrong stage. Verified by inspecting all of the job's `stageIds`, not just the last one.
- **Is "losing the driver ends the application" actually demonstrated, or only asserted?** Not demonstrated — disclosed as sourced-only in `post-notes.md` and `references.md`, since `local[4]` mode runs the driver and worker threads in one JVM and cannot show independent-process executor failure. This is stated plainly, not implied as measured.
- **Is the Spark docs "latest" version (4.2.0) the right one to cite for a Spark 4.0-scoped chapter?** The glossary and architecture text fetched is unchanged between 4.0 and 4.2 (confirmed by cross-reading the 4.0.0 release notes, which list no changes to `cluster-overview.html`'s content); `SOURCES.md` discloses the fetched version honestly rather than claiming 4.0 docs were read.

No corrections were needed to `OUTLINE.md` as a result of this pass.
