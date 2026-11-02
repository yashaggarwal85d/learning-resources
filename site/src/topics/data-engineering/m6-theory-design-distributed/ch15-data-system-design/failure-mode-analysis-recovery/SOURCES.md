## Addressing Cascading Failures (Google SRE Book, Chapter 22)

URL: https://sre.google/sre-book/addressing-cascading-failures/
Version: online edition, retrieved 2026-10-30

> A cascading failure is a failure that grows over time as a result of positive feedback.

> It can occur when a portion of an overall system fails, increasing the probability that other portions of the system fail.

> The most common cause of cascading failures is overload.

> Queued requests consume memory and increase latency.

> Always use randomized exponential backoff when scheduling retries.

Contents: how a single overloaded replica's failure increases load on the remaining
replicas (server overload as the most common cascading-failure cause); how a full
request queue converts into added latency rather than an outright failure, and why
small queues relative to thread-pool size fail fast instead of piling up; load shedding
(HTTP 503 once in-flight requests exceed a threshold) and graceful degradation
(serving from a smaller cache, a cheaper ranking pass) as two distinct ways to keep a
server alive under overload; a worked retry-amplification scenario where a backend
rejecting 100 QPS of overflow ends up receiving 200, then 300 QPS of retries of the
same requests, and the backend protections (randomized exponential backoff, a retry
budget, a cap on retries per request) that stop a client's own retries from being the
thing that keeps a backend from recovering.

## Exponential Backoff and Jitter (AWS Architecture Blog)

URL: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
Version: by Marc Brooker, 04 Mar 2015, retrieved 2026-10-30

> The problem here is that N clients compete in the first round, N-1 in the second round, and so on.

> Capped exponential backoff means that clients multiply their backoff by a constant after each attempt, up to some maximum value.

Contents: why a flood of clients retrying at the same moment (the "thundering herd"
after a failure clears) can cost more total work than the original overload, simulated
against an optimistic-concurrency-control database write; why backoff alone only
spreads retries into synchronized clusters rather than removing the contention; why
adding randomness (jitter) on top of exponential backoff, not instead of it, is what
actually spreads retries into an approximately constant rate and cuts total client work
by more than half in the worst-contention case tested.
