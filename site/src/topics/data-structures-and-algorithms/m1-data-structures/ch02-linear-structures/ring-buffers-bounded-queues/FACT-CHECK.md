# Fact-check: Ring buffers and bounded queues

| # | Claim (OUTLINE.md step) | Status | Source / verification |
|---|---|---|---|
| 1 | A ring buffer is a fixed-size array with head/tail indices advancing by wrap-around, never resizing | Verified | Direct consequence of the construction; demonstrated in `examples.py` against both a power-of-two and a non-power-of-two capacity. |
| 2 | Modulo by a non-power-of-two capacity is a division; a power-of-two capacity turns it into a bitwise AND | Verified | Standard arithmetic fact (`x mod 2^k == x & (2^k - 1)` for non-negative x); backed by Agner Fog's *Optimizing software in C++*, quoted word-for-word in SOURCES.md. |
| 3 | Simple bitwise operations cost about one clock cycle; integer division costs dozens | Verified | Quoted directly from Agner Fog's manual ("Simple integer operations... take only one clock cycle"; "Integer division takes much longer time... 27-80 clock cycles for 32-bit integers"). `examples.py` also measures masking vs modulo directly and reports the wall-clock ratio, rather than asserting the cited cycle counts apply unchanged to a specific machine. |
| 4 | head == tail is ambiguous: it can mean either empty or completely full | Verified | Direct consequence of wrap-around arithmetic on masked indices; demonstrated in `examples.py` by filling a naively-masked ring buffer to capacity and showing head equals tail at both the empty start state and the full end state. |
| 5 | kfifo's fix: unmasked, monotonically increasing in/out counters, masked only on array access; length is in minus out, empty is in == out, full is length greater than mask | Verified | Quoted word-for-word from the Linux kernel's `kfifo.h` in SOURCES.md; reproduced and checked against a reference implementation in `examples.py`. |
| 6 | The "sacrifice one slot" and "explicit count/flag" alternatives are real, named trade-offs (less usable capacity vs an extra write per operation) | Verified | Named as alternatives on the strength of the general trade-off argument, not claimed to be quoted from a second implementation — stated explicitly as such in SOURCES.md's own gap note. This topic builds the unmasked-index design, not these two. |
| 7 | Overwrite policy: a full ring drops the oldest entry when a new one arrives | Verified | Quoted word-for-word from Python's `collections.deque(maxlen=...)` documentation; demonstrated directly in `examples.py`. |
| 8 | Block policy: a full bounded structure makes further pushes wait rather than lose data | Verified | Quoted word-for-word from Rust's `std::sync::mpsc::sync_channel` documentation ("future sends will block waiting for the buffer to open up"); demonstrated in `examples.py` with a single-threaded simulation (a push onto a full ring under the block policy is rejected/deferred rather than overwriting, matching the documented semantics without claiming a multi-threaded demonstration this topic doesn't build). |
| 9 | Overwrite and block are orthogonal to the masking mechanism — either policy can sit on top of either full/empty-disambiguation design | Verified | This is an architectural observation about independence of concerns, not an external fact requiring its own citation; demonstrated by `examples.py` implementing both policies on top of the same kfifo-style unmasked-index mechanism. |
| 10 | Boundedness forces backpressure: a producer can't outrun a bounded structure's capacity the way it could outrun an unbounded, growing one | Verified | Direct consequence of the block policy, and the premise Rust's `sync_channel` documentation states directly (quoted above); contrasted explicitly with topic 1's unbounded, growing array. |

## A claim this topic deliberately does NOT make

- No claim is made about exact cycle counts for division or masking on any specific, current CPU.
  Agner Fog's own cited figures are historical measurements across several microprocessor
  generations ("27-80 clock cycles... depending on the processor"), and this topic's own
  `examples.py` measures wall-clock ratios on whatever machine runs it rather than asserting the
  cited cycle counts transfer unchanged to that machine.
- No claim is made that this topic's own single-threaded ring buffer, overwrite policy, or block
  policy is safe or correct under concurrent access from multiple threads. The lock-free,
  concurrent version of this exact structure is named only, pointed to Rust Systems Engineering
  Ch.7 and Ch.10, and explicitly not built or demonstrated here.
- No claim is made that kfifo's unmasked-index design is the only correct fix for the full/empty
  ambiguity, or superior in every circumstance to sacrificing a slot or keeping an explicit count —
  the topic states kfifo's own trade-off (no wasted capacity, no extra state, but needs unsigned
  wraparound arithmetic done correctly) alongside the other two, named, not ranked.
