# Sources: Ring buffers and bounded queues

Checked 2026-10-22. Every source was fetched raw with `scripts/sources.mjs`; quotes are proven by
`sources.mjs check`.

## Linux kernel, `include/linux/kfifo.h` (current `master`, Stefani Seibold, 2013)
URL: https://raw.githubusercontent.com/torvalds/linux/master/include/linux/kfifo.h

The struct: unmasked, monotonically increasing `in` and `out` counters, plus a mask:

> unsigned int in;
> unsigned int out;
> unsigned int mask;

The occupancy and emptiness checks, both unmasked:

> * kfifo_len - returns the number of used elements in the fifo
> * @fifo: address of the fifo to be used
> */
> #define kfifo_len(fifo) \
> ({ \
> typeof((fifo) + 1) __tmpl = (fifo); \
> __tmpl->kfifo.in - __tmpl->kfifo.out; \
> })

> * kfifo_is_empty - returns true if the fifo is empty
> * @fifo: address of the fifo to be used
> */
> #define kfifo_is_empty(fifo) \
> ({ \
> typeof((fifo) + 1) __tmpq = (fifo); \
> __tmpq->kfifo.in == __tmpq->kfifo.out; \
> })

The full check, built on the same unmasked length:

> * kfifo_is_full - returns true if the fifo is full
> * @fifo: address of the fifo to be used
> */
> #define kfifo_is_full(fifo) \
> ({ \
> typeof((fifo) + 1) __tmpq = (fifo); \
> kfifo_len(__tmpq) > __tmpq->kfifo.mask; \
> })

The power-of-two requirement, repeated at every macro that sizes a fifo:

> @size: the number of elements in the fifo, this must be a power of 2

Not covered by this source: the "sacrifice one slot" and "explicit count or flag" alternatives named
in CHAPTER.md's scope — those are named as real alternatives on the strength of the general trade-off
(a flag/count needs an extra write on every push and pop; sacrificing a slot wastes capacity), not
quoted from a second implementation, since kfifo's own unmasked-index design is the mechanism this
topic actually builds.

## Agner Fog, *Optimizing software in C++* (manual 1, agner.org)
URL: https://www.agner.org/optimize/optimizing_cpp.pdf

Simple integer and bitwise operations, one cycle:

> Simple integer operations such as addition, subtraction, comparison, bit operations and shift
> operations take only one clock cycle on most microprocessors.

Division, far more expensive, and the power-of-two escape:

> Integer division takes much longer time than addition, subtraction and multiplication (27 - 80
> clock cycles for 32-bit integers, depending on the processor).

> Integer division by a power of 2 can be done with a shift operation, which is much faster.

## Python documentation, `collections.deque`
URL: https://docs.python.org/3/library/collections.html#collections.deque

The overwrite policy, officially documented:

> If maxlen is not specified or is None, deques may grow to an
> arbitrary length. Otherwise, the deque is bounded to the specified maximum
> length. Once a bounded length deque is full, when new items are added, a
> corresponding number of items are discarded from the opposite end.

## Rust documentation, `std::sync::mpsc::sync_channel`
URL: https://doc.rust-lang.org/std/sync/mpsc/fn.sync_channel.html

The block policy, officially documented, and boundedness as backpressure:

> This channel has an internal buffer on which messages will be queued.
> bound specifies the buffer size. When the internal buffer becomes full,
> future sends will block waiting for the buffer to open up.
