- **JobManager**: the coordinator that schedules a job's tasks and coordinates checkpoints.
  *Where you meet it:* the first predict/reveal.
- **TaskManager**: a worker process that runs a job's actual tasks and exchanges data with
  others. *Where you meet it:* the first predict/reveal.
- **Slot**: the unit of resource a TaskManager offers; a job's parallelism can't exceed the total
  slots available. *Where you meet it:* the first predict/reveal.
- **Operator chaining**: fusing consecutive compatible operators into one task, with no network
  hop between them. *Where you meet it:* the chaining reveal.
- **Credit-based flow control**: a receiving task grants the sender buffer credits instead of the
  sender pushing unboundedly. *Where you meet it:* the backpressure reveal.
- **Backpressure**: a slowdown that propagates upstream automatically as credits run out, with no
  explicit signal sent. *Where you meet it:* the backpressure reveal.
- **Application mode**: running a job's own code on the cluster itself, one dedicated cluster per
  application. *Where you meet it:* the second predict/reveal.
