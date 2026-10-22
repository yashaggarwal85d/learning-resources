---
id: dsa.ring-buffers-bounded-queues
title: Ring buffers and bounded queues
---

<section data-section="outcomes">

## After this topic you can

- Implement power-of-two index masking and explain the real cost difference against modulo.
- Disambiguate full from empty with at least two different mechanisms and state each one's trade-off.
- Choose overwrite vs block policy for a given scenario and justify it.
- Explain boundedness as backpressure and say what changes when the ring buffer is shared across threads.

</section>

<section data-section="internals">

## Into the internals

### Why the mask only works for a power of two

For a non-negative index and a capacity that is a power of two, `index mod capacity` and `index AND (capacity minus one)` compute the exact same value, because every bit above the capacity's own bit width simply gets cleared either way. For any other capacity the two diverge, and the hardware has to actually perform a division. Agner Fog's own measurements put simple bitwise operations at about one clock cycle and integer division at dozens, "27 to 80 clock cycles for 32-bit integers, depending on the processor." This topic's own C microbenchmark, with the capacity passed in at run time so the compiler can't substitute the mask itself, measures modulo costing roughly one and a half times masking's wall-clock time on the machine it ran on — the direction the cited figures predict, not the exact cited numbers, since those are historical measurements across several processor generations.

### The ambiguity, and three real fixes

A masked ring buffer tracks only `head mod capacity` and `tail mod capacity`. Both an empty ring and a completely full one can have those two values equal, because both states have wrapped the same number of times relative to each other. Three real fixes exist, each with a different cost: sacrifice one slot of capacity so a full ring always leaves the tail one behind the head; keep an explicit count or full/empty flag alongside the indices, paying one extra write per push and pop; or, the design this topic builds, keep `in` and `out` as unmasked counters that only ever increase, masking them solely at the instant they index into the backing array. The Linux kernel's `kfifo` takes this third path: its own length macro is simply `in minus out`, its emptiness check is `in == out`, and its fullness check is "length greater than mask" — all without ever comparing masked values against each other.

</section>

<section data-section="production">

## In production

Overwrite and block are a separate axis entirely from the full/empty mechanism above — either policy can sit on top of any of the three fixes. Python's `collections.deque` with a `maxlen` documents the overwrite choice directly: "once a bounded length deque is full, when new items are added, a corresponding number of items are discarded from the opposite end." Rust's `std::sync::mpsc::sync_channel` documents the block choice just as directly: a full channel's "future sends will block waiting for the buffer to open up." A bounded structure with a block policy is what makes backpressure possible at all — a producer that can't outrun its buffer is forced to slow down to its consumer's pace, instead of growing without limit the way this chapter's topic one array would.

</section>

<section data-section="frontier">

## The frontier

Everything built and measured here is single-threaded. A ring buffer shared between a producer thread and a consumer thread has to solve the same full/empty and overwrite/block questions under concurrent access, without a lock serializing every push and pop — a substantially harder problem, named only here and built in Rust Systems Engineering's Chapter 7 ("Atomics and the Memory-Ordering Model," which covers lock-free building blocks including an SPSC ring buffer lab) and Chapter 10 ("Channels, Backpressure, Cancellation, and Graceful Shutdown").

</section>

<section data-section="questions">

## More questions

- Why does the "sacrifice one slot" fix need no unsigned-overflow reasoning at all, while the unmasked-counter fix depends on it working correctly?
- If a ring buffer's capacity is not a power of two, is the full/empty ambiguity still a problem, and does the unmasked-counter fix still work?

</section>

<section data-section="next">

## Where this goes next

Every structure so far has held fixed-size records at known offsets. The next one doesn't: a string's own length, in bytes, isn't the length a person reading it would count.

</section>
