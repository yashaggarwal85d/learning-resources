<section data-section="outcomes">

## Outcomes

Run the shop's order-lookup query from a cold Postgres start and show the first requests are
measurably slower than the rest; build and apply a steady-state detector that marks where the run
stops improving; run repeated trials and report a confidence interval, not a single number; report
a cold-cache and a hot-cache result for the same query as two separate, honestly labeled numbers
instead of one blended average.

</section>

<section data-section="internals">

## Internals

PostgreSQL's own documentation states the reason its buffer pool and the OS cache beneath it are
two distinct, stacked caches, both empty on a cold start: "because PostgreSQL also relies on the
operating system cache, it is unlikely that an allocation of more than 40% of RAM to
shared_buffers will work better than a smaller amount." RocksDB's own documentation names
compaction debt as a comparable warm-up cause in a storage engine this sandbox does not run:
"compactions are needed for space efficiency, read (query) efficiency, and timely data deletion...
In compaction, some files are periodically read in and merged to form larger files." Georges,
Buytaert and Eeckhout's statistically rigorous benchmarking methodology states the steady-state
detection problem directly: "The first issue is to determine when steady-state performance is
reached," solved by checking "once the coefficient of variation (CoV) of the k iterations... falls
below a preset threshold," then computing "the confidence interval for a given confidence level
across the computed means" from several repeated runs.

</section>

<section data-section="lab">

## Lab

A real measurement against this sandbox's own Postgres, not a simulated number. `examples.py`
restarts the Postgres cluster to empty its buffer pool and the OS page cache, then runs the shop's
order-lookup query repeatedly and measures each request's wall-clock latency. A sliding-window
detector (adapted from the paper's coefficient-of-variation convention, at this topic's own
latency scale) marks where the run reaches steady state; the run is repeated five times, each from
its own fresh restart, and the steady-state means across trials are reported with a ninety-five
percent confidence interval. A separate experiment restarts Postgres once more and runs one heavy,
whole-table aggregate query, showing its first execution (pulling pages off disk) measurably
slower than five warm repeats (reading the now-cached pages from shared_buffers) — the "empty
result caches" cause, kept distinct from the per-request cold-start effect.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reporting a benchmark number taken the instant a system started.** The hook's two engineers
both ran an honest, bug-free benchmark; the only difference was when they started measuring. A
number taken before steady state is reached is not a wrong number — it is the right number for a
question nobody asked (how slow is this system at the very first instant it starts).

**Averaging a cold-cache number into a hot-cache number.** The two numbers answer different real
questions (a service that restarts often, versus one that runs for days); blending them into one
average answers neither question honestly.

</section>

<section data-section="frontier">

## Frontier

A steady-state detector and a confidence interval are themselves a design choice, not a universal
constant: this topic's own detector adapts the paper's coefficient-of-variation convention to
wall-clock request latency rather than JVM benchmark iteration counts, and states plainly that the
adaptation, not the paper's own threshold value, is what gets reused.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A warmed-up, steady-state run still has to be summarized into one number someone reads, and the
easiest way to summarize it is also the most dishonest: a mean. The next topic is why that single
number hides exactly the tail that matters, and what to report instead.

</section>
