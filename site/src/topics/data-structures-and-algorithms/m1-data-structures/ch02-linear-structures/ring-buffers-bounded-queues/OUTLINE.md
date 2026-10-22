# Outline: Ring buffers and bounded queues

Full topic, §2.2, ~12 min, 10 steps. Visual idea per CHAPTER.md: the ring drawn as an actual circle
of sixteen slots with caramel head and tail markers advancing clockwise; a producer/consumer trace
that wraps the tail past the twelve-o'clock seam twice, with a cherry flash the one time it tries to
overrun a full ring under the block policy, resolved differently under the overwrite policy.

1. **Opening** — bridge: the monotonic structures amortized by never growing past an invariant;
   a ring buffer takes that further and never grows at all, by design.
2. **The mechanism** — a fixed-size array with head and tail indices that advance by wrapping
   around (modulo capacity) instead of growing.
3. **The real cost of wrap-around** — modulo by a non-power-of-two capacity is a division; a
   power-of-two capacity turns it into a bitwise AND against capacity minus one. Cite Agner Fog:
   simple bitwise ops are one cycle, division is dozens.
4. **Predict** — capacity sixteen (power of two), current index eleven, five pushes land. What's
   the new index, and how is it computed?
5. **The ambiguity** — head equals tail when both have wrapped exactly as far as each other: that
   can mean empty, or it can mean completely full. Naive wrap-around can't tell the two apart.
6. **The fix this topic builds** — kfifo's own design: keep in/out as unmasked, monotonically
   increasing counters; mask only when indexing into the backing array. Length is `in minus out`
   (wraps correctly via unsigned overflow); empty is `in == out`; full is length greater than mask.
   Name the two real alternatives (sacrifice one slot; keep an explicit count or flag) and their
   trade-offs, without building them.
7. **What happens when it's full** — two real policies: overwrite the oldest entry (lossy — a
   metrics ring, or Python's `deque(maxlen=...)`), or block the write until a slot opens
   (lossless — a bounded channel). Orthogonal to the mechanism above.
8. **Predict** — a metrics ring at capacity, overwrite policy, one more push arrives. What happens
   to the oldest entry, and would the answer differ under the block policy?
9. **Boundedness as backpressure** — cite Rust's `sync_channel`: a full bounded channel's send
   blocks until the receiver catches up, forcing a slow producer-consumer pair to synchronize
   instead of the producer racing ahead unbounded (topic 1's array would just keep growing).
   Name, don't build: the concurrent, lock-free version is Rust Systems Engineering Ch.7, Ch.10.
10. **Prove it** — examples.py: a correctness check of a power-of-two ring buffer against a naive
    modulo version on the same sequence of pushes and pops (same results); a measured timing
    comparison, masking vs modulo, at a few capacities; a demonstration of both the overwrite and
    block policies on a full ring.

## Changes from the chapter plan

None.
