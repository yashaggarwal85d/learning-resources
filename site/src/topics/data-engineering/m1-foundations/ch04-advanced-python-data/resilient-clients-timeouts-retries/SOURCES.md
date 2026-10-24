## Timeouts, retries, and backoff with jitter

URL: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
Version: Marc Brooker, Amazon Builders' Library (fetched 2026-10-24)

> To avoid this situation, clients set timeouts. Timeouts are the maximum amount of time that a client waits for a request to complete.

> Retries allow clients to survive these random partial failures and short-lived transient failures by sending the same request again.

> The preferred solution that we use in Amazon is a backoff. Instead of retrying immediately and aggressively, the client waits some amount of time between tries. The most common pattern is an exponential backoff, where the wait time is increased exponentially after every attempt.

> Load. Even with a single layer of retries, traffic still significantly increases when errors start. Circuit breakers, where calls to a downstream service are stopped entirely when an error threshold is exceeded, are widely promoted to solve this problem. Unfortunately, circuit breakers introduce modal behavior into systems that can be difficult to test, and can introduce significant addition time to recovery. We have found that we can mitigate this risk by limiting retries locally using a token bucket.

> Deciding when to retry. In general, our view is that APIs with side effects aren't safe to retry unless they provide idempotency. This guarantees that the side effects happen only once no matter how often you retry.

> Jitter adds some amount of randomness to the backoff to spread the retries around in time.

Contents: why timeouts, retries and backoff exist together; a worked example of a connection-establishment timeout bug found in production; retrying at a single point in the stack rather than every layer (243x retry amplification across a five-deep stack); the token-bucket critique of circuit breakers; jitter as the fix for correlated retry clusters.

## Exponential Backoff And Jitter

URL: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
Version: Marc Brooker, AWS Architecture Blog (fetched 2026-10-24)

> With N clients contending, the total amount of work done by the system increases with N2.

> Capped exponential backoff means that clients multiply their backoff by a constant after each attempt, up to some maximum value.

> It's obvious that the exponential backoff is working, in that the calls are happening less and less frequently. The problem also stands out: there are still clusters of calls.

> The solution isn't to remove backoff. It's to add jitter.

> In the case with 100 contending clients, we've reduced our call count by more than half. We've also significantly improved the time to completion, when compared to un-jittered exponential backoff.

> Update (May 2023): After 8 years, this solution continues to serve as a pillar for how Amazon builds remote client libraries for resilient systems. Most AWS SDKs now support exponential backoff and jitter as part of their retry behavior when using standard or adaptive modes.

Contents: a simulated optimistic-concurrency-control workload showing capped exponential backoff alone still produces correlated clusters of retries; "Full Jitter", "Equal Jitter" and "Decorrelated Jitter" named as the three alternatives, with Full Jitter and Equal Jitter doing the least client work; the 2023 update confirming this is now standard AWS SDK retry behavior.

## Addressing Cascading Failures (Google SRE Book, Ch. 22)

URL: https://sre.google/sre-book/addressing-cascading-failures/
Version: Google SRE Book (fetched 2026-10-24)

> Always use randomized exponential backoff when scheduling retries.

> Consider having a server-wide retry budget. For example, only allow 60 retries per minute in a process, and if the retry budget is exceeded, don't retry; just fail the request. This strategy can contain the retry effect and be the difference between a capacity planning failure that leads to some dropped queries and a global cascading failure.

> With deadline propagation, a deadline is set high in the stack (e.g., in the frontend). The tree of RPCs emanating from an initial request will all have the same absolute deadline.

> A common theme in many cascading outages is that servers spend resources handling requests that will exceed their deadlines on the client. As a result, resources are spent while no progress is made: you don't get credit for late assignments with RPCs.

> Having deadlines several orders of magnitude longer than the mean request latency is usually bad.

Contents: the retry-budget mechanism named directly, as a per-process rate limit on retries rather than a per-call policy; deadline propagation (a single absolute deadline shared down a call tree, each hop sending the time remaining rather than a fresh fixed timeout); a worked thread-exhaustion example showing why an overlong deadline turns a small failure rate into a large one.

## Circuit Breaker pattern

URL: https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
Version: Azure Architecture Center (fetched 2026-10-24)

> Temporarily block access to a remote service or resource after failures reach a threshold, instead of repeatedly retrying an operation that's likely to fail.

> Closed: The request from the application is routed to the operation. The proxy maintains a count of the number of recent failures. If the call to the operation is unsuccessful, the proxy increments this count. If the number of recent failures exceeds a specified threshold within a given time period, the proxy is placed into the Open state and starts a time-out timer. When the timer expires, the proxy is placed into the Half-Open state.

> Open: The request from the application fails immediately and an exception is returned to the application.

> Half-Open: A limited number of requests from the application are allowed to pass through and invoke the operation. If these requests are successful, the circuit breaker assumes that the fault that caused the failure is fixed, and the circuit breaker switches to the Closed state. The failure counter is reset. If any request fails, the circuit breaker assumes that the fault is still present, so it reverts to the Open state.

> This pattern quickly rejects a request for an operation that's likely to fail, rather than waiting for the operation to time out or never return.

Contents: the three named states (Closed, Open, Half-Open) and the transitions between them; the failure-threshold and success-threshold counters that drive those transitions; the stated purpose (fail fast rather than waiting on a doomed call) distinguished from the plain Retry pattern.

## Idempotent requests (Stripe API Reference)

URL: https://docs.stripe.com/api/idempotent_requests
Version: Stripe API docs (fetched 2026-10-24)

> The API supports idempotency for safely retrying requests without accidentally performing the same operation twice. When creating or updating an object, use an idempotency key. Then, if a connection error occurs, you can safely repeat the request without risk of creating a second object or performing the update twice.

> For API v1, Stripe saves the status code and body of the first request made with a given idempotency key after endpoint execution begins. Retries with the same key return the saved response, including 500 errors.

> A client generates an idempotency key, which is a unique key that the server uses to recognize subsequent retries of the same request. How you create unique keys is up to you, but we suggest using V4 UUIDs, or another random string with enough entropy to avoid collisions. Idempotency keys are up to 255 characters long. Avoid using sensitive data (for example, email addresses or personal identifiers) as idempotency keys.

> The idempotency layer compares incoming parameters to those of the original request and errors if they're not the same to prevent accidental misuse.

> For API v1, we save results only after the execution of an endpoint begins. If incoming parameters fail validation, or the request conflicts with another request that's executing concurrently, we don't save the idempotent result because no API endpoint initiates the execution. You can retry these requests.

Contents: the idempotency-key mechanism as a real, shipped worked pattern; stored-response replay (including replaying a prior 500 error rather than re-running the write); the client-generates-the-key design (V4 UUID, up to 255 characters, never sensitive data); the parameter-mismatch error that catches a key reused for a different logical request.
