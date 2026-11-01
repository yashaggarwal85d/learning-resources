- **Lap.** One full trip around a fixed-size ring, back to the slot a thread already visited.
- **Producer and consumer.** The thread writing into the ring, and the thread reading out of it;
  this topic has several of each at once.
- **Power-of-two mask.** `index & (capacity - 1)` turns an ever-growing position into a slot
  number, as long as capacity is a power of two.
- **Cache line.** The fixed-size chunk of memory (commonly sixty-four bytes) a processor's cache
  actually moves and tracks as one unit.
- **Release store and acquire load.** A release store publishes everything written before it; a
  matching acquire load is guaranteed to see all of that, not just the one value stored.
- **Compare and swap.** Read a value, and write a new one in its place only if nothing else has
  changed it since the read.

**Check yourself:** a producer claims the next free slot in the ring, but is suspended before it
writes anything into it. Can a consumer that then calls dequeue ever get past that slot to a
later one that already has data in it? (Answer in the reel: step 3 — no, the dequeue side visits
slots strictly in order, so it is stuck on the unpublished one.)
