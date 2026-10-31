## Cluster Mode Overview (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/cluster-overview.html
Version: 4.2.0 (current "latest" docs at fetch time; the mechanism described is unchanged since 4.0)

> Spark applications run as independent sets of processes on a cluster, coordinated by the SparkContext object in your main program (called the driver program).

> Specifically, to run on a cluster, the SparkContext can connect to several types of cluster managers (either Spark's own standalone cluster manager, YARN or Kubernetes), which allocate resources across applications. Once connected, Spark acquires executors on nodes in the cluster, which are processes that run computations and store data for your application. Next, it sends your application code (defined by JAR or Python files passed to SparkContext) to the executors. Finally, SparkContext sends tasks to the executors to run.

> Each application gets its own executor processes, which stay up for the duration of the whole application and run tasks in multiple threads. This has the benefit of isolating applications from each other, on both the scheduling side (each driver schedules its own tasks) and executor side (tasks from different applications run in different JVMs). However, it also means that data cannot be shared across different Spark applications (instances of SparkContext) without writing it to an external storage system.

> Because the driver schedules tasks on the cluster, it should be run close to the worker nodes, preferably on the same local area network.

> The system currently supports several cluster managers:

> Standalone – a simple cluster manager included with Spark that makes it easy to set up a cluster.

> Hadoop YARN – the resource manager in Hadoop 3.

> Kubernetes – an open-source system for automating deployment, scaling, and management of containerized applications.

> Driver program

> The process running the main() function of the application and creating the SparkContext

> Executor

> A process launched for an application on a worker node, that runs tasks and keeps data in memory or disk storage across them. Each application has its own executors.

> Task

> A unit of work that will be sent to one executor

> Job

> A parallel computation consisting of multiple tasks that gets spawned in response to a Spark action (e.g. save, collect); you'll see this term used in the driver's logs.

> Stage

> Each job gets divided into smaller sets of tasks called stages that depend on each other (similar to the map and reduce stages in MapReduce); you'll see this term used in the driver's logs.

Contents (item by item, for the coverage map):
1. The driver/SparkContext as the coordinating process in the main program.
2. The cluster manager's role: allocating resources (standalone, YARN, Kubernetes).
3. Executors as per-application processes that run tasks and hold data.
4. Isolation between applications' executors (different JVMs; no shared data without external storage).
5. Driver network-addressability and locality requirement.
6. Glossary: Application, Driver program, Cluster manager, Deploy mode, Worker node, Executor, Task, Job, Stage — each defined exactly as above.

## Spark Release 4.0.0 (Apache Spark project)

URL: https://spark.apache.org/releases/spark-release-4-0-0.html
Version: 4.0.0 (released 2025; this is the project's own release notes page)

> [SPARK-44442] Drop mesos support

> [SPARK-45314] Drop Scala 2.12 and make Scala 2.13 the default

Notes: the release notes list `SPARK-45284` ("Update SparkR minimum SystemRequirements to Java 17") among the 4.0.0 changes, confirming the Java 17 baseline referenced for Spark 4.x in this chapter's "Engine of record" note; this topic cites only the Mesos-removal and Scala-2.13-default items directly.

Contents (item by item):
1. Mesos cluster-manager support dropped (SPARK-44442).
2. Scala 2.12 dropped, Scala 2.13 made the default (SPARK-45314).
3. SparkR's minimum Java requirement raised to 17 (SPARK-45284), evidence for the Java 17 baseline.
