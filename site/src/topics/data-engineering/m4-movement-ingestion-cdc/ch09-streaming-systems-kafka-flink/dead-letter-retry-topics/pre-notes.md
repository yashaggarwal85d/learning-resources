- **Poison message**: a record a consumer can never successfully process. *Where you meet it:*
  the hook, and throughout.
- **Dead-letter queue (DLQ)**: a separate topic that holds a record which has exhausted every
  retry, with enough metadata to diagnose it. *Where you meet it:* the second predict/reveal.
- **Retry topic**: a separate topic a failed record is republished to, instead of retrying it in
  place. *Where you meet it:* the first predict/reveal.
- **Tiered delay**: increasingly long waits across a chain of retry topics (e.g. a few seconds,
  then minutes, then longer). *Where you meet it:* the second predict/reveal.
- **`errors.tolerance`**: a Kafka Connect connector setting controlling whether a bad record is
  dead-lettered or fails the whole task. *Where you meet it:* the tooling reveal.
