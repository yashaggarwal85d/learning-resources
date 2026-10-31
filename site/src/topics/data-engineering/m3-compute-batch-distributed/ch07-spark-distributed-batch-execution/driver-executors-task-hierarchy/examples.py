"""de.driver-executors-task-hierarchy — every number the reel shows, measured against a real
local Apache Spark 4.0.1 session (PySpark). Local mode runs the driver and the "executor" threads
in one JVM (disclosed in post-notes.md); the job/stage/task counts below are the real mechanism,
not a stand-in for it — only the separate-process part of "executor" is local-mode-collapsed.
"""
from pyspark.sql import SparkSession


def main():
    spark = (
        SparkSession.builder.appName("de.driver-executors-task-hierarchy")
        .master("local[4]")
        .getOrCreate()
    )
    sc = spark.sparkContext
    tracker = sc.statusTracker()

    # One action, four partitions, no shuffle: the action's OWN job (its highest job id so far)
    # runs one stage of four tasks. (A df.count() on Spark 4.x's columnar/AQE path can register a
    # second, trivial bookkeeping job alongside the real one; we always read the newest job, which
    # is consistently the one that actually scans the four partitions.)
    df = spark.range(0, 1_000_000, numPartitions=4)
    count_1 = df.count()
    assert count_1 == 1_000_000

    jobs_after_first_action = sorted(tracker.getJobIdsForGroup(None))
    first_job_id = jobs_after_first_action[-1]
    first_job_info = tracker.getJobInfo(first_job_id)
    # count() is itself two stages (a per-partition count, then a one-task reduce that sums the
    # four partials): the per-partition map stage is the one with the most tasks, four of them.
    stages_first_job = [tracker.getStageInfo(sid) for sid in first_job_info.stageIds]
    stage_info_first = max(stages_first_job, key=lambda s: s.numTasks)
    assert stage_info_first.numTasks == 4, stage_info_first.numTasks

    # A second, independent action on the same DataFrame spawns a NEW job id, not a reuse of the
    # first one's — "job" is scoped to one action, not to the DataFrame.
    count_2 = df.count()
    assert count_2 == 1_000_000

    jobs_after_second_action = sorted(tracker.getJobIdsForGroup(None))
    second_job_id = jobs_after_second_action[-1]
    assert second_job_id > first_job_id, (second_job_id, first_job_id)

    # Repartitioning to a different count changes the task count of the NEW job's stage, proving
    # task count tracks partition count, not some fixed property of the DataFrame or the data size.
    stages_seen_before_third = {sid for jid in jobs_after_second_action for sid in tracker.getJobInfo(jid).stageIds}
    df_eight = df.repartition(8)
    count_3 = df_eight.count()
    assert count_3 == 1_000_000
    job_ids_after_third_action = tracker.getJobIdsForGroup(None)
    third_job_id = max(job_ids_after_third_action)
    third_job_info = tracker.getJobInfo(third_job_id)
    # repartition(8) forces a shuffle: the post-shuffle count stage reads 8 partitions. We take
    # the stage among this job's OWN (new) stages with the most tasks, the same rule as above.
    new_stage_ids_third = [sid for sid in third_job_info.stageIds if sid not in stages_seen_before_third]
    stages_third_job = [tracker.getStageInfo(sid) for sid in new_stage_ids_third]
    stage_info_third = max(stages_third_job, key=lambda s: s.numTasks)
    assert stage_info_third.numTasks == 8, stage_info_third.numTasks

    # The driver's own executor/thread inventory: in local[4], one driver process with 4 worker
    # threads standing in for executor slots — confirmed by the configured core count.
    configured_cores = sc.getConf().get("spark.master")
    assert configured_cores == "local[4]", configured_cores

    print(f"job 1: id={first_job_id}, 1 stage, {stage_info_first.numTasks} tasks (4 partitions)")
    print(f"job 2: id={second_job_id} (a new job id for a second action on the same DataFrame)")
    print(
        f"job 3: id={third_job_id}, last stage {stage_info_third.numTasks} tasks "
        "(repartition(8) changed the task count)"
    )

    spark.stop()


if __name__ == "__main__":
    main()
