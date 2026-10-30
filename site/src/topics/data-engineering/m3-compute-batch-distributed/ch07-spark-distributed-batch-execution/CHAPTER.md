# Chapter 7 plan: Apache Spark and Distributed Batch Execution (Data Engineering, Milestone 3)

This is the contract for every topic of Chapter 7. Builders keep to their own entry and read the entries next to theirs. Don't edit this file except to append the next topic's entry in syllabus order, immediately after drafting it.

- **Planned:** 30 October 2026, from `syllabus/data-engineering.md` §7.1-7.7 and the Milestone 3 introduction, built in parallel with ten other chapter threads (6, 8, 9, 10, 11, 12, 13, 14, 15, 16), each shipping its own topics as `status: 'held'` since the live sequential cursor (`next-topic.mjs`) is still inside Chapter 5. Nine syllabus entries are marked *(skipped)* and get no reel: "Spark Connect client-server architecture" (7.1), "Indeterminate stages and retry correctness" and "Push-based and remote shuffle services" (7.3), "Real-time mode in Structured Streaming" and "Arbitrary state with transformWithState" (7.4), "Python Data Source API and UDTFs" and "Spark Declarative Pipelines" (7.5), and both entries of §7.6 ("Native engine offload: plan conversion and fallback", "Photon, Gluten+Velox, Comet and GPUs compared") — so **§7.6 contributes no reel at all**, the same pattern as §15.5 and §7.6 of other chapters: it stays in the curriculum (`syllabus/review-notes/de-cuts.md`) and the chapter flows past it. "Ray Data streaming execution" (7.7) is also skipped. The topic after each skipped entry bridges from the last topic that is not skipped, exactly as `next-topic.mjs` resolves it; §7.6 being entirely skipped means 7.5's last topic hands off straight to 7.7's one topic.
- **Assumption about the surrounding chapters (read first).** Chapter 6 (File Formats, Lakehouse and Table Formats) closes Milestone 2 and was **not published** on `main` when this chapter was planned (it is being planned by another agent in parallel). This plan is written from the Milestone 2 "Systems in Production" closing text and the Milestone 3 introduction only: Milestone 2 ends on Iceberg and Delta Lake fixing the "mutable table on an immutable object store" problem at the format level; Milestone 3 opens by turning that stored data into derived data at scale. Topic 1's bridge restates that logical seam in its own words rather than quoting Chapter 6, so it holds under any Chapter 6 wording; a seam pass reconciles the exact sentence once Chapter 6 lands. Chapter 8 (Data Ingestion, Integration and CDC, already published, commit `e82b1f5`) was planned under the explicit assumption that this chapter's last topic (7.7, "Pipelined MPP vs staged batch execution") hands off with: "the execution engines of Milestone 3 all assume the data is already sitting in storage they can read, and that the next question, opening Milestone 4, is how data gets there from the systems that produce it." This chapter's topic 30 handoff is written to match that sentence exactly, so the two chapters' seam needs no reconciliation.
- **Registry fields shared by every topic:** `domain: 'data-engineering'`, `milestone: { number: 3, title: 'Compute: Batch & Distributed Processing' }`, `chapter: { number: 7, title: 'Apache Spark and Distributed Batch Execution', section: '7.1' | … | '7.7' }`, `slug` = the folder below `site/src/topics/`. The registry `title` is the syllabus title; `syllabusTitle` is the heading's title word for word. `status: 'held'` for every topic in this chapter until the owner says to flip a run of them live in syllabus order.
- **Engine of record, and honesty about tools.** Spark claims are run on a local **Apache Spark 4.0.x** (PySpark) in local mode on the builder's own machine — enough cores to see real parallelism, shuffle and spill, too small to see true cluster failure recovery (executor loss, speculative execution across racks) which is sourced from the Spark documentation, the Spark SQL/Core source on GitHub (tag `v4.0.x`) and the AQE/skew-join design docs, disclosed as sourced-only wherever the local run cannot show it. Kubernetes/YARN cluster-manager behaviour, the History Server UI across many executors, and anything needing more than one JVM's worth of memory pressure (true executor OOM-kill, external shuffle service recovery) are sourced-only and disclosed as such. Versions are stated, never assumed: **Apache Spark 4.0** (ANSI mode on by default, Java 17/21, Scala 2.13 baseline, Mesos removed), with 4.1/4.2 features (Arrow-optimised Python UDFs default-on, `transformWithState`, real-time mode, Spark Declarative Pipelines, VARIANT shredding) named and dated from the Spark release notes and JIRA/SPIP pages, never assumed current unless the installed version is 4.1+.

---

## The chapter

### The problem it solves

Milestone 2 ended with data sitting durably and queryably in files and tables. This chapter asks what happens the moment someone runs a query or a job over more of that data than one machine's memory or one evening's wall-clock can absorb: the work has to be cut into pieces, the pieces have to be shuffled across a network without losing or duplicating a row, and a machine or a network link will fail partway through and the job still has to finish correctly. Apache Spark is the chapter's one running system because its public JIRA, its EXPLAIN plans, its Spark UI metrics and its own regression tests make every one of these mechanisms directly observable, not just describable: a learner can predict a stage count from the code, confirm it in the plan, break the job with skew on purpose, and watch the fix in the UI.

It teaches, in order, **how an application becomes a running computation** (7.1: driver, DAG, shuffle, Catalyst, Tungsten, the Python boundary) before anything about tuning, because every later diagnosis is "which part of this picture is slow." Then **why the shuffle in particular hurts, and the levers over it** (7.2: partitioning, the join strategies, AQE, skew, DPP, output files) — the chapter's longest section, because partitioning and joins are where a real job's cost actually lives. Then **what happens when the machine itself runs out of room or dies** (7.3: memory model, spill, caching, GC, task retry, the Spark UI as the instrument that ties 7.1-7.3 together). Then a second execution mode built on the same engine, **incremental computation over an unbounded input** (7.4: Structured Streaming, exactly-once, state stores) — placed after batch because every streaming mechanism is "the batch mechanism, run once per micro-batch, plus a state store and a watermark." Then **what changed under Spark's feet recently and why it matters now** (7.5: ANSI mode, VARIANT) and, briefly, **the two directions the whole model is being pushed in**: faster CPU-bound execution on the same plan shape (7.6, entirely skipped, but the chapter says why it exists) and a different model from a different engine entirely (7.7, closing the chapter by naming what Spark's shape is not).

The learner leaves able to predict a Spark job's stage and shuffle count from its code, read the resulting plan and UI to confirm or correct that prediction, name the one or two most likely causes of a slow stage from its task-metric distribution, and say precisely where Structured Streaming's guarantees come from and where they stop.

### Order of ideas, and why

1. **7.1 Spark execution model (topics 1-7).** A refresher on the driver/job/stage/task hierarchy first (1), because everything else in the chapter is stated in those terms. Then the DAG scheduler's own unit of work, the stage boundary (2), directly on top of (1)'s vocabulary. Then what a stage boundary actually does on the wire, sort-based shuffle (3), since "stage boundary" is an abstraction until the learner has seen the shuffle files it produces. Then how tasks get placed onto that shuffle's output, locality and parallelism (4). Then the planner that decided the physical plan in the first place, Catalyst (5), and the execution layer that runs the plan it chose, Tungsten and codegen (6) — planning before execution, since you cannot explain why a generated method is fast without first knowing what it was asked to compute. Last, the one execution path that escapes both of them, Python UDFs (7), because its cost is precisely "the two previous topics' work doesn't apply here."
2. **7.2 Partitioning, joins and skew (topics 8-16).** Partition sizing (8) first, the lowest-level lever, directly reusing (3)'s shuffle-partition vocabulary. Then the two partitioning schemes a shuffle can produce (9) and the one that avoids a shuffle entirely by pre-arranging the partitions at write time (10) — sizing, then scheme, then "skip the shuffle." Then the two join strategies in order of how much they avoid: broadcast (11, avoids a shuffle on one side entirely), then the two shuffle join strategies against each other (12). Then the mechanism that revisits all of (8)-(12) at runtime with real statistics, AQE (13), placed right after the strategies it can override. Then the failure AQE exists partly to fix, skew (14), and the optimisation that prunes work before any of this runs, DPP (15). Last, the chapter's one topic about what comes out the other end instead of what goes through the shuffle, output file layout (16), closing the section on the small-files problem that bucketing (10) and AQE (13) both partially answer.
3. **7.3 Spark memory and failure behavior (topics 17-22).** The memory model first (17), the resource every other failure in this section consumes. Then spill, the direct consequence of exceeding it (18), then caching and checkpointing, the deliberate, chosen consumption of the same memory (19) — unforced spending right after forced spending. Then the JVM-specific failure mode layered on top of the same heap, GC (20). Then what the cluster does when a task or an executor dies outright, retry and speculation (21), the section's only topic about failure recovery rather than resource pressure. Last, the instrument that diagnoses all five, the Spark UI (22), closing the section by naming where every earlier symptom actually shows up.
4. **7.4 Structured Streaming (topics 23-27).** Micro-batch execution first (23), the one new idea (an incremental plan re-run per trigger) built entirely from 7.1-7.3's machinery. Then the concept that bounds how long state waits for data, watermarks (24), needed before any stateful operator can be explained. Then the operators and output modes that use that bound (25). Then the guarantee the whole section is building toward, exactly-once via checkpoints (26), which needs (23)-(25)'s vocabulary to state precisely. Last, the storage engine that makes large stateful jobs survive in practice, the RocksDB state store (27), closing the section on the implementation that makes (25)-(26) scale.
5. **7.5 Spark 4.x platform changes (topics 28-29).** ANSI mode (28) first, because it changes the meaning of every example in 7.1-7.4 run on Spark 4.x and is best taught once the learner has seen enough plans and jobs to appreciate what "silently returns NULL" used to cost. Then VARIANT (29), a storage and type-system change orthogonal to execution, closing the section and the chapter's engine-internals material.
6. **7.6 Native vectorized execution for Spark — no reel.** Both entries are skipped. The chapter's Deep dive for topic 29 (the closest live topic, Spark's own type-system evolution) names §7.6 as a sourced, unbuilt pointer: Spark's generated-code execution model (7.1, topic 6) is itself being replaced for CPU-bound plans by vectorised native engines (Photon, Gluten, Comet) that this chapter does not build, consistent with how Chapter 5 named Count-Min Sketch as a pointer without a reel.
7. **7.7 Execution models beyond Spark (topic 30).** The chapter's one closing topic, placed last on purpose: it can only be taught by someone who has just spent 29 topics inside Spark's materialised-shuffle model, because its entire point is naming what that model chose not to be (a pipelined, in-memory MPP engine) and what a third model (Ray Data's operator-level streaming) looks like instead. It hands off to Chapter 8 exactly as Chapter 8 already assumes.

### One running example: the shop's clickstream and orders, at scale

Same fictional online shop as Chapters 1-6 (no real company, no real person), now at a size that needs Spark: a **clickstream** table (tens of millions of synthetic events, generated on the builder's machine, Zipf-skewed by `user_id` and `product_id` so skew topics have a real distribution to show) and the **orders**/**order_items** tables from Chapter 5, read here as Parquet/Delta files rather than live database tables. One join recurs across 7.2: clickstream events joined to a small `products` dimension (broadcast-sized) and to the large `orders` fact table (shuffle-sized), so the learner watches the same logical join choose a different physical strategy as the two input sizes change. Every number on screen comes from the topic's own `examples.py`, run against this builder's local Spark, and is disclosed as "measured on N cores, M GB driver/executor memory" wherever absolute wall-clock numbers appear, since a single-machine run cannot claim cluster-scale numbers.

### Shared notation and terms

- **The task hierarchy** (topic 1 introduces, reused everywhere): **application** → **job** (one per action) → **stage** (cut at shuffle boundaries) → **task** (one per partition). Every figure that shows "how big is this computation" names which of these four it is drawing.
- **Narrow vs wide dependency** (topic 2 introduces, reused through 7.2-7.3): a **narrow** dependency (each output partition depends on a known, small set of input partitions; pipelines inside a stage) vs a **wide** dependency (depends on many/all input partitions; forces a stage boundary and a shuffle).
- **Shuffle vocabulary** (topic 3 introduces, reused through the chapter): a **map task** (produces shuffle output), a **reduce task** (reads it), a **shuffle file** plus its **index file**, the **MapOutputTracker** (tells reducers where blocks live), **spill** (a sorted run written to disk under memory pressure, distinct from the spill topic's deeper treatment in 7.3).
- **The physical-plan vocabulary** (topic 5 introduces, reused through 7.2 and 7.5): **unresolved** → **analyzed** → **optimized logical** → **physical** plan, an **Exchange** node (the plan's name for a shuffle), a **broadcast** node, reading `EXPLAIN FORMATTED`.
- **Partitioning vocabulary** (topics 8-9 introduce, reused through 7.2): **input split** vs **shuffle partition**, a **hash partitioner**, a **range partitioner**, **partition pruning**, **exchange elimination** (skipping a shuffle because the existing partitioning already satisfies it).
- **Join-strategy names** (topics 11-12 introduce, used through 7.2-7.3): **broadcast hash join**, **shuffle(d) hash join**, **sort-merge join**, **broadcast nested-loop join**; **AQE** (topic 13) as the mechanism that can rewrite any of these at runtime.
- **The memory model's regions** (topic 17 introduces, reused through 7.3-7.4): **execution memory**, **storage memory**, the **unified memory manager**'s borrowing/eviction between them, **off-heap**, **memoryOverhead**.
- **The streaming vocabulary** (topics 23-26 introduce, reused through 7.4): **trigger**, **offset log**, **commit log**, **watermark**, **output mode** (append/update/complete), **checkpoint**.
- **Spoken numbers:** narration has no digits, symbols or code names (the automatic check of Chapters 1-6): "shuffle partitions", "autobroadcast join threshold", "adaptive query execution" are said as plain words; any number is spoken aloud. Config keys (`spark.sql.shuffle.partitions`, `spark.memory.fraction`) stay on screen and in the description, never in the narration.

### One visual language for the chapter's reels

Builds on `DESIGN.md` and Chapter 5's lane conventions, and adds what this chapter needs.

- **A DAG strip**: boxes for stages left to right, narrow dependencies drawn as a tight pipeline inside one box, a wide dependency drawn as a full-width crossing bar (the Exchange), introduced in topic 2 and reused in 1, 3, 5, 13 and 22 wherever a figure needs to show "how many stages, where does it shuffle."
- **A shuffle grid**: M map-task rows by R reduce-task columns, each cell a small square that fills in as data moves, introduced in topic 3 and reused in 4, 8-12 and 14 for every partitioning, join-strategy and skew figure — the chapter's one recurring mechanism diagram for the shuffle itself.
- **A memory bar**: one stacked horizontal bar (execution / storage / user / reserved / off-heap regions, proportional widths) introduced in topic 17 and reused in 18-21 and 27, with the region under pressure drawn in `C.bad` when it spills or evicts.
- **A task-duration histogram strip**: small bars per task, one tall outlier bar in `C.bad` for the straggler, introduced in topic 14 and reused in 21-22 as the chapter's evidence figure for "how do you know it's skew."
- **A log-and-trigger strip** (one horizontal strip of trigger ticks, an offset marker and a commit marker) is 7.4's recurring figure, analogous to Chapter 8's log strip, introduced in topic 23 and reused through 24-27.
- Colour: `C.bad` only for a spill, a straggler, a lost executor or an error Spark now raises under ANSI mode; `C.second` only for a before/after pair (ANSI off vs on in topic 28, HDFS-backed vs RocksDB state in topic 27).

### The chapter labs: who hosts what

| Lab part (syllabus words) | Host topic, Deep dive section |
|---|---|
| 7.1: "run one aggregation-plus-join query, predict the number of stages and shuffles from the code, then confirm with `EXPLAIN FORMATTED` and the Spark UI; rewrite a pickled Python UDF as a built-in expression and as an Arrow UDF and measure the three run times" | Topic 2 hosts the stage/shuffle prediction-then-confirmation half. Topic 7 hosts the three-way UDF rewrite and timing. |
| 7.2: "generate a Zipf-skewed fact table; reproduce a 20× straggler, then fix it three ways (AQE skew join, salting, broadcast) and compare wall time, shuffle bytes and spill; toggle DPP on a star query and measure files read" | Topic 14 hosts the skew reproduction and all three fixes compared. Topic 15 hosts the DPP toggle-and-measure half. |
| 7.3: "run a wide aggregation with too few partitions and too little memory; observe spill and GC, kill an executor mid-shuffle and watch stage resubmission; then repeat with an external or remote shuffle service and compare recovery time" | Topic 18 hosts the under-provisioned aggregation and the spill/GC observation. Topic 21 hosts the executor-kill-mid-shuffle and stage-resubmission half on local mode (the external/remote shuffle service comparison is sourced-only, disclosed, since it needs a real multi-node cluster — Push-based/remote shuffle services is itself a *(skipped)* syllabus entry). |
| 7.4: "build a Kafka → Spark windowed aggregation with a stream-stream join; inject late and out-of-order events, kill the driver mid-batch and restart from the checkpoint; prove no loss/duplication in an idempotent Delta/Iceberg sink; compare HDFS-backed vs RocksDB state at 10M keys" | Topic 24 hosts the late/out-of-order injection against a windowed aggregation (rate source standing in for Kafka, disclosed). Topic 26 hosts the driver-kill-mid-batch, checkpoint-restart and no-loss/no-duplication proof (sink is a local idempotent `MERGE`, Delta/Iceberg named and sourced if Chapter 6 is not yet live). Topic 27 hosts the HDFS-backed vs RocksDB state comparison, scaled to what the builder's machine can hold, disclosed. |
| 7.5: "port a 3.5 job to 4.x with ANSI on; catalogue every behaviour change it surfaces; rebuild a JSON-string pipeline on VARIANT with and without shredding and compare scan bytes and latency" | Topic 28 hosts the ANSI port and behaviour-change catalogue. Topic 29 hosts the VARIANT rebuild and scan-bytes/latency comparison. |
| 7.6: no reel (both entries skipped) — the Gluten/Comet TPC-H lab is named, sourced and unbuilt in topic 29's Deep dive "Where this goes next." | — |
| 7.7: "run the same image-embedding batch job on Spark (pandas UDF) and Ray Data with a GPU stage; measure GPU utilisation, throughput and memory" | Topic 30 hosts this as a CPU-only scaled-down comparison (no GPU on the builder's machine): a pandas-UDF batch transform on Spark vs a plain Python generator standing in for Ray Data's operator-level streaming, measuring throughput and memory only, with the GPU-utilisation claim sourced from Ray's own documentation and disclosed as such. |

---

## The topics

### 7.1 Spark execution model

**1. Driver, executors and the task hierarchy** *(refresher)*
- id `de.driver-executors-task-hierarchy`, folder `driver-executors-task-hierarchy`
- Scope: the application → job → stage → task hierarchy; the driver as single planner and single point of failure; executors as slot pools (cores × executors); Spark 4.x cluster managers (YARN, Kubernetes, standalone; Mesos removed). Leaves Catalyst's internals to topic 5 and the DAG scheduler's own cut rule to topic 2.
- Outcomes: name which of the four hierarchy levels a given Spark UI screen is showing; explain why losing the driver kills the whole application while losing one executor does not.
- Introduces: `spark.task-hierarchy`, `spark.driver-executor-model`. Uses: none (chapter's first topic).
- Bridge: opens the chapter — "Milestone 2 ended with data that sits in files and tables, durable and queryable. The moment that data is too big for one query to touch on one machine, someone has to decide how the work is cut up, and this chapter's one running system, Apache Spark, makes every one of those decisions something you can watch rather than take on faith."
- Handoff: "Four levels of hierarchy says how big a computation is. It says nothing yet about where the DAG scheduler decides to cut a job into stages in the first place — the next topic's own rule, and the one that turns 'job' into 'stage' for real."
- Hook/visual: the four-level hierarchy drawn as nested boxes that a single click of `.collect()` expands live, ending on "the driver is the only box that, if it disappears, nothing else in the picture survives."
- Sources: Spark Cluster Mode Overview (spark.apache.org/docs/latest/cluster-overview.html); Spark Configuration docs for `spark.default.parallelism` context.

**2. DAG scheduling and stage boundaries**
- id `de.dag-scheduling-stage-boundaries`, folder `dag-scheduling-stage-boundaries`
- Scope: narrow vs wide dependencies; the DAGScheduler cutting the lineage graph at every shuffle dependency; pipelining narrow operators inside a stage; ordering shuffle-map stages before the result stage; a stage boundary as a materialisation point, not a lineage break.
- Outcomes: classify a transformation as narrow or wide from its signature alone; predict a job's stage count from its code before running it.
- Introduces: `spark.narrow-wide-dependency`, `spark.stage-boundary`. Uses: `spark.task-hierarchy`.
- Bridge: "Topic 1 gave the hierarchy's names. This topic answers the question it left open: exactly which operators force the scheduler to cut a new stage, and why that cut is where real work — a shuffle — has to happen."
- Handoff: "A stage boundary is a promise that a shuffle happens there. The next topic opens that promise: what a shuffle actually writes to disk and sends over the network to make the next stage's input exist."
- Hook/visual: predict-the-stage-count on a real aggregation-plus-join job's code, before showing the DAG strip that confirms or corrects the guess (hosts half the 7.1 lab).
- Sources: Spark source, `DAGScheduler.scala` (GitHub, tag `v4.0.0`); Spark SQL "Performance Tuning" docs (shuffle behaviour section).

**3. Sort-based shuffle mechanics**
- id `de.sort-based-shuffle-mechanics`, folder `sort-based-shuffle-mechanics`
- Scope: map-side partitioning, sorting and spilling into one data file plus one index file per map task; the MapOutputTracker telling reducers where blocks live; reducers fetching over the network with bounded in-flight requests; why shuffle (disk + network + serialisation + O(M×R) small blocks) dominates most jobs' cost.
- Outcomes: draw the shuffle grid for a given M×R and explain which of its four costs (disk, network, serialisation, many-small-blocks) a specific symptom points to.
- Introduces: `spark.shuffle-mechanics`, `spark.map-output-tracker`. Uses: `spark.stage-boundary`.
- Bridge: "The previous topic named the shuffle as the thing that happens at a stage boundary. This topic opens what that actually is on disk and over the wire: one sorted file and one index per map task, fetched by every reducer that needs a piece of it."
- Handoff: "Knowing what a shuffle writes says nothing yet about how many tasks run it, or how evenly — the next topic's own concern, locality and parallelism."
- Hook/visual: the shuffle grid filling in cell by cell as a real job runs, counting real bytes written and fetched from the Spark UI.
- Sources: Spark source, `ShuffleMapTask.scala` / `BlockStoreShuffleReader.scala` (GitHub, tag `v4.0.0`); Spark "Shuffle behavior" configuration docs.

**4. Task scheduling, locality and parallelism**
- id `de.task-scheduling-locality-parallelism`, folder `task-scheduling-locality-parallelism`
- Scope: locality levels (PROCESS/NODE/RACK/ANY) and delay scheduling; `spark.default.parallelism` vs `spark.sql.shuffle.partitions`; dynamic allocation and the shuffle-tracking requirement; FIFO vs FAIR pools for concurrent jobs in one application.
- Outcomes: explain why a task waits rather than runs immediately at a worse locality level; distinguish the two parallelism settings and say which one a given stage actually obeys.
- Introduces: `spark.locality-levels`, `spark.shuffle-partitions-config`. Uses: `spark.shuffle-mechanics`.
- Bridge: "The shuffle produces blocks sitting on specific executors. This topic is about the scheduler's own choice of which executor runs the next task, given where its input actually lives."
- Handoff: "Locality and parallelism are about placing and sizing the tasks the planner already decided to run. The next two topics go one level up, into the planner itself: how Catalyst decided what to run in the first place."
- Hook/visual: a delay-scheduling timeline showing a task waiting a few milliseconds for a better locality level instead of starting immediately at a worse one, with real wait times from the Spark UI.
- Sources: Spark source, `TaskSchedulerImpl.scala` (GitHub, tag `v4.0.0`); Spark "Job Scheduling" docs (FAIR/FIFO pools).

**5. Catalyst: from unresolved to physical plan**
- id `de.catalyst-unresolved-physical-plan`, folder `catalyst-unresolved-physical-plan`
- Scope: parse → analysis (catalog resolution) → rule-based logical optimisation (predicate/projection pushdown, constant folding, subquery rewrites) → physical planning with join/aggregate strategy selection → cost-based reordering only with statistics; reading `EXPLAIN FORMATTED` and `Exchange` nodes.
- Outcomes: read an `EXPLAIN FORMATTED` plan tree and name which stage of Catalyst produced each node; find the `Exchange` nodes and say which operator forced each.
- Introduces: `spark.catalyst-pipeline`, `spark.explain-formatted`. Uses: `sql.query-optimizer-plans` (§2.3), `spark.stage-boundary`.
- Bridge: "Every topic so far watched the plan Catalyst already produced run. This topic opens Catalyst itself, the planner Chapter 2's query-optimiser topic already introduced in the single-node case, now choosing join and aggregate strategies across a cluster."
- Handoff: "Catalyst decides the physical plan's shape. Tungsten, next, decides how fast the chosen shape actually runs — a different layer, planning versus execution."
- Hook/visual: the same query's unresolved, analyzed, optimized and physical plan trees shown side by side, with the Exchange nodes highlighted and counted against topic 2's stage-count prediction.
- Sources: Spark SQL "Catalyst Optimizer" internals (official docs / Databricks engineering blog, both fetched); Spark source, `QueryExecution.scala` (GitHub, tag `v4.0.0`).

**6. Tungsten and whole-stage code generation**
- id `de.tungsten-whole-stage-codegen`, folder `tungsten-whole-stage-codegen`
- Scope: UnsafeRow binary layout outside JVM object overhead; fusing a pipeline of operators into one generated Java method compiled by Janino (no virtual `next()` per row, values in registers); the vectorised Parquet/ORC reader as the columnar exception; when codegen silently falls back (huge methods, too many fields) and how to see it.
- Outcomes: read the generated code for a stage and point to the fused loop; recognise and explain a codegen fallback from the plan's `*(codegen id)` markers (or their absence).
- Introduces: `spark.tungsten-unsaferow`, `spark.whole-stage-codegen`. Uses: `spark.catalyst-pipeline`.
- Bridge: "Catalyst chose the physical plan's operators. This topic is how Spark runs them fast: not one virtual-call interpreter loop per row, but one generated method per stage, with rows stored as raw bytes instead of JVM objects."
- Handoff: "Codegen is the fast, common path. The very next topic is the one execution path it cannot touch at all — a pickled Python UDF — and exactly why that costs so much more."
- Hook/visual: `df.queryExecution.debug.codegen()` output for a real stage, the generated method's fused loop body highlighted against the plan nodes it replaces.
- Sources: Spark source, `WholeStageCodegenExec.scala` (GitHub, tag `v4.0.0`); Databricks engineering blog, "Apache Spark as a Compiler" (fetched for the Tungsten/codegen history).

**7. PySpark execution path and Python UDF cost**
- id `de.pyspark-execution-python-udf-cost`, folder `pyspark-execution-python-udf-cost`
- Scope: row-at-a-time pickled Python UDFs crossing the JVM↔Python worker boundary, opaque to Catalyst (cross-ref §2.1); Arrow-based fixes: pandas UDFs, `mapInArrow`, Arrow-optimised Python UDFs (default-on since 4.2) and `@arrow_udf` (4.1); rule of thumb: built-in SQL expressions first, Arrow UDFs second, pickled UDFs never on hot paths.
- Outcomes: measure and explain the three-way timing gap between a built-in expression, an Arrow UDF and a pickled Python UDF on the same computation; decide, for a given job, which of the three to reach for.
- Introduces: `spark.python-udf-boundary`, `spark.arrow-udf`. Uses: `spark.whole-stage-codegen`.
- Bridge: "Codegen fuses Spark's own operators into one native loop. This topic is the one case that loop cannot include: a user's own Python function, which has to leave the JVM, cross a process boundary, and come back."
- Handoff: "Everything so far assumed one job running once. The next section turns to the same shuffle and the same operators under a harder constraint: a partition that isn't evenly sized, which is where most real jobs actually get slow."
- Hook/visual: a three-bar timing chart (built-in expression, Arrow UDF, pickled UDF) for the identical computation, the pickled bar an order of magnitude taller, hosts the UDF half of the 7.1 lab.
- Sources: Spark source, `BatchEvalPython.scala` / Arrow UDF implementation (GitHub, tag `v4.0.0`); Spark SQL "Pandas Function APIs" and "Python User-defined Table Functions" docs; Spark 4.1/4.2 release notes for Arrow-UDF default-on timing.

### 7.2 Partitioning, joins and skew

**8. Partition sizing, repartition and coalesce**
- id `de.partition-sizing-repartition-coalesce`, folder `partition-sizing-repartition-coalesce`
- Scope: input splits (`spark.sql.files.maxPartitionBytes`, open-cost padding), shuffle partition counts, per-task overhead vs spill risk (target ~100-200 MB/task); `repartition` (full shuffle, even sizes) vs `coalesce` (narrow merge, no shuffle) and the `coalesce(1)`-collapses-upstream-parallelism trap.
- Outcomes: size a shuffle-partition count for a given data volume and target task size; predict whether a `repartition`/`coalesce` call introduces a shuffle before running it.
- Introduces: `spark.partition-sizing`, `spark.repartition-vs-coalesce`. Uses: `spark.shuffle-partitions-config`, `spark.shuffle-mechanics`.
- Bridge: "Section 7.1 ended on the one path that escapes Spark's own execution machinery. This section returns to that machinery's biggest single cost, the shuffle, starting at its lowest lever: how many pieces the work is cut into in the first place."
- Handoff: "Sizing says how many partitions and how big. It says nothing about which partitioner decided which row lands in which one — the next topic's own question."
- Hook/visual: the same aggregation run at three shuffle-partition counts (too few, about right, too many), task-duration histograms for all three side by side.
- Sources: Spark SQL "Performance Tuning" docs (partition sizing guidance); Spark source, `FilePartition.scala` / `CoalescedRDD.scala` (GitHub, tag `v4.0.0`).

**9. Hash and range partitioning, partition pruning**
- id `de.hash-range-partitioning-pruning`, folder `hash-range-partitioning-pruning`
- Scope: hash partitioner vs sampled range partitioner (global sorts); exchange elimination when existing output partitioning already satisfies a required distribution; static partition pruning on Hive-style directory layouts and DSv2 partition-stats filtering.
- Outcomes: say which partitioner a given shuffle uses from its purpose (join vs global sort); recognise, from a plan, when Spark skipped an Exchange it would otherwise have needed.
- Introduces: `spark.hash-range-partitioner`, `spark.partition-pruning`. Uses: `spark.partition-sizing`, `spark.catalyst-pipeline`.
- Bridge: "Sizing decided how many pieces. This topic decides which row goes in which piece, and shows the one case — exchange elimination — where Spark notices it doesn't need to re-decide at all."
- Handoff: "Pruning skips reading partitions that can't match. Bucketing, next, goes further: pre-arranging the partitions at write time so a later join skips the shuffle entirely, not just the read."
- Hook/visual: a star-schema query's plan with and without a matching Hive partition layout, files-read counted both ways.
- Sources: Spark source, `HashPartitioning.scala` / `RangePartitioning.scala` (GitHub, tag `v4.0.0`); Spark SQL "Partition Discovery" docs; DSv2 `SupportsPushDownFilters`/partition-stats interfaces (Spark source).

**10. Bucketing and storage-partitioned joins**
- id `de.bucketing-storage-partitioned-joins`, folder `bucketing-storage-partitioned-joins`
- Scope: pre-shuffling tables on the join/aggregation key at write time so later joins skip the exchange; bucket-count-must-match and stale-bucketing pitfalls; storage-partitioned join (SPJ) over DSv2 sources (e.g. Iceberg) reusing the table's own partitioning instead of Hive bucketing.
- Outcomes: explain why two tables bucketed with mismatched bucket counts still shuffle; distinguish classic Hive bucketing from SPJ's table-format-driven equivalent.
- Introduces: `spark.bucketing`, `spark.storage-partitioned-join`. Uses: `spark.hash-range-partitioner`.
- Bridge: "Partition pruning skips reading data that can't match. This topic is the write-time version of the same idea applied to joins: if both tables are already partitioned the same way, the join's own shuffle never has to happen."
- Handoff: "Bucketing avoids a shuffle by agreement at write time. The next three topics are about the shuffle when it does happen — the actual join strategies and how Spark picks one."
- Hook/visual: the same join's plan with and without matching bucket counts, the Exchange node appearing or vanishing.
- Sources: Spark SQL "Bucketing" docs; Spark source, `BatchScanExec` / SPJ `KeyGroupedPartitioning` (GitHub, tag `v4.0.0`, SPIP for storage-partitioned joins).

**11. Broadcast hash join**
- id `de.broadcast-hash-join`, folder `broadcast-hash-join`
- Scope: the driver collecting the small side and shipping it to every executor as a torrent broadcast; `autoBroadcastJoinThreshold`, hints and the 8 GB table limit; why a broadcast becomes dangerous (stale statistics, driver OOM, filters that don't shrink the side); broadcast nested-loop join as the non-equi fallback.
- Outcomes: predict whether a given join will broadcast from table sizes and the threshold setting; explain a driver OOM caused by a broadcast whose statistics were stale.
- Introduces: `spark.broadcast-hash-join`, `spark.broadcast-nested-loop`. Uses: `spark.catalyst-pipeline`, `spark.shuffle-mechanics`.
- Bridge: "Bucketing avoids a shuffle by agreement. Broadcasting avoids it by a different trick entirely: making one side small enough to copy everywhere, so there is nothing left to shuffle."
- Handoff: "Broadcasting is the strategy for when one side is small. The next topic is what happens when neither side is — the two shuffle join strategies, chosen against each other."
- Hook/visual: the dimension-join's plan showing the `BroadcastExchange` node, then the same query with stale statistics driving the driver's memory toward OOM.
- Sources: Spark SQL "Join Strategy Hints" docs; Spark source, `BroadcastHashJoinExec.scala` / `BroadcastExchangeExec.scala` (GitHub, tag `v4.0.0`).

**12. Shuffle joins: sort-merge vs shuffled hash**
- id `de.shuffle-joins-sort-merge-hash`, folder `shuffle-joins-sort-merge-hash`
- Scope: sort-merge join as the default for large-large equi-joins (sort both sides, stream merge, spill-friendly) vs shuffled hash join (build a per-partition hash table, no sort, OOM-prone if the build side is skewed); how the planner chooses and when to override with hints.
- Outcomes: explain why sort-merge degrades gracefully under memory pressure while shuffled hash does not; read a plan to tell which of the two strategies was chosen and why.
- Introduces: `spark.sort-merge-join`, `spark.shuffled-hash-join`. Uses: `spark.broadcast-hash-join`, `spark.shuffle-mechanics`.
- Bridge: "Broadcasting handled the case where one side fits everywhere. This topic is the case where neither side does: both inputs have to be shuffled, and Spark has two different ways to then match them up."
- Handoff: "These two strategies are what AQE, next, is allowed to rewrite at runtime once real shuffle statistics exist — the planner's static choice meeting the evidence a static plan can't have."
- Hook/visual: the same large-large join forced into each strategy with a hint, spill metrics compared when the build side is made artificially skewed.
- Sources: Spark source, `SortMergeJoinExec.scala` / `ShuffledHashJoinExec.scala` (GitHub, tag `v4.0.0`); Spark SQL "Performance Tuning" join-strategy section.

**13. Adaptive Query Execution (AQE)**
- id `de.adaptive-query-execution-aqe`, folder `adaptive-query-execution-aqe`
- Scope: re-optimising at query-stage boundaries using real shuffle statistics: coalescing small post-shuffle partitions, demoting sort-merge to broadcast or shuffled hash join, splitting skewed partitions; default-on since 3.2; why AQE cannot fix what happens before the first exchange.
- Outcomes: read a plan's `AdaptiveSparkPlan (isFinalPlan=true)` section and point to a concrete decision AQE made differently from the initial plan; explain, with an example, a cost AQE cannot fix.
- Introduces: `spark.aqe`. Uses: `spark.sort-merge-join`, `spark.shuffled-hash-join`, `spark.shuffle-partitions-config`.
- Bridge: "The previous two topics were the planner's static choices. This topic is Spark revisiting those choices mid-job, once the first shuffle's real statistics exist to revisit them with."
- Handoff: "AQE fixes some skew after the fact. The next topic is skew itself — how to recognise it as the cause in the first place, and the remedies in the order they're worth trying, AQE being only the first."
- Hook/visual: before/after plan diff for one query, AQE's runtime changes (join demotion, partition coalescing) highlighted against the static plan from topic 5.
- Sources: Spark SQL "Adaptive Query Execution" docs; Databricks engineering blog "Adaptive Query Execution: Speeding Up Spark SQL at Runtime" (fetched); Spark source, `AdaptiveSparkPlanExec.scala` (GitHub, tag `v4.0.0`).

**14. Data skew: diagnosis and remedies**
- id `de.data-skew-diagnosis-remedies`, folder `data-skew-diagnosis-remedies`
- Scope: evidence (max vs median task duration and shuffle-read bytes, one straggler per stage); remedies in order: AQE skew-join splitting, broadcasting, isolating hot keys, salting with a replicated small side, two-phase (partial then final) aggregation; where AQE's skew handling does not apply (aggregations, the preserved side of outer joins, window functions).
- Outcomes: diagnose skew from a task-duration histogram alone; choose and apply the right remedy for a skewed join versus a skewed aggregation.
- Introduces: `spark.skew-diagnosis`, `spark.salting-remedy`. Uses: `spark.aqe`, `spark.broadcast-hash-join`.
- Bridge: "AQE fixes skew for the one case (joins) it was built for. This topic generalises: how you actually know it's skew rather than something else, and the full remedy ladder, including the cases — aggregations, outer joins, windows — AQE cannot touch at all."
- Handoff: "Skew is a shuffle problem solved by rearranging work across the network. Dynamic partition pruning, next, is the opposite kind of lever: removing work before the shuffle by never reading it."
- Hook/visual: the chapter's Zipf-skewed fact table producing a real 20× straggler, then fixed three ways (AQE, salting, broadcast) with wall time, shuffle bytes and spill compared — the full 7.2 skew lab.
- Sources: Databricks engineering blog on skew and AQE skew-join handling (fetched); Spark source, `OptimizeSkewedJoin.scala` (GitHub, tag `v4.0.0`); Spark SQL docs, AQE skew-join config keys.

**15. Dynamic partition pruning (DPP)**
- id `de.dynamic-partition-pruning`, folder `dynamic-partition-pruning`
- Scope: using the dimension-side filter result at runtime as a subquery/broadcast filter to prune fact-table partitions in a star join; preconditions (partitioned fact table, selective dimension filter) and how to see it in the plan.
- Outcomes: predict whether a given star-schema query qualifies for DPP from its filter and partitioning; find DPP's subquery-duplicate filter in `EXPLAIN FORMATTED`.
- Introduces: `spark.dynamic-partition-pruning`. Uses: `spark.partition-pruning`, `spark.broadcast-hash-join`.
- Bridge: "Skew remedies rearrange a shuffle that still has to happen. DPP removes files from the fact-table scan before any shuffle starts, using the small side's own filter as the pruning signal."
- Handoff: "Everything in this section changed what gets shuffled or scanned. The last topic of the section changes a different thing entirely: what Spark actually writes out when the job is done."
- Hook/visual: the star query's files-read count with DPP on vs forced off, plan diff showing the duplicated dimension subquery that makes pruning possible.
- Sources: Spark SQL "Dynamic Partition Pruning" docs/SPIP; Spark source, `PlanDynamicPruningFilters.scala` (GitHub, tag `v4.0.0`).

**16. Controlling Spark output file layout**
- id `de.spark-output-file-layout`, folder `spark-output-file-layout`
- Scope: output file count = writing tasks × partitions touched; `maxRecordsPerFile`, `REBALANCE` hints with AQE, and table-format write-distribution modes as the Spark-side answer to the small-file problem (general treatment in §6.1/§6.3).
- Outcomes: predict a write's output file count from its task count and partition columns; choose between `maxRecordsPerFile`, a `REBALANCE` hint and a table-format write-distribution mode for a given small-files symptom.
- Introduces: `spark.output-file-layout`. Uses: `spark.partition-sizing`, `spark.aqe`.
- Bridge: "Every topic so far in this section changed what gets read or shuffled on the way in. This one closes the section on the opposite end: what Spark actually writes, and why the same small-files problem that haunts a lakehouse read (§6.1/§6.3) usually starts right here, at write time."
- Handoff: "Section 7.2 is done: the shuffle, the joins and the files are all explained. The next section turns from 'how much work and where' to 'what happens when the machine running it runs out of room' — Spark's own memory model."
- Hook/visual: the same write at three task counts producing visibly different numbers of output files, then the same write with a `REBALANCE` hint collapsing them.
- Sources: Spark SQL docs, `maxRecordsPerFile`/`REBALANCE` hint reference; Spark source, `RebalancePartitions.scala` (GitHub, tag `v4.0.0`).

### 7.3 Spark memory and failure behavior

**17. Executor memory model**
- id `de.executor-memory-model`, folder `executor-memory-model`
- Scope: unified memory manager — execution vs storage regions with borrowing and eviction (`spark.memory.fraction`, `storageFraction`), user memory, reserved memory, off-heap, `memoryOverhead` for netty buffers, Python workers and native libraries; JVM `OutOfMemoryError` vs container OOM-kill (YARN/Kubernetes) and why they need different fixes.
- Outcomes: draw an executor's memory bar for a given config and explain which region borrows from which under pressure; distinguish a JVM OOM from a container OOM-kill from their symptoms alone.
- Introduces: `spark.unified-memory-manager`, `spark.oom-vs-oomkill`. Uses: `spark.task-hierarchy`.
- Bridge: "Section 7.2 was entirely about the shuffle and the files around it. This section turns to the resource every one of those operations actually spends: the executor's own memory, and the single model — storage and execution borrowing from each other — that governs all of it."
- Handoff: "The model says where memory lives. The next topic is the first thing that happens when it runs out: spill, the direct and usually first symptom of memory pressure."
- Hook/visual: the memory bar animating live as a real job runs, execution region growing and storage region shrinking under borrowing.
- Sources: Spark "Tuning Spark" docs (memory management section); Spark source, `UnifiedMemoryManager.scala` (GitHub, tag `v4.0.0`).

**18. Spill and shuffle memory pressure**
- id `de.spill-shuffle-memory-pressure`, folder `spill-shuffle-memory-pressure`
- Scope: sorts and hash aggregations exceeding execution memory spill sorted runs to disk and merge (external merge sort, §1.3; → DSA Ch.6); reading spill (memory) vs spill (disk) metrics; why adding executor memory often fails to fix a skewed or over-wide task.
- Outcomes: read the Spark UI's spill (memory)/spill (disk) metrics and say whether a task actually spilled; explain why a skewed task's spill doesn't shrink when total executor memory grows.
- Introduces: `spark.spill-mechanics`. Uses: `spark.unified-memory-manager`, `dsa.external-merge-sort` (if live; else `declared`), `spark.skew-diagnosis`.
- Bridge: "The memory model names the regions. Spill is what execution memory does the instant it's exceeded: the same external-merge-sort idea Algorithms Chapter 6 already taught, now triggered by a Spark task instead of a single process."
- Handoff: "Spill is memory pressure the engine handles automatically, if slowly. The next topic is memory pressure deliberately chosen on purpose — caching — and when that choice helps or hurts."
- Hook/visual: the under-provisioned wide aggregation from the 7.3 lab, spill (memory) and spill (disk) metrics climbing in the UI as partition count and memory are both set too low.
- Sources: Spark "Tuning Spark" docs (spill-related config); Spark source, `UnsafeExternalSorter.scala` (GitHub, tag `v4.0.0`).

**19. Caching, persistence and checkpointing**
- id `de.caching-persistence-checkpointing`, folder `caching-persistence-checkpointing`
- Scope: storage levels (memory/disk, serialised, replicated), LRU eviction and recomputation; `cache` keeps lineage while `checkpoint` (reliable) and `localCheckpoint` truncate it; when caching hurts (memory stolen from execution, caching a non-deterministic plan).
- Outcomes: choose a storage level for a given reuse pattern and memory budget; explain why caching a plan with a non-deterministic UDF can silently produce different cached rows.
- Introduces: `spark.cache-vs-checkpoint`, `spark.storage-levels`. Uses: `spark.unified-memory-manager`.
- Bridge: "Spill was memory pressure forced on the engine by too little room. Caching is the opposite: memory pressure the developer chooses on purpose, by asking Spark to keep something around — and it can steal exactly the execution memory the previous topic described."
- Handoff: "Caching and checkpointing are both about surviving across jobs. The next topic is about surviving within one: the JVM's own garbage collector, and the pauses it causes under the same memory pressure."
- Hook/visual: an iterative job's wall time with and without caching a reused DataFrame, then the same job with the cache silently stealing enough execution memory to cause a spill.
- Sources: Spark "RDD Programming Guide" (persistence/storage levels section); Spark source, `StorageLevel.scala` / `ReliableCheckpointRDD.scala` (GitHub, tag `v4.0.0`).

**20. JVM garbage-collection symptoms**
- id `de.jvm-garbage-collection-symptoms`, folder `jvm-garbage-collection-symptoms`
- Scope: GC time in the executor tab, long G1 pauses causing heartbeat timeouts and lost executors; object-heavy RDD/UDF code vs Tungsten binary rows; Spark 4.x on Java 17/21 and the GC choices that matter.
- Outcomes: read the executor tab's GC-time column and judge whether GC is the bottleneck; explain why Tungsten's binary row format reduces GC pressure compared with object-heavy RDD code.
- Introduces: `spark.gc-symptoms`. Uses: `spark.unified-memory-manager`, `spark.tungsten-unsaferow`.
- Bridge: "Caching and spill are about Spark's own accounting of memory. This topic is what the JVM underneath it does when that memory fills with live objects: garbage collection, and the pauses it causes, which Tungsten's binary rows exist partly to avoid."
- Handoff: "GC pauses can make an executor miss its heartbeat and get declared dead. The next topic is exactly that: what Spark does when a task or an executor actually fails, GC-induced or otherwise."
- Hook/visual: the same aggregation run as object-heavy RDD code vs a DataFrame, GC time in the executor tab compared side by side.
- Sources: Spark "Tuning Spark" docs (garbage collection tuning section); Spark 4.0 release notes (Java 17/21 baseline).

**21. Task retry, fetch failure and speculation**
- id `de.task-retry-fetch-failure-speculation`, folder `task-retry-fetch-failure-speculation`
- Scope: task retry up to `spark.task.maxFailures`; fetch failures that resubmit the parent shuffle-map stage; executor loss taking shuffle files with it (external shuffle service, graceful decommissioning with block migration on Kubernetes); speculative execution and its hazard with non-idempotent sinks.
- Outcomes: trace, from an event log, why one executor's death resubmitted an entire upstream stage rather than one task; explain why speculative execution is unsafe with a non-idempotent sink.
- Introduces: `spark.task-retry-fetch-failure`, `spark.speculative-execution`. Uses: `spark.shuffle-mechanics`, `spark.task-hierarchy`.
- Bridge: "GC can kill an executor. This topic is what Spark does about any executor or task death, GC-caused or not: retrying the task, and, when the death took shuffle files with it, resubmitting the whole stage that produced them."
- Handoff: "Section 7.3's last topic ties every symptom in this section together: the Spark UI itself, the one instrument that actually shows spill, GC, retries and skew as evidence rather than theory."
- Hook/visual: killing a real local executor mid-shuffle and watching the parent stage resubmit in the Spark UI, hosting the executor-kill half of the 7.3 lab.
- Sources: Spark "Tuning Spark" docs (speculation config); Spark source, `TaskSetManager.scala` (fetch-failure handling, GitHub, tag `v4.0.0`); Spark on Kubernetes docs (graceful executor decommissioning).

**22. Diagnosing jobs from the Spark UI**
- id `de.diagnosing-jobs-spark-ui`, folder `diagnosing-jobs-spark-ui`
- Scope: reading the SQL tab plan with per-operator metrics, stage task-metric distributions (duration, GC, spill, shuffle-read blocked time), executor tab and event logs in the History Server; turning symptoms into a hypothesis (skew vs spill vs GC vs small files vs driver bottleneck).
- Outcomes: given only a Spark UI screenshot (no code), name the single most likely cause among skew, spill, GC, small files and driver bottleneck, and the one more metric that would confirm it.
- Introduces: `spark.ui-diagnosis-method`. Uses: `spark.skew-diagnosis`, `spark.spill-mechanics`, `spark.gc-symptoms`, `spark.task-retry-fetch-failure`.
- Bridge: "Every failure mode in this section — spill, caching cost, GC, retries — leaves a trace in exactly one place. This closing topic is that place, the Spark UI, taught as a fixed triage order rather than five separate tools."
- Handoff: "Section 7.3 closes the chapter's batch-execution half: how a job runs, shuffles, spends memory and fails. The next section is the same engine asked to do something structurally different: compute incrementally, forever, over data that never finishes arriving."
- Hook/visual: five deliberately broken jobs (one per failure mode), the UI screenshot for each shown cold, the triage method narrowing to the right cause each time.
- Sources: Spark "Web UI" docs (SQL/Executors/Stages tabs); Spark "Monitoring and Instrumentation" docs (History Server, event logs).

### 7.4 Structured Streaming

**23. Micro-batch incremental execution**
- id `de.micro-batch-incremental-execution`, folder `micro-batch-incremental-execution`
- Scope: the engine plans one incremental batch per trigger against new source offsets; offset log (write-ahead) and commit log in the checkpoint; trigger types (`processingTime`, `availableNow`; `once` deprecated); why micro-batch latency floors sit around hundreds of milliseconds.
- Outcomes: explain, for a running query, what exactly happens at one trigger boundary (offsets read, incremental plan run, logs written); say why micro-batch cannot reach single-digit-millisecond latency.
- Introduces: `spark.micro-batch-execution`, `spark.offset-commit-log`. Uses: `spark.catalyst-pipeline`, `spark.task-hierarchy`.
- Bridge: "Every topic so far ran one plan once against data that already existed. This topic is the same Catalyst-and-Tungsten machinery asked to run a small plan over and over, once per trigger, against data still arriving — Structured Streaming's one new idea."
- Handoff: "Micro-batch execution says when a batch runs. It says nothing yet about how late an event is allowed to arrive before the engine gives up waiting for it — the next topic's own bound, the watermark."
- Hook/visual: a running query's offset log and commit log inspected directly from its checkpoint directory, one trigger's incremental plan matched against the batch job shapes of 7.1-7.3.
- Sources: Spark "Structured Streaming Programming Guide" (basic concepts, triggers); Spark source, `MicroBatchExecution.scala` (GitHub, tag `v4.0.0`).

**24. Event time, watermarks and late data**
- id `de.event-time-watermarks-late-data`, folder `event-time-watermarks-late-data`
- Scope: `withWatermark` as max-observed-event-time minus delay; global watermark across multiple inputs (min by default, configurable max); records behind the watermark dropped; how the watermark bounds state and when each output mode emits (cross-ref §9.2 for the general theory).
- Outcomes: compute a watermark's current value by hand from a sequence of event timestamps and a delay threshold; predict whether a specific late event is dropped.
- Introduces: `spark.watermark-mechanics`. Uses: `spark.micro-batch-execution`.
- Bridge: "Micro-batch execution says a plan reruns on a schedule. This topic is the mechanism that keeps that plan's state from growing forever: a bound on how late an event may arrive before the engine stops waiting for it."
- Handoff: "A watermark bounds state. The next topic is what actually accumulates inside that bound — the stateful operators and the output modes that decide what gets emitted and when."
- Hook/visual: injecting late and out-of-order events into a windowed aggregation, the watermark line advancing on a log-and-trigger strip, one event visibly dropped once it falls behind — hosts half the 7.4 lab.
- Sources: Spark "Structured Streaming Programming Guide" (event time and late data, watermarking section); Spark source, `EventTimeWatermarkExec.scala` (GitHub, tag `v4.0.0`).

**25. Stateful operators and output modes**
- id `de.stateful-operators-output-modes`, folder `stateful-operators-output-modes`
- Scope: streaming aggregation, stream-stream joins (watermark plus time-range condition required to evict state), `dropDuplicatesWithinWatermark`, chained stateful operators; append vs update vs complete semantics and which sinks accept which.
- Outcomes: choose the correct output mode for a given stateful query and explain why an unsupported combination (e.g. complete mode on an unbounded stream-stream join) is rejected.
- Introduces: `spark.stateful-operators`, `spark.output-modes`. Uses: `spark.watermark-mechanics`.
- Bridge: "The watermark bounds how long state waits. This topic is what that state actually is — an aggregation's running totals, a join's buffered rows — and the three ways Spark is willing to emit it."
- Handoff: "Operators and output modes describe what the query computes. The next topic is the guarantee about what happens if the query, or the whole driver, dies partway through computing it."
- Hook/visual: the chapter's stream-stream join (clickstream to orders) built live, its append/update/complete output compared on the same window.
- Sources: Spark "Structured Streaming Programming Guide" (stream-stream joins, output modes); Spark source, `StreamingSymmetricHashJoinExec.scala` (GitHub, tag `v4.0.0`).

**26. Checkpoints and exactly-once boundaries**
- id `de.checkpoints-exactly-once-boundaries`, folder `checkpoints-exactly-once-boundaries`
- Scope: offsets + state + commit log make the engine exactly-once only together with replayable sources and idempotent or transactional sinks; `foreachBatch` with `batchId` for idempotent writes; which query changes break checkpoint compatibility and the 4.2 named sources/sinks that relax it.
- Outcomes: state precisely what Spark alone guarantees versus what the source and sink must additionally provide for true exactly-once; design an idempotent `foreachBatch` write keyed on `batchId`.
- Introduces: `spark.exactly-once-boundary`, `spark.foreachbatch-idempotent`. Uses: `spark.offset-commit-log`, `spark.stateful-operators`.
- Bridge: "Stateful operators compute the right answer once. This topic is what survives a crash in the middle of computing it: the checkpoint's offsets, state and commit log, and exactly how far that guarantee reaches before it needs help from the source and the sink."
- Handoff: "Exactly-once is a guarantee about correctness after failure. The next topic is about the one resource that guarantee leans on hardest at scale: where the state itself actually lives, and what happens once there's too much of it for memory."
- Hook/visual: killing the driver mid-batch and restarting from checkpoint, proving no row lost or duplicated in an idempotent sink by row-count and checksum — the proof half of the 7.4 lab.
- Sources: Spark "Structured Streaming Programming Guide" (fault tolerance semantics, `foreachBatch`); Spark 4.2 release notes (named sources/sinks checkpoint compatibility).

**27. RocksDB state store and state checkpointing**
- id `de.rocksdb-state-store-checkpointing`, folder `rocksdb-state-store-checkpointing`
- Scope: HDFS-backed in-heap provider (still the OSS default) vs RocksDB provider (native memory + local disk; recommended for millions of keys); changelog checkpointing, checkpoint structure v2, bounded memory, state rebalancing; the GC/OOM failure that forces the switch.
- Outcomes: predict, from a key-count estimate, whether the HDFS-backed or RocksDB provider is appropriate; explain how changelog checkpointing avoids re-uploading the full state on every checkpoint.
- Introduces: `spark.state-store-providers`. Uses: `spark.stateful-operators`, `spark.gc-symptoms`.
- Bridge: "Exactly-once leans on the state store surviving a restart. This topic opens that store itself: the default in-heap provider that this chapter's examples can use directly, and the RocksDB provider real production jobs switch to once state outgrows the JVM heap — the same GC pressure topic 20 already explained."
- Handoff: "Structured Streaming is done: the engine, the correctness boundary and the state store that scales it. The next section turns from the engine's execution model to the platform itself — what changed under Spark's feet in its 4.x releases."
- Hook/visual: the chapter's windowed-join query holding a growing key set, HDFS-backed provider's heap usage climbing toward GC trouble, RocksDB provider's native-memory usage staying flat for the same key count — the scale comparison half of the 7.4 lab, sized to what the builder's machine holds.
- Sources: Spark "Structured Streaming Programming Guide" (state store, RocksDB state store configuration); Databricks engineering blog on RocksDB state store at scale (fetched).

### 7.5 Spark 4.x platform changes

**28. ANSI mode and the 3.x → 4.x migration**
- id `de.ansi-mode-3x-4x-migration`, folder `ansi-mode-3x-4x-migration`
- Scope: ANSI SQL on by default in 4.0 — overflow, invalid casts and division by zero now raise errors instead of returning NULL; `try_*` functions and store-assignment rules; Java 17/Scala 2.13 baseline, removed Mesos; a migration method (run suites in both modes, diff outputs, audit implicit casts).
- Outcomes: predict which of a given set of expressions changes behaviour under ANSI mode; rewrite a NULL-swallowing expression using a `try_*` function where the error path is genuinely acceptable.
- Introduces: `spark.ansi-mode`, `spark.migration-method`. Uses: `spark.catalyst-pipeline`.
- Bridge: "Every example run so far in this chapter ran on Spark 4.x, where ANSI mode was already on. This topic is the thing that changed to make that true, and what silently broke for anyone porting a 3.5 job forward."
- Handoff: "ANSI mode changed the meaning of expressions Spark already had. The next topic is a genuinely new capability: a type for semi-structured data that didn't exist before 4.x at all."
- Hook/visual: the same arithmetic expression (an overflow, a bad cast, a division by zero) run under Spark 3.5 semantics (ANSI off) and 4.0 semantics (ANSI on), one silently returning NULL and one raising — the 7.5 lab's migration half.
- Sources: Spark 4.0 release notes / "ANSI Compliance" docs; Spark SQL migration guide (3.5 to 4.0 section).

**29. VARIANT type for semi-structured data**
- id `de.variant-type-semi-structured`, folder `variant-type-semi-structured`
- Scope: binary encoding (field-name dictionary + self-describing value) vs JSON strings vs inferred structs; `parse_json`, `variant_get`, path extraction; shredding frequently accessed fields into typed Parquet columns (GA in 4.1: faster reads, slower writes); interop with Parquet/Iceberg v3/Delta variant (cross-ref §6.2/§6.3).
- Outcomes: choose between a JSON string column, an inferred struct and VARIANT for a given semi-structured workload; explain the read/write trade-off shredding introduces.
- Introduces: `spark.variant-type`. Uses: `spark.ansi-mode` (version-awareness), `parquet.columnar-storage` (if live; else `declared`).
- Bridge: "ANSI mode changed how existing types behave. This topic closes the section, and the chapter's engine-internals material, with a type that didn't exist before 4.x: VARIANT, built to stop semi-structured data from forcing a choice between a brittle inferred schema and an opaque JSON string."
- Handoff: matches Chapter 8's assumption exactly — restated once more at topic 30, since 7.6 has no reel to carry it: "The execution engines of this milestone all assumed the data was already sitting in storage they could read. The next milestone opens on how it got there from the systems that produced it in the first place." (Direct handoff carried by topic 30; this topic's own immediate handoff is to §7.7 across the skipped §7.6.)
- Hook/visual: the same nested JSON payload stored as a string column, an inferred struct and VARIANT, read-path and write-path timings and scan bytes compared, with and without shredding — the 7.5 lab's VARIANT half.
- Sources: Spark 4.1 release notes ("VARIANT" GA, shredding); Spark SQL "VARIANT Data Type" docs; Spark source, `VariantVal.scala` / shredding writer (GitHub, tag closest to 4.1 tagged release available).
- Deep dive "Where this goes next" names §7.6 (Photon, Gluten+Velox, Comet, GPU acceleration) as a sourced, unbuilt pointer: Spark's own generated-code execution model (topic 6) is itself being replaced for CPU-bound plans by native vectorised engines, named and dated from each project's own documentation, with no reel.

### 7.7 Execution models beyond Spark

**30. Pipelined MPP vs staged batch execution**
- id `de.pipelined-mpp-staged-batch`, folder `pipelined-mpp-staged-batch`
- Scope: Trino-style pipelined, in-memory exchange (low latency, a failed task fails the query) vs Spark-style materialised shuffle (recoverable, higher latency); Trino fault-tolerant execution with spooled exchanges as the convergence point; how to pick per workload (Trino internals in §6.4); plus, briefly, Ray Data's operator-level streaming as a third model (the chapter's lab).
- Outcomes: explain, in terms of this chapter's own vocabulary (shuffle files, stage boundaries, task retry), exactly what a pipelined engine gives up and gains compared with Spark's materialised shuffle; name the workload shape (interactive BI vs large ETL vs GPU batch inference) each of the three models in this topic favours.
- Introduces: `spark.pipelined-vs-staged-execution`. Uses: `spark.shuffle-mechanics`, `spark.stage-boundary`, `spark.task-retry-fetch-failure`, `trino.query-execution` (if live; else `declared`).
- Bridge: "Twenty-nine topics taught this chapter's one model: cut the job at every shuffle, materialise each stage's output, and recover by resubmitting a stage. This closing topic steps outside that model entirely to name what it chose not to be — a pipelined, in-memory exchange like Trino's, where nothing is materialised and a failed task fails the whole query — and what a third model, Ray Data's operator-level streaming, looks like for a workload Spark's stage-at-a-time shape fits badly."
- Handoff: "The execution engines of this milestone all assumed the data was already sitting in storage they could read. The next milestone opens on how it got there from the systems that produced it in the first place." (Matches Chapter 8's planned assumption word for word.)
- Hook/visual: the same aggregation-plus-join query's cost model walked through three times — Spark's stage/shuffle/retry picture, a pipelined exchange's all-in-memory picture, Ray Data's streaming-operator picture — ending on the image-embedding throughput/memory comparison that is this topic's lab.
- Sources: Trino documentation, "Fault-tolerant execution" (spooled exchanges); Ray documentation, "Ray Data" architecture pages (operator-level streaming, backpressure); Spark documentation (this chapter's own, for the contrast).
