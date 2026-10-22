# FACT-CHECK: Stacks, queues and deques (`dsa.stacks-queues-deques`)

Adversarial pass, 2026-10-22, against `OUTLINE.md`'s claims list and `SOURCES.md`.

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Stack = LIFO at one end; queue = FIFO at opposite ends | direct structural/standard definition | confirmed — no primary source needed, same status as other definitional facts this course states without citation |
| 2 | `std::deque` insert/erase at either end is O(1); in the middle, linear | N4868 `[deque]` | confirmed, quoted verbatim ("Inserting a single element at either the beginning or end of a deque always takes constant time"; complexity remarks on `insert`) |
| 3 | `std::deque` insertion at either end invalidates iterators but not references to surviving elements | N4868 `[deque]` | confirmed, quoted verbatim |
| 4 | `std::deque` erasure's invalidation depends on which end is touched (erasing the last element invalidates only the past-the-end iterator and the erased element's own iterators/references; erasing neither end invalidates everything) | N4868 `[deque]` | confirmed, quoted verbatim |
| 5 | Rust's `VecDeque` is a growable ring buffer; its elements aren't necessarily contiguous | Rust `std::collections::VecDeque` docs | confirmed, quoted verbatim |

## Currency

Both sources fetched 2026-10-22: N4868 (the same C++20 working draft mirror used and verified in topic 1) and Rust's current stable `std` docs. No claim here depends on since-changed library behaviour; the C++ standard's deque invalidation rule has been stable across standard revisions and this topic doesn't claim otherwise.

## A claim this topic does NOT make

The array-backed circular buffer's own mechanism (modular indexing, full/empty disambiguation, overwrite policy) is previewed by name only — `CHAPTER.md` explicitly assigns building and measuring it to topic 5 ("Ring buffers and bounded queues"). This topic names Rust's `VecDeque` as a real, shipped example of the shape, without re-deriving its internals.

## Red team: predict questions

- Step 4 (does a deque need two separate structures): checked "two linked stacks glued together" is a real, plausible wrong answer — it describes one actual historical implementation strategy (a stack of blocks), which is exactly why it's tempting but wrong for what a deque's *interface* guarantees (O(1) at both ends, not a specific internal composition).
- Step 7 (push_front's effect on iterators/references): checked the correct answer states the exact, slightly counterintuitive split the standard specifies (iterators invalid, references valid) rather than the more intuitive "both invalid" or "both valid," which is precisely the trade-off this topic's syllabus line asks it to teach.

## Open items

None.
