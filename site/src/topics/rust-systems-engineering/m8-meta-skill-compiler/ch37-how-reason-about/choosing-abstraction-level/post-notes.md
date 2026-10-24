---
title: "Choosing the abstraction level"
---

## Outcomes

- Record a real, specific hypothesis, before any code changes, about how one real change (replying only after a storage write completes) will affect a client's own observed latency.
- Measure that real baseline, where the handler replies immediately on being queued, for a real, identical workload.
- Make the real change and measure that the real, observed latency moves by roughly the amount the hypothesis predicted.
- State, from the Google SRE Book's own "Effective Troubleshooting" chapter, the real method this topic's own hypothesis and result follow.

## Internals

This topic's own crate signals a specific job's completion back to its own waiting handler with a real `tokio::sync::oneshot` channel, created fresh per request and passed into the job itself; the worker fulfils it the instant that job's own simulated storage write finishes. This differs from topic 92's own `enqueued`/`started` atomics, which measure how many jobs are waiting in aggregate, not when one specific job finishes; the two mechanisms answer genuinely different real questions, and this topic needs the per-job signal specifically because its own metric is latency for one request at a time.

## In production

A real, concurrent workload, many simultaneous clients rather than five sequential requests, is where the identical reply-on-persist change genuinely interacts with real queueing delay: a request that waits behind others already queued pays both the queue's own wait and the worker's own processing time, not just the latter, which this topic's own sequential measurement does not need to isolate since it keeps the two effects separate on purpose.

## The frontier

A real, measured throughput cost of holding a real HTTP connection open for a worker's own full processing time, rather than returning the connection to the client immediately on enqueue, is the natural next real metric once the identical hypothesis-and-measure method from this topic is applied to a production service under real concurrent load.

## Where this goes next

A real method for finding an implicit decision, and a real method for checking an optimization's own result against what it was supposed to do, are both real, repeatable habits; the next real question this milestone asks is what the compiler itself is actually doing with the code those habits produce.
