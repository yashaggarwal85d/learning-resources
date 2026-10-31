# Outline: de.diagnosing-jobs-spark-ui

1. **Hook.** Five jobs are broken. Same symptom from a distance (the job is slow), five
   different causes under the hood. The UI is the one instrument that tells them apart.
2. **Reveal: skew.** One task in an 8-task stage runs hundreds of times longer than the rest. [from]
3. **Predict: what will the stage's own task-duration table show for this.** [idx2]
4. **Reveal: the table confirms it** -- one bar in the task-metric distribution towers over
   every other task, min/median/max showing one outlier.
5. **Elaborate: skew's own signature** -- uneven task durations in the SAME stage, not across
   stages; the culprit is partitioning, not hardware. [takeaway1]
6. **Predict: a second job's Stages tab shows real spill bytes on one task only, and zero on
   every other task in the stage -- same shape as skew's imbalance, different cause. What is
   it?** [idx5]
7. **Reveal: spill** -- "Shuffle spill (memory)" and "Shuffle spill (disk)" both nonzero on
   exactly the task holding the oversized partition.
8. **Reveal: GC** -- "GC time" nonzero and a meaningful fraction of a stage's total task time
   in one job; zero in an equivalent DataFrame job on the same data.
9. **Reveal: small files** -- thousands of tasks, each one's own scheduler delay bigger than
   its own CPU time; the job is slow because of how many times overhead gets paid, not how
   much work gets done.
10. **Reveal: driver bottleneck** -- a stretch of wall-clock time between two jobs where the
    Executors tab shows every executor idle; no stage, no task, accounts for it.
11. **Recap: the triage order** -- stage task-duration spread (skew), task-level spill/GC
    columns, task count vs. average duration (small files), event-timeline gaps with idle
    executors (driver). [takeaway2]
12. **Recap: one more metric to confirm, not just to suspect.** [takeaway3]
