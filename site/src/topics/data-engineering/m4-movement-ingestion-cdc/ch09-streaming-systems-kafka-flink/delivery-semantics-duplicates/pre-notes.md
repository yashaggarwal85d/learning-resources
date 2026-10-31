- **At-most-once**: a message may be lost but is never redelivered. *Where you meet it:* the
  setup, and the effect-count reveal.
- **At-least-once**: a message is never lost but may be redelivered. *Where you meet it:* the
  setup, and both crash-window reveals.
- **Exactly-once**: the effect of processing happens exactly once, regardless of how delivery
  actually went. *Where you meet it:* the setup, and the incomplete-claim reveal.
- **Acknowledgement (ack)**: the broker's confirmation back to a producer that a write committed.
  *Where you meet it:* the first predict/reveal pair.
- **Offset commit**: a consumer recording how far it has read, separately from processing the
  record itself. *Where you meet it:* the second predict/reveal pair.
