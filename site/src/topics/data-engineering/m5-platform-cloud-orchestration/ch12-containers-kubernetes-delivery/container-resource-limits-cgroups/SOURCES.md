## Linux kernel — cgroup v2 admin guide

URL: https://raw.githubusercontent.com/torvalds/linux/master/Documentation/admin-guide/cgroup-v2.rst
Version: `master` branch, fetched 2026-10-30

> memory.max
> A read-write single value file which exists on non-root
> cgroups. The default is "max".

> Memory usage hard limit. This is the main mechanism to limit
> memory usage of a cgroup. If a cgroup's memory usage reaches
> this limit and can't be reduced, the OOM killer is invoked in
> the cgroup. Under certain circumstances, the usage may go
> over the limit temporarily.

> memory.oom.group
> A read-write single value file which exists on non-root
> cgroups. The default value is "0".

> Determines whether the cgroup should be treated as
> an indivisible workload by the OOM killer. If set,
> all tasks belonging to the cgroup or to its descendants
> (if the memory cgroup is not a leaf cgroup) are killed
> together or not at all. This can be used to avoid
> partial kills to guarantee workload integrity.

> memory.events
> A read-only flat-keyed file which exists on non-root cgroups.

> oom
> The number of time the cgroup's memory usage was
> reached the limit and allocation was about to fail.

> oom_kill
> The number of processes belonging to this cgroup
> killed by any kind of OOM killer.

> cpu.max
> A read-write two value file which exists on non-root cgroups.
> The default is "max 100000".

> The maximum bandwidth limit. It's in the following format::

> $MAX $PERIOD

> which indicates that the group may consume up to $MAX in each
> $PERIOD duration. "max" for $MAX indicates no limit. If only
> one number is written, $MAX is updated.

> cpu.stat
> A read-only flat-keyed file.
> This file exists whether the controller is enabled or not.

> It always reports the following three stats, which account for all the
> processes in the cgroup (including those in descendant cgroups):

> - usage_usec
> - user_usec
> - system_usec

> and the following five when the controller is enabled, which account for
> only the processes under the fair-class scheduler:

> - nr_periods
> - nr_throttled

Contents:
- `memory.max`: hard memory limit, invokes the cgroup's OOM killer when it can't be reduced
- `memory.oom.group`: whether the whole cgroup is killed together (default off)
- `memory.events`: `oom` (allocation about to fail) and `oom_kill` (processes actually killed) counters
- `cpu.max`: a two-value quota/period pair ("max 100000" by default: no limit)
- `cpu.stat`: `usage_usec`/`user_usec`/`system_usec` always, plus `nr_periods`/`nr_throttled`/`throttled_usec` when the CPU controller is enabled

## Linux kernel — CFS Bandwidth Control (sched-bwc)

URL: https://raw.githubusercontent.com/torvalds/linux/master/Documentation/scheduler/sched-bwc.rst
Version: `master` branch, fetched 2026-10-30

Contents:
- the quota/period bandwidth-control mechanism `cpu.max` configures
- throttling behaviour once a group's quota for the period is exhausted

## Kubernetes — Liveness, Readiness, and Startup Probes

URL: https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
Version: current kubernetes.io docs, fetched 2026-10-30

> Startup probes verify whether the application within a container is started.
> If a startup probe is configured, Kubernetes does not execute liveness or
> readiness probes until the startup probe succeeds, allowing the application
> time to finish its initialization.

> If the startup probe fails, the kubelet kills the container, and the container
> is subjected to its restart policy.

> Liveness probes determine when to restart a container.
> For example, liveness probes could catch a deadlock, where an application is
> running, but unable to make progress. Restarting a container in such a state
> can help to make the application more available despite bugs.

> Readiness probes determine when a container is ready to accept traffic.
> This is useful when waiting for an application to perform time-consuming initial
> tasks, such as establishing network connections, loading files, and warming
> caches.

> The container failed the diagnostic. For liveness and startup probes, the
> kubelet kills the container, and the container is subjected to its
> restart policy.
> For readiness probes, the kubelet marks the container as not ready, and the

Contents:
- what each of the three probes decides (restart, hold back other probes, remove from service)
- the startup-probe gate on liveness/readiness during slow initialization
- the failure action for each probe type

## Oracle — The java Command (Java SE 21)

URL: https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html
Version: Java SE 21 docs, fetched 2026-10-30

> -XX:MaxRAMPercentage=percent

> Sets the maximum amount of memory that the JVM may use for the Java
> heap before applying ergonomics heuristics as a percentage of the
> maximum amount determined as described in the -XX:MaxRAM
> option. The default value is 25 percent.

Contents:
- `-XX:MaxRAMPercentage` and its 25 percent default
- container-aware memory detection feeding `-XX:MaxRAM`'s "maximum amount determined"

## Apache Spark — Configuration (Spark 4.2.0)

URL: https://spark.apache.org/docs/latest/configuration.html
Version: Spark 4.2.0 docs, fetched 2026-10-30

> driverMemory * spark.driver.memoryOverheadFactor, with minimum of spark.driver.minMemoryOverhead

> This value defaults to 0.10 except for Kubernetes non-JVM jobs, which defaults to
> 0.40. This is done as non-JVM tasks need more non-JVM heap space and such tasks

> 384m

> The minimum amount of non-heap memory to be allocated per driver process in cluster mode, in MiB unless otherwise specified, if spark.driver.memoryOverhead is not defined.

Contents:
- `spark.driver.memoryOverhead` / `spark.executor.memoryOverhead` = memory × overhead factor, floored at the minimum
- overhead factor 0.10 (JVM jobs) vs 0.40 (Kubernetes non-JVM jobs, e.g. PySpark)
- `spark.driver.minMemoryOverhead` / `spark.executor.minMemoryOverhead` default of 384m
