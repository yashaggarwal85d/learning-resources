## Linux kernel, `include/linux/types.h`

URL: https://raw.githubusercontent.com/torvalds/linux/master/include/linux/types.h
Version: `master` branch, fetched 2026-10-22 (Linus Torvalds' canonical kernel tree)

> struct list_head {
> struct list_head *next, *prev;
> };

Contents: core kernel type definitions (`list_head`, `hlist_head`, `hlist_node`, `callback_head`, atomic and reference-count wrapper types, and more). This topic uses only the `list_head` struct quoted above: two pointers, no payload. (The source as fetched renders tab indentation as single spaces; the two member lines are quoted as fetched, each on its own line, with no reformatting beyond that.)

---

## Linux kernel, `include/linux/list.h`

URL: https://raw.githubusercontent.com/torvalds/linux/master/include/linux/list.h
Version: `master` branch, fetched 2026-10-22 (Linus Torvalds' canonical kernel tree)

> Circular doubly linked list implementation.

> list_add - add a new entry

> Insert a new entry after the specified head.
> * This is good for implementing stacks.

> list_add_tail - add a new entry

> Insert a new entry before the specified head.
> * This is useful for implementing queues.

> list_empty - tests whether a list is empty

> list_splice - join two lists, this is designed for stacks

> list_entry - get the struct for this entry

> list_first_entry - get the first element from a list

> Note, that list is expected to be not empty.

> #define list_entry(ptr, type, member) \
> container_of(ptr, type, member)

> #define list_first_entry(ptr, type, member) \
> list_entry((ptr)->next, type, member)

> list_for_each - iterate over a list

Contents: the kernel's one generic circular doubly linked list implementation: `list_head` manipulation (`list_add`, `list_add_tail`, `list_del`, `list_empty`, the four `list_splice*` variants), traversal macros (`list_for_each` and its variants), and the entry-recovery macros (`list_entry`, `list_first_entry`, `list_last_entry`) built on `container_of`. This topic uses the struct-free `list_add`/`list_add_tail`/`list_empty`/`list_splice`/`list_entry`/`list_first_entry`/`list_for_each` comments and the two `#define` lines quoted above; the hardened-list corruption-checking code (`__list_add_valid`, `CONFIG_LIST_HARDENED`) and the `hlist_*` (singly linked, hashtable-oriented) variants are not used.

---

## Linux kernel, `include/linux/container_of.h`

URL: https://raw.githubusercontent.com/torvalds/linux/master/include/linux/container_of.h
Version: `master` branch, fetched 2026-10-22 (Linus Torvalds' canonical kernel tree)

> container_of - cast a member of a structure out to the containing structure

> WARNING: any const qualifier of @ptr is lost.
> * Do not use container_of() in new code.

> container_of_const - cast a member of a structure out to the containing
> * structure and preserve the const-ness of the pointer

> Always prefer container_of_const() instead of container_of() in new code.

Contents: the `container_of` macro (recovers the address of a containing struct from the address of one of its members, by subtracting that member's compile-time offset) and its newer sibling `container_of_const`, which does the same cast while preserving `const`. This topic uses the two doc-comment excerpts quoted above: `container_of`'s own purpose line and its now-current advice to prefer `container_of_const`, which this topic reports honestly rather than presenting the older macro as the kernel's preferred idiom. The macro bodies themselves (`static_assert`, `offsetof`, the `_Generic` dispatch) are not quoted; the mechanism is explained in this topic's own words.

---

## U. Drepper, "What Every Programmer Should Know About Memory", 2007

URL: https://www.akkadia.org/drepper/cpumemory.pdf
Version: 2007 edition (the PDF at akkadia.org), as already used in Chapter 1's "Measuring the memory hierarchy" (numbers there noted as dated; the order-of-magnitude point this topic uses is unaffected)

> All entries are chained in a circular list using the n element, either in sequential or random order.

> There is no way for the processor to reliably prefetch data.

> Before we said that a main memory access takes 200+ cycles. Only with effective prefetching is it possible for the processor to keep the access times as low as 9 cycles.

> here we reach 450 cycles and more

Contents: §3.3's pointer-chasing benchmark, run two ways on the same array of fixed-size struct `l` records — once linked sequentially (in memory order) and once linked in a random order — and its measured per-element cost: sequential traversal beyond the L2 cache runs at about 9 cycles per element, because the hardware prefetcher can follow memory it is reading in the order it is laid out in; random traversal beyond L2 runs at 450 cycles and more, because the processor cannot predict which address comes next and the forced prefetch that sequential access gets for free does not happen. This topic uses this sequential-vs-random comparison (quoted above) to source the claim that pointer chasing usually loses to array traversal when node order and allocation order diverge; it does not use Chapter 1's own latency-anchor or cache-line-size figures again.
