- **Event id**: a unique id assigned once, by the producer, at creation — never regenerated on
  retry. *Where you meet it:* the setup, and throughout.
- **Dedup window**: how long a consumer keeps remembering an event id before it is free to
  forget it. *Where you meet it:* the first predict/reveal.
- **TTL**: a fixed, wall-clock duration after which a remembered id may be forgotten. *Where you
  meet it:* the bound-choice reveal.
- **Bloom filter**: a compact structure that answers "might contain," with a small, bounded
  chance of a wrong "yes." *Where you meet it:* the second predict/reveal.
- **False positive**: the filter's one way of being wrong — flagging something that was never
  actually inserted. *Where you meet it:* the second reveal.
- **Deterministic id**: an id computed the same way every time from an event's own inputs. *Where
  you meet it:* the setup, and the derived-event reveal.
