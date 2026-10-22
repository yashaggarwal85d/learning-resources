---
id: dsa.linked-intrusive-lists
title: Linked and intrusive lists
---

<section data-section="outcomes">

## After this topic you can

- Draw and distinguish singly, doubly and circular linked lists, and say what each buys over the others: a singly linked list is cheapest but only fast at its head; doubly linking makes remove-given-a-node O(1); a circular list with a sentinel removes every null check at the ends.
- Explain, with a real measurement, why pointer chasing usually loses to array traversal, and state the actual condition it depends on (whether traversal order matches allocation order), not a blanket rule.
- Name the operations a linked list does in O(1) that an array cannot (splicing a run of nodes between lists), and explain why a list node's address never moves while a vector's elements can be invalidated on any reallocation.
- Explain the intrusive-list idea and read a real `container_of`-style recovery of the owning struct, straight from the Linux kernel's own header.

</section>

<section data-section="internals">

## Into the internals

### Singly, doubly, circular, compared

A singly linked list stores one pointer per node (`next`) and a head pointer; appending at the head is O(1), but appending at the tail — or finding any node by position — means walking from the head, O(n). A doubly linked list adds a second pointer (`prev`); this doesn't make *finding* a node any faster, but it makes *removing* one you already hold a pointer to O(1), because both neighbours can be re-pointed directly, with no walk. A circular list closes the chain into a ring, usually with a dedicated sentinel node standing in for "the ends"; because no pointer in the structure is ever null, insert and remove use exactly the same code at the ends as in the middle. The Linux kernel's own generic list (`include/linux/list.h`) is exactly this: circular and doubly linked, built around one struct, `list_head`, that is nothing but these two pointers.

### Why pointer chasing usually loses to arrays, precisely

The claim is not that pointers are inherently slower than array indices — it's that the hardware's prefetcher can only follow memory it can predict. Ulrich Drepper's 2007 benchmark makes this concrete: a list of fixed-size records, linked by a single `next` pointer, is walked two ways on the same hardware — once with the nodes laid out in the order the list visits them (sequential), once with the nodes scattered so the list visits them in a different order than they sit in memory (random). Beyond the point where the whole structure no longer fits in cache, the sequential walk costs about 9 cycles per element; the random walk costs about 450 cycles per element and keeps climbing. The gap — roughly fiftyfold — comes entirely from whether the processor can predict the next address, not from the mere fact of using pointers: a sequential pointer walk is nearly as cheap as a sequential array scan, because the prefetcher follows it just as well.

### Splice and stable addresses

Moving a contiguous run of nodes from one list into another costs exactly four pointer rewrites — the two boundaries of the run being cut out, and the two boundaries of where it's spliced in — no matter how many nodes are in the run. (The Linux kernel's own `list_splice` family does this directly: `list_splice`, `list_splice_tail`, and their `_init` variants, each described in the kernel's own comments as joining two lists.) The same move in a contiguous array costs one element move for every element between the two ends involved, because the array has no way to represent "this run is now logically elsewhere" without physically relocating the data. This is the flip side of the previous topic's invalidation rule: a vector's elements can move (and every pointer into them can be invalidated) on *any* reallocation, while a list node's address is fixed for as long as the node exists — nothing that happens anywhere else in the list can move it.

### Intrusive lists and container_of

A "generic" linked list usually allocates a separate node object that holds (or points to) the payload — two allocations per element. An **intrusive** list instead embeds the link fields directly inside the payload struct itself: one allocation, and because the link type carries no payload of its own, the very same struct can be linked into a second, independent list by embedding a second `list_head`. The Linux kernel uses this pervasively for exactly this reason. The mechanism that makes it work is `container_of`: given a pointer to one member of a struct (here, an embedded `list_head`), and the struct's type and that member's name, `container_of` recovers the address of the struct that contains it, by subtracting the member's offset — a fixed, compile-time constant, since a struct's layout is fixed at compile time. The kernel builds its own entry-recovery macros, `list_entry` and `list_first_entry`, directly on top of `container_of`. The current macro also runs a compile-time check (`static_assert`) that the pointer's type actually matches the named member's type, turning a mismatched cast into a compile error rather than a silent, dangerous one — and the kernel's own comment on `container_of` now steers new code toward a newer sibling, `container_of_const`, which does the same recovery without discarding any `const` qualifier the original pointer had.

</section>

<section data-section="production">

## In production

The pattern the sources directly support, and no more specifically than this: an object that needs to belong to two different lists at once — say, a free list and an active list — embeds two separate `list_head` fields and is linked into each independently, with no duplication of the object itself and no second allocation for either link. This is exactly the trade-off intrusive linking is for, stated at the level of generality the Linux kernel's own header actually documents, without naming a specific subsystem that wasn't independently verified against the current kernel source at research time (see `FACT-CHECK.md`).

</section>

<section data-section="frontier">

## The frontier

Lock-free and RCU-protected list variants exist precisely because a plain linked list's pointer updates aren't safe under concurrent readers and writers without extra care; the kernel ships `list_for_each_entry_rcu` and related primitives for exactly this reason (named here, not built — goes deeper in a concurrency track). Skip lists and XOR-linked lists are two further structures that trade contiguity away in different ways again — a skip list for logarithmic search without rebalancing, an XOR-linked list to fold `next` and `prev` into one word at the cost of needing both neighbours' addresses to compute either.

</section>

<section data-section="questions">

## More questions

- Why doesn't doubly linking a list make *searching* it any faster, even though it makes *removing a found node* faster?
- A benchmark shows a list walk costing about the same as an array scan on one machine. What would you need to know about the list's nodes to explain why, using this topic's own claim?
- If `container_of` is passed the wrong struct type for a given member, what happens with the current kernel macro, and what would have happened with an older one that lacked the type check?

</section>

<section data-section="next">

## Where this goes next

Both a dynamic array and a linked list can hold a sequence; neither says anything about the order you're allowed to touch it in. The next topic puts a discipline — stacks, queues, deques — on top of either structure.

</section>
