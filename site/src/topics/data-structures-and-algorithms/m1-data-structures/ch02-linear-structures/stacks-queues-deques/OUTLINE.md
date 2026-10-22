# OUTLINE: Stacks, queues and deques (`dsa.stacks-queues-deques`)

Content plan, written 2026-10-22 against this topic's entry (#3) in [`CHAPTER.md`](../CHAPTER.md).

- **Syllabus line (DSA §2.2, refresher):** "LIFO/FIFO semantics; array-backed circular deque vs chunked block deque (C++ std::deque) and their iterator-stability trade-offs."
- **Previous topic (live):** "Linked and intrusive lists." Its handoff: "Both structures can hold a sequence; neither says anything yet about the order you're allowed to touch it in. Next: the two disciplines that do."
- **Concepts used, not re-taught:** `contiguous-storage`, `pointer-invalidation`, `singly-linked-list`, `doubly-linked-list`.
- **Kind:** refresher, about 6 minutes, 9 steps: open (1), stack (2), queue (3), predict (4), deque (5), two implementations (6), predict (7), recap (8), prove it (9).
- **Running example:** the chapter's log records — an undo history (stack) and a task queue (queue), both drawn from the same record shape.

## Learning outcomes

1. State LIFO and FIFO and give one real use of each.
2. Say what a deque adds over a stack or queue alone.
3. Name the two common deque implementations and one real trade-off between them (resize/mechanism vs iterator stability).

## Conventions (chapter grammar, `DESIGN.md` briefing theme)

Colour: `caramel` the structure/end being demonstrated; `cinnamon` the compared alternative (the other implementation); `taupe`/`latte` axes and quiet labels; `crema` records. At most two accents per step.

## Reel steps

### 1. Which end may you touch? (Opening)
Recaps the previous topic's handoff: a list or array holds a sequence but says nothing about which end you're allowed to touch. Today's structures are that rule, made concrete.

### 2. LIFO: last in, first out
A stack: push and pop at the same end only. Real use: an undo history, where the most recent action is always the first one undone.

### 3. FIFO: first in, first out
A queue: enqueue at one end, dequeue at the other. Real use: a task queue, where the oldest waiting task runs first.

### 4. Does a deque need two separate structures? (predict)
A stack handles one end; a queue handles two ends, one each for in and out. What does a structure that supports push and pop at *both* ends need?
- Options: "Two linked stacks glued together" / **"One structure, O(1) at both ends"** (correct) / "A queue with a reversed second copy" / "It can't be done with one structure".
- Answer: a deque is one structure supporting O(1) push/pop/peek at both ends directly — not a composition of two simpler ones.

### 5. The deque: both ends, O(1)
Both ends lit at once: push and pop, front and back, each O(1). A stack and a queue are each a deque used with one hand tied behind its back.

### 6. Two real designs, two different trade-offs
- **Array-backed circular buffer** (previewed by name; topic 5 builds the mechanism): wraps around a fixed-size array with modular indexing; resizing it moves everything, exactly like topic 1's vector. Rust's `VecDeque` is a real, shipped example — its own documentation describes it as "a growable ring buffer."
- **Chunked block deque** (`std::deque`): an array of fixed-size blocks; growing allocates a new block without moving existing elements. The C++ standard's own iterator-invalidation rule for it is distinctive: inserting or erasing at either end invalidates *iterators* into the deque but, by name, has **no effect on references** to the surviving elements — the opposite split from a vector, where reallocation invalidates everything at once.

### 7. Does pushing onto a deque's front move anything? (predict)
Call `push_front` on a `std::deque`. What happens to existing iterators and references into it?
- Options: "Both stay valid" / "Both become invalid" / **"Iterators become invalid; references to surviving elements don't"** (correct) / "Only references at the front are affected".
- Answer: the standard states this exactly — insertion at either end invalidates all iterators to the deque, but has no effect on the validity of references to elements already in it.

### 8. Back to the problem
A stack and a queue are each one end's worth of a deque's full power; a deque needs a real implementation choice, and the two real ones (ring buffer, chunked blocks) trade resize behaviour for iterator stability in opposite ways. Handoff: "A plain stack or queue only promises O(1) at the ends it supports. Next: a stack or queue whose own shape proves a second bound — all without ever resizing for it."

### 9. Prove it
`examples.py` simulates a deque two ways (a Python `list` used as a stack/queue vs `collections.deque`, a real ring-buffer-backed structure) and counts operations: push/pop at either end costs the same small constant number of steps regardless of how many elements are already in the structure, for both 10 and 10,000 elements — the O(1)-at-both-ends claim, executed, not just asserted.

## Claims list

1. A stack is push/pop at one end (LIFO); a queue is enqueue/dequeue at opposite ends (FIFO) — standard definitions, not independently sourced (same status as "an array index is O(1)").
2. `std::deque` insertion/erasure at either end is O(1); in the middle it's linear — N4868 `[deque]`.
3. `std::deque` insertion at either end invalidates iterators but not references to surviving elements; erasure's invalidation depends on which end is touched — N4868 `[deque]`.
4. Rust's `VecDeque` is implemented as a growable ring buffer, and its elements are not necessarily contiguous in memory — Rust `std::collections::VecDeque` docs.

## Concept ledger

- **Introduces:** `lifo`, `fifo`, `stack`, `queue`, `deque`, `chunked-deque`.
- **Uses:** `contiguous-storage`, `pointer-invalidation`, `singly-linked-list`, `doubly-linked-list`.
- **Declared:** `stacks` (Chapter 1 topic 5 already introduced it there; restated for this chapter's ledger per `CHAPTER.md`).

## Bridge and handoff

- **Bridge:** "Arrays and lists hold a sequence; they say nothing about which end you may touch. Stacks and queues are that rule made concrete."
- **Handoff:** "A plain stack or queue only promises O(1) at the ends it supports. Next: a stack or queue whose own shape proves a second bound — all without ever resizing for it."

## Progress

Research done (`SOURCES.md`, 7/7 quotes verified); this content plan written. Next: `FACT-CHECK.md`, `coverage.json`, then build every file.
