Last verified against these sources: 24 October 2026. Real measurements against a local
fault-injecting HTTP server written for this topic (`examples.py`).

- Marc Brooker, "Timeouts, retries, and backoff with jitter": [Amazon Builders' Library](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). Why timeouts, retries and backoff exist together; the token-bucket critique of circuit breakers.
- Marc Brooker, "Exponential Backoff And Jitter": [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). Capped backoff's remaining clustering problem, and jitter as the fix.
- Google, "Addressing Cascading Failures": [Google SRE Book, ch. 22](https://sre.google/sre-book/addressing-cascading-failures/). Retry budgets, deadline propagation, and the missed-RPC-deadline failure mode.
- Microsoft, "Circuit Breaker pattern": [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker). The Closed/Open/Half-Open states and their transitions.
- Stripe, "Idempotent requests": [Stripe API Reference](https://docs.stripe.com/api/idempotent_requests). The idempotency-key mechanism as a real, shipped worked pattern.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=resilient-clients-timeouts-retries:%20).
