Last verified against these sources: 30 October 2026. Expert sign-off: pending.

- Google, *Site Reliability Engineering*, Chapter 22, "Addressing Cascading Failures": [sre.google](https://sre.google/sre-book/addressing-cascading-failures/). The cascading-failure definition, server overload as the most common cause, queue-management and retry/backoff mechanics this topic draws on for the failure-table example and the hook's predict.
- Marc Brooker, "Exponential Backoff and Jitter", *AWS Architecture Blog*, 2015: [aws.amazon.com](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). The contention and jitter mechanics this topic draws on to explain why a crash loop with no out-of-band path doesn't resolve itself through retry behavior alone.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=failure-mode-analysis-recovery:%20).
