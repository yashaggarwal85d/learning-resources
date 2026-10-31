<section data-section="outcomes">

## Reading the GC-time column without overreacting to it

A nonzero GC-time figure is not, by itself, evidence of a bottleneck — this topic's own
measured job pays real, measurable GC time and still spends under five percent of its total
run time on it. The useful read is always a ratio: GC time against total executor run time,
not GC time in isolation. A genuinely GC-bound job shows a GC fraction that dominates, not one
that merely exists.

</section>

<section data-section="Long G1 pauses, heartbeat timeouts and lost executors">

## Long G1 pauses, heartbeat timeouts and lost executors

A GC pause long enough can silently cost an executor its own life: `spark.executor.heartbeatInterval`
governs how often an executor reports back to the driver, and if a pause stretches past
`spark.network.timeout`, the driver concludes that executor is gone and reschedules its tasks
elsewhere — a cluster-scale failure mode local mode cannot reproduce, since `local[N]` has no
separate executor process to lose at all. Sourced and named here rather than measured, since
reliably forcing a pause that long without actually crashing this sandbox isn't a safe
experiment to run live.

</section>

<section data-section="production failures">

## When this hurts instead of helping

Object-heavy UDF or RDD code left running in a hot path pays this topic's own measured GC cost
repeatedly, job after job — and the fix is rewriting toward DataFrame operations over
Tungsten's binary rows, not reaching for JVM GC flags around code that keeps generating
unnecessary objects in the first place. Tuning the garbage collector around a problem that the
code itself is causing treats the symptom while leaving the actual object churn untouched.

</section>

<section data-section="frontier">

## Where this goes next

GC pauses are one of the ways an executor can miss its heartbeat and get declared dead by the
driver. The next topic is exactly that moment: what Spark actually does when a task or an
executor fails outright, whether GC caused it or something else entirely.

</section>
