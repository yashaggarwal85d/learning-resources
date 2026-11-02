## HdrHistogram — README (project repository)

URL: https://raw.githubusercontent.com/HdrHistogram/HdrHistogram/master/README.md
Version: master branch, fetched 2026-10-30 (GitHub's own rendered repository page is reachable
for this file via its raw source; fetched that way for a stable plain-text copy)

> It is worth mentioning that since Histogram objects are additive, it is
> common practice to use per-thread non-synchronized histograms or
> SingleWriterRecorders, and use a summary/reporting thread to perform
> histogram aggregation math across time and/or threads.

Used for: histograms are designed to be merged (added together) rather than having their
separately-computed percentiles averaged — the mechanism this topic's own merge-vs-average
comparison follows.

## wrk2 — README (Gil Tene's project)

URL: https://raw.githubusercontent.com/giltene/wrk2/master/README.md
Version: master branch, fetched 2026-10-30

> wrk's model, which is similar to the model found in many current load
> generators, computes the latency for a given request as the time from
> the sending of the first byte of the request to the time the complete
> response was received.

> While this model correctly measures the actual completion time of
> individual requests, it exhibits a strong Coordinated Omission effect,
> through which most of the high latency artifacts exhibited by the
> measured server will be ignored. Since each connection will only
> begin to send a request after receiving a response, high latency
> responses result in the load generator coordinating with the server
> to avoid measurement during high latency periods.

> The model I chose for avoiding Coordinated Omission in wrk2 combines
> the use of constant throughput load generation with latency
> measurement that takes the intended constant throughput into account.
> Rather than measure response latency from the time that the actual
> transmission of a request occurred, wrk2 measures response latency
> from the time the transmission *should* have occurred according to the
> constant throughput configured for the run.

Used for: the closed-loop generator's own named failure (Coordinated Omission) and the
constant-rate generator's own documented fix (measuring from the intended, scheduled send time
rather than the actual one) — the mechanism this topic's chapter-lab harness reproduces.

## Dean & Barroso — The Tail at Scale (Communications of the ACM, 2013)

URL: https://www.barroso.org/publications/TheTailAtScale.pdf
Version: Communications of the ACM, Vol. 56 No. 2, February 2013, pp. 74-80 (author-hosted PDF
copy)

> Variability in the latency distribution of individual components is magnified at the service level; for example,
> consider a system where each server
> typically responds in 10ms but with a
> 99th-percentile latency of one second.
> If a user request is handled on just one
> such server, one user request in 100 will
> be slow (one second).

> If
> a user request must collect responses
> from 100 such servers in parallel, then
> 63% of user requests will take more than
> one second (marked "x" in the figure).

Used for: the fan-out tail-amplification effect this topic derives from first principles and
reproduces by simulation — the paper's own stated single-server (one in 100) and hundred-shard
fan-out (sixty-three in 100) figures are the worked example the derivation is checked against.
