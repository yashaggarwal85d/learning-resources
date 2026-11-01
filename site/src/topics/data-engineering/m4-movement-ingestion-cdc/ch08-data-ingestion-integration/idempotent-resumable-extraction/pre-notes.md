- **Checkpoint**: a durable record of how far an extraction has progressed, consulted on restart
  to decide what still needs doing. *Where you meet it:* the thing whose ordering against the
  output write this topic's own crash reproduction turns on.
- **Atomic commit**: writing the output and advancing the checkpoint as one indivisible step, so
  a crash can never land with one done and not the other.
- **Deterministic batch id**: an id computed from the input a batch covers, not from a counter or
  the wall clock, so the identical logical batch always produces the identical id.
- **Idempotent write**: a write that can be applied more than once to the same target without
  changing the result beyond the first application. *Where you meet it:* the mechanism
  `ON CONFLICT` and similar constructs give a database, measured here with a keyed overwrite.
- **At-least-once delivery**: a guarantee that a message or a batch is delivered one or more
  times, never zero, with redelivery explicitly allowed.
- **Exactly-once effect**: the state after every redelivery has been applied is the same as if it
  had been applied exactly once — a property of the write, not a promise about delivery.
- **Byte-for-byte diff**: comparing two runs' final state exactly, used here as the direct proof
  that a crashed-and-resumed run matches a clean run.
